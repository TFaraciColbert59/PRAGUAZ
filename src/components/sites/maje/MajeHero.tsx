import Image from "next/image";
import Link from "next/link";

export function MajeHero() {
  return (
    <section className="maje-hero" aria-label="Last Chance">
      <picture>
        <source media="(max-width: 768px)" srcSet="/sites/maje/hero-mobile.jpg" />
        <Image
          src="/sites/maje/hero-desktop.jpg"
          alt="Last Chance -10% supplémentaires sur la sélection"
          fill
          priority
          sizes="100vw"
          className="maje-hero-img"
        />
      </picture>
      <div className="maje-hero-overlay">
        <p className="maje-hero-kicker">Last Chance</p>
        <h1 className="maje-hero-title">
          -10% supplémentaires
          <span>sur la sélection</span>
        </h1>
        <Link
          className="maje-hero-cta"
          href="/fr/last-chance/tout-voir"
        >
          Shop now
        </Link>
      </div>
    </section>
  );
}
