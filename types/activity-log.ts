// Activity Log has NO backend endpoint at all yet — this whole feature is
// demo/mock data so the admin UI has a real page to link to (see AGENTS.md's
// "Known open issue" section for why a missing page here was actively
// causing surprise logouts). Once the backend exposes real endpoints for
// this, replace lib/api/activity-log.ts's getActivityLogs() with a real
// apiJson() call and delete DEMO_ACTIVITY_LOGS, the same way
// lib/api/orders.ts was rewritten once real Orders responses came back.

export const ACTIVITY_LOG_ACTIONS = [
  "created",
  "updated",
  "deleted",
  "status_changed",
  "logged_in",
] as const;
export type ActivityLogAction = (typeof ACTIVITY_LOG_ACTIONS)[number];

export const ACTIVITY_LOG_ENTITIES = [
  "product",
  "category",
  "order",
  "preorder",
  "user",
  "auth",
] as const;
export type ActivityLogEntity = (typeof ACTIVITY_LOG_ENTITIES)[number];

export interface ActivityLogEntry {
  id: string;
  actorName: string;
  actorRole: "admin" | "user";
  action: ActivityLogAction;
  entity: ActivityLogEntity;
  entityLabel: string; // e.g. the product name, order id, or user name affected
  detail?: string; // short human-readable note on what changed
  createdAt: string; // ISO timestamp
}