"use client";

import { Quote } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

const TESTIMONIALS = [
  {
    quote:
      "We replaced three tools the day we onboarded. Our project margins jumped 11% in the first quarter because BOQ tracking finally lives next to the proposal.",
    name: "Daniel Reyes",
    role: "Director of Operations",
    company: "Soundstage Integration",
  },
  {
    quote:
      "The AV rack builder and signal flow designer are unreal. Our junior engineers ship polished documentation that used to take seniors hours.",
    name: "Priya Mehta",
    role: "Lead AV Consultant",
    company: "Vertex Audio Visual",
  },
  {
    quote:
      "Service revenue is up 38% because preventive maintenance and AMC contracts are finally automated. The SLA dashboards alone justified the move.",
    name: "Marcus Chen",
    role: "Service Manager",
    company: "Apex AV Group",
  },
  {
    quote:
      "It looks like Linear, it works like Salesforce, and it understands AV. That's a sentence I never thought I'd say about a CRM.",
    name: "Lena Rivera",
    role: "Founder & CEO",
    company: "Lumen Spaces",
  },
  {
    quote:
      "Quotes that used to take a day now take 12 minutes. The AI proposal generator is the single biggest productivity unlock we've had in five years.",
    name: "Anthony Patel",
    role: "VP Sales",
    company: "Resonant Systems",
  },
  {
    quote:
      "Inventory accuracy went from 'best guess' to ±0.4% across three warehouses. Serial tracking and RMA workflows are exactly what AV needed.",
    name: "Hannah Kowalski",
    role: "Inventory Lead",
    company: "Echo Pro AV",
  },
];

export function Testimonials() {
  const col = (arr: typeof TESTIMONIALS) => (
    <div className="flex flex-col gap-4">
      {arr.map((t, i) => (
        <TestimonialCard key={i} {...t} />
      ))}
    </div>
  );

  return (
    <section className="relative py-32 sm:py-40 overflow-hidden">
      <div className="container">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.3em] text-signal-400 font-medium">
            Loved by AV teams
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Real teams. Real wins. <span className="text-gradient">Real recurring revenue.</span>
          </h2>
        </FadeIn>

        <div className="mt-16 relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-ink-300 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-ink-300 to-transparent z-10 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {col([TESTIMONIALS[0], TESTIMONIALS[3]])}
            {col([TESTIMONIALS[1], TESTIMONIALS[4]])}
            {col([TESTIMONIALS[2], TESTIMONIALS[5]])}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
  company,
}: {
  quote: string;
  name: string;
  role: string;
  company: string;
}) {
  return (
    <div className="relative rounded-2xl glass-card p-6 hover-lift">
      <Quote className="h-5 w-5 text-signal-500/60 mb-4" strokeWidth={2.2} />
      <p className="text-sm text-white/75 leading-relaxed">{quote}</p>
      <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-signal-400 to-signal-700 flex items-center justify-center text-xs font-semibold">
          {name
            .split(" ")
            .map((s) => s[0])
            .join("")}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{name}</div>
          <div className="text-xs text-white/45 truncate">
            {role} · {company}
          </div>
        </div>
      </div>
    </div>
  );
}
