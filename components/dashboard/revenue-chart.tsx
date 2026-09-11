"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const placeholderData = [
  { month: "Apr", revenue: 18000 },
  { month: "May", revenue: 24000 },
  { month: "Jun", revenue: 21000 },
  { month: "Jul", revenue: 32000 },
  { month: "Aug", revenue: 28000 },
  { month: "Sep", revenue: 41000 },
];

export function RevenueChart() {
  return (
    <div className="bg-card border border-border rounded-md p-4 h-64">
      <div className="text-xs text-muted-foreground mb-2">
        Revenue over time
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={placeholderData}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            stroke="var(--muted-foreground)"
          />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              fontSize: 12,
              borderRadius: 6,
            }}
          />
          <Bar dataKey="revenue" fill="var(--primary)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
