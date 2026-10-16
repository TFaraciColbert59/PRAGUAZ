"use client";

import { useState } from "react";
import Link from "next/link";
import { useMajeDressing } from "@/lib/maje/dressing";

const ENVIES_TITLE = "Mes envies";

export function DressingQuickAdd({ productId }: { productId: string }) {
  const { looks, createLook, addProductToLook } = useMajeDressing();
  const [saved, setSaved] = useState(false);

  function handleAdd() {
    const existing = looks.find((l) => l.title === ENVIES_TITLE);
    const lookId = existing ? existing.id : createLook(ENVIES_TITLE).id;
    addProductToLook(lookId, productId);
    setSaved(true);
  }

  if (saved) {
    return (
      <p className="maje-pdp-added-msg">
        Ajouté à votre dressing. <Link href="/fr/mon-dressing">Voir mon dressing</Link>
      </p>
    );
  }

  return (
    <button type="button" className="maje-tryon-btn" onClick={handleAdd}>
      Ajouter au dressing
    </button>
  );
}
