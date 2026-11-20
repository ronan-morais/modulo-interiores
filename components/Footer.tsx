import Link from "next/link";
import { BrandMark } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { services, site, maintenance } from "@/lib/site";

const legalLinks = [
  { label: "Política de privacidade", href: "/privacidade" },
  { label: "Trabalhe com a gente", href: `mailto:${site.email}?subject=Trabalhe%20com%20a%20gente` },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand brand-light" aria-label="Módulo Interiores — página inicial">
              <BrandMark />
              <span className="brand-wordmark">
                <span className="brand-name">MÓDULO</span>
                <span className="brand-descriptor">INTERIORES</span>
              </span>
            </Link>
            <p>
              Drywall, móveis sob medida, forros e pisos em Belo Horizonte e
              região metropolitana. Obra a seco, residencial e comercial, com
              equipe própria.
            </p>
            <ul className="footer-contacts">
              <li>
                <Icon name="phone" size={14} />
                <a href={site.phone.href}>{site.phone.display}</a>
              </li>
              <li>
                <Icon name="message-circle" size={14} />
                <a href={site.whatsapp.href} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
              <li>
                <Icon name="mail" size={14} />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <Icon name="instagram" size={14} />
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
                  {site.instagram}
                </a>
              </li>
            </ul>
          </div>

          <nav className="footer-column" aria-label="Serviços">
            <h2>SERVIÇOS</h2>
            <ul>
              {services.map((service) => (
                <li key={service.id}>
                  <Link href={`/servicos#${service.id}`}>{service.title}</Link>
                </li>
              ))}
              <li>
                <Link href={`/servicos#${maintenance.id}`}>{maintenance.title}</Link>
              </li>
            </ul>
          </nav>

          <div className="footer-column">
            <h2>ATENDIMENTO</h2>
            <ul>
              <li>{site.areasServed.join(" · ")}</li>
              {site.openingHours.map((item) => (
                <li key={item.days}>
                  {item.days}, {item.hours}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Módulo Interiores · Todos os direitos
            reservados
          </p>
          <ul className="footer-legal">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
