"use client";

import { useState } from "react";
import Link from "next/link";
import { useMajeDressing } from "@/lib/maje/dressing";

const ENVIES_TITLE = "Mes envies";

export function DressingQuickAdd({ productId }: { productId: string }) {
  const { looks, createLook, addProductToLook } = useMajeDressing();
  const [savedLookId, setSavedLookId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [modeNew, setModeNew] = useState(looks.length === 0);

  function handleAdd() {
    let lookId = targetId || (!modeNew ? looks[0]?.id || "" : "");
    if (modeNew || !lookId) {
      const existing = looks.find((l) => l.title === ENVIES_TITLE);
      if (!modeNew && existing) {
        lookId = existing.id;
      } else {
        const title = newTitle.trim() || existing?.title || ENVIES_TITLE;
        const found = looks.find((l) => l.title.toLowerCase() === title.toLowerCase());
        lookId = found ? found.id : createLook(title).id;
      }
    }
    addProductToLook(lookId, productId);
    setSavedLookId(lookId);
  }

  const alreadyIn = looks.some((l) => l.productIds.includes(productId));

  if (savedLookId) {
    const savedLook = looks.find((l) => l.id === savedLookId);
    return (
      <p className="maje-pdp-added-msg">
        Ajouté à « {savedLook?.title ?? "votre dressing"} ».{" "}
        <Link href="/fr/mon-dressing">Voir mon dressing</Link>
      </p>
    );
  }

  return (
    <div className="maje-dressing-add">
      <label className="maje-dressing-add-label" htmlFor={`dressing-target-${productId}`}>
        Ajouter à un look
        {alreadyIn && <span className="maje-dressing-add-hint"> — déjà dans un look</span>}
      </label>
      {looks.length > 0 && (
        <div className="maje-dressing-add-row">
          <select
            id={`dressing-target-${productId}`}
            className="maje-dressing-add-select"
            value={modeNew ? "__new" : targetId || looks[0]?.id || ""}
            onChange={(e) => {
              if (e.target.value === "__new") {
                setModeNew(true);
                setTargetId("");
              } else {
                setModeNew(false);
                setTargetId(e.target.value);
              }
            }}
          >
            {looks.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} ({l.productIds.length})
              </option>
            ))}
            <option value="__new">+ Nouveau look…</option>
          </select>
        </div>
      )}
      {(modeNew || looks.length === 0) && (
        <input
          className="maje-dressing-add-input"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nom du look : soirée d’été…"
          aria-label="Nom du nouveau look"
        />
      )}
      <button type="button" className="maje-tryon-btn" onClick={handleAdd}>
        Ajouter au dressing
      </button>
    </div>
  );
}
