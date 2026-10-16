import type { Metadata } from "next";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeHero } from "@/components/sites/maje/MajeHero";
import { MajeProductGrid } from "@/components/sites/maje/MajeProductGrid";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "Maje Site Officiel : Vêtements et Accessoires pour Femme",
  description: "Clone éducatif de la homepage fr.maje.com — Last Chance, pièces favorites.",
};

export default function Home() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajeHero />
      <MajeProductGrid />
      <MajeFooter />
    </main>
  );
}
