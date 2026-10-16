"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

const STORAGE_KEY = "maje-retours";

interface LocalReturn {
  numero: string;
  motif: string;
  statut: string;
  createdAt: string;
}

function readLocal(): LocalReturn[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalReturn[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function RetoursContenu() {
  const [numero, setNumero] = useState("");
  const [motif, setMotif] = useState("");
  const [locals, setLocals] = useState<LocalReturn[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocals(readLocal());
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleanNumero = numero.trim();
    const cleanMotif = motif.trim();
    if (!cleanNumero || !cleanMotif) {
      setMessage("Indiquez le numéro de commande et le motif du retour.");
      return;
    }
    setSending(true);
    setMessage(null);
    const entry: LocalReturn = {
      numero: cleanNumero,
      motif: cleanMotif,
      statut: "demande locale",
      createdAt: new Date().toISOString(),
    };

    let serverMessage = "Demande enregistrée sur cet appareil uniquement (serveur non joignable).";
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("returns").insert({
        order_numero: cleanNumero,
        motif: cleanMotif,
        statut: "demande",
      });
      if (!error) {
        entry.statut = "demande transmise";
        serverMessage = "Demande transmise au service client (statut : demande). Réponse sous quelques jours ouvrés.";
      } else {
        serverMessage = `Demande enregistrée sur cet appareil uniquement : serveur injoignable (${error.message}).`;
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "configuration incomplète";
      serverMessage = `Demande enregistrée sur cet appareil uniquement : ${detail}.`;
    }

    try {
      const next = [entry, ...readLocal()].slice(0, 20);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setLocals(next);
    } catch {
      setLocals((prev) => [entry, ...prev].slice(0, 20));
    }
    setNumero("");
    setMotif("");
    setMessage(serverMessage);
    setSending(false);
  }

  return (
    <div className="maje-commerce">
      <h1 className="maje-commerce-title">Demander un retour</h1>
      <p className="maje-co-intro">
        Remplissez le formulaire ci-dessous. Votre demande est conservée sur cet appareil et transmise au service
        client si la base est joignable — aucun statut n&apos;est inventé.
      </p>

      <form onSubmit={handleSubmit} className="maje-look-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
        <label htmlFor="retour-numero">Numéro de commande</label>
        <input
          id="retour-numero"
          type="text"
          value={numero}
          onChange={(event) => setNumero(event.target.value)}
          placeholder="Ex. MJ-2026-000123"
          autoComplete="off"
        />
        <label htmlFor="retour-motif">Motif du retour</label>
        <textarea
          id="retour-motif"
          value={motif}
          onChange={(event) => setMotif(event.target.value)}
          placeholder="Taille, défaut, changement d'avis…"
          rows={4}
        />
        <button type="submit" disabled={sending}>
          {sending ? "Envoi en cours…" : "Envoyer la demande"}
        </button>
      </form>

      {message ? <p className="maje-co-intro">{message}</p> : null}

      <h2 className="maje-dressing-subtitle">Mes demandes ({locals.length})</h2>
      {locals.length === 0 ? (
        <p>
          Aucune demande pour l&apos;instant. <Link href="/fr/compte">Retour à mon compte</Link>
        </p>
      ) : (
        <ul className="maje-look-items">
          {locals.map((retour, index) => (
            <li key={`${retour.numero}-${retour.createdAt}-${index}`}>
              <span>
                {retour.numero} — {retour.motif} — {retour.statut}
              </span>
              <span>{new Date(retour.createdAt).toLocaleDateString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RetoursPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <RetoursContenu />
      <MajeFooter />
    </main>
  );
}
