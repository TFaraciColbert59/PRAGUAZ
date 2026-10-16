"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { referralCodes, REFERRALS_COUNT_KEY } from "@/lib/maje/club";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

export default function ParrainagePage() {
  const [code, setCode] = useState("PGZ-SIMULE");
  const [link, setLink] = useState("/fr/compte/inscription?parrain=PGZ-SIMULE");
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const { code: personal, link: personalLink } = referralCodes();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(personal);
    setLink(personalLink);
    try {
      const raw = window.localStorage.getItem(REFERRALS_COUNT_KEY);
      const value = raw ? Number.parseInt(raw, 10) : 0;
      setCount(Number.isFinite(value) && value > 0 ? value : 0);
    } catch {
      setCount(0);
    }
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      try {
        window.prompt("Copiez votre lien de parrainage :", link);
      } catch {
        // presse-papiers indisponible
      }
    }
  }

  function handleSimulateReferral() {
    const next = count + 1;
    setCount(next);
    try {
      window.localStorage.setItem(REFERRALS_COUNT_KEY, String(next));
    } catch {
      // ignore
    }
  }

  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Parrainage</h1>
        <p className="maje-co-mock" role="note">
          Simulation — sans facturation réelle. Code et filleuls fictifs conservés dans votre navigateur.
        </p>
        <section className="maje-cart-summary" aria-label="Mon code de parrainage">
          <h2>
            Mon code : {code} · {count} filleul{count > 1 ? "s" : ""} simulé{count > 1 ? "s" : ""}
          </h2>
          <p className="maje-co-intro">{link}</p>
          <div className="maje-look-actions">
            <button type="button" className="maje-cart-cta" onClick={handleCopy}>
              {copied ? "Lien copié ✓" : "Copier mon lien"}
            </button>
            <button
              type="button"
              className="maje-cart-cta maje-cart-cta-secondary"
              onClick={handleSimulateReferral}
            >
              Simuler un filleul (+1)
            </button>
          </div>
        </section>

        <h2 className="maje-dressing-subtitle">Comment ça marche (simulation)</h2>
        <ul className="maje-look-items">
          <li>Partagez votre lien : votre filleul reçoit -10% sur sa première commande simulée.</li>
          <li>Vous recevez 20 pts fidélité par filleul validé (simulation).</li>
          <li>Suivez votre compteur ci-dessus, sans e-mail réel.</li>
        </ul>

        <h2 className="maje-dressing-subtitle">Règles anti-abus</h2>
        <ul className="maje-look-items">
          <li>Un seul parrainage par adresse e-mail filleule.</li>
          <li>Auto-parrainage interdit (même e-mail que le parrain).</li>
          <li>Codes révoqués en cas de commandes annulées ou frauduleuses.</li>
          <li>Maximum 10 filleuls récompensés par mois (simulation).</li>
        </ul>

        <p className="maje-co-intro">
          <Link href="/fr/compte/fidelite">Voir mes points</Link> · <Link href="/club">Découvrir le Club</Link>
        </p>
      </div>
      <MajeFooter />
    </main>
  );
}
