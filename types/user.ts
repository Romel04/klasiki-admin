// Confirmed from Swagger CreateUserDto/UpdateUserDto.
export const USER_ROLES = ["admin", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// Confirmed: CreateUserDto has name, email, password, role.
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Confirmed: UpdateUserDto ONLY has role and is_active — no name, email, or
// password field. Editing a user can only change their role/active status
// through this endpoint, not their profile details or credentials.
export interface UpdateUserInput {
  role?: UserRole;
  isActive?: boolean;
}