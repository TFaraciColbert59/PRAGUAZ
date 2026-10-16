import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajePLP } from "@/components/sites/maje/MajePLP";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { getPlpCategory } from "@/components/sites/maje/plp-data";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "Manteaux Femme | Praguaz",
  description:
    "Découvrez les manteaux Praguaz : manteaux longs en laine mélangée et manteaux d'hiver femme.",
};

export default function ManteauxPage() {
  const category = getPlpCategory("manteaux");
  if (!category) notFound();
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajePLP
        title={category.title}
        productIds={category.productIds}
      />
      <MajeFooter />
    </main>
  );
}
