import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidade",
  description:
    "Como a Módulo Interiores trata os dados enviados no formulário de cotação online.",
  path: "/privacidade",
});

export default function PrivacidadePage() {
  return (
    <>
      <Header />

      <main id="conteudo">
        <div className="container quote-breadcrumb">
          <nav className="breadcrumb" aria-label="Você está aqui">
            <Link href="/">Início</Link> <span aria-hidden="true">/</span>{" "}
            <span>Política de privacidade</span>
          </nav>
        </div>

        <section className="legal" aria-labelledby="privacidade-title">
          <div className="container">
            <article>
              <p className="eyebrow">Privacidade</p>
              <h1 id="privacidade-title">Política de privacidade</h1>
              <p>
                A Módulo Interiores usa os dados informados por você apenas para
                elaborar e responder ao pedido de orçamento. Esta página
                explica quais dados são tratados e como você pode solicitar
                correção ou exclusão.
              </p>

              <h2>Dados coletados</h2>
              <p>
                No formulário de cotação online podem ser informados: nome,
                WhatsApp, e-mail, tipo de imóvel, serviços de interesse, área
                total aproximada, número de ambientes, cidade, bairro, prazo
                desejado, detalhes do ambiente e fotos ou plantas anexadas.
              </p>

              <h2>Como os dados são usados</h2>
              <ul>
                <li>Elaboração e envio da proposta de orçamento.</li>
                <li>Agendamento de visita técnica e contato sobre o pedido.</li>
                <li>Organização interna do atendimento e do histórico da obra.</li>
              </ul>

              <h2>Onde os dados ficam</h2>
              <p>
                Ao concluir o pedido, os dados informados são gravados em um
                banco de dados do site, hospedado no Turso (banco libSQL), para
                organizar o atendimento e o histórico da obra. A equipe usa o
                WhatsApp ou o e-mail informados para responder à solicitação.
              </p>
              <p>
                O rascunho do formulário pode ser salvo no armazenamento local
                do navegador ao usar a opção &quot;Salvar rascunho&quot;, e
                permanece apenas no seu dispositivo. Não vendemos nem
                compartilhamos dados com terceiros para publicidade.
              </p>

              <h2>Redes sociais e publicação</h2>
              <p>
                Fotos de obra publicadas nos perfis da Módulo Interiores no
                Instagram e no Facebook mostram apenas os ambientes executados.
                Imagens enviadas por clientes pelo formulário não são
                publicadas sem autorização por escrito.
              </p>

              <h2>Cookies e analytics</h2>
              <p>
                Este site não utiliza cookies de publicidade, rastreadores ou
                ferramentas de analytics.
              </p>

              <h2>Seus direitos</h2>
              <p>
                Você pode solicitar acesso, correção ou exclusão dos seus dados a
                qualquer momento pelo e-mail{" "}
                <a href={`mailto:${site.email}`}>{site.email}</a> ou pelo
                telefone <a href={site.phone.href}>{site.phone.display}</a>.
              </p>

              <h2>Atualizações</h2>
              <p>
                Esta política pode ser revisada para refletir mudanças no
                atendimento ou na legislação. Última atualização: novembro de
                2026.
              </p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
