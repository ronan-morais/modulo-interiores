import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/Brand";
import { CrmShell } from "@/components/CrmShell";
import { Icon } from "@/components/Icon";
import {
  crmConfigured,
  formatTimestamp,
  isAuthenticated,
  leadCounts,
  leadStatuses,
  leadOrigens,
  listLeads,
  origemLabel,
  statusLabel,
  type LeadStatus,
} from "@/lib/crm";
import { createLeadManual, login } from "./actions";
import { Drawer } from "@/components/Drawer";
import { quoteOptions } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatos",
  robots: { index: false, follow: false, nocache: true },
};

type SearchParams = {
  erro?: string;
  salvo?: string;
  status?: string;
  q?: string;
};

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  if (!(await isAuthenticated())) {
    return <LoginScreen error={params.erro} configured={crmConfigured()} />;
  }

  const status = leadStatuses.find((item) => item.id === params.status)?.id;
  const query = (params.q ?? "").trim().slice(0, 80);
  const [leads, counts] = await Promise.all([
    listLeads({ status, query }),
    leadCounts(),
  ]);

  const searchSuffix = query ? `?q=${encodeURIComponent(query)}` : "";

  return (
    <CrmShell
      title="Contatos"
      subtitle="Pedidos recebidos pelo formulário de orçamento do site."
    >
      {params.salvo ? (
        <p className="crm-saved" role="status">
          Contato salvo.{" "}
          <Link href={`/crm/${params.salvo}`}>Abrir ficha</Link>
        </p>
      ) : null}
      {params.erro === "lead" ? (
        <p className="crm-alert" role="alert">
          Faltou o nome do contato. Preencha e salve de novo.
        </p>
      ) : null}

      <nav className="crm-filters" aria-label="Filtrar por status">
          <Link
            href={`/crm${searchSuffix}`}
            aria-current={status ? undefined : "page"}
            className="crm-filter"
          >
            Todos <span>{counts.total}</span>
          </Link>
          {leadStatuses.map((item) => (
            <Link
              key={item.id}
              href={`/crm?status=${item.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              aria-current={status === item.id ? "page" : undefined}
              className="crm-filter"
              data-status={item.id}
            >
              {item.label} <span>{counts.byStatus[item.id]}</span>
            </Link>
          ))}
        </nav>

        <form className="crm-search" method="get" action="/crm">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <label className="visually-hidden" htmlFor="q">
            Buscar contatos
          </label>
          <input
            className="input"
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Nome, telefone, e-mail, cidade ou bairro"
          />
          <button className="btn btn-dark btn-sm" type="submit">
            Buscar
          </button>
          {query ? (
            <Link
              className="crm-link"
              href={status ? `/crm?status=${status}` : "/crm"}
            >
              Limpar
            </Link>
          ) : null}
        </form>

        {leads.length === 0 ? (
          <div className="crm-empty">
            <h2>Nenhum contato {query || status ? "com esse filtro" : "ainda"}</h2>
            <p>
              {query || status
                ? "Ajuste a busca ou volte para todos os contatos."
                : "Os pedidos enviados pelo formulário de orçamento aparecem aqui."}
            </p>
            {status || query ? (
              <Link className="btn btn-outline btn-sm" href="/crm">
                Ver todos
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table crm-table-leads">
              <thead>
                <tr>
                  <th scope="col">Contato</th>
                  <th scope="col">Serviços</th>
                  <th scope="col">Imóvel</th>
                  <th scope="col">Local</th>
                  <th scope="col">Recebido</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="crm-who">
                      <Link href={`/crm/${lead.id}`}>{lead.nome}</Link>
                      <span className="crm-muted crm-who-contact">
                        {lead.whatsapp || lead.email || "Sem contato"}
                      </span>
                      <span className="crm-muted crm-who-date">
                        {formatTimestamp(lead.criadoEm)}
                      </span>
                      <span className="crm-who-meta">
                        {lead.servicos.length
                          ? lead.servicos.map((item) => item.titulo).join(" · ")
                          : "Sem serviço definido"}
                        {lead.areaM2 ? ` · ${lead.areaM2} m²` : ""}
                      </span>
                      <span className="crm-badge crm-badge-origem" data-origem={lead.origem}>
                        {origemLabel(lead.origem)}
                      </span>
                    </td>
                    <td className="crm-cell-services">
                      {lead.servicos.length
                        ? lead.servicos.map((service) => service.titulo).join(" · ")
                        : "A definir"}
                    </td>
                    <td className="crm-muted crm-cell-property">
                      {lead.tipoImovel}
                      {lead.areaM2 ? ` · ${lead.areaM2} m²` : ""}
                      {lead.ambientes ? ` · ${lead.ambientes} amb.` : ""}
                    </td>
                    <td className="crm-muted crm-cell-place">
                      {lead.cidade}
                      {lead.bairro ? ` · ${lead.bairro}` : ""}
                    </td>
                    <td className="crm-muted crm-cell-date">
                      {formatTimestamp(lead.criadoEm)}
                    </td>
                    <td>
                      <span className="crm-badge" data-status={lead.status}>
                        {statusLabel(lead.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="crm-foot-note">
          {leads.length === 200
            ? "Mostrando os 200 contatos mais recentes."
            : `${leads.length} ${leads.length === 1 ? "contato" : "contatos"} nesta visão.`}
        </p>
        <Drawer
          title="Novo contato"
          formId="form-contato-novo"
          submitLabel="Salvar contato"
          defaultOpen={params.erro === "lead"}
        >
          <form id="form-contato-novo" action={createLeadManual} className="crm-form">
            {params.erro === "lead" ? (
              <p className="crm-alert" role="alert">
                Informe o nome do contato.
              </p>
            ) : null}
            <fieldset className="crm-section">
              <legend>Quem é</legend>
              <div className="field-group">
                <label className="field-label" htmlFor="nc-nome">Nome</label>
                <input className="input" id="nc-nome" name="nome" maxLength={120} required autoComplete="name" />
              </div>
              <div className="crm-row-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="nc-whatsapp">WhatsApp</label>
                  <input className="input" id="nc-whatsapp" name="whatsapp" maxLength={40} inputMode="tel" placeholder="(31) 90000-0000" />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="nc-email">E-mail</label>
                  <input className="input" id="nc-email" name="email" type="email" maxLength={160} />
                </div>
              </div>
            </fieldset>
            <fieldset className="crm-section">
              <legend>O que precisa</legend>
              <div className="crm-servicos">
                {quoteOptions.map((servico) => (
                  <div key={servico.id} className="crm-servico">
                    <label className="crm-check" htmlFor={`nc-serv-${servico.id}`}>
                      <input type="checkbox" id={`nc-serv-${servico.id}`} name="servicos" value={servico.id} />
                      <span>{servico.title}</span>
                    </label>
                    <span className="crm-servico-area">
                      <input className="input" name={`area_${servico.id}`} type="number" min={1} inputMode="numeric" placeholder="0" aria-label={`Metragem de ${servico.title} em m²`} />
                      <span className="crm-servico-un">m²</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="crm-hint">Digitar a metragem já marca o serviço; a soma vira a área do contato.</p>
              <div className="crm-row-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="nc-tipo">Imóvel</label>
                  <select className="select" id="nc-tipo" name="tipoImovel" defaultValue="Residencial">
                    <option value="Residencial">Residencial</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="nc-ambientes">Ambientes</label>
                  <input className="input" id="nc-ambientes" name="ambientes" type="number" min={1} max={200} inputMode="numeric" placeholder="1" />
                </div>
              </div>
            </fieldset>
            <fieldset className="crm-section">
              <legend>Onde e quando</legend>
              <div className="crm-row-2">
                <div className="field-group">
                  <label className="field-label" htmlFor="nc-cidade">Cidade</label>
                  <input className="input" id="nc-cidade" name="cidade" maxLength={80} defaultValue="Belo Horizonte" />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="nc-bairro">Bairro</label>
                  <input className="input" id="nc-bairro" name="bairro" maxLength={80} />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="nc-prazo">Prazo</label>
                <input className="input" id="nc-prazo" name="prazo" maxLength={60} placeholder="este mês, 30 dias, sem pressa" />
              </div>
            </fieldset>
            <fieldset className="crm-section">
              <legend>Como chegou</legend>
              <div className="crm-chips-origem">
                {leadOrigens.map((origem) => (
                  <label key={origem.id} className="crm-chip-radio">
                    <input type="radio" name="origem" value={origem.id} defaultChecked={origem.id === "presencial"} />
                    <span>{origem.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <details className="crm-more">
              <summary>Anotações</summary>
              <div className="field-group">
                <label className="field-label" htmlFor="nc-detalhes">Detalhes da obra</label>
                <textarea className="input" id="nc-detalhes" name="detalhes" rows={4} maxLength={2000} />
              </div>
            </details>
          </form>
        </Drawer>

    </CrmShell>
  );
}

function LoginScreen({
  error,
  configured,
}: {
  error?: string;
  configured: boolean;
}) {
  return (
    <div className="crm-auth">
      <main id="conteudo" className="crm-auth-card">
        <div className="crm-auth-brand">
          <BrandMark />
          <span>MÓDULO INTERIORES</span>
        </div>

        <h1>Contatos</h1>
        <p className="crm-auth-sub">
          Entre para administrar os pedidos de orçamento.
        </p>

        {error ? (
          <p className="crm-alert" role="alert">
            {error === "bloqueado"
              ? "Muitas tentativas. Aguarde 10 minutos e tente de novo."
              : "Usuário ou senha incorretos."}
          </p>
        ) : null}

        {configured ? (
          <form action={login} className="crm-auth-form">
            <div className="field-group">
              <label className="field-label" htmlFor="usuario">
                Usuário
              </label>
              <input
                className="input"
                id="usuario"
                name="usuario"
                autoComplete="username"
                autoCapitalize="none"
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="senha">
                Senha
              </label>
              <input
                className="input"
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <button className="btn btn-dark btn-md crm-auth-submit" type="submit">
              Entrar
              <Icon name="arrow-right" size={16} className="icon-arrow" />
            </button>
          </form>
        ) : (
          <p className="crm-alert" role="alert">
            CRM não configurado: defina ADMIN_USER e ADMIN_PASSWORD nas
            variáveis de ambiente.
          </p>
        )}

        <Link className="crm-auth-back" href="/">
          Voltar ao site
        </Link>
      </main>
    </div>
  );
}
