"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "maje-consent";

export function MajeCookie() {
  const [visible, setVisible] = useState(false);

  // Lecture du consentement après montage : le serveur rend toujours
  // la bannière masquée pour éviter tout mismatch d'hydratation.
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(CONSENT_KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: "accepted" | "refused") {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // stockage indisponible : on masque quand même
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="maje-cookie" role="dialog" aria-label="Gestion des cookies">
      <p className="maje-cookie-text">
        Nous utilisons des cookies pour le panier, la mesure d&apos;audience et la personnalisation.{" "}
        <Link href="/fr/aide/cookies">En savoir plus</Link>
      </p>
      <div className="maje-cookie-actions">
        <button type="button" className="maje-cookie-btn" onClick={() => choose("refused")}>
          Tout refuser
        </button>
        <button
          type="button"
          className="maje-cookie-btn maje-cookie-btn--primary"
          onClick={() => choose("accepted")}
        >
          Tout accepter
        </button>
      </div>
    </div>
  );
}
