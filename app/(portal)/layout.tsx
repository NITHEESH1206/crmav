/**
 * Portal layout — separate from the main app shell.
 * No sidebar, no command palette, no quick-create. Just branded chrome.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bone-100 text-ink-300 font-sans">
      {children}
    </div>
  );
}
