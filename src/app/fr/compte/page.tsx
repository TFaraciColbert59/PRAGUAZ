"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { useMajeAuth } from "@/lib/maje/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

interface OrderRow {
  numero: string;
  total: number;
  statut: string;
  created_at: string;
}

function formatEur(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function CompteContenu() {
  const { user, loading, signOut } = useMajeAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/fr/compte/connexion");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    try {
      const supabase = createSupabaseBrowserClient();
      supabase
        .from("orders")
        .select("numero,total,statut,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (active) setOrders((data as OrderRow[] | null) ?? []);
        });
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (active) setOrders([]);
    }
    return () => {
      active = false;
    };
  }, [user]);

  function handleExport() {
    const payload: Record<string, unknown> = {};
    for (const key of [
      "maje-cart",
      "maje-wishlist",
      "praguaz-dressing",
      "praguaz-photos",
      "maje-newsletter",
      "maje-shipping",
    ]) {
      try {
        payload[key] = JSON.parse(window.localStorage.getItem(key) ?? "null");
      } catch {
        payload[key] = null;
      }
    }
    const blob = new Blob([JSON.stringify({ email: user?.email ?? null, ...payload }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "praguaz-mes-donnees.json";
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  }

  function handleWipe() {
    for (const key of [
      "maje-cart",
      "maje-wishlist",
      "praguaz-dressing",
      "praguaz-photos",
      "maje-shipping",
      "maje-newsletter",
      "maje-consent",
    ]) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
    void signOut().finally(() => router.replace("/"));
  }

  if (loading) return <p>Chargement de votre compte…</p>;
  if (!user) return <p>Redirection vers la connexion…</p>;

  return (
    <div className="maje-commerce">
      <h1 className="maje-commerce-title">Mon compte</h1>
      <p className="maje-co-intro">Connectée en tant que {user.email}</p>

      <h2 className="maje-dressing-subtitle">Mes commandes</h2>
      {orders === null ? (
        <p>Chargement…</p>
      ) : orders.length === 0 ? (
        <p>
          Aucune commande pour l&apos;instant.{" "}
          <Link href="/fr/robes">Découvrir la collection</Link>
        </p>
      ) : (
        <ul className="maje-look-items">
          {orders.map((order) => (
            <li key={order.numero}>
              <span>
                {order.numero} — {formatEur(Number(order.total))} — {order.statut}
              </span>
              <span>{new Date(order.created_at).toLocaleDateString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="maje-dressing-subtitle">Données et confidentialité</h2>
      <div className="maje-look-actions">
        <button type="button" onClick={handleExport}>
          {exported ? "Exporté ✓" : "Exporter mes données"}
        </button>
        <button type="button" onClick={handleWipe}>
          Tout effacer et se déconnecter
        </button>
        <button
          type="button"
          onClick={() => {
            void signOut().finally(() => router.replace("/"));
          }}
        >
          Se déconnecter
        </button>
      </div>
      <p className="maje-co-intro">
        Suppression définitive du compte serveur : <Link href="/fr/aide/nous-contacter">contactez-nous</Link>.
      </p>
    </div>
  );
}

export default function ComptePage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <CompteContenu />
      <MajeFooter />
    </main>
  );
}
