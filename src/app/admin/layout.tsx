import Link from "next/link";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

export const runtime = "nodejs";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return (
      <main style={{ maxWidth: 640, margin: "48px auto", padding: 24, fontFamily: "Arial,sans-serif" }}>
        <h1>Back-office désactivé</h1>
        <p>
          Configurez la variable <code>ADMIN_TOKEN</code> (voir <code>.env.example</code>) puis redémarrez le
          serveur pour activer l&apos;administration. Aucune donnée n&apos;est affichée sans ce token.
        </p>
      </main>
    );
  }

  const store = await cookies();
  if (store.get("pg-admin")?.value !== "1") {
    return (
      <main style={{ maxWidth: 480, margin: "48px auto", padding: 24, fontFamily: "Arial,sans-serif" }}>
        <h1>Administration — accès protégé</h1>
        <p>Saisissez le token d&apos;administration pour continuer.</p>
        <form method="post" action="/admin/login">
          <label htmlFor="admin-token">Token</label>
          <br />
          <input id="admin-token" name="token" type="password" autoComplete="off" required style={{ width: "100%", padding: 8, margin: "8px 0" }} />
          <br />
          <button type="submit" style={{ padding: "8px 16px" }}>
            Se connecter
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "Arial,sans-serif" }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link href="/admin">Tableau de bord</Link>
        <Link href="/admin/commandes">Commandes</Link>
        <Link href="/admin/retours">Retours</Link>
        <a href="/admin/logout">Se déconnecter</a>
      </nav>
      {children}
    </main>
  );
}
