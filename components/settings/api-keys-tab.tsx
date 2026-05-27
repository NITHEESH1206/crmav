"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { KeyRound, Copy, Check, Trash2, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { createApiKey, revokeApiKey } from "@/app/actions/settings";
import type { ApiKey } from "@prisma/client";

export function ApiKeysTab({ keys }: { keys: ApiKey[] }) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState<{ rawKey: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function create() {
    startTransition(async () => {
      try {
        const r = await createApiKey(name);
        setRevealed({ rawKey: r.rawKey, name });
        setName("");
        setOpen(false);
        toast.success("API key created");
      } catch (e) {
        toast.error("Couldn't create key", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  function revoke(id: string, keyName: string) {
    if (!confirm(`Revoke "${keyName}"? This cannot be undone and will break any service using it.`)) return;
    startTransition(async () => {
      try {
        await revokeApiKey(id);
        toast.success("API key revoked");
      } catch (e) {
        toast.error("Couldn't revoke", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>API keys</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>
          <KeyRound className="h-3.5 w-3.5" />
          Generate key
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {keys.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
            <KeyRound className="h-6 w-6 text-signal-400 mx-auto mb-2" />
            <div className="text-sm text-white/55">
              No API keys yet. Generate one to access the ZynexAV API.
            </div>
          </div>
        )}
        {keys.map((k) => (
          <div
            key={k.id}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
          >
            <div className="h-9 w-9 rounded-lg bg-signal-500/10 border border-signal-500/30 flex items-center justify-center shrink-0">
              <KeyRound className="h-4 w-4 text-signal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{k.name}</div>
              <div className="text-xs text-white/45 font-mono mt-0.5 truncate">{k.prefix}</div>
            </div>
            <div className="hidden sm:block text-[11px] text-white/40 text-right">
              {k.lastUsedAt
                ? `Used ${formatDistanceToNow(k.lastUsedAt, { addSuffix: true })}`
                : "Never used"}
              <div className="text-white/30 mt-0.5">
                Created {formatDistanceToNow(k.createdAt, { addSuffix: true })}
              </div>
            </div>
            <button
              onClick={() => revoke(k.id, k.name)}
              disabled={pending}
              aria-label="Revoke key"
              className="h-8 w-8 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </CardContent>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API key</DialogTitle>
            <DialogDescription>
              Give the key a descriptive name so you remember where it's used.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-2">
            <label className="text-xs text-white/65 mb-1.5 block">Key name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production server, Crestron sync agent, …"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={pending || name.trim().length < 2}>
              {pending ? "Generating…" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal dialog — shows full key once */}
      <Dialog open={!!revealed} onOpenChange={(v) => !v && setRevealed(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-signal-400 text-[11px] uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3" />
              New API key
            </div>
            <DialogTitle>Save this key now</DialogTitle>
            <DialogDescription>
              This is the only time we'll show the full key. Store it in your secrets manager — you can't retrieve it later.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-2 space-y-4">
            <div>
              <label className="text-xs text-white/65 mb-1.5 block">{revealed?.name}</label>
              <div className="rounded-xl border border-signal-500/40 bg-signal-500/[0.06] p-3 font-mono text-[12px] text-bone-100 break-all">
                {revealed?.rawKey}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              We only store a hash. Lose this key and you'll need to revoke and re-create it.
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => revealed && copy(revealed.rawKey)}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy key"}
            </Button>
            <Button onClick={() => setRevealed(null)}>I've saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
