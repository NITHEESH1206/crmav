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
  Shield,
} from "lucide-react";
import { CompanyTab } from "@/components/settings/company-tab";
import { TeamTab } from "@/components/settings/team-tab";
import { ApiKeysTab } from "@/components/settings/api-keys-tab";
import { AuditTab } from "@/components/settings/audit-tab";
import { PermissionsMatrix } from "@/components/settings/permissions-matrix";
import { IntegrationsTab } from "@/components/settings/integrations-tab";
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
          <TabsTrigger value="permissions">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Permissions
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

        <TabsContent value="permissions">
          <PermissionsMatrix />
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
                <div key={n} className="flex items-center justify-between py-2 border-b border-bone-300/45 last:border-0">
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
          <IntegrationsTab />
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
