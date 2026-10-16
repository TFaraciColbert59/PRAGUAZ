import type { Metadata } from "next";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeGiftCard } from "@/components/sites/maje/MajePages";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/pages.css";

export const metadata: Metadata = {
  title: "Carte cadeau | Maje",
  description: "Maquette : offrez une carte cadeau Maje — montants 50 à 200 €.",
};

export default function GiftCardPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-satellite-head">
        <nav className="maje-cms-breadcrumb" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          <span aria-hidden="true"> / </span>
          <span>Carte cadeau</span>
        </nav>
        <h1>La carte cadeau</h1>
        <p>Le cadeau sûr — valable en boutique et en ligne. Démo sans paiement réel.</p>
      </div>
      <MajeGiftCard amounts={[50, 100, 150, 200]} />
      <MajeFooter />
    </main>
  );
}
