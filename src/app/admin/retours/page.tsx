import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const STATUTS_RETOUR = ["demande", "accepte", "refuse", "recu", "rembourse"] as const;

interface ReturnRow {
  id: string;
  order_numero: string;
  motif: string;
  statut: string;
  created_at: string;
}

interface RefundRow {
  id: string;
  order_numero: string;
  montant: number;
  statut: string;
  created_at: string;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey);
}

async function updateRetourStatut(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const statut = String(formData.get("statut") ?? "");
  if (!id || !(STATUTS_RETOUR as readonly string[]).includes(statut)) return;
  const supabase = serviceClient();
  if (!supabase) return;
  const { error } = await supabase.from("returns").update({ statut }).eq("id", id);
  if (error) console.error(`[admin/retours] update ${id} impossible : ${error.message}`);
  revalidatePath("/admin/retours");
}

export default async function RetoursPage() {
  const supabase = serviceClient();
  if (!supabase) {
    return (
      <section>
        <h1>Retours et remboursements</h1>
        <p>
          Configuration incomplète : <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> sont requises. Aucune donnée affichée, aucune action possible.
        </p>
      </section>
    );
  }

  const [{ data: returnsData, error: returnsError }, { data: refundsData, error: refundsError }] = await Promise.all([
    supabase.from("returns").select("id,order_numero,motif,statut,created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("refunds").select("id,order_numero,montant,statut,created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  if (returnsError || refundsError) {
    return (
      <section>
        <h1>Retours et remboursements</h1>
        <p>
          Lecture impossible : {returnsError?.message ?? refundsError?.message} (avez-vous exécuté
          supabase/migration-ops.sql ?).
        </p>
      </section>
    );
  }

  const returns = (returnsData ?? []) as ReturnRow[];
  const refunds = (refundsData ?? []) as RefundRow[];

  return (
    <section>
      <h1>Retours et remboursements</h1>

      <h2>Demandes de retour ({returns.length})</h2>
      {returns.length === 0 ? (
        <p>Aucune demande de retour pour l&apos;instant.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Commande</th>
              <th>Motif</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((retour) => (
              <tr key={retour.id}>
                <td>{retour.order_numero}</td>
                <td>{retour.motif}</td>
                <td>{retour.statut}</td>
                <td>
                  <form action={updateRetourStatut}>
                    <input type="hidden" name="id" value={retour.id} />
                    <select name="statut" defaultValue={retour.statut}>
                      {STATUTS_RETOUR.map((statut) => (
                        <option key={statut} value={statut}>
                          {statut}
                        </option>
                      ))}
                    </select>
                    <button type="submit">Mettre à jour</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Remboursements ({refunds.length})</h2>
      {refunds.length === 0 ? (
        <p>
          Aucun remboursement enregistré. Les remboursements sont créés ici après une action réelle côté prestataire
          de paiement — jamais simulés.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Commande</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => (
              <tr key={refund.id}>
                <td>{refund.order_numero}</td>
                <td>{Number(refund.montant).toFixed(2).replace(".", ",")} €</td>
                <td>{refund.statut}</td>
                <td>{new Date(refund.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
