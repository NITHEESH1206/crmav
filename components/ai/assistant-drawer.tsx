"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, RefreshCcw, X, Square } from "lucide-react";
import { Markdown } from "@/components/ai/markdown";
import { useAssistant } from "@/lib/stores/assistant";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Compare Crestron DM-NVX-360 vs Q-SYS NV-32-H",
  "What's the best mic setup for a 12-person boardroom?",
  "How do I add a new opportunity to my pipeline?",
  "Recommend a BOQ for a 6-seat huddle room",
];

export function AssistantDrawer() {
  const { open, setOpen } = useAssistant();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new chunks
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const userMsg: Msg = { role: "user", content: text.trim() };
      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      setStreaming(true);
      setStreamingText("");

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            acc += dec.decode(value, { stream: true });
            setStreamingText(acc);
          }
        }
        setMessages((m) => [...m, { role: "assistant", content: acc }]);
        setStreamingText("");
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: `[Error] ${e instanceof Error ? e.message : "Unknown"}` },
          ]);
          setStreamingText("");
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming]
  );

  const stop = () => {
    abortRef.current?.abort();
    if (streamingText) {
      setMessages((m) => [...m, { role: "assistant", content: streamingText + " *(stopped)*" }]);
    }
    setStreamingText("");
    setStreaming(false);
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingText("");
    setStreaming(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="p-0 sm:max-w-[560px]">
        <SheetHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-signal-400 text-[11px] uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3" />
                Zynex AI
              </div>
              <SheetTitle className="flex items-center gap-2 mt-0.5">
                Assistant
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-signal-500/10 text-signal-400 border border-signal-500/30 normal-case tracking-normal">
                  Opus 4.7
                </span>
              </SheetTitle>
              <SheetDescription>AV expertise, deal coaching, and CRM help.</SheetDescription>
            </div>
            {messages.length > 0 && (
              <button
                onClick={reset}
                className="text-[11px] text-ink-300/55 hover:text-ink-300 flex items-center gap-1 mr-8"
              >
                <RefreshCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>
        </SheetHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 && !streaming && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-signal-500/20 bg-gradient-to-br from-signal-500/[0.08] to-transparent p-4">
                <Sparkles className="h-4 w-4 text-signal-400 mb-2" />
                <div className="text-sm text-ink-300/90">
                  Ask anything AV — equipment recommendations, signal flow tips, BOQ help, or CRM
                  workflow guidance.
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-300/50 mb-2.5">
                  Try
                </div>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left text-sm text-ink-300/85 rounded-xl border border-bone-300/55 bg-bone-50/60 px-3 py-2.5 hover:border-signal-500/30 hover:bg-bone-100/70 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <ChatBubble key={i} msg={m} />
            ))}
            {streaming && (
              <ChatBubble msg={{ role: "assistant", content: streamingText }} streaming />
            )}
          </AnimatePresence>
        </div>

        {/* Composer */}
        <div className="border-t border-bone-300/55 p-3 bg-bone-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask anything…"
              rows={1}
              className="flex-1 max-h-32 resize-none rounded-xl border border-bone-300/65 bg-bone-50 px-3 py-2.5 text-sm text-ink-300 placeholder:text-ink-300/45 focus:outline-none focus:border-signal-500/40 focus:ring-2 focus:ring-signal-500/15"
            />
            {streaming ? (
              <Button type="button" size="icon" variant="secondary" onClick={stop}>
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </form>
          <div className="mt-1.5 text-[10px] text-ink-300/45 px-1">
            Enter to send · Shift+Enter for newline
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ChatBubble({ msg, streaming }: { msg: Msg; streaming?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex mb-3.5", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-signal-500/20 border border-signal-500/40 text-ink-300"
            : "bg-bone-50 border border-bone-300/55 text-ink-300/95"
        )}
      >
        {isUser ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
        ) : (
          <>
            <Markdown text={msg.content || ""} />
            {streaming && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 -mb-0.5 bg-signal-500 animate-pulse rounded-sm" />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
