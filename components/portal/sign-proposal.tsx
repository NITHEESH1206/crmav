"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, Type, Eraser, Check, FileSignature, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { signProposal } from "@/app/actions/esign";
import { cn } from "@/lib/utils";

type Mode = "draw" | "type";

export type PortalProposal = {
  quoteId: string;
  number: string;
  totalCents: number;
  status: string;
  signedByName?: string | null;
  signedAt?: Date | null;
};

export function SignProposalButton({
  proposal,
  accountId,
  currency = "USD",
}: {
  proposal: PortalProposal;
  accountId: string;
  currency?: string;
}) {
  const [open, setOpen] = useState(false);

  if (proposal.status === "SIGNED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-success-bg/70 border border-status-success-fg/25 px-3 py-1 text-[12px] font-medium text-status-success-fg">
        <Check className="h-3 w-3" strokeWidth={2.5} />
        Signed {proposal.signedAt ? proposal.signedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-glass-signal inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-medium"
      >
        <FileSignature className="h-3.5 w-3.5" />
        Review & sign
      </button>
      {open && (
        <SignDialog
          proposal={proposal}
          accountId={accountId}
          currency={currency}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SignDialog({
  proposal,
  accountId,
  currency,
  onClose,
}: {
  proposal: PortalProposal;
  accountId: string;
  currency: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("draw");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [typed, setTyped] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [pending, startTransition] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);

  // Canvas setup
  useEffect(() => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Hi-DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#0A0A0A";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [mode]);

  function pointerPos(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.PointerEvent) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    hasDrawnRef.current = true;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function moveDraw(e: React.PointerEvent) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function endDraw() {
    drawingRef.current = false;
  }
  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasDrawnRef.current = false;
    }
  }

  function renderTypedToDataUrl(text: string): string {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 160;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 600, 160);
    ctx.fillStyle = "#0A0A0A";
    ctx.font = "italic 48px Georgia, serif";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 24, 80);
    return canvas.toDataURL("image/png");
  }

  function submit() {
    if (name.trim().length < 2) {
      toast.error("Enter your full name");
      return;
    }
    if (!agreed) {
      toast.error("Please confirm you agree to sign");
      return;
    }

    let signatureDataUrl: string;
    if (mode === "draw") {
      if (!hasDrawnRef.current) {
        toast.error("Draw your signature first");
        return;
      }
      signatureDataUrl = canvasRef.current!.toDataURL("image/png");
    } else {
      if (typed.trim().length < 2) {
        toast.error("Type your signature");
        return;
      }
      signatureDataUrl = renderTypedToDataUrl(typed.trim());
    }

    startTransition(async () => {
      const r = await signProposal({
        quoteId: proposal.quoteId,
        accountId,
        signedByName: name.trim(),
        signedByEmail: email.trim() || null,
        signatureDataUrl,
      });
      if (r.ok) {
        toast.success("Proposal signed", {
          description: "Thank you — your account team has been notified.",
        });
        onClose();
      } else {
        toast.error("Couldn't sign", { description: r.error });
      }
    });
  }

  const symbol = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-ink-300/35 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card relative w-full max-w-lg overflow-hidden"
        >
          <header className="px-5 py-4 border-b border-bone-300/40 flex items-start justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-signal-700 mb-1 inline-flex items-center gap-1.5">
                <FileSignature className="h-3 w-3" strokeWidth={2.5} />
                Proposal {proposal.number}
              </div>
              <h3 className="text-[18px] font-medium text-ink-300">
                Sign to accept · {symbol}{(proposal.totalCents / 100).toLocaleString()}
              </h3>
            </div>
            <button onClick={onClose} className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/55 hover:text-ink-300">
              <X className="h-3.5 w-3.5" />
            </button>
          </header>

          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11.5px] text-ink-300/65 font-medium">Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-glass mt-1" autoFocus />
              </label>
              <label className="block">
                <span className="text-[11.5px] text-ink-300/65 font-medium">Email (optional)</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="input-glass mt-1" />
              </label>
            </div>

            {/* Signature mode switch */}
            <div className="glass inline-flex items-center rounded-full p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setMode("draw")}
                className={cn("inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all", mode === "draw" ? "btn-glass-primary" : "text-ink-300/65 hover:text-ink-300")}
              >
                <PenLine className="h-3 w-3" />
                Draw
              </button>
              <button
                type="button"
                onClick={() => setMode("type")}
                className={cn("inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all", mode === "type" ? "btn-glass-primary" : "text-ink-300/65 hover:text-ink-300")}
              >
                <Type className="h-3 w-3" />
                Type
              </button>
            </div>

            {/* Signature area */}
            {mode === "draw" ? (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-36 rounded-2xl bg-white border border-bone-300/65 touch-none cursor-crosshair"
                  onPointerDown={startDraw}
                  onPointerMove={moveDraw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                />
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="absolute top-2 right-2 hover-glass inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] text-ink-300/65 hover:text-ink-300 border border-bone-300/55"
                >
                  <Eraser className="h-3 w-3" />
                  Clear
                </button>
                <p className="text-[11px] text-ink-300/50 mt-1.5">Sign with your mouse, trackpad, or finger.</p>
              </div>
            ) : (
              <div>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Type your name"
                  className="w-full h-20 rounded-2xl bg-white border border-bone-300/65 px-4 text-[32px] italic outline-none focus:border-signal-500/45"
                  style={{ fontFamily: "Georgia, serif" }}
                />
                <p className="text-[11px] text-ink-300/50 mt-1.5">Your typed name becomes your signature.</p>
              </div>
            )}

            <label className="flex items-start gap-2.5 text-[12.5px] text-ink-300/75 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-signal-500"
              />
              <span>
                I agree that my electronic signature is legally binding and constitutes acceptance of this proposal and its terms.
              </span>
            </label>
          </div>

          <footer className="px-5 py-3.5 border-t border-bone-300/40 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-300/55">
              <ShieldCheck className="h-3 w-3" />
              Signature + IP + timestamp recorded
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="btn-glass-signal inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-[14px] font-medium"
            >
              {pending ? "Signing…" : "Sign proposal"}
              <Check className="h-4 w-4" strokeWidth={2} />
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
