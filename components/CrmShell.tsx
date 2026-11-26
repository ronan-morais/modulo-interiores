import type { ReactNode } from "react";

export function CrmShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main id="conteudo" className="crm-main">
      <header className="crm-page-head">
        <div className="crm-page-heading">
          <h1>{title}</h1>
          {subtitle ? <p className="crm-page-sub">{subtitle}</p> : null}
        </div>
        {actions ? <div className="crm-page-actions">{actions}</div> : null}
      </header>
      {children}
    </main>
  );
}
