"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/ai/markdown";

type State = "idle" | "streaming" | "done" | "error";

/**
 * Hook: POST JSON to a Next.js API route, consume the streamed plain-text body.
 */
export function useAIStream(url: string) {
  const [text, setText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (body: unknown) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setText("");
      setError(null);
      setState("streaming");
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          throw new Error(`Request failed (${res.status})`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) setText((prev) => prev + decoder.decode(value, { stream: true }));
        }
        setState("done");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
        setState("error");
      }
    },
    [url]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => (s === "streaming" ? "idle" : s));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setText("");
    setError(null);
    setState("idle");
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { text, state, error, run, cancel, reset };
}

/** Renders streamed markdown text with a blinking cursor while streaming. */
export function StreamingText({ text, state }: { text: string; state: State }) {
  return (
    <div className="relative">
      <Markdown text={text} />
      {state === "streaming" && (
        <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-signal-500 animate-pulse rounded-sm" />
      )}
    </div>
  );
}
