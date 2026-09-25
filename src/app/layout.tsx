import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseAuthProvider } from "@/components/auth/supabase-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Norto — Industrial AI Companion for Every New City",
  description:
    "Norto is an AI-powered relocation and city assistant. Get personalized recommendations, local info, navigation, budgeting, emergency support, translation, weather, and nearby services — all in one tactile, physical interface.",
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
    title: "Norto — Industrial AI Companion for Every New City",
    description:
      "AI-powered relocation and city assistant with maps, budgeting, translation, weather, emergency support, and more.",
    siteName: "Norto",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Norto",
    description: "Your Industrial AI Companion for Every New City",
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
        suppressHydrationWarning
        className={`${inter.variable} ${mono.variable} font-sans antialiased bg-[#e0e5ec] text-[#2d3436]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseAuthProvider>
            {children}
          </SupabaseAuthProvider>
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
