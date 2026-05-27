"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { initials } from "@/lib/utils";
import { updateUserRole, inviteMember, removeMember } from "@/app/actions/settings";
import type { User } from "@prisma/client";

const ROLES = [
  { value: "OWNER",        label: "Owner",        desc: "Full access, billing, workspace settings" },
  { value: "ADMIN",        label: "Admin",        desc: "All modules + billing, no destructive workspace actions" },
  { value: "SALES",        label: "Sales",        desc: "Opportunities, accounts, proposal generation" },
  { value: "ENGINEER",     label: "Engineer",     desc: "Projects, catalog, racks, signal flow" },
  { value: "SERVICE_TECH", label: "Service Tech", desc: "Service tickets, time entries, calendar" },
  { value: "MEMBER",       label: "Member",       desc: "Read-only access across modules" },
] as const;

const ROLE_LABEL: Record<string, string> = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));

export function TeamTab({ members }: { members: User[] }) {
  const [pending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);

  function changeRole(userId: string, role: string) {
    startTransition(async () => {
      try {
        await updateUserRole({ userId, role: role as never });
        toast.success(`Role updated to ${ROLE_LABEL[role] ?? role}`);
      } catch (e) {
        toast.error("Couldn't update role", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  function remove(userId: string, name: string) {
    if (!confirm(`Remove ${name} from this workspace?`)) return;
    startTransition(async () => {
      try {
        await removeMember(userId);
        toast.success(`${name} removed`);
      } catch (e) {
        toast.error("Couldn't remove member", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  // Group members by role for a tidy list
  const grouped = ROLES.map((r) => ({
    role: r,
    users: members.filter((m) => m.role === r.value),
  })).filter((g) => g.users.length > 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Team & roles</CardTitle>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-3.5 w-3.5" />
          Invite member
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {grouped.map(({ role, users }) => (
          <div key={role.value}>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-semibold">
                {role.label}
              </div>
              <div className="text-[10px] text-white/40">{role.desc}</div>
            </div>
            <div className="space-y-1">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-[10px]">{initials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-[11px] text-white/45 truncate">{u.email}</div>
                  </div>
                  {u.jobTitle && (
                    <Badge variant="secondary" className="hidden sm:inline-flex">{u.jobTitle}</Badge>
                  )}
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={pending || u.role === "OWNER"}
                    className="h-8 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-xs text-bone-100 focus:outline-none focus:border-signal-500/40 disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(u.id, u.name)}
                    disabled={pending || u.role === "OWNER"}
                    aria-label="Remove member"
                    className="h-8 w-8 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="text-sm text-white/45 text-center py-6">No members yet.</div>
        )}
      </CardContent>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </Card>
  );
}

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<typeof ROLES[number]["value"]>("MEMBER");
  const [jobTitle, setJobTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setErr(null);
    startTransition(async () => {
      try {
        await inviteMember({ name, email, role, jobTitle: jobTitle || null });
        toast.success("Member added", { description: email });
        onOpenChange(false);
        setName("");
        setEmail("");
        setJobTitle("");
        setRole("MEMBER");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setErr(msg);
        toast.error("Couldn't add member", { description: msg });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            Adds a user record now. Real email invites land when Clerk auth is wired.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/65 mb-1.5 block">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoFocus />
            </div>
            <div>
              <label className="text-xs text-white/65 mb-1.5 block">Job title</label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Sales Engineer" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/65 mb-1.5 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
          </div>
          <div>
            <label className="text-xs text-white/65 mb-1.5 block">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-bone-100 focus:outline-none focus:border-signal-500/40"
            >
              {ROLES.filter((r) => r.value !== "OWNER").map((r) => (
                <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
              ))}
            </select>
          </div>
          {err && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" /> {err}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={pending || name.length < 2 || !email.includes("@")}>
            {pending ? "Adding…" : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
