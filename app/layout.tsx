import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PW360 - Profunda Web3 Academy | Learn Web3, DeFi & Blockchain",
  description: "Break into Web3 with one subscription. Master DeFi, Development, and Marketing at your own pace. Join 2,400+ students on the waitlist for early access.",
  keywords: ["Web3", "DeFi", "Blockchain", "Crypto", "Education", "Online Learning", "Web3 Academy", "Cryptocurrency", "Smart Contracts"],
  authors: [{ name: "Profunda Web3 Academy" }],
  creator: "Profunda Web3 Academy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pw360.io",
    siteName: "PW360 - Profunda Web3 Academy",
    title: "PW360 - Learn Web3, DeFi & Blockchain",
    description: "Break into Web3 with one subscription. Master DeFi, Development, and Marketing at your own pace. Join the waitlist for early access.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "PW360 - Profunda Web3 Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PW360 - Learn Web3, DeFi & Blockchain",
    description: "Break into Web3 with one subscription. Master DeFi, Development, and Marketing at your own pace.",
    creator: "@thePW3acad",
    images: ["/logo.svg"],
  },
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
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
