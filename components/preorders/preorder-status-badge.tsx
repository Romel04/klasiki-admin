import { Badge } from "@/components/ui/badge";
import type { PreorderStatus } from "@/types/preorder";

const LABELS: Record<PreorderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const VARIANTS: Record<
  PreorderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  confirmed: "secondary",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

export function PreorderStatusBadge({ status }: { status: PreorderStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
