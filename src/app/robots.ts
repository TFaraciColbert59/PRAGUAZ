import type { MetadataRoute } from "next";

const SITE_URL = "https://www.praguaz.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/fr/commande/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
