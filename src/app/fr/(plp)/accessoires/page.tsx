import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajePLP } from "@/components/sites/maje/MajePLP";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { getPlpCategory } from "@/components/sites/maje/plp-data";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "Accessoires Femme | Maje",
  description:
    "Découvrez les accessoires Maje : milpli en cuir, petite maroquinerie et bottines femme.",
};

export default function AccessoiresPage() {
  const category = getPlpCategory("accessoires");
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
