export interface TokenPayload {
  userId: number;
  username: string;
  role: "admin" | "mitarbeiterin";
}

export function getTokenPayload(): TokenPayload | null {
  const token = sessionStorage.getItem("auth_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      sessionStorage.removeItem("auth_token");
      return null;
    }
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getTokenPayload()?.role === "admin";
}
