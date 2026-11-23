import { ensureCrmSchema } from "@/lib/crm";
import { getDb } from "@/lib/db";
import {
  orcamentoTotais,
  sanitizeItens,
  type OrcamentoItem,
  type OrcamentoTotais,
} from "@/lib/orcamento-material";

export type OrcamentoMaterial = OrcamentoTotais & {
  id: number;
  criadoEm: string;
  titulo: string;
  clienteNome: string;
  clienteEmail: string;
  clienteWhatsapp: string;
  observacoes: string;
  itens: OrcamentoItem[];
};

export type OrcamentoMaterialInput = {
  titulo: string;
  clienteNome: string;
  clienteEmail: string;
  clienteWhatsapp: string;
  observacoes: string;
  itens: OrcamentoItem[];
};

function mapOrcamento(row: Record<string, unknown>): OrcamentoMaterial {
  let itens: OrcamentoItem[] = [];
  if (typeof row.itens === "string") {
    try {
      itens = sanitizeItens(JSON.parse(row.itens));
    } catch {
      itens = [];
    }
  }

  return {
    id: Number(row.id),
    criadoEm: String(row.criado_em ?? ""),
    titulo: String(row.titulo ?? ""),
    clienteNome: String(row.cliente_nome ?? ""),
    clienteEmail: String(row.cliente_email ?? ""),
    clienteWhatsapp: String(row.cliente_whatsapp ?? ""),
    observacoes: String(row.observacoes ?? ""),
    itens,
    ...orcamentoTotais(itens),
  };
}

export async function listOrcamentosMaterial(): Promise<OrcamentoMaterial[]> {
  await ensureCrmSchema();

  const result = await getDb().execute(
    "SELECT * FROM orcamentos_material ORDER BY criado_em DESC, id DESC LIMIT 60",
  );

  return result.rows.map((row) => mapOrcamento(row as Record<string, unknown>));
}

export async function getOrcamentoMaterial(
  id: number,
): Promise<OrcamentoMaterial | null> {
  await ensureCrmSchema();

  const result = await getDb().execute({
    sql: "SELECT * FROM orcamentos_material WHERE id = ? LIMIT 1",
    args: [id],
  });
  const row = result.rows[0];

  return row ? mapOrcamento(row as Record<string, unknown>) : null;
}

export async function createOrcamentoMaterial(
  input: OrcamentoMaterialInput,
): Promise<number> {
  await ensureCrmSchema();

  const itens = sanitizeItens(input.itens);
  const totais = orcamentoTotais(itens);

  const result = await getDb().execute({
    sql: `INSERT INTO orcamentos_material
            (titulo, cliente_nome, cliente_email, cliente_whatsapp, observacoes,
             itens, subtotal_cents, frete_cents, desconto_cents, total_cents)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.titulo,
      input.clienteNome,
      input.clienteEmail,
      input.clienteWhatsapp,
      input.observacoes,
      JSON.stringify(itens),
      totais.subtotalCents,
      totais.freteCents,
      totais.descontoCents,
      totais.totalCents,
    ],
  });

  return Number(result.lastInsertRowid);
}

export async function removeOrcamentoMaterial(id: number): Promise<void> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: "DELETE FROM orcamentos_material WHERE id = ?",
    args: [id],
  });
}
