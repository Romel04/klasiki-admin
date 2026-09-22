"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useOrder, useUpdateOrderStatus } from "@/lib/hooks/use-orders";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
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
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: order, isPending, error } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();

  const [cancelOpen, setCancelOpen] = useState(
    () => searchParams.get("cancel") === "1",
  );
  const [cancellationReason, setCancellationReason] = useState("");

  if (isPending)
    return <p className="text-sm text-muted-foreground">Loading order...</p>;
  if (error || !order)
    return <p className="text-sm text-destructive">Failed to load order.</p>;

  function handleStatusChange(status: OrderStatus) {
    if (status === "cancelled") {
      setCancelOpen(true);
      return;
    }
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => toast.success("Order status updated."),
        onError: () => toast.error("Failed to update order status."),
      },
    );
  }

  function handleConfirmCancel() {
    if (!cancellationReason.trim()) return;
    updateStatus.mutate(
      { id, data: { status: "cancelled", cancellationReason } },
      {
        onSuccess: () => {
          toast.success("Order cancelled.");
          setCancelOpen(false);
          router.replace(`/orders/${id}`);
        },
        onError: () => toast.error("Failed to cancel order."),
      },
    );
  }

  const isLocked = order.status === "cancelled" || order.status === "delivered";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-md border border-border p-4">
        <div>
          <div className="text-xs text-muted-foreground">Customer</div>
          <div className="font-medium">{order.customerName}</div>
          <div className="text-sm text-muted-foreground">
            {order.customerPhone}
          </div>
          {order.customerEmail && (
            <div className="text-sm text-muted-foreground">
              {order.customerEmail}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Source</div>
          <div className="font-medium capitalize">{order.source}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-muted-foreground">Shipping Address</div>
          <div className="font-medium">{order.shippingAddress}</div>
          <div className="text-sm text-muted-foreground">
            {[order.thanaName, order.districtName].filter(Boolean).join(", ")}
          </div>
        </div>
        {order.billingAddress && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">Billing Address</div>
            <div className="font-medium">{order.billingAddress}</div>
          </div>
        )}
        {order.specialNotes && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">Notes</div>
            <div className="text-sm">{order.specialNotes}</div>
          </div>
        )}
        {order.status === "cancelled" && order.cancellationReason && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">
              Cancellation Reason
            </div>
            <div className="text-sm text-destructive">
              {order.cancellationReason}
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
            {order.items.map((item) => (
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
          Total: ৳{order.total.toLocaleString()}
        </div>
      </div>

      {!isLocked && (
        <div className="space-y-1 max-w-xs">
          <Label>Update Status</Label>
          <Select
            value={order.status}
            onValueChange={(val) => handleStatusChange(val as OrderStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
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
        onClick={() => router.push("/orders")}
      >
        Back to Orders
      </Button>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              A cancellation reason is required and will be visible on the
              order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1 px-4">
            <Label>Reason</Label>
            <Textarea
              placeholder="e.g. Customer requested cancellation, out of stock..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatus.isPending}>
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={updateStatus.isPending || !cancellationReason.trim()}
              onClick={handleConfirmCancel}
            >
              {updateStatus.isPending ? "Cancelling..." : "Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
