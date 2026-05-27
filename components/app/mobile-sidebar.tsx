"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_GROUPS, type NavGroup, type NavItem } from "@/lib/nav";
import { BrandMark } from "@/components/app/brand-mark";
import { useMobileNav } from "@/lib/stores/mobile-nav";
import { useQuickCreate } from "@/lib/stores/quick-create";

export function MobileSidebar() {
  const { open, hide, setOpen } = useMobileNav();
  const pathname = usePathname();
  const router = useRouter();
  const showQuickCreate = useQuickCreate((s) => s.show);

  useEffect(() => {
    hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, setOpen]);

  const { pinned, grouped, workspace } = useMemo(() => {
    const pinned = NAV_ITEMS.filter((i) => i.group === "Pinned");
    const workspace = NAV_ITEMS.filter((i) => i.group === "Workspace");
    const grouped: Record<NavGroup, NavItem[]> = {} as Record<NavGroup, NavItem[]>;
    for (const g of NAV_GROUPS) {
      grouped[g] = NAV_ITEMS.filter((i) => i.group === g);
    }
    return { pinned, grouped, workspace };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={hide}
            className="absolute inset-0 bg-ink-300/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="absolute inset-y-0 left-0 w-[290px] max-w-[86vw] flex flex-col bg-white border-r border-bone-300/65"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-bone-300/55">
              <Link href="/" onClick={hide} className="flex items-center">
                <BrandMark variant="full" height={20} invertForDark={false} />
              </Link>
              <button
                onClick={hide}
                aria-label="Close menu"
                className="h-8 w-8 rounded-md border border-bone-300/65 bg-bone-50 flex items-center justify-center text-ink-300/65 hover:text-ink-300 hover:bg-bone-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="px-3 pt-3">
              <div className="w-full flex items-center gap-2 rounded-md border border-bone-300/55 bg-bone-50 px-2.5 py-1.5 text-[12.5px] text-ink-300/55">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">Search…</span>
                <span className="kbd">⌘K</span>
              </div>
            </div>

            <div className="px-3 pt-2">
              <div className="space-y-0.5">
                {pinned.map((item) => (
                  <MobileNavRow
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onClick={() => {
                      hide();
                      router.push(item.href);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="px-3 pt-1 pb-1">
              <button
                onClick={() => {
                  hide();
                  showQuickCreate("todo");
                }}
                className="w-full flex items-center gap-2 rounded-md bg-ink-300 text-bone-100 px-2.5 py-2 text-[13px] font-medium hover:bg-ink-200 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-1">
              {NAV_GROUPS.map((group) => {
                const items = grouped[group];
                if (!items || items.length === 0) return null;
                return (
                  <div key={group} className="mb-2">
                    <div className="px-2 pt-3 pb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/45 font-semibold">
                      {group}
                    </div>
                    <div className="space-y-0.5">
                      {items.map((item) => (
                        <MobileNavRow
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          onClick={() => {
                            hide();
                            router.push(item.href);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-bone-300/55 px-3 py-2">
              <div className="space-y-0.5">
                {workspace.map((item) => (
                  <MobileNavRow
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onClick={() => {
                      hide();
                      router.push(item.href);
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function MobileNavRow({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-[13.5px] transition-colors text-left",
        active
          ? "bg-bone-100 text-ink-300 font-medium"
          : "text-ink-300/70 hover:text-ink-300 hover:bg-bone-50"
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-signal-500"
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-ink-300" : "text-ink-300/60"
        )}
        strokeWidth={1.75}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="text-[10px] font-mono text-ink-300/55 px-1.5 py-0.5 rounded bg-bone-100">
          {item.badge}
        </span>
      )}
      {!item.badge && (
        <ChevronRight className="h-3 w-3 text-ink-300/30" />
      )}
    </button>
  );
}
