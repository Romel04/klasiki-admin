"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  usePreorder,
  useUpdatePreorderStatus,
} from "@/lib/hooks/use-preorders";
import { PreorderStatusBadge } from "@/components/preorders/preorder-status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { PREORDER_STATUSES, type PreorderStatus } from "@/types/preorder";

export default function PreorderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: preorder, isPending, error } = usePreorder(id);
  const updateStatus = useUpdatePreorderStatus();

  const [cancelOpen, setCancelOpen] = useState(
    () => searchParams.get("cancel") === "1",
  );
  const [cancellationReason, setCancellationReason] = useState("");

  if (isPending)
    return (
      <p className="text-sm text-muted-foreground">Loading pre-order...</p>
    );
  if (error || !preorder)
    return (
      <p className="text-sm text-destructive">Failed to load pre-order.</p>
    );

  function handleStatusChange(status: PreorderStatus) {
    if (status === "cancelled") {
      setCancelOpen(true);
      return;
    }
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => toast.success("Pre-order status updated."),
        onError: () => toast.error("Failed to update pre-order status."),
      },
    );
  }

  function handleConfirmCancel() {
    if (!cancellationReason.trim()) return;
    updateStatus.mutate(
      { id, data: { status: "cancelled", cancellationReason } },
      {
        onSuccess: () => {
          toast.success("Pre-order cancelled.");
          setCancelOpen(false);
          router.replace(`/preorders/${id}`);
        },
        onError: () => toast.error("Failed to cancel pre-order."),
      },
    );
  }

  // Same as Orders: only "cancelled" locks the status control — a delivered
  // pre-order can still be moved (e.g. a color swap after the fact).
  const isLocked = preorder.status === "cancelled";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pre-order #{preorder.id}</h1>
        <PreorderStatusBadge status={preorder.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-md border border-border p-4">
        <div>
          <div className="text-xs text-muted-foreground">Customer</div>
          <div className="font-medium">{preorder.customerName}</div>
          <div className="text-sm text-muted-foreground">
            {preorder.customerPhone}
          </div>
          {preorder.customerEmail && (
            <div className="text-sm text-muted-foreground">
              {preorder.customerEmail}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Source</div>
          <div className="font-medium capitalize">{preorder.source}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-muted-foreground">Shipping Address</div>
          <div className="font-medium">{preorder.shippingAddress}</div>
          <div className="text-sm text-muted-foreground">
            {[preorder.thanaName, preorder.districtName]
              .filter(Boolean)
              .join(", ")}
          </div>
        </div>
        {preorder.billingAddress && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">Billing Address</div>
            <div className="font-medium">{preorder.billingAddress}</div>
          </div>
        )}
        {preorder.specialNotes && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">Notes</div>
            <div className="text-sm">{preorder.specialNotes}</div>
          </div>
        )}
        {preorder.status === "cancelled" && preorder.cancellationReason && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">
              Cancellation Reason
            </div>
            <div className="text-sm text-destructive">
              {preorder.cancellationReason}
            </div>
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Items</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preorder.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-right">
                  ৳{item.totalPrice.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end gap-2 pt-3 text-lg font-semibold">
          Total: ৳{preorder.total.toLocaleString()}
        </div>
      </div>

      {!isLocked && (
        <div className="space-y-1 max-w-xs">
          <Label>Update Status</Label>
          <Select
            value={preorder.status}
            onValueChange={(val) => handleStatusChange(val as PreorderStatus)}
            items={PREORDER_STATUSES.map((s) => ({ value: s, label: s }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PREORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/preorders")}
      >
        Back to Pre-orders
      </Button>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this pre-order?</AlertDialogTitle>
            <AlertDialogDescription>
              A cancellation reason is required and will be visible on the
              pre-order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1 px-4">
            <Label>Reason</Label>
            <Textarea
              placeholder="e.g. Customer changed their mind, item discontinued..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatus.isPending}>
              Keep Pre-order
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={updateStatus.isPending || !cancellationReason.trim()}
              onClick={handleConfirmCancel}
            >
              {updateStatus.isPending ? "Cancelling..." : "Cancel Pre-order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
