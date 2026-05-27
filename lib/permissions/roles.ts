/**
 * Role + capability matrix for ZynexAV.
 *
 * Capabilities are coarse module-level verbs. Field-level gating is handled
 * separately via the <Permit field=...> component (see ./permit.tsx).
 *
 * Existing Prisma Role enum:
 *   OWNER · ADMIN · SALES · ENGINEER · SERVICE_TECH · MEMBER
 *
 * Conceptual roles (PM / FINANCE / VIEWER) map onto these until a schema
 * migration extends the enum:
 *   PM      → ADMIN (with everything SALES + ENGINEER can do)
 *   FINANCE → ADMIN (with full money visibility)
 *   VIEWER  → MEMBER (read-only)
 */

export type Role =
  | "OWNER"
  | "ADMIN"
  | "SALES"
  | "ENGINEER"
  | "SERVICE_TECH"
  | "MEMBER";

export const ROLES: Role[] = [
  "OWNER",
  "ADMIN",
  "SALES",
  "ENGINEER",
  "SERVICE_TECH",
  "MEMBER",
];

export type Module =
  | "dashboard"
  | "opportunities"
  | "accounts"
  | "projects"
  | "rooms"
  | "racks"
  | "signal-flow"
  | "catalog"
  | "procurement"
  | "inventory"
  | "devices"
  | "service"
  | "billing"
  | "time"
  | "reports"
  | "todos"
  | "settings"
  | "automations"
  | "documents"
  | "audit";

export type Verb = "view" | "create" | "update" | "delete" | "approve" | "export" | "admin";

/**
 * Capability rule: who can do what. `*` = all verbs.
 *
 * Read-side: a Role appears in the array → that role has that verb on that module.
 */
type Caps = Partial<Record<Module, Verb[] | "*">>;

const ROLE_CAPS: Record<Role, Caps> = {
  OWNER: Object.fromEntries(
    (
      [
        "dashboard","opportunities","accounts","projects","rooms","racks","signal-flow",
        "catalog","procurement","inventory","devices","service","billing","time","reports",
        "todos","settings","automations","documents","audit",
      ] as Module[]
    ).map((m) => [m, "*"])
  ) as Caps,
  ADMIN: Object.fromEntries(
    (
      [
        "dashboard","opportunities","accounts","projects","rooms","racks","signal-flow",
        "catalog","procurement","inventory","devices","service","billing","time","reports",
        "todos","settings","automations","documents","audit",
      ] as Module[]
    ).map((m) => [m, "*"])
  ) as Caps,
  SALES: {
    dashboard:    ["view"],
    opportunities:["view","create","update","export"],
    accounts:     ["view","create","update","export"],
    projects:     ["view"],
    rooms:        ["view"],
    catalog:      ["view"],
    reports:      ["view","export"],
    todos:        ["view","create","update"],
    documents:    ["view"],
  },
  ENGINEER: {
    dashboard:    ["view"],
    projects:     ["view","create","update","export"],
    rooms:        ["view","create","update","delete"],
    racks:        ["view","create","update","delete"],
    "signal-flow":["view","create","update","delete"],
    catalog:      ["view"],
    inventory:    ["view"],
    devices:      ["view","create","update"],
    todos:        ["view","create","update"],
    documents:    ["view","create","update"],
  },
  SERVICE_TECH: {
    dashboard:    ["view"],
    service:      ["view","create","update"],
    devices:      ["view","update"],
    rooms:        ["view"],
    projects:     ["view"],
    todos:        ["view","create","update"],
    documents:    ["view"],
  },
  MEMBER: {
    dashboard: ["view"],
    projects:  ["view"],
    accounts:  ["view"],
    rooms:     ["view"],
    catalog:   ["view"],
    documents: ["view"],
  },
};

/** True if the role has the verb on the module. */
export function can(role: Role | undefined | null, module: Module, verb: Verb): boolean {
  if (!role) return false;
  const caps = ROLE_CAPS[role]?.[module];
  if (!caps) return false;
  if (caps === "*") return true;
  return caps.includes(verb);
}

/** Returns the role's capability map for a single module (used by the matrix UI). */
export function moduleCaps(role: Role, module: Module): Verb[] {
  const caps = ROLE_CAPS[role]?.[module];
  if (!caps) return [];
  if (caps === "*") return ["view", "create", "update", "delete", "approve", "export", "admin"];
  return caps;
}

/** The verbs we expose in the matrix UI. */
export const MATRIX_VERBS: Verb[] = ["view", "create", "update", "delete", "approve", "export", "admin"];

/** Friendly labels for the matrix UI. */
export const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  SALES: "Sales",
  ENGINEER: "Engineer",
  SERVICE_TECH: "Service tech",
  MEMBER: "Member",
};

export const MODULE_LABEL: Record<Module, string> = {
  dashboard: "Dashboard",
  opportunities: "Opportunities",
  accounts: "Accounts",
  projects: "Projects",
  rooms: "Rooms",
  racks: "Racks",
  "signal-flow": "Signal flow",
  catalog: "Catalog",
  procurement: "Procurement",
  inventory: "Inventory",
  devices: "Devices",
  service: "Service",
  billing: "Billing",
  time: "Time entries",
  reports: "Reports",
  todos: "To dos",
  settings: "Settings",
  automations: "Automations",
  documents: "Documents",
  audit: "Audit log",
};

/* ─── Field-level rules ─── */

/** Field-level gates — used by <Permit field=...>. */
export type Field = "cost" | "margin" | "salary" | "internal-notes";

const FIELD_VISIBLE_TO: Record<Field, Role[]> = {
  cost:            ["OWNER", "ADMIN", "ENGINEER"],   // engineering needs cost for BOQ
  margin:          ["OWNER", "ADMIN"],
  salary:          ["OWNER", "ADMIN"],
  "internal-notes":["OWNER", "ADMIN", "SALES", "ENGINEER", "SERVICE_TECH"],
};

export function canSeeField(role: Role | undefined | null, field: Field): boolean {
  if (!role) return false;
  return FIELD_VISIBLE_TO[field].includes(role);
}

/* ─── Project access modes (UI-level today; persisted in a follow-up migration) ─── */

export type ProjectAccessMode = "public" | "members" | "confidential";

export const PROJECT_ACCESS_LABEL: Record<ProjectAccessMode, string> = {
  public: "Public",
  members: "Members only",
  confidential: "Confidential",
};

export const PROJECT_ACCESS_DESCRIPTION: Record<ProjectAccessMode, string> = {
  public: "Anyone in the workspace can find and view this project.",
  members: "Only listed team members can see this project.",
  confidential: "Hidden from dashboards and search; admins only.",
};
