import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { prisma } from "@/lib/prisma"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "DevPortfolio CMS",
  description: "Developer Portfolio Content Management System",
  openGraph: {
    siteName: "DevPortfolio CMS",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let avatarUrl: string | null = null
  let accentColor: string | null = null
  try {
    const user = await prisma.user.findFirst()
    avatarUrl = user?.avatarUrl ?? null
    accentColor = user?.accentColor ?? null
  } catch {}

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {avatarUrl && <link rel="icon" href={avatarUrl} />}
      </head>
      <body className="min-h-full flex flex-col" style={accentColor ? ({ "--accent-custom": accentColor } as React.CSSProperties) : undefined}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
