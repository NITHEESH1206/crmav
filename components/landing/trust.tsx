"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

const LOGOS = ["Crestron", "Q-SYS", "Extron", "Biamp", "Shure", "Harman"];

export function Trust() {
  return (
    <section className="relative pb-20 sm:pb-28">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TeamCard />
          <TargetCard />
          <SalesCard />
          <IntegrationsCard />
        </div>

        <div className="mt-16 text-center">
          <div className="text-[13px] text-ink-300/55 font-medium">
            Trusted by AV teams running on every major platform
          </div>
          <div className="mt-7 marquee relative overflow-hidden">
            <div className="flex gap-14 animate-scroll-x w-max items-center">
              {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
                <span
                  key={i}
                  className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-ink-300/35 hover:text-ink-300/70 transition-colors whitespace-nowrap"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay }}
      className="relative rounded-3xl bg-white border border-bone-300/50 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_18px_50px_-30px_rgba(10,10,10,0.18)]"
    >
      {children}
    </motion.div>
  );
}

function TeamCard() {
  return (
    <Card delay={0}>
      <div className="text-[15px] font-semibold text-ink-300">Team members</div>
      <div className="text-[12px] text-ink-300/55 mt-0.5">
        1.8M operators love ZynexAV
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-bone-300/60 bg-bone-50 px-3 py-2.5">
        <input
          type="email"
          placeholder="Email address"
          className="flex-1 bg-transparent text-[13px] text-ink-300 placeholder:text-ink-300/40 outline-none"
        />
        <button
          type="button"
          className="h-7 w-7 rounded-full bg-ink-300 text-bone-100 flex items-center justify-center"
        >
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>

      {[
        { name: "Aarav P. Mehta", role: "AV Engineer", initials: "AP" },
        { name: "Joe F. Brennan", role: "Project Lead", initials: "JF" },
      ].map((m) => (
        <div key={m.name} className="mt-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-signal-300 to-signal-600 text-bone-100 flex items-center justify-center text-[11px] font-semibold">
            {m.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-ink-300 truncate">
              {m.name}
            </div>
            <div className="text-[11px] text-ink-300/50">{m.role}</div>
          </div>
          <button className="text-[11px] font-medium text-ink-300 px-3 py-1 rounded-full border border-bone-300/70 hover:bg-bone-100">
            invite
          </button>
        </div>
      ))}
    </Card>
  );
}

function TargetCard() {
  return (
    <Card delay={0.08}>
      <div className="text-[15px] font-semibold text-ink-300">Pipeline $569K</div>

      <svg
        viewBox="0 0 200 90"
        className="mt-4 w-full h-[110px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="targetFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid baseline */}
        <line x1="0" y1="75" x2="200" y2="75" stroke="#ddd6c8" strokeDasharray="2 3" />
        <path
          d="M0,72 L25,65 L50,58 L75,52 L100,40 L125,32 L150,28 L165,18 L175,22 L200,15"
          stroke="#0A0A0A"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0,72 L25,65 L50,58 L75,52 L100,40 L125,32 L150,28 L165,18 L175,22 L200,15 L200,90 L0,90 Z"
          fill="url(#targetFill)"
        />
        {/* marker line */}
        <line x1="150" y1="0" x2="150" y2="80" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
        <circle cx="150" cy="28" r="3.5" fill="#FF5A1F" stroke="#fff" strokeWidth="1.5" />
      </svg>

      <div className="mt-2 flex items-center justify-between text-[12px]">
        <div>
          <div className="font-medium text-ink-300">Set Daily Reminder</div>
          <div className="text-ink-300/50 text-[11px]">
            Alert when pipeline cools
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-300/40" />
      </div>
    </Card>
  );
}

function SalesCard() {
  const bars = [22, 38, 52, 30, 45, 70, 95, 60];
  return (
    <Card delay={0.16}>
      <div className="text-[15px] font-semibold text-ink-300">
        Sales Performance
      </div>

      <div className="mt-5 h-[120px] flex items-end gap-1.5">
        {bars.map((h, i) => {
          const isPeak = i === 6;
          return (
            <div key={i} className="flex-1 flex items-end h-full relative">
              {isPeak && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium rounded-md bg-ink-300 text-bone-100 px-2 py-1">
                  4500: peak
                </div>
              )}
              <div
                className={`w-full rounded-t-md ${
                  isPeak
                    ? "bg-ink-300"
                    : "bg-gradient-to-t from-bone-300 to-bone-200"
                }`}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-ink-300/40 font-medium">
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </Card>
  );
}

function IntegrationsCard() {
  const integrations = [
    { label: "Cr", className: "top-1 left-3 bg-signal-500 text-bone-100" },
    { label: "Q", className: "top-2 right-2 bg-ink-300 text-bone-100" },
    { label: "Ex", className: "bottom-3 left-1 bg-emerald-500 text-white" },
    { label: "Bi", className: "bottom-1 right-3 bg-sky-500 text-white" },
  ];
  return (
    <Card delay={0.24}>
      <div className="text-[15px] font-semibold text-ink-300">
        Integrations &amp; Tools
      </div>

      <div className="mt-5 relative h-[140px]">
        {/* orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute h-[110px] w-[110px] rounded-full border border-dashed border-bone-300/80" />
          <div className="absolute h-[150px] w-[150px] rounded-full border border-dashed border-bone-300/50" />
        </div>
        {/* center hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-2xl bg-ink-300 text-bone-100 flex items-center justify-center text-[12px] font-bold">
            AV
          </div>
        </div>
        {/* satellites */}
        {integrations.map((i) => (
          <div
            key={i.label}
            className={`absolute h-9 w-9 rounded-2xl flex items-center justify-center text-[11px] font-bold shadow-[0_6px_20px_-6px_rgba(10,10,10,0.3)] ${i.className}`}
          >
            {i.label}
          </div>
        ))}
      </div>
    </Card>
  );
}
