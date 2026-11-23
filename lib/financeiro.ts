import { ensureCrmSchema } from "@/lib/crm";
import { getDb } from "@/lib/db";

export const entradaCategorias = ["Serviço", "Sinal", "Outros"] as const;
export const saidaCategorias = [
  "Material",
  "Mão de obra",
  "Transporte",
  "Ferramentas",
  "Outros",
] as const;

export type LancamentoTipo = "entrada" | "saida";

export type Lancamento = {
  id: number;
  data: string;
  tipo: LancamentoTipo;
  categoria: string;
  descricao: string;
  valorCents: number;
};

export type LancamentoInput = Omit<Lancamento, "id">;

export function isLancamentoTipo(value: unknown): value is LancamentoTipo {
  return value === "entrada" || value === "saida";
}

export function categoriasFor(tipo: LancamentoTipo): readonly string[] {
  return tipo === "entrada" ? entradaCategorias : saidaCategorias;
}

export { formatBRL, parseAmountToCents } from "@/lib/money";

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
});

export function todayIso(): string {
  return isoDateFormatter.format(new Date());
}

export function normalizeMonth(value: unknown): string {
  const month = String(value ?? "");
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : todayIso().slice(0, 7);
}

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonth(month: string): string {
  const label = monthFormatter.format(new Date(`${month}-01T12:00:00Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

export function formatDay(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : dayFormatter.format(date);
}

function mapLancamento(row: Record<string, unknown>): Lancamento {
  return {
    id: Number(row.id),
    data: String(row.data ?? ""),
    tipo: isLancamentoTipo(row.tipo) ? row.tipo : "saida",
    categoria: String(row.categoria ?? ""),
    descricao: String(row.descricao ?? ""),
    valorCents: Number(row.valor_cents ?? 0),
  };
}

export async function listLancamentos(month: string): Promise<Lancamento[]> {
  await ensureCrmSchema();

  const result = await getDb().execute({
    sql: `SELECT * FROM lancamentos
          WHERE data LIKE ?
          ORDER BY data DESC, id DESC
          LIMIT 300`,
    args: [`${month}-%`],
  });

  return result.rows.map((row) => mapLancamento(row as Record<string, unknown>));
}

export async function resumoMes(
  month: string,
): Promise<{ entradas: number; saidas: number }> {
  await ensureCrmSchema();

  const result = await getDb().execute({
    sql: `SELECT tipo, SUM(valor_cents) AS total
          FROM lancamentos
          WHERE data LIKE ?
          GROUP BY tipo`,
    args: [`${month}-%`],
  });

  let entradas = 0;
  let saidas = 0;
  for (const row of result.rows) {
    const total = Number(row.total);
    if (row.tipo === "entrada") entradas = total;
    if (row.tipo === "saida") saidas = total;
  }

  return { entradas, saidas };
}

export async function createLancamento(input: LancamentoInput): Promise<void> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: `INSERT INTO lancamentos (data, tipo, categoria, descricao, valor_cents)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      input.data,
      input.tipo,
      input.categoria,
      input.descricao,
      input.valorCents,
    ],
  });
}

export async function removeLancamento(id: number): Promise<void> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: "DELETE FROM lancamentos WHERE id = ?",
    args: [id],
  });
}
