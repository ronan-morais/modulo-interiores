import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CrmShell } from "@/components/CrmShell";
import { Icon } from "@/components/Icon";
import {
  formatTimestamp,
  clienteDoLead,
  getLead,
  isAuthenticated,
  leadStatuses,
  leadOrigens,
  origemLabel,
  statusLabel,
  whatsappHref,
} from "@/lib/crm";
import { deleteLead, gerarMateriaisDoLead, salvarComoCliente, saveLead, savePedido } from "../actions";
import {
  listarMateriaisDoLead,
  type MaterialDoLead,
} from "@/lib/lead-material-db";
import { anexosDoLead } from "@/lib/anexos";
import { SERVICO_POR_ID } from "@/lib/lead-material";
import { quoteOptions } from "@/lib/site";
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
  const cliente = await clienteDoLead(lead.id);
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
          <span className="crm-badge crm-badge-origem" data-origem={lead.origem}>
            Origem: {origemLabel(lead.origem)}
          </span>
          {cliente ? (
            <Link className="btn btn-outline btn-sm" href="/crm/clientes">
              <Icon name="check" size={14} />
              Cliente
            </Link>
          ) : (
            <form action={salvarComoCliente}>
              <input type="hidden" name="id" value={lead.id} />
              <button className="btn btn-outline btn-sm" type="submit">
                <Icon name="check" size={14} />
                Salvar como cliente
              </button>
            </form>
          )}
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
                    <form action={savePedido} className="crm-form">
            <input type="hidden" name="id" value={lead.id} />
            <div className="crm-form-grid">
              <label className="field-group">
                <span className="field-label">Nome</span>
                <input className="input" name="nome" defaultValue={lead.nome} maxLength={120} />
              </label>
              <label className="field-group">
                <span className="field-label">WhatsApp</span>
                <input className="input" name="whatsapp" defaultValue={lead.whatsapp ?? ""} maxLength={30} />
              </label>
              <label className="field-group">
                <span className="field-label">E-mail</span>
                <input className="input" name="email" type="email" defaultValue={lead.email ?? ""} maxLength={160} />
              </label>
              <label className="field-group">
                <span className="field-label">Ambientes</span>
                <input className="input" name="ambientes" type="number" min={1} defaultValue={lead.ambientes ?? ""} />
              </label>
              <label className="field-group">
                <span className="field-label">Cidade</span>
                <input className="input" name="cidade" defaultValue={lead.cidade} maxLength={80} />
              </label>
              <label className="field-group">
                <span className="field-label">Bairro</span>
                <input className="input" name="bairro" defaultValue={lead.bairro ?? ""} maxLength={80} />
              </label>
              <label className="field-group">
                <span className="field-label">Prazo</span>
                <input className="input" name="prazo" defaultValue={lead.prazo} maxLength={60} />
              </label>
              <label className="field-group crm-field-wide">
                <span className="field-label">Detalhes</span>
                <textarea className="textarea" name="detalhes" rows={3} defaultValue={lead.detalhes ?? ""} />
              </label>
            </div>
            <fieldset className="field-group crm-field-wide crm-servicos-edit">
              <legend className="field-label">Serviços</legend>
              <div className="crm-checks">
                {quoteOptions.map((opcao) => (
                  <label key={opcao.id} className="crm-check">
                    <input
                      type="checkbox"
                      name="servicos"
                      value={opcao.id}
                      defaultChecked={lead.servicos.some((s) => s.id === opcao.id || s.titulo === opcao.title)}
                    />
                    <span>{opcao.title}</span>
                    <input
                      className="input crm-check-area"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      placeholder="m²"
                      name={"area__" + opcao.id}
                      defaultValue={
                        lead.servicos.find((s) => s.id === opcao.id || s.titulo === opcao.title)?.area ?? ""
                      }
                    />
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="crm-form-actions">
              <button className="btn btn-dark btn-sm" type="submit">Salvar pedido</button>
            </div>
          </form>
          <div className="crm-anexos-block">
            <span className="field-label">Fotos ou planta</span>
            <div className="crm-anexo-body">
{anexos.length === 0 ? (
                  lead.arquivo || "Nenhum arquivo anexado"
                ) : (
                  <span className="crm-anexos">
                    {anexos.map((a) => (
                      <a key={a.id} href={"/crm/anexos/" + a.id} target="_blank" rel="noreferrer">
                        {a.tipo.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={"/crm/anexos/" + a.id} alt={a.nome} className="crm-anexo-thumb" />
                        ) : (
                          a.nome
                        )}
                      </a>
                    ))}
                  </span>
                )}
            </div>
          </div>

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
              <label className="field-label" htmlFor="origem">
                Origem do contato
              </label>
              <select
                className="select"
                id="origem"
                name="origem"
                defaultValue={lead.origem}
              >
                {leadOrigens.map((item) => (
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
