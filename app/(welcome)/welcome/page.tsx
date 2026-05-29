import { redirect } from "next/navigation";
import { WelcomeWizard } from "@/components/onboarding/welcome-wizard";
import { getOnboardingStatus } from "@/app/actions/onboarding";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const status = await getOnboardingStatus();
  if (status.isComplete) {
    // Already done — kick straight to the dashboard
    redirect("/dashboard");
  }
  const { step } = await searchParams;
  const initialStep = Math.max(1, Math.min(5, parseInt(step || "1", 10) || 1));

  return (
    <WelcomeWizard
      initialStep={initialStep}
      status={status}
    />
  );
}
