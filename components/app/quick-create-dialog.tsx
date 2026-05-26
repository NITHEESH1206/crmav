"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Target, LifeBuoy, FolderKanban, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createTodo, createOpportunity, createTicket, createProject } from "@/app/actions/create";
import { cn } from "@/lib/utils";

type Lookups = {
  accounts: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  users: { id: string; name: string }[];
};

export function QuickCreateDialog({
  open,
  onOpenChange,
  lookups,
  defaultTab = "todo",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lookups: Lookups;
  defaultTab?: "todo" | "opportunity" | "ticket" | "project";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-signal-400 text-[11px] uppercase tracking-[0.2em]">
            <Sparkles className="h-3 w-3" />
            Quick create
          </div>
          <DialogTitle>What would you like to create?</DialogTitle>
          <DialogDescription>
            Persists straight to your Neon database. Lists update automatically.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="px-6 pb-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="todo" className="gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> Task
            </TabsTrigger>
            <TabsTrigger value="opportunity" className="gap-1.5">
              <Target className="h-3.5 w-3.5" /> Deal
            </TabsTrigger>
            <TabsTrigger value="ticket" className="gap-1.5">
              <LifeBuoy className="h-3.5 w-3.5" /> Ticket
            </TabsTrigger>
            <TabsTrigger value="project" className="gap-1.5">
              <FolderKanban className="h-3.5 w-3.5" /> Project
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo">
            <TodoForm onDone={() => onOpenChange(false)} lookups={lookups} />
          </TabsContent>
          <TabsContent value="opportunity">
            <OpportunityForm onDone={() => onOpenChange(false)} lookups={lookups} />
          </TabsContent>
          <TabsContent value="ticket">
            <TicketForm onDone={() => onOpenChange(false)} lookups={lookups} />
          </TabsContent>
          <TabsContent value="project">
            <ProjectForm onDone={() => onOpenChange(false)} lookups={lookups} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs text-white/65 mb-1.5 block">{children}</label>;
}

function FormError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
      <AlertCircle className="h-3.5 w-3.5" />
      {msg}
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white focus:outline-none focus:border-signal-500/50 focus:ring-2 focus:ring-signal-500/20"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

const PRIORITY_OPTIONS = [
  { value: "P1", label: "P1 — Urgent" },
  { value: "P2", label: "P2 — High" },
  { value: "P3", label: "P3 — Normal" },
  { value: "P4", label: "P4 — Low" },
];

function TodoForm({ onDone, lookups }: { onDone: () => void; lookups: Lookups }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"P1" | "P2" | "P3" | "P4">("P3");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createTodo({ title, priority, dueDate: dueDate || null, projectId: projectId || null, assigneeId: assigneeId || null });
        toast.success("Task created", { description: title });
        onDone();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create task";
        setError(msg);
        toast.error("Couldn't create task", { description: msg });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Title</FieldLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Schedule commissioning walkthrough" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Priority</FieldLabel>
          <Select value={priority} onChange={(v) => setPriority(v as "P1" | "P2" | "P3" | "P4")}>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Due date</FieldLabel>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Project</FieldLabel>
          <Select value={projectId} onChange={setProjectId} placeholder="—">
            {lookups.projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Assignee</FieldLabel>
          <Select value={assigneeId} onChange={setAssigneeId} placeholder="—">
            {lookups.users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </div>
      </div>
      <FormError msg={error} />
      <DialogFooter className="px-0">
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={isPending || title.length < 2}>
          {isPending ? "Creating…" : "Create task"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function OpportunityForm({ onDone, lookups }: { onDone: () => void; lookups: Lookups }) {
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [valueDollars, setValueDollars] = useState("");
  const [stage, setStage] = useState<"DISCOVERY" | "PROPOSAL" | "NEGOTIATION">("DISCOVERY");
  const [ownerId, setOwnerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createOpportunity({
          name,
          accountId,
          valueCents: Math.round(parseFloat(valueDollars || "0") * 100),
          stage,
          ownerId: ownerId || null,
        });
        toast.success("Deal created", { description: name });
        onDone();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create opportunity";
        setError(msg);
        toast.error("Couldn't create deal", { description: msg });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Deal name</FieldLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nexus HQ — Phase 3" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Account</FieldLabel>
          <Select value={accountId} onChange={setAccountId} placeholder="Pick an account">
            {lookups.accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Deal value (USD)</FieldLabel>
          <Input type="number" value={valueDollars} onChange={(e) => setValueDollars(e.target.value)} placeholder="184000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Stage</FieldLabel>
          <Select value={stage} onChange={(v) => setStage(v as "DISCOVERY" | "PROPOSAL" | "NEGOTIATION")}>
            <option value="DISCOVERY">Discovery</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Owner</FieldLabel>
          <Select value={ownerId} onChange={setOwnerId} placeholder="—">
            {lookups.users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </div>
      </div>
      <FormError msg={error} />
      <DialogFooter className="px-0">
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={isPending || name.length < 2 || !accountId}>
          {isPending ? "Creating…" : "Create deal"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function TicketForm({ onDone, lookups }: { onDone: () => void; lookups: Lookups }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [priority, setPriority] = useState<"P1" | "P2" | "P3" | "P4">("P3");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createTicket({ title, description, accountId, priority, assigneeId: assigneeId || null });
        toast.success("Ticket created", { description: title });
        onDone();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create ticket";
        setError(msg);
        toast.error("Couldn't create ticket", { description: msg });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Title</FieldLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="DSP offline after firmware update" autoFocus />
      </div>
      <div>
        <FieldLabel>Description (optional)</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Symptoms, room, what's been tried…"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-signal-500/50 focus:ring-2 focus:ring-signal-500/20 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Account</FieldLabel>
          <Select value={accountId} onChange={setAccountId} placeholder="Pick an account">
            {lookups.accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Priority</FieldLabel>
          <Select value={priority} onChange={(v) => setPriority(v as "P1" | "P2" | "P3" | "P4")}>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <FieldLabel>Assignee</FieldLabel>
        <Select value={assigneeId} onChange={setAssigneeId} placeholder="Unassigned">
          {lookups.users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
      </div>
      <FormError msg={error} />
      <DialogFooter className="px-0">
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={isPending || title.length < 2 || !accountId}>
          {isPending ? "Creating…" : "Create ticket"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function ProjectForm({ onDone, lookups }: { onDone: () => void; lookups: Lookups }) {
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [valueDollars, setValueDollars] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createProject({
          name,
          accountId,
          contractValueCents: Math.round(parseFloat(valueDollars || "0") * 100),
          dueDate: dueDate || null,
        });
        toast.success("Project created", { description: name });
        onDone();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create project";
        setError(msg);
        toast.error("Couldn't create project", { description: msg });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Project name</FieldLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hilton — Restaurant AV refresh" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Account</FieldLabel>
          <Select value={accountId} onChange={setAccountId} placeholder="Pick an account">
            {lookups.accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Contract value (USD)</FieldLabel>
          <Input type="number" value={valueDollars} onChange={(e) => setValueDollars(e.target.value)} placeholder="184000" />
        </div>
      </div>
      <div>
        <FieldLabel>Due date (optional)</FieldLabel>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <FormError msg={error} />
      <DialogFooter className="px-0">
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={isPending || name.length < 2 || !accountId}>
          {isPending ? "Creating…" : "Create project"}
        </Button>
      </DialogFooter>
    </div>
  );
}
