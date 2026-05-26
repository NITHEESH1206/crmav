import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// PP Neue Montreal loads via @import in globals.css (cdnfonts CDN).
// Keep JetBrains Mono for code/data styling.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ZynexAV CRM — The Enterprise CRM Built For AV Companies",
    template: "%s · ZynexAV CRM",
  },
  description:
    "Manage projects, clients, inventory, procurement, service tickets, billing, and AV operations from one cinematic platform built for system integrators and consultants.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: "ZynexAV CRM",
  authors: [{ name: "ZynexAV" }],
  keywords: [
    "AV CRM",
    "audio visual CRM",
    "system integrator software",
    "AV project management",
    "BOQ tracking",
    "rack builder",
    "signal flow",
    "AMC",
    "AV service desk",
    "Crestron",
    "Q-SYS",
    "Extron",
    "Biamp",
    "Shure",
  ],
  openGraph: {
    title: "ZynexAV CRM",
    description: "The enterprise CRM built for AV companies.",
    type: "website",
    siteName: "ZynexAV CRM",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZynexAV CRM",
    description: "The enterprise CRM built for AV companies.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark" as const,
};

const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const body = (
    <body
      className={`${mono.variable} font-sans bg-ink-300 text-bone-100 antialiased min-h-screen`}
    >
      <div className="fixed inset-0 -z-50 bg-ink-300" aria-hidden />
      <div className="fixed inset-0 -z-40 bg-signal-mesh opacity-60" aria-hidden />
      <div className="fixed inset-0 -z-30 noise" aria-hidden />
      {children}
      <Toaster />
    </body>
  );

  if (hasClerk) {
    const { ClerkProvider } = await import("@clerk/nextjs");
    return (
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: "#ff5a1f",
            colorBackground: "#0a0a0a",
            colorText: "#f4f2ec",
            borderRadius: "0.85rem",
          },
        }}
      >
        <html lang="en" className="dark">
          {body}
        </html>
      </ClerkProvider>
    );
  }

  return (
    <html lang="en" className="dark">
      {body}
    </html>
  );
}
