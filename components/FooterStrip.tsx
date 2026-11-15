import Link from "next/link";
import { site } from "@/lib/site";

export function FooterStrip() {
  return (
    <footer className="footer-strip">
      <div className="container footer-strip-inner">
        <p>MÓDULO INTERIORES · BELO HORIZONTE / MG</p>
        <ul>
          <li>
            <a href={site.phone.href}>{site.phone.display}</a>
          </li>
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            <Link href="/orcamento">Orçamento online</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
