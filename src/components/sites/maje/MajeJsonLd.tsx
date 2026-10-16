import { parseMajePrice } from "@/lib/maje/cart";
import type { MajeProduct } from "./data";
import { getProductSlug } from "./product-slugs";

const SITE_URL = "https://www.praguaz.fr";

/**
 * JSON-LD Organization + WebSite (a placer une fois, ex. dans le layout).
 *
 * @example
 * ```tsx
 * import { JsonLdOrganization } from "@/components/sites/maje/MajeJsonLd";
 *
 * export default function Layout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="fr">
 *       <body>
 *         <JsonLdOrganization />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function JsonLdOrganization() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "PRAGUAZ",
        url: SITE_URL,
        logo: `${SITE_URL}/sites/maje/logo.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "PRAGUAZ",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

interface JsonLdProductProps {
  product: MajeProduct;
}

/**
 * JSON-LD Product (a placer sur chaque PDP).
 *
 * @example
 * ```tsx
 * import { JsonLdProduct } from "@/components/sites/maje/MajeJsonLd";
 *
 * export default function Pdp({ product }: { product: MajeProduct }) {
 *   return (
 *     <main>
 *       <JsonLdProduct product={product} />
 *       <p>Reste de la PDP</p>
 *     </main>
 *   );
 * }
 * ```
 */
export function JsonLdProduct({ product }: JsonLdProductProps) {
  const price = parseMajePrice(product.newPrice);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [`${SITE_URL}${product.image}`],
    description: product.alt,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "PRAGUAZ",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/fr/p/${getProductSlug(product)}`,
      priceCurrency: "EUR",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
