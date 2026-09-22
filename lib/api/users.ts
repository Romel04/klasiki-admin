import type { DashboardUser, CreateUserInput, UpdateUserInput } from "@/types/user";
import { MOCK_USERS, setMockUsers } from "./mock-data";
import { apiFetch, apiJson } from "@/lib/api/http";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// ---------------------------------------------------------------------------
// Endpoints confirmed from Swagger: GET/POST /dashboard/users, GET/PATCH/
// DELETE /dashboard/users/{id}. CreateUserDto and UpdateUserDto schemas are
// confirmed too. NOT confirmed: the actual shape of a GET response — Swagger
// only showed the POST request example, not a real response body. Guessing
// the usual pattern (snake_case, string ids, is_active) based on every other
// endpoint so far; verify against a real GET /dashboard/users response and
// adjust fromApiUser below if it's different.
// ---------------------------------------------------------------------------

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: DashboardUser["role"];
  is_active: boolean;
  created_at: string;
}

function fromApiUser(u: ApiUser): DashboardUser {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at,
  };
}

// Matches CreateUserDto exactly (confirmed against Swagger).
function toCreatePayload(data: CreateUserInput) {
  return {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
  };
}

// Matches UpdateUserDto exactly — only role/is_active are ever sent.
function toUpdatePayload(data: UpdateUserInput) {
  const payload: Record<string, unknown> = {};
  if (data.role !== undefined) payload.role = data.role;
  if (data.isActive !== undefined) payload.is_active = data.isActive;
  return payload;
}

// --- Public API --------------------------------------------------------

export async function getUsers(): Promise<DashboardUser[]> {
  if (USE_MOCKS) return MOCK_USERS;

  const data = await apiJson<ApiUser[]>("/dashboard/users", {}, "Failed to fetch users");
  return data.map(fromApiUser);
}

export async function getUser(id: string): Promise<DashboardUser> {
  if (USE_MOCKS) {
    const found = MOCK_USERS.find((u) => u.id === id);
    if (!found) throw new Error("User not found");
    return found;
  }

  const data = await apiJson<ApiUser>(`/dashboard/users/${id}`, {}, "Failed to fetch user");
  return fromApiUser(data);
}

export async function createUser(data: CreateUserInput): Promise<DashboardUser> {
  if (USE_MOCKS) {
    const newUser: DashboardUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setMockUsers([...MOCK_USERS, newUser]);
    return newUser;
  }

  const created = await apiJson<ApiUser>(
    "/dashboard/users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toCreatePayload(data)),
    },
    "Failed to create user",
  );
  return fromApiUser(created);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<DashboardUser> {
  if (USE_MOCKS) {
    const index = MOCK_USERS.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    const updated = { ...MOCK_USERS[index], ...data };
    const next = [...MOCK_USERS];
    next[index] = updated;
    setMockUsers(next);
    return updated;
  }

  const updated = await apiJson<ApiUser>(
    `/dashboard/users/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toUpdatePayload(data)),
    },
    "Failed to update user",
  );
  return fromApiUser(updated);
}

export async function deleteUser(id: string): Promise<void> {
  if (USE_MOCKS) {
    setMockUsers(MOCK_USERS.filter((u) => u.id !== id));
    return;
  }

  const res = await apiFetch(`/dashboard/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user");
}