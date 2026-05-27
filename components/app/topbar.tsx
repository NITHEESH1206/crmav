"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Command,
  Sparkles,
  Settings,
  LogOut,
  User,
  Building2,
  Menu,
  X,
  Sun,
  Rows3,
  Rows4,
  Check,
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
import { useAssistant } from "@/lib/stores/assistant";
import { useMobileNav } from "@/lib/stores/mobile-nav";
import { useDensity, type Density } from "@/lib/stores/density";

export function Topbar() {
  const showAssistant = useAssistant((s) => s.show);
  const toggleMobileNav = useMobileNav((s) => s.toggle);
  const density = useDensity((s) => s.density);
  const setDensity = useDensity((s) => s.setDensity);
  const [searchOpen, setSearchOpen] = useState(false);

  function openPalette() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("zynex:open-palette"));
    }
  }

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 lg:px-8 pt-3">
      <div className="rounded-lg bg-white border border-bone-300/55 flex items-center gap-2 px-2 sm:px-3 py-1.5">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileNav}
          aria-label="Open menu"
          className="lg:hidden h-8 w-8 shrink-0 rounded-md border border-bone-300/65 bg-bone-50 flex items-center justify-center text-ink-300/70 hover:text-ink-300 hover:bg-bone-100 transition-colors"
        >
          <Menu className="h-3.5 w-3.5" />
        </button>

        {/* Command palette trigger — desktop */}
        <button
          onClick={openPalette}
          className="hidden md:flex flex-1 max-w-2xl items-center gap-2 h-8 rounded-md border border-bone-300/55 bg-bone-50 px-2.5 text-[12.5px] text-ink-300/55 hover:bg-bone-100 hover:border-bone-300/80 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search projects, accounts, tickets, devices…</span>
          <span className="kbd">⌘K</span>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="md:hidden h-8 w-8 shrink-0 rounded-md border border-bone-300/65 bg-bone-50 flex items-center justify-center text-ink-300/65 hover:text-ink-300"
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        <div className="md:hidden flex-1" />

        {/* Ask AI */}
        <button
          onClick={() => showAssistant()}
          aria-label="Ask AI"
          className="h-8 px-2.5 rounded-md flex items-center gap-1.5 text-[12.5px] font-medium text-ink-300/75 hover:text-ink-300 hover:bg-bone-100 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-signal-500" strokeWidth={1.75} />
          <span className="hidden md:inline">Ask AI</span>
          <span className="hidden md:inline kbd">⌘/</span>
        </button>

        {/* Density picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Density"
              title="Display density"
              className="h-8 w-8 shrink-0 rounded-md flex items-center justify-center text-ink-300/65 hover:text-ink-300 hover:bg-bone-100"
            >
              {density === "comfortable" ? <Rows3 className="h-3.5 w-3.5" /> : <Rows4 className="h-3.5 w-3.5" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Display density</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["comfortable", "compact", "mission"] as Density[]).map((d) => (
              <DropdownMenuItem key={d} onClick={() => setDensity(d)}>
                <span className="capitalize flex-1">{d === "mission" ? "Mission control" : d}</span>
                {density === d && <Check className="h-3 w-3 text-signal-500" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Sun className="h-3.5 w-3.5" />
              Appearance settings…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Notifications"
              className="relative h-8 w-8 shrink-0 rounded-md flex items-center justify-center text-ink-300/65 hover:text-ink-300 hover:bg-bone-100"
            >
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-signal-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-1.5rem)] sm:w-96 max-w-[420px]">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <button className="text-[11px] text-ink-300/55 hover:text-ink-300">Mark all read</button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { title: "PO #2147 awaiting approval", time: "2m" },
              { title: "SLA breach risk: Ticket #844", time: "12m" },
              { title: "Hilton project moved to Commissioning", time: "1h" },
              { title: "Inventory low: Crestron DM-NVX-360", time: "3h" },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="flex-col items-start gap-0.5 py-2">
                <div className="text-[13px] text-ink-300">{n.title}</div>
                <div className="text-[10.5px] text-ink-300/45">{n.time} ago</div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-[12px] text-ink-300/70">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md hover:bg-bone-100 pl-1 pr-2 py-1 transition-colors">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">MR</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <div className="text-[12px] font-medium leading-tight text-ink-300">Marcus Reyes</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-normal">
                <div className="text-[13px] font-medium text-ink-300">Marcus Reyes</div>
                <div className="text-[11px] text-ink-300/55">marcus@soundstage.av</div>
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
              <span className="ml-auto kbd">⌘\</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Command className="h-3.5 w-3.5" />
              Command palette
              <span className="ml-auto kbd">⌘K</span>
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden mt-2 rounded-lg bg-white border border-bone-300/55 px-2 py-2"
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-300/40" />
              <input
                autoFocus
                placeholder="Search…"
                className="h-9 w-full rounded-md bg-bone-50 border border-bone-300/55 pl-8 pr-9 text-[13px] text-ink-300 placeholder:text-ink-300/45 focus:outline-none focus:border-ink-300/30"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md text-ink-300/55 hover:text-ink-300 flex items-center justify-center"
                aria-label="Close search"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
