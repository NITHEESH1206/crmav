import { Sidebar } from "@/components/app/sidebar";
import { MobileSidebar } from "@/components/app/mobile-sidebar";
import { Topbar } from "@/components/app/topbar";
import { QuickCreateProvider } from "@/components/app/quick-create-provider";
import { DetailDrawer } from "@/components/app/detail-drawer";
import { AssistantDrawer } from "@/components/ai/assistant-drawer";
import { KeyboardShortcuts } from "@/components/app/keyboard-shortcuts";
import { getLookups } from "@/lib/data/lookups";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const lookups = await getLookups();
  return (
    <div className="relative min-h-screen">
      <Sidebar />
      <MobileSidebar />
      <div className="lg:pl-[260px] min-h-screen flex flex-col">
        <Topbar />
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-12 pt-4 sm:pt-6">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
      <QuickCreateProvider lookups={lookups} />
      <DetailDrawer />
      <AssistantDrawer />
      <KeyboardShortcuts />
    </div>
  );
}
