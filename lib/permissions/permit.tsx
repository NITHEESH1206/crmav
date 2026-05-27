"use client";

import { useCurrentRole } from "./session";
import { can, canSeeField, type Module, type Verb, type Field } from "./roles";

/**
 * <Permit> — declarative permission gate.
 *
 * Module + verb:
 *   <Permit module="billing" verb="view"> ... </Permit>
 *
 * Field-level:
 *   <Permit field="cost"> $1,234 </Permit>
 *
 * Renders children when allowed; otherwise renders `fallback` (default null).
 *
 * For inline masking in tables, prefer the `fallback="—"` pattern so the
 * column still aligns visually.
 */
export function Permit({
  module,
  verb = "view",
  field,
  fallback = null,
  children,
}: {
  module?: Module;
  verb?: Verb;
  field?: Field;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const role = useCurrentRole();

  if (field) {
    return <>{canSeeField(role, field) ? children : fallback}</>;
  }
  if (module) {
    return <>{can(role, module, verb) ? children : fallback}</>;
  }
  return <>{children}</>;
}

/** Imperative hook variant for conditional logic outside JSX. */
export function usePermit() {
  const role = useCurrentRole();
  return {
    role,
    can: (module: Module, verb: Verb = "view") => can(role, module, verb),
    canSeeField: (field: Field) => canSeeField(role, field),
  };
}
