"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Database, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const looksLikeDbError =
    /prisma|database|connect|workspace|seed/i.test(error.message);

  return (
    <div className="min-h-[60vh] grid place-items-center px-6">
      <Card className="max-w-xl w-full">
        <CardContent className="p-8">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5">
            {looksLikeDbError ? (
              <Database className="h-5 w-5 text-amber-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            )}
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {looksLikeDbError ? "Database not connected" : "Something went sideways"}
          </h2>
          <p className="mt-2 text-sm text-white/55 leading-relaxed">
            {looksLikeDbError ? (
              <>
                This page reads from Postgres via Prisma, but the connection isn&apos;t live yet.
                Set <span className="font-mono text-aether-400">DATABASE_URL</span> in{" "}
                <span className="font-mono text-aether-400">.env.local</span>, then run{" "}
                <span className="font-mono text-aether-400">npm run prisma:push</span> and{" "}
                <span className="font-mono text-aether-400">npm run seed</span>.
              </>
            ) : (
              error.message
            )}
          </p>
          <div className="mt-6 flex items-center gap-2">
            <Button onClick={reset}>
              <RefreshCcw className="h-3.5 w-3.5" />
              Retry
            </Button>
            {error.digest && (
              <span className="text-[11px] text-white/35 font-mono">{error.digest}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
