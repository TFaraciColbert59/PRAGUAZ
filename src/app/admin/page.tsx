import Link from "next/link";

export const runtime = "nodejs";

export default function AdminPage() {
  const stripe = Boolean(process.env.STRIPE_SECRET_KEY) && Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const resend = Boolean(process.env.RESEND_API_KEY);
  const supabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <section>
      <h1>Tableau de bord</h1>
      <ul>
        <li>
          <Link href="/admin/commandes">Commandes</Link>
        </li>
        <li>
          <Link href="/admin/retours">Retours et remboursements</Link>
        </li>
      </ul>
      <h2>État de la configuration (aucune donnée fictive)</h2>
      <ul>
        <li>Paiement Stripe : {stripe ? "configuré" : "désactivé (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET absentes)"}</li>
        <li>Emails Resend : {resend ? "configuré" : "désactivé (RESEND_API_KEY absente, journalisation uniquement)"}</li>
        <li>Supabase service_role : {supabase ? "configuré" : "désactivé (variables absentes, états setup affichés)"}</li>
      </ul>
    </section>
  );
}
