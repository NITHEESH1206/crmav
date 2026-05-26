"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Check, ClipboardCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getOrCreateChecklist,
  toggleChecklistItem,
  type ChecklistData,
} from "@/app/actions/commissioning";

export function CommissioningChecklist({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(true);
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [data, setData] = useState<ChecklistData | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrCreateChecklist(projectId)
      .then((res) => {
        if (cancelled) return;
        setChecklistId(res.id);
        setData(res.data);
        setCompletedAt(res.completedAt);
      })
      .catch((e) =>
        toast.error("Couldn't load checklist", {
          description: e instanceof Error ? e.message : "Unknown error",
        })
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading || !data || !checklistId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-3.5 w-3.5 text-signal-400" />
            Commissioning checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const total = data.groups.reduce((s, g) => s + g.items.length, 0);
  const done = data.groups.reduce((s, g) => s + g.items.filter((i) => i.done).length, 0);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  function toggle(groupId: string, itemId: string, currentDone: boolean) {
    if (!checklistId) return;
    const next = !currentDone;
    // optimistic
    setData((d) =>
      d
        ? {
            groups: d.groups.map((g) =>
              g.id !== groupId
                ? g
                : { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, done: next } : it)) }
            ),
          }
        : d
    );
    startTransition(async () => {
      try {
        const r = await toggleChecklistItem(checklistId, groupId, itemId, next);
        if (r.allDone && !completedAt) {
          setCompletedAt(new Date());
          toast.success("Commissioning complete!", {
            description: "All checklist items signed off. Ready for handover.",
          });
        }
      } catch (e) {
        // rollback
        setData((d) =>
          d
            ? {
                groups: d.groups.map((g) =>
                  g.id !== groupId
                    ? g
                    : { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, done: currentDone } : it)) }
                ),
              }
            : d
        );
        toast.error("Couldn't save", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-3.5 w-3.5 text-signal-400" />
            Commissioning checklist
          </CardTitle>
          <p className="text-xs text-white/45 mt-1">
            {done} of {total} items signed off
          </p>
        </div>
        {completedAt ? (
          <Badge className="gap-1 bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
            <Sparkles className="h-3 w-3" />
            Complete
          </Badge>
        ) : (
          <Badge variant="secondary">{pct}% done</Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-1">
        <Progress value={pct} className="h-1.5 mb-5" />

        <div className="space-y-5">
          {data.groups.map((group) => {
            const groupDone = group.items.filter((i) => i.done).length;
            const groupPct = group.items.length === 0 ? 0 : Math.round((groupDone / group.items.length) * 100);
            return (
              <div key={group.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-semibold">
                    {group.title}
                  </div>
                  <div className="text-[10px] text-white/35 font-mono">
                    {groupDone}/{group.items.length}
                    {groupPct === 100 && <span className="text-emerald-400 ml-1.5">✓</span>}
                  </div>
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => toggle(group.id, item.id, item.done)}
                      disabled={pending}
                      whileTap={{ scale: 0.985 }}
                      className={cn(
                        "w-full flex items-start gap-3 px-2.5 py-2 rounded-lg text-left transition-colors text-sm",
                        item.done
                          ? "text-white/45 hover:bg-white/[0.02]"
                          : "text-white/85 hover:bg-white/[0.03]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all",
                          item.done
                            ? "bg-signal-500 border-signal-500 text-white"
                            : "border-white/[0.15] bg-white/[0.02] group-hover:border-signal-500/50"
                        )}
                      >
                        {item.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                      </span>
                      <span className={item.done ? "line-through" : ""}>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
