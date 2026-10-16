import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajePLP } from "@/components/sites/maje/MajePLP";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { getPlpCategory } from "@/components/sites/maje/plp-data";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "Nouveautés Femme | Maje",
  description:
    "Découvrez les nouveautés Maje : les dernières robes, sacs et mailles de la collection Femme.",
};

export default function NouveautesPage() {
  const category = getPlpCategory("nouveautes");
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
