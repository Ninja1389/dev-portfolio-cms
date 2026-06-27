import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
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
  title: {
    default: "DevPortfolio CMS",
    template: "%s — DevPortfolio CMS",
  },
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
  try {
    const user = await prisma.user.findFirst()
    avatarUrl = user?.avatarUrl ?? null
  } catch {}

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {avatarUrl && <link rel="icon" href={avatarUrl} />}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
