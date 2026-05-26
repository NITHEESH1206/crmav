"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      richColors={false}
      closeButton
      toastOptions={{
        style: {
          background: "rgba(11, 11, 13, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(20px)",
          borderRadius: "12px",
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          padding: "14px 16px",
          boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7)",
        },
        classNames: {
          success: "!border-emerald-500/30 !bg-[rgba(11,11,13,0.95)]",
          error: "!border-red-500/30 !bg-[rgba(11,11,13,0.95)]",
          info: "!border-signal-500/30 !bg-[rgba(11,11,13,0.95)]",
          warning: "!border-amber-500/30 !bg-[rgba(11,11,13,0.95)]",
          title: "!text-white !font-medium",
          description: "!text-white/60 !text-[11px]",
        },
      }}
    />
  );
}
