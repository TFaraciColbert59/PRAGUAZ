"use client";

import { useState } from "react";
import { useMajeAuth } from "@/lib/maje/auth";
import { AuthFooterLinks, MajeAuthShell, submitAuth } from "@/components/sites/maje/MajeAuthUI";

function OubliForm() {
  const { resetPassword } = useMajeAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return <p>Si un compte existe pour cette adresse, un lien de réinitialisation vient de partir.</p>;
  }

  return (
    <form
      className="maje-co-form"
      noValidate
      onSubmit={(e) => submitAuth(() => resetPassword(email.trim()), setError, () => setDone(true), e)}
    >
      <div className="maje-co-field">
        <label htmlFor="email">E-mail du compte</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {error !== null && (
        <p className="maje-co-error" role="alert">
          {error}
        </p>
      )}
      <button className="maje-cart-cta" type="submit">
        Envoyer le lien
      </button>
    </form>
  );
}

export default function MotDePasseOubliePage() {
  return (
    <MajeAuthShell
      title="Mot de passe oublié"
      intro="Recevez un lien de réinitialisation par e-mail."
      footer={<AuthFooterLinks />}
    >
      <OubliForm />
    </MajeAuthShell>
  );
}
