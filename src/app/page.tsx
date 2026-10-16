import type { Metadata } from "next";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeHero } from "@/components/sites/maje/MajeHero";
import { MajeProductGrid } from "@/components/sites/maje/MajeProductGrid";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import "@/components/sites/maje/maje.css";

export const metadata: Metadata = {
  title: "PRAGUAZ : Vêtements et Accessoires pour Femme",
  description: "Praguaz — prêt-à-porter féminin bohème chic : manteaux, robes, sacs et chaussures.",
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
