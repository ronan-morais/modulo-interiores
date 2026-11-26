import { ensureCrmSchema } from "@/lib/crm";
import { getDb } from "@/lib/db";
import { orcamentoTotais, type OrcamentoItem } from "@/lib/orcamento-material";

export type MaterialDoLead = {
  id: number;
  leadId: number;
  servicoId: string;
  titulo: string;
  criadoEm: string;
  itens: OrcamentoItem[];
  subtotalCents: number;
  maoObraCents: number;
  totalCents: number;
};

function map(row: Record<string, unknown>): MaterialDoLead {
  let itens: OrcamentoItem[] = [];
  try {
    const parsed = JSON.parse(String(row.itens ?? "[]"));
    if (Array.isArray(parsed)) itens = parsed as OrcamentoItem[];
  } catch {
    itens = [];
  }
  const maoObraCents = Number(row.mao_obra_cents ?? 0);
  const totais = orcamentoTotais(itens, maoObraCents);

  return {
    id: Number(row.id),
    leadId: Number(row.lead_id ?? 0),
    servicoId: String(row.servico_id ?? ""),
    titulo: String(row.titulo ?? ""),
    criadoEm: String(row.criado_em ?? ""),
    itens,
    subtotalCents: totais.subtotalCents,
    maoObraCents,
    totalCents: totais.totalCents,
  };
}

export async function listarMateriaisDoLead(leadId: number): Promise<MaterialDoLead[]> {
  await ensureCrmSchema();
  const result = await getDb().execute({
    sql: "SELECT * FROM orcamentos_material WHERE lead_id = ? ORDER BY id ASC",
    args: [leadId],
  });
  return result.rows.map((row) => map(row as Record<string, unknown>));
}

export async function salvarMaterialDoLead(input: {
  leadId: number;
  servicoId: string;
  titulo: string;
  clienteNome: string;
  clienteEmail: string;
  clienteWhatsapp: string;
  observacoes: string;
  itens: OrcamentoItem[];
  maoObraCents: number;
  maoObraDescricao: string;
}): Promise<number> {
  await ensureCrmSchema();
  const totais = orcamentoTotais(input.itens, input.maoObraCents);

  const result = await getDb().execute({
    sql: `INSERT INTO orcamentos_material
            (titulo, cliente_nome, cliente_email, cliente_whatsapp, observacoes, itens,
             subtotal_cents, mao_obra_cents, mao_obra_descricao, total_cents, lead_id, servico_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.titulo,
      input.clienteNome,
      input.clienteEmail,
      input.clienteWhatsapp,
      input.observacoes,
      JSON.stringify(input.itens),
      totais.subtotalCents,
      input.maoObraCents,
      input.maoObraDescricao,
      totais.totalCents,
      input.leadId,
      input.servicoId,
    ],
  });

  return Number(result.lastInsertRowid);
}
