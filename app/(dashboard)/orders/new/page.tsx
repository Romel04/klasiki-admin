"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrderForm } from "@/components/orders/order-form";
import { useCreateOrder } from "@/lib/hooks/use-orders";
import type { OrderFormValues } from "@/lib/validators/order";

export default function NewOrderPage() {
  const router = useRouter();
  const createOrder = useCreateOrder();

  function handleSubmit(values: OrderFormValues) {
    createOrder.mutate(
      {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail || undefined,
        shippingAddress: values.shippingAddress,
        billingAddress: values.billingAddress || undefined,
        districtId: values.districtId,
        thanaId: values.thanaId || undefined,
        source: values.source,
        specialNotes: values.specialNotes || undefined,
        items: values.items,
      },
      {
        onSuccess: () => {
          toast.success("Order created.");
          router.push("/orders");
        },
        onError: () => toast.error("Failed to create order."),
      },
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add Order</h1>
      <OrderForm onSubmit={handleSubmit} isSubmitting={createOrder.isPending} />
    </div>
  );
}
