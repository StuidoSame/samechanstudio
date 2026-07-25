import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://samestudio.kr"),
  title: {
    default: "SAME STUDIO",
    template: "%s | SAME STUDIO",
  },
  description:
    "Small apps, made with a lot of care. Explore SAME STUDIO's independent mobile apps.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SAME STUDIO",
    title: "SAME STUDIO — Apps for thoughtful days",
    description:
      "Explore SAME STUDIO apps in a bright synthetic lavender universe.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "SAME STUDIO apps moving through a translucent lavender jelly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAME STUDIO — Apps for thoughtful days",
    description:
      "Explore SAME STUDIO apps in a bright synthetic lavender universe.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/assets/icons/favicon.ico",
    shortcut: "/assets/icons/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3eeff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
