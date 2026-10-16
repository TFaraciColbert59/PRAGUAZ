interface IconProps {
  filled?: boolean;
}

function Base({
  children,
  filled,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconMenu() {
  return (
    <Base>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </Base>
  );
}

export function IconSearch() {
  return (
    <Base>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </Base>
  );
}

export function IconAccount() {
  return (
    <Base>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5" />
    </Base>
  );
}

export function IconHeart({ filled }: IconProps) {
  return (
    <Base filled={filled}>
      <path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.9 4 2.2C12.9 5.9 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9Z" />
    </Base>
  );
}

export function IconBag() {
  return (
    <Base>
      <path d="M6 8h12l1 12.5H5L6 8Z" />
      <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
    </Base>
  );
}

export function IconClose() {
  return (
    <Base>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Base>
  );
}

export function IconChevronDown() {
  return (
    <Base>
      <polyline points="6 9 12 15 18 9" />
    </Base>
  );
}
