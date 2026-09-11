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
  Clock01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { href: "/products", label: "Products", icon: PackageIcon },
  { href: "/categories", label: "Categories", icon: Folder01Icon },
  { href: "/orders", label: "Orders", icon: ClipboardIcon },
  { href: "/activity-log", label: "Activity Log", icon: Clock01Icon },
  { href: "/settings", label: "Settings", icon: Settings01Icon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-foreground text-background flex flex-col p-4 gap-1">
      <div className="mb-6 px-10 pt-1">
        <Link href="/dashboard" className="inline-block">
          <Image
            src="/Klasiki Logo PNG White.png"
            alt="Klasiki"
            width={141}
            height={38}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-background/70 hover:bg-background/10 hover:text-background",
            )}
          >
            <HugeiconsIcon icon={icon} size={16} strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
