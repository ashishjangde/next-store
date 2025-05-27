import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalContextProvider from "@/components/context";

// Import React 19 error handler for compatibility
import "@/utils/react19-error-handler";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextStore",
  description: "A modern e-commerce platform built with Next.js",
  openGraph: {
    title: "NextStore",
    description: "A modern e-commerce platform built with Next.js",
    url: "https://nextstore.example.com",
    siteName: "NextStore",
    images: [
      {
        url: "https://nextstore.example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "NextStore Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextStore",
    description: "A modern e-commerce platform built with Next.js",
    images: ["https://nextstore.example.com/twitter-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
  },
  themeColor: "#ffffff",
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,   
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalContextProvider>
            {children}
        </GlobalContextProvider>
      </body>
    </html>
  );
}
