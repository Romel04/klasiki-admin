import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import { PackageDelivered01Icon } from "@hugeicons/core-free-icons";

// Placeholder — no API yet. Replace with real hook when backend is ready.
const preorders: unknown[] = [];

export default function PreordersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pre-orders</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preorders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <HugeiconsIcon
                    icon={PackageDelivered01Icon}
                    size={40}
                    strokeWidth={1.2}
                    className="opacity-30"
                  />
                  <p className="text-sm">No pre-orders yet — check back later.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
