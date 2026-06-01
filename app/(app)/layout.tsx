import { Sidebar } from "@/components/app/sidebar";
import { MobileSidebar } from "@/components/app/mobile-sidebar";
import { Topbar } from "@/components/app/topbar";
import { QuickCreateProvider } from "@/components/app/quick-create-provider";
import { DetailDrawer } from "@/components/app/detail-drawer";
import { AssistantDrawer } from "@/components/ai/assistant-drawer";
import { KeyboardShortcuts } from "@/components/app/keyboard-shortcuts";
import { DensityMount } from "@/components/app/density-mount";
import { CommandPalette } from "@/components/palette/command-palette";
import { GenerationDrawer } from "@/components/ai/generation-drawer";
import { CopilotRail } from "@/components/ai/copilot-rail";
import { SessionProvider } from "@/lib/permissions/session";
import { getLookups } from "@/lib/data/lookups";
import { hasClerk, getCurrentUserDisplay } from "@/lib/auth";

// All app routes are data-driven from Neon. Force on-demand rendering so the
// build doesn't try to statically pre-render 30+ pages in parallel and exhaust
// Neon's free-tier connection pool.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [lookups, user] = await Promise.all([getLookups(), getCurrentUserDisplay()]);
  const clerkActive = hasClerk();
  return (
    <SessionProvider role="ADMIN">
    <div className="relative min-h-screen">
      {/* Ambient brand wash for the app — softer than the landing's so
          dense content stays readable, but enough that the glass chrome
          picks up the warmth. */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-bone-50 pointer-events-none"
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(50% 40% at 5% 0%, rgba(255, 125, 63, 0.12), transparent 65%)",
            "radial-gradient(45% 35% at 95% 8%, rgba(255, 156, 102, 0.08), transparent 70%)",
            "radial-gradient(55% 45% at 50% 100%, rgba(255, 90, 31, 0.06), transparent 70%)",
          ].join(","),
        }}
      />
      <DensityMount />
      <Sidebar />
      <MobileSidebar />
      <div className="lg:pl-[244px] min-h-screen flex flex-col">
        <Topbar user={user} clerkActive={clerkActive} />
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-12 pt-4 sm:pt-6">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
      <QuickCreateProvider lookups={lookups} />
      <DetailDrawer />
      <AssistantDrawer />
      <KeyboardShortcuts />
      <CommandPalette />
      <GenerationDrawer />
      <CopilotRail />
    </div>
    </SessionProvider>
  );
}
