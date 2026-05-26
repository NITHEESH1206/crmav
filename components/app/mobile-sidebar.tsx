"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_GROUPS } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/app/brand-mark";
import { useMobileNav } from "@/lib/stores/mobile-nav";
import { useQuickCreate } from "@/lib/stores/quick-create";

export function MobileSidebar() {
  const { open, hide, setOpen } = useMobileNav();
  const pathname = usePathname();
  const router = useRouter();
  const showQuickCreate = useQuickCreate((s) => s.show);

  // Auto-close on route change
  useEffect(() => {
    hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={hide}
            className="absolute inset-0 bg-ink-500/70 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] flex flex-col glass-panel border-r border-white/[0.08]"
          >
            {/* Brand + close */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.06]">
              <Link href="/" onClick={hide} className="flex items-center">
                <BrandMark variant="full" height={22} />
              </Link>
              <button
                onClick={hide}
                aria-label="Close menu"
                className="h-9 w-9 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick add */}
            <div className="px-3 pt-3">
              <Button
                onClick={() => {
                  hide();
                  showQuickCreate("todo");
                }}
                className="w-full justify-start"
                size="default"
              >
                <Plus className="h-4 w-4" />
                <span>New action</span>
              </Button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              {NAV_GROUPS.map((group) => {
                const items = NAV_ITEMS.filter((i) => i.group === group);
                return (
                  <div key={group} className="mb-5">
                    <div className="px-2.5 mb-1.5 text-[10px] uppercase tracking-[0.18em] text-white/35 font-semibold">
                      {group}
                    </div>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const active =
                          pathname === item.href ||
                          (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                          <button
                            key={item.href}
                            onClick={() => {
                              hide();
                              router.push(item.href);
                            }}
                            className={cn(
                              "relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all text-left",
                              active
                                ? "bg-signal-500/[0.16] border border-signal-500/30 text-bone-100"
                                : "text-white/65 hover:text-white hover:bg-white/[0.04] border border-transparent"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                active ? "text-signal-400" : "text-white/55"
                              )}
                            />
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && (
                              <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                                {item.badge}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Footer CTA */}
            <div className="border-t border-white/[0.06] p-3">
              <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-signal-500/[0.08] to-transparent p-3">
                <div className="text-xs font-semibold mb-1">Trial: 14 days left</div>
                <div className="text-[11px] text-white/45 mb-3 leading-snug">
                  Upgrade to unlock unlimited users & AMC automation.
                </div>
                <Button size="sm" className="w-full">
                  Upgrade plan
                </Button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
