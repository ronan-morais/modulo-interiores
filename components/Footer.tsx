import Link from "next/link";
import { BrandMark } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { services, site } from "@/lib/site";

const legalLinks = [
  { label: "Política de privacidade", href: "/privacidade" },
  { label: "Orçamento online", href: "/orcamento" },
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
              Instalação e manutenção de drywall, forros e pisos em Belo
              Horizonte e região metropolitana. Atendimento residencial e
              comercial.
            </p>
          </div>

          <nav className="footer-column" aria-label="Serviços">
            <h2>SERVIÇOS</h2>
            <ul>
              {services.map((service) => (
                <li key={service.id}>
                  <Link href={`/servicos#${service.id}`}>{service.title}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-column">
            <h2>ATENDIMENTO</h2>
            <ul>
              <li>Belo Horizonte</li>
              <li>Contagem · Betim</li>
              <li>Nova Lima · Sabará</li>
              {site.openingHours.map((item) => (
                <li key={item.days}>
                  {item.days}, {item.hours}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column footer-contact">
            <h2>CONTATO</h2>
            <ul>
              <li>
                <Icon name="phone" size={14} />
                <a href={site.phone.href}>{site.phone.display}</a>
              </li>
              <li>
                <Icon name="message-circle" size={14} />
                <a href={site.whatsapp.href} target="_blank" rel="noopener noreferrer">
                  {site.whatsapp.display}
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
              <li>
                <Icon name="map-pin" size={14} />
                <address>
                  {site.address.street} · {site.address.district}, {site.address.city}
                </address>
              </li>
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
