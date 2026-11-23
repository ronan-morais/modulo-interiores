import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CrmOrcamentoBuilder } from "@/components/CrmOrcamentoBuilder";
import { CrmShell } from "@/components/CrmShell";
import { Icon } from "@/components/Icon";
import { listClientes } from "@/lib/clientes";
import { isAuthenticated } from "@/lib/crm";
import { formatBRL } from "@/lib/money";
import { listOrcamentosMaterial } from "@/lib/orcamento-material-db";
import {
  listMaterialTemplates,
  listSistemasMaterial,
} from "@/lib/material-templates-db";
import { deleteOrcamentoMaterial } from "../actions";

export const metadata: Metadata = {
  title: "Calculadora",
  robots: { index: false, follow: false, nocache: true },
};

const erros: Record<string, string> = {
  itens: "Inclua ao menos um item de material.",
  titulo: "Informe a obra ou serviço.",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export default async function CalculadoraPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/crm");

  const { erro } = await searchParams;
  const [clientes, orcamentos, sistemas, templates] = await Promise.all([
    listClientes(),
    listOrcamentosMaterial(),
    listSistemasMaterial(),
    listMaterialTemplates(),
  ]);

  return (
    <CrmShell title="Calculadora" current="calculadora">
      <p className="crm-calc-intro">
        Informe as medidas para calcular a área e a quantidade de material.
        Ajuste os itens, salve e envie a proposta em PDF.
      </p>

      {erro ? (
        <p className="crm-alert" role="alert">
          {erros[erro] ?? "Confira os dados e tente de novo."}
        </p>
      ) : null}

      <CrmOrcamentoBuilder
        clientes={clientes}
        sistemas={sistemas}
        templates={templates}
      />

      <section className="crm-quotes" aria-labelledby="orcamentos-salvos">
        <div className="crm-list-head">
          <h2 id="orcamentos-salvos">Orçamentos salvos</h2>
          <span className="crm-list-count">
            {orcamentos.length}{" "}
            {orcamentos.length === 1 ? "orçamento" : "orçamentos"}
          </span>
        </div>

        {orcamentos.length === 0 ? (
          <p className="crm-foot-note">
            Nenhum orçamento salvo ainda. Monte os itens acima e clique em
            “Salvar orçamento”.
          </p>
        ) : (
          <ul className="crm-quote-list">
            {orcamentos.map((orcamento) => (
              <li key={orcamento.id}>
                <Link href={`/crm/calculadora/${orcamento.id}`}>
                  <span className="crm-quote-date">
                    {dateFormatter.format(new Date(orcamento.criadoEm))}
                  </span>
                  <span className="crm-quote-title">{orcamento.titulo}</span>
                  <span className="crm-muted">
                    {orcamento.clienteNome || "Sem cliente"}
                  </span>
                  <span className="crm-quote-total">
                    {formatBRL(orcamento.totalCents)}
                  </span>
                </Link>
                <form action={deleteOrcamentoMaterial}>
                  <input type="hidden" name="id" value={orcamento.id} />
                  <button
                    className="crm-entry-remove"
                    type="submit"
                    aria-label={`Remover orçamento ${orcamento.titulo}`}
                  >
                    <Icon name="close" size={14} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </CrmShell>
  );
}