"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronsLeft, Plus, HelpCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_GROUPS } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuickCreate } from "@/lib/stores/quick-create";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const showQuickCreate = useQuickCreate((s) => s.show);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col transition-[width] duration-500 ease-out",
        collapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      <div className="relative m-3 mr-0 flex h-[calc(100vh-24px)] flex-col rounded-2xl glass-panel overflow-hidden">
        {/* Glow bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-aether-500/60 to-transparent" />

        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-aether-400 via-aether-500 to-aether-700 shadow-glow-sm flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="font-display font-semibold text-[15px] tracking-tight text-white truncate"
                >
                  Aether<span className="text-aether-500">AV</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="h-7 w-7 rounded-md border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/45 hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronsLeft className={cn("h-3.5 w-3.5 transition-transform duration-300", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Quick add */}
        <div className="px-3 pb-3">
          <Button
            onClick={() => showQuickCreate("todo")}
            className={cn("w-full justify-start", collapsed && "px-0 justify-center")}
            size="sm"
          >
            <Plus className="h-3.5 w-3.5" />
            {!collapsed && <span>New action</span>}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group);
            return (
              <div key={group} className="mb-5">
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-2.5 mb-1.5 text-[10px] uppercase tracking-[0.18em] text-white/35 font-semibold"
                    >
                      {group}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link key={item.href} href={item.href} className="block group">
                        <motion.div
                          layout
                          className={cn(
                            "relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all",
                            collapsed && "justify-center",
                            active
                              ? "text-white bg-white/[0.04]"
                              : "text-white/55 hover:text-white hover:bg-white/[0.03]"
                          )}
                        >
                          {active && (
                            <motion.div
                              layoutId="sidebar-active"
                              className="absolute inset-0 rounded-xl bg-gradient-to-r from-aether-500/[0.18] to-aether-500/[0.04] border border-aether-500/30 shadow-[0_0_24px_-8px_rgba(255,107,0,0.5)]"
                              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                            />
                          )}
                          {active && (
                            <motion.div
                              layoutId="sidebar-indicator"
                              className="absolute -left-3 top-2 bottom-2 w-1 rounded-full bg-aether-500 shadow-glow-sm"
                              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                            />
                          )}
                          <Icon
                            className={cn(
                              "relative h-4 w-4 shrink-0 transition-colors",
                              active ? "text-aether-400" : "text-white/55 group-hover:text-white/85"
                            )}
                          />
                          <AnimatePresence>
                            {!collapsed && (
                              <motion.span
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.2 }}
                                className="relative flex-1 truncate"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {!collapsed && item.badge && (
                            <Badge variant="default" className="relative h-5 px-1.5 text-[10px]">
                              {item.badge}
                            </Badge>
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] p-3">
          <div
            className={cn(
              "rounded-xl border border-white/[0.06] bg-gradient-to-b from-aether-500/[0.08] to-transparent p-3 relative overflow-hidden",
              collapsed && "p-0 border-0 bg-transparent"
            )}
          >
            {!collapsed ? (
              <>
                <div className="text-xs font-semibold mb-1">Trial: 14 days left</div>
                <div className="text-[11px] text-white/45 mb-3 leading-snug">
                  Upgrade to unlock unlimited users & AMC automation.
                </div>
                <Button size="sm" className="w-full">
                  Upgrade plan
                </Button>
              </>
            ) : (
              <button className="h-9 w-9 mx-auto flex items-center justify-center rounded-lg text-white/55 hover:text-white hover:bg-white/[0.04]">
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
