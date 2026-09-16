"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useCategories, useDeleteCategory } from "@/lib/hooks/use-categories";
import { useProducts } from "@/lib/hooks/use-products";
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
  Folder01Icon,
} from "@hugeicons/core-free-icons";

export default function CategoriesPage() {
  const { data: categories, isPending, error } = useCategories();
  const { data: products } = useProducts();
  const deleteCategory = useDeleteCategory();

  if (isPending)
    return <p className="text-sm text-muted-foreground">Loading categories...</p>;
  if (error)
    return <p className="text-sm text-destructive">Failed to load categories.</p>;

  // Separate parents and group children
  const topLevelCategories = categories?.filter((c) => !c.parentId) || [];
  const subcategoryMap = new Map<string, typeof categories>();

  categories?.forEach((c) => {
    if (c.parentId) {
      const list = subcategoryMap.get(c.parentId) || [];
      list.push(c);
      subcategoryMap.set(c.parentId, list);
    }
  });

  // Calculate product counts per category
  function getProductCount(catId: string): number {
    if (!products) return 0;
    // Count products directly in this category or in its subcategories if it's a parent
    const subIds = subcategoryMap.get(catId)?.map((sub) => sub.id) || [];
    const allIds = [catId, ...subIds];
    return products.filter((p) => allIds.includes(p.categoryId)).length;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Categories</h1>
          <p className="text-xs text-muted-foreground">
            Manage product collections, parent categories, and nested subcategories.
          </p>
        </div>
        <Link href="/categories/new">
          <Button size="sm">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Add Category
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="max-w-[280px]">Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topLevelCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-sm text-muted-foreground"
                >
                  No categories found. Click &quot;Add Category&quot; to create your first one.
                </TableCell>
              </TableRow>
            ) : (
              topLevelCategories.map((parent) => {
                const children = subcategoryMap.get(parent.id) || [];
                const productCount = getProductCount(parent.id);

                return (
                  <TableRowGroup
                    key={parent.id}
                    parent={parent}
                    subcategories={children}
                    productCount={productCount}
                    onDelete={(id, name) => {
                      if (
                        confirm(
                          `Delete category "${name}"? Subcategories will be unlinked.`,
                        )
                      ) {
                        deleteCategory.mutate(id, {
                          onSuccess: () => {
                            toast.error(`Category "${name}" deleted successfully`, {
                              icon: (
                                <HugeiconsIcon
                                  icon={Delete02Icon}
                                  size={16}
                                  strokeWidth={2}
                                  className="size-4 text-destructive shrink-0"
                                />
                              ),
                            });
                          },
                          onError: (err) => {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Failed to delete category",
                            );
                          },
                        });
                      }
                    }}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface TableRowGroupProps {
  parent: import("@/types/category").Category;
  subcategories: import("@/types/category").Category[];
  productCount: number;
  onDelete: (id: string, name: string) => void;
}

function TableRowGroup({
  parent,
  subcategories,
  productCount,
  onDelete,
}: TableRowGroupProps) {
  return (
    <>
      {/* Parent Row */}
      <TableRow className="bg-muted/20 font-medium">
        <TableCell className="font-semibold text-foreground">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Folder01Icon}
              size={16}
              className="text-primary shrink-0"
            />
            <span>{parent.name}</span>
          </div>
        </TableCell>
        <TableCell className="text-xs font-mono text-muted-foreground">
          /{parent.slug}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="bg-background text-[11px]">
            {subcategories.length} {subcategories.length === 1 ? "subcategory" : "subcategories"}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {productCount} {productCount === 1 ? "product" : "products"}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground truncate max-w-[280px]">
          {parent.description || "—"}
        </TableCell>
        <TableCell className="text-right space-x-1">
          <Link href={`/categories/new?parentId=${parent.id}`}>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-primary hover:text-primary"
              title="Add subcategory"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
              <span className="hidden sm:inline">Add Sub</span>
            </Button>
          </Link>
          <Link href={`/categories/${parent.id}/edit`}>
            <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit">
              <HugeiconsIcon icon={PencilEdit01Icon} size={15} />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title="Delete"
            onClick={() => onDelete(parent.id, parent.name)}
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              size={15}
              className="text-destructive"
            />
          </Button>
        </TableCell>
      </TableRow>

      {/* Subcategory Rows */}
      {subcategories.map((child) => (
        <TableRow key={child.id} className="hover:bg-muted/30">
          <TableCell className="pl-8">
            <div className="flex items-center gap-2 text-sm text-foreground/90">
              <span className="text-muted-foreground/60 select-none">↳</span>
              <span>{child.name}</span>
            </div>
          </TableCell>
          <TableCell className="text-xs font-mono text-muted-foreground">
            /{child.slug}
          </TableCell>
          <TableCell>
            <span className="text-[11px] text-muted-foreground">
              Under {parent.name}
            </span>
          </TableCell>
          <TableCell className="text-xs text-muted-foreground">—</TableCell>
          <TableCell className="text-xs text-muted-foreground truncate max-w-[280px]">
            {child.description || "—"}
          </TableCell>
          <TableCell className="text-right space-x-1">
            <Link href={`/categories/${child.id}/edit`}>
              <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit">
                <HugeiconsIcon icon={PencilEdit01Icon} size={15} />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Delete"
              onClick={() => onDelete(child.id, child.name)}
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                size={15}
                className="text-destructive"
              />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
