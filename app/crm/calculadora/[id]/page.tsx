import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BrandMark } from "@/components/Brand";
import { CrmShell } from "@/components/CrmShell";
import { PrintButton } from "@/components/PrintButton";
import { QuoteEmailButton } from "@/components/QuoteEmailButton";
import { isAuthenticated, whatsappHref } from "@/lib/crm";
import { formatBRL } from "@/lib/money";
import { lineTotalCents } from "@/lib/orcamento-material";
import { getOrcamentoMaterial } from "@/lib/orcamento-material-db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Orçamento de material",
  robots: { index: false, follow: false, nocache: true },
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const quantityFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

export default async function OrcamentoMaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/crm");

  const { id } = await params;
  const { salvo } = await searchParams;
  const orcamentoId = Number(id);
  if (!Number.isInteger(orcamentoId) || orcamentoId <= 0) notFound();

  const orcamento = await getOrcamentoMaterial(orcamentoId);
  if (!orcamento) notFound();

  const waHref = whatsappHref(orcamento.clienteWhatsapp);
  const data = dateFormatter.format(new Date(orcamento.criadoEm));
  const numero = `#${String(orcamento.id).padStart(3, "0")}`;

  const assunto = `Orçamento de material — ${orcamento.titulo}`;
  const corpo = [
    `Olá${orcamento.clienteNome ? `, ${orcamento.clienteNome.split(" ")[0]}` : ""}!`,
    "",
    `Segue o orçamento de material da obra “${orcamento.titulo}” (${numero}).`,
    "",
    ...orcamento.itens.map(
      (item) =>
        `• ${quantityFormatter.format(item.quantidade)} ${item.unidade} — ${item.descricao}: ${formatBRL(lineTotalCents(item))}`,
    ),
    "",
    `Subtotal: ${formatBRL(orcamento.subtotalCents)}`,
    ...(orcamento.maoObraCents > 0
      ? [
          `Mão de obra${orcamento.maoObraDescricao ? ` (${orcamento.maoObraDescricao})` : ""}: ${formatBRL(orcamento.maoObraCents)}`,
        ]
      : []),
    `Frete: ${formatBRL(orcamento.freteCents)}`,
    `Descontos: ${formatBRL(orcamento.descontoCents)}`,
    `Total: ${formatBRL(orcamento.totalCents)}`,
    ...(orcamento.observacoes ? ["", orcamento.observacoes] : []),
    "",
    "Módulo Interiores",
    site.phone.display,
    site.email,
  ].join("\n");

  return (
    <CrmShell title="Orçamento de material" current="calculadora">
      <div className="crm-quote-actions">
        <Link className="crm-link" href="/crm/calculadora">
          Voltar à calculadora
        </Link>
        <div className="crm-quote-send">
          <QuoteEmailButton
            defaultEmail={orcamento.clienteEmail}
            subject={assunto}
            body={corpo}
          />
          <PrintButton />
        </div>
      </div>

      {salvo ? <p className="crm-saved">Orçamento salvo.</p> : null}

      <article className="quote-doc">
        <header className="quote-doc-head">
          <div className="quote-doc-brand">
            <BrandMark />
            <span>MÓDULO INTERIORES</span>
          </div>
          <div className="quote-doc-title">
            <h2>Orçamento de material</h2>
            <p>
              {numero} · {data}
            </p>
          </div>
        </header>

        <dl className="quote-doc-client">
          <div>
            <dt>Cliente</dt>
            <dd>{orcamento.clienteNome || "—"}</dd>
          </div>
          <div>
            <dt>Contato</dt>
            <dd>
              {orcamento.clienteWhatsapp && waHref ? (
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  {orcamento.clienteWhatsapp}
                </a>
              ) : null}
              {orcamento.clienteWhatsapp && orcamento.clienteEmail
                ? " · "
                : null}
              {orcamento.clienteEmail ? (
                <a href={`mailto:${orcamento.clienteEmail}`}>
                  {orcamento.clienteEmail}
                </a>
              ) : null}
              {!orcamento.clienteWhatsapp && !orcamento.clienteEmail
                ? "—"
                : null}
            </dd>
          </div>
          <div>
            <dt>Obra</dt>
            <dd>{orcamento.titulo}</dd>
          </div>
        </dl>

        <div className="quote-table-wrap">
          <table className="quote-table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Qtd</th>
                <th scope="col">Un.</th>
                <th scope="col">Unitário</th>
                <th scope="col">Frete</th>
                <th scope="col">Desconto</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {orcamento.itens.map((item, index) => (
                <tr key={`${index}-${item.descricao}`}>
                  <td data-label="Item">{item.descricao}</td>
                  <td data-label="Qtd" className="quote-num">
                    {quantityFormatter.format(item.quantidade)}
                  </td>
                  <td data-label="Un.">{item.unidade}</td>
                  <td data-label="Unitário" className="quote-num">
                    {formatBRL(item.valorUnitCents)}
                  </td>
                  <td data-label="Frete" className="quote-num">
                    {item.freteCents ? formatBRL(item.freteCents) : "—"}
                  </td>
                  <td data-label="Desconto" className="quote-num">
                    {item.descontoCents
                      ? `−${formatBRL(item.descontoCents)}`
                      : "—"}
                  </td>
                  <td data-label="Total" className="quote-num quote-strong">
                    {formatBRL(lineTotalCents(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="quote-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatBRL(orcamento.subtotalCents)}</dd>
          </div>
          {orcamento.maoObraCents > 0 ? (
            <div>
              <dt>
                {orcamento.maoObraDescricao
                  ? `Mão de obra · ${orcamento.maoObraDescricao}`
                  : "Mão de obra"}
              </dt>
              <dd>{formatBRL(orcamento.maoObraCents)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Frete</dt>
            <dd>{formatBRL(orcamento.freteCents)}</dd>
          </div>
          <div>
            <dt>Descontos</dt>
            <dd>−{formatBRL(orcamento.descontoCents)}</dd>
          </div>
          <div className="quote-total-final">
            <dt>Total</dt>
            <dd>{formatBRL(orcamento.totalCents)}</dd>
          </div>
        </dl>

        {orcamento.observacoes ? (
          <p className="quote-note">{orcamento.observacoes}</p>
        ) : null}

        <footer className="quote-doc-foot">
          Módulo Interiores · {site.phone.display} · {site.email} ·{" "}
          {site.areasServed.join(" / ")}
        </footer>
      </article>
    </CrmShell>
  );
}
