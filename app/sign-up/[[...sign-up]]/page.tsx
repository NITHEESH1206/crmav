import type { Metadata } from "next";
import { hasClerk } from "@/lib/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { DemoAuthNotice } from "@/components/auth/demo-notice";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create your account" };

const clerkAppearance = {
  variables: { colorPrimary: "#ff5a1f", borderRadius: "0.85rem" },
  elements: {
    rootBox: "w-full",
    card: "shadow-none bg-transparent",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer: "hidden",
  },
};

export default async function SignUpPage() {
  if (!hasClerk()) {
    return (
      <AuthShell title="Create your account" subtitle="Run your entire AV business from one place.">
        <DemoAuthNotice mode="sign-up" />
      </AuthShell>
    );
  }

  const { SignUp } = await import("@clerk/nextjs");
  return (
    <AuthShell title="Create your account" subtitle="Start free — no card required.">
      <SignUp
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}
