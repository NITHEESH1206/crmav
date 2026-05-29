/**
 * Welcome route group — full-bleed onboarding shell, no sidebar or topbar.
 *
 * Inherits the global font + DB-bound dynamic rendering; just paints its own
 * brand background. The wizard inside provides the entire chrome.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="fixed inset-0 -z-30 bg-bone-50" />
      <div
        aria-hidden
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(55% 45% at 50% -5%, rgba(255, 125, 63, 0.22), transparent 60%)",
            "radial-gradient(45% 35% at 8% 8%, rgba(255, 156, 102, 0.16), transparent 65%)",
            "radial-gradient(50% 40% at 92% 92%, rgba(255, 90, 31, 0.12), transparent 70%)",
            "radial-gradient(60% 50% at 50% 100%, rgba(255, 125, 63, 0.10), transparent 70%)",
          ].join(","),
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          mixBlendMode: "multiply",
        }}
      />
      <main className="relative">{children}</main>
    </div>
  );
}
