"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Command,
  Plus,
  Sparkles,
  Settings,
  LogOut,
  User,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuickCreate } from "@/lib/stores/quick-create";
import { useAssistant } from "@/lib/stores/assistant";
import { useMobileNav } from "@/lib/stores/mobile-nav";

export function Topbar() {
  const showQuickCreate = useQuickCreate((s) => s.show);
  const showAssistant = useAssistant((s) => s.show);
  const toggleMobileNav = useMobileNav((s) => s.toggle);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 lg:px-8 pt-3">
      <div className="rounded-2xl glass-panel shadow-soft flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2.5">
        {/* Mobile: hamburger */}
        <button
          onClick={toggleMobileNav}
          aria-label="Open menu"
          className="lg:hidden h-9 w-9 shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/75 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search — input on md+, icon on mobile */}
        <div className="relative flex-1 max-w-2xl hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            placeholder="Search projects, clients, tickets, devices…"
            className="h-10 w-full rounded-xl bg-white/[0.03] border border-white/[0.06] pl-10 pr-20 text-sm text-bone-100 placeholder:text-white/35 focus:outline-none focus:border-signal-500/40 focus:ring-2 focus:ring-signal-500/15 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-white/[0.08] bg-white/[0.02] text-[10px] text-white/40 font-mono">
            <Command className="h-3 w-3" />K
          </div>
        </div>

        {/* Mobile search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="md:hidden h-9 w-9 shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Spacer to push right-side actions */}
        <div className="md:hidden flex-1" />

        {/* Desktop-only action buttons */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={showAssistant}>
            <Sparkles className="h-3.5 w-3.5 text-signal-400" />
            <span className="text-xs">Ask AI</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => showQuickCreate("todo")}>
            <Plus className="h-3.5 w-3.5" />
            <span>Create</span>
          </Button>
        </div>

        {/* Mobile-only: Ask AI as icon */}
        <button
          onClick={showAssistant}
          aria-label="Ask AI"
          className="md:hidden h-9 w-9 shrink-0 rounded-xl border border-signal-500/30 bg-signal-500/10 flex items-center justify-center text-signal-400 hover:bg-signal-500/15 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-9 w-9 shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05] transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-signal-500 ring-2 ring-ink-200 animate-pulse" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-1.5rem)] sm:w-80 max-w-[360px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { title: "PO #2147 awaiting approval", time: "2m ago" },
              { title: "SLA breach risk: Ticket #844", time: "12m ago" },
              { title: "Hilton project moved to Commissioning", time: "1h ago" },
              { title: "Inventory low: Crestron DM-NVX-360", time: "3h ago" },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="flex-col items-start gap-1">
                <div className="text-sm">{n.title}</div>
                <div className="text-[10px] text-white/35">{n.time}</div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-signal-400 hover:text-signal-300">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] pr-2 sm:pr-3 pl-1 py-1 hover:bg-white/[0.05] hover:border-white/[0.1] transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px]">MR</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium leading-tight">Marcus Reyes</div>
                <div className="text-[10px] text-white/40 leading-tight">Soundstage AV</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-normal">
                <div className="text-sm font-medium text-bone-100">Marcus Reyes</div>
                <div className="text-xs text-white/40">marcus@soundstage.av</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-3.5 w-3.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Building2 className="h-3.5 w-3.5" />
              Workspace
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-3.5 w-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 rounded-2xl glass-panel shadow-soft px-3 py-2.5"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                autoFocus
                placeholder="Search…"
                className="h-10 w-full rounded-xl bg-white/[0.03] border border-white/[0.06] pl-10 pr-10 text-sm text-bone-100 placeholder:text-white/35 focus:outline-none focus:border-signal-500/40 focus:ring-2 focus:ring-signal-500/15"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md text-white/55 hover:text-white"
                aria-label="Close search"
              >
                <X className="h-3.5 w-3.5 mx-auto" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
