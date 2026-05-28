"use client";

import { motion } from "framer-motion";

export function Testimonial() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1000px] px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-10 md:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[64px] md:text-[80px] leading-none text-signal-500 font-serif italic block mb-2">
              &ldquo;
            </span>
            <p className="font-serif italic text-[24px] md:text-[32px] leading-[1.3] tracking-[-0.01em] text-ink-300">
              We finally moved past spreadsheets and disconnected tools. One quote becomes a project, the project becomes a 3D room, the 3D room becomes a service contract — without us re-typing a single SKU.
            </p>
            <div className="mt-8 text-[14px] text-ink-300/70">
              <span className="font-semibold text-ink-300">Elliot Williams</span>
              <span className="mx-2 text-ink-300/30">·</span>
              <span>VP Operations</span>
              <span className="mx-2 text-ink-300/30">·</span>
              <span>Soundstage AV</span>
            </div>
          </motion.div>

          {/* Portrait placeholder — signal-orange duotone abstract */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative aspect-square rounded-full overflow-hidden bg-gradient-to-br from-signal-500/20 via-bone-200 to-ink-300/20 border border-bone-300/55"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,90,31,0.4),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(10,10,10,0.25),transparent_55%)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-40 mix-blend-multiply"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/></svg>\")",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[40px] font-medium text-ink-300/60">
              EW
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
