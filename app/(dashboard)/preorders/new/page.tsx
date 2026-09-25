"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PreorderForm } from "@/components/preorders/preorder-form";
import { useCreatePreorder } from "@/lib/hooks/use-preorders";
import type { PreorderFormValues } from "@/lib/validators/preorder";

export default function NewPreorderPage() {
  const router = useRouter();
  const createPreorder = useCreatePreorder();

  function handleSubmit(values: PreorderFormValues) {
    createPreorder.mutate(
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
          toast.success("Pre-order created.");
          router.push("/preorders");
        },
        onError: () => toast.error("Failed to create pre-order."),
      },
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add Pre-order</h1>
      <PreorderForm
        onSubmit={handleSubmit}
        isSubmitting={createPreorder.isPending}
      />
    </div>
  );
}
