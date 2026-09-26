"use client";

import { useActivityLogs } from "@/lib/hooks/use-activity-log";
import { ActivityActionBadge } from "@/components/activity-log/activity-action-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function ActivityLogPage() {
  const { data: logs, isPending, error } = useActivityLogs();

  if (isPending)
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="h-7 w-32 rounded-md bg-muted/70 animate-pulse" />
          <div className="h-3.5 w-80 rounded-full bg-muted/70 animate-pulse" />
        </div>
        <TableSkeleton
          columns={["w-28", "w-20", "w-24", "w-48", "w-16"]}
          rows={8}
        />
      </div>
    );
  if (error)
    return (
      <p className="text-sm text-destructive">Failed to load activity log.</p>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          Demo data — there's no backend endpoint for this yet, so nothing below
          is being written anywhere. Once the backend adds real logging, this
          page will show every admin action for real.
        </p>
      </div>

      <div className="bg-card border border-border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="font-medium">{log.actorName}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {log.actorRole}
                  </div>
                </TableCell>
                <TableCell>
                  <ActivityActionBadge action={log.action} />
                </TableCell>
                <TableCell>{log.entityLabel}</TableCell>
                <TableCell className="text-muted-foreground">
                  {log.detail ?? "—"}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(log.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
