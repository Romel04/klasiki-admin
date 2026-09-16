const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface AuthResponseData {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  userData: AuthUser;
}

interface ApiEnvelope<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export async function login(email: string, password: string): Promise<AuthResponseData> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  const json: ApiEnvelope<AuthResponseData> = await res.json();
  return json.data;
}

export async function refreshTokens(refreshToken: string): Promise<AuthResponseData> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { refreshtoken: refreshToken },
  });
  if (!res.ok) throw new Error("Session expired");
  const json: ApiEnvelope<AuthResponseData> = await res.json();
  return json.data;
}

export async function logout(refreshToken: string): Promise<void> {
  // Best-effort — clear local state regardless of whether this succeeds.
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { refreshtoken: refreshToken },
  }).catch(() => {});
}