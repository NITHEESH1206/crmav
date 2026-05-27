"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Boxes, Server, Network, Layers3, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { generateBOQForRoom } from "@/app/actions/rooms";

type Room = {
  id: string;
  name: string;
  roomType: string;
  capacity: number | null;
  account: { name: string } | null;
  project: { name: string; phase: string } | null;
  _count: { devices: number; boqItems: number; racks: number; signalFlows: number };
};

const TYPE_TINT: Record<string, string> = {
  BOARDROOM: "from-signal-500/20 to-signal-500/[0.04]",
  HUDDLE: "from-emerald-500/20 to-emerald-500/[0.04]",
  TRAINING: "from-sky-500/20 to-sky-500/[0.04]",
  STUDIO: "from-violet-500/20 to-violet-500/[0.04]",
  AUDITORIUM: "from-amber-500/20 to-amber-500/[0.04]",
  LOBBY: "from-pink-500/20 to-pink-500/[0.04]",
  COMMAND_CENTER: "from-red-500/20 to-red-500/[0.04]",
  OTHER: "from-white/[0.06] to-transparent",
};

export function RoomCard({ room, index }: { room: Room; index: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; added?: number; error?: string; message?: string } | null>(null);

  const tint = TYPE_TINT[room.roomType] ?? TYPE_TINT.OTHER;
  const hasProject = !!room.project;

  function genBOQ() {
    setResult(null);
    startTransition(async () => {
      const r = await generateBOQForRoom(room.id);
      setResult(r);
      if (r.ok) {
        if ((r.added ?? 0) > 0) {
          toast.success(`Added ${r.added} BOQ items`, {
            description: `${room.project?.name ?? room.name}`,
          });
        } else {
          toast.info("BOQ already up to date", {
            description: r.message,
          });
        }
      } else {
        toast.error("Couldn't generate BOQ", { description: r.error });
      }
      setTimeout(() => setResult(null), 4000);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Card className="overflow-hidden hover-lift cursor-pointer group">
        <div className={`aspect-[16/9] relative bg-gradient-to-br ${tint} border-b border-bone-300/55`}>
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Layers3 className="h-14 w-14 text-ink-300/35 group-hover:text-signal-400/60 transition-colors" strokeWidth={1.2} />
          </div>
          <Badge variant="secondary" className="absolute top-3 left-3 capitalize text-[10px]">
            {room.roomType.toLowerCase().replace("_", " ")}
          </Badge>
          {room.capacity && (
            <Badge variant="outline" className="absolute top-3 right-3 text-[10px]">
              {room.capacity} seats
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="text-sm font-medium leading-tight">{room.name}</div>
          <div className="text-[11px] text-ink-300/55 mt-0.5 truncate">
            {room.account?.name ?? "Unassigned"}
            {room.project?.name && ` · ${room.project.name}`}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
            <Stat icon={Boxes} value={room._count.devices} label="Dev." />
            <Stat icon={Layers3} value={room._count.boqItems} label="BOQ" />
            <Stat icon={Server} value={room._count.racks} label="Rack" />
            <Stat icon={Network} value={room._count.signalFlows} label="Flow" />
          </div>

          <div className="mt-3 pt-3 border-t border-bone-300/55">
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              disabled={isPending || !hasProject}
              onClick={genBOQ}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isPending ? "Generating…" : hasProject ? "Generate BOQ" : "No project linked"}
            </Button>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-2 flex items-center gap-1.5 text-[11px] ${
                  result.ok ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {result.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {result.ok
                  ? result.added && result.added > 0
                    ? `+${result.added} BOQ items added`
                    : result.message ?? "Up to date"
                  : result.error}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-md border border-bone-300/55 bg-bone-50/60 py-1.5">
      <Icon className="h-3 w-3 mx-auto text-signal-400" />
      <div className="text-xs font-mono mt-0.5">{value}</div>
      <div className="text-[9px] text-ink-300/50">{label}</div>
    </div>
  );
}
