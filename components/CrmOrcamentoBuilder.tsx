"use client";

import { useEffect, useRef, useState } from "react";
import { saveOrcamentoMaterial } from "@/app/crm/actions";
import { Icon } from "@/components/Icon";
import { MaterialTemplateDrawer } from "@/components/MaterialTemplateDrawer";
import { formatBRL, parseAmountToCents, parseQuantity } from "@/lib/money";
import {
  areaDoProjeto,
  isSistemaMaterial,
  quantidadeDoItem,
  sistemasMaterial,
  type MedidasArea,
  type SistemaMaterial,
  type TemplateItem,
  type TemplatesPorSistema,
} from "@/lib/material-quantidades";
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

type MaterialRow = {
  key: string;
  chave: string;
  descricao: string;
  quantidade: string;
  unidade: OrcamentoUnidade;
  valor: string;
  quantidadeM2: number | null;
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

function formatQuantity(value: number): string {
  return String(Number(value.toFixed(2))).replace(".", ",");
}

function formatMoneyInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function medidasFromInputs(
  medidaA: string,
  medidaB: string,
  vaos: string,
  perda: string,
): MedidasArea {
  return {
    medidaA: parseQuantity(medidaA),
    medidaB: parseQuantity(medidaB),
    vaos: parseQuantity(vaos),
    perdaPercent: parseQuantity(perda),
  };
}

function rowsFromTemplate(
  template: TemplateItem[],
  sistema: SistemaMaterial,
  medidas: MedidasArea,
): MaterialRow[] {
  return template.map((item, index) => ({
    key: `${sistema}-${item.chave}-${index}`,
    chave: item.chave,
    descricao: item.descricao,
    quantidade: formatQuantity(quantidadeDoItem(item, sistema, medidas)),
    unidade: item.unidade,
    valor: formatMoneyInput(item.valorUnitCents),
    quantidadeM2: item.quantidadeM2,
  }));
}

export function CrmOrcamentoBuilder({
  clientes,
  templates,
}: {
  clientes: ClienteOption[];
  templates: TemplatesPorSistema;
}) {
  const [rows, setRows] = useState<Draft[]>([emptyLine("l1")]);
  const [clienteId, setClienteId] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteWhatsapp, setClienteWhatsapp] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [calcSistema, setCalcSistema] = useState<SistemaMaterial>("parede");
  const [calcMedidaA, setCalcMedidaA] = useState("4");
  const [calcMedidaB, setCalcMedidaB] = useState("2,7");
  const [calcVaos, setCalcVaos] = useState("");
  const [calcPerda, setCalcPerda] = useState("10");
  const [templatesState, setTemplatesState] =
    useState<TemplatesPorSistema>(templates);
  const [materiais, setMateriais] = useState<MaterialRow[]>(() =>
    rowsFromTemplate(
      templates.parede,
      "parede",
      medidasFromInputs("4", "2,7", "", "10"),
    ),
  );
  const [maoModo, setMaoModo] = useState<"fechado" | "m2">("fechado");
  const [maoDescricao, setMaoDescricao] = useState("");
  const [maoValor, setMaoValor] = useState("");
  const [maoPorM2, setMaoPorM2] = useState("");
  const [calcAviso, setCalcAviso] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [materiaisDirty, setMateriaisDirty] = useState(false);
  const nextKey = useRef(2);

  const itens = rows
    .map(draftToItem)
    .filter((item): item is OrcamentoItem => item !== null);

  const medidas = medidasFromInputs(
    calcMedidaA,
    calcMedidaB,
    calcVaos,
    calcPerda,
  );
  const areaM2 = areaDoProjeto(calcSistema, medidas);
  const maoObraCents =
    maoModo === "m2"
      ? Math.round(parseQuantity(maoPorM2) * areaM2 * 100)
      : (parseAmountToCents(maoValor) ?? 0);
  const totais = orcamentoTotais(itens, maoObraCents);
  const medidasLabels =
    calcSistema === "parede"
      ? { a: "Comprimento (m)", b: "Altura (m)" }
      : { a: "Largura (m)", b: "Comprimento (m)" };

  useEffect(() => {
    const atuais = medidasFromInputs(
      calcMedidaA,
      calcMedidaB,
      calcVaos,
      calcPerda,
    );

    setMateriais((current) =>
      current.map((row) => ({
        ...row,
        quantidade: formatQuantity(
          quantidadeDoItem(
            {
              chave: row.chave,
              descricao: row.descricao,
              unidade: row.unidade,
              valorUnitCents: 0,
              quantidadeM2: row.quantidadeM2,
            },
            calcSistema,
            atuais,
          ),
        ),
      })),
    );
  }, [calcSistema, calcMedidaA, calcMedidaB, calcVaos, calcPerda]);

  const updateRow = (key: string, patch: Partial<Draft>) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const updateMaterial = (key: string, patch: Partial<MaterialRow>) => {
    setMateriaisDirty(true);
    setMateriais((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const inserirMateriais = () => {
    const validos = materiais
      .map((row) => {
        const quantidade = parseQuantity(row.quantidade);
        const valorUnitCents = parseAmountToCents(row.valor) ?? 0;
        const descricao = row.descricao.trim();

        if (!descricao || quantidade <= 0 || valorUnitCents <= 0) return null;

        return {
          descricao,
          quantidade: formatQuantity(quantidade),
          unidade: row.unidade,
          valor: formatMoneyInput(valorUnitCents),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (!validos.length) {
      setCalcAviso(
        "Preencha descrição, quantidade e preço dos materiais antes de inserir.",
      );
      return;
    }

    setRows((current) => {
      const preenchidas = current.filter((row) => !draftIsBlank(row));
      const inseridas = validos.map((item) => ({
        key: `c${nextKey.current++}`,
        descricao: item.descricao,
        quantidade: item.quantidade,
        unidade: item.unidade,
        valor: item.valor,
        frete: "",
        desconto: "",
      }));

      return [...preenchidas, ...inseridas];
    });

    setCalcAviso(
      validos.length === materiais.length
        ? `${validos.length} itens inseridos no orçamento.`
        : `${validos.length} itens inseridos. Itens sem preço ficaram de fora.`,
    );
  };

  const aplicarTemplate = (sistema: SistemaMaterial, itens: TemplateItem[]) => {
    setTemplatesState((current) => ({ ...current, [sistema]: itens }));
    if (sistema === calcSistema && !materiaisDirty) {
      setMateriais(rowsFromTemplate(itens, sistema, medidas));
    }
    setCalcAviso("Template atualizado. Ele vale para os próximos orçamentos.");
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
      <input type="hidden" name="maoObraCents" value={maoObraCents} />
      <input type="hidden" name="maoObraDescricao" value={maoDescricao} />

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

      <section className="crm-panel" aria-labelledby="orc-area-title">
        <h2 id="orc-area-title">Material pela área</h2>

        <div className="crm-area-grid">
          <div className="field-group crm-area-sistema">
            <label className="field-label" htmlFor="area-sistema">
              Sistema
            </label>
            <select
              className="select"
              id="area-sistema"
              value={calcSistema}
              onChange={(event) => {
                const value = event.target.value;
                if (!isSistemaMaterial(value)) return;
                setCalcSistema(value);
                setMateriais(
                  rowsFromTemplate(templatesState[value], value, medidas),
                );
                setMateriaisDirty(false);
                setCalcAviso(null);
              }}
            >
              {sistemasMaterial.map((sistema) => (
                <option key={sistema.id} value={sistema.id}>
                  {sistema.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="area-a">
              {medidasLabels.a}
            </label>
            <input
              className="input"
              id="area-a"
              inputMode="decimal"
              value={calcMedidaA}
              onChange={(event) => setCalcMedidaA(event.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="area-b">
              {medidasLabels.b}
            </label>
            <input
              className="input"
              id="area-b"
              inputMode="decimal"
              value={calcMedidaB}
              onChange={(event) => setCalcMedidaB(event.target.value)}
            />
          </div>

          {calcSistema !== "piso" ? (
            <div className="field-group">
              <label className="field-label" htmlFor="area-vaos">
                Vãos (m²)
              </label>
              <input
                className="input"
                id="area-vaos"
                inputMode="decimal"
                placeholder="0"
                value={calcVaos}
                onChange={(event) => setCalcVaos(event.target.value)}
              />
            </div>
          ) : null}

          <div className="field-group">
            <label className="field-label" htmlFor="area-perda">
              Perda (%)
            </label>
            <input
              className="input"
              id="area-perda"
              inputMode="decimal"
              value={calcPerda}
              onChange={(event) => setCalcPerda(event.target.value)}
            />
          </div>
        </div>

        <div className="crm-area-result">
          <div>
            <span>Área calculada</span>
            <strong>{formatQuantity(areaM2)} m²</strong>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={inserirMateriais}
            disabled={materiais.length === 0}
          >
            Inserir itens no orçamento
          </button>
        </div>

        <div className="crm-mat-head" aria-hidden="true">
          <span>Material</span>
          <span>Qtd</span>
          <span>Un.</span>
          <span>Unitário</span>
          <span>Total (ref.)</span>
          <span />
        </div>

        <div className="crm-mat-rows">
          {materiais.map((row, index) => {
            const quantidade = parseQuantity(row.quantidade);
            const valorUnitCents = parseAmountToCents(row.valor) ?? 0;

            return (
              <div className="crm-mat-row" key={row.key}>
                <div className="crm-mat-cell crm-mat-desc" data-label="Material">
                  <input
                    className="input"
                    maxLength={120}
                    aria-label={`Descrição do material ${index + 1}`}
                    value={row.descricao}
                    onChange={(event) =>
                      updateMaterial(row.key, {
                        descricao: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="crm-mat-cell" data-label="Qtd">
                  <input
                    className="input"
                    inputMode="decimal"
                    aria-label={`Quantidade do material ${index + 1}`}
                    value={row.quantidade}
                    onChange={(event) => {
                      const value = event.target.value;
                      const quantidadeEditada = parseQuantity(value);
                      updateMaterial(row.key, {
                        quantidade: value,
                        quantidadeM2:
                          areaM2 > 0 ? quantidadeEditada / areaM2 : null,
                      });
                    }}
                  />
                </div>
                <div className="crm-mat-cell" data-label="Un.">
                  <select
                    className="select"
                    aria-label={`Unidade do material ${index + 1}`}
                    value={row.unidade}
                    onChange={(event) =>
                      updateMaterial(row.key, {
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
                <div className="crm-mat-cell" data-label="Unitário">
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-label={`Preço unitário do material ${index + 1}`}
                    value={row.valor}
                    onChange={(event) =>
                      updateMaterial(row.key, { valor: event.target.value })
                    }
                  />
                </div>
                <div className="crm-mat-cell crm-mat-total" data-label="Total">
                  {quantidade > 0 && valorUnitCents > 0
                    ? formatBRL(Math.round(quantidade * valorUnitCents))
                    : "—"}
                </div>
                <button
                  type="button"
                  className="crm-line-remove"
                  aria-label={`Remover material ${index + 1}`}
                  onClick={() => {
                    setMateriaisDirty(true);
                    setMateriais((current) =>
                      current.filter((item) => item.key !== row.key),
                    );
                  }}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="crm-mat-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setMateriaisDirty(true);
              setMateriais((current) => [
                ...current,
                {
                  key: `custom-${Date.now()}-${current.length}`,
                  chave: `custom-${Date.now()}`,
                  descricao: "",
                  quantidade: "0",
                  unidade: "un",
                  valor: "",
                  quantidadeM2: 0,
                },
              ]);
            }}
          >
            Adicionar material
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setTemplatesOpen(true)}
          >
            Gerenciar templates
          </button>
        </div>

        {calcAviso ? <p className="crm-saved">{calcAviso}</p> : null}

        <p className="crm-calc-note">
          Ajustes aqui valem para este orçamento. Use “Gerenciar templates”
          para mudar o padrão do sistema nos próximos orçamentos.
        </p>
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

        <div className="crm-labor">
          <div className="crm-list-head">
            <h2>Mão de obra</h2>
            <span className="crm-list-count">
              {maoObraCents > 0 ? formatBRL(maoObraCents) : "não incluída"}
            </span>
          </div>

          <div className="crm-labor-grid">
            <div className="field-group crm-labor-descricao">
              <label className="field-label" htmlFor="mao-descricao">
                Descrição
              </label>
              <input
                className="input"
                id="mao-descricao"
                maxLength={120}
                placeholder="Ex.: Instalação de drywall e forro"
                value={maoDescricao}
                onChange={(event) => setMaoDescricao(event.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="mao-modo">
                Forma
              </label>
              <select
                className="select"
                id="mao-modo"
                value={maoModo}
                onChange={(event) =>
                  setMaoModo(event.target.value === "m2" ? "m2" : "fechado")
                }
              >
                <option value="fechado">Valor fechado</option>
                <option value="m2">Por m²</option>
              </select>
            </div>

            {maoModo === "m2" ? (
              <div className="field-group">
                <label className="field-label" htmlFor="mao-m2">
                  Valor por m² (R$)
                </label>
                <input
                  className="input"
                  id="mao-m2"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={maoPorM2}
                  onChange={(event) => setMaoPorM2(event.target.value)}
                />
              </div>
            ) : (
              <div className="field-group">
                <label className="field-label" htmlFor="mao-valor">
                  Valor (R$)
                </label>
                <input
                  className="input"
                  id="mao-valor"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={maoValor}
                  onChange={(event) => setMaoValor(event.target.value)}
                />
              </div>
            )}

            <div className="field-group">
              <span className="field-label">Total da mão de obra</span>
              <span className="crm-labor-total">
                {formatBRL(maoObraCents)}
              </span>
            </div>
          </div>

          {maoModo === "m2" ? (
            <p className="crm-labor-hint">
              {formatBRL(
                Math.round(parseQuantity(maoPorM2) * 100),
              )}{" "}
              por m² × {formatQuantity(areaM2)} m² de área calculada.
            </p>
          ) : null}
        </div>

        <dl className="crm-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatBRL(totais.subtotalCents)}</dd>
          </div>
          <div>
            <dt>Mão de obra</dt>
            <dd>{formatBRL(totais.maoObraCents)}</dd>
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

      <MaterialTemplateDrawer
        open={templatesOpen}
        sistemaInicial={calcSistema}
        templates={templatesState}
        onClose={() => setTemplatesOpen(false)}
        onSaved={aplicarTemplate}
      />
    </form>
  );
}
