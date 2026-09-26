import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  /** Column widths — determines how many columns and their relative widths */
  columns: string[];
  /** Number of placeholder rows to render */
  rows?: number;
}

/**
 * Generic skeleton loader that mirrors the table chrome.
 * Pass column widths (Tailwind width classes) to control each column's pill width.
 */
export function TableSkeleton({ columns, rows = 6 }: TableSkeletonProps) {
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-3.5 w-20 rounded-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx} className="hover:bg-transparent">
              {columns.map((width, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton className={`h-4 ${width} rounded-full`} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
