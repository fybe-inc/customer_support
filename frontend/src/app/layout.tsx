import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import LocalStorageInitializer from "@/components/LocalStorageInitializer";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIカスタマーサポート",
  description: "AIを活用したカスタマーサポート支援システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1 ml-64">
            {/* LocalStorageの初期化コンポーネント */}
            <LocalStorageInitializer />
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
