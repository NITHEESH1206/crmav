"use client";

import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/** Rendered only when Clerk is active, so the useClerk() context always exists. */
export function SignOutItem() {
  const { signOut } = useClerk();
  return (
    <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/sign-in" })}>
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </DropdownMenuItem>
  );
}
