import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "東亞拍賣有限公司 — AI文物鑑定系統",
  description: "專業中國文物AI智能鑑定平台，拍照即可獲取專業鑑定報告",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "東亞拍賣",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f1923",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-steel-950 text-steel-100 antialiased min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
