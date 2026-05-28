import Link from "next/link";
import { BrandMark } from "@/components/app/brand-mark";

const COLUMNS = [
  {
    title: "Product",
    links: ["Mission Control", "Projects", "Rack Builder", "Signal Flow", "AI Builder", "Pricing"],
  },
  {
    title: "Customers",
    links: ["Integrators", "Consultants", "Service teams", "Case studies", "Client portal"],
  },
  {
    title: "Company",
    links: ["About", "Journal", "Careers", "Partners", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Changelog", "Roadmap", "Help center", "Status"],
  },
];

export function LandingFooter() {
  return (
    <footer className="relative bg-bone-50 border-t border-bone-300/45">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10 pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_3fr] gap-14">
          <div>
            <Link href="/" className="inline-flex items-center">
              <BrandMark variant="full" height={22} invertForDark={false} />
            </Link>
            <p className="mt-5 text-[14px] text-ink-300/65 leading-[1.6] max-w-[340px]">
              The operating system for AV integrators, consultants and service teams. From opportunity to AMC, in one timeline.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300/50 font-semibold">
                  {col.title}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-[13.5px] text-ink-300/75 hover:text-ink-300 transition-colors"
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

        <div className="mt-16 pt-7 border-t border-bone-300/45 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-[12px] text-ink-300/50">
            © {new Date().getFullYear()} ZynexAV · All rights reserved
          </div>
          <div className="flex items-center gap-6 text-[12px] text-ink-300/50">
            <Link href="#" className="hover:text-ink-300/80 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-ink-300/80 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-ink-300/80 transition-colors">Cookies</Link>
            <Link href="#" className="hover:text-ink-300/80 transition-colors">DPA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
