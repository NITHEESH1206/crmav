"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

const DATA = [
  { month: "Jan", revenue: 92, billed: 80 },
  { month: "Feb", revenue: 106, billed: 96 },
  { month: "Mar", revenue: 124, billed: 110 },
  { month: "Apr", revenue: 132, billed: 122 },
  { month: "May", revenue: 154, billed: 142 },
  { month: "Jun", revenue: 168, billed: 158 },
  { month: "Jul", revenue: 162, billed: 152 },
  { month: "Aug", revenue: 198, billed: 184 },
  { month: "Sep", revenue: 212, billed: 196 },
  { month: "Oct", revenue: 244, billed: 224 },
  { month: "Nov", revenue: 268, billed: 248 },
  { month: "Dec", revenue: 296, billed: 274 },
];

export function RevenueChart() {
  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Revenue performance</CardTitle>
          <p className="text-xs text-ink-300/55 mt-1">Booked vs. billed — last 12 months</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="gap-1">
            <ArrowUpRight className="h-3 w-3" />
            +32.4% YoY
          </Badge>
          <Tabs defaultValue="12m">
            <TabsList className="h-8">
              <TabsTrigger value="3m" className="text-xs px-2.5 h-6">3M</TabsTrigger>
              <TabsTrigger value="6m" className="text-xs px-2.5 h-6">6M</TabsTrigger>
              <TabsTrigger value="12m" className="text-xs px-2.5 h-6">12M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="flex items-baseline gap-6 px-4 mb-2">
          <div>
            <div className="text-[11px] text-ink-300/50 uppercase tracking-wider">Booked</div>
            <div className="font-display text-2xl font-semibold tracking-tight">$2.96M</div>
          </div>
          <div>
            <div className="text-[11px] text-ink-300/50 uppercase tracking-wider">Billed</div>
            <div className="font-display text-2xl font-semibold tracking-tight text-ink-300/80">$2.74M</div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8a33" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#ff6b00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-bill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.35)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.35)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(11,11,13,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  backdropFilter: "blur(20px)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                formatter={(v: number) => [`$${v}k`, ""]}
              />
              <Area
                type="monotone"
                dataKey="billed"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
                fill="url(#g-bill)"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ff8a33"
                strokeWidth={2.2}
                fill="url(#g-rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
