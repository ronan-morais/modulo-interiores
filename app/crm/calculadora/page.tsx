import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CrmCalculator } from "@/components/CrmCalculator";
import { CrmShell } from "@/components/CrmShell";
import { isAuthenticated } from "@/lib/crm";

export const metadata: Metadata = {
  title: "Calculadora",
  robots: { index: false, follow: false, nocache: true },
};

export default async function CalculadoraPage() {
  if (!(await isAuthenticated())) redirect("/crm");

  return (
    <CrmShell title="Calculadora" current="calculadora">
      <p className="crm-calc-intro">
        Estime material, mão de obra e preço por metro quadrado antes de
        fechar a proposta.
      </p>
      <CrmCalculator />
    </CrmShell>
  );
}
