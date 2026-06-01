import Link from "next/link";
import { BrandMark } from "@/components/app/brand-mark";

/** Centered, brand-washed canvas for the sign-in / sign-up pages. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 text-ink-300">
      {/* Base + ambient brand wash (mirrors the landing) */}
      <div className="fixed inset-0 -z-30 bg-bone-50" aria-hidden />
      <div
        aria-hidden
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(55% 45% at 15% 10%, rgba(255,125,63,0.18), transparent 60%)",
            "radial-gradient(50% 40% at 88% 14%, rgba(255,156,102,0.14), transparent 65%)",
            "radial-gradient(55% 45% at 50% 92%, rgba(255,90,31,0.08), transparent 70%)",
          ].join(","),
        }}
      />

      <Link href="/" className="mb-8 inline-flex">
        <BrandMark variant="full" height={26} invertForDark={false} />
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <h1 className="text-[26px] font-medium tracking-[-0.02em] text-ink-300">{title}</h1>
          {subtitle && <p className="mt-2 text-[14px] text-ink-300/60">{subtitle}</p>}
        </div>
        <div className="flex justify-center">{children}</div>
      </div>

      <p className="mt-8 text-[12px] text-ink-300/45">
        © {new Date().getFullYear()} ZynexAV · The OS for AV Integrators
      </p>
    </div>
  );
}
