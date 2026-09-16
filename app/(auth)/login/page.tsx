"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/api/auth";
import { setAccessToken, setRefreshToken } from "@/lib/auth/token-store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setError(null);
    try {
      const auth = await login(data.email, data.password);
      setAccessToken(auth.accessToken);
      setRefreshToken(auth.refreshToken, auth.refreshTokenExpiresAt);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-card border border-border rounded-md p-6 space-y-4"
      >
        <div className="text-lg font-semibold text-center mb-2">
          klasiki admin
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
