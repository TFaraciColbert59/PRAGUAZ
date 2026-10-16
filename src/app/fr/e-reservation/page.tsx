import type { Metadata } from "next";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeCMSPage, type MajeCMSBlock } from "@/components/sites/maje/MajePages";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/pages.css";

export const metadata: Metadata = {
  title: "E-Réservation | Praguaz",
  description: "Maquette : réservez en ligne, essayez en boutique.",
};

const Blocks: MajeCMSBlock[] = [
  {
    heading: "Réservez en ligne, essayez en boutique",
    paragraphs: [
      "L\u2019E-Réservation vous permet de mettre de côté vos coups de cœur dans la boutique de votre choix, sans payer en ligne.",
      "Vous recevez une confirmation par e-mail ou SMS dès que vos articles sont disponibles à l\u2019essayage.",
    ],
  },
  {
    heading: "Comment réserver",
    paragraphs: [
      "Choisissez un article, sélectionnez votre taille puis la boutique de retrait parmi celles proposées.",
      "Présentez votre confirmation en caisse : nos conseillères préparent votre cabine pour un essayage dans les meilleures conditions.",
    ],
    links: [
      { label: "Trouver une boutique", href: "/fr/stores" },
      { label: "Suivi de commande", href: "/fr/aide/suivi-commande" },
    ],
  },
  {
    heading: "Disponibilité et délai",
    paragraphs: [
      "Vos articles sont conservés 72 heures en boutique. Passé ce délai, la réservation est annulée sans frais.",
      "Les stocks affichés sont indicatifs : en cas d\u2019indisponibilité, nous vous proposons une alternative ou une autre boutique.",
    ],
  },
  {
    heading: "Retrait et paiement",
    paragraphs: [
      "Le paiement s\u2019effectue en boutique, par les moyens habituels, y compris en plusieurs fois sans frais selon conditions.",
      "Aucun acompte n\u2019est demandé : si la taille ou le modèle ne convient pas, repartez sans obligation d\u2019achat.",
    ],
  },
];

export default function EReservationPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajeCMSPage
        title="E-Réservation"
        eyebrow="Praguaz — Services boutique"
        intro="Mettez vos pièces de côté en ligne et essayez-les tranquillement en boutique."
        blocks={Blocks}
      />
      <MajeFooter />
    </main>
  );
}
