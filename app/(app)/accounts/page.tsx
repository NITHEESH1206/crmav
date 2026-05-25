import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, MessageSquare, FileText } from "lucide-react";
import { initials, formatCompact } from "@/lib/utils";
import { listAccounts, accountsSummary } from "@/lib/data/accounts";
import { OpenableRow } from "@/components/app/openable";

export default async function AccountsPage() {
  const [accounts, summary] = await Promise.all([listAccounts(), accountsSummary()]);

  return (
    <ModuleShell
      eyebrow="Accounts"
      title="Customer Accounts"
      description="Company hierarchy, contacts, communication history, and document repository."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Accounts", v: summary.accounts.toLocaleString(), icon: Building2 },
          { l: "Contacts", v: summary.contacts.toLocaleString(), icon: Users },
          { l: "Active conversations", v: "62", icon: MessageSquare },
          { l: "Documents", v: "3,284", icon: FileText },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.l}>
              <CardContent className="p-5">
                <div className="h-10 w-10 rounded-xl border bg-aether-500/10 border-aether-500/30 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-aether-400" />
                </div>
                <div className="text-xs text-white/45">{s.l}</div>
                <div className="font-display text-3xl font-semibold tracking-tight mt-1">{s.v}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Top accounts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[2fr_1fr_80px_80px_120px_100px] text-[10px] uppercase tracking-wider text-white/40 px-5 py-3 border-y border-white/[0.04]">
            <div>Account</div>
            <div>Tier</div>
            <div>Contacts</div>
            <div>Projects</div>
            <div>Lifetime value</div>
            <div>Health</div>
          </div>
          {accounts.map((a) => (
            <OpenableRow
              key={a.id}
              kind="account"
              id={a.id}
              className="grid grid-cols-[2fr_1fr_80px_80px_120px_100px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.015]"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarFallback className="rounded-lg from-aether-500 to-aether-700">{initials(a.name)}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium truncate">{a.name}</div>
              </div>
              <div><Badge variant={a.tier === "ENTERPRISE" ? "default" : "secondary"}>{a.tier.toLowerCase()}</Badge></div>
              <div className="text-sm font-mono">{a._count.contacts}</div>
              <div className="text-sm font-mono">{a._count.projects}</div>
              <div className="text-sm font-mono">${formatCompact(a.ltvCents / 100)}</div>
              <div className="text-sm text-emerald-400 font-mono">{a.healthScore}%</div>
            </OpenableRow>
          ))}
        </CardContent>
      </Card>
    </ModuleShell>
  );
}
