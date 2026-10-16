import type { Metadata } from "next";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeCMSPage, type MajeCMSBlock } from "@/components/sites/maje/MajePages";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/pages.css";

export const metadata: Metadata = {
  title: "Seconde Main | Praguaz",
  description: "La seconde main Praguaz — pièces vérifiées, économie circulaire.",
};

const Blocks: MajeCMSBlock[] = [
  {
    heading: "Une seconde vie pour vos pièces",
    paragraphs: [
      "La Seconde Main prolonge la durée de vie des vestes, robes et sacs Praguaz : chaque pièce est vérifiée, nettoyée et reconditionnée avant d\u2019être remise en vente.",
      "Vendre ou acheter d\u2019occasion permet de réduire l\u2019impact environnemental tout en accédant aux icônes de la marque à prix doux.",
    ],
  },
  {
    heading: "Comment ça marche",
    paragraphs: [
      "Déposez vos pièces éligibles en boutique ou via le formulaire en ligne : nos équipes contrôlent l\u2019authenticité, l\u2019état et la conformité.",
      "Une fois validées, vos pièces sont publiées et vous recevez un crédit utilisable en boutique et en ligne.",
    ],
    links: [
      { label: "Voir les boutiques", href: "/fr/stores" },
      { label: "Carte cadeau", href: "/fr/carte-cadeau" },
    ],
  },
  {
    heading: "Sélection et qualité",
    paragraphs: [
      "Seules les pièces en bon état, sans défaut majeur, sont acceptées. Les articles en cuir et les pièces délicates font l\u2019objet d\u2019un contrôle renforcé.",
      "Chaque fiche produit d\u2019occasion précise l\u2019état, la taille et les éventuelles traces d\u2019usure.",
    ],
  },
  {
    heading: "Crédits et retours",
    paragraphs: [
      "Les crédits issus de la revente sont valables 12 mois et cumulables avec les offres en cours, hors périodes promotionnelles spécifiques.",
      "Les articles de seconde main ne sont ni repris ni échangés, sauf défaut avéré constaté sous 14 jours.",
    ],
  },
];

export default function SecondeMainPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajeCMSPage
        title="Seconde Main"
        eyebrow="Praguaz — Économie circulaire"
        intro="Donnez une seconde vie à vos pièces Praguaz : dépôt, reconditionnement et revente vérifiée."
        blocks={Blocks}
      />
      <MajeFooter />
    </main>
  );
}
