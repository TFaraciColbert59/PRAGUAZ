"use client";

import { useRef, useState } from "react";
import { useMajeDressing } from "@/lib/maje/dressing";
import type { MajeProduct } from "./data";
import "./dressing.css";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxSide = 800;
      const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

export function MajeTryon({ product }: { product: MajeProduct }) {
  const { addPhoto, createLook } = useMajeDressing();
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function close() {
    setOpen(false);
    setConsent(false);
    setPreview(null);
    setError(null);
    setSaved(false);
  }

  async function handleFile(file: File | undefined) {
    setError(null);
    setSaved(false);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Format accepté : JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Photo trop lourde (10 Mo maximum).");
      return;
    }
    try {
      const dataUrl = await resizeToDataUrl(file);
      setPreview(dataUrl);
    } catch {
      setError("Impossible de lire cette image. Essayez un autre fichier.");
    }
  }

  function handleSave() {
    if (!preview) return;
    addPhoto(preview);
    createLook(`Essayage — ${product.name}`, [product.id]);
    setSaved(true);
  }

  return (
    <>
      <button type="button" className="maje-tryon-btn" onClick={() => setOpen(true)}>
        Essayer sur ma photo
      </button>
      {open && (
        <div className="maje-tryon-overlay" role="dialog" aria-label="Essayage sur photo">
          <div className="maje-tryon-modal">
            <h2>Essayer {product.name}</h2>
            <label className="maje-tryon-check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                Je consens au traitement local de ma photo pour l&apos;essayage. Aucune image
                n&apos;est envoyée à un serveur : tout reste dans mon navigateur.
              </span>
            </label>
            <label>
              Votre photo
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={!consent}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
            {error !== null && (
              <p className="maje-tryon-error" role="alert">
                {error}
              </p>
            )}
            {preview !== null && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Aperçu de votre photo" className="maje-tryon-preview" />
            )}
            <p className="maje-tryon-note">
              La génération IA n&apos;est pas encore connectée : visualisez votre photo et
              enregistrez-la dans votre dressing en attendant.
            </p>
            <div className="maje-tryon-actions">
              <button type="button" disabled={preview === null} onClick={handleSave}>
                {saved ? "Enregistré ✓" : "Enregistrer au dressing"}
              </button>
              <button type="button" onClick={close}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
