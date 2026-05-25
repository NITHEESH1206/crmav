"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Spotlight({ className = "" }: { className?: string }) {
  const [pos, setPos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      animate={{
        background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(255,107,0,0.18), transparent 40%)`,
      }}
      transition={{ type: "spring", damping: 30, stiffness: 80 }}
    />
  );
}
