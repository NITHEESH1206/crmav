"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDetailDrawer } from "@/lib/stores/detail-drawer";
import { getDetail, type DetailKind } from "@/app/actions/detail";
import { Target, FolderKanban, LifeBuoy, Building2, Sparkles, Pencil, ArrowUpRight, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const KIND_META: Record<DetailKind, { icon: LucideIcon; label: string }> = {
  opportunity: { icon: Target, label: "Opportunity" },
  project: { icon: FolderKanban, label: "Project" },
  ticket: { icon: LifeBuoy, label: "Service ticket" },
  account: { icon: Building2, label: "Account" },
};

type DetailData = NonNullable<Awaited<ReturnType<typeof getDetail>>>;

const DETAIL_PATH: Record<DetailKind, string> = {
  opportunity: "/opportunities",
  project: "/projects",
  ticket: "/service",
  account: "/accounts",
};

export function DetailDrawer() {
  const router = useRouter();
  const { open, kind, id, setOpen, hide } = useDetailDrawer();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !kind || !id) return;
    setData(null);
    setLoading(true);
    getDetail(kind, id)
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [open, kind, id]);

  const Icon = kind ? KIND_META[kind].icon : Target;
  const kindLabel = kind ? KIND_META[kind].label : "";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="p-0">
        <SheetHeader>
          <div className="flex items-center gap-2 text-signal-400 text-[11px] uppercase tracking-[0.2em]">
            <Icon className="h-3 w-3" />
            {kindLabel}
          </div>
          <SheetTitle className="pr-10">
            {loading || !data ? <Skeleton className="h-7 w-3/4" /> : data.title}
          </SheetTitle>
          <SheetDescription>
            {loading || !data ? <Skeleton className="h-4 w-1/2 mt-1" /> : data.subtitle}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {loading || !data ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-4"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="p-6 space-y-6"
              >
                {data.description && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-white/70 leading-relaxed">
                    {data.description}
                  </div>
                )}

                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {"related" in data && data.related && (
                      <TabsTrigger value="related">Related</TabsTrigger>
                    )}
                    <TabsTrigger value="ai">
                      <Sparkles className="h-3 w-3 mr-1.5 text-signal-400" />
                      AI
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-1">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {data.fields.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <div className="text-[10px] uppercase tracking-wider text-white/40">{f.label}</div>
                          <div className="text-sm text-white/85 mt-0.5 capitalize truncate">{f.value}</div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {"related" in data && data.related && (
                    <TabsContent value="related" className="space-y-5">
                      {Object.entries(data.related).map(([group, items]) => (
                        <div key={group}>
                          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
                            {group} <span className="text-white/30">· {items.length}</span>
                          </div>
                          {items.length === 0 ? (
                            <div className="text-xs text-white/40 italic">None</div>
                          ) : (
                            <div className="space-y-1.5">
                              {items.map((it: any, i: number) => (
                                <div
                                  key={i}
                                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 flex items-center justify-between"
                                >
                                  <div className="text-sm text-white/85 truncate">{it.label}</div>
                                  <div className="text-[11px] text-white/45 font-mono shrink-0 ml-3">{it.meta}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </TabsContent>
                  )}

                  <TabsContent value="ai">
                    <div className="rounded-xl border border-signal-500/20 bg-gradient-to-br from-signal-500/[0.08] to-transparent p-5">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-signal-400 mb-3">
                        <Sparkles className="h-3 w-3" />
                        Zynex AI suggests
                      </div>
                      <ul className="space-y-2.5 text-sm text-white/75 leading-relaxed">
                        {kind === "opportunity" && (
                          <>
                            <li>• Send a follow-up — last interaction was 6 days ago.</li>
                            <li>• Generate a Crestron + Q-SYS BOQ for this stage.</li>
                            <li>• Win probability bumped to 64% (similar deals closed 68%).</li>
                          </>
                        )}
                        {kind === "project" && (
                          <>
                            <li>• Margin is healthy. Flag any cost overrun &gt; 3%.</li>
                            <li>• Schedule commissioning walkthrough this week.</li>
                            <li>• 2 BOQ items are low on stock — auto-create PO?</li>
                          </>
                        )}
                        {kind === "ticket" && (
                          <>
                            <li>• Similar tickets resolved in 1h 14m on average.</li>
                            <li>• Likely root cause: firmware regression on DSP.</li>
                            <li>• Recommend dispatching L. Rivera (closest tech).</li>
                          </>
                        )}
                        {kind === "account" && (
                          <>
                            <li>• Renewal window opens in 64 days.</li>
                            <li>• Expansion opportunity: 2 unbooked rooms identified.</li>
                            <li>• Health declining — propose a check-in call.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-white/[0.06] p-4 flex items-center justify-between gap-2 bg-ink-200/40">
          <Button variant="ghost" size="sm" disabled={!kind || !id} onClick={() => {
            if (!kind || !id) return;
            router.push(`${DETAIL_PATH[kind]}/${id}`);
            hide();
          }}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button size="sm" disabled={!data || !kind || !id} onClick={() => {
            if (!kind || !id) return;
            router.push(`${DETAIL_PATH[kind]}/${id}`);
            hide();
          }}>
            Open full view
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
