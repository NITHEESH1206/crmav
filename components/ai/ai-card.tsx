"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCcw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIStream, StreamingText } from "@/components/ai/streaming-text";

/**
 * Reusable "AI" card — header, generate button, streaming markdown body.
 * Used in ticket detail and account detail for one-shot generations.
 */
export function AICard({
  title,
  description,
  endpoint,
  payload,
  cta = "Generate",
  initialAutoRun = false,
}: {
  title: string;
  description: string;
  endpoint: string;
  payload: unknown;
  cta?: string;
  initialAutoRun?: boolean;
}) {
  const { text, state, error, run } = useAIStream(endpoint);

  if (initialAutoRun && state === "idle" && !text) {
    run(payload);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-aether-400" />
            {title}
          </CardTitle>
          <p className="text-xs text-white/45 mt-1">{description}</p>
        </div>
        {text && state !== "streaming" && (
          <Button variant="ghost" size="sm" onClick={() => run(payload)}>
            <RefreshCcw className="h-3 w-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {state === "idle" && !text && (
          <Button size="sm" className="w-full" onClick={() => run(payload)}>
            <Sparkles className="h-3.5 w-3.5" />
            {cta}
          </Button>
        )}

        {state === "streaming" && text === "" && (
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
            <div className="text-[11px] text-white/40 mt-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-aether-500 animate-pulse" />
              Analyzing with Opus 4.7…
            </div>
          </div>
        )}

        {text && <StreamingText text={text} state={state} />}

        {state === "error" && (
          <div className="flex items-center gap-2 mt-3 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
