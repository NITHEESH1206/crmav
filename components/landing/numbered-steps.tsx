"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "001",
    title: "Track",
    body:
      "Every opportunity, project, ticket and PO in one place. The Mission Control dashboard ranks what needs your attention by dollars at risk and time sensitivity — not by entity type.",
  },
  {
    n: "002",
    title: "Model",
    body:
      "Tell the AI Builder a room, capacity and tier — get back a validated BOQ, a stacked rack layout, a signal flow draft and a 3D visualization. Sourced from your real catalog.",
  },
  {
    n: "003",
    title: "Deploy",
    body:
      "Commissioning checklists generated from the device list. Drawings versioned with approval lifecycle. Devices monitored room-by-room with online / warning / offline health.",
  },
  {
    n: "004",
    title: "Serve",
    body:
      "AMC contracts with SLO reporting. SLA watchdog automation. Client portal with proposal e-signature, invoice pay and ticket raising — branded as you.",
  },
];

export function NumberedSteps() {
  return (
    <section id="workflow" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-[760px] mb-16 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-300/55 font-medium mb-5">
            <span className="h-1 w-1 rounded-full bg-signal-500" />
            The workflow
          </span>
          <h2 className="font-display text-[36px] md:text-[48px] leading-[1.05] tracking-[-0.03em] text-ink-300 font-medium">
            From first opportunity to AMC renewal — one timeline.
          </h2>
        </motion.div>

        <ol className="divide-y divide-bone-300/45 border-y border-bone-300/45">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-12 py-10 md:py-14 group"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[28px] md:text-[32px] font-medium text-ink-300/30 tracking-tight">
                  {step.n}
                </span>
                <span className="font-display text-[22px] md:text-[26px] font-medium text-ink-300 tracking-[-0.02em]">
                  {step.title}
                </span>
              </div>
              <p className="text-[15px] md:text-[17px] leading-[1.55] text-ink-300/70 max-w-[640px]">
                {step.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
