"use client";

export interface MajeMegaMenuLink {
  label: string;
  href: string;
}

export interface MajeMegaMenuColumn {
  title: string;
  links: MajeMegaMenuLink[];
}

export const MajeMegaMenuColumns: MajeMegaMenuColumn[] = [
  {
    title: "Prêt-à-porter",
    links: [
      { label: "Robes", href: "/fr/robes" },
      { label: "Vestes & Manteaux", href: "/fr/vestes-manteaux" },
      { label: "Pulls & Cardigans", href: "/fr/pulls-cardigans" },
      { label: "Pantalons & Jeans", href: "/fr/pantalons-jeans" },
      { label: "Last Chance", href: "/fr/last-chance/tout-voir" },
    ],
  },
  {
    title: "Sacs",
    links: [
      { label: "Tous les sacs", href: "/fr/sacs" },
      { label: "Nouveautés", href: "/fr/nouveautes" },
      { label: "Last Chance", href: "/fr/last-chance/tout-voir" },
    ],
  },
  {
    title: "Chaussures",
    links: [
      { label: "Toutes les chaussures", href: "/fr/chaussures" },
      { label: "Nouveautés", href: "/fr/nouveautes" },
      { label: "Last Chance", href: "/fr/last-chance/tout-voir" },
    ],
  },
  {
    title: "Accessoires",
    links: [
      { label: "Tous les accessoires", href: "/fr/accessoires" },
      { label: "Tops & Chemises", href: "/fr/tops-chemises" },
      { label: "Manteaux", href: "/fr/manteaux" },
    ],
  },
];

interface MajeMegaMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MajeMegaMenu({ open, onClose }: MajeMegaMenuProps) {
  if (!open) {
    return null;
  }
  return (
    <div className="maje-mega maje-mega-open" id="maje-mega-menu">
      <nav className="maje-mega-grid" aria-label="Méga menu">
        {MajeMegaMenuColumns.map((col) => (
          <div key={col.title} className="maje-mega-col">
            <h3>{col.title}</h3>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} onClick={onClose}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="maje-mega-foot">
        <a href="/fr/last-chance/tout-voir" onClick={onClose}>
          Voir la sélection Last Chance
        </a>
      </div>
    </div>
  );
}
