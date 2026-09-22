"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  PackageIcon,
  Folder01Icon,
  ClipboardIcon,
  UserGroupIcon,
  Clock01Icon,
  Settings01Icon,
  ShoppingCartAdd01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { href: "/products", label: "Products", icon: PackageIcon },
  { href: "/categories", label: "Categories", icon: Folder01Icon },
  { href: "/orders", label: "Orders", icon: ClipboardIcon },
  { href: "/preorders", label: "Pre-orders", icon: ShoppingCartAdd01Icon },
  { href: "/users", label: "Users", icon: UserGroupIcon },
  { href: "/activity-log", label: "Activity Log", icon: Clock01Icon },
  { href: "/settings", label: "Settings", icon: Settings01Icon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, isMobile } = useSidebar();

  return (
    <>
      {/* Mobile backdrop — closes sidebar when tapping outside */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          // Base styles
          "bg-foreground text-background flex flex-col p-4 gap-1 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0",
          // Desktop: in-flow
          !isMobile && "relative",
          // Mobile: fixed overlay on the left, above everything
          isMobile && "fixed inset-y-0 left-0 shadow-2xl z-50 w-56",
          isMobile && collapsed && "-translate-x-full",
          // Desktop width based on collapsed state
          !isMobile && (collapsed ? "w-16" : "w-56"),
        )}
      >
        {/* Logo / icon area */}
        <div className={cn("mb-6 pt-1 flex items-center", collapsed ? "justify-center px-0" : "px-10")}>
          <Link href="/dashboard" className="inline-block overflow-hidden">
            {collapsed ? (
              /* Show a small "K" monogram when collapsed */
              <span className="text-background font-bold text-lg leading-none select-none">K</span>
            ) : (
              <Image
                src="/Klasiki Logo PNG White.png"
                alt="Klasiki"
                width={141}
                height={38}
                priority
                className="h-8 w-auto object-contain"
              />
            )}
          </Link>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => isMobile && setCollapsed(true)}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-2 py-2 rounded-md text-sm transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-background/70 hover:bg-background/10 hover:text-background",
              )}
            >
              <HugeiconsIcon icon={icon} size={18} strokeWidth={1.5} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </aside>
    </>
  );
}
