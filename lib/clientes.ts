import { ensureCrmSchema } from "@/lib/crm";
import { getDb } from "@/lib/db";

export type Cliente = {
  id: number;
  criadoEm: string;
  nome: string;
  whatsapp: string;
  email: string;
  cidade: string;
  bairro: string;
  observacoes: string;
};

export type ClienteInput = Omit<Cliente, "id" | "criadoEm">;

function mapCliente(row: Record<string, unknown>): Cliente {
  return {
    id: Number(row.id),
    criadoEm: String(row.criado_em ?? ""),
    nome: String(row.nome ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    email: String(row.email ?? ""),
    cidade: String(row.cidade ?? ""),
    bairro: String(row.bairro ?? ""),
    observacoes: String(row.observacoes ?? ""),
  };
}

export async function listClientes(): Promise<Cliente[]> {
  await ensureCrmSchema();

  const result = await getDb().execute(
    "SELECT * FROM clientes ORDER BY nome COLLATE NOCASE ASC LIMIT 300",
  );

  return result.rows.map((row) => mapCliente(row as Record<string, unknown>));
}

export async function createCliente(input: ClienteInput): Promise<void> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: `INSERT INTO clientes (nome, whatsapp, email, cidade, bairro, observacoes)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      input.nome,
      input.whatsapp,
      input.email,
      input.cidade,
      input.bairro,
      input.observacoes,
    ],
  });
}

export async function updateCliente(
  id: number,
  input: ClienteInput,
): Promise<void> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: `UPDATE clientes
          SET nome = ?, whatsapp = ?, email = ?, cidade = ?, bairro = ?, observacoes = ?
          WHERE id = ?`,
    args: [
      input.nome,
      input.whatsapp,
      input.email,
      input.cidade,
      input.bairro,
      input.observacoes,
      id,
    ],
  });
}

export async function removeCliente(id: number): Promise<void> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: "DELETE FROM clientes WHERE id = ?",
    args: [id],
  });
}
