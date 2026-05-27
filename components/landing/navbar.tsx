"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/app/brand-mark";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Solutions", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "News", href: "#news" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 16));

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-full pl-5 pr-2 py-2 transition-all duration-500",
          scrolled
            ? "bg-white/85 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(10,10,10,0.18)] border border-bone-300/60"
            : "bg-white/70 backdrop-blur-md border border-bone-300/40"
        )}
      >
        <Link href="/" className="flex items-center shrink-0 -ml-1">
          <BrandMark variant="full" height={26} invertForDark={false} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-[15px] font-medium text-ink-300/70 hover:text-ink-300 transition-colors rounded-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <PillCta>Sign In</PillCta>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden h-10 w-10 rounded-full bg-ink-300 text-bone-100 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="md:hidden absolute top-[78px] inset-x-4 rounded-3xl bg-white border border-bone-300/60 shadow-[0_20px_60px_-20px_rgba(10,10,10,0.25)] p-4"
        >
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-base font-medium text-ink-300/80 hover:bg-bone-100 rounded-2xl"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2"
            >
              <PillCta className="w-full justify-center">Sign In</PillCta>
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}

function PillCta({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-ink-300 pl-5 pr-1.5 py-1.5 text-[14px] font-medium text-bone-100 hover:bg-ink-200 transition-colors",
        className
      )}
    >
      {children}
      <span className="h-7 w-7 rounded-full bg-bone-100/15 flex items-center justify-center">
        <ArrowRight className="h-3.5 w-3.5 text-bone-100" strokeWidth={2.2} />
      </span>
    </span>
  );
}
