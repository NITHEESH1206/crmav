"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, FileSignature, Copy, Check, RefreshCcw, X } from "lucide-react";
import { useAIStream, StreamingText } from "@/components/ai/streaming-text";
import { Skeleton } from "@/components/ui/skeleton";

export function ProposalDialog({
  opportunityId,
  opportunityName,
  open,
  onOpenChange,
}: {
  opportunityId: string;
  opportunityName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { text, state, error, run, cancel, reset } = useAIStream("/api/ai/proposal");
  const [copied, setCopied] = useState(false);

  const start = () => run({ opportunityId });

  // Auto-start when opened the first time
  if (open && state === "idle" && !text) {
    start();
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          cancel();
          reset();
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center gap-2 text-signal-400 text-[11px] uppercase tracking-[0.2em]">
            <Sparkles className="h-3 w-3" />
            AI Proposal Generator
          </div>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-signal-400" />
            <span>Proposal for {opportunityName}</span>
          </DialogTitle>
          <DialogDescription>
            Drafted by Claude Opus 4.7 with AV-industry context. Review carefully before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[300px]">
          {state === "idle" && !text && (
            <div className="space-y-3 py-8 text-center">
              <Sparkles className="h-8 w-8 text-signal-400 mx-auto" />
              <div className="text-sm text-white/55">Click below to draft a proposal.</div>
            </div>
          )}

          {state === "streaming" && text === "" && (
            <div className="space-y-3 py-6">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="text-xs text-white/45 mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-500 animate-pulse" />
                Thinking through pricing, timeline, and technical approach…
              </div>
            </div>
          )}

          {text && (
            <StreamingText text={text} state={state} />
          )}

          {state === "error" && (
            <div className="text-sm text-red-400 mt-4">{error}</div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 border-t border-white/[0.06] pt-4">
          {state === "streaming" ? (
            <Button variant="ghost" size="sm" onClick={cancel}>
              <X className="h-3.5 w-3.5" />
              Stop
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {text && (
                <>
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={start}>
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                </>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
