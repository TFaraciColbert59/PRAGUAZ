import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajePDP } from "@/components/sites/maje/MajePDP";
import {
  findProductBySlug,
  getCatalogSlug,
  MajePdpSlugs,
} from "@/components/sites/maje/product-slugs";
import { MajeCatalog } from "@/lib/maje/catalog";
import "@/components/sites/maje/maje.css";

export function generateStaticParams(): { slug: string }[] {
  const base = new Set(MajePdpSlugs);
  return MajeCatalog.map((p) => getCatalogSlug(p.id))
    .filter((slug) => !base.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) return { title: "Produit introuvable — Praguaz" };
  const price =
    product.oldPrice !== "" ? `${product.oldPrice} → ${product.newPrice}` : product.newPrice;
  return {
    title: `${product.name} | Praguaz`,
    description: `${product.name} — ${price}. Livraison offerte sous 2 jours, retours offerts.`,
  };
}

export default async function CatalogProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajePDP product={product} />
      <MajeFooter />
    </main>
  );
}
