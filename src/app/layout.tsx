import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MajeCartProvider } from "@/lib/maje/cart";
import { MajeCookie } from "@/components/sites/maje/MajeCookie";
import { MajeChat } from "@/components/sites/maje/MajeChat";
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
  title: "Website Clone",
  description: "Pixel-perfect website clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MajeCartProvider>{children}</MajeCartProvider>
        <MajeCookie />
        <MajeChat />
      </body>
    </html>
  );
}
