"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  formId: string;
  submitLabel?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function Drawer({
  title,
  formId,
  submitLabel = "Salvar",
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fecharComEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", fecharComEsc);
    const primeiroCampo = panel.current?.querySelector<HTMLElement>("input, select, textarea");
    primeiroCampo?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEsc);
    };
  }, [open]);

  return (
    <>
      <button
        className="crm-fab"
        type="button"
        aria-label={title}
        title={title}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">+</span>
      </button>

      {open ? (
        <div className="crm-sheet">
          <div
            className="crm-sheet-backdrop"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
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
              <button className="btn btn-dark btn-md crm-sheet-save" type="submit" form={formId}>
                {submitLabel}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
