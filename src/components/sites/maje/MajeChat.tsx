"use client";

import { useState } from "react";
import Link from "next/link";

const QuickReplies: { question: string; answer: string }[] = [
  {
    question: "Où est ma commande ?",
    answer:
      "Suivez votre colis depuis la page de suivi avec votre numéro de commande. Livraison offerte sous 2 jours ouvrés.",
  },
  {
    question: "Quelle taille choisir ?",
    answer:
      "Nos pièces taillent normalement. Entre deux tailles pour une veste ou un manteau, prenez la taille au-dessus.",
  },
  {
    question: "Comment retourner un article ?",
    answer:
      "Échanges et retours offerts sous 30 jours, remboursement sous 14 jours après réception.",
  },
];

export function MajeChat() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="maje-chat">
      {open && (
        <div className="maje-chat-panel" role="dialog" aria-label="Assistant Maje">
          <div className="maje-chat-head">
            <strong>Une question ?</strong>
            <button type="button" aria-label="Fermer le chat" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="maje-chat-body">
            {selected === null ? (
              <>
                <p className="maje-chat-hello">Bonjour, que puis-je faire pour vous ?</p>
                {QuickReplies.map((item, index) => (
                  <button
                    key={item.question}
                    type="button"
                    className="maje-chat-q"
                    onClick={() => setSelected(index)}
                  >
                    {item.question}
                  </button>
                ))}
              </>
            ) : (
              <>
                <p className="maje-chat-q maje-chat-q--asked">{QuickReplies[selected].question}</p>
                <p className="maje-chat-a">{QuickReplies[selected].answer}</p>
                <button
                  type="button"
                  className="maje-chat-q"
                  onClick={() => setSelected(null)}
                >
                  ← Autres questions
                </button>
              </>
            )}
            <Link href="/fr/aide/nous-contacter" className="maje-chat-contact">
              Contacter un conseiller
            </Link>
          </div>
        </div>
      )}
      <button
        type="button"
        className="maje-chat-fab"
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z" />
          <line x1="9" y1="12" x2="9.01" y2="12" />
          <line x1="12.5" y1="12" x2="12.51" y2="12" />
          <line x1="16" y1="12" x2="16.01" y2="12" />
        </svg>
      </button>
    </div>
  );
}
