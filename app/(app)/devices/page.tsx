import { Cpu, Wifi, WifiOff, AlertTriangle, PowerOff } from "lucide-react";
import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DevicesList } from "@/components/devices/devices-list";
import { listDevices, deviceSummary } from "@/lib/data/devices";

export default async function DevicesPage() {
  const [devices, summary] = await Promise.all([listDevices(), deviceSummary()]);

  const stats = [
    { label: "Total devices", value: summary.total, icon: Cpu, tone: "text-signal-400 bg-signal-500/10 border-signal-500/30" },
    { label: "Online", value: summary.online, icon: Wifi, tone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { label: "Warning", value: summary.warning, icon: AlertTriangle, tone: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    { label: "Offline", value: summary.offline, icon: WifiOff, tone: "text-red-400 bg-red-500/10 border-red-500/30" },
    { label: "Retired", value: summary.retired, icon: PowerOff, tone: "text-ink-300/65 bg-bone-100/70 border-bone-300/65" },
  ];

  const exportRows = devices.map((d) => ({
    serial: d.serialNumber ?? "",
    model: d.catalogItem?.name ?? "",
    brand: d.catalogItem?.brand ?? "",
    sku: d.catalogItem?.sku ?? "",
    account: d.room?.account?.name ?? "",
    room: d.room?.name ?? "",
    ip: d.ipAddress ?? "",
    mac: d.macAddress ?? "",
    firmware: d.firmware ?? "",
    status: d.status,
    last_seen: d.lastSeenAt ? d.lastSeenAt.toISOString() : "",
  }));

  return (
    <ModuleShell
      eyebrow="AV Tools"
      title="Devices"
      description="Live AV equipment inventory with health, IP tracking, firmware versions, and deployment context."
      exportConfig={{
        filenamePrefix: "devices",
        rows: exportRows,
        columns: [
          { key: "serial", header: "Serial" },
          { key: "model", header: "Model" },
          { key: "brand", header: "Brand" },
          { key: "sku", header: "SKU" },
          { key: "account", header: "Account" },
          { key: "room", header: "Room" },
          { key: "ip", header: "IP address" },
          { key: "mac", header: "MAC address" },
          { key: "firmware", header: "Firmware" },
          { key: "status", header: "Status" },
          { key: "last_seen", header: "Last seen" },
        ],
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 sm:p-5">
                <div className={`h-9 w-9 rounded-xl border flex items-center justify-center mb-3 ${s.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-xs text-ink-300/55">{s.label}</div>
                <div className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
                  {s.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DevicesList devices={devices} />
    </ModuleShell>
  );
}
