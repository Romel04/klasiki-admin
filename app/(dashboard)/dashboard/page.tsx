import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrderStatusChart } from "@/components/dashboard/order-status-chart";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Overview</h1>

      {/* Stat cards: 1 col on mobile → 2 on sm → 4 on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Revenue (delivered)" value="৳48,200" />
        <StatCard label="Orders (month)" value="37" />
        <StatCard label="Items Sold" value="52" />
        <StatCard label="Low Stock" value="4" tone="warning" />
      </div>

      {/* Charts: stack on mobile → side-by-side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <OrderStatusChart />
      </div>
    </div>
  );
}