import { MajeCatalog } from "@/lib/maje/catalog";
import { MajeProducts, type MajeProduct } from "./data";

export const MajePdpSlugs: string[] = [
  "manteau-long-laine-melangee",
  "bottine-chelsea-suede",
  "pantalon-tweed",
  "cardigan-cape",
  "milpli-cuir",
  "robe-maille",
];

const SLUG_TO_ID: Record<string, string> = {
  "manteau-long-laine-melangee": "manteau-long-laine",
  "bottine-chelsea-suede": "bottine-chelsea-suede",
  "pantalon-tweed": "pantalon-tweed",
  "cardigan-cape": "cardigan-cape",
  "milpli-cuir": "milpli-cuir",
  "robe-maille": "robe-maille",
};

const ID_TO_SLUG: Record<string, string> = {
  "manteau-long-laine": "manteau-long-laine-melangee",
  "bottine-chelsea-suede": "bottine-chelsea-suede",
  "pantalon-tweed": "pantalon-tweed",
  "cardigan-cape": "cardigan-cape",
  "milpli-cuir": "milpli-cuir",
  "robe-maille": "robe-maille",
};

const CATEGORY_LABELS: Record<string, string> = {
  "manteaux": "Manteaux",
  "robes": "Robes",
  "pulls-cardigans": "Pulls & Cardigans",
  "pantalons-jeans": "Pantalons & Jeans",
  "sacs": "Sacs",
  "chaussures": "Chaussures",
  "vestes": "Vestes & Manteaux",
};

export function getCatalogSlug(id: string): string {
  return id.toLowerCase();
}

export function findProductBySlug(slug: string): MajeProduct | undefined {
  const id: string | undefined = SLUG_TO_ID[slug];
  if (id !== undefined) {
    return MajeProducts.find((p) => p.id === id);
  }
  const needle = slug.toLowerCase();
  return MajeProducts.find((p) => p.id.toLowerCase() === needle);
}

export function getProductSlug(product: MajeProduct): string {
  const slug: string | undefined = ID_TO_SLUG[product.id];
  if (slug !== undefined) return slug;
  return getCatalogSlug(product.id);
}

export function getCategoryForProduct(product: MajeProduct): string {
  if (product.category !== undefined) {
    const label: string | undefined = CATEGORY_LABELS[product.category];
    if (label !== undefined) return label;
  }
  const inCatalog = MajeCatalog.some((p) => p.id === product.id);
  if (inCatalog) return "Collection";
  if (product.id.includes("manteau")) return "Vestes & Manteaux";
  if (product.id.includes("cardigan")) return "Pulls & Cardigans";
  if (product.id.includes("pantalon")) return "Pantalons & Jeans";
  if (product.id.includes("bottine") || product.id.includes("chelsea")) return "Chaussures";
  if (product.id.includes("milpli")) return "Sacs";
  return "Robes";
}

export function getSizesForProduct(product: MajeProduct): string[] {
  const category = product.category ?? "";
  if (category === "chaussures") return ["36", "37", "38", "39", "40", "41"];
  if (category === "sacs") return ["TU"];
  if (category !== "") return ["XS", "S", "M", "L", "XL"];
  if (product.id.includes("bottine") || product.id.includes("chelsea")) {
    return ["36", "37", "38", "39", "40", "41"];
  }
  return ["XS", "S", "M", "L", "XL"];
}
