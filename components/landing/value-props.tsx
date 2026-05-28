"use client";

import { motion } from "framer-motion";
import { PieChart, Network, TrendingUp } from "lucide-react";

const VALUES = [
  {
    icon: PieChart,
    title: "Clarity drives action",
    body:
      "Mission Control shows what's burning today — SLA breaches, overdue invoices, delayed POs — ranked by dollars at risk. Every number drills into its source.",
  },
  {
    icon: Network,
    title: "AV-native, not adapted CRM",
    body:
      "BOQ, rack builder, signal flow designer, room 3D view, AMC contracts, device health — modelled the way integrators actually work, not bolted onto a generic CRM.",
  },
  {
    icon: TrendingUp,
    title: "Workflow over isolation",
    body:
      "Opportunity → Proposal → Project → Rack → Signal Flow → Commissioning → AMC. One spine, one promote-to-next-stage button. No re-keying between tools.",
  },
];

export function ValueProps() {
  return (
    <section className="relative py-24 md:py-32 bg-bone-100/50">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <div className="h-10 w-10 rounded-md bg-signal-500/10 border border-signal-500/20 flex items-center justify-center mb-5">
                  <Icon className="h-4 w-4 text-signal-600" strokeWidth={1.75} />
                </div>
                <h3 className="text-[24px] font-medium tracking-[-0.014em] text-ink-300 leading-[1.2]">
                  {v.title}
                </h3>
                <p className="mt-4 text-[16px] leading-[1.55] text-ink-300/65">
                  {v.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
