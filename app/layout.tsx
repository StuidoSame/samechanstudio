import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAME STUDIO",
  description:
    "Small apps, made with a lot of care. Explore SAME STUDIO's independent mobile apps.",
  openGraph: {
    type: "website",
    url: "https://samestudio.kr/",
    siteName: "SAME STUDIO",
    title: "SAME STUDIO",
    description:
      "Explore SAME STUDIO apps in a bright synthetic lavender universe.",
    images: [
      {
        url: "https://samestudio.kr/og.png",
        width: 1200,
        height: 630,
        alt: "SAME STUDIO apps moving through a translucent lavender jelly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAME STUDIO",
    description:
      "Explore SAME STUDIO apps in a bright synthetic lavender universe.",
    images: ["https://samestudio.kr/og.png"],
  },
  icons: {
    icon: {
      url: "/assets/favicon/favicon.ico",
      type: "image/x-icon",
    },
    shortcut: "/assets/favicon/favicon.ico",
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
      <body>{children}</body>
    </html>
  );
}
