import { ensureSchema, getDb } from "@/lib/db";
export type Anexo = { id: number; nome: string; tipo: string; tamanho: number };

export async function anexosDoLead(leadId: number): Promise<Anexo[]> {
  await ensureSchema();
  const rs = await getDb().execute({
    sql: "SELECT id, nome, tipo, tamanho FROM anexos WHERE lead_id = ? ORDER BY id DESC",
    args: [leadId],
  });
  return rs.rows.map((row) => ({
    id: Number(row.id),
    nome: String(row.nome),
    tipo: String(row.tipo),
    tamanho: Number(row.tamanho ?? 0),
  }));
}
