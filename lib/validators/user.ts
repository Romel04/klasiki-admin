import { z } from "zod";
import { USER_ROLES } from "@/types/user";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  // Confirmed minLength: 8 on CreateUserDto.
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(USER_ROLES),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;