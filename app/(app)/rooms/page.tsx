import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { RoomCard } from "@/components/rooms/room-card";
import { listRooms } from "@/lib/data/rooms";
import { Building2, Boxes, Server, Network } from "lucide-react";

export default async function RoomsPage() {
  const rooms = await listRooms();

  const stats = [
    { l: "Total rooms", v: rooms.length.toString(), icon: Building2 },
    {
      l: "Devices configured",
      v: rooms.reduce((s, r) => s + r._count.devices, 0).toString(),
      icon: Boxes,
    },
    {
      l: "Racks designed",
      v: rooms.reduce((s, r) => s + r._count.racks, 0).toString(),
      icon: Server,
    },
    {
      l: "Signal flows",
      v: rooms.reduce((s, r) => s + r._count.signalFlows, 0).toString(),
      icon: Network,
    },
  ];

  return (
    <ModuleShell
      eyebrow="AV Tools"
      title="Rooms"
      description="Configure each AV space room-by-room. Devices, racks, signal flows, and one-click BOQ generation."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.l}>
              <CardContent className="p-5">
                <div className="h-10 w-10 rounded-xl border bg-signal-500/10 border-signal-500/30 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-signal-400" />
                </div>
                <div className="text-xs text-ink-300/55">{s.l}</div>
                <div className="font-display text-3xl font-semibold tracking-tight mt-1">{s.v}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((r, i) => (
          <RoomCard key={r.id} room={r} index={i} />
        ))}
      </div>
      {rooms.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-sm text-ink-300/55">
            No rooms yet. Add one from a project to start configuring AV equipment.
          </CardContent>
        </Card>
      )}
    </ModuleShell>
  );
}
