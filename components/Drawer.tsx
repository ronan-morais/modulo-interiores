"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  formId: string;
  submitLabel?: string;
  trigger?: "fab" | "link";
  triggerLabel?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function Drawer({
  title,
  formId,
  submitLabel = "Salvar",
  trigger = "fab",
  triggerLabel = "Editar",
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [enviando, setEnviando] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fecharComEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const focaveis = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", fecharComEsc);
    const formulario = document.getElementById(formId);
    const aoEnviar = () => setEnviando(true);
    formulario?.addEventListener("submit", aoEnviar);
    if (window.innerWidth >= 720) {
      const primeiroCampo = panel.current?.querySelector<HTMLElement>("input, select, textarea");
      primeiroCampo?.focus({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEsc);
      formulario?.removeEventListener("submit", aoEnviar);
    };
  }, [open, formId]);

  return (
    <>
      {trigger === "fab" ? (
        <button
          className="crm-fab"
          type="button"
          aria-label={title}
          title={title}
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">+</span>
        </button>
      ) : (
        <button
          className="crm-sheet-trigger"
          type="button"
          onClick={() => setOpen(true)}
        >
          {triggerLabel}
        </button>
      )}

      {open ? (
        <div className="crm-sheet">
          <div className="crm-sheet-backdrop" aria-hidden="true" />
          <div
            className="crm-sheet-panel"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <span className="crm-sheet-handle" aria-hidden="true" />

            <header className="crm-sheet-head">
              <h2>{title}</h2>
              <button
                className="crm-sheet-close"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <div className="crm-sheet-body">{children}</div>

            <footer className="crm-sheet-foot">
              <button
                className="btn btn-outline btn-md crm-sheet-cancel"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-dark btn-md crm-sheet-save"
                type="submit"
                form={formId}
                disabled={enviando}
                aria-busy={enviando}
              >
                {enviando ? "Salvando…" : submitLabel}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
