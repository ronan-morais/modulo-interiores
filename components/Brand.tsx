import Link from "next/link";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`.trim()} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand${light ? " brand-light" : ""}`}
      aria-label="Módulo Interiores — página inicial"
    >
      <BrandMark />
      <span className="brand-wordmark">
        <span className="brand-name">MÓDULO</span>
        <span className="brand-descriptor">INTERIORES</span>
      </span>
    </Link>
  );
}
