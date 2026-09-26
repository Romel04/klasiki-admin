import { Badge } from "@/components/ui/badge";
import type { ActivityLogAction } from "@/types/activity-log";

const LABELS: Record<ActivityLogAction, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  status_changed: "Status changed",
  logged_in: "Logged in",
};

// Matches the Badge variants already used elsewhere (see OrderStatusBadge).
const VARIANTS: Record<
  ActivityLogAction,
  "default" | "secondary" | "outline" | "destructive"
> = {
  created: "default",
  updated: "secondary",
  deleted: "destructive",
  status_changed: "secondary",
  logged_in: "outline",
};

export function ActivityActionBadge({ action }: { action: ActivityLogAction }) {
  return <Badge variant={VARIANTS[action]}>{LABELS[action]}</Badge>;
}
