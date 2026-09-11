interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "warning";
}

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-md p-4">
      <div className={tone === "warning" ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
        {label}
      </div>
      <div className={tone === "warning" ? "text-destructive text-xl font-semibold mt-1" : "text-xl font-semibold mt-1"}>
        {value}
      </div>
    </div>
  );
}