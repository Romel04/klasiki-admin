"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Notification01Icon,
  User03Icon,
  Logout03Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { clearAuth } from "@/lib/auth/token-store";
import { useSidebar } from "./sidebar-context";

export function Topbar() {
  const router = useRouter();
  const { toggle } = useSidebar();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card">
      {/* Left side: hamburger + search hint */}
      <div className="flex items-center gap-3">
        <button
          id="topbar-sidebar-toggle"
          aria-label="Toggle sidebar"
          onClick={toggle}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-foreground hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={1.5} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />
          <span>Search products, orders...</span>
        </div>
      </div>

      {/* Right side: notifications + user */}
      <div className="flex items-center gap-4">
        <HugeiconsIcon
          icon={Notification01Icon}
          size={18}
          strokeWidth={1.5}
          className="text-muted-foreground"
        />

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="topbar-user-menu-btn"
            aria-label="User menu"
            onClick={() => setOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <HugeiconsIcon icon={User03Icon} size={16} strokeWidth={1.5} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                id="topbar-logout-btn"
                onClick={handleLogout}
                className="group w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:text-background hover:bg-accent transition-colors"
              >
                <HugeiconsIcon
                  icon={Logout03Icon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-muted-foreground group-hover:text-background transition-colors"
                />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
