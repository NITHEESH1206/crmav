"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AuditLog, User } from "@prisma/client";

type AuditEntry = AuditLog & { user: User | null };

const ACTION_LABEL: Record<string, string> = {
  "workspace.updated":   "updated workspace settings",
  "user.role_changed":   "changed a user's role",
  "user.invited":        "invited a new member",
  "user.removed":        "removed a member",
  "api_key.created":     "generated an API key",
  "api_key.revoked":     "revoked an API key",
};

const ACTION_TONE: Record<string, string> = {
  "workspace.updated": "bg-signal-500/15 text-signal-300 border-signal-500/30",
  "user.role_changed": "bg-sky-500/15 text-sky-300 border-sky-500/30",
  "user.invited":      "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "user.removed":      "bg-red-500/15 text-red-300 border-red-500/30",
  "api_key.created":   "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "api_key.revoked":   "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

function describe(entry: AuditEntry): string {
  const meta = (entry.metadata as Record<string, unknown> | null) ?? null;
  if (entry.action === "user.role_changed" && meta?.role) return `→ ${meta.role}`;
  if (entry.action === "user.invited" && meta?.email) return `${meta.email}`;
  if (entry.action === "user.removed" && meta?.email) return `${meta.email}`;
  if (entry.action === "api_key.created" && meta?.name) return `“${meta.name}”`;
  if (entry.action === "api_key.revoked" && meta?.name) return `“${meta.name}”`;
  return "";
}

export function AuditTab({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-3.5 w-3.5 text-signal-400" />
          Audit log
        </CardTitle>
        <p className="text-xs text-white/45 mt-1">
          Last {entries.length} workspace events
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="px-6 pb-8 text-center text-sm text-white/45">
            No events yet. They'll appear here as your team uses the workspace.
          </div>
        ) : (
          entries.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-[160px_1fr_120px] gap-3 px-6 py-3 border-t border-white/[0.04] hover:bg-white/[0.02]"
            >
              <div className="text-sm font-medium truncate">{e.user?.name ?? "System"}</div>
              <div className="flex items-center gap-2 min-w-0">
                <Badge className={`border h-5 px-1.5 text-[10px] ${ACTION_TONE[e.action] ?? "bg-white/[0.04] text-white/65 border-white/[0.08]"}`}>
                  {e.action}
                </Badge>
                <span className="text-sm text-white/70 truncate">
                  {ACTION_LABEL[e.action] ?? "did something"}{" "}
                  <span className="text-white/45">{describe(e)}</span>
                </span>
              </div>
              <div className="text-[11px] text-white/45 text-right">
                {formatDistanceToNow(e.createdAt, { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
