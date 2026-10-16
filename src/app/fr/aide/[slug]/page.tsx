import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MajeHeader } from "@/components/sites/maje/MajeHeader";
import { MajeFooter } from "@/components/sites/maje/MajeFooter";
import { MajeCMSPage, type MajeCMSBlock } from "@/components/sites/maje/MajePages";
import "@/components/sites/maje/maje.css";
import "@/components/sites/maje/pages.css";

interface AideContent {
  title: string;
  intro: string;
  blocks: MajeCMSBlock[];
}

const Contents: Record<string, AideContent> = {
  "suivi-commande": {
    title: "Suivi de commande",
    intro: "Retrouvez l\u2019état de votre colis, de la préparation à la livraison.",
    blocks: [
      {
        heading: "Où suivre mon colis",
        paragraphs: [
          "Un e-mail de confirmation est envoyé après chaque commande, avec un lien de suivi activé dès l\u2019expédition depuis nos entrepôts.",
          "Vous pouvez aussi retrouver vos commandes depuis votre compte, rubrique « Mes commandes », avec le statut en temps réel.",
        ],
      },
      {
        heading: "Délais de livraison",
        paragraphs: [
          "La livraison à domicile est offerte et intervient généralement sous 2 jours ouvrés en France métropolitaine.",
          "En période de soldes ou d\u2019opérations spéciales, un délai supplémentaire de 24 à 48 h peut s\u2019appliquer.",
        ],
      },
      {
        heading: "Colis en retard ou bloqué",
        paragraphs: [
          "Si le suivi n\u2019évolue pas depuis plus de 5 jours ouvrés, vérifiez votre boîte aux lettres et l\u2019avis de passage du transporteur.",
          "Passé ce délai, contactez notre service client muni de votre numéro de commande pour ouvrir une enquête transporteur.",
        ],
        links: [{ label: "Nous contacter", href: "/fr/aide/nous-contacter" }],
      },
      {
        heading: "Retrait en boutique",
        paragraphs: [
          "Pour une E-Réservation, vous recevez un SMS ou un e-mail distinct lorsque vos articles sont prêts à l\u2019essayage.",
          "Présentez votre confirmation en caisse : vos pièces sont conservées 72 heures.",
        ],
        links: [{ label: "E-Réservation", href: "/fr/e-reservation" }],
      },
    ],
  },
  "nous-contacter": {
    title: "Nous contacter",
    intro: "Notre service client vous répond pour toute question sur commandes, boutiques et services.",
    blocks: [
      {
        heading: "Par quels canaux",
        paragraphs: [
          "Écrivez-nous via le formulaire de contact en précisant votre numéro de commande : réponse sous 48 h ouvrées en général.",
          "Pour une demande urgente en boutique, privilégiez l\u2019appel direct : les coordonnées de chaque adresse figurent sur la page boutiques.",
        ],
        links: [{ label: "Voir les boutiques", href: "/fr/stores" }],
      },
      {
        heading: "Préparer votre demande",
        paragraphs: [
          "Munissez-vous de votre numéro de commande, de l\u2019adresse e-mail utilisée et de photos en cas d\u2019article non conforme.",
          "Ces éléments accélèrent le traitement, notamment pour les échanges, retours et remboursements.",
        ],
      },
      {
        heading: "Horaires",
        paragraphs: [
          "Le service client est disponible du lundi au samedi, hors jours fériés, aux horaires d\u2019ouverture habituels des boutiques.",
          "Les demandes envoyées le week-end sont traitées en priorité le lundi suivant.",
        ],
      },
    ],
  },
  faq: {
    title: "F.A.Q.",
    intro: "Les réponses aux questions les plus fréquentes : commandes, tailles, retours et services.",
    blocks: [
      {
        heading: "Commandes et paiement",
        paragraphs: [
          "Le paiement en plusieurs fois sans frais est proposé selon le montant du panier et sous réserve d\u2019acceptation.",
          "Vous pouvez modifier l\u2019adresse de livraison tant que la commande est en préparation, via le service client.",
        ],
      },
      {
        heading: "Tailles et conseils",
        paragraphs: [
          "Nos pièces taillent normalement : en cas d\u2019hésitation entre deux tailles pour les vestes et manteaux, prenez la taille au-dessus.",
          "Les matières délicates comme le cuir ou la soie peuvent nécessiter un essayage en boutique pour valider la coupe.",
        ],
        links: [{ label: "Guide des tailles", href: "/fr/aide/guide-tailles" }],
      },
      {
        heading: "Retours et échanges",
        paragraphs: [
          "Les échanges et retours sont offerts sous 30 jours, articles non portés avec étiquettes et emballage d\u2019origine.",
          "Le remboursement intervient sous 14 jours après réception et contrôle de votre retour.",
        ],
        links: [{ label: "Échanges & retours", href: "/fr/aide/echanges-retours" }],
      },
      {
        heading: "Boutiques et services",
        paragraphs: [
          "L\u2019E-Réservation permet de mettre un article de côté 72 h sans payer en ligne.",
          "La carte cadeau est utilisable en boutique et en ligne, en une ou plusieurs fois.",
        ],
        links: [
          { label: "E-Réservation", href: "/fr/e-reservation" },
          { label: "Carte cadeau", href: "/fr/carte-cadeau" },
        ],
      },
    ],
  },
  "echanges-retours": {
    title: "Échanges, Retours & Remboursements",
    intro: "Changez d\u2019avis sereinement : échanges et retours offerts sous conditions.",
    blocks: [
      {
        heading: "Conditions générales",
        paragraphs: [
          "Vous disposez de 30 jours après réception pour demander un échange ou un retour, articles non portés, non lavés, avec étiquettes.",
          "Les articles de seconde main, les pièces personnalisées et les produits d\u2019hygiène descellés ne sont ni repris ni échangés.",
        ],
      },
      {
        heading: "En boutique ou par courrier",
        paragraphs: [
          "En boutique, présentez votre article et votre preuve d\u2019achat : l\u2019échange est immédiat selon disponibilité.",
          "Par courrier, utilisez l\u2019étiquette prépayée jointe à votre colis et conservez la preuve de dépôt jusqu\u2019au remboursement.",
        ],
      },
      {
        heading: "Remboursement",
        paragraphs: [
          "Après réception et contrôle qualité, le remboursement est déclenché sous 14 jours sur le moyen de paiement initial.",
          "Les frais de livraison initiaux restent offerts ; aucun frais de retour ne vous est facturé en France métropolitaine.",
        ],
      },
      {
        heading: "Article défectueux",
        paragraphs: [
          "En cas de défaut avéré, joignez des photos à votre demande : un échange prioritaire ou un avoir pourra être proposé.",
          "Notre service retouches peut aussi être sollicité pour les petites réparations en boutique.",
        ],
        links: [{ label: "Nous contacter", href: "/fr/aide/nous-contacter" }],
      },
    ],
  },
  entretien: {
    title: "Conseil d\u2019entretien",
    intro: "Prolongez la vie de vos pièces : les bons gestes par matière.",
    blocks: [
      {
        heading: "Lire l\u2019étiquette d\u2019abord",
        paragraphs: [
          "Chaque pièce comporte une étiquette de composition et de lavage : elle prime sur tout conseil générique.",
          "En cas de doute entre deux modes de lavage, choisissez toujours le plus délicat.",
        ],
      },
      {
        heading: "Laine, maille et tweed",
        paragraphs: [
          "Lavez à froid à la main ou en programme laine, séchez à plat loin de toute source de chaleur pour éviter le feutrage.",
          "Rangez les mailles pliées plutôt que sur cintre pour préserver leur forme.",
        ],
      },
      {
        heading: "Cuir, suède et soie",
        paragraphs: [
          "Confiez le cuir et le suède à un spécialiste : imperméabilisez régulièrement et évitez l\u2019eau et le frottement.",
          "La soie et les pièces brodées se nettoient à sec ; repassez sur l\u2019envers à basse température.",
        ],
      },
      {
        heading: "Réparation & retouches",
        paragraphs: [
          "Nos boutiques proposent un service de retouches et de petites réparations pour prolonger la durée de vie de vos favoris.",
          "Renseignez-vous en caisse : devis gratuit et délai annoncé avant toute intervention.",
        ],
        links: [{ label: "Voir les boutiques", href: "/fr/stores" }],
      },
    ],
  },
  cgv: {
    title: "Conditions Générales de Vente",
    intro: "Résumé pédagogique des règles applicables aux achats en ligne (maquette, sans valeur juridique).",
    blocks: [
      {
        heading: "Objet et champ d\u2019application",
        paragraphs: [
          "Ces conditions encadrent les ventes réalisées sur la boutique en ligne : prix affichés TTC, disponibilité et validation de commande.",
          "Toute commande implique l\u2019acceptation des conditions en vigueur au jour de l\u2019achat.",
        ],
      },
      {
        heading: "Prix, paiement et livraison",
        paragraphs: [
          "Les prix sont indiqués en euros, toutes taxes comprises, hors offres promotionnelles cumulables selon conditions.",
          "Le paiement sécurisé peut être réalisé en une ou plusieurs fois sans frais ; la livraison intervient à l\u2019adresse indiquée sous délais annoncés.",
        ],
      },
      {
        heading: "Droit de rétractation",
        paragraphs: [
          "Vous disposez d\u2019un délai légal de 14 jours pour changer d\u2019avis, prolongé commercialement à 30 jours pour les échanges et retours.",
          "Les frais de retour sont offerts en France métropolitaine ; le remboursement suit sous 14 jours après contrôle.",
        ],
        links: [{ label: "Échanges & retours", href: "/fr/aide/echanges-retours" }],
      },
      {
        heading: "Garanties et litiges",
        paragraphs: [
          "Les articles bénéficient des garanties légales de conformité et des vices cachés, sans préjudice du service après-vente.",
          "En cas de litige, le service client recherche d\u2019abord une solution amiable avant tout recours à la médiation.",
        ],
      },
    ],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    intro: "Comment vos données personnelles sont collectées et utilisées (résumé de maquette).",
    blocks: [
      {
        heading: "Données collectées",
        paragraphs: [
          "Nous collectons les données nécessaires aux commandes et aux services : identité, coordonnées, historique d\u2019achats et préférences.",
          "La navigation génère aussi des mesures d\u2019audience destinées à améliorer le site et nos offres.",
        ],
      },
      {
        heading: "Usages et durées",
        paragraphs: [
          "Vos données servent au traitement des commandes, au suivi client, à la lutte contre la fraude et, avec consentement, à la prospection.",
          "Elles sont conservées le temps nécessaire à ces finalités, puis archivées selon les obligations légales.",
        ],
      },
      {
        heading: "Vos droits",
        paragraphs: [
          "Vous disposez des droits d\u2019accès, de rectification, d\u2019opposition, d\u2019effacement, de limitation et de portabilité.",
          "Exercez-les auprès du service client en joignant un justificatif d\u2019identité ; réponse sous un mois.",
        ],
        links: [{ label: "Nous contacter", href: "/fr/aide/nous-contacter" }],
      },
    ],
  },
  cookies: {
    title: "Charte cookies",
    intro: "Comprendre et paramétrer les traceurs utilisés sur le site (résumé de maquette).",
    blocks: [
      {
        heading: "À quoi servent les cookies",
        paragraphs: [
          "Les cookies techniques assurent le panier, la connexion et la sécurité ; sans eux, le site ne peut pas fonctionner correctement.",
          "Les cookies de mesure d\u2019audience et de personnalisation permettent d\u2019adapter contenus et offres à votre navigation.",
        ],
      },
      {
        heading: "Votre choix",
        paragraphs: [
          "Lors de votre première visite, un bandeau vous permet d\u2019accepter, de refuser ou de personnaliser chaque finalité.",
          "Vous pouvez modifier votre choix à tout moment via le lien « Gestion des cookies » en bas de page ou depuis votre navigateur.",
        ],
      },
      {
        heading: "Durées de conservation",
        paragraphs: [
          "Les traceurs soumis à consentement sont conservés 6 mois maximum ; votre choix est mémorisé sur la même durée.",
          "Au-delà, un nouveau consentement vous est demandé lors de votre prochaine visite.",
        ],
      },
    ],
  },
  accessibilite: {
    title: "Déclaration d\u2019accessibilité",
    intro: "Notre engagement pour un site accessible à toutes et tous (résumé de maquette).",
    blocks: [
      {
        heading: "État de conformité",
        paragraphs: [
          "Nous visons une conformité au référentiel RGAA : contrastes, navigation au clavier, alternatives textuelles et hiérarchie des titres.",
          "Cette maquette est partiellement conforme : certains composants interactifs restent en cours d\u2019audit.",
        ],
      },
      {
        heading: "Aides à la navigation",
        paragraphs: [
          "Le site est navigable au clavier, avec un fil d\u2019Ariane, des libellés explicites et des images dotées d\u2019alternatives.",
          "Les vidéos et animations respectent la réduction des mouvements lorsque votre système l\u2019active.",
        ],
      },
      {
        heading: "Signaler un obstacle",
        paragraphs: [
          "Si vous rencontrez une difficulté — formulaire, contraste, lecteur d\u2019écran — écrivez-nous en décrivant la page et le blocage.",
          "Nous nous engageons à proposer une alternative accessible sous 10 jours ouvrés.",
        ],
        links: [{ label: "Nous contacter", href: "/fr/aide/nous-contacter" }],
      },
    ],
  },
  "guide-tailles": {
    title: "Guide des tailles",
    intro: "Trouvez votre taille Praguaz : prêt-à-porter, chaussures et correspondance internationale.",
    blocks: [
      {
        heading: "Prêt-à-porter femme",
        paragraphs: [
          "XS : poitrine 80 cm, taille 62 cm, hanches 88 cm. S : poitrine 84 cm, taille 66 cm, hanches 92 cm.",
          "M : poitrine 88 cm, taille 70 cm, hanches 96 cm. L : poitrine 92 cm, taille 74 cm, hanches 100 cm. XL : poitrine 96 cm, taille 78 cm, hanches 104 cm.",
        ],
      },
      {
        heading: "Chaussures",
        paragraphs: [
          "36 : 23 cm. 37 : 23,7 cm. 38 : 24,4 cm. 39 : 25 cm. 40 : 25,7 cm. 41 : 26,4 cm (longueur du pied).",
          "Nos bottines et bottes taillent normalement ; entre deux pointures pour un pied fort, prenez la pointure au-dessus.",
        ],
      },
      {
        heading: "Entre deux tailles",
        paragraphs: [
          "Pour les vestes, manteaux et blazers, prenez la taille au-dessus si vous hésitez : l\u2019épaule doit rester nette.",
          "Pour les mailles et les robes fluides, la taille habituelle suffit : la matière apporte l\u2019aisance.",
        ],
      },
      {
        heading: "Essayage en boutique",
        paragraphs: [
          "Un doute persiste ? Réservez vos pièces en boutique et essayez-les sereinement avec nos conseillers.",
          "Le service de retouches ajuste ensuite ourlets et cintrages pour une coupe parfaite.",
        ],
        links: [{ label: "E-Réservation", href: "/fr/e-reservation" }],
      },
    ],
  },
  "a-propos": {
    title: "À propos de Praguaz",
    intro: "L\u2019univers Praguaz : l\u2019audace bohème chic parisienne, portée par sa fondatrice.",
    blocks: [
      {
        heading: "La fondatrice",
        paragraphs: [
          "Praguaz est née à Paris de la passion de sa fondatrice, vendeuse en boutique dès 19 ans puis exploratrice des grossistes parisiens avant de se lancer.",
          "Elle cultive une silhouette à la fois pointue et accessible, entre tailoring et bohème, avec le goût des matières et des détails soignés.",
        ],
      },
      {
        heading: "Collections",
        paragraphs: [
          "Chaque saison célèbre l\u2019allure parisienne : trench structuré, maille enveloppante et cuir patiné.",
          "Les visuels mettent en scène des pièces fortes pensées pour traverser les saisons sans se démoder.",
        ],
      },
      {
        heading: "Le Club Praguaz et engagements",
        paragraphs: [
          "Le Club Praguaz fédère la communauté autour d\u2019avant-premières, d\u2019invitations et de services personnalisés.",
          "La seconde main, les retouches et l\u2019E-Réservation prolongent la vie des pièces et limitent les déplacements inutiles.",
        ],
        links: [
          { label: "Seconde Main", href: "/fr/seconde-main" },
          { label: "E-Réservation", href: "/fr/e-reservation" },
        ],
      },
      {
        heading: "Carrières",
        paragraphs: [
          "Stylisme, retail, digital et supply : nos équipes recrutent en boutique, au siège et dans nos entrepôts.",
          "Candidatures spontanées et offres à retrouver sur l\u2019espace carrières : créativité, exigence et esprit d\u2019équipe bienvenus.",
        ],
      },
    ],
  },
};

export const AideSlugs = Object.keys(Contents);

export function generateStaticParams() {
  return AideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = Contents[slug];
  if (!content) return { title: "Page introuvable | Praguaz" };
  return {
    title: `${content.title} | Praguaz`,
    description: `Maquette : ${content.intro}`,
  };
}

export default async function AideSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = Contents[slug];
  if (!content) notFound();
  return (
    <main className="maje-page">
      <MajeHeader />
      <MajeCMSPage title={content.title} intro={content.intro} blocks={content.blocks} />
      <MajeFooter />
    </main>
  );
}
