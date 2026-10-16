"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MajeCategories } from "./data";
import { MajeMegaMenu } from "./MajeMegaMenu";
import { IconAccount, IconBag, IconClose, IconHanger, IconHeart, IconMenu, IconSearch } from "./MajeIcons";
import { useMajeDressing } from "@/lib/maje/dressing";
import { useMajeAuth } from "@/lib/maje/auth";

function readStorageCount(key: string): number {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return 0;
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.length;
    }
    if (typeof parsed === "number" && Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
    return 0;
  } catch {
    return 0;
  }
}

export function MajeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { looks } = useMajeDressing();
  const { user } = useMajeAuth();
  const dressingCount = looks.length;
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const refresh = () => {
      setCartCount(readStorageCount("maje-cart"));
      setWishlistCount(readStorageCount("maje-wishlist"));
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rootRef.current) {
        rootRef.current.classList.toggle("maje-header--scrolled", window.scrollY > 8);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  return (
    <header className="maje-header" ref={rootRef}>
      <div className="maje-topbar">
        <Link href="/fr/last-chance/tout-voir">
          Last Chance : -10% supplémentaires sur la sélection SHOP NOW
        </Link>
      </div>
      <div className="maje-nav">
        <button
          className="maje-icon-btn"
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="maje-mega-menu"
          aria-haspopup="true"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <IconMenu />
        </button>
        <button
          className="maje-icon-btn"
          type="button"
          aria-label="Recherche"
          aria-expanded={searchOpen}
          aria-controls="maje-search"
          onClick={() => setSearchOpen((value) => !value)}
        >
          <IconSearch />
        </button>
        <Link className="maje-logo" href="/" aria-label="Praguaz - Boutique officielle">
          <Image src="/sites/maje/logo.svg" alt="Logo Praguaz - Boutique officielle" width={132} height={51} priority />
        </Link>
        <div className="maje-nav-actions">
          <Link
            className="maje-action-link"
            href="/fr/mon-dressing/"
            aria-label={dressingCount > 0 ? `Mon dressing, ${dressingCount} looks` : "Mon dressing"}
          >
            <IconHanger />
            {dressingCount > 0 && (
              <span className="maje-count-badge" aria-hidden="true">
                {dressingCount}
              </span>
            )}
          </Link>
          <Link
            className="maje-action-link"
            href={user ? "/fr/compte/" : "/fr/compte/connexion/"}
            aria-label={user ? `Mon compte (${user.email ?? ""})` : "Mon compte"}
          >
            <IconAccount />
          </Link>
          <Link
            className="maje-action-link"
            href="/fr/ma-wishlist/"
            aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} articles` : "Wishlist"}
          >
            <IconHeart filled={wishlistCount > 0} />
            {wishlistCount > 0 && (
              <span className="maje-count-badge" aria-hidden="true">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            className="maje-action-link"
            href="/fr/panier/"
            aria-label={cartCount > 0 ? `Panier, ${cartCount} articles` : "Panier"}
          >
            <IconBag />
            {cartCount > 0 && (
              <span className="maje-count-badge" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      {searchOpen && (
        <div className="maje-search" id="maje-search" role="search">
          <form className="maje-search-form" action="/fr/recherche" method="get">
            <input
              className="maje-search-input"
              type="search"
              name="q"
              placeholder="Rechercher…"
              aria-label="Rechercher"
              autoFocus
            />
            <button
              className="maje-search-close"
              type="button"
              aria-label="Fermer la recherche"
              onClick={() => setSearchOpen(false)}
            >
              <IconClose />
            </button>
          </form>
        </div>
      )}
      <div className="maje-menu-wrap" onMouseLeave={() => setMenuOpen(false)}>
        <nav className="maje-cats" aria-label="Catégories">
          {MajeCategories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              onMouseEnter={() => setMenuOpen(true)}
              onFocus={() => setMenuOpen(true)}
            >
              {cat.label}
            </Link>
          ))}
        </nav>
        <MajeMegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </header>
  );
}
