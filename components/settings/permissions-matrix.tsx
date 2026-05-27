"use client";

import { useState } from "react";
import { Check, X, ChevronDown, Lock, Shield } from "lucide-react";
import { ROLES, ROLE_LABEL, MODULE_LABEL, MATRIX_VERBS, moduleCaps, can, type Module, type Role } from "@/lib/permissions/roles";
import { cn } from "@/lib/utils";

const MODULE_GROUPS: { label: string; modules: Module[] }[] = [
  { label: "Sell", modules: ["opportunities", "accounts"] },
  { label: "Build", modules: ["projects", "rooms", "racks", "signal-flow", "catalog"] },
  { label: "Operate", modules: ["procurement", "inventory", "devices"] },
  { label: "Service", modules: ["service"] },
  { label: "Finance", modules: ["billing", "time"] },
  { label: "Insights", modules: ["reports", "todos", "automations", "audit"] },
  { label: "Documents", modules: ["documents"] },
  { label: "Workspace", modules: ["dashboard", "settings"] },
];

export function PermissionsMatrix() {
  const [activeRole, setActiveRole] = useState<Role>("SALES");

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="rounded-lg bg-bone-50 border border-bone-300/55 p-4 flex items-start gap-3">
        <div className="h-8 w-8 rounded-md bg-signal-500/10 flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-signal-600" />
        </div>
        <div className="text-[13px] text-ink-300/75 leading-relaxed">
          Roles control what each user can do across modules. Approval thresholds
          and project-level access are handled separately on each project and in
          <span className="font-medium text-ink-300"> Automations → Approvals</span>.
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setActiveRole(r)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors",
              activeRole === r
                ? "bg-ink-300 text-bone-100"
                : "text-ink-300/65 hover:text-ink-300 hover:bg-bone-100"
            )}
          >
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      {/* Matrix table */}
      <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-bone-300/55 bg-bone-50/60">
              <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
                Module
              </th>
              {MATRIX_VERBS.map((v) => (
                <th
                  key={v}
                  className="text-center px-2 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[60px]"
                >
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_GROUPS.map((group) => (
              <GroupRows key={group.label} label={group.label} role={activeRole} modules={group.modules} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Field-level rules note */}
      <div className="rounded-lg bg-white border border-bone-300/55 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-3.5 w-3.5 text-ink-300/55" />
          <h4 className="text-[13px] font-semibold text-ink-300">Field-level visibility</h4>
        </div>
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              <th className="py-1.5">Field</th>
              {ROLES.map((r) => (
                <th key={r} className="py-1.5 text-center">{ROLE_LABEL[r]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { field: "cost", label: "Unit cost (BOQ, POs)" },
              { field: "margin", label: "Project margin %" },
              { field: "salary", label: "Salary / billable rate" },
              { field: "internal-notes", label: "Internal notes" },
            ].map((row) => (
              <tr key={row.field} className="border-t border-bone-300/45">
                <td className="py-2 text-ink-300">{row.label}</td>
                {ROLES.map((r) => {
                  // Mirror the rules from roles.ts
                  const visible =
                    (row.field === "cost" && ["OWNER", "ADMIN", "ENGINEER"].includes(r)) ||
                    (row.field === "margin" && ["OWNER", "ADMIN"].includes(r)) ||
                    (row.field === "salary" && ["OWNER", "ADMIN"].includes(r)) ||
                    (row.field === "internal-notes" && r !== "MEMBER");
                  return (
                    <td key={r} className="py-2 text-center">
                      {visible ? (
                        <Check className="h-3.5 w-3.5 text-status-success-fg mx-auto" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-ink-300/25 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({ label, role, modules }: { label: string; role: Role; modules: Module[] }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <tr className="border-b border-bone-300/45 bg-bone-50/30">
        <td colSpan={8}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center gap-1.5 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold hover:text-ink-300"
          >
            <ChevronDown className={cn("h-3 w-3 transition-transform", !open && "-rotate-90")} />
            {label}
          </button>
        </td>
      </tr>
      {open &&
        modules.map((m) => {
          const caps = moduleCaps(role, m);
          const noAccess = caps.length === 0;
          return (
            <tr key={m} className="border-b border-bone-300/30">
              <td className="px-4 py-2 text-ink-300">
                {MODULE_LABEL[m]}
                {noAccess && (
                  <span className="ml-2 text-[10.5px] text-ink-300/45">No access</span>
                )}
              </td>
              {MATRIX_VERBS.map((v) => {
                const allowed = can(role, m, v);
                return (
                  <td key={v} className="px-2 py-2 text-center">
                    {allowed ? (
                      <Check className="h-3.5 w-3.5 text-status-success-fg mx-auto" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-ink-300/20 mx-auto" />
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
    </>
  );
}
