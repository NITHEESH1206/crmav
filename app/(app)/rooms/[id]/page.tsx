import { notFound } from "next/navigation";
import { Building2, Server, Network, Box } from "lucide-react";
import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { RoomDetailTabs } from "@/components/rooms/room-detail-tabs";
import { getRoomDetail } from "@/lib/data/room-detail";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import type { AvCategory } from "@/lib/av/categories";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getRoomDetail(id);
  if (!room) notFound();

  // Catalog options for the add-to-room picker
  const workspaceId = await getCurrentWorkspaceId();
  const catalog = await prisma.catalogItem.findMany({
    where: { workspaceId },
    select: {
      id: true,
      name: true,
      brand: true,
      sku: true,
      category: true,
      listPriceCents: true,
    },
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });

  const sceneDevices = room.devices.map((d) => ({
    id: d.id,
    name: d.catalogItem?.name ?? "Device",
    brand: d.catalogItem?.brand ?? "—",
    sku: d.catalogItem?.sku ?? "—",
    category: (d.catalogItem?.category ?? "Accessory") as AvCategory,
  }));

  const boqAsDevices = room.boqItems
    .filter((b) => b.catalogItem)
    .map((b) => ({
      id: `boq-${b.id}`,
      name: b.catalogItem!.name,
      brand: b.catalogItem!.brand,
      sku: b.catalogItem!.sku,
      category: b.catalogItem!.category as AvCategory,
    }));

  const allDevices = [...sceneDevices, ...boqAsDevices];

  const breadcrumbs = [
    { label: "Build" },
    { label: "Rooms", href: "/rooms" },
    { label: room.name },
  ];

  return (
    <ModuleShell
      eyebrow="Room"
      title={room.name}
      breadcrumbs={breadcrumbs}
      description={
        room.account?.name
          ? `${room.account.name} · ${room.roomType.toLowerCase().replace("_", " ")}${room.capacity ? ` · ${room.capacity} seats` : ""}`
          : `${room.roomType.toLowerCase().replace("_", " ")}${room.capacity ? ` · ${room.capacity} seats` : ""}`
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Account" value={room.account?.name ?? "—"} icon={Building2} />
        <StatCard label="Devices" value={room.devices.length.toString()} icon={Box} />
        <StatCard label="Racks" value={room.racks.length.toString()} icon={Server} />
        <StatCard label="Signal flows" value={room.signalFlows.length.toString()} icon={Network} />
      </div>

      <RoomDetailTabs
        roomId={room.id}
        roomName={room.name}
        roomType={room.roomType}
        capacity={room.capacity}
        hasProject={Boolean(room.project)}
        devices={allDevices}
        persistedLength={room.lengthM ?? null}
        persistedWidth={room.widthM ?? null}
        persistedHeight={room.heightM ?? null}
        deviceRows={room.devices.map((d) => ({
          id: d.id,
          serial: d.serialNumber,
          ip: d.ipAddress,
          firmware: d.firmware,
          status: d.status,
          catalog: d.catalogItem,
        }))}
        boqRows={room.boqItems.map((b) => ({
          id: b.id,
          description: b.description,
          quantity: b.quantity,
          unitPriceCents: b.unitPriceCents,
          catalog: b.catalogItem,
        }))}
        catalog={catalog}
      />
    </ModuleShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Building2;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
          <Icon className="h-3 w-3 text-ink-300/55" />
          {label}
        </div>
        <div className="font-display text-heading-lg tracking-tight text-ink-300 mt-1 truncate">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
