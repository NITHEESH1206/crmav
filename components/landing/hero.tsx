"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  Sparkles,
  Cable,
  MonitorPlay,
  Radio,
  Cpu,
  Headphones,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/motion/aurora";
import { Particles } from "@/components/motion/particles";
import { DashboardPreview } from "@/components/landing/dashboard-preview";

export function Hero() {
  return (
    <section className="relative pt-32 pb-32 sm:pt-40 sm:pb-40 overflow-hidden">
      <Aurora />
      <Particles count={32} />
      <div className="absolute inset-0 grid-pattern -z-10" />

      <div className="container relative">
        {/* Floating AV chips */}
        <FloatingAVChips />

        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur px-3.5 py-1.5 text-xs text-white/70"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aether-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-aether-500" />
            </span>
            <Sparkles className="h-3 w-3 text-aether-400" />
            <span>AI proposals, BOQ generation, signal flow — all built in</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-7 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-semibold tracking-[-0.04em] leading-[0.95]"
          >
            The Enterprise CRM
            <br />
            <span className="text-gradient">Built For AV Companies</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-7 mx-auto max-w-2xl text-base sm:text-lg text-white/55 leading-relaxed"
          >
            Manage projects, clients, inventory, procurement, service tickets, billing, and AV operations from one powerful platform engineered for system integrators and consultants.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/dashboard">
              <Button size="xl">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="xl" variant="secondary">
              <PlayCircle className="h-4 w-4" />
              Book a Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-6 flex items-center justify-center gap-6 text-xs text-white/35"
          >
            <span>No credit card required</span>
            <span className="h-1 w-1 rounded-full bg-white/15" />
            <span>14-day free trial</span>
            <span className="h-1 w-1 rounded-full bg-white/15" />
            <span>Cancel anytime</span>
          </motion.div>
        </div>

        {/* 3D Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative mt-20 mx-auto max-w-6xl perspective"
        >
          <div className="absolute -inset-x-20 -inset-y-10 bg-aether-500/20 blur-[120px] -z-10" />
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingAVChips() {
  const chips = [
    { icon: Cable, top: "10%", left: "8%", delay: 0, label: "Crestron DM" },
    { icon: MonitorPlay, top: "16%", right: "10%", delay: 0.6, label: "85\" Display" },
    { icon: Radio, top: "55%", left: "4%", delay: 1.2, label: "Shure MXA920" },
    { icon: Cpu, top: "62%", right: "5%", delay: 1.8, label: "Q-SYS Core" },
    { icon: Headphones, top: "32%", left: "14%", delay: 0.3, label: "DSP Routing" },
    { icon: Volume2, top: "44%", right: "16%", delay: 0.9, label: "Genelec 8030C" },
  ];

  return (
    <>
      {chips.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 0.6, 1],
              scale: [0.8, 1, 1.02, 0.98, 1],
              y: [0, -10, 4, -6, 0],
            }}
            transition={{
              duration: 8,
              delay: c.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ top: c.top, left: c.left, right: c.right }}
            className="absolute hidden lg:flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl px-3 py-2 text-xs text-white/70 shadow-soft"
          >
            <div className="h-6 w-6 rounded-md bg-aether-500/15 flex items-center justify-center text-aether-400">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="font-mono text-[11px]">{c.label}</span>
          </motion.div>
        );
      })}
    </>
  );
}
