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
import { SessionProvider } from "@/lib/permissions/session";
import { getLookups } from "@/lib/data/lookups";

// All app routes are data-driven from Neon. Force on-demand rendering so the
// build doesn't try to statically pre-render 30+ pages in parallel and exhaust
// Neon's free-tier connection pool.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const lookups = await getLookups();
  return (
    <SessionProvider role="ADMIN">
    <div className="relative min-h-screen">
      <DensityMount />
      <Sidebar />
      <MobileSidebar />
      <div className="lg:pl-[244px] min-h-screen flex flex-col">
        <Topbar />
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
    </div>
    </SessionProvider>
  );
}
