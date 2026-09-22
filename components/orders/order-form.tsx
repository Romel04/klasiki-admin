"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  orderFormSchema,
  type OrderFormInput,
  type OrderFormValues,
} from "@/lib/validators/order";
import { ORDER_SOURCES } from "@/types/order";
import { useDistricts, useThanas } from "@/lib/hooks/use-locations";
import { useProducts, useProduct } from "@/lib/hooks/use-products";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";

const SOURCE_LABELS: Record<(typeof ORDER_SOURCES)[number], string> = {
  website: "Website",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  phone: "Phone call",
  other: "Other",
};

interface OrderFormProps {
  onSubmit: (values: OrderFormValues) => void;
  isSubmitting?: boolean;
}

export function OrderForm({ onSubmit, isSubmitting }: OrderFormProps) {
  const router = useRouter();
  const { data: districts } = useDistricts();
  const { data: products } = useProducts();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormInput, unknown, OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      shippingAddress: "",
      billingAddress: "",
      districtId: "",
      thanaId: "",
      source: "website",
      specialNotes: "",
      items: [
        { productId: "", variantId: "", quantity: 1 as unknown as number },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const districtIdValue = watch("districtId");
  const sourceValue = watch("source");
  const itemsValue = watch("items");
  const { data: thanas } = useThanas(districtIdValue);
  const selectedDistrict = districts?.find((d) => d.id === districtIdValue);

  const total = itemsValue.reduce((sum, item) => {
    const product = products?.find((p) => p.id === item.productId);
    const qty = Number(item.quantity) || 0;
    return sum + (product?.price ?? 0) * qty;
  }, 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Customer Name</Label>
          <Input
            placeholder="e.g. Nusrat Jahan"
            {...register("customerName")}
          />
          {errors.customerName && (
            <p className="text-xs text-destructive">
              {errors.customerName.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Phone Number</Label>
          <Input
            placeholder="e.g. 01711-000000"
            {...register("customerPhone")}
          />
          {errors.customerPhone && (
            <p className="text-xs text-destructive">
              {errors.customerPhone.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label>Email (optional)</Label>
        <Input placeholder="jane@example.com" {...register("customerEmail")} />
        {errors.customerEmail && (
          <p className="text-xs text-destructive">
            {errors.customerEmail.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Shipping Address</Label>
        <Textarea
          placeholder="House, road, area..."
          {...register("shippingAddress")}
        />
        {errors.shippingAddress && (
          <p className="text-xs text-destructive">
            {errors.shippingAddress.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>District</Label>
          <Select
            value={districtIdValue}
            onValueChange={(val) => {
              setValue("districtId", val ?? "", { shouldValidate: true });
              // Thanas are scoped to a district — clear the stale choice.
              setValue("thanaId", "");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districts?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDistrict && (
            <p className="text-[11px] text-muted-foreground">
              Delivery charge: ৳
              {selectedDistrict.deliveryCharge.toLocaleString()}
            </p>
          )}
          {errors.districtId && (
            <p className="text-xs text-destructive">
              {errors.districtId.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Thana (optional)</Label>
          <Select
            value={watch("thanaId") || ""}
            onValueChange={(val) => setValue("thanaId", val ?? "")}
            disabled={!districtIdValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select thana" />
            </SelectTrigger>
            <SelectContent>
              {thanas?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Order Source</Label>
          <Select
            value={sourceValue}
            onValueChange={(val) =>
              setValue(
                "source",
                (val ?? "website") as OrderFormValues["source"],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Where did this order come from?" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Not a real backend field — saved as a prefix on the order&apos;s
            notes.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Billing Address (optional)</Label>
        <Textarea
          placeholder="Leave blank to use the shipping address"
          {...register("billingAddress")}
        />
      </div>

      <div className="space-y-1">
        <Label>Notes (optional)</Label>
        <Textarea
          placeholder="Anything else worth noting on this order..."
          {...register("specialNotes")}
        />
      </div>

      <div className="space-y-3">
        <Label>Items</Label>
        {fields.map((field, index) => (
          <OrderItemRow
            key={field.id}
            index={index}
            productId={itemsValue[index]?.productId}
            variantId={itemsValue[index]?.variantId}
            products={products}
            register={register}
            setValue={setValue}
            errors={errors}
            onRemove={() => remove(index)}
            removeDisabled={fields.length === 1}
          />
        ))}
        {errors.items?.message && (
          <p className="text-xs text-destructive">{errors.items.message}</p>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              productId: "",
              variantId: "",
              quantity: 1 as unknown as number,
            })
          }
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          Add Item
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-lg font-semibold">৳{total.toLocaleString()}</span>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Order"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/orders")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface OrderItemRowProps {
  index: number;
  productId: string | undefined;
  variantId: string | undefined;
  products: ReturnType<typeof useProducts>["data"];
  register: UseFormRegister<OrderFormInput>;
  setValue: UseFormSetValue<OrderFormInput>;
  errors: FieldErrors<OrderFormInput>;
  onRemove: () => void;
  removeDisabled: boolean;
}

function OrderItemRow({
  index,
  productId,
  variantId,
  products,
  register,
  setValue,
  errors,
  onRemove,
  removeDisabled,
}: OrderItemRowProps) {
  // /products (list) doesn't return nested variant data — only /products/{id}
  // (single) does. So the color dropdown for whichever product is selected in
  // THIS row needs its own detail fetch, separate from the product-name list.
  const { data: selectedProduct, isFetching: isLoadingVariants } = useProduct(
    productId ?? "",
  );

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1 space-y-1">
        <Select
          value={productId || ""}
          onValueChange={(val) => {
            setValue(`items.${index}.productId`, val ?? "", {
              shouldValidate: true,
            });
            // Reset the color choice whenever the product changes, since
            // colors are specific to each product.
            setValue(`items.${index}.variantId`, "", { shouldValidate: true });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.items?.[index]?.productId && (
          <p className="text-xs text-destructive">
            {errors.items[index]?.productId?.message}
          </p>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <Select
          value={variantId || ""}
          onValueChange={(val) =>
            setValue(`items.${index}.variantId`, val ?? "", {
              shouldValidate: true,
            })
          }
          disabled={!productId || isLoadingVariants}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={isLoadingVariants ? "Loading colors..." : "Color"}
            />
          </SelectTrigger>
          <SelectContent>
            {selectedProduct?.variants.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.color} ({v.stock} in stock)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.items?.[index]?.variantId && (
          <p className="text-xs text-destructive">
            {errors.items[index]?.variantId?.message}
          </p>
        )}
      </div>

      <div className="w-24 space-y-1">
        <Input
          type="number"
          min={1}
          placeholder="Qty"
          {...register(`items.${index}.quantity`)}
        />
        {errors.items?.[index]?.quantity && (
          <p className="text-xs text-destructive">
            {errors.items[index]?.quantity?.message}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onRemove}
        disabled={removeDisabled}
      >
        <HugeiconsIcon icon={Delete02Icon} className="size-4" />
      </Button>
    </div>
  );
}
