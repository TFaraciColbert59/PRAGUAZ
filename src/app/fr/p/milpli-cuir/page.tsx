import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajePDP } from "@/components/sites/maje/MajePDP";
import { findProductBySlug } from "@/components/sites/maje/product-slugs";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "Milpli en cuir craquelé | Maje",
  description: "Milpli en cuir craquelé — 425 € → 340 € (-20%). Livraison offerte sous 2 jours, retours offerts.",
};

export default function Page() {
  const product = findProductBySlug("milpli-cuir");
  if (!product) notFound();
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajePDP product={product} />
      <MajeFooter />
    </main>
  );
}
