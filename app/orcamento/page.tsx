import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, quotePageSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "Cotação online de drywall, forro e piso",
  description:
    "Solicite em 3 minutos um orçamento de drywall, forro de PVC, modular ou gesso, piso modular e vinílico, em Belo Horizonte e região.",
  path: "/orcamento",
});

const trustItems = [
  { icon: "ruler" as const, text: "Visita de medição sem custo em BH" },
  { icon: "shield-check" as const, text: "Garantia por escrito do serviço" },
  { icon: "file-text" as const, text: "Proposta com material, mão de obra e prazo" },
  { icon: "check" as const, text: "Obra a seco: sem quebra-quebra" },
];

export default function OrcamentoPage() {
  return (
    <>
      <Header variant="back" />

      <main id="conteudo" className="quote-main">
        <div className="container quote-breadcrumb">
          <nav className="breadcrumb" aria-label="Você está aqui">
            <Link href="/">Início</Link> <span aria-hidden="true">/</span>{" "}
            <span>Cotação online</span>
          </nav>
        </div>

        <div className="container quote-intro" data-reveal>
          <h1>Vamos dimensionar a sua obra.</h1>
          <p>
            Dois passos, cerca de três minutos. Ao final, o pedido fica
            registrado com a equipe e você recebe uma proposta com sistema
            construtivo, escopo, material e prazo — sem visita obrigatória.
          </p>
        </div>

        <QuoteForm />

        <section className="trust-band" aria-label="Compromissos do atendimento">
          <div className="container trust-inner">
            {trustItems.map((item) => (
              <div className="trust-item" key={item.text}>
                <Icon name={item.icon} size={16} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema([
              { name: "Início", path: "/" },
              { name: "Cotação online", path: "/orcamento" },
            ]),
            quotePageSchema(),
          ],
        }}
      />
    </>
  );
}
