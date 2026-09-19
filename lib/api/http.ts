import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearAuth } from "@/lib/auth/token-store";
import { refreshTokens } from "@/lib/api/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const data = await refreshTokens(rt);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken, data.refreshTokenExpiresAt);
    return data.accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    // Multiple calls can 401 at once on reload — only refresh once, let the rest wait on it.
    refreshPromise ??= doRefresh().finally(() => { refreshPromise = null; });
    const newToken = await refreshPromise;

    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(`${API_URL}${path}`, { ...init, headers });
    } else if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return res;
}

// Every endpoint (confirmed live against GET /products) wraps its payload in
// this envelope instead of returning the array/object directly — so every
// call site needs to unwrap `.data`, not just auth.ts.
export interface ApiEnvelope<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
  errorMessage = "Request failed",
): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) throw new Error(errorMessage);
  const json: ApiEnvelope<T> = await res.json();
  return json.data;
}