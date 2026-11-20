import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BrandMark } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import {
  formatTimestamp,
  getLead,
  isAuthenticated,
  leadStatuses,
  statusLabel,
  whatsappHref,
} from "@/lib/crm";
import { deleteLead, logout, saveLead } from "../actions";

export const metadata: Metadata = {
  title: "Contato",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/crm");

  const { id } = await params;
  const { salvo } = await searchParams;
  const leadId = Number(id);
  if (!Number.isInteger(leadId) || leadId <= 0) notFound();

  const lead = await getLead(leadId);
  if (!lead) notFound();

  const waHref = whatsappHref(lead.whatsapp);
  const telHref = lead.whatsapp ? `tel:+${lead.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <div className="crm-page">
      <header className="crm-top">
        <div className="container crm-top-inner">
          <div className="crm-brand">
            <BrandMark />
            <div>
              <p className="crm-brand-label">Módulo Interiores</p>
              <h1>Contato #{lead.id}</h1>
            </div>
          </div>
          <div className="crm-actions">
            <Link className="crm-link" href="/crm">
              Voltar aos contatos
            </Link>
            <form action={logout}>
              <button className="btn btn-outline btn-sm" type="submit">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="conteudo" className="container crm-main">
        <div className="crm-detail-head">
          <div>
            <p className="crm-muted">
              Recebido em {formatTimestamp(lead.criadoEm)}
              {lead.atualizadoEm
                ? ` · atualizado em ${formatTimestamp(lead.atualizadoEm)}`
                : ""}
            </p>
            <h2>{lead.nome}</h2>
            <div className="crm-contact-links">
              {telHref ? (
                <a href={telHref}>
                  <Icon name="phone" size={15} />
                  {lead.whatsapp}
                </a>
              ) : null}
              {waHref ? (
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  <Icon name="message-circle" size={15} />
                  WhatsApp
                </a>
              ) : null}
              {lead.email ? (
                <a href={`mailto:${lead.email}`}>
                  <Icon name="mail" size={15} />
                  {lead.email}
                </a>
              ) : null}
            </div>
          </div>
          <span className="crm-badge" data-status={lead.status}>
            {statusLabel(lead.status)}
          </span>
        </div>

        <div className="crm-detail-grid">
          <section className="crm-panel" aria-labelledby="pedido-title">
            <h2 id="pedido-title">Pedido</h2>
            <dl className="crm-data">
              <div>
                <dt>Serviços</dt>
                <dd>
                  {lead.servicos.length
                    ? lead.servicos.map((service) => service.titulo).join(", ")
                    : "A definir"}
                </dd>
              </div>
              <div>
                <dt>Imóvel</dt>
                <dd>
                  {lead.tipoImovel}
                  {lead.areaM2 ? ` · ${lead.areaM2} m² no total` : ""}
                  {lead.ambientes ? ` · ${lead.ambientes} ambientes` : ""}
                </dd>
              </div>
              <div>
                <dt>Local</dt>
                <dd>
                  {lead.cidade}
                  {lead.bairro ? ` · ${lead.bairro}` : ""}
                </dd>
              </div>
              <div>
                <dt>Prazo</dt>
                <dd>{lead.prazo}</dd>
              </div>
              <div>
                <dt>Detalhes</dt>
                <dd>{lead.detalhes || "Não informado"}</dd>
              </div>
              <div>
                <dt>Fotos ou planta</dt>
                <dd>{lead.arquivo || "Nenhum arquivo anexado"}</dd>
              </div>
            </dl>
          </section>

          <aside className="crm-panel" aria-labelledby="atendimento-title">
            <h2 id="atendimento-title">Atendimento</h2>
            <form action={saveLead} className="crm-form">
              <input type="hidden" name="id" value={lead.id} />
              <div className="field-group">
                <label className="field-label" htmlFor="status">
                  Status
                </label>
                <select
                  className="select"
                  id="status"
                  name="status"
                  defaultValue={lead.status}
                >
                  {leadStatuses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="notas">
                  Anotações
                </label>
                <textarea
                  className="textarea"
                  id="notas"
                  name="notas"
                  rows={6}
                  maxLength={4000}
                  defaultValue={lead.notas}
                  placeholder="Visita agendada, medidas, valores combinados…"
                />
              </div>
              <div className="crm-form-actions">
                <button className="btn btn-dark btn-sm" type="submit">
                  Salvar
                </button>
                {salvo ? (
                  <span className="crm-saved" role="status">
                    Salvo
                  </span>
                ) : null}
              </div>
            </form>

            <details className="crm-danger">
              <summary>Excluir contato</summary>
              <form action={deleteLead}>
                <input type="hidden" name="id" value={lead.id} />
                <p>
                  Remove o contato e as anotações. Não é possível desfazer.
                </p>
                <button className="btn btn-outline btn-sm" type="submit">
                  Confirmar exclusão
                </button>
              </form>
            </details>
          </aside>
        </div>
      </main>
    </div>
  );
}
