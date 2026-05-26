"use client";

import { motion } from "framer-motion";

export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute -top-1/2 left-1/4 h-[60rem] w-[60rem] rounded-full bg-signal-500/20 blur-[120px]"
        animate={{ x: [0, 60, -40, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 -right-1/4 h-[50rem] w-[50rem] rounded-full bg-signal-600/15 blur-[120px]"
        animate={{ x: [0, -40, 60, 0], y: [0, -20, 40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/3 left-1/2 h-[55rem] w-[55rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]"
        animate={{ scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
