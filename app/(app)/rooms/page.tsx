import { Building2, Boxes, Server, Network, Layers3 } from "lucide-react";
import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { RoomCard } from "@/components/rooms/room-card";
import { NewRoomTrigger } from "@/components/rooms/new-room-trigger";
import { listRooms } from "@/lib/data/rooms";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";

export default async function RoomsPage() {
  const workspaceId = await getCurrentWorkspaceId();
  const [rooms, projects, accounts] = await Promise.all([
    listRooms(),
    prisma.project.findMany({
      where: { workspaceId, status: { in: ["ACTIVE"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.account.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

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
      description="Configure each AV space room-by-room. Devices, racks, signal flows, and a 3D view of every room."
      actions={<NewRoomTrigger projects={projects} accounts={accounts} />}
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

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-10 h-10 rounded-md bg-bone-100 border border-bone-300/55 flex items-center justify-center mb-3">
              <Layers3 className="h-4 w-4 text-ink-300/55" />
            </div>
            <p className="text-[13px] text-ink-300/75 mb-1">No rooms yet.</p>
            <p className="text-[12px] text-ink-300/55 mb-4 max-w-md mx-auto">
              Create a room to start populating it with devices from the catalog and visualising
              the AV setup in 3D.
            </p>
            <div className="inline-flex">
              <NewRoomTrigger
                projects={projects}
                accounts={accounts}
                label="Create your first room"
                size="default"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((r, i) => (
            <RoomCard key={r.id} room={r} index={i} />
          ))}
        </div>
      )}
    </ModuleShell>
  );
}
