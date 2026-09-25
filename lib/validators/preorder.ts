import { z } from "zod";
import { PREORDER_SOURCES } from "@/types/preorder";

export const preorderItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const preorderFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Phone number is required"),
  customerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  billingAddress: z.string().optional(),
  districtId: z.string().min(1, "Select a district"),
  thanaId: z.string().optional(),
  source: z.enum(PREORDER_SOURCES),
  specialNotes: z.string().optional(),
  items: z.array(preorderItemSchema).min(1, "Add at least one item"),
});

export type PreorderFormInput = z.input<typeof preorderFormSchema>;
export type PreorderFormValues = z.output<typeof preorderFormSchema>;

export const cancelPreorderSchema = z.object({
  cancellationReason: z.string().min(1, "A cancellation reason is required"),
});

export type CancelPreorderValues = z.output<typeof cancelPreorderSchema>;