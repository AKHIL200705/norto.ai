import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Norto — Your AI Companion for Every New City",
  description:
    "Norto is an AI-powered relocation and city assistant. Get personalized recommendations, local info, navigation, budgeting, emergency support, translation, weather, and nearby services — all in one intelligent app.",
  keywords: [
    "Norto",
    "relocation assistant",
    "city guide",
    "AI companion",
    "moving to a new city",
    "budget planner",
    "translator",
    "city explorer",
  ],
  authors: [{ name: "Norto" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Norto — Your AI Companion for Every New City",
    description:
      "AI-powered relocation and city assistant with maps, budgeting, translation, weather, emergency support, and more.",
    siteName: "Norto",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Norto",
    description: "Your AI Companion for Every New City",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
