import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FooterStrip } from "@/components/FooterStrip";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceListSchema } from "@/lib/schema";
import { services, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Serviços de drywall, forros e pisos em BH",
  description:
    "Paredes e divisórias em drywall, forro de PVC, modular e gesso, piso modular e vinílico em BH. Obra residencial e comercial com equipe própria.",
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
                Instalação e manutenção de paredes, forros e pisos.
              </h1>
              <p className="page-intro-note">
                Executamos obra nova, reforma e reparo pontual, em residências e
                empresas, com equipe própria e material de linha profissional.
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
                <div className="service-copy">
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

                <div className="service-plate">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 980px) 92vw, 832px"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="services-cta" aria-labelledby="servicos-cta-title">
          <div className="container services-cta-inner">
            <div>
              <h2 id="servicos-cta-title">
                Não sabe qual forro ou piso usar?
                <br />
                A gente mede e indica.
              </h2>
              <p className="services-cta-note">
                Visita técnica sem custo em Belo Horizonte e região
                metropolitana.
              </p>
            </div>
            <div className="services-cta-actions">
              <Link className="btn btn-light btn-md" href="/orcamento">
                Pedir orçamento
                <Icon name="arrow-right" size={16} />
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
