import { z } from "zod";
import { ORDER_SOURCES } from "@/types/order";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  // Optional on the real DTO (a product without a specific variant is valid),
  // but every product in this catalog currently has colors, so the UI still
  // nudges toward picking one — just not enforced at the schema level.
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const orderFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Phone number is required"),
  customerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  billingAddress: z.string().optional(),
  districtId: z.string().min(1, "Select a district"),
  thanaId: z.string().optional(),
  source: z.enum(ORDER_SOURCES),
  specialNotes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Add at least one item"),
});

export type OrderFormInput = z.input<typeof orderFormSchema>;
export type OrderFormValues = z.output<typeof orderFormSchema>;

export const cancelOrderSchema = z.object({
  cancellationReason: z.string().min(1, "A cancellation reason is required"),
});

export type CancelOrderValues = z.output<typeof cancelOrderSchema>;