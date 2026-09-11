"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const placeholderData = [
  { name: "Delivered", value: 40 },
  { name: "Confirmed", value: 30 },
  { name: "Pending", value: 20 },
  { name: "Cancelled", value: 10 },
];

const COLORS = [
  "var(--primary)",
  "var(--foreground)",
  "var(--muted-foreground)",
  "var(--destructive)",
];

export function OrderStatusChart() {
  return (
    <div className="bg-card border border-border rounded-md p-4 h-64">
      <div className="text-xs text-muted-foreground mb-2">Order status</div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={placeholderData}
            dataKey="value"
            nameKey="name"
            innerRadius={40}
            outerRadius={65}
          >
            {placeholderData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              fontSize: 12,
              borderRadius: 6,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
