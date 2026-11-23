import Link from "next/link";

const tabs = [
  { id: "contatos", label: "Contatos", href: "/crm" },
  { id: "clientes", label: "Clientes", href: "/crm/clientes" },
  { id: "financeiro", label: "Financeiro", href: "/crm/financeiro" },
  { id: "calculadora", label: "Calculadora", href: "/crm/calculadora" },
] as const;

export type CrmTab = (typeof tabs)[number]["id"];

export function CrmTabs({ current }: { current: CrmTab }) {
  return (
    <nav className="crm-tabs" aria-label="Seções do CRM">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          aria-current={tab.id === current ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
