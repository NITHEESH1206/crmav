import Link from "next/link";
import { BrandMark } from "@/components/app/brand-mark";

const COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap", "Integrations", "Security"],
  },
  {
    title: "Solutions",
    links: [
      "System Integrators",
      "AV Consultants",
      "Service Providers",
      "Live Events",
      "Broadcast",
      "Education",
    ],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Help Center", "Community", "Blog", "Webinars"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Partners", "Contact", "Brand"],
  },
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-ink-200/40 backdrop-blur-xl">
      <div className="container py-20">
        <div className="grid lg:grid-cols-[1.4fr_3fr] gap-12">
          <div>
            <Link href="/" className="flex items-center">
              <BrandMark variant="full" height={26} />
            </Link>
            <p className="mt-5 text-sm text-white/45 leading-relaxed max-w-sm">
              The enterprise CRM built for AV companies, system integrators, and consultants. One platform for every workflow your team runs.
            </p>
            <div className="mt-6 flex gap-2">
              {["X", "in", "GH", "YT"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="h-9 w-9 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-[11px] text-white/55 hover:text-white hover:border-signal-500/30 hover:bg-signal-500/[0.06] transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/45 font-medium">
                  {col.title}
                </div>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/35">
            © {new Date().getFullYear()} ZynexAV, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link href="#" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">Cookies</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">DPA</Link>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
