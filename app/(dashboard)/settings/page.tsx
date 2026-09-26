"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { clearAuth } from "@/lib/auth/token-store";

export default function SettingsPage() {
  const router = useRouter();
  const user = useCurrentUser();

  function handleSignOut() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Most of this is a placeholder for now — enough to have a real page
          instead of a 404, with more to come as the storefront takes shape.
        </p>
      </div>

      <section className="bg-card border border-border rounded-md p-5 space-y-4">
        <h2 className="text-sm font-semibold">Account</h2>
        {user ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Account details aren&apos;t available right now — this refreshes
            automatically the next time you log in.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Editing your name, email, or password isn&apos;t supported by the
          backend yet.
        </p>
      </section>

      <section className="bg-card border border-border rounded-md p-5 space-y-2">
        <h2 className="text-sm font-semibold">Appearance</h2>
        <p className="text-xs text-muted-foreground">
          Light theme only for now — there&apos;s no dark mode yet.
        </p>
      </section>

      <section className="bg-card border border-border rounded-md p-5 space-y-3">
        <h2 className="text-sm font-semibold">Session</h2>
        <p className="text-xs text-muted-foreground">
          Sign out of this browser. You can also do this from the user menu in
          the top bar.
        </p>
        <Button variant="destructive" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </section>
    </div>
  );
}
