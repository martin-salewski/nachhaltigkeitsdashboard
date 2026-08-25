import { useSession } from "@/lib/auth-client";
import type { Role } from "@/lib/auth-client";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Angemeldeter User aus der Better-Auth-Session.
 *
 * Früher wurde hierfür ein JWT aus dem sessionStorage dekodiert. Die Session
 * liegt jetzt in einem httpOnly-Cookie und ist für JavaScript nicht lesbar —
 * der Status kommt deshalb vom Server über /api/auth/get-session.
 */
export function useAuth() {
  const { data, isPending } = useSession();
  const user = data?.user
    ? {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: ((data.user as { role?: string | null }).role ?? "mitarbeiterin") as Role,
      }
    : null;

  return { user, isPending, isAdmin: user?.role === "admin" };
}
