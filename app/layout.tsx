import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AetherAV CRM — The Enterprise CRM Built For AV Companies",
    template: "%s · AetherAV CRM",
  },
  description:
    "Manage projects, clients, inventory, procurement, service tickets, billing, and AV operations from one cinematic platform built for system integrators and consultants.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: "AetherAV CRM",
  authors: [{ name: "AetherAV" }],
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
    title: "AetherAV CRM",
    description: "The enterprise CRM built for AV companies.",
    type: "website",
    siteName: "AetherAV CRM",
  },
  twitter: {
    card: "summary_large_image",
    title: "AetherAV CRM",
    description: "The enterprise CRM built for AV companies.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#050505",
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
      className={`${inter.variable} ${display.variable} ${mono.variable} font-sans bg-ink-300 text-white antialiased min-h-screen`}
    >
      <div className="fixed inset-0 -z-50 bg-ink-300" aria-hidden />
      <div className="fixed inset-0 -z-40 bg-aether-mesh opacity-60" aria-hidden />
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
            colorPrimary: "#ff6b00",
            colorBackground: "#050505",
            colorText: "#ffffff",
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
