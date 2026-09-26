import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon
          icon={Search01Icon}
          size={28}
          strokeWidth={1.5}
          className="text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium tracking-widest text-primary">404</p>
        <h1 className="text-2xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
      </div>

      <Link href="/dashboard">
        <Button>
          Back to dashboard
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </Button>
      </Link>
    </div>
  );
}
