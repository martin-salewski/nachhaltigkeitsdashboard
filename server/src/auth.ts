import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { APIError } from "better-auth/api";
import { ALLOWED_EMAIL_DOMAIN, baseURL } from "./config.js";
import { db } from "./drizzle/db.js";
import { user, session, account, verification } from "./drizzle/schema.js";
import { sendInviteLinkEmail, sendResetLinkEmail } from "./services/email.js";

// Secure-Cookies werden an der öffentlichen URL festgemacht, nicht an NODE_ENV:
// ein vergessenes Flag würde die Session über HTTPS ohne Secure-Attribut ausliefern.
const useSecureCookies = baseURL.startsWith("https://");

const trustedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    // db wird ohne Schema erzeugt, der Adapter braucht die Tabellen darum explizit
    schema: { user, session, account, verification },
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  basePath: "/api/auth",
  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    // Selbstregistrierung ist aus: Accounts legt ausschließlich ein Admin an.
    disableSignUp: true,
    minPasswordLength: 12,
    sendResetPassword: async ({ user, url }) => {
      // Einladung und Passwort-Reset teilen sich denselben Better-Auth-Flow.
      // Unterschieden wird über die callbackURL, die der Aufrufer mitgibt:
      // /accept-invite kommt aus POST /api/admin/users, alles andere ist ein Reset.
      if (url.includes("accept-invite")) {
        await sendInviteLinkEmail(user.email, url);
      } else {
        await sendResetLinkEmail(user.email, url);
      }
    },
  },

  session: {
    expiresIn: 60 * 60 * 8, // 8h — wie das bisherige JWT
    updateAge: 60 * 60, // Session-Verlängerung höchstens stündlich schreiben
  },

  advanced: {
    useSecureCookies,
    // Ohne diese Angabe findet Better Auth keine Client-IP und zählt alle
    // Anmeldeversuche in einen gemeinsamen Topf — ein einzelner Nutzer könnte
    // damit alle anderen aussperren. nginx setzt X-Real-IP auf $remote_addr.
    ipAddress: {
      ipAddressHeaders: ["x-real-ip", "x-forwarded-for"],
    },
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 15 * 60, max: 10 },
      "/forget-password": { window: 15 * 60, max: 5 },
      "/reset-password": { window: 15 * 60, max: 10 },
    },
  },

  databaseHooks: {
    user: {
      create: {
        // Letzte Instanz vor dem Schreiben: greift für jeden Weg, über den ein
        // Account entstehen kann — auch für auth.api.createUser und alles, was
        // später dazukommt. Die Prüfung in der Admin-Route liefert nur die
        // freundlichere Fehlermeldung.
        before: async (newUser) => {
          if (!newUser.email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
            throw new APIError("BAD_REQUEST", {
              message: `Nur Adressen auf ${ALLOWED_EMAIL_DOMAIN} sind zugelassen.`,
            });
          }
          return { data: newUser };
        },
      },
    },
  },

  plugins: [
    admin({
      defaultRole: "mitarbeiterin",
      adminRoles: ["admin"],
    }),
  ],
});
