import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Frontend und API laufen immer über dieselbe Origin — in der Entwicklung über
 * den Vite-Proxy (/api -> localhost:3000), in Produktion über nginx. Deshalb
 * reicht der relative basePath; ein baseURL würde CORS unnötig ins Spiel bringen.
 */
export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession } = authClient;

/** Rolle des angemeldeten Users; null wenn nicht angemeldet. */
export type Role = "admin" | "mitarbeiterin";
