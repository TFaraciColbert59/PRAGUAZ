import type { MetadataRoute } from "next";

import { MajeProducts } from "@/components/sites/maje/data";
import { PlpCategories } from "@/components/sites/maje/plp-data";
import { getProductSlug } from "@/components/sites/maje/product-slugs";

const SITE_URL = "https://www.praguaz.fr";

const STATIC_PAGES: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/fr/panier", changeFrequency: "weekly", priority: 0.5 },
  { path: "/fr/compte/connexion", changeFrequency: "monthly", priority: 0.4 },
  { path: "/fr/compte/inscription", changeFrequency: "monthly", priority: 0.4 },
  { path: "/fr/stores", changeFrequency: "weekly", priority: 0.6 },
  { path: "/fr/e-reservation", changeFrequency: "weekly", priority: 0.5 },
  { path: "/fr/carte-cadeau", changeFrequency: "monthly", priority: 0.5 },
  { path: "/fr/seconde-main", changeFrequency: "weekly", priority: 0.6 },
  { path: "/fr/recherche", changeFrequency: "weekly", priority: 0.4 },
  { path: "/fr/mon-dressing", changeFrequency: "weekly", priority: 0.5 },
  { path: "/fr/ma-wishlist", changeFrequency: "weekly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const plpEntries: MetadataRoute.Sitemap = PlpCategories.map((category) => ({
    url: `${SITE_URL}/fr/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const productEntries: MetadataRoute.Sitemap = MajeProducts.map((product) => ({
    url: `${SITE_URL}/fr/p/${getProductSlug(product)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...plpEntries, ...productEntries];
}
