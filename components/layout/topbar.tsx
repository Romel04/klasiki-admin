import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Notification01Icon } from "@hugeicons/core-free-icons";

export function Topbar() {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />
        <span>Search products, orders...</span>
      </div>
      <div className="flex items-center gap-4">
        <HugeiconsIcon icon={Notification01Icon} size={18} strokeWidth={1.5} className="text-muted-foreground" />
        <div className="w-8 h-8 rounded-full bg-primary" />
      </div>
    </header>
  );
}