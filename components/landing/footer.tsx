"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/app/brand-mark";

const COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap", "Integrations", "Security"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Partners", "Contact", "Brand"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Help Center", "Community", "Blog", "Webinars"],
  },
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-bone-300/60 bg-bone-50">
      <div className="container py-20">
        {/* Newsletter row */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 pb-16 border-b border-bone-300/60">
          <div>
            <Link href="/" className="inline-flex items-center">
              <BrandMark variant="full" height={28} invertForDark={false} />
            </Link>
            <p className="mt-5 text-[15px] text-ink-300/60 leading-relaxed max-w-md">
              The enterprise CRM built for AV companies, system integrators and consultants. One platform for every workflow your team runs.
            </p>
          </div>

          <div>
            <div className="text-[13px] font-semibold tracking-[0.04em] uppercase text-ink-300">
              Join Our Newsletter
            </div>
            <p className="mt-2 text-[14px] text-ink-300/55">
              Monthly product updates, AV operations playbooks, and integrator interviews.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex items-center gap-2 rounded-full bg-white border border-bone-300/70 pl-5 pr-1.5 py-1.5"
            >
              <input
                type="email"
                placeholder="you@yourcompany.com"
                className="flex-1 bg-transparent text-[14px] text-ink-300 placeholder:text-ink-300/40 outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-ink-300 text-bone-100 pl-4 pr-1.5 py-1.5 text-[13px] font-medium hover:bg-ink-200 transition-colors"
              >
                Subscribe
                <span className="h-6 w-6 rounded-full bg-bone-100/15 flex items-center justify-center">
                  <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[12px] uppercase tracking-[0.18em] text-ink-300/55 font-semibold">
                {col.title}
              </div>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[14px] text-ink-300/75 hover:text-ink-300 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-bone-300/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[12px] text-ink-300/50">
            © {new Date().getFullYear()} ZynexAV, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[12px] text-ink-300/50">
            <Link href="#" className="hover:text-ink-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-ink-300 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-ink-300 transition-colors">Cookies</Link>
            <Link href="#" className="hover:text-ink-300 transition-colors">DPA</Link>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
