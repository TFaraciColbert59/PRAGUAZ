"use client";

import { useState } from "react";
import { useMajeAuth } from "@/lib/maje/auth";
import { AuthFooterLinks, MajeAuthShell, submitAuth, useRequireGuestRedirect } from "@/components/sites/maje/MajeAuthUI";

function ConnexionForm() {
  const { signIn } = useMajeAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  useRequireGuestRedirect();

  if (done) {
    return <p>Connexion réussie. Redirection vers votre compte…</p>;
  }

  return (
    <form
      className="maje-co-form"
      noValidate
      onSubmit={(e) => submitAuth(() => signIn(email.trim(), password), setError, () => setDone(true), e)}
    >
      <div className="maje-co-field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="maje-co-field">
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      {error !== null && (
        <p className="maje-co-error" role="alert">
          {error}
        </p>
      )}
      <button className="maje-cart-cta" type="submit">
        Se connecter
      </button>
    </form>
  );
}

export default function ConnexionPage() {
  return (
    <MajeAuthShell
      title="Connexion"
      intro="Accédez à vos commandes, votre dressing et vos préférences."
      footer={<AuthFooterLinks />}
    >
      <ConnexionForm />
    </MajeAuthShell>
  );
}
