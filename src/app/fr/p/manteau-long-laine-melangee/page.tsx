import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajePDP } from "@/components/sites/maje/MajePDP";
import { findProductBySlug } from "@/components/sites/maje/product-slugs";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "Manteau long en laine mélangée | Maje",
  description: "Manteau long en laine mélangée — 545 € → 272,50 € (-50%). Livraison offerte sous 2 jours, retours offerts.",
};

export default function Page() {
  const product = findProductBySlug("manteau-long-laine-melangee");
  if (!product) notFound();
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajePDP product={product} />
      <MajeFooter />
    </main>
  );
}
