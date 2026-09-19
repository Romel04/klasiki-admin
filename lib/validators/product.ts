import { z } from "zod";

export const productVariantSchema = z.object({
  // Real backend id (numeric string) for an existing variant, or a client-side
  // "new-…" placeholder for a variant added in this session that doesn't exist
  // on the server yet. Used by the API layer to decide POST vs PATCH vs DELETE.
  id: z.string().optional(),
  color: z.string().min(1, "Color name is required"),
  stock: z.coerce.number().int().min(0, "Stock can't be negative"),
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  categoryId: z.string().min(1, "Please select a category"),
  isFeatured: z.boolean().default(false),
  variants: z.array(productVariantSchema).min(1, "Add at least one color variant"),
});

export type ProductFormInput = z.input<typeof productFormSchema>;   // before coercion
export type ProductFormValues = z.output<typeof productFormSchema>; 