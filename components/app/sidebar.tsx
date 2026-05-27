"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsLeft, Plus, ChevronRight, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_GROUPS, type NavItem, type NavGroup } from "@/lib/nav";
import { useQuickCreate } from "@/lib/stores/quick-create";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const showQuickCreate = useQuickCreate((s) => s.show);

  // Group items once
  const { pinned, grouped, workspace } = useMemo(() => {
    const pinned = NAV_ITEMS.filter((i) => i.group === "Pinned");
    const workspace = NAV_ITEMS.filter((i) => i.group === "Workspace");
    const grouped: Record<NavGroup, NavItem[]> = {} as Record<NavGroup, NavItem[]>;
    for (const g of NAV_GROUPS) {
      grouped[g] = NAV_ITEMS.filter((i) => i.group === g);
    }
    return { pinned, grouped, workspace };
  }, []);

  // Auto-expand the group containing the active route
  const activeGroup = useMemo<NavGroup | null>(() => {
    const match = NAV_ITEMS.find(
      (i) => pathname === i.href || (i.href !== "/dashboard" && pathname.startsWith(i.href))
    );
    return (match?.group as NavGroup) ?? null;
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Set<NavGroup>>(
    () => new Set<NavGroup>(activeGroup ? [activeGroup] : ["Sell"])
  );

  const toggleGroup = (g: NavGroup) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) {
        next.delete(g);
      } else {
        next.add(g);
      }
      return next;
    });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col transition-[width] duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[244px]"
      )}
    >
      <div className="relative m-2 mr-0 flex h-[calc(100vh-16px)] flex-col rounded-lg bg-white border border-bone-300/60 overflow-hidden">
        {/* ── Workspace switcher row ── */}
        <button
          type="button"
          className="flex items-center justify-between gap-2 px-3 py-3 border-b border-bone-300/55 hover:bg-bone-50/70 transition-colors"
          aria-label="Switch workspace"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-md bg-ink-300 text-bone-100 flex items-center justify-center text-[11px] font-bold shrink-0">
              SA
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed && (
                <motion.div
                  key="ws-label"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 text-left"
                >
                  <div className="text-[13px] font-semibold text-ink-300 truncate leading-tight">
                    Soundstage AV
                  </div>
                  <div className="text-[10.5px] text-ink-300/55 leading-tight">Workspace · ⌘\</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!collapsed && <ChevronRight className="h-3.5 w-3.5 text-ink-300/40 shrink-0" />}
        </button>

        {/* ── Search / palette trigger ── */}
        <div className="px-2 pt-2">
          <button
            type="button"
            className={cn(
              "w-full flex items-center gap-2 rounded-md border border-bone-300/55 bg-bone-50 px-2.5 py-1.5 text-[12.5px] text-ink-300/55 hover:bg-bone-100 hover:border-bone-300/80 transition-colors",
              collapsed && "justify-center px-0"
            )}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Search…</span>
                <span className="kbd">⌘K</span>
              </>
            )}
          </button>
        </div>

        {/* ── Pinned (Dashboard + Calendar) ── */}
        <div className="px-2 pt-2 pb-1">
          <div className="space-y-0.5">
            {pinned.map((item) => (
              <NavRow key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </div>
        </div>

        {/* ── Quick create ── */}
        <div className="px-2 pb-1">
          <button
            type="button"
            onClick={() => showQuickCreate("todo")}
            className={cn(
              "w-full flex items-center gap-2 rounded-md bg-ink-300 text-bone-100 px-2.5 py-1.5 text-[12.5px] font-medium hover:bg-ink-200 transition-colors",
              collapsed && "justify-center px-0"
            )}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">New</span>
                <span className="kbd">N</span>
              </>
            )}
          </button>
        </div>

        {/* ── Grouped nav ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
          {NAV_GROUPS.map((group) => {
            const items = grouped[group];
            if (!items || items.length === 0) return null;
            const isOpen = collapsed ? true : openGroups.has(group);
            return (
              <div key={group} className="mb-1">
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="w-full flex items-center justify-between px-2 pt-3 pb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/45 font-semibold hover:text-ink-300/70 transition-colors"
                  >
                    <span>{group}</span>
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </button>
                )}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="group-items"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 pt-0.5">
                        {items.map((item) => (
                          <NavRow
                            key={item.href}
                            item={item}
                            pathname={pathname}
                            collapsed={collapsed}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* ── Workspace (bottom) ── */}
        <div className="border-t border-bone-300/55 px-2 py-2">
          <div className="space-y-0.5">
            {workspace.map((item) => (
              <NavRow key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </div>
        </div>

        {/* ── Collapse toggle ── */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-16 h-6 w-6 rounded-full bg-white border border-bone-300/65 flex items-center justify-center text-ink-300/55 hover:text-ink-300 hover:border-bone-300/85 transition-colors shadow-[0_2px_6px_-2px_rgba(10,10,10,0.12)]"
          aria-label="Toggle sidebar"
        >
          <ChevronsLeft
            className={cn("h-3 w-3 transition-transform duration-200", collapsed && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}

function NavRow({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-bone-100 text-ink-300 font-medium"
          : "text-ink-300/65 hover:text-ink-300 hover:bg-bone-50"
      )}
      title={collapsed ? item.label : undefined}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-signal-500"
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-ink-300" : "text-ink-300/55 group-hover:text-ink-300/85"
        )}
        strokeWidth={1.75}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] font-mono text-ink-300/55 px-1.5 py-0.5 rounded bg-bone-100 group-hover:bg-bone-200/80">
              {item.badge}
            </span>
          )}
          {!item.badge && item.hint && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-ink-300/40">
              {item.hint}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
