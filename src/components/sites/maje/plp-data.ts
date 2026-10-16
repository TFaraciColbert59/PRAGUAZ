import { MajeProducts } from "./data";
import { getSizesForProduct } from "./product-slugs";

export interface PlpCategory {
  slug: string;
  title: string;
  sourceUrl: string;
  productIds: string[];
}

export const PlpCategories: PlpCategory[] = [
  {
    slug: "last-chance/tout-voir",
    title: "Last Chance : Tout voir",
    sourceUrl: "https://fr.maje.com/fr/last-chance/categories/tout-voir/",
    productIds: [
      "manteau-long-laine",
      "bottine-chelsea-suede",
      "pantalon-tweed",
      "cardigan-cape",
      "milpli-cuir",
      "robe-maille",
      "MFPOU01453_0130",
      "MFPRO04520_0201",
      "MFPRO04526_0505",
      "MFPRO04807_0201",
      "MFPCA00671_0524",
      "MFPCA00697_0505",
      "MFPPU00981_0101",
      "MFPPU00999_0259",
      "MFPPA00779_0103",
      "MFAPM00315_0524",
      "MFACH00831_2517",
      "MFACH00833_G008",
    ],
  },
  {
    slug: "robes",
    title: "Robes",
    sourceUrl: "https://fr.maje.com/fr/categories/robes/",
    productIds: [
      "robe-maille",
      "MFPRO04520_0201",
      "MFPRO04526_0505",
      "MFPRO04615_2517",
      "MFPRO04629_2517",
      "MFPRO04793_0103",
      "MFPRO04807_0201",
      "MFPRO04987_2517",
      "MFPRO05091_2517",
      "MFPRO05152_2517",
      "MFPRO05261_0103",
    ],
  },
  {
    slug: "vestes-manteaux",
    title: "Vestes & Manteaux",
    sourceUrl: "https://fr.maje.com/fr/categories/vestes-manteaux/",
    productIds: [
      "manteau-long-laine",
      "cardigan-cape",
      "MFPOU01402_0609",
      "MFPOU01409_2517",
      "MFPOU01453_0130",
      "MFPOU01490_0641",
      "MFPOU01497_0103",
      "MFPOU01564_0505",
      "MFPVE00725_2517",
      "MFPVE00824_0505",
    ],
  },
  {
    slug: "pulls-cardigans",
    title: "Pulls & Cardigans",
    sourceUrl: "https://fr.maje.com/fr/categories/pulls-cardigans/",
    productIds: [
      "cardigan-cape",
      "robe-maille",
      "MFPCA00671_0524",
      "MFPCA00691_2517",
      "MFPCA00697_0505",
      "MFPCA00756_0609",
      "MFPCA00785_2517",
      "MFPPU00950_0609",
      "MFPPU00981_0101",
      "MFPPU00999_0259",
      "MFPPU01032_0524",
      "MFPPU01112_0101",
    ],
  },
  {
    slug: "pantalons-jeans",
    title: "Pantalons & Jeans",
    sourceUrl: "https://fr.maje.com/fr/categories/pantalons-jeans/",
    productIds: [
      "pantalon-tweed",
      "MFPPA00544_2517",
      "MFPPA00753_2517",
      "MFPPA00779_0103",
      "MFPPA00879_0103",
      "MFPJE00778_0524",
      "MFPJE00786_0201",
      "MFPJE00826_G005",
      "MFPJE00861_0103",
    ],
  },
  {
    slug: "sacs",
    title: "Sacs",
    sourceUrl: "https://fr.maje.com/fr/categories/sacs/",
    productIds: [
      "milpli-cuir",
      "MFASA01052_2517",
      "MFASA01077_2517",
      "MFASA01123_0150",
      "MFASA01347_0035",
      "MFASA01443_2517",
      "MFASA01489_2517",
      "MFASA01475_0609",
      "MFASA01508_2517",
      "MFAPM00315_0524",
      "MFASA01468_2517",
    ],
  },
  {
    slug: "chaussures",
    title: "Chaussures",
    sourceUrl: "https://fr.maje.com/fr/categories/chaussures/",
    productIds: [
      "bottine-chelsea-suede",
      "MFACH00699_2517",
      "MFACH00831_2517",
      "MFACH00833_G008",
      "MFACH00892_10",
      "MFACH00895_10",
      "MFACH00929_2517",
      "MFACH00991_2517",
      "MFACH00947_U029",
    ],
  },
  {
    slug: "manteaux",
    title: "Manteaux",
    sourceUrl: "https://fr.maje.com/fr/categories/manteaux/",
    productIds: [
      "manteau-long-laine",
      "MFPOU01402_0609",
      "MFPOU01409_2517",
      "MFPOU01453_0130",
      "MFPOU01490_0641",
      "MFPOU01497_0103",
      "MFPOU01564_0505",
    ],
  },
  {
    slug: "tops-chemises",
    title: "Tops & Chemises",
    sourceUrl: "https://fr.maje.com/fr/categories/tops-chemises/",
    productIds: [
      "cardigan-cape",
      "robe-maille",
    ],
  },
  {
    slug: "jupes-shorts",
    title: "Jupes & Shorts",
    sourceUrl: "https://fr.maje.com/fr/categories/jupes-shorts/",
    productIds: [
      "pantalon-tweed",
    ],
  },
  {
    slug: "accessoires",
    title: "Accessoires",
    sourceUrl: "https://fr.maje.com/fr/categories/accessoires/",
    productIds: [
      "milpli-cuir",
      "bottine-chelsea-suede",
    ],
  },
  {
    slug: "nouveautes",
    title: "Nouveautés",
    sourceUrl: "https://fr.maje.com/fr/nouveautes/",
    productIds: [
      "robe-maille",
      "milpli-cuir",
      "cardigan-cape",
    ],
  },
];

export function getPlpCategory(slug: string): PlpCategory | undefined {
  return PlpCategories.find((category) => category.slug === slug);
}

export interface PlpProductMeta {
  id: string;
  colors: string[];
  sizes: string[];
  priceValue: number;
  isNew: boolean;
}

const FALLBACK_META: PlpProductMeta = {
  id: "",
  colors: [],
  sizes: [],
  priceValue: 0,
  isNew: false,
};

export const PlpMeta: Record<string, PlpProductMeta> = {
  "manteau-long-laine": {
    id: "manteau-long-laine",
    colors: ["Camel"],
    sizes: ["XS", "S", "M", "L", "XL"],
    priceValue: 272.5,
    isNew: false,
  },
  "bottine-chelsea-suede": {
    id: "bottine-chelsea-suede",
    colors: ["Marron"],
    sizes: ["TU"],
    priceValue: 197.5,
    isNew: false,
  },
  "pantalon-tweed": {
    id: "pantalon-tweed",
    colors: ["Beige"],
    sizes: ["XS", "S", "M", "L", "XL"],
    priceValue: 147.5,
    isNew: false,
  },
  "cardigan-cape": {
    id: "cardigan-cape",
    colors: ["Écru"],
    sizes: ["XS", "S", "M", "L", "XL"],
    priceValue: 172.5,
    isNew: false,
  },
  "milpli-cuir": {
    id: "milpli-cuir",
    colors: ["Noir"],
    sizes: ["TU"],
    priceValue: 340,
    isNew: true,
  },
  "robe-maille": {
    id: "robe-maille",
    colors: ["Noir"],
    sizes: ["XS", "S", "M", "L", "XL"],
    priceValue: 356,
    isNew: true,
  },
};

export function parsePlpPrice(price: string): number {
  const cleaned = price.replace(/€/g, "").replace(/[\s\u00a0]/g, "").replace(",", ".");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export function getPlpMeta(id: string): PlpProductMeta {
  const meta = PlpMeta[id];
  if (meta) return meta;
  const product = MajeProducts.find((p) => p.id === id);
  if (!product) return { ...FALLBACK_META, id };
  return {
    id,
    colors: [],
    sizes: getSizesForProduct(product),
    priceValue: parsePlpPrice(product.newPrice),
    isNew: false,
  };
}

export const PlpSizes: string[] = ["XS", "S", "M", "L", "XL", "TU"];

export const PlpColors: string[] = ["Beige", "Camel", "Écru", "Marron", "Noir"];

export interface PlpPriceBand {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

export const PlpPriceBands: PlpPriceBand[] = [
  { id: "under-200", label: "Moins de 200 €", min: 0, max: 200 },
  { id: "from-200-to-350", label: "De 200 € à 350 €", min: 200, max: 350 },
  { id: "over-350", label: "Plus de 350 €", min: 350, max: null },
];

export function inPriceBand(price: number, band: PlpPriceBand): boolean {
  if (price < band.min) return false;
  if (band.max === null) return true;
  return price < band.max;
}
