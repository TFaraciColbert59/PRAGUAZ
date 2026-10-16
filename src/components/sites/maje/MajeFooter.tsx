"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface FooterLink {
  label: string;
  href: string;
}

const FooterCols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Services",
    links: [
      { label: "Suivi de commande", href: "/fr/aide/suivi-commande" },
      { label: "Nous contacter", href: "/fr/aide/nous-contacter" },
      { label: "F.A.Q.", href: "/fr/aide/faq" },
      { label: "Échanges & Retours", href: "/fr/aide/echanges-retours" },
      { label: "Guide des tailles", href: "/fr/aide/guide-tailles" },
      { label: "Carte cadeau", href: "/fr/carte-cadeau" },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Conseil d'entretien", href: "/fr/aide/entretien" },
      { label: "CGV", href: "/fr/aide/cgv" },
      { label: "Confidentialité", href: "/fr/aide/confidentialite" },
      { label: "Charte cookies", href: "/fr/aide/cookies" },
      { label: "Accessibilité", href: "/fr/aide/accessibilite" },
      { label: "Mon compte", href: "/fr/mon-compte" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "Notre histoire", href: "/fr/aide/a-propos" },
      { label: "Seconde Main", href: "/fr/seconde-main" },
      { label: "E-Réservation", href: "/fr/e-reservation" },
      { label: "Réparation & Retouches", href: "/fr/aide/entretien" },
      { label: "Nouveautés", href: "/fr/nouveautes" },
      { label: "Last Chance", href: "/fr/last-chance/tout-voir" },
    ],
  },
  {
    title: "Boutiques",
    links: [
      { label: "Trouver une boutique", href: "/fr/stores" },
      { label: "Paris", href: "/fr/stores" },
      { label: "Lyon", href: "/fr/stores" },
      { label: "Bordeaux", href: "/fr/stores" },
      { label: "Prendre rendez-vous", href: "/fr/e-reservation" },
    ],
  },
];

const Socials: { label: string; href: string; path: string }[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/majeparis/",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9C2.4 3.9 4 2.3 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-10.4a1.4 1.4 0 1 0 0-2.9 1.4 1.4 0 0 0 0 2.9Z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/maje.france",
    path: "M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.6-.1-1.4-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3Z",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@majeparis",
    path: "M16.6 3c.4 2.1 1.8 3.5 4 3.9v3c-1.6 0-3-.5-4-1.3v6.1c0 3.4-2.4 5.8-5.6 5.8A5.3 5.3 0 0 1 5.5 15c0-3 2.3-5.2 5.4-5.2.3 0 .7 0 1 .1v3.1a2.5 2.5 0 0 0-1-.2 2.3 2.3 0 0 0-2.4 2.3 2.3 2.3 0 0 0 2.4 2.3c1.4 0 2.6-1.1 2.6-2.8V3h3.7Z",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.fr/majeofficiel/",
    path: "M12 3a9 9 0 0 0-3.3 17.4c-.1-.8-.2-2 0-2.9l1.2-4.9s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.9 0-2.5-1.8-4.3-4.4-4.3a4.6 4.6 0 0 0-4.8 4.6c0 .9.4 1.9.8 2.4.1.1.1.2.1.3l-.3 1.1c0 .2-.2.2-.4.1-1.2-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.7-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.3 6.3-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.9-.8 2-1.2 2.6A9 9 0 1 0 12 3Z",
  },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setStatus("error");
      return;
    }
    try {
      const raw = window.localStorage.getItem("maje-newsletter");
      const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (!list.includes(clean)) {
        window.localStorage.setItem("maje-newsletter", JSON.stringify([...list, clean]));
      }
    } catch {
      // stockage indisponible : on confirme quand même
    }
    // Sauvegarde Supabase en arrière-plan (table absente = ignoré, jamais bloquant)
    try {
      const supabase = createSupabaseBrowserClient();
      await Promise.race([
        supabase.from("newsletter_subscribers").insert({ email: clean }),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    } catch {
      // Supabase indisponible : l'inscription locale suffit
    }
    setStatus("done");
  }

  if (status === "done") {
    return <p className="maje-nl-done">Merci ! Votre inscription est bien prise en compte.</p>;
  }

  return (
    <form className="maje-nl-form" onSubmit={handleSubmit} noValidate>
      <label className="maje-nl-label" htmlFor="maje-nl-email">
        Recevez nos nouveautés et offres privées
      </label>
      <div className="maje-nl-row">
        <input
          id="maje-nl-email"
          className="maje-nl-input"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder="Votre adresse e-mail"
          autoComplete="email"
        />
        <button className="maje-nl-btn" type="submit">
          OK
        </button>
      </div>
      {status === "error" && (
        <p className="maje-nl-error" role="alert">
          Veuillez saisir une adresse e-mail valide.
        </p>
      )}
    </form>
  );
}

export function MajeFooter() {
  return (
    <footer className="maje-footer">
      <div className="maje-nl">
        <h2 className="maje-nl-title">Inscrivez-vous à notre newsletter</h2>
        <NewsletterForm />
      </div>
      <div className="maje-footer-grid">
        {FooterCols.map((col) => (
          <div key={col.title}>
            <h3>{col.title}</h3>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="maje-footer-socials">
        {Socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="maje-social-link"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d={social.path} />
            </svg>
          </a>
        ))}
      </div>
      <p className="maje-legal">
        Clone éducatif non affilié — marque et visuels © Maje / SMCP. Maquette réalisée à partir de
        fr.maje.com, sans valeur contractuelle.
      </p>
    </footer>
  );
}
