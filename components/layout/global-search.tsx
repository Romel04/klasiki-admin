"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Cancel01Icon,
  PackageIcon,
  ClipboardIcon,
  Folder01Icon,
  ShoppingCartAdd01Icon,
  UserGroupIcon,
  ArrowRight01Icon,
  PlusSignIcon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { useProducts } from "@/lib/hooks/use-products";
import { useOrders } from "@/lib/hooks/use-orders";
import { useCategories } from "@/lib/hooks/use-categories";
import { usePreorders } from "@/lib/hooks/use-preorders";
import { useUsers } from "@/lib/hooks/use-users";
import { Badge } from "@/components/ui/badge";

interface SearchResultItem {
  id: string;
  category: "navigation" | "products" | "orders" | "categories" | "preorders" | "users";
  groupTitle: string;
  title: string;
  subtitle: string;
  matchedBadge?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  href: string;
  icon: typeof PackageIcon;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="text-primary font-semibold underline decoration-primary/40 underline-offset-2"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Data sources
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  const { data: categories = [] } = useCategories();
  const { data: preorders = [] } = usePreorders();
  const { data: users = [] } = useUsers();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global keyboard shortcut: Ctrl+K / Cmd+K or "/"
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (
        e.key === "/" &&
        !open &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Compute matched items
  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      // Default view when input is empty: Quick navigation + Recently added products
      const quickNav: SearchResultItem[] = [
        {
          id: "nav-add-product",
          category: "navigation",
          groupTitle: "Quick Actions",
          title: "Add New Product",
          subtitle: "Create a new product with color variants",
          href: "/products/new",
          icon: PlusSignIcon,
        },
        {
          id: "nav-create-order",
          category: "navigation",
          groupTitle: "Quick Actions",
          title: "Create Order",
          subtitle: "Add a new customer order manually",
          href: "/orders/new",
          icon: PlusSignIcon,
        },
        {
          id: "nav-products",
          category: "navigation",
          groupTitle: "Quick Actions",
          title: "View All Products",
          subtitle: `${products.length} products listed in inventory`,
          href: "/products",
          icon: PackageIcon,
        },
        {
          id: "nav-orders",
          category: "navigation",
          groupTitle: "Quick Actions",
          title: "View All Orders",
          subtitle: `${orders.length} total orders recorded`,
          href: "/orders",
          icon: ClipboardIcon,
        },
        {
          id: "nav-categories",
          category: "navigation",
          groupTitle: "Quick Actions",
          title: "Categories",
          subtitle: `${categories.length} product categories & subcategories`,
          href: "/categories",
          icon: Folder01Icon,
        },
      ];

      const recentProducts: SearchResultItem[] = products.slice(0, 4).map((p) => ({
        id: `recent-prod-${p.id}`,
        category: "products",
        groupTitle: "Recent Products",
        title: p.name,
        subtitle: `${p.categoryName} • ৳${(p.discountPrice ?? p.price).toLocaleString()} • ${p.stockQty} in stock`,
        badge: p.stockQty === 0 ? "Out of stock" : `${p.stockQty} in stock`,
        badgeVariant: p.stockQty === 0 ? "destructive" : "outline",
        href: `/products/${p.id}/edit`,
        icon: PackageIcon,
      }));

      return [...quickNav, ...recentProducts];
    }

    const items: SearchResultItem[] = [];

    // 1. Check quick navigation matches
    const navigationLinks = [
      { name: "Dashboard", href: "/dashboard", desc: "Overview, charts, and metrics", icon: DashboardSquare01Icon },
      { name: "All Products", href: "/products", desc: "Manage catalog, stock & pricing", icon: PackageIcon },
      { name: "Add Product", href: "/products/new", desc: "Create a new product with variants", icon: PlusSignIcon },
      { name: "All Categories", href: "/categories", desc: "Organize products by category", icon: Folder01Icon },
      { name: "New Category", href: "/categories/new", desc: "Add a category or subcategory", icon: PlusSignIcon },
      { name: "All Orders", href: "/orders", desc: "Customer orders, statuses, and tracking", icon: ClipboardIcon },
      { name: "New Order", href: "/orders/new", desc: "Place or record a new customer order", icon: PlusSignIcon },
      { name: "Pre-orders", href: "/preorders", desc: "Backordered and advance purchases", icon: ShoppingCartAdd01Icon },
      { name: "New Pre-order", href: "/preorders/new", desc: "Create a preorder for upcoming stock", icon: PlusSignIcon },
      { name: "Users & Admins", href: "/users", desc: "Manage team members and roles", icon: UserGroupIcon },
    ];

    navigationLinks
      .filter((nav) => nav.name.toLowerCase().includes(q) || nav.desc.toLowerCase().includes(q))
      .forEach((nav) => {
        items.push({
          id: `nav-${nav.href}`,
          category: "navigation",
          groupTitle: "Pages & Actions",
          title: nav.name,
          subtitle: nav.desc,
          href: nav.href,
          icon: nav.icon,
        });
      });

    // 2. Search Products (name, description, category, and variant colors)
    products.forEach((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const catMatch = p.categoryName?.toLowerCase().includes(q);
      const matchingVariant = p.variants?.find((v) => v.color.toLowerCase().includes(q));

      if (nameMatch || descMatch || catMatch || matchingVariant) {
        let subtitle = `${p.categoryName} • ৳${(p.discountPrice ?? p.price).toLocaleString()}`;
        let matchedBadge: string | undefined = undefined;

        if (matchingVariant) {
          matchedBadge = `Color: ${matchingVariant.color}`;
          subtitle = `Variant: ${matchingVariant.color} • ${subtitle}`;
        } else if (catMatch && !nameMatch) {
          matchedBadge = `Category: ${p.categoryName}`;
        }

        items.push({
          id: `product-${p.id}`,
          category: "products",
          groupTitle: "Products",
          title: p.name,
          subtitle,
          matchedBadge,
          badge: p.stockQty === 0 ? "Out of stock" : `${p.stockQty} in stock`,
          badgeVariant: p.stockQty === 0 ? "destructive" : "outline",
          href: `/products/${p.id}/edit`,
          icon: PackageIcon,
        });
      }
    });

    // 3. Search Orders (id, customer name, phone, email, district, and ordered items)
    orders.forEach((o) => {
      const idMatch = o.id.toLowerCase().includes(q);
      const nameMatch = o.customerName?.toLowerCase().includes(q);
      const phoneMatch = o.customerPhone?.includes(q);
      const emailMatch = o.customerEmail?.toLowerCase().includes(q);
      const districtMatch = o.districtName?.toLowerCase().includes(q);
      const matchingItem = o.items?.find(
        (i) => i.productName.toLowerCase().includes(q) || (i.color && i.color.toLowerCase().includes(q)),
      );

      if (idMatch || nameMatch || phoneMatch || emailMatch || districtMatch || matchingItem) {
        let subtitle = `৳${o.total.toLocaleString()} • ${o.customerPhone || o.customerName}`;
        let matchedBadge: string | undefined = undefined;

        if (matchingItem) {
          matchedBadge = `Item: ${matchingItem.productName}`;
          subtitle = `Contains "${matchingItem.productName}" • ${subtitle}`;
        } else if (phoneMatch) {
          matchedBadge = o.customerPhone;
        }

        const badgeVariant: "default" | "secondary" | "outline" | "destructive" =
          o.status === "delivered"
            ? "default"
            : o.status === "cancelled"
              ? "destructive"
              : o.status === "pending"
                ? "outline"
                : "secondary";

        items.push({
          id: `order-${o.id}`,
          category: "orders",
          groupTitle: "Orders",
          title: `Order #${o.id.slice(0, 8)} • ${o.customerName}`,
          subtitle,
          matchedBadge,
          badge: o.status.toUpperCase(),
          badgeVariant,
          href: `/orders/${o.id}`,
          icon: ClipboardIcon,
        });
      }
    });

    // 4. Search Categories (name, slug, description)
    categories.forEach((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const slugMatch = c.slug?.toLowerCase().includes(q);
      const descMatch = c.description?.toLowerCase().includes(q);

      if (nameMatch || slugMatch || descMatch) {
        items.push({
          id: `category-${c.id}`,
          category: "categories",
          groupTitle: "Categories",
          title: c.name,
          subtitle: c.parentId ? "Subcategory" : "Top-level Category",
          href: `/categories/${c.id}/edit`,
          icon: Folder01Icon,
        });
      }
    });

    // 5. Search Pre-orders (id, customer name, phone, items)
    preorders.forEach((po) => {
      const idMatch = po.id.toLowerCase().includes(q);
      const nameMatch = po.customerName?.toLowerCase().includes(q);
      const phoneMatch = po.customerPhone?.includes(q);
      const matchingItem = po.items?.find((i) => i.productName.toLowerCase().includes(q));

      if (idMatch || nameMatch || phoneMatch || matchingItem) {
        items.push({
          id: `preorder-${po.id}`,
          category: "preorders",
          groupTitle: "Pre-orders",
          title: `Pre-order #${po.id.slice(0, 8)} • ${po.customerName}`,
          subtitle: matchingItem
            ? `Contains "${matchingItem.productName}" • ৳${po.total.toLocaleString()}`
            : `৳${po.total.toLocaleString()} • ${po.customerPhone}`,
          badge: po.status.toUpperCase(),
          badgeVariant: "secondary",
          href: `/preorders/${po.id}`,
          icon: ShoppingCartAdd01Icon,
        });
      }
    });

    // 6. Search Users (name, email, role)
    users.forEach((u) => {
      const nameMatch = u.name.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      const roleMatch = u.role.toLowerCase().includes(q);

      if (nameMatch || emailMatch || roleMatch) {
        items.push({
          id: `user-${u.id}`,
          category: "users",
          groupTitle: "Users",
          title: u.name,
          subtitle: u.email,
          badge: u.role.toUpperCase(),
          badgeVariant: u.role === "admin" ? "default" : "outline",
          href: "/users",
          icon: UserGroupIcon,
        });
      }
    });

    return items;
  }, [query, products, orders, categories, preorders, users]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query]);

  // Keep selected item scrolled into view
  useEffect(() => {
    if (!open) return;
    const activeEl = document.getElementById(`search-item-${selectedIndex}`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, open]);

  function handleSelect(item: SearchResultItem) {
    setOpen(false);
    router.push(item.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Group the results by groupTitle
  const groupedResults = useMemo(() => {
    const groups: { title: string; items: { item: SearchResultItem; flatIndex: number }[] }[] = [];
    const map = new Map<string, { item: SearchResultItem; flatIndex: number }[]>();

    results.forEach((item, flatIndex) => {
      const list = map.get(item.groupTitle) ?? [];
      list.push({ item, flatIndex });
      map.set(item.groupTitle, list);
    });

    map.forEach((items, title) => {
      groups.push({ title, items });
    });

    return groups;
  }, [results]);

  return (
    <>
      {/* Search trigger button in the Topbar */}
      <button
        type="button"
        id="global-search-trigger"
        onClick={() => setOpen(true)}
        className="flex items-center justify-between w-48 sm:w-64 md:w-80 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground bg-background hover:bg-muted/60 border border-border rounded-lg shadow-2xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer group"
      >
        <div className="flex items-center gap-2 truncate">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            strokeWidth={1.5}
            className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
          />
          <span className="truncate">Search products, orders...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium font-mono text-muted-foreground/80 bg-card border border-border rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Global Search Dialog Modal */}
      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Global Search"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 p-3 sm:p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
              onKeyDown={handleKeyDown}
            >
              {/* Search input header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-card">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={20}
                  strokeWidth={2}
                  className="text-primary shrink-0"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, orders, categories, pre-orders, users..."
                  className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Clear query"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </button>
                ) : (
                  <kbd
                    onClick={() => setOpen(false)}
                    className="cursor-pointer text-[10px] font-medium font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border hover:bg-muted/80"
                  >
                    ESC
                  </kbd>
                )}
              </div>

              {/* Search Results list */}
              <div
                ref={listRef}
                className="overflow-y-auto p-2 sm:p-3 space-y-4 max-h-[58vh] divide-y divide-border/40"
              >
                {results.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                      <HugeiconsIcon icon={Search01Icon} size={22} />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      No results found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      Try searching with another keyword such as a product name, variant color,
                      order number, phone number, or category.
                    </p>
                  </div>
                ) : (
                  groupedResults.map((group) => (
                    <div key={group.title} className="pt-2 first:pt-0">
                      <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>{group.title}</span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded-full font-normal">
                          {group.items.length}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {group.items.map(({ item, flatIndex }) => {
                          const isSelected = selectedIndex === flatIndex;
                          const IconComponent = item.icon;

                          return (
                            <div
                              key={item.id}
                              id={`search-item-${flatIndex}`}
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(flatIndex)}
                              className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-100 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "hover:bg-muted/70 text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                                  }`}
                                >
                                  <HugeiconsIcon icon={IconComponent} size={16} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-sm font-medium truncate ${
                                        isSelected ? "text-primary-foreground" : "text-foreground"
                                      }`}
                                    >
                                      {isSelected ? (
                                        item.title
                                      ) : (
                                        <Highlight text={item.title} query={query} />
                                      )}
                                    </span>
                                    {item.matchedBadge && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded font-normal shrink-0 ${
                                          isSelected
                                            ? "bg-primary-foreground/25 text-primary-foreground"
                                            : "bg-primary/10 text-primary font-medium"
                                        }`}
                                      >
                                        {item.matchedBadge}
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={`text-xs truncate mt-0.5 ${
                                      isSelected
                                        ? "text-primary-foreground/80"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {isSelected ? (
                                      item.subtitle
                                    ) : (
                                      <Highlight text={item.subtitle} query={query} />
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {item.badge && (
                                  <Badge
                                    variant={isSelected ? "outline" : item.badgeVariant ?? "outline"}
                                    className={`text-[10px] px-1.5 py-0 ${
                                      isSelected
                                        ? "border-primary-foreground/40 text-primary-foreground"
                                        : ""
                                    }`}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                                <HugeiconsIcon
                                  icon={ArrowRight01Icon}
                                  size={14}
                                  className={`transition-transform duration-150 ${
                                    isSelected
                                      ? "translate-x-0.5 text-primary-foreground opacity-100"
                                      : "opacity-0 group-hover:opacity-70 text-muted-foreground"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer bar with shortcut hints */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-t border-border text-[11px] text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">
                      ↑
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">
                      ↓
                    </kbd>
                    <span>navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">
                      ↵
                    </kbd>
                    <span>select</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono text-[10px]">
                      esc
                    </kbd>
                    <span>close</span>
                  </span>
                </div>
                <span>
                  {results.length} result{results.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
