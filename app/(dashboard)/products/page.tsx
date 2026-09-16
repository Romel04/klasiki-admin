"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useProducts, useDeleteProduct } from "@/lib/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Delete02Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";

export default function ProductsPage() {
  const { data: products, isPending, error } = useProducts();
  const deleteProduct = useDeleteProduct();

  if (isPending)
    return <p className="text-sm text-muted-foreground">Loading products...</p>;
  if (error)
    return <p className="text-sm text-destructive">Failed to load products.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Products</h1>
        <Link href="/products/new">
          <Button size="sm">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + v.stock,
                0,
              );
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>৳{product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    {totalStock === 0 ? (
                      <Badge variant="destructive">Out of stock</Badge>
                    ) : totalStock < 5 ? (
                      <Badge
                        variant="outline"
                        className="text-destructive border-destructive"
                      >
                        {totalStock} left
                      </Badge>
                    ) : (
                      totalStock
                    )}
                  </TableCell>
                  <TableCell>
                    {product.isFeatured ? <Badge>Featured</Badge> : "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/products/${product.id}/edit`}>
                      <Button size="icon" variant="ghost">
                        <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete "${product.name}"?`)) {
                          deleteProduct.mutate(product.id, {
                            onSuccess: () => {
                              toast.error(
                                `Product "${product.name}" deleted successfully`,
                                {
                                  icon: (
                                    <HugeiconsIcon
                                      icon={Delete02Icon}
                                      size={16}
                                      strokeWidth={2}
                                      className="size-4 text-destructive shrink-0"
                                    />
                                  ),
                                },
                              );
                            },
                            onError: (err) => {
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to delete product",
                              );
                            },
                          });
                        }
                      }}
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={16}
                        className="text-destructive"
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
