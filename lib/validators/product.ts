import { z } from "zod";

// Empty string ("" from a cleared input) means "no override, use the base
// product price" — coerce it to undefined instead of failing/coercing to 0.
const optionalPrice = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().positive("Must be greater than 0").optional(),
);

export const productVariantSchema = z
  .object({
    // Real backend id (numeric string) for an existing variant, or a client-side
    // "new-…" placeholder for a variant added in this session that doesn't exist
    // on the server yet. Used by the API layer to decide POST vs PATCH vs DELETE.
    id: z.string().optional(),
    color: z.string().min(1, "Color name is required"),
    stock: z.coerce.number().int().min(0, "Stock can't be negative"),
    // Leave blank to inherit the product's base price/discount price — only
    // set these when this specific color is priced differently.
    price: optionalPrice,
    discountPrice: optionalPrice,
  })
  .refine((v) => v.discountPrice === undefined || v.price === undefined || v.discountPrice < v.price, {
    message: "Discounted price must be less than this color's price",
    path: ["discountPrice"],
  });

export const productFormSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discountPrice: optionalPrice,
    categoryId: z.string().min(1, "Please select a category"),
    isFeatured: z.boolean().default(false),
    variants: z.array(productVariantSchema).min(1, "Add at least one color variant"),
  })
  .refine(
    (data) => data.discountPrice === undefined || data.discountPrice < data.price,
    {
      message: "Discounted price must be less than base price",
      path: ["discountPrice"],
    },
  );

export type ProductFormInput = z.input<typeof productFormSchema>;   // before coercion
export type ProductFormValues = z.output<typeof productFormSchema>;