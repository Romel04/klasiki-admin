import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().nullable().optional().default(null),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;