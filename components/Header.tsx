import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { navLinks, site } from "@/lib/site";

type HeaderProps = {
  active?: "servicos" | "orcamento";
  variant?: "default" | "back";
};

export function Header({ active, variant = "default" }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />

        <nav className="site-nav" aria-label="Navegação principal">
          <ul>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={
                    active === "servicos" && link.href === "/servicos"
                      ? "page"
                      : undefined
                  }
                  className={
                    active === "servicos" && link.href === "/servicos"
                      ? "is-active"
                      : undefined
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a className="header-phone" href={site.phone.href}>
            <Icon name="phone" size={15} />
            <span>{site.phone.display}</span>
          </a>

          {variant === "back" ? (
            <Link className="btn btn-outline btn-sm" href="/">
              <Icon name="arrow-left" size={15} />
              Voltar ao site
            </Link>
          ) : (
            <Link className="btn btn-dark btn-sm" href="/orcamento">
              Orçamento online
              <Icon name="arrow-up-right" size={15} className="icon-arrow-diag" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
