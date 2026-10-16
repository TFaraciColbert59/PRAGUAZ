import type { Metadata } from "next";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import "@/components/sites/maje/pages.css";

export const metadata: Metadata = {
  title: "Mon compte — Maje",
  description: "Espace compte (maquette) : commandes, wishlist et informations personnelles.",
};

const AccountSections = [
  { title: "Mes commandes", text: "Suivez vos commandes en cours et consultez votre historique d'achats.", href: "/fr/panier/" },
  { title: "Ma wishlist", text: "Retrouvez les pièces que vous avez mises de côté.", href: "/fr/ma-wishlist/" },
  { title: "Mes informations", text: "Gérez vos coordonnées, adresses et préférences de communication.", href: "/fr/aide/nous-contacter/" },
  { title: "E-réservation", text: "Réservez en boutique et essayez vos pièces préférées.", href: "/fr/e-reservation/" },
];

export default function MonComptePage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <section className="maje-cms">
        <p className="maje-cms-eyebrow">Espace client</p>
        <h1 className="maje-cms-title">Mon compte</h1>
        <p className="maje-cms-intro">
          Maquette fonctionnelle : la connexion est simulée, vos données restent dans votre navigateur.
        </p>
        <div className="maje-account-grid">
          {AccountSections.map((section) => (
            <Link key={section.title} href={section.href} className="maje-account-card">
              <strong>{section.title}</strong>
              <span>{section.text}</span>
            </Link>
          ))}
        </div>
      </section>
      <MajeFooter />
    </main>
  );
}
