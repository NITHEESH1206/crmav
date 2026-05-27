"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Search,
  Wifi,
  WifiOff,
  AlertTriangle,
  PowerOff,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type DeviceRow = {
  id: string;
  serialNumber: string | null;
  ipAddress: string | null;
  macAddress: string | null;
  firmware: string | null;
  status: "ONLINE" | "OFFLINE" | "WARNING" | "RETIRED";
  lastSeenAt: Date | null;
  catalogItem: { sku: string; name: string; brand: string; category: string } | null;
  room: { name: string; account: { name: string } | null; project: { name: string } | null } | null;
};

const STATUS_META: Record<
  DeviceRow["status"],
  { label: string; tone: string; icon: LucideIcon }
> = {
  ONLINE: { label: "Online", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: Wifi },
  WARNING: { label: "Warning", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30", icon: AlertTriangle },
  OFFLINE: { label: "Offline", tone: "bg-red-500/15 text-red-300 border-red-500/30", icon: WifiOff },
  RETIRED: { label: "Retired", tone: "bg-bone-100 text-ink-300/65 border-bone-300/65", icon: PowerOff },
};

const STATUS_DOT: Record<DeviceRow["status"], string> = {
  ONLINE: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  WARNING: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
  OFFLINE: "bg-red-500",
  RETIRED: "bg-white/30",
};

export function DevicesList({ devices }: { devices: DeviceRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | DeviceRow["status"]>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices.filter((d) => {
      if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.serialNumber?.toLowerCase().includes(q) ||
        d.ipAddress?.toLowerCase().includes(q) ||
        d.macAddress?.toLowerCase().includes(q) ||
        d.catalogItem?.name.toLowerCase().includes(q) ||
        d.catalogItem?.brand.toLowerCase().includes(q) ||
        d.catalogItem?.sku.toLowerCase().includes(q) ||
        d.room?.name.toLowerCase().includes(q) ||
        d.room?.account?.name.toLowerCase().includes(q) ||
        false
      );
    });
  }, [devices, query, statusFilter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Deployed devices</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {(["ALL", "ONLINE", "WARNING", "OFFLINE", "RETIRED"] as const).map((s) => {
              const active = s === statusFilter;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-2.5 h-7 rounded-md text-[11px] uppercase tracking-wider border transition-colors",
                    active
                      ? "bg-signal-500/15 border-signal-500/40 text-signal-300"
                      : "border-bone-300/65 bg-bone-50/60 text-ink-300/65 hover:text-ink-300"
                  )}
                >
                  {s === "ALL" ? "All" : STATUS_META[s].label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-300/50" />
          <Input
            placeholder="Search by serial, IP, MAC, model, brand, room…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_140px_120px_140px_100px] text-[10px] uppercase tracking-wider text-ink-300/50 px-5 py-3 border-y border-bone-300/45">
          <div>Device</div>
          <div>Room / Site</div>
          <div>IP address</div>
          <div>Firmware</div>
          <div>Last seen</div>
          <div>Status</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-300/55">
            No devices match your filters.
          </div>
        ) : (
          filtered.map((d, i) => {
            const meta = STATUS_META[d.status];
            const StatusIcon = meta.icon;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_140px_120px_140px_100px] items-start md:items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 border-b border-bone-300/45 hover:bg-bone-50/50 transition-colors"
              >
                {/* Device cell */}
                <div className="min-w-0 flex items-start gap-2.5">
                  <div className="relative shrink-0 mt-0.5">
                    <div className="h-9 w-9 rounded-lg bg-signal-500/10 border border-signal-500/30 flex items-center justify-center">
                      <Cpu className="h-4 w-4 text-signal-400" />
                    </div>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                        STATUS_DOT[d.status]
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {d.catalogItem?.name ?? "Unknown device"}
                    </div>
                    <div className="text-[11px] text-ink-300/55 truncate font-mono">
                      {d.serialNumber ?? "no serial"}
                    </div>
                    {/* Mobile-only meta strip */}
                    <div className="md:hidden mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-300/65">
                      {d.room && (
                        <>
                          <Building2 className="h-3 w-3" />
                          <span>{d.room.account?.name ?? "—"}</span>
                          <span>·</span>
                          <span className="truncate">{d.room.name}</span>
                        </>
                      )}
                      {d.ipAddress && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{d.ipAddress}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room/Site (desktop) */}
                <div className="hidden md:block min-w-0">
                  <div className="text-sm truncate">{d.room?.account?.name ?? "—"}</div>
                  <div className="text-[11px] text-ink-300/55 truncate">{d.room?.name ?? "—"}</div>
                </div>

                {/* IP */}
                <div className="hidden md:block text-xs font-mono text-ink-300/75">
                  {d.ipAddress ?? "—"}
                </div>

                {/* Firmware */}
                <div className="hidden md:block text-xs font-mono text-ink-300/55">
                  {d.firmware ?? "—"}
                </div>

                {/* Last seen */}
                <div className="hidden md:block text-xs text-ink-300/55">
                  {d.lastSeenAt
                    ? d.status === "RETIRED"
                      ? "Retired"
                      : formatDistanceToNow(d.lastSeenAt, { addSuffix: true })
                    : "—"}
                </div>

                {/* Status */}
                <div className="self-start md:self-center">
                  <Badge className={cn("border gap-1", meta.tone)}>
                    <StatusIcon className="h-3 w-3" />
                    {meta.label}
                  </Badge>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
