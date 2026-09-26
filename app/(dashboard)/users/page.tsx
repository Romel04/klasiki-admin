"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useUsers, useUpdateUser, useDeleteUser } from "@/lib/hooks/use-users";
import { USER_ROLES, type UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";

export default function UsersPage() {
  const { data: users, isPending, error } = useUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (isPending)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-16 rounded-md bg-muted/70 animate-pulse" />
          <div className="h-9 w-24 rounded-md bg-muted/70 animate-pulse" />
        </div>
        <TableSkeleton
          columns={["w-32", "w-44", "w-24", "w-12", "w-12"]}
          rows={5}
        />
      </div>
    );
  if (error)
    return <p className="text-sm text-destructive">Failed to load users.</p>;

  function handleRoleChange(id: string, role: UserRole) {
    updateUser.mutate(
      { id, data: { role } },
      { onError: () => toast.error("Failed to update role.") },
    );
  }

  function handleActiveToggle(id: string, isActive: boolean) {
    updateUser.mutate(
      { id, data: { isActive } },
      { onError: () => toast.error("Failed to update status.") },
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("User deleted.");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete user."),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link href="/users/new">
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
            Add User
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(val) =>
                      handleRoleChange(user.id, val as UserRole)
                    }
                  >
                    <SelectTrigger className="h-8 w-[110px] text-xs capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((r) => (
                        <SelectItem
                          key={r}
                          value={r}
                          className="text-xs capitalize"
                        >
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={(checked) =>
                      handleActiveToggle(user.id, checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDeleteTarget({ id: user.id, name: user.name })
                    }
                  >
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      className="size-4 text-destructive"
                    />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes their dashboard access. This can&apos;t
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
