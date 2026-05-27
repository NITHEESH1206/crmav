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
  themeColor: "#f4f2ec",
  colorScheme: "light" as const,
};

const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const body = (
    <body
      className={`${mono.variable} font-sans bg-bone-100 text-ink-300 antialiased min-h-screen`}
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
