import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CrmShell } from "@/components/CrmShell";
import { Icon } from "@/components/Icon";
import {
  formatTimestamp,
  getLead,
  isAuthenticated,
  leadStatuses,
  statusLabel,
  whatsappHref,
} from "@/lib/crm";
import { deleteLead, gerarMateriaisDoLead, saveLead } from "../actions";
import {
  listarMateriaisDoLead,
  type MaterialDoLead,
} from "@/lib/lead-material-db";
import { anexosDoLead } from "@/lib/anexos";
import { SERVICO_POR_ID } from "@/lib/lead-material";
import { formatBRL } from "@/lib/money";

export const metadata: Metadata = {
  title: "Contato",
  robots: { index: false, follow: false, nocache: true },
};

const quantityFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

/** Área de um orçamento = soma das quantidades lançadas em m². */
function areaDoMaterial(material: MaterialDoLead): string {
  const doTitulo = /([\d.,]+)\s*m²/.exec(material.titulo);
  if (doTitulo) return `${doTitulo[1]} m²`;
  const metros = material.itens
    .filter((item) => item.unidade === "m²")
    .reduce((total, item) => total + item.quantidade, 0);

  return metros > 0 ? `${quantityFormatter.format(metros)} m²` : "—";
}

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

  const materiais = await listarMateriaisDoLead(lead.id);
  const anexos = await anexosDoLead(lead.id);
  const servicosComMotor = lead.servicos.filter((s) => SERVICO_POR_ID[s.id]).length;
  const waHref = whatsappHref(lead.whatsapp);
  const telHref = lead.whatsapp ? `tel:+${lead.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <CrmShell
      title={lead.nome}
      subtitle={`Contato #${lead.id} · recebido em ${formatTimestamp(lead.criadoEm)}`}
      actions={
        <div className="crm-head-actions">
          <span className="crm-badge" data-status={lead.status}>
            {statusLabel(lead.status)}
          </span>
          {telHref ? (
            <a className="btn btn-outline btn-sm" href={telHref}>
              <Icon name="phone" size={14} />
              Ligar
            </a>
          ) : null}
          {waHref ? (
            <a
              className="btn btn-outline btn-sm"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="message-circle" size={14} />
              WhatsApp
            </a>
          ) : null}
          {lead.email ? (
            <a className="btn btn-outline btn-sm" href={`mailto:${lead.email}`}>
              <Icon name="mail" size={14} />
              E-mail
            </a>
          ) : null}
          <Link className="crm-link" href="/crm">
            Voltar
          </Link>
        </div>
      }
    >
      <div className="crm-stack">
        <section className="crm-panel" aria-labelledby="pedido-title">
          <div className="crm-block-head">
            <h2 id="pedido-title">Pedido</h2>
            {lead.atualizadoEm ? (
              <span className="crm-block-note">{`Atualizado em ${formatTimestamp(lead.atualizadoEm)}`}</span>
            ) : null}
          </div>
          <dl className="crm-data crm-data-grid">
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
              <dd>
                {anexos.length === 0 ? (
                  lead.arquivo || "Nenhum arquivo anexado"
                ) : (
                  <span className="crm-anexos">
                    {anexos.map((a) => (
                      <a key={a.id} href={"/api/anexos/" + a.id} target="_blank" rel="noreferrer">
                        {a.tipo.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={"/api/anexos/" + a.id} alt={a.nome} className="crm-anexo-thumb" />
                        ) : (
                          a.nome
                        )}
                      </a>
                    ))}
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="crm-panel" aria-labelledby="materiais-title">
          <div className="crm-block-head">
            <div>
              <h2 id="materiais-title">Materiais</h2>
              <p className="crm-muted crm-block-sub">
                {lead.areaM2
                  ? `${lead.areaM2} m² informados no site`
                  : "Sem metragem no formulário"}{" "}
                · {servicosComMotor} de {lead.servicos.length} serviço(s) com
                lista automática
              </p>
            </div>
            {servicosComMotor > 0 && lead.areaM2 ? (
              <form action={gerarMateriaisDoLead}>
                <input type="hidden" name="id" value={lead.id} />
                <button className="btn btn-outline btn-sm" type="submit">
                  Gerar lista
                </button>
              </form>
            ) : null}
          </div>

          {materiais.length > 0 ? (
            <div className="crm-table-wrap">
              <table className="crm-table crm-table-materials">
                <thead>
                  <tr>
                    <th scope="col">Serviço</th>
                    <th scope="col" className="crm-num">
                      Área
                    </th>
                    <th scope="col" className="crm-num">
                      Total
                    </th>
                    <th scope="col">
                      <span className="visually-hidden">Abrir orçamento</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materiais.map((material) => (
                    <tr key={material.id}>
                      <td>
                        <Link
                          className="crm-strong-link"
                          href={`/crm/calculadora/${material.id}`}
                        >
                          {material.titulo}
                        </Link>
                      </td>
                      <td className="crm-num crm-muted">
                        {areaDoMaterial(material)}
                      </td>
                      <td className="crm-num">{formatBRL(material.totalCents)}</td>
                      <td className="crm-cell-link">
                        <Link href={`/crm/calculadora/${material.id}`}>
                          Abrir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="crm-muted crm-block-empty">
              Nenhuma lista gerada ainda.
            </p>
          )}
        </section>

        <section className="crm-panel" aria-labelledby="atendimento-title">
          <div className="crm-block-head">
            <h2 id="atendimento-title">Atendimento</h2>

          </div>

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
              <p>Remove o contato e as anotações. Não é possível desfazer.</p>
              <button className="btn btn-outline btn-sm" type="submit">
                Confirmar exclusão
              </button>
            </form>
          </details>
        </section>
      </div>
    </CrmShell>
  );
}
