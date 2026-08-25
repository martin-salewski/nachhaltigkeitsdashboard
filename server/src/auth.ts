import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { db } from "./drizzle/db.js";
import { user, session, account, verification } from "./drizzle/schema.js";
import { sendInviteLinkEmail, sendResetLinkEmail } from "./services/email.js";

// Secure-Cookies werden an der öffentlichen URL festgemacht, nicht an NODE_ENV:
// NODE_ENV wird im Container nicht gesetzt, und ein vergessenes Flag würde die
// Session über HTTPS unnötig ohne Secure-Attribut ausliefern.
const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
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

  plugins: [
    admin({
      defaultRole: "mitarbeiterin",
      adminRoles: ["admin"],
    }),
  ],
});
