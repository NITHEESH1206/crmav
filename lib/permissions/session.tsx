"use client";

import { createContext, useContext } from "react";
import type { Role } from "./roles";

/**
 * Lightweight client-side role context. The server-rendered shell populates
 * this once per page; downstream client components read it via `useCurrentRole`.
 *
 * Until per-user auth is fully wired, this defaults to "ADMIN" so the UI
 * renders with full visibility during development.
 */
type SessionContextValue = {
  role: Role;
};

const SessionContext = createContext<SessionContextValue>({ role: "ADMIN" });

export function SessionProvider({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={{ role }}>{children}</SessionContext.Provider>;
}

export function useCurrentRole(): Role {
  return useContext(SessionContext).role;
}
