import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/Brand";
import { CrmTabs, type CrmTab } from "@/components/CrmTabs";
import { logout } from "@/app/crm/actions";

export function CrmShell({
  title,
  current,
  children,
}: {
  title: string;
  current: CrmTab;
  children: ReactNode;
}) {
  return (
    <div className="crm-page">
      <header className="crm-top">
        <div className="container crm-top-inner">
          <div className="crm-brand">
            <BrandMark />
            <div>
              <p className="crm-brand-label">Módulo Interiores</p>
              <h1>{title}</h1>
            </div>
          </div>
          <div className="crm-actions">
            <Link className="crm-link" href="/">
              Ver site
            </Link>
            <form action={logout}>
              <button className="btn btn-outline btn-sm" type="submit">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="conteudo" className="container crm-main">
        <CrmTabs current={current} />
        {children}
      </main>
    </div>
  );
}
