import {
  LayoutDashboard,
  Calendar,
  Target,
  FolderKanban,
  LifeBuoy,
  ShoppingCart,
  Boxes,
  BookOpen,
  Building2,
  Receipt,
  Timer,
  BarChart3,
  ListChecks,
  Settings,
  Server,
  Network,
  Layers3,
  Cpu,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  group: "Core" | "Operations" | "AV Tools" | "Finance" | "System";
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Core" },
  { label: "Calendar", href: "/calendar", icon: Calendar, group: "Core" },
  { label: "Opportunities", href: "/opportunities", icon: Target, badge: "12", group: "Core" },
  { label: "Projects", href: "/projects", icon: FolderKanban, group: "Operations" },
  { label: "Service", href: "/service", icon: LifeBuoy, badge: "4", group: "Operations" },
  { label: "Procurement", href: "/procurement", icon: ShoppingCart, group: "Operations" },
  { label: "Inventory", href: "/inventory", icon: Boxes, group: "Operations" },
  { label: "Catalog", href: "/catalog", icon: BookOpen, group: "Operations" },
  { label: "Rack Builder", href: "/rack-builder", icon: Server, group: "AV Tools" },
  { label: "Signal Flow", href: "/signal-flow", icon: Network, group: "AV Tools" },
  { label: "Rooms", href: "/rooms", icon: Layers3, group: "AV Tools" },
  { label: "Devices", href: "/devices", icon: Cpu, group: "AV Tools" },
  { label: "Accounts", href: "/accounts", icon: Building2, group: "Finance" },
  { label: "Billing", href: "/billing", icon: Receipt, group: "Finance" },
  { label: "Time Entries", href: "/time-entries", icon: Timer, group: "Finance" },
  { label: "Reports", href: "/reports", icon: BarChart3, group: "System" },
  { label: "To Dos", href: "/todos", icon: ListChecks, group: "System" },
  { label: "Settings", href: "/settings", icon: Settings, group: "System" },
];

export const NAV_GROUPS = ["Core", "Operations", "AV Tools", "Finance", "System"] as const;
