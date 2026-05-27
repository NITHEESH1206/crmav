"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  progress: number;
  dueDate: Date | null;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  account: { name: string } | null;
};

const riskMap = (r: string) => (r === "HIGH" ? "At risk" : r === "MEDIUM" ? "Watch" : "On track");

export function ProjectStatus({ projects, totalActive }: { projects: Project[]; totalActive: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active projects</CardTitle>
        <p className="text-xs text-ink-300/55 mt-1">{projects.length} of {totalActive} shown</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 && (
          <div className="text-xs text-ink-300/50 text-center py-8">No active projects.</div>
        )}
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group p-3 -mx-3 rounded-xl hover:bg-bone-50/60 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-ink-300/50">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{p.account?.name ?? "—"}</span>
                </div>
              </div>
              <Badge
                variant={p.riskLevel === "HIGH" ? "warning" : p.riskLevel === "MEDIUM" ? "info" : "success"}
                className="shrink-0"
              >
                {riskMap(p.riskLevel)}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={p.progress} className="flex-1" />
              <span className="text-[11px] text-ink-300/65 font-mono w-8 text-right">{p.progress}%</span>
            </div>
            <div className="mt-1.5 text-[10px] text-ink-300/45">
              Due {p.dueDate ? formatDate(p.dueDate, { month: "short", day: "numeric" }) : "—"}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
