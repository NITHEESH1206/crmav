"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/app/brand-mark";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Product",   href: "#product" },
  { label: "Workflow",  href: "#workflow" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing",   href: "#pricing" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 16));

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-[1100px] px-4 lg:px-6 pt-4">
        <div
          className={cn(
            "transition-all duration-300 rounded-full px-5 lg:px-6 h-14 flex items-center justify-between gap-6",
            scrolled ? "glass-strong" : "glass"
          )}
        >
          <Link href="/" className="flex items-center shrink-0">
            <BrandMark variant="full" height={22} invertForDark={false} />
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="hover-glass text-[15px] text-ink-300/70 hover:text-ink-300 px-3.5 py-1.5 rounded-full border border-transparent"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-[14px] text-ink-300/70 hover:text-ink-300 transition-colors"
            >
              Sign in
            </Link>
            <Link href="/dashboard" className="group">
              <span className="btn-glass-primary inline-flex items-center gap-1.5 rounded-full pl-4 pr-3.5 py-2 text-[14px] font-medium">
                Get started
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
              </span>
            </Link>
          </div>

          {/* Mobile */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden h-9 w-9 rounded-full bg-ink-300 text-bone-100 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-bone-50 border-b border-bone-300/40"
        >
          <nav className="px-6 py-4 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-[15px] text-ink-300/80 hover:bg-bone-100 rounded-lg"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-300 text-bone-100 px-4 py-3 text-[14px] font-medium"
            >
              Get started
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
