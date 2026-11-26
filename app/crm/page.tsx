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
  listLeads,
  statusLabel,
  type LeadStatus,
} from "@/lib/crm";
import { login } from "./actions";

export const metadata: Metadata = {
  title: "Contatos",
  robots: { index: false, follow: false, nocache: true },
};

type SearchParams = {
  erro?: string;
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
