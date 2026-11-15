import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { pageMetadata } from "@/lib/metadata";
import { advantages, services, site } from "@/lib/site";

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
      "Descreva o ambiente, envie fotos e medidas. Devolvemos escopo, sistema construtivo e valor em até 1 dia útil.",
  },
  {
    index: "02",
    title: "Medição no local",
    description:
      "Conferimos medidas e infraestrutura e fechamos o sistema a seco: perfis, placas, isolamento e pontos de luz.",
  },
  {
    index: "03",
    title: "Execução",
    description:
      "Material entregue, ambientes protegidos e equipe própria no canteiro. Limpeza ao fim de cada dia.",
  },
  {
    index: "04",
    title: "Entrega e garantia",
    description:
      "Conferência do acabamento ponto a ponto, entulho retirado e garantia por escrito do serviço.",
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
                Drywall · Forros · Pisos · Obra a seco
              </p>
              <h1 id="hero-title">
                Ambiente novo em
                <br />
                poucos dias, sem
                <br />
                quebra-quebra.
              </h1>
              <p className="hero-subhead">
                Construção a seco em Belo Horizonte: paredes e divisórias em
                drywall, forros de PVC, modular e gesso, piso modular e
                vinílico. Sem demolição, sem entulho e com o imóvel em uso
                durante a obra.
              </p>

              <div className="hero-actions">
                <Link className="btn btn-light btn-md" href="/orcamento">
                  Receber orçamento em 1 dia útil
                  <Icon name="arrow-right" size={16} className="icon-arrow" />
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
                Conte o ambiente e envie fotos. A proposta volta com sistema
                construtivo, material, prazo e valor.
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
            <div data-reveal>
              <p className="eyebrow">Quem executa</p>
              <h2 id="sobre-title">
                Uma equipe só, do primeiro traço ao último acabamento.
              </h2>
            </div>
            <div className="intro-copy" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
              <p>
                Projetamos o sistema construtivo, compramos o material e
                executamos a obra com equipe própria. Como tudo é feito a seco,
                você ganha tempo: menos demolição, menos entulho e menos dias com
                a casa ou a loja fora de uso.
              </p>
              <ul className="facts">
                <li className="fact">
                  <span className="fact-index">01</span>
                  <span>Medição e projeto no local, sem custo em BH e região.</span>
                </li>
                <li className="fact">
                  <span className="fact-index">02</span>
                  <span>Materiais de linha profissional, com nota e garantia por escrito.</span>
                </li>
                <li className="fact">
                  <span className="fact-index">03</span>
                  <span>Obra residencial e comercial, por etapas ou fora do horário.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          className="advantages"
          id="obra-a-seco"
          aria-labelledby="advantages-title"
        >
          <div className="container">
            <div className="advantages-head">
              <div data-reveal>
                <p className="eyebrow">Por que obra a seco</p>
                <h2 id="advantages-title">
                  Menos entulho, menos prazo, mais imóvel funcionando.
                </h2>
              </div>
              <p className="advantages-note" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
                Construção a seco troca demolição, argamassa e cura por perfis,
                placas e encaixes. O material entra pronto e o ambiente sai
                acabado — sem o canteiro invadir o resto da casa.
              </p>
            </div>

            <div className="adv-grid">
              {advantages.map((advantage, index) => (
                <article
                  className="adv"
                  key={advantage.index}
                  data-reveal
                  style={
                    {
                      "--reveal-delay": `${(index % 3) * 80}ms`,
                    } as CSSProperties
                  }
                >
                  <span className="adv-index">{advantage.index}</span>
                  <h3>{advantage.title}</h3>
                  <p>{advantage.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="services" id="servicos" aria-labelledby="servicos-title">
          <div className="container">
            <div className="section-head">
              <div data-reveal>
                <p className="eyebrow">O que executamos</p>
                <h2 id="servicos-title">
                  Seis frentes,
                  <br />
                  um só acabamento.
                </h2>
              </div>
              <div className="head-note" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
                <p>
                  Instalação, reforma e manutenção em sistemas a seco. Também
                  fazemos reparo pontual, troca de placas e revisão de forro já
                  instalado, sem obra no restante do imóvel.
                </p>
                <Link className="head-link" href="/servicos">
                  Falar com um especialista
                  <Icon name="arrow-right" size={15} className="icon-arrow" />
                </Link>
                <a className="head-phone" href={site.phone.href}>
                  <Icon name="phone" size={15} />
                  Ligar agora: {site.phone.display}
                </a>
              </div>
            </div>

            <div className="service-grid">
              {services.map((service, index) => (
                <Link
                  className="service-card"
                  key={service.id}
                  href={`/servicos#${service.id}`}
                  data-reveal
                  style={
                    {
                      "--reveal-delay": `${(index % 3) * 80}ms`,
                    } as CSSProperties
                  }
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
              <div data-reveal>
                <p className="eyebrow">Residencial · Comercial</p>
                <h2 id="obras-title">
                  Casa ou empresa,
                  <br />
                  o mesmo método de obra.
                </h2>
              </div>
              <div className="rc-note" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
                <p>
                  Ambiente em uso pede obra limpa: executamos por etapas, com
                  proteção de piso e móveis, ruído controlado e limpeza ao final
                  de cada dia.
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
              <article className="rc-card" data-reveal>
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
                  Divisórias para novos ambientes, forro de gesso com luz
                  indireta, PVC nas áreas molhadas e piso vinílico sobre o piso
                  atual — sem sair de casa durante a obra.
                </p>
              </article>

              <article className="rc-card" data-reveal style={{ "--reveal-delay": "90ms" } as CSSProperties}>
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
                  Divisórias acústicas entre salas, forro modular com
                  infraestrutura acessível, piso elevado e manutenção em loja
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
              <div data-reveal>
                <p className="eyebrow">Como funciona</p>
                <h2 id="processo-title">
                  Do orçamento à entrega, em quatro etapas.
                </h2>
              </div>
            </div>

            <div className="process-grid">
              {processSteps.map((step, index) => (
                <div
                  className="step"
                  key={step.index}
                  data-reveal
                  style={
                    {
                      "--reveal-delay": `${index * 70}ms`,
                    } as CSSProperties
                  }
                >
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
            <div className="contact-copy" data-reveal>
              <p className="eyebrow">Telefone e WhatsApp · Seg a sáb</p>
              <h2 className="contact-phone" id="contato-title">
                {site.phone.display}
              </h2>
            </div>
            <div className="contact-actions" data-reveal style={{ "--reveal-delay": "70ms" } as CSSProperties}>
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
                Ligar agora
              </a>
            </div>
          </div>
        </section>

        <section className="quote-cta" aria-labelledby="orcamento-title">
          <div className="container quote-grid">
            <div data-reveal>
              <p className="eyebrow">Orçamento online</p>
              <h2 id="orcamento-title">
                Conte o ambiente. Devolvemos sistema, prazo e valor.
              </h2>
              <p className="quote-desc">
                Três minutos para explicar o que você precisa. Você escolhe os
                serviços, informa as medidas aproximadas e anexa fotos — a
                proposta volta com material, mão de obra e cronograma.
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
                  Sistema a seco definido por ambiente
                </li>
                <li>
                  <Icon name="check" size={16} />
                  Proposta com material, mão de obra e prazo
                </li>
              </ul>
              <Link className="btn btn-dark btn-md" href="/orcamento">
                Receber meu orçamento
                <Icon name="arrow-right" size={16} className="icon-arrow" />
              </Link>
            </div>

            <Link
              className="quote-preview"
              href="/orcamento"
              aria-label="Abrir o formulário de orçamento online"
              data-reveal
              style={{ "--reveal-delay": "90ms" } as CSSProperties}
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
