import { ModuleShell } from "@/components/app/module-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Bell,
  KeyRound,
  Plug,
  History,
} from "lucide-react";
import { CompanyTab } from "@/components/settings/company-tab";
import { TeamTab } from "@/components/settings/team-tab";
import { ApiKeysTab } from "@/components/settings/api-keys-tab";
import { AuditTab } from "@/components/settings/audit-tab";
import {
  getWorkspace,
  listWorkspaceMembers,
  listApiKeys,
  listAuditLog,
} from "@/lib/data/settings";
import { notFound } from "next/navigation";

export default async function SettingsPage() {
  const [workspace, members, keys, audit] = await Promise.all([
    getWorkspace(),
    listWorkspaceMembers(),
    listApiKeys(),
    listAuditLog(50),
  ]);

  if (!workspace) notFound();

  return (
    <ModuleShell
      eyebrow="Settings"
      title="Workspace"
      description="Branding, roles, integrations, notifications, API keys, audit logs."
    >
      <Tabs defaultValue="company">
        <TabsList className="overflow-x-auto max-w-full">
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
          <CompanyTab workspace={workspace} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab members={members} />
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
                    <div className="text-[11px] text-white/45 mt-0.5">
                      {i.status === "Connected" ? "Active" : "Not configured"}
                    </div>
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
          <ApiKeysTab keys={keys} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab entries={audit} />
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
}
