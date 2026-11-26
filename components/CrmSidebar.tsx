"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/Brand";
import { logout } from "@/app/crm/actions";

const nav = [
  { label: "Contatos", href: "/crm" },
  { label: "Clientes", href: "/crm/clientes" },
  { label: "Calculadora", href: "/crm/calculadora" },
  { label: "Financeiro", href: "/crm/financeiro" },
] as const;

export function CrmSidebar() {
  const pathname = usePathname() ?? "/crm";

  return (
    <aside className="crm-sidebar">
      <Link className="crm-sidebar-brand" href="/crm" aria-label="CRM Módulo Interiores">
        <BrandMark className="crm-sidebar-mark" />
        <span className="crm-sidebar-wordmark">
          <span className="crm-sidebar-name">MÓDULO</span>
          <span className="crm-sidebar-sub">INTERIORES</span>
        </span>
      </Link>

      <p className="crm-sidebar-label">CRM</p>

      <nav className="crm-sidebar-nav" aria-label="Seções do CRM">
        {nav.map((item) => {
          const active =
            item.href === "/crm"
              ? pathname === "/crm" || pathname === "/crm/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="crm-sidebar-link"
              aria-current={active ? "page" : undefined}
            >
              <span className="crm-sidebar-bar" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="crm-sidebar-foot">
        <Link className="crm-sidebar-site" href="/">
          Ver site <span aria-hidden="true">↗</span>
        </Link>
        <form action={logout}>
          <button className="crm-sidebar-logout" type="submit">
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
