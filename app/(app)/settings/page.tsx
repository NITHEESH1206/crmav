"use client";

import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Bell,
  KeyRound,
  Plug,
  History,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <ModuleShell
      eyebrow="Settings"
      title="Workspace"
      description="Branding, roles, integrations, notifications, API keys, audit logs."
    >
      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Company
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Team & roles
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="h-3.5 w-3.5 mr-1.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="api">
            <KeyRound className="h-3.5 w-3.5 mr-1.5" />
            API keys
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="h-3.5 w-3.5 mr-1.5" />
            Audit log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company branding</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-white/55 mb-2 block">Company name</label>
                <Input defaultValue="Soundstage Integration LLC" />
              </div>
              <div>
                <label className="text-xs text-white/55 mb-2 block">Trading currency</label>
                <Input defaultValue="USD" />
              </div>
              <div>
                <label className="text-xs text-white/55 mb-2 block">Primary contact email</label>
                <Input defaultValue="ops@soundstage.av" />
              </div>
              <div>
                <label className="text-xs text-white/55 mb-2 block">Time zone</label>
                <Input defaultValue="America/New_York" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader><CardTitle>Roles & permissions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { role: "Owner", members: 1, perms: "Full access" },
                { role: "Admin", members: 4, perms: "All modules + billing" },
                { role: "Sales", members: 8, perms: "Opportunities, Accounts" },
                { role: "Engineer", members: 12, perms: "Projects, Catalog, Catalog edit" },
                { role: "Service Tech", members: 14, perms: "Service tickets, Time" },
              ].map((r) => (
                <div key={r.role} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{r.role}</div>
                    <div className="text-xs text-white/45 mt-0.5">{r.perms}</div>
                  </div>
                  <Badge variant="secondary">{r.members} members</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-6 space-y-3">
              {[
                "SLA breach risk on service tickets",
                "Project moved between phases",
                "Inventory low-stock alerts",
                "PO approvals required",
                "Daily revenue digest",
              ].map((n) => (
                <div key={n} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-sm">{n}</span>
                  <div className="flex gap-2">
                    <Badge variant="success">Email</Badge>
                    <Badge>In-app</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Crestron Fusion", status: "Connected" },
              { name: "Q-SYS Reflect", status: "Connected" },
              { name: "Extron GVE", status: "Connected" },
              { name: "Microsoft Teams Rooms", status: "Connected" },
              { name: "Zoom Rooms", status: "Available" },
              { name: "QuickBooks", status: "Available" },
              { name: "Stripe", status: "Connected" },
              { name: "Slack", status: "Available" },
            ].map((i) => (
              <Card key={i.name} className="hover-lift">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{i.name}</div>
                    <div className="text-[11px] text-white/45 mt-0.5">{i.status === "Connected" ? "Active" : "Not configured"}</div>
                  </div>
                  <Badge variant={i.status === "Connected" ? "success" : "secondary"}>
                    {i.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader><CardTitle>API keys</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Production server", prefix: "ak_live_8c9f…b720", used: "2m ago" },
                { name: "Crestron sync agent", prefix: "ak_live_44a1…df09", used: "1h ago" },
                { name: "Mobile app — staging", prefix: "ak_test_91e2…7c14", used: "12d ago" },
              ].map((k) => (
                <div key={k.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{k.name}</div>
                    <div className="text-xs text-white/45 font-mono mt-0.5">{k.prefix}</div>
                  </div>
                  <div className="text-[11px] text-white/45">Used {k.used}</div>
                </div>
              ))}
              <Button className="w-full mt-2">
                <Sparkles className="h-3.5 w-3.5" />
                Generate new key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle>Audit log</CardTitle></CardHeader>
            <CardContent className="p-0">
              {[
                { who: "Marcus R.", action: "approved PO-2147 ($14,820)", when: "2m ago" },
                { who: "Lena R.", action: "closed ticket #832 (AMC visit, 1h 18m)", when: "44m ago" },
                { who: "System", action: "auto-converted quote D-188 to project (Westin DSP)", when: "1h ago" },
                { who: "Priya M.", action: "uploaded DSP file q-sys-bldg-c-r4.qsys", when: "2h ago" },
                { who: "Hannah K.", action: "received shipment SH-1182 to Warehouse 02", when: "3h ago" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-[140px_1fr_120px] gap-3 px-5 py-3 border-b border-white/[0.04]">
                  <div className="text-sm font-medium">{row.who}</div>
                  <div className="text-sm text-white/70">{row.action}</div>
                  <div className="text-[11px] text-white/45 text-right">{row.when}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
}
