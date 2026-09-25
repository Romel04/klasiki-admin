"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  usePreorders,
  useUpdatePreorderStatus,
} from "@/lib/hooks/use-preorders";
import { PreorderStatusBadge } from "@/components/preorders/preorder-status-badge";
import { Button } from "@/components/ui/button";
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
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { PREORDER_STATUSES, type PreorderStatus } from "@/types/preorder";

export default function PreordersPage() {
  const router = useRouter();
  const { data: preorders, isPending, error } = usePreorders();
  const updateStatus = useUpdatePreorderStatus();

  if (isPending)
    return (
      <p className="text-sm text-muted-foreground">Loading pre-orders...</p>
    );
  if (error)
    return (
      <p className="text-sm text-destructive">Failed to load pre-orders.</p>
    );

  function handleStatusChange(preorderId: string, status: PreorderStatus) {
    if (status === "cancelled") {
      router.push(`/preorders/${preorderId}?cancel=1`);
      return;
    }
    updateStatus.mutate(
      { id: preorderId, data: { status } },
      {
        onError: () => toast.error("Failed to update pre-order status."),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pre-orders</h1>
          <p className="text-sm text-muted-foreground">
            Mostly come from the storefront once that&apos;s live — you can also
            add one manually here (e.g. a customer who asked over the phone or
            Facebook).
          </p>
        </div>
        <Link href="/preorders/new">
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
            Add Pre-order
          </Button>
        </Link>
      </div>

      {preorders?.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No pre-orders yet.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preorders?.map((preorder) => (
              <TableRow key={preorder.id}>
                <TableCell>
                  <div className="font-medium">{preorder.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {preorder.customerPhone}
                  </div>
                </TableCell>
                <TableCell>{preorder.districtName}</TableCell>
                <TableCell className="capitalize">{preorder.source}</TableCell>
                <TableCell>৳{preorder.total.toLocaleString()}</TableCell>
                <TableCell>
                  {preorder.status === "cancelled" ? (
                    <PreorderStatusBadge status={preorder.status} />
                  ) : (
                    <Select
                      value={preorder.status}
                      onValueChange={(val) =>
                        handleStatusChange(preorder.id, val as PreorderStatus)
                      }
                      items={PREORDER_STATUSES.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                    >
                      <SelectTrigger className="h-7 w-[130px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PREORDER_STATUSES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-xs capitalize"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/preorders/${preorder.id}`}
                    className="text-xs underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
