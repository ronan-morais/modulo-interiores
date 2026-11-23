"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  createMaterialSystemAction,
  deleteMaterialSystemAction,
  resetMaterialTemplateAction,
  saveMaterialTemplate,
} from "@/app/crm/actions";
import { Icon } from "@/components/Icon";
import { parseAmountToCents, parseQuantity } from "@/lib/money";
import {
  type RegraQuantidade,
  type SistemaDef,
  type TemplateItem,
  type TemplatesPorSistema,
} from "@/lib/material-quantidades";
import { unidades, type OrcamentoUnidade } from "@/lib/orcamento-material";

type TemplateDraft = {
  key: string;
  chave: string;
  descricao: string;
  unidade: OrcamentoUnidade;
  valor: string;
  regra: RegraQuantidade;
  fatorInput: string;
};

function moneyInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function numberInput(value: number): string {
  return String(Number(value.toFixed(4))).replace(".", ",");
}

function draftsFromTemplate(template: TemplateItem[]): TemplateDraft[] {
  return template.map((item, index) => ({
    key: `${item.chave}-${index}`,
    chave: item.chave,
    descricao: item.descricao,
    unidade: item.unidade,
    valor: moneyInput(item.valorUnitCents),
    regra: item.regra,
    fatorInput: item.fator === null ? "" : numberInput(item.fator),
  }));
}

function isItemPadrao(chave: string): boolean {
  return !chave.startsWith("custom-");
}

export function MaterialTemplateDrawer({
  open,
  sistemaInicial,
  sistemas,
  templates,
  onClose,
  onSaved,
  onSistemaCriado,
  onSistemaRemovido,
}: {
  open: boolean;
  sistemaInicial: string;
  sistemas: SistemaDef[];
  templates: TemplatesPorSistema;
  onClose: () => void;
  onSaved: (sistema: string, itens: TemplateItem[]) => void;
  onSistemaCriado: (sistema: SistemaDef) => void;
  onSistemaRemovido: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [sistema, setSistema] = useState(sistemaInicial);
  const [drafts, setDrafts] = useState<TemplateDraft[]>(() =>
    draftsFromTemplate(templates[sistemaInicial] ?? []),
  );
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoMedidaA, setNovoMedidaA] = useState("Comprimento (m)");
  const [novoMedidaB, setNovoMedidaB] = useState("Altura (m)");
  const [novoVaos, setNovoVaos] = useState(true);
  const [removendo, setRemovendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const sistemaAtual =
    sistemas.find((item) => item.id === sistema) ?? sistemas[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    document.body.style.overflow = "hidden";
    panel
      ?.querySelector<HTMLElement>("button, input, select, textarea, a[href]")
      ?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusables = [
        ...panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
        ),
      ].filter((element) => element.offsetParent !== null);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!open || !mounted) return null;

  const trocarSistema = (next: string) => {
    setSistema(next);
    setDrafts(draftsFromTemplate(templates[next] ?? []));
    setAviso(null);
    setRemovendo(false);
    setCriando(false);
  };

  const atualizar = (key: string, patch: Partial<TemplateDraft>) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === key ? { ...draft, ...patch } : draft,
      ),
    );
  };

  const salvar = async () => {
    const itens: TemplateItem[] = drafts
      .filter((draft) => draft.descricao.trim())
      .map((draft) => ({
        chave: draft.chave,
        descricao: draft.descricao.trim(),
        unidade: draft.unidade,
        valorUnitCents: parseAmountToCents(draft.valor) ?? 0,
        regra: draft.regra,
        fator:
          draft.regra === "auto" ? null : parseQuantity(draft.fatorInput),
      }));

    if (!itens.length) {
      setAviso("Adicione ao menos um material antes de salvar.");
      return;
    }

    setOcupado(true);
    setAviso(null);
    try {
      await saveMaterialTemplate(sistema, JSON.stringify(itens));
      onSaved(sistema, itens);
      onClose();
    } catch {
      setAviso("Não foi possível salvar o template. Tente de novo.");
    } finally {
      setOcupado(false);
    }
  };

  const restaurar = async () => {
    setOcupado(true);
    setAviso(null);
    try {
      const itens = await resetMaterialTemplateAction(sistema);
      setDrafts(draftsFromTemplate(itens));
      onSaved(sistema, itens);
      setAviso("Template padrão restaurado.");
    } catch {
      setAviso("Não foi possível restaurar o template.");
    } finally {
      setOcupado(false);
    }
  };

  const criarSistema = async () => {
    if (!novoNome.trim() || !novoMedidaA.trim() || !novoMedidaB.trim()) {
      setAviso("Informe o nome e as duas medidas do sistema.");
      return;
    }

    setOcupado(true);
    setAviso(null);
    try {
      const criado = await createMaterialSystemAction(
        novoNome,
        novoMedidaA,
        novoMedidaB,
        novoVaos,
      );

      if (!criado) {
        setAviso("Não foi possível criar o sistema. Confira os dados.");
        return;
      }

      onSistemaCriado(criado);
      setSistema(criado.id);
      setDrafts([]);
      setCriando(false);
      setNovoNome("");
      setAviso("Sistema criado. Adicione os materiais e salve o template.");
    } catch {
      setAviso("Não foi possível criar o sistema. Tente de novo.");
    } finally {
      setOcupado(false);
    }
  };

  const excluirSistema = async () => {
    if (!removendo) {
      setRemovendo(true);
      return;
    }

    setOcupado(true);
    setAviso(null);
    try {
      const removido = await deleteMaterialSystemAction(sistema);
      if (!removido) {
        setAviso("Sistemas padrão não podem ser excluídos.");
        setRemovendo(false);
        return;
      }
      onSistemaRemovido(sistema);
      onClose();
    } catch {
      setAviso("Não foi possível excluir o sistema.");
      setRemovendo(false);
    } finally {
      setOcupado(false);
    }
  };

  return createPortal(
    <div
      className="crm-drawer-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="crm-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crm-drawer-title"
        ref={panelRef}
      >
        <header className="crm-drawer-head">
          <div>
            <p className="crm-brand-label">Módulo Interiores</p>
            <h2 id="crm-drawer-title">Templates de material</h2>
          </div>
          <button
            type="button"
            className="crm-drawer-close"
            aria-label="Fechar"
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="crm-drawer-tabs" role="tablist" aria-label="Sistemas">
          {sistemas.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === sistema}
              className="crm-drawer-tab"
              onClick={() => trocarSistema(item.id)}
            >
              {item.nome}
            </button>
          ))}
          <button
            type="button"
            className="crm-drawer-tab crm-drawer-newtab"
            onClick={() => {
              setCriando(true);
              setAviso(null);
              setRemovendo(false);
            }}
          >
            + Novo sistema
          </button>
        </div>

        <div className="crm-drawer-body">
          {criando ? (
            <div className="crm-drawer-new">
              <h3>Novo sistema</h3>
              <div className="field-group">
                <label className="field-label" htmlFor="novo-sistema-nome">
                  Nome
                </label>
                <input
                  className="input"
                  id="novo-sistema-nome"
                  maxLength={60}
                  placeholder="Ex.: Sanca em drywall"
                  value={novoNome}
                  onChange={(event) => setNovoNome(event.target.value)}
                />
              </div>
              <div className="crm-drawer-new-row">
                <div className="field-group">
                  <label className="field-label" htmlFor="novo-medida-a">
                    Medida 1
                  </label>
                  <input
                    className="input"
                    id="novo-medida-a"
                    maxLength={40}
                    value={novoMedidaA}
                    onChange={(event) => setNovoMedidaA(event.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="novo-medida-b">
                    Medida 2
                  </label>
                  <input
                    className="input"
                    id="novo-medida-b"
                    maxLength={40}
                    value={novoMedidaB}
                    onChange={(event) => setNovoMedidaB(event.target.value)}
                  />
                </div>
              </div>
              <label className="crm-drawer-check">
                <input
                  type="checkbox"
                  checked={novoVaos}
                  onChange={(event) => setNovoVaos(event.target.checked)}
                />
                Descontar vãos (m²)
              </label>
              <div className="crm-drawer-new-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setCriando(false);
                    setAviso(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-dark btn-sm"
                  onClick={criarSistema}
                  disabled={ocupado}
                >
                  Criar sistema
                </button>
              </div>
            </div>
          ) : null}

          {drafts.length === 0 && !criando ? (
            <p className="crm-drawer-empty">
              Nenhum material neste sistema ainda. Use “Adicionar material”
              para montar o template do zero.
            </p>
          ) : (
            <>
              <div className="crm-drawer-lines-head" aria-hidden="true">
                <span>Material</span>
                <span>Un.</span>
                <span>Unitário</span>
                <span>Cálculo</span>
                <span>Fator</span>
                <span />
              </div>

              {drafts.map((draft, index) => (
                <div className="crm-drawer-row" key={draft.key}>
                  <div
                    className="crm-drawer-cell crm-drawer-name"
                    data-label="Material"
                  >
                    <input
                      className="input"
                      maxLength={120}
                      aria-label={`Template: material ${index + 1}`}
                      value={draft.descricao}
                      onChange={(event) =>
                        atualizar(draft.key, {
                          descricao: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="crm-drawer-cell" data-label="Un.">
                    <select
                      className="select"
                      aria-label={`Template: unidade do material ${index + 1}`}
                      value={draft.unidade}
                      onChange={(event) =>
                        atualizar(draft.key, {
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
                  <div className="crm-drawer-cell" data-label="Unitário">
                    <input
                      className="input"
                      inputMode="decimal"
                      placeholder="0,00"
                      aria-label={`Template: preço do material ${index + 1}`}
                      value={draft.valor}
                      onChange={(event) =>
                        atualizar(draft.key, { valor: event.target.value })
                      }
                    />
                  </div>
                  <div className="crm-drawer-cell" data-label="Cálculo">
                    <select
                      className="select"
                      aria-label={`Template: cálculo do material ${index + 1}`}
                      value={draft.regra}
                      onChange={(event) => {
                        const regra = event.target.value as RegraQuantidade;
                        atualizar(draft.key, {
                          regra,
                          fatorInput:
                            regra === "auto"
                              ? ""
                              : draft.fatorInput || "1",
                        });
                      }}
                    >
                      {isItemPadrao(draft.chave) ? (
                        <option value="auto">Automática</option>
                      ) : null}
                      <option value="area">Área</option>
                      <option value="comprimento">Comprimento</option>
                      <option value="perimetro">Perímetro</option>
                      <option value="fixo">Fixa</option>
                    </select>
                  </div>
                  <div className="crm-drawer-cell" data-label="Fator">
                    {draft.regra === "auto" ? (
                      <span className="crm-drawer-auto">auto</span>
                    ) : (
                      <input
                        className="input"
                        inputMode="decimal"
                        aria-label={`Template: fator do material ${index + 1}`}
                        value={draft.fatorInput}
                        onChange={(event) =>
                          atualizar(draft.key, {
                            fatorInput: event.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    className="crm-line-remove"
                    aria-label={`Remover material ${index + 1} do template`}
                    onClick={() =>
                      setDrafts((current) =>
                        current.filter((item) => item.key !== draft.key),
                      )
                    }
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </>
          )}

          <button
            type="button"
            className="btn btn-outline btn-sm crm-drawer-add"
            onClick={() =>
              setDrafts((current) => [
                ...current,
                {
                  key: `custom-${Date.now()}-${current.length}`,
                  chave: `custom-${Date.now()}`,
                  descricao: "",
                  unidade: "un",
                  valor: "",
                  regra: "area",
                  fatorInput: "1",
                },
              ])
            }
          >
            Adicionar material
          </button>

          <p className="crm-calc-note">
            “Automática” usa a regra do sistema. “Área”, “Comprimento”,
            “Perímetro” e “Fixa” multiplicam a medida pelo fator informado.
          </p>

          {aviso ? <p className="crm-saved">{aviso}</p> : null}
        </div>

        <footer className="crm-drawer-foot">
          <div className="crm-drawer-foot-left">
            {sistemaAtual?.padrao ? (
              <button
                type="button"
                className="crm-link crm-drawer-reset"
                onClick={restaurar}
                disabled={ocupado}
              >
                Restaurar padrão
              </button>
            ) : (
              <button
                type="button"
                className="crm-link crm-drawer-reset"
                onClick={excluirSistema}
                disabled={ocupado}
              >
                {removendo ? "Confirmar exclusão" : "Excluir sistema"}
              </button>
            )}
          </div>
          <div className="crm-drawer-foot-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-dark btn-sm"
              onClick={salvar}
              disabled={ocupado}
            >
              {ocupado ? "Salvando..." : "Salvar template"}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
