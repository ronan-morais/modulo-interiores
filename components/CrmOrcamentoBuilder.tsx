"use client";

import { useRef, useState } from "react";
import { saveOrcamentoMaterial } from "@/app/crm/actions";
import { Icon } from "@/components/Icon";
import { formatBRL, parseAmountToCents, parseQuantity } from "@/lib/money";
import {
  lineTotalCents,
  orcamentoTotais,
  unidades,
  type OrcamentoItem,
  type OrcamentoUnidade,
} from "@/lib/orcamento-material";

type ClienteOption = {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
};

type Draft = {
  key: string;
  descricao: string;
  quantidade: string;
  unidade: OrcamentoUnidade;
  valor: string;
  frete: string;
  desconto: string;
};

function emptyLine(key: string): Draft {
  return {
    key,
    descricao: "",
    quantidade: "1",
    unidade: "un",
    valor: "",
    frete: "",
    desconto: "",
  };
}

function draftToItem(row: Draft): OrcamentoItem | null {
  const quantidade = parseQuantity(row.quantidade);
  const valorUnitCents = parseAmountToCents(row.valor) ?? 0;
  const descricao = row.descricao.trim();

  if (!descricao || quantidade <= 0 || valorUnitCents <= 0) return null;

  return {
    descricao,
    quantidade,
    unidade: row.unidade,
    valorUnitCents,
    freteCents: parseAmountToCents(row.frete) ?? 0,
    descontoCents: parseAmountToCents(row.desconto) ?? 0,
  };
}

function draftIsBlank(row: Draft): boolean {
  return (
    !row.descricao.trim() &&
    !row.valor.trim() &&
    !row.frete.trim() &&
    !row.desconto.trim() &&
    (row.quantidade === "1" || !row.quantidade)
  );
}

export function CrmOrcamentoBuilder({ clientes }: { clientes: ClienteOption[] }) {
  const [rows, setRows] = useState<Draft[]>([emptyLine("l1")]);
  const [clienteId, setClienteId] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteWhatsapp, setClienteWhatsapp] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const nextKey = useRef(2);

  const itens = rows
    .map(draftToItem)
    .filter((item): item is OrcamentoItem => item !== null);
  const totais = orcamentoTotais(itens);

  const updateRow = (key: string, patch: Partial<Draft>) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  return (
    <form
      action={saveOrcamentoMaterial}
      className="crm-orcamento"
      onSubmit={(event) => {
        for (const [index, row] of rows.entries()) {
          if (draftIsBlank(row)) continue;
          if (!draftToItem(row)) {
            event.preventDefault();
            setErro(
              `Preencha descrição, quantidade e valor do item ${index + 1}.`,
            );
            return;
          }
        }

        if (itens.length === 0) {
          event.preventDefault();
          setErro("Inclua ao menos um item de material.");
          return;
        }

        setErro(null);
      }}
    >
      <input type="hidden" name="itens" value={JSON.stringify(itens)} />

      <section className="crm-panel" aria-labelledby="orc-dados-title">
        <h2 id="orc-dados-title">Dados do orçamento</h2>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="orc-titulo">
              Obra / serviço
            </label>
            <input
              className="input"
              id="orc-titulo"
              name="titulo"
              required
              maxLength={120}
              placeholder="Ex.: Sala e forro — Savassi"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="orc-cliente">
              Cliente cadastrado
            </label>
            <select
              className="select"
              id="orc-cliente"
              value={clienteId}
              onChange={(event) => {
                const id = event.target.value;
                setClienteId(id);
                const cliente = clientes.find(
                  (item) => String(item.id) === id,
                );
                setClienteNome(cliente?.nome ?? "");
                setClienteEmail(cliente?.email ?? "");
                setClienteWhatsapp(cliente?.whatsapp ?? "");
              }}
            >
              <option value="">Sem cadastro</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={String(cliente.id)}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="orc-nome">
              Nome do cliente
            </label>
            <input
              className="input"
              id="orc-nome"
              name="clienteNome"
              maxLength={120}
              value={clienteNome}
              onChange={(event) => setClienteNome(event.target.value)}
            />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="orc-whatsapp">
              WhatsApp
            </label>
            <input
              className="input"
              id="orc-whatsapp"
              name="clienteWhatsapp"
              type="tel"
              maxLength={40}
              value={clienteWhatsapp}
              onChange={(event) => setClienteWhatsapp(event.target.value)}
            />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="orc-email">
            E-mail do cliente
          </label>
          <input
            className="input"
            id="orc-email"
            name="clienteEmail"
            type="email"
            maxLength={160}
            value={clienteEmail}
            onChange={(event) => setClienteEmail(event.target.value)}
          />
        </div>
      </section>

      <section className="crm-panel" aria-labelledby="orc-itens-title">
        <div className="crm-list-head">
          <h2 id="orc-itens-title">Itens de material</h2>
          <span className="crm-list-count">
            {itens.length} {itens.length === 1 ? "item" : "itens"}
          </span>
        </div>

        <div className="crm-lines">
          <div className="crm-lines-head" aria-hidden="true">
            <span>Item</span>
            <span>Qtd</span>
            <span>Un.</span>
            <span>Unitário</span>
            <span>Frete</span>
            <span>Desconto</span>
            <span>Total</span>
            <span />
          </div>

          {rows.map((row, index) => {
            const item = draftToItem(row);

            return (
              <div className="crm-line" key={row.key}>
                <div className="crm-line-cell crm-line-desc" data-label="Item">
                  <input
                    className="input"
                    aria-label={`Descrição do item ${index + 1}`}
                    placeholder="Placa de drywall 1,80 × 1,20"
                    maxLength={120}
                    value={row.descricao}
                    onChange={(event) =>
                      updateRow(row.key, { descricao: event.target.value })
                    }
                  />
                </div>
                <div className="crm-line-cell" data-label="Qtd">
                  <input
                    className="input"
                    aria-label={`Quantidade do item ${index + 1}`}
                    inputMode="decimal"
                    value={row.quantidade}
                    onChange={(event) =>
                      updateRow(row.key, { quantidade: event.target.value })
                    }
                  />
                </div>
                <div className="crm-line-cell" data-label="Un.">
                  <select
                    className="select"
                    aria-label={`Unidade do item ${index + 1}`}
                    value={row.unidade}
                    onChange={(event) =>
                      updateRow(row.key, {
                        unidade: event.target.value as OrcamentoUnidade,
                      })
                    }
                  >
                    {unidades.map((unidade) => (
                      <option key={unidade} value={unidade}>
                        {unidade}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="crm-line-cell" data-label="Unitário">
                  <input
                    className="input"
                    aria-label={`Valor unitário do item ${index + 1}`}
                    inputMode="decimal"
                    placeholder="0,00"
                    value={row.valor}
                    onChange={(event) =>
                      updateRow(row.key, { valor: event.target.value })
                    }
                  />
                </div>
                <div className="crm-line-cell" data-label="Frete">
                  <input
                    className="input"
                    aria-label={`Frete do item ${index + 1}`}
                    inputMode="decimal"
                    placeholder="0,00"
                    value={row.frete}
                    onChange={(event) =>
                      updateRow(row.key, { frete: event.target.value })
                    }
                  />
                </div>
                <div className="crm-line-cell" data-label="Desconto">
                  <input
                    className="input"
                    aria-label={`Desconto do item ${index + 1}`}
                    inputMode="decimal"
                    placeholder="0,00"
                    value={row.desconto}
                    onChange={(event) =>
                      updateRow(row.key, { desconto: event.target.value })
                    }
                  />
                </div>
                <div
                  className="crm-line-cell crm-line-total"
                  data-label="Total"
                >
                  {item ? formatBRL(lineTotalCents(item)) : "—"}
                </div>
                <button
                  type="button"
                  className="crm-line-remove"
                  aria-label={`Remover item ${index + 1}`}
                  onClick={() => {
                    setRows((current) =>
                      current.length === 1
                        ? [emptyLine(current[0].key)]
                        : current.filter((item) => item.key !== row.key),
                    );
                  }}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm crm-add-line"
          onClick={() =>
            setRows((current) => [
              ...current,
              emptyLine(`l${nextKey.current++}`),
            ])
          }
        >
          Adicionar item
        </button>

        <dl className="crm-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatBRL(totais.subtotalCents)}</dd>
          </div>
          <div>
            <dt>Frete</dt>
            <dd>{formatBRL(totais.freteCents)}</dd>
          </div>
          <div>
            <dt>Descontos</dt>
            <dd>−{formatBRL(totais.descontoCents)}</dd>
          </div>
          <div className="crm-total-final">
            <dt>Total</dt>
            <dd>{formatBRL(totais.totalCents)}</dd>
          </div>
        </dl>

        <div className="field-group">
          <label className="field-label" htmlFor="orc-obs">
            Observações
          </label>
          <textarea
            className="textarea crm-orc-obs"
            id="orc-obs"
            name="observacoes"
            maxLength={2000}
            rows={3}
            placeholder="Prazo de entrega, condições de pagamento, validade..."
          />
        </div>

        {erro ? (
          <p className="crm-alert" role="alert">
            {erro}
          </p>
        ) : null}

        <div className="crm-form-actions">
          <button className="btn btn-dark btn-md" type="submit">
            Salvar orçamento
          </button>
        </div>
      </section>
    </form>
  );
}
