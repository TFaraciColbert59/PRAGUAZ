import { MajeCatalog } from "@/lib/maje/catalog";
import { getHoverImage } from "@/lib/maje/hover-map";

export interface MajeProduct {
  id: string;
  name: string;
  oldPrice: string;
  newPrice: string;
  discount: string;
  image: string;
  hoverImage?: string;
  alt: string;
  category?: string;
}

const MajeBaseProducts: MajeProduct[] = [
  {
    id: "manteau-long-laine",
    name: "Manteau long en laine mélangée",
    oldPrice: "545 €",
    newPrice: "272,50 €",
    discount: "-50%",
    image: "/sites/maje/prod-manteau-long.jpg",
    alt: "Manteau long en laine mélangée",
    category: "manteaux",
  },
  {
    id: "bottine-chelsea-suede",
    name: "Bottine chelsea en suède",
    oldPrice: "395 €",
    newPrice: "197,50 €",
    discount: "-50%",
    image: "/sites/maje/prod-chelsea-suede.jpg",
    alt: "Bottine chelsea en suède",
    category: "chaussures",
  },
  {
    id: "pantalon-tweed",
    name: "Pantalon en tweed",
    oldPrice: "295 €",
    newPrice: "147,50 €",
    discount: "-50%",
    image: "/sites/maje/prod-pantalon-tweed.jpg",
    alt: "Pantalon en tweed",
    category: "pantalons-jeans",
  },
  {
    id: "cardigan-cape",
    name: "Cardigan effet cape",
    oldPrice: "345 €",
    newPrice: "172,50 €",
    discount: "-50%",
    image: "/sites/maje/prod-cardigan-cape.jpg",
    alt: "Cardigan effet cape",
    category: "pulls-cardigans",
  },
  {
    id: "milpli-cuir",
    name: "Milpli en cuir craquelé",
    oldPrice: "425 €",
    newPrice: "340 €",
    discount: "-20%",
    image: "/sites/maje/prod-milpli-cuir.jpg",
    alt: "Milpli en cuir craquelé",
    category: "sacs",
  },
  {
    id: "robe-maille",
    name: "Robe en maille avec pull amovible",
    oldPrice: "445 €",
    newPrice: "356 €",
    discount: "-20%",
    image: "/sites/maje/prod-robe-maille.jpg",
    alt: "Robe en maille avec pull amovible",
    category: "robes",
  },
];

function formatCatalogPrice(value: number): string {
  const text = Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(".", ",");
  return `${text} €`;
}

const MajeCatalogProducts: MajeProduct[] = MajeCatalog.map((p) => ({
  id: p.id,
  name: p.name,
  oldPrice: p.oldPrice === null ? "" : formatCatalogPrice(p.oldPrice),
  newPrice: formatCatalogPrice(p.newPrice),
  discount: p.discount ?? "",
  image: p.image,
  hoverImage: getHoverImage(p.id, p.image),
  alt: p.alt,
  category: p.category,
}));

export const MajeProducts: MajeProduct[] = [...MajeBaseProducts, ...MajeCatalogProducts];

export const MajeFeaturedProducts: MajeProduct[] = MajeBaseProducts;

export interface MajeCategoryLink {
  label: string;
  href: string;
}

export const MajeCategories: MajeCategoryLink[] = [
  { label: "Last Chance", href: "/fr/last-chance/tout-voir" },
  { label: "-50%", href: "/fr/last-chance/tout-voir" },
  { label: "Robes", href: "/fr/robes" },
  { label: "Vestes & Manteaux", href: "/fr/vestes-manteaux" },
  { label: "Pulls & Cardigans", href: "/fr/pulls-cardigans" },
  { label: "Pantalons & Jeans", href: "/fr/pantalons-jeans" },
  { label: "Sacs", href: "/fr/sacs" },
  { label: "Chaussures", href: "/fr/chaussures" },
];

export const MajeServices: { title: string; text: string }[] = [
  { title: "Livraison offerte", text: "À domicile sous 2 jours ouvrés" },
  { title: "Paiement en plusieurs fois", text: "Sans frais" },
  { title: "Échanges & Retours", text: "Offerts" },
  { title: "Suivi de commande", text: "En temps réel" },
];
