import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wifi, MonitorPlay, Plug, Cloud, MessageSquare } from "lucide-react";
import { isRazorpayConfigured } from "@/lib/razorpay/client";

/**
 * Settings → Integrations.
 *
 * Razorpay is a real, live integration — its tile reflects actual env-var
 * state. Everything else is a placeholder until those connectors get wired.
 */

const STATIC_INTEGRATIONS = [
  { name: "Crestron Fusion",       icon: MonitorPlay, status: "available" as const, desc: "Device list · uptime · alarms" },
  { name: "Q-SYS Reflect",         icon: MonitorPlay, status: "available" as const, desc: "DSP status · audio levels" },
  { name: "Extron GVE",            icon: MonitorPlay, status: "available" as const, desc: "Switcher routes · room presence" },
  { name: "Biamp SageVue",         icon: MonitorPlay, status: "available" as const, desc: "Tesira state · firmware" },
  { name: "Microsoft Teams Rooms", icon: Wifi,        status: "available" as const, desc: "Room scheduling" },
  { name: "Zoom Rooms",            icon: Wifi,        status: "available" as const, desc: "Meeting telemetry" },
  { name: "QuickBooks Online",     icon: Cloud,       status: "available" as const, desc: "Invoice + ledger sync" },
  { name: "Slack",                 icon: MessageSquare, status: "available" as const, desc: "Alerts to channels" },
];

export function IntegrationsTab() {
  const razorpay = isRazorpayConfigured();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Razorpay — live integration */}
      <Card interactive className="overflow-hidden">
        <div className="absolute top-0 left-3 right-3 h-px" style={{
          background: "linear-gradient(90deg, transparent, rgba(255,90,31,0.5), transparent)"
        }} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-xl bg-signal-500/15 border border-signal-500/25 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
                <CreditCard className="h-4 w-4 text-signal-700" strokeWidth={2} />
              </span>
              <div>
                <div className="text-[14px] font-medium text-ink-300">Razorpay</div>
                <div className="text-[11px] text-ink-300/55 mt-0.5">Payment links + webhooks</div>
              </div>
            </div>
            <Badge variant={razorpay ? "success" : "warning"}>
              {razorpay ? "Connected" : "Setup needed"}
            </Badge>
          </div>

          {razorpay ? (
            <p className="text-[12px] text-ink-300/65">
              Clients can pay invoices directly from the portal. Status updates via webhook within seconds.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[12px] text-ink-300/65">
                Add these to <span className="font-mono">.env.local</span>, then restart:
              </p>
              <pre className="rounded-md bg-ink-300 text-bone-100 px-3 py-2 text-[10.5px] font-mono leading-relaxed overflow-x-auto">
{`RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx`}
              </pre>
              <p className="text-[11px] text-ink-300/50">
                Get keys at <span className="font-mono">dashboard.razorpay.com/app/keys</span>. Configure the webhook (signed with the secret) to point at <span className="font-mono">/api/webhooks/razorpay</span>.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* The rest — coming-soon placeholders */}
      {STATIC_INTEGRATIONS.map((i) => {
        const Icon = i.icon;
        return (
          <Card key={i.name} interactive>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="h-9 w-9 rounded-xl bg-bone-100 border border-bone-300/55 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-ink-300/65" strokeWidth={1.75} />
                  </span>
                  <div>
                    <div className="text-[14px] font-medium text-ink-300">{i.name}</div>
                    <div className="text-[11px] text-ink-300/55 mt-0.5">{i.desc}</div>
                  </div>
                </div>
                <Badge variant="secondary">Available</Badge>
              </div>
              <p className="text-[11px] text-ink-300/50 mt-2">
                Not configured.
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
