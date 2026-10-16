import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { parseMajePrice, type MajeCartLine } from "@/lib/maje/cart";

export interface MajeShipping {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
}

function readShipping(): MajeShipping {
  try {
    const raw = window.localStorage.getItem("maje-shipping");
    if (!raw) return {};
    return JSON.parse(raw) as MajeShipping;
  } catch {
    return {};
  }
}

/** Enregistre la commande dans Supabase (table `orders` + `order_items`). Ne lève jamais. */
export async function saveOrderToSupabase(
  orderNumber: string,
  lines: MajeCartLine[],
  total: number,
): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const shipping = readShipping();
    const subtotal = lines.reduce((sum, line) => {
      const unit = parseMajePrice(line.product.newPrice);
      return sum + unit * line.qty;
    }, total);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        numero: orderNumber,
        email: shipping.email ?? "",
        prenom: shipping.prenom ?? "",
        nom: shipping.nom ?? "",
        telephone: shipping.telephone ?? "",
        adresse: shipping.adresse ?? "",
        code_postal: shipping.codePostal ?? "",
        ville: shipping.ville ?? "",
        pays: shipping.pays ?? "France",
        sous_total: subtotal,
        total,
        statut: "simulee",
      })
      .select("id")
      .single();
    if (error || !order) return false;
    const items = lines.map((line) => ({
      order_id: (order as { id: string }).id,
      product_id: line.id,
      product_name: line.product.name,
      size: line.size,
      qty: line.qty,
      unit_price: parseMajePrice(line.product.newPrice),
    }));
    const { error: itemsError } = await supabase.from("order_items").insert(items);
    return !itemsError;
  } catch {
    return false;
  }
}
