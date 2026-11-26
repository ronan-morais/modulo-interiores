import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CrmShell } from "@/components/CrmShell";
import { Icon } from "@/components/Icon";
import { isAuthenticated } from "@/lib/crm";
import {
  entradaCategorias,
  formatBRL,
  formatDay,
  formatMonth,
  listLancamentos,
  normalizeMonth,
  resumoMes,
  saidaCategorias,
  shiftMonth,
  todayIso,
} from "@/lib/financeiro";
import { deleteLancamento, saveLancamento } from "../actions";

export const metadata: Metadata = {
  title: "Financeiro",
  robots: { index: false, follow: false, nocache: true },
};

const erros: Record<string, string> = {
  data: "Informe uma data válida.",
  tipo: "Escolha entrada ou saída.",
  descricao: "Descreva o lançamento.",
  valor: "Informe um valor maior que zero.",
  categoria: "Escolha uma categoria compatível com o tipo.",
};

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; salvo?: string; erro?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/crm");

  const params = await searchParams;
  const mes = normalizeMonth(params.mes);
  const [lancamentos, resumo] = await Promise.all([
    listLancamentos(mes),
    resumoMes(mes),
  ]);
  const saldo = resumo.entradas - resumo.saidas;
  const mesAtual = todayIso().slice(0, 7);

  return (
    <CrmShell
      title="Financeiro"
      subtitle="Entradas e saídas do caixa, mês a mês."
    >
      <div className="crm-monthbar">
        <Link
          className="crm-month-btn"
          href={`/crm/financeiro?mes=${shiftMonth(mes, -1)}`}
          aria-label="Mês anterior"
        >
          <Icon name="arrow-left" size={14} />
        </Link>
        <h2>{formatMonth(mes)}</h2>
        <Link
          className="crm-month-btn"
          href={`/crm/financeiro?mes=${shiftMonth(mes, 1)}`}
          aria-label="Próximo mês"
        >
          <Icon name="arrow-right" size={14} />
        </Link>
        {mes !== mesAtual ? (
          <Link className="crm-link" href="/crm/financeiro">
            Mês atual
          </Link>
        ) : null}
      </div>

      <div className="crm-stats">
        <div className="crm-stat">
          <span>Entradas</span>
          <strong data-tone="in">{formatBRL(resumo.entradas)}</strong>
        </div>
        <div className="crm-stat">
          <span>Saídas</span>
          <strong data-tone="out">{formatBRL(resumo.saidas)}</strong>
        </div>
        <div className="crm-stat">
          <span>Saldo</span>
          <strong data-tone={saldo < 0 ? "out" : undefined}>
            {formatBRL(saldo)}
          </strong>
        </div>
      </div>

      <div className="crm-detail-grid">
        <section aria-labelledby="lancamentos-title">
          <div className="crm-list-head">
            <h2 id="lancamentos-title">Lançamentos</h2>
            <span className="crm-list-count">
              {lancamentos.length}{" "}
              {lancamentos.length === 1 ? "registro" : "registros"}
            </span>
          </div>

          {lancamentos.length === 0 ? (
            <div className="crm-empty">
              <h2>Nenhum lançamento em {formatMonth(mes)}</h2>
              <p>
                Registre entradas e saídas para acompanhar o caixa do mês.
              </p>
            </div>
          ) : (
            <ul className="crm-entries">
              {lancamentos.map((lancamento) => (
                <li
                  className="crm-entry"
                  key={lancamento.id}
                  data-tipo={lancamento.tipo}
                >
                  <span className="crm-entry-date">
                    {formatDay(lancamento.data)}
                  </span>
                  <span className="crm-entry-body">
                    <strong>{lancamento.descricao}</strong>
                    <span>{lancamento.categoria}</span>
                  </span>
                  <span
                    className="crm-entry-value"
                    data-tipo={lancamento.tipo}
                  >
                    {lancamento.tipo === "entrada" ? "+" : "−"}
                    {formatBRL(lancamento.valorCents)}
                  </span>
                  <form action={deleteLancamento}>
                    <input type="hidden" name="id" value={lancamento.id} />
                    <input type="hidden" name="mes" value={mes} />
                    <button
                      className="crm-entry-remove"
                      type="submit"
                      aria-label={`Remover ${lancamento.descricao}`}
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="crm-panel" aria-labelledby="novo-lancamento-title">
          <h2 id="novo-lancamento-title">Novo lançamento</h2>

          {params.erro ? (
            <p className="crm-alert" role="alert">
              {erros[params.erro] ?? "Confira os campos e tente de novo."}
            </p>
          ) : null}

          <form action={saveLancamento} className="crm-form">
            <input type="hidden" name="mes" value={mes} />

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="lanc-data">
                  Data
                </label>
                <input
                  className="input"
                  id="lanc-data"
                  name="data"
                  type="date"
                  defaultValue={todayIso()}
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="lanc-tipo">
                  Tipo
                </label>
                <select
                  className="select"
                  id="lanc-tipo"
                  name="tipo"
                  defaultValue="entrada"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="lanc-categoria">
                Categoria
              </label>
              <select className="select" id="lanc-categoria" name="categoria">
                <optgroup label="Entradas">
                  {entradaCategorias.map((categoria) => (
                    <option key={`in-${categoria}`} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Saídas">
                  {saidaCategorias.map((categoria) => (
                    <option key={`out-${categoria}`} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="lanc-descricao">
                Descrição
              </label>
              <input
                className="input"
                id="lanc-descricao"
                name="descricao"
                maxLength={160}
                placeholder="Ex.: Sinal de 40% — obra Savassi"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="lanc-valor">
                Valor (R$)
              </label>
              <input
                className="input"
                id="lanc-valor"
                name="valor"
                inputMode="decimal"
                placeholder="0,00"
                required
              />
            </div>

            <div className="crm-form-actions">
              <button className="btn btn-dark btn-md" type="submit">
                Registrar
              </button>
              {params.salvo ? (
                <span className="crm-saved">Lançamento salvo.</span>
              ) : null}
            </div>
          </form>
        </aside>
      </div>
    </CrmShell>
  );
}
