import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

interface OrderRow {
  numero: string;
  email: string;
  total: number;
  statut: string;
  created_at: string;
}

export default async function CommandesPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return (
      <section>
        <h1>Commandes</h1>
        <p>
          Configuration incomplète : <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> sont requises pour lire les commandes. Aucune donnée affichée.
        </p>
      </section>
    );
  }

  const supabase = createClient(url, serviceRoleKey);
  const { data, error } = await supabase
    .from("orders")
    .select("numero,email,total,statut,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <section>
        <h1>Commandes</h1>
        <p>Lecture impossible : {error.message}</p>
      </section>
    );
  }

  const rows = (data ?? []) as OrderRow[];
  if (rows.length === 0) {
    return (
      <section>
        <h1>Commandes</h1>
        <p>Aucune commande enregistrée pour l&apos;instant.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Commandes ({rows.length})</h1>
      <table>
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Email</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order.numero}>
              <td>{order.numero}</td>
              <td>{order.email}</td>
              <td>{Number(order.total).toFixed(2).replace(".", ",")} €</td>
              <td>{order.statut}</td>
              <td>{new Date(order.created_at).toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
