import Link from "next/link";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { CLUB_PLANS, formatClubPrice } from "@/lib/maje/club";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/commerce.css";

export default function ClubLandingPage() {
  return (
    <main className="maje-page">
      <MajeHeader />
      <div className="maje-commerce">
        <h1 className="maje-commerce-title">Le Club</h1>
        <p className="maje-co-mock" role="note">
          Simulation — sans facturation réelle. Aucun prélèvement, abonnement fictif conservé dans votre navigateur.
        </p>
        <p className="maje-co-intro">
          Deux formules simples pour profiter de remises permanentes, d’avant-premières et de points fidélité
          bonus. Résiliable à tout moment depuis votre compte (simulation).
        </p>

        <div className="maje-commerce-layout">
          {CLUB_PLANS.map((plan) => (
            <section key={plan.code} className="maje-cart-summary" aria-label={`Formule ${plan.name}`}>
              <h2>
                {plan.name} — {formatClubPrice(plan.priceMonthlyCents)}/mois
              </h2>
              <p className="maje-co-intro">
                <strong>-{plan.discountPercent}% sur tout</strong> + {plan.welcomePoints} points de bienvenue.
              </p>
              <ul className="maje-look-items">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <Link
                className="maje-cart-cta"
                href={plan.code === "signature" ? "/club/signature" : "/club/prestige"}
              >
                Découvrir {plan.name}
              </Link>
            </section>
          ))}
        </div>

        <h2 className="maje-dressing-subtitle">Comparatif</h2>
        <table className="maje-look-items" aria-label="Tableau comparatif des formules">
          <thead>
            <tr>
              <th>Avantage</th>
              <th>Signature</th>
              <th>Prestige</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Prix simulé</td>
              <td>{formatClubPrice(CLUB_PLANS[0].priceMonthlyCents)}/mois</td>
              <td>{formatClubPrice(CLUB_PLANS[1].priceMonthlyCents)}/mois</td>
            </tr>
            <tr>
              <td>Remise permanente</td>
              <td>-10%</td>
              <td>-15%</td>
            </tr>
            <tr>
              <td>Livraison offerte</td>
              <td>Dès 150 €</td>
              <td>Sans minimum</td>
            </tr>
            <tr>
              <td>Points de bienvenue</td>
              <td>50 pts</td>
              <td>100 pts</td>
            </tr>
            <tr>
              <td>Avant-premières</td>
              <td>Oui</td>
              <td>Oui + conciergerie</td>
            </tr>
          </tbody>
        </table>

        <div className="maje-look-actions">
          <Link className="maje-cart-cta" href="/club/signature">
            Choisir Signature (simulation)
          </Link>
          <Link className="maje-cart-cta maje-cart-cta-secondary" href="/club/prestige">
            Choisir Prestige (simulation)
          </Link>
        </div>
        <p className="maje-co-intro">
          Déjà membre ? <Link href="/fr/compte/club">Gérer mon abonnement</Link> ·{" "}
          <Link href="/fr/compte/fidelite">Voir mes points</Link>
        </p>
      </div>
      <MajeFooter />
    </main>
  );
}
