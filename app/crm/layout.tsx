import type { Metadata } from "next";
import { CrmSidebar } from "@/components/CrmSidebar";
import { isAuthenticated } from "@/lib/crm";

export const metadata: Metadata = {
  title: { default: "CRM", template: "%s · CRM | Módulo Interiores" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sem sessão a única tela é o login: não faz sentido moldura de navegação.
  if (!(await isAuthenticated())) return <>{children}</>;

  return (
    <div className="crm-shell">
      <CrmSidebar />
      {children}
    </div>
  );
}
