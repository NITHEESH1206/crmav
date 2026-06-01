import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";

/**
 * Shown on /sign-in and /sign-up when Clerk keys aren't configured.
 * Keeps the demo usable while signalling exactly how to turn auth on.
 */
export function DemoAuthNotice({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div className="glass-card w-full p-6 text-center">
      <span className="mx-auto mb-4 h-11 w-11 rounded-2xl bg-signal-500/12 border border-signal-500/20 flex items-center justify-center">
        <KeyRound className="h-5 w-5 text-signal-700" strokeWidth={1.9} />
      </span>
      <h2 className="text-[16px] font-medium text-ink-300">
        {mode === "sign-up" ? "Sign-up isn't live yet" : "Sign-in isn't live yet"}
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-300/65">
        This deployment is running in <strong>demo mode</strong>. Add your Clerk keys
        (<span className="font-mono text-[12px]">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</span> +{" "}
        <span className="font-mono text-[12px]">CLERK_SECRET_KEY</span>) to enable real
        accounts and per-company workspaces. See <span className="font-mono text-[12px]">AUTH_SETUP.md</span>.
      </p>

      <Link
        href="/dashboard"
        className="btn-glass-signal mt-5 inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-full text-[13.5px] font-medium"
      >
        Continue to the demo
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>

      <p className="mt-4 text-[12px] text-ink-300/50">
        {mode === "sign-up" ? (
          <>Already have an account? <Link href="/sign-in" className="text-signal-700 hover:underline">Sign in</Link></>
        ) : (
          <>New to ZynexAV? <Link href="/sign-up" className="text-signal-700 hover:underline">Create an account</Link></>
        )}
      </p>
    </div>
  );
}
