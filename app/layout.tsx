import type { Metadata } from "next";
import { Radio_Canada_Big, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

/**
 * Aetherfield's exact font stack:
 *  - Radio Canada Big: primary sans, body + display
 *  - Geist Mono: monospace (eyebrows, numeric callouts, kbd hints)
 *  - Source Serif 4: accent serif (testimonial quote)
 *
 * All three self-hosted via next/font/google — no FOUT, no extra network.
 */
const sans = Radio_Canada_Big({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
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
  themeColor: "#f4f2ec",
  colorScheme: "light" as const,
};

const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fontVars = `${sans.variable} ${mono.variable} ${serif.variable}`;
  const body = (
    <body
      className={`${fontVars} font-sans bg-bone-100 text-ink-300 antialiased min-h-screen`}
    >
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
            colorBackground: "#ffffff",
            colorText: "#0a0a0a",
            borderRadius: "0.85rem",
          },
        }}
      >
        <html lang="en">
          {body}
        </html>
      </ClerkProvider>
    );
  }

  return (
    <html lang="en">
      {body}
    </html>
  );
}
