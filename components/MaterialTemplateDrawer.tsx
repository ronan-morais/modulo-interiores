"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  resetMaterialTemplateAction,
  saveMaterialTemplate,
} from "@/app/crm/actions";
import { Icon } from "@/components/Icon";
import { parseAmountToCents, parseQuantity } from "@/lib/money";
import {
  sistemasMaterial,
  type SistemaMaterial,
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
  quantidadeM2: number | null;
  quantidadeM2Input: string;
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
    quantidadeM2: item.quantidadeM2,
    quantidadeM2Input:
      item.quantidadeM2 === null ? "" : numberInput(item.quantidadeM2),
  }));
}

export function MaterialTemplateDrawer({
  open,
  sistemaInicial,
  templates,
  onClose,
  onSaved,
}: {
  open: boolean;
  sistemaInicial: SistemaMaterial;
  templates: TemplatesPorSistema;
  onClose: () => void;
  onSaved: (sistema: SistemaMaterial, itens: TemplateItem[]) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [sistema, setSistema] = useState<SistemaMaterial>(sistemaInicial);
  const [drafts, setDrafts] = useState<TemplateDraft[]>(() =>
    draftsFromTemplate(templates[sistemaInicial]),
  );
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    document.body.style.overflow = "hidden";
    panel
      ?.querySelector<HTMLElement>(
        "button, input, select, textarea, a[href]",
      )
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

  const trocarSistema = (next: SistemaMaterial) => {
    setSistema(next);
    setDrafts(draftsFromTemplate(templates[next]));
    setAviso(null);
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
        quantidadeM2: draft.quantidadeM2,
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

        <div className="crm-drawer-tabs" role="tablist" aria-label="Sistema">
          {sistemasMaterial.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === sistema}
              className="crm-drawer-tab"
              onClick={() => trocarSistema(item.id)}
            >
              {item.nome.replace(" (2 faces)", "")}
            </button>
          ))}
        </div>

        <div className="crm-drawer-body">
          <div className="crm-drawer-lines-head" aria-hidden="true">
            <span>Material</span>
            <span>Un.</span>
            <span>Unitário</span>
            <span>Qtd/m²</span>
            <span />
          </div>

          {drafts.map((draft, index) => (
            <div className="crm-drawer-row" key={draft.key}>
              <div className="crm-drawer-cell crm-drawer-name" data-label="Material">
                <input
                  className="input"
                  maxLength={120}
                  aria-label={`Template: material ${index + 1}`}
                  value={draft.descricao}
                  onChange={(event) =>
                    atualizar(draft.key, { descricao: event.target.value })
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
              <div className="crm-drawer-cell" data-label="Qtd/m²">
                {draft.quantidadeM2 === null ? (
                  <span className="crm-drawer-auto">auto</span>
                ) : (
                  <input
                    className="input"
                    inputMode="decimal"
                    aria-label={`Template: quantidade por m² do material ${index + 1}`}
                    value={draft.quantidadeM2Input}
                    onChange={(event) => {
                      const value = event.target.value;
                      atualizar(draft.key, {
                        quantidadeM2Input: value,
                        quantidadeM2: parseQuantity(value),
                      });
                    }}
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
                  quantidadeM2: 0,
                  quantidadeM2Input: "0",
                },
              ])
            }
          >
            Adicionar material
          </button>

          <p className="crm-calc-note">
            “auto” usa a regra do sistema (placas, perfis, parafusos). Itens
            adicionais usam a quantidade por m² informada.
          </p>

          {aviso ? <p className="crm-saved">{aviso}</p> : null}
        </div>

        <footer className="crm-drawer-foot">
          <button
            type="button"
            className="crm-link crm-drawer-reset"
            onClick={restaurar}
            disabled={ocupado}
          >
            Restaurar padrão
          </button>
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
