import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajePLP } from "@/components/sites/maje/MajePLP";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { getPlpCategory } from "@/components/sites/maje/plp-data";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "Pulls & Cardigans Femme | Maje",
  description:
    "Découvrez les pulls et cardigans Maje : mailles fines, cardigans effet cape et pulls amovibles.",
};

export default function PullsCardigansPage() {
  const category = getPlpCategory("pulls-cardigans");
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
