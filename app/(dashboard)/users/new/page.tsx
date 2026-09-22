"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserForm } from "@/components/users/user-form";
import { useCreateUser } from "@/lib/hooks/use-users";
import type { CreateUserFormValues } from "@/lib/validators/user";

export default function NewUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();

  function handleSubmit(values: CreateUserFormValues) {
    createUser.mutate(values, {
      onSuccess: () => {
        toast.success("User created.");
        router.push("/users");
      },
      onError: () => toast.error("Failed to create user."),
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add User</h1>
      <UserForm onSubmit={handleSubmit} isSubmitting={createUser.isPending} />
    </div>
  );
}
