"use client";

import { useState } from "react";
import { useMajeAuth } from "@/lib/maje/auth";
import { AuthFooterLinks, MajeAuthShell, submitAuth, useRequireGuestRedirect } from "@/components/sites/maje/MajeAuthUI";

function InscriptionForm() {
  const { signUp } = useMajeAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  useRequireGuestRedirect();

  if (done) {
    return (
      <p>
        Compte créé. Vérifiez votre boîte e-mail pour confirmer votre adresse, puis connectez-vous.
      </p>
    );
  }

  return (
    <form
      className="maje-co-form"
      noValidate
      onSubmit={(e) => {
        if (password.length < 8) {
          e.preventDefault();
          setError("Le mot de passe doit comporter au moins 8 caractères.");
          return;
        }
        if (password !== confirm) {
          e.preventDefault();
          setError("Les deux mots de passe ne correspondent pas.");
          return;
        }
        void submitAuth(() => signUp(email.trim(), password), setError, () => setDone(true), e);
      }}
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
        <label htmlFor="password">Mot de passe (8 caractères minimum)</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="maje-co-field">
        <label htmlFor="confirm">Confirmer le mot de passe</label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error !== null && (
        <p className="maje-co-error" role="alert">
          {error}
        </p>
      )}
      <button className="maje-cart-cta" type="submit">
        Créer mon compte
      </button>
    </form>
  );
}

export default function InscriptionPage() {
  return (
    <MajeAuthShell
      title="Créer un compte"
      intro="Suivi des commandes, dressing synchronisé et nouveautés en avant-première."
      footer={<AuthFooterLinks />}
    >
      <InscriptionForm />
    </MajeAuthShell>
  );
}
