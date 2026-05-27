"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

type Ticket = {
  id: string;
  number: string;
  title: string;
  priority: "P1" | "P2" | "P3" | "P4";
  status: "OPEN" | "IN_PROGRESS" | "SCHEDULED" | "WAITING" | "RESOLVED" | "CLOSED";
  account: { name: string } | null;
};

const priorityVariant = (p: string) =>
  p === "P1" ? ("destructive" as const) : p === "P2" ? ("warning" as const) : ("secondary" as const);

const statusIcon = (s: string) =>
  s === "OPEN" ? AlertTriangle : s === "IN_PROGRESS" ? Clock : CheckCircle2;
const statusColor = (s: string) =>
  s === "OPEN" ? "text-red-400" : s === "IN_PROGRESS" ? "text-amber-400" : "text-emerald-400";

export function ServiceTickets({ tickets, atRisk = 0 }: { tickets: Ticket[]; atRisk?: number }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Service tickets</CardTitle>
          <p className="text-xs text-ink-300/55 mt-1">
            {tickets.length} open {atRisk > 0 ? `· ${atRisk} SLA at risk` : ""}
          </p>
        </div>
        {atRisk > 0 && <Badge variant="warning">{atRisk} at risk</Badge>}
      </CardHeader>
      <CardContent className="space-y-2">
        {tickets.length === 0 && (
          <div className="text-xs text-ink-300/50 text-center py-8">All clear.</div>
        )}
        {tickets.map((t, i) => {
          const Icon = statusIcon(t.status);
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-bone-50/60 transition-colors cursor-pointer"
            >
              <Icon className={`h-4 w-4 ${statusColor(t.status)} shrink-0`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-ink-300/45 font-mono">{t.number}</span>
                  <Badge variant={priorityVariant(t.priority)} className="h-4 px-1.5 text-[9px]">
                    {t.priority}
                  </Badge>
                </div>
                <div className="text-xs font-medium truncate mt-0.5">{t.title}</div>
                <div className="text-[10px] text-ink-300/50 truncate">{t.account?.name ?? ""}</div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
