"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      richColors={false}
      closeButton
      toastOptions={{
        style: {
          background: "rgba(255, 255, 255, 0.96)",
          border: "1px solid rgba(10, 10, 10, 0.08)",
          color: "#0a0a0a",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          borderRadius: "14px",
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          padding: "14px 16px",
          boxShadow: "0 20px 50px -24px rgba(10,10,10,0.35)",
        },
        classNames: {
          success: "!border-emerald-500/40 !bg-white",
          error: "!border-red-500/40 !bg-white",
          info: "!border-signal-500/40 !bg-white",
          warning: "!border-amber-500/40 !bg-white",
          title: "!text-ink-300 !font-medium",
          description: "!text-ink-300/65 !text-[11.5px]",
          closeButton: "!bg-white !border-bone-300/60 !text-ink-300/60",
        },
      }}
    />
  );
}
