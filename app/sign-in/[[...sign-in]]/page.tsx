import type { Metadata } from "next";
import { hasClerk } from "@/lib/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { DemoAuthNotice } from "@/components/auth/demo-notice";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

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

export default async function SignInPage() {
  if (!hasClerk()) {
    return (
      <AuthShell title="Welcome back" subtitle="Sign in to your ZynexAV workspace.">
        <DemoAuthNotice mode="sign-in" />
      </AuthShell>
    );
  }

  const { SignIn } = await import("@clerk/nextjs");
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your ZynexAV workspace.">
      <SignIn
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}
