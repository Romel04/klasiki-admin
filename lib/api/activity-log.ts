import type { ActivityLogEntry } from "@/types/activity-log";
import { getCurrentUser } from "@/lib/auth/token-store";

// ---------------------------------------------------------------------------
// DEMO DATA ONLY. There is no backend endpoint for activity logs yet — this
// file exists so the Activity Log page has something real to render instead
// of another 404. Every entry below is hardcoded, not fetched.
//
// When the backend adds real logging (a table like {user_id, action, entity,
// entity_id, metadata, created_at} written on every mutating request, plus a
// paginated GET /activity-logs), swap getActivityLogs() below for an
// apiJson() call and delete FIXED_DEMO_LOGS, the same way every other module
// here was upgraded once its real endpoint was confirmed.
// ---------------------------------------------------------------------------

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

const FIXED_DEMO_LOGS: ActivityLogEntry[] = [
  {
    id: "log-1",
    actorName: "Akanto Chodu",
    actorRole: "admin",
    action: "status_changed",
    entity: "order",
    entityLabel: "Order #ORD-1042",
    detail: "Status changed from Confirmed to Shipped",
    createdAt: minutesAgo(6),
  },
  {
    id: "log-2",
    actorName: "Akanto Chodu",
    actorRole: "admin",
    action: "updated",
    entity: "product",
    entityLabel: "Nomad Crossbody — Tan",
    detail: "Price updated from ৳2,400 to ৳2,600",
    createdAt: minutesAgo(48),
  },
  {
    id: "log-3",
    actorName: "Romel",
    actorRole: "admin",
    action: "created",
    entity: "preorder",
    entityLabel: "Preorder for Farzana Islam",
    detail: "Added manually — source: Facebook",
    createdAt: minutesAgo(75),
  },
  {
    id: "log-4",
    actorName: "Akanto Chodu",
    actorRole: "admin",
    action: "created",
    entity: "user",
    entityLabel: "Farzana Islam",
    detail: "New admin account created with role: user",
    createdAt: minutesAgo(130),
  },
  {
    id: "log-5",
    actorName: "Romel",
    actorRole: "admin",
    action: "logged_in",
    entity: "auth",
    entityLabel: "Romel",
    createdAt: minutesAgo(160),
  },
  {
    id: "log-6",
    actorName: "Akanto Chodu",
    actorRole: "admin",
    action: "deleted",
    entity: "category",
    entityLabel: "Seasonal — Winter '25",
    detail: "Removed empty subcategory",
    createdAt: minutesAgo(300),
  },
  {
    id: "log-7",
    actorName: "Akanto Chodu",
    actorRole: "admin",
    action: "updated",
    entity: "order",
    entityLabel: "Order #ORD-1038",
    detail: "Added admin note",
    createdAt: minutesAgo(430),
  },
];

export async function getActivityLogs(): Promise<ActivityLogEntry[]> {
  // Slot today's actual signed-in admin into the most recent "logged in"
  // entry so the page feels real for whoever is looking at it right now,
  // rather than always showing the same hardcoded name.
  const me = getCurrentUser();
  const logs = me
    ? [
        {
          id: "log-0",
          actorName: me.name,
          actorRole: me.role,
          action: "logged_in" as const,
          entity: "auth" as const,
          entityLabel: me.name,
          createdAt: minutesAgo(1),
        },
        ...FIXED_DEMO_LOGS,
      ]
    : FIXED_DEMO_LOGS;

  return logs;
}