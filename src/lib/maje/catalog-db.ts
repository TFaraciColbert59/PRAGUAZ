import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { MajeCatalog } from "./catalog";

export interface DbVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  priceCents: number | null;
}

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  compareAtCents: number | null;
  category: string;
  colors: string[];
  materials: string[];
  images: string[];
  variants: DbVariant[];
}

export interface AvailabilityItem {
  id: string;
  size: string;
  qty: number;
}

export interface AvailabilityCheck {
  ok: boolean;
  problems: string[];
}

export interface CouponValidation {
  ok: boolean;
  percent: number;
  reason: string;
}

type SupabaseLike = ReturnType<typeof createBrowserClient>;

interface ParsedProduct {
  product: DbProduct;
  sourceId: string;
}

interface DbCouponRow {
  percent: number;
  quota: number | null;
  used: number;
  minTotalCents: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
}

interface LocalSeed {
  id: string;
  name: string;
  oldPrice: number | null;
  newPrice: number;
  image: string;
  alt: string;
  category: string;
}

// Mapping explicite des 6 produits de base (miroir de product-slugs.ts,
// recalculé ici pour éviter tout import dynamique et toute dépendance
// de la couche lib vers la couche components).
const BASE_ID_TO_SLUG: Record<string, string> = {
  "manteau-long-laine": "manteau-long-laine-melangee",
  "bottine-chelsea-suede": "bottine-chelsea-suede",
  "pantalon-tweed": "pantalon-tweed",
  "cardigan-cape": "cardigan-cape",
  "milpli-cuir": "milpli-cuir",
  "robe-maille": "robe-maille",
};

const BASE_PRODUCTS: LocalSeed[] = [
  {
    id: "manteau-long-laine",
    name: "Manteau long en laine mélangée",
    oldPrice: 545,
    newPrice: 272.5,
    image: "/sites/maje/prod-manteau-long.jpg",
    alt: "Manteau long en laine mélangée",
    category: "manteaux",
  },
  {
    id: "bottine-chelsea-suede",
    name: "Bottine chelsea en suède",
    oldPrice: 395,
    newPrice: 197.5,
    image: "/sites/maje/prod-chelsea-suede.jpg",
    alt: "Bottine chelsea en suède",
    category: "chaussures",
  },
  {
    id: "pantalon-tweed",
    name: "Pantalon en tweed",
    oldPrice: 295,
    newPrice: 147.5,
    image: "/sites/maje/prod-pantalon-tweed.jpg",
    alt: "Pantalon en tweed",
    category: "pantalons-jeans",
  },
  {
    id: "cardigan-cape",
    name: "Cardigan effet cape",
    oldPrice: 345,
    newPrice: 172.5,
    image: "/sites/maje/prod-cardigan-cape.jpg",
    alt: "Cardigan effet cape",
    category: "pulls-cardigans",
  },
  {
    id: "milpli-cuir",
    name: "Milpli en cuir craquelé",
    oldPrice: 425,
    newPrice: 340,
    image: "/sites/maje/prod-milpli-cuir.jpg",
    alt: "Milpli en cuir craquelé",
    category: "sacs",
  },
  {
    id: "robe-maille",
    name: "Robe en maille avec pull amovible",
    oldPrice: 445,
    newPrice: 356,
    image: "/sites/maje/prod-robe-maille.jpg",
    alt: "Robe en maille avec pull amovible",
    category: "robes",
  },
];

const FALLBACK_COUPONS: Record<string, { percent: number; reason: string }> = {
  BIENVENUE10: { percent: 10, reason: "Code de bienvenue : -10 % appliqué." },
  PREMIERES50: {
    percent: 20,
    reason: "Offre de lancement : -20 % (quota limité, dans la limite des stocks).",
  },
};

function localSlugForId(id: string): string {
  const mapped: string | undefined = BASE_ID_TO_SLUG[id];
  if (mapped !== undefined) return mapped;
  return id.toLowerCase();
}

function sizesForCategory(category: string): string[] {
  if (category === "chaussures") return ["36", "37", "38", "39", "40", "41"];
  if (category === "sacs") return ["TU"];
  return ["XS", "S", "M", "L", "XL"];
}

function toLocalProduct(seed: LocalSeed): DbProduct {
  const slug = localSlugForId(seed.id);
  return {
    id: seed.id,
    slug,
    name: seed.name,
    description: seed.alt,
    priceCents: Math.round(seed.newPrice * 100),
    currency: "EUR",
    compareAtCents: seed.oldPrice === null ? null : Math.round(seed.oldPrice * 100),
    category: seed.category,
    colors: [],
    materials: [],
    images: [seed.image],
    variants: sizesForCategory(seed.category).map((size) => ({
      id: `${slug}-${size}`,
      sku: `${seed.id}-${size}`,
      size,
      color: "",
      stock: 10,
      priceCents: null,
    })),
  };
}

function buildLocalCatalog(): DbProduct[] {
  const catalogSeeds: LocalSeed[] = MajeCatalog.map((p) => ({
    id: p.id,
    name: p.name,
    oldPrice: p.oldPrice,
    newPrice: p.newPrice,
    image: p.image,
    alt: p.alt,
    category: p.category,
  }));
  return [...BASE_PRODUCTS.map(toLocalProduct), ...catalogSeeds.map(toLocalProduct)];
}

function getSupabaseClient(): SupabaseLike | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    if (typeof window !== "undefined") {
      return createBrowserClient(url, anonKey);
    }
    const serverClient = createServerClient(url, anonKey, {
      cookies: {
        getAll: (): { name: string; value: string }[] => [],
        setAll: (): void => {},
      },
    });
    return serverClient as unknown as SupabaseLike;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function asIntOrNull(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(value);
}

function asInt(value: unknown, fallback: number): number {
  const parsed = asIntOrNull(value);
  return parsed === null ? fallback : parsed;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string") out.push(entry);
  }
  return out;
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

function parseProductRow(row: Record<string, unknown>): ParsedProduct | null {
  const sourceId = asString(row["id"], "");
  const slugRaw = asNonEmptyString(row["slug"]);
  const name = asNonEmptyString(row["name"]);
  const priceCents = asIntOrNull(row["price_cents"]);
  if (sourceId === "" || slugRaw === null || name === null || priceCents === null) {
    return null;
  }
  const product: DbProduct = {
    id: sourceId,
    slug: slugRaw.toLowerCase(),
    name,
    description: asString(row["description"], ""),
    priceCents,
    currency: asNonEmptyString(row["currency"]) ?? "EUR",
    compareAtCents: asIntOrNull(row["compare_at_cents"]),
    category: asString(row["category"], ""),
    colors: asStringArray(row["colors"]),
    materials: asStringArray(row["materials"]),
    images: asStringArray(row["images"]),
    variants: [],
  };
  return { product, sourceId };
}

function parseVariantRow(row: Record<string, unknown>): DbVariant | null {
  const id = asString(row["id"], "");
  const sku = asString(row["sku"], "");
  const size = asString(row["size"], "");
  if (id === "" || sku === "" || size === "") return null;
  return {
    id,
    sku,
    size,
    color: asString(row["color"], ""),
    stock: asInt(row["stock"], 0),
    priceCents: asIntOrNull(row["price_cents"]),
  };
}

function parseCouponRow(row: Record<string, unknown>): DbCouponRow | null {
  const percent = asIntOrNull(row["percent"]);
  if (percent === null || percent < 0 || percent > 100) return null;
  return {
    percent,
    quota: asIntOrNull(row["quota"]),
    used: asInt(row["used"], 0),
    minTotalCents: asInt(row["min_total_cents"], 0),
    startsAt: typeof row["starts_at"] === "string" ? row["starts_at"] : null,
    endsAt: typeof row["ends_at"] === "string" ? row["ends_at"] : null,
    active: row["active"] === true,
  };
}

async function fetchDbCatalog(): Promise<DbProduct[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (supabase === null) return null;
    const productsRes = await supabase
      .from("products")
      .select(
        "id,slug,name,description,price_cents,compare_at_cents,currency,category,colors,materials,images",
      )
      .eq("active", true)
      .order("name", { ascending: true })
      .limit(500);
    if (productsRes.error) return null;
    const parsed: ParsedProduct[] = [];
    for (const row of asRecordArray(productsRes.data)) {
      const item = parseProductRow(row);
      if (item !== null) parsed.push(item);
    }
    // Catalogue DB vide ou illisible : repli local plutôt que catalogue vide.
    if (parsed.length === 0) return null;
    const ids = parsed.map((item) => item.sourceId);
    const variantsRes = await supabase
      .from("product_variants")
      .select("id,product_id,sku,size,color,stock,price_cents")
      .in("product_id", ids);
    if (variantsRes.error) return null;
    const byProduct = new Map<string, DbVariant[]>();
    for (const row of asRecordArray(variantsRes.data)) {
      const productId = asString(row["product_id"], "");
      const variant = parseVariantRow(row);
      if (productId === "" || variant === null) continue;
      const list = byProduct.get(productId);
      if (list !== undefined) list.push(variant);
      else byProduct.set(productId, [variant]);
    }
    return parsed.map((item) => ({
      ...item.product,
      variants: byProduct.get(item.sourceId) ?? [],
    }));
  } catch {
    return null;
  }
}

async function fetchDbCoupon(code: string): Promise<DbCouponRow | null> {
  try {
    const supabase = getSupabaseClient();
    if (supabase === null) return null;
    const res = await supabase
      .from("coupons")
      .select("percent,quota,used,min_total_cents,starts_at,ends_at,active")
      .eq("code", code)
      .maybeSingle();
    if (res.error || !isRecord(res.data)) return null;
    return parseCouponRow(res.data);
  } catch {
    return null;
  }
}

function formatEuros(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

function evaluateDbCoupon(coupon: DbCouponRow, totalCents: number): CouponValidation {
  if (!coupon.active) return { ok: false, percent: 0, reason: "Code désactivé." };
  const now = Date.now();
  if (coupon.startsAt !== null) {
    const start = Date.parse(coupon.startsAt);
    if (!Number.isNaN(start) && now < start) {
      return { ok: false, percent: 0, reason: "Code pas encore valide." };
    }
  }
  if (coupon.endsAt !== null) {
    const end = Date.parse(coupon.endsAt);
    if (!Number.isNaN(end) && now > end) {
      return { ok: false, percent: 0, reason: "Code expiré." };
    }
  }
  if (coupon.quota !== null && coupon.used >= coupon.quota) {
    return { ok: false, percent: 0, reason: "Quota du code épuisé." };
  }
  if (totalCents < coupon.minTotalCents) {
    return {
      ok: false,
      percent: 0,
      reason: `Minimum d'achat de ${formatEuros(coupon.minTotalCents)} requis.`,
    };
  }
  return { ok: true, percent: coupon.percent, reason: `Code appliqué : -${coupon.percent} %.` };
}

function mergeCatalogs(db: DbProduct[] | null): DbProduct[] {
  const local = buildLocalCatalog();
  if (db === null) return local;
  const seen = new Set(local.map((p) => p.id));
  const merged = [...local];
  for (const product of db) {
    if (!seen.has(product.id)) {
      seen.add(product.id);
      merged.push(product);
    }
  }
  return merged;
}

export async function getDbCatalog(): Promise<DbProduct[]> {
  try {
    const db = await fetchDbCatalog();
    return mergeCatalogs(db);
  } catch {
    // Repli local ci-dessous, jamais de throw.
  }
  return buildLocalCatalog();
}

export async function getDbProduct(slug: string): Promise<DbProduct | null> {
  const needle = slug.trim().toLowerCase();
  if (needle === "") return null;
  try {
    const supabase = getSupabaseClient();
    if (supabase !== null) {
      const res = await supabase
        .from("products")
        .select(
          "id,slug,name,description,price_cents,compare_at_cents,currency,category,colors,materials,images",
        )
        .eq("active", true)
        .eq("slug", needle)
        .maybeSingle();
      if (!res.error && isRecord(res.data)) {
        const parsed = parseProductRow(res.data);
        if (parsed !== null) {
          const variants: DbVariant[] = [];
          try {
            const vRes = await supabase
              .from("product_variants")
              .select("id,product_id,sku,size,color,stock,price_cents")
              .eq("product_id", parsed.sourceId);
            if (!vRes.error) {
              for (const row of asRecordArray(vRes.data)) {
                const variant = parseVariantRow(row);
                if (variant !== null) variants.push(variant);
              }
            }
          } catch {
            // Variantes indisponibles : on renvoie le produit sans variantes.
          }
          return { ...parsed.product, variants };
        }
      }
    }
  } catch {
    // Repli local ci-dessous, jamais de throw.
  }
  const local = buildLocalCatalog().find(
    (p) => p.slug === needle || p.id.toLowerCase() === needle,
  );
  return local ?? null;
}

export async function checkAvailability(items: AvailabilityItem[]): Promise<AvailabilityCheck> {
  try {
    const db = await fetchDbCatalog();
    // Catalogue fusionné : les produits locaux restent toujours disponibles
    // (stock inconnu), les produits DB appliquent leur stock réel.
    const catalog = mergeCatalogs(db);
    const problems: string[] = [];
    for (const item of items) {
      const qty = Math.floor(item.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        problems.push(`Quantité invalide pour l'article « ${item.id} ».`);
        continue;
      }
      const product = catalog.find((p) => p.id === item.id || p.slug === item.id.toLowerCase());
      if (product === undefined) {
        problems.push(`Produit introuvable : « ${item.id} ».`);
        continue;
      }
      const variant = product.variants.find(
        (v) => v.size.toLowerCase() === item.size.toLowerCase(),
      );
      // Catalogue sans variantes : stock inconnu, on laisse passer (repli local).
      // Catalogue avec variantes mais taille absente : refus (anti-triche).
      if (variant === undefined) {
        if (product.variants.length > 0) {
          problems.push(`Taille « ${item.size} » indisponible pour « ${product.name} ».`);
        }
        continue;
      }
      if (qty > variant.stock) {
        problems.push(
          `Stock insuffisant pour « ${product.name} » (taille ${variant.size}) : ${variant.stock} restant(s).`,
        );
      }
    }
    return { ok: problems.length === 0, problems };
  } catch {
    return { ok: true, problems: [] };
  }
}

export async function validateCoupon(code: string, totalCents: number): Promise<CouponValidation> {
  const normalized = code.trim().toUpperCase();
  if (normalized === "") {
    return { ok: false, percent: 0, reason: "Saisissez un code promo." };
  }
  const safeTotal = Number.isFinite(totalCents) ? Math.max(0, Math.round(totalCents)) : 0;
  try {
    const dbCoupon = await fetchDbCoupon(normalized);
    if (dbCoupon !== null) return evaluateDbCoupon(dbCoupon, safeTotal);
  } catch {
    // Repli vers les codes secours ci-dessous, jamais de throw.
  }
  const fallback: { percent: number; reason: string } | undefined =
    FALLBACK_COUPONS[normalized];
  if (fallback !== undefined) {
    return { ok: true, percent: fallback.percent, reason: fallback.reason };
  }
  return { ok: false, percent: 0, reason: "Code inconnu ou expiré." };
}
