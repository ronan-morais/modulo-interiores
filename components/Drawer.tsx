"use client";

import { useEffect, useState } from "react";

type Props = {
  label: string;
  title: string;
  formId: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function Drawer({ label, title, formId, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!open) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [open]);

  return (
    <>
      <button className="btn btn-dark btn-sm" type="button" onClick={() => setOpen(true)}>
        {label}
      </button>

      {open ? (
        <div className="crm-drawer" role="dialog" aria-modal="true" aria-label={title}>
          <button
            className="crm-drawer-backdrop"
            type="button"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div className="crm-drawer-panel">
            <header className="crm-drawer-head">
              <h2>{title}</h2>
              <button
                className="crm-drawer-close"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <div className="crm-drawer-body">{children}</div>

            <footer className="crm-drawer-foot">
              <button className="btn btn-outline btn-sm" type="button" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-dark btn-sm" type="submit" form={formId}>
                Salvar
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
