import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajePDP } from "@/components/sites/maje/MajePDP";
import { findProductBySlug } from "@/components/sites/maje/product-slugs";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "Pantalon en tweed | Maje",
  description: "Pantalon en tweed — 295 € → 147,50 € (-50%). Livraison offerte sous 2 jours, retours offerts.",
};

export default function Page() {
  const product = findProductBySlug("pantalon-tweed");
  if (!product) notFound();
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajePDP product={product} />
      <MajeFooter />
    </main>
  );
}
