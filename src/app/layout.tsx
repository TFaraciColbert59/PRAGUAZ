import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MajeCartProvider } from "@/lib/maje/cart";
import { MajeDressingProvider } from "@/lib/maje/dressing";
import { MajeAuthProvider } from "@/lib/maje/auth";
import { JsonLdOrganization } from "@/components/sites/maje/MajeJsonLd";
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
  title: {
    default: "PRAGUAZ : Vêtements et Accessoires pour Femme",
    template: "%s | PRAGUAZ",
  },
  description: "Praguaz — prêt-à-porter féminin bohème chic.",
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
        <JsonLdOrganization />
        <MajeAuthProvider>
          <MajeCartProvider>
            <MajeDressingProvider>{children}</MajeDressingProvider>
          </MajeCartProvider>
        </MajeAuthProvider>
        <MajeCookie />
        <MajeChat />
      </body>
    </html>
  );
}
