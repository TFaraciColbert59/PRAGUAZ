import type { Metadata } from "next";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeStoreLocator, type MajeStore } from "@/components/sites/maje/MajePages";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/pages.css";

export const metadata: Metadata = {
  title: "Store Locator — Nos boutiques | Praguaz",
  description: "Trouvez une boutique Praguaz à Paris et en France.",
};

const Stores: MajeStore[] = [
  {
    id: "marais",
    name: "Praguaz — Le Marais",
    address: "3 rue de Sévigné",
    zip: "75004",
    city: "Paris",
    phone: "01 44 07 12 30",
    hours: "Lun – Sam : 10h30 – 20h · Dim : 12h – 19h",
  },
  {
    id: "saint-germain",
    name: "Praguaz — Saint-Germain",
    address: "14 rue du Four",
    zip: "75006",
    city: "Paris",
    phone: "01 42 60 45 18",
    hours: "Lun – Sam : 10h30 – 20h · Dim : fermé",
  },
  {
    id: "haussmann",
    name: "Praguaz — Galeries Lafayette Haussmann",
    address: "40 boulevard Haussmann",
    zip: "75009",
    city: "Paris",
    phone: "01 42 82 34 56",
    hours: "Lun – Sam : 10h – 20h30 · Dim : 11h – 20h",
  },
  {
    id: "halles",
    name: "Praguaz — Forum des Halles",
    address: "101 porte Berger, niveau 1",
    zip: "75001",
    city: "Paris",
    phone: "01 40 26 78 90",
    hours: "Lun – Sam : 10h – 20h30 · Dim : 11h – 19h",
  },
  {
    id: "lyon",
    name: "Praguaz — Lyon République",
    address: "12 rue de la République",
    zip: "69002",
    city: "Lyon",
    phone: "04 78 42 19 64",
    hours: "Lun – Sam : 10h30 – 19h30",
  },
  {
    id: "bordeaux",
    name: "Praguaz — Bordeaux Centre",
    address: "34 cours de l\u2019Intendance",
    zip: "33000",
    city: "Bordeaux",
    phone: "05 56 44 28 71",
    hours: "Lun – Sam : 10h30 – 19h30",
  },
  {
    id: "marseille",
    name: "Praguaz — Marseille Saint-Ferréol",
    address: "20 rue Saint-Ferréol",
    zip: "13001",
    city: "Marseille",
    phone: "04 91 54 36 82",
    hours: "Lun – Sam : 10h – 19h30",
  },
  {
    id: "lille",
    name: "Praguaz — Lille Centre",
    address: "15 rue de la Grande Chaussée",
    zip: "59000",
    city: "Lille",
    phone: "03 20 57 93 14",
    hours: "Lun – Sam : 10h – 19h30 · Dim : fermé",
  },
];

export default function StoresPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-satellite-head">
        <h1>Nos boutiques</h1>
        <p>Adresses fictives à visée de maquette — recherchez par ville.</p>
      </div>
      <MajeStoreLocator stores={Stores} />
      <MajeFooter />
    </main>
  );
}
