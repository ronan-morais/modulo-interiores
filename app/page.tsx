import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@/components/Carousel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { pageMetadata } from "@/lib/metadata";
import { advantages, maintenance, maintenanceWhatsappHref, services, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Drywall, sancas, forros e pisos em Belo Horizonte | Módulo Interiores",
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

const proofItems = [
  { label: "Equipe própria", detail: "Medição, projeto e execução." },
  { label: "Orçamento em 1 dia útil", detail: "Com material, mão de obra e prazo." },
  { label: "Medição sem custo", detail: "Em Belo Horizonte e região." },
  { label: "Garantia por escrito", detail: "No serviço executado." },
];

const processSteps = [
  {
    index: "01",
    title: "Orçamento online",
    description:
      "Conte o ambiente e envie fotos e medidas. A resposta traz escopo e valor em até 1 dia útil.",
  },
  {
    index: "02",
    title: "Medição no local",
    description:
      "Conferimos medidas e infraestrutura e definimos o sistema a seco de cada ambiente.",
  },
  {
    index: "03",
    title: "Execução e entrega",
    description:
      "Equipe própria no canteiro, limpeza diária, conferência do acabamento e garantia por escrito.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="conteudo">
        <section className="hero" aria-labelledby="hero-title">
          <Image
            src="/images/hero-interiores-bh.webp"
            alt="Sala de estar integrada com pé-direito alto, esquadrias amplas e acabamento em drywall"
            fill
            priority
            sizes="100vw"
            className="hero-image"
          />
          <div className="hero-scrim" aria-hidden="true" />

          <div className="container hero-inner">
            <div className="hero-copy">
              <h1 id="hero-title">
                Ambiente novo em poucos dias, sem quebra-quebra.
              </h1>
              <p className="hero-subhead">
                Paredes, sancas, forros e móveis sob medida em Belo Horizonte.
                Obra a seco, sem entulho e com o imóvel em uso.
              </p>

              <div className="hero-actions">
                <Link className="btn btn-light btn-md" href="/orcamento">
                  Receber orçamento em 1 dia útil
                  <Icon name="arrow-right" size={16} className="icon-arrow" />
                </Link>
                <a className="hero-call" href={site.phone.href}>
                  <Icon name="phone" size={15} />
                  ou ligue {site.phone.display}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="proof" aria-label="Compromissos do atendimento">
          <div className="container">
            <ul className="proof-list">
              {proofItems.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="services" id="servicos" aria-labelledby="servicos-title">
          <div className="container">
            <div className="section-head">
              <div data-reveal>
                <h2 id="servicos-title">Seis sistemas a seco, um só acabamento.</h2>
              </div>
              <div className="head-note" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
                <p>
                  Instalação, reforma e manutenção em paredes, sancas, forros,
                  móveis e pisos, para imóveis residenciais e comerciais.
                </p>
                <Link className="head-link" href="/servicos">
                  Ver materiais e detalhes
                  <Icon name="arrow-right" size={15} className="icon-arrow" />
                </Link>
              </div>
            </div>

            <div data-reveal>
              <Carousel label="Serviços executados">
                {services.map((service) => (
                  <Link
                    className="service-tile"
                    key={service.id}
                    href={`/servicos#${service.id}`}
                  >
                    <span className="plate">
                      <Image
                        src={service.image}
                        alt={service.alt}
                        fill
                        sizes="(max-width: 720px) 84vw, (max-width: 980px) 45vw, 420px"
                      />
                    </span>
                    <span className="tile-category">{service.category}</span>
                    <h3>{service.title}</h3>
                    <p>{service.homeDescription}</p>
                  </Link>
                ))}
              </Carousel>
            </div>
          </div>
        </section>

        <section className="maintenance-band" id="manutencao" aria-labelledby="manutencao-title">
          <div className="container maintenance-inner">
            <div data-reveal>
              <h2 id="manutencao-title">Manutenção do que já está instalado.</h2>
              <p>{maintenance.homeDescription}</p>
            </div>
            <div className="maintenance-actions" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
              <a
                className="btn btn-dark btn-md"
                href={maintenanceWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="message-circle" size={16} />
                Chamar no WhatsApp
              </a>
              <Link className="head-link" href="/servicos#manutencao">
                Ver o que fazemos
                <Icon name="arrow-right" size={15} className="icon-arrow" />
              </Link>
            </div>
          </div>
        </section>

        <section className="why" id="obra-a-seco" aria-labelledby="why-title">
          <div className="container">
            <div className="why-head" data-reveal>
              <h2 id="why-title">Obra que não interrompe a rotina.</h2>
            </div>

            <div data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
              <Carousel label="Diferenciais da obra a seco">
                {advantages.map((advantage) => (
                  <article className="why-card" key={advantage.index}>
                    <strong>{advantage.title}</strong>
                    <p>{advantage.description}</p>
                  </article>
                ))}
              </Carousel>
            </div>
          </div>
        </section>

        <section className="process" id="como-funciona" aria-labelledby="processo-title">
          <div className="container">
            <h2 id="processo-title" data-reveal>
              Do pedido à entrega, em três etapas.
            </h2>

            <div data-reveal>
              <Carousel label="Etapas do atendimento">
                {processSteps.map((step) => (
                  <div className="step" key={step.index}>
                    <span className="index">{step.index}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>

        <section className="final-cta" id="contato" aria-labelledby="contato-title">
          <div className="container final-inner">
            <div data-reveal>
              <h2 id="contato-title">
                Conte o ambiente. Devolvemos sistema, prazo e valor.
              </h2>
              <p>
                Três minutos no formulário. A proposta chega em até 1 dia útil,
                com visita de medição sem custo em BH.
              </p>
            </div>
            <div className="final-actions" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
              <Link className="btn btn-light btn-md" href="/orcamento">
                Fazer orçamento online
                <Icon name="arrow-right" size={16} className="icon-arrow" />
              </Link>
              <a
                className="btn btn-outline-light btn-md"
                href={site.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="message-circle" size={16} />
                WhatsApp {site.whatsapp.display}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
