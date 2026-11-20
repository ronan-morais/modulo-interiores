import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FooterStrip } from "@/components/FooterStrip";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceListSchema } from "@/lib/schema";
import { maintenance, maintenanceWhatsappHref, services, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Drywall, móveis, forros e pisos em BH",
  description:
    "Instalação e manutenção de paredes e móveis em drywall (armários, closets, guarda-roupas, nichos), forro de PVC, modular e gesso, piso modular e vinílico em BH. Obra residencial e comercial com equipe própria.",
  path: "/servicos",
});

export default function ServicosPage() {
  return (
    <>
      <Header active="servicos" />

      <main id="conteudo">
        <section className="page-intro" aria-labelledby="servicos-title">
          <div className="container">
            <nav className="breadcrumb" aria-label="Você está aqui">
              <Link href="/">Início</Link> <span aria-hidden="true">/</span>{" "}
              <span>Serviços</span>
            </nav>
            <div className="page-intro-grid">
              <h1 id="servicos-title">
                Instalação e manutenção de paredes, móveis, forros e pisos.
              </h1>
              <p className="page-intro-note">
                Tudo em obra a seco: perfis, placas, painéis, móveis sob medida
                e piso aplicado sobre o contrapiso existente. Obra nova, reforma
                e manutenção em BH, com equipe própria e material de linha
                profissional.
              </p>
            </div>
          </div>
        </section>

        <div className="service-list">
          <div className="container">
            {services.map((service) => (
              <article
                className="service-block"
                id={service.id}
                key={service.id}
              >
                <div className="service-copy" data-reveal>
                  <div className="service-index">
                    <span className="num">{service.index}</span>
                    <span className="cat">{service.category}</span>
                  </div>
                  <h2>{service.title}</h2>
                  <p className="desc">{service.pageDescription}</p>
                  <p className="lead">{service.lead}</p>
                  <ul className="service-bullets">
                    {service.bullets.map((bullet) => (
                      <li key={bullet}>
                        <Icon name="check" size={15} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="service-plate" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 980px) 92vw, 832px"
                  />
                </div>
              </article>
            ))}

            <article className="service-block" id="manutencao">
              <div className="service-copy" data-reveal>
                <div className="service-index">
                  <span className="num">{maintenance.index}</span>
                  <span className="cat">{maintenance.category}</span>
                </div>
                <h2>{maintenance.title}</h2>
                <p className="desc">{maintenance.pageDescription}</p>
                <p className="lead">Reparo sem obra no restante do imóvel.</p>
                <ul className="service-bullets">
                  {maintenance.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Icon name="check" size={15} />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <a
                  className="btn btn-dark btn-md maintenance-cta"
                  href={maintenanceWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="message-circle" size={16} />
                  Chamar no WhatsApp
                </a>
              </div>

              <div className="service-plate" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
                <Image
                  src="/images/residencial-bh.webp"
                  alt="Sala de estar com forro de gesso e piso vinílico instalados"
                  fill
                  sizes="(max-width: 980px) 92vw, 832px"
                />
              </div>
            </article>
          </div>
        </div>

        <section className="services-cta" aria-labelledby="servicos-cta-title">
          <div className="container services-cta-inner">
            <div data-reveal>
              <h2 id="servicos-cta-title">
                Não sabe qual forro ou piso usar?
                <br />
                A gente mede e indica.
              </h2>
              <p className="services-cta-note">
                Visita técnica sem custo em Belo Horizonte e região. Você recebe
                o sistema a seco com melhor custo, prazo e acabamento para cada
                ambiente.
              </p>
            </div>
            <div className="services-cta-actions" data-reveal style={{ "--reveal-delay": "70ms" } as CSSProperties}>
              <Link className="btn btn-light btn-md" href="/orcamento">
                Receber orçamento
                <Icon name="arrow-right" size={16} className="icon-arrow" />
              </Link>
              <a
                className="btn btn-outline-light btn-md"
                href={site.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="message-circle" size={16} />
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <FooterStrip />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema([
              { name: "Início", path: "/" },
              { name: "Serviços", path: "/servicos" },
            ]),
            serviceListSchema(),
          ],
        }}
      />
    </>
  );
}
