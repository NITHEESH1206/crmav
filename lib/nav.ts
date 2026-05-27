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
  FileText,
  Activity,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type NavGroup =
  | "Pinned"
  | "Sell"
  | "Build"
  | "Operate"
  | "Service"
  | "Finance"
  | "Insights"
  | "Workspace";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  group: NavGroup;
  /** Optional keyboard hint shown beside the label, e.g. `G P`. */
  hint?: string;
};

/**
 * Verb-grouped navigation — Linear/Stripe-style information architecture.
 * Pinned items render outside groups at the top; Workspace pins to the bottom.
 */
export const NAV_ITEMS: NavItem[] = [
  // ── Pinned (always visible, no group header) ──
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Pinned", hint: "G D" },
  { label: "Calendar",  href: "/calendar",  icon: Calendar,        group: "Pinned", hint: "G K" },

  // ── SELL ── pipeline → close
  { label: "Opportunities", href: "/opportunities", icon: Target,     badge: "12", group: "Sell", hint: "G O" },
  { label: "Accounts",      href: "/accounts",      icon: Building2,               group: "Sell", hint: "G A" },

  // ── BUILD ── deliver the project
  { label: "Projects",     href: "/projects",     icon: FolderKanban, group: "Build", hint: "G P" },
  { label: "Rooms",        href: "/rooms",        icon: Layers3,      group: "Build" },
  { label: "Rack Builder", href: "/rack-builder", icon: Server,       group: "Build" },
  { label: "Signal Flow",  href: "/signal-flow",  icon: Network,      group: "Build" },
  { label: "Catalog",      href: "/catalog",      icon: BookOpen,     group: "Build", hint: "G C" },
  { label: "Files",        href: "/files",        icon: FileText,     group: "Build", hint: "G F" },

  // ── OPERATE ── supply chain + assets
  { label: "Procurement", href: "/procurement", icon: ShoppingCart, group: "Operate" },
  { label: "Inventory",   href: "/inventory",   icon: Boxes,        group: "Operate", hint: "G I" },
  { label: "Devices",     href: "/devices",     icon: Cpu,          group: "Operate" },
  { label: "Operations",  href: "/operations",  icon: Activity,     group: "Operate" },

  // ── SERVICE ── post-handover lifecycle
  { label: "Service", href: "/service", icon: LifeBuoy, badge: "4", group: "Service", hint: "G S" },

  // ── FINANCE ── money in / out
  { label: "Billing",      href: "/billing",      icon: Receipt, group: "Finance", hint: "G B" },
  { label: "Time Entries", href: "/time-entries", icon: Timer,   group: "Finance" },

  // ── INSIGHTS ── analyse + act
  { label: "Reports",     href: "/reports",     icon: BarChart3,  group: "Insights", hint: "G R" },
  { label: "To Dos",      href: "/todos",       icon: ListChecks, group: "Insights", hint: "G T" },
  { label: "Automations", href: "/automations", icon: Workflow,   group: "Insights" },

  // ── WORKSPACE ── always at the bottom
  { label: "Settings", href: "/settings", icon: Settings, group: "Workspace" },
];

/** Display order for the sidebar. `Pinned` and `Workspace` render specially. */
export const NAV_GROUPS = [
  "Sell",
  "Build",
  "Operate",
  "Service",
  "Finance",
  "Insights",
] as const satisfies readonly NavGroup[];

/** Single-letter map used by the `G + letter` chord shortcut. */
export const NAV_BY_HINT_LETTER: Record<string, string> = NAV_ITEMS.reduce(
  (acc, item) => {
    if (!item.hint) return acc;
    const letter = item.hint.split(" ").pop()?.toLowerCase();
    if (letter) acc[letter] = item.href;
    return acc;
  },
  {} as Record<string, string>
);
