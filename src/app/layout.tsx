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
  title: "LifeLens AI — Your AI Companion for Every New City",
  description:
    "LifeLens AI is an AI-powered relocation and city assistant. Get personalized recommendations, local info, navigation, budgeting, emergency support, translation, weather, and nearby services — all in one intelligent app.",
  keywords: [
    "LifeLens AI",
    "relocation assistant",
    "city guide",
    "AI companion",
    "moving to a new city",
    "budget planner",
    "translator",
    "city explorer",
  ],
  authors: [{ name: "LifeLens AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "LifeLens AI — Your AI Companion for Every New City",
    description:
      "AI-powered relocation and city assistant with maps, budgeting, translation, weather, emergency support, and more.",
    siteName: "LifeLens AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeLens AI",
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
