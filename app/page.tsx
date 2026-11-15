import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { pageMetadata } from "@/lib/metadata";
import { services, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Drywall, forros e pisos em Belo Horizonte | Módulo Interiores",
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

const processSteps = [
  {
    index: "01",
    title: "Orçamento online",
    description:
      "Você descreve o ambiente, envia fotos e medidas no formulário. Respondemos com escopo e valores em até 1 dia útil.",
  },
  {
    index: "02",
    title: "Medição no local",
    description:
      "Um técnico confere medidas, infraestrutura e condições da obra, e fecha o projeto executivo com você.",
  },
  {
    index: "03",
    title: "Execução",
    description:
      "Material comprado e equipe própria no canteiro, com proteção dos ambientes e limpeza diária.",
  },
  {
    index: "04",
    title: "Entrega e garantia",
    description:
      "Conferência do acabamento ponto a ponto, retirada de entulho e garantia por escrito do serviço.",
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
              <p className="eyebrow hero-eyebrow">
                Drywall · Forros · Pisos
              </p>
              <h1 id="hero-title">
                Interiores que
                <br />
                se resolvem em
                <br />
                poucos dias.
              </h1>
              <p className="hero-subhead">
                Instalação e manutenção de paredes e divisórias em drywall,
                forros de PVC, modular e placa de gesso, piso modular e
                vinílico. Atendimento residencial e comercial em Belo Horizonte
                e região metropolitana.
              </p>

              <div className="hero-actions">
                <Link className="btn btn-light btn-md" href="/orcamento">
                  Solicitar orçamento
                  <Icon name="arrow-right" size={16} />
                </Link>
                <Link className="btn btn-outline-light btn-md" href="/servicos">
                  Ver serviços
                </Link>
                <a className="hero-call" href={site.phone.href}>
                  <Icon name="phone" size={14} />
                  ou ligue {site.phone.display}
                </a>
              </div>
            </div>

            <div className="hero-meta">
              <p className="eyebrow">Orçamento online</p>
              <p>
                Descreva o ambiente, envie fotos e receba uma proposta com
                escopo e prazo definidos.
              </p>
            </div>
          </div>
        </section>

        <div className="coverage">
          <div className="container coverage-inner">
            <p className="eyebrow">Atendimento</p>
            <ul>
              {site.coverageCities.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>
        </div>

        <section className="intro" id="sobre" aria-labelledby="sobre-title">
          <div className="container intro-grid">
            <div>
              <p className="eyebrow">Quem executa</p>
              <h2 id="sobre-title">
                Uma equipe só, do primeiro traço ao último acabamento.
              </h2>
            </div>
            <div className="intro-copy">
              <p>
                Projetamos a solução, compramos o material e executamos a obra
                com equipe própria. Paredes e divisórias em drywall, forros de
                PVC, modular e placa de gesso, piso modular e vinílico, com
                prazo combinado e canteiro limpo todos os dias.
              </p>
              <ul className="facts">
                <li className="fact">
                  <span className="fact-index">01</span>
                  <span>
                    Medição e projeto no local, sem custo na região de BH.
                  </span>
                </li>
                <li className="fact">
                  <span className="fact-index">02</span>
                  <span>
                    Materiais de linha profissional, com nota e garantia.
                  </span>
                </li>
                <li className="fact">
                  <span className="fact-index">03</span>
                  <span>
                    Obra residencial e comercial, inclusive fora do horário.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="services" id="servicos" aria-labelledby="servicos-title">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">O que executamos</p>
                <h2 id="servicos-title">
                  Seis frentes,
                  <br />
                  um só acabamento.
                </h2>
              </div>
              <div className="head-note">
                <p>
                  Instalação, reforma e manutenção. Executamos também reparos
                  pontuais, troca de placas e revisão de forros já instalados.
                </p>
                <Link className="head-link" href="/servicos">
                  Falar com um especialista
                  <Icon name="arrow-right" size={15} />
                </Link>
                <a className="head-phone" href={site.phone.href}>
                  <Icon name="phone" size={15} />
                  Ligar agora: {site.phone.display}
                </a>
              </div>
            </div>

            <div className="service-grid">
              {services.map((service) => (
                <Link
                  className="service-card"
                  key={service.id}
                  href={`/servicos#${service.id}`}
                >
                  <span className="plate">
                    <Image
                      src={service.image}
                      alt={service.alt}
                      fill
                      sizes="(max-width: 720px) 90vw, (max-width: 980px) 45vw, 421px"
                    />
                  </span>
                  <span className="service-caption">
                    <span className="index">{service.index}</span>
                    <span className="category">{service.category}</span>
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.homeDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rc" id="obras" aria-labelledby="obras-title">
          <div className="container">
            <div className="rc-head">
              <div>
                <p className="eyebrow">Residencial · Comercial</p>
                <h2 id="obras-title">
                  Casa ou empresa,
                  <br />
                  o mesmo método de obra.
                </h2>
              </div>
              <div className="rc-note">
                <p>
                  Ambientes em uso exigem planejamento: executamos por etapas,
                  com proteção do piso e dos móveis e limpeza ao final de cada
                  dia.
                </p>
                <a
                  className="rc-wa"
                  href={site.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="message-circle" size={15} />
                  WhatsApp: {site.whatsapp.display}
                </a>
              </div>
            </div>

            <div className="rc-grid">
              <article className="rc-card">
                <div className="plate">
                  <Image
                    src="/images/residencial-bh.webp"
                    alt="Sala de estar residencial com forro de gesso e piso vinílico"
                    fill
                    sizes="(max-width: 980px) 90vw, 648px"
                  />
                </div>
                <div className="rc-caption">
                  <span>Residencial</span>
                  <Icon name="arrow-up-right" size={18} />
                </div>
                <h3>Casas e apartamentos</h3>
                <p>
                  Divisórias para novos ambientes, forro de gesso com iluminação
                  indireta, forro de PVC em áreas molhadas e piso vinílico em
                  toda a área social.
                </p>
              </article>

              <article className="rc-card">
                <div className="plate">
                  <Image
                    src="/images/comercial-bh.webp"
                    alt="Escritório corporativo com divisórias de vidro e piso modular"
                    fill
                    sizes="(max-width: 980px) 90vw, 648px"
                  />
                </div>
                <div className="rc-caption">
                  <span>Comercial</span>
                  <Icon name="arrow-up-right" size={18} />
                </div>
                <h3>Lojas, escritórios e clínicas</h3>
                <p>
                  Divisórias acústicas entre salas, forro modular com passagem
                  de infraestrutura, piso modular elevado e manutenção em loja
                  aberta.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="process"
          id="como-funciona"
          aria-labelledby="processo-title"
        >
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Como funciona</p>
                <h2 id="processo-title">
                  Do orçamento à entrega, em quatro etapas.
                </h2>
              </div>
            </div>

            <div className="process-grid">
              {processSteps.map((step) => (
                <div className="step" key={step.index}>
                  <span className="index">{step.index}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-band" id="contato" aria-labelledby="contato-title">
          <div className="container contact-inner">
            <div className="contact-copy">
              <p className="eyebrow">Atendimento direto · Seg a sáb</p>
              <h2 className="contact-phone" id="contato-title">
                {site.phone.display} · {site.whatsapp.display}
              </h2>
            </div>
            <div className="contact-actions">
              <a
                className="btn btn-dark"
                href={site.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="message-circle" size={15} />
                Chamar no WhatsApp
              </a>
              <a className="btn btn-outline" href={site.phone.href}>
                <Icon name="phone" size={15} />
                Telefonar
              </a>
            </div>
          </div>
        </section>

        <section className="quote-cta" aria-labelledby="orcamento-title">
          <div className="container quote-grid">
            <div>
              <p className="eyebrow">Orçamento online</p>
              <h2 id="orcamento-title">
                Descreva o ambiente. A gente devolve escopo, prazo e valor.
              </h2>
              <p className="quote-desc">
                O formulário leva cerca de 3 minutos. Você escolhe os serviços,
                informa as medidas aproximadas e anexa fotos do ambiente, se
                tiver.
              </p>
              <ul className="checks">
                <li>
                  <Icon name="check" size={16} />
                  Resposta em até 1 dia útil
                </li>
                <li>
                  <Icon name="check" size={16} />
                  Visita de medição sem custo em BH
                </li>
                <li>
                  <Icon name="check" size={16} />
                  Proposta com material e mão de obra detalhados
                </li>
              </ul>
              <Link className="btn btn-dark btn-md" href="/orcamento">
                Começar orçamento
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>

            <Link
              className="quote-preview"
              href="/orcamento"
              aria-label="Abrir o formulário de orçamento online"
            >
              <div aria-hidden="true">
                <div className="preview-top">
                  <span className="step-label">PASSO 1 DE 2</span>
                  <span className="time">~3 min</span>
                </div>
                <div className="preview-progress">
                  <span />
                </div>
                <h3>O que você precisa?</h3>
                <div className="preview-chips">
                  <span className="preview-chip is-selected">
                    Divisórias em drywall
                  </span>
                  <span className="preview-chip">Forro de PVC</span>
                  <span className="preview-chip is-selected">
                    Forro modular
                  </span>
                  <span className="preview-chip">Placa de gesso</span>
                  <span className="preview-chip">Piso modular</span>
                  <span className="preview-chip">Piso vinílico</span>
                </div>
                <p className="preview-label">Tipo de imóvel</p>
                <div className="preview-segment">
                  <span className="is-selected">Residencial</span>
                  <span>Comercial</span>
                </div>
                <div className="preview-continue">
                  <span className="btn btn-accent">Continuar</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
