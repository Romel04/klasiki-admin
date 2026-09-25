"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrders, useUpdateOrderStatus } from "@/lib/hooks/use-orders";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
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
import { ORDER_STATUSES, type OrderStatus } from "@/types/order";

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders, isPending, error } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  if (isPending)
    return <p className="text-sm text-muted-foreground">Loading orders...</p>;
  if (error)
    return <p className="text-sm text-destructive">Failed to load orders.</p>;

  function handleStatusChange(orderId: string, status: OrderStatus) {
    // Cancelling requires a reason — send them to the detail page for that
    // instead of trying to collect it inline in a table row.
    if (status === "cancelled") {
      router.push(`/orders/${orderId}?cancel=1`);
      return;
    }
    updateStatus.mutate(
      { id: orderId, data: { status } },
      {
        onError: () => toast.error("Failed to update order status."),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link href="/orders/new">
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
            Add Order
          </Button>
        </Link>
      </div>

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
          {orders?.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {order.customerPhone}
                </div>
              </TableCell>
              <TableCell>{order.districtName}</TableCell>
              <TableCell className="capitalize">{order.source}</TableCell>
              <TableCell>৳{order.total.toLocaleString()}</TableCell>
              <TableCell>
                {order.status === "cancelled" ? (
                  <OrderStatusBadge status={order.status} />
                ) : (
                  <Select
                    value={order.status}
                    onValueChange={(val) =>
                      handleStatusChange(order.id, val as OrderStatus)
                    }
                    items={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
                  >
                    <SelectTrigger className="h-7 w-[130px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
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
                  href={`/orders/${order.id}`}
                  className="text-xs underline"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
