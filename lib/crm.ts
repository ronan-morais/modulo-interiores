import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ensureSchema, getDb } from "@/lib/db";

export const leadStatuses = [
  { id: "novo", label: "Contato inicial" },
  { id: "em_contato", label: "Em contato" },
  { id: "orcado", label: "Orçado" },
  { id: "ganho", label: "Ganho" },
  { id: "perdido", label: "Perdido" },
] as const;

export type LeadStatus = (typeof leadStatuses)[number]["id"];

export type LeadService = { id: string; titulo: string; area?: number | null };

export type Lead = {
  id: number;
  criadoEm: string;
  nome: string;
  whatsapp: string;
  email: string;
  servicos: LeadService[];
  tipoImovel: string;
  areaM2: number | null;
  ambientes: number | null;
  cidade: string;
  bairro: string;
  prazo: string;
  detalhes: string;
  arquivo: string;
  origem: string;
  status: LeadStatus;
  notas: string;
  atualizadoEm: string | null;
};

export const SESSION_COOKIE = "crm_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

let columnsReady: Promise<void> | undefined;

export function isLeadStatus(value: unknown): value is LeadStatus {
  return leadStatuses.some((status) => status.id === value);
}

export const leadOrigens = [
  { id: "orcamento-online", label: "Formulário do site" },
  { id: "instagram-direct", label: "Instagram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "presencial", label: "Presencial" },
  { id: "indicacao", label: "Indicação" },
] as const;

export function origemLabel(origem: string): string {
  return leadOrigens.find((item) => item.id === origem)?.label ?? origem;
}

export function statusLabel(status: LeadStatus): string {
  return leadStatuses.find((item) => item.id === status)?.label ?? status;
}

export function crmConfigured(): boolean {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD);
}

export function credentialsValid(usuario: string, senha: string): boolean {
  const expectedUser = process.env.ADMIN_USER ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPassword) return false;

  const digest = (value: string) => createHash("sha256").update(value).digest();
  return (
    timingSafeEqual(digest(usuario), digest(expectedUser)) &&
    timingSafeEqual(digest(senha), digest(expectedPassword))
  );
}

function sessionKey(): string {
  const key = process.env.CRM_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!key) throw new Error("CRM_SESSION_SECRET não definida.");
  return key;
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const signature = createHmac("sha256", sessionKey())
    .update(String(expires))
    .digest("base64url");
  return `${expires}.${signature}`;
}

export function sessionTokenValid(token: string | undefined): boolean {
  if (!token) return false;

  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;

  const expected = createHmac("sha256", sessionKey())
    .update(expires)
    .digest("base64url");
  const given = Buffer.from(signature);
  const reference = Buffer.from(expected);
  return (
    given.length === reference.length && timingSafeEqual(given, reference)
  );
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return sessionTokenValid(store.get(SESSION_COOKIE)?.value);
}

async function ensureCrmColumns(): Promise<void> {
  await ensureSchema();

  const db = getDb();
  const info = await db.execute("PRAGMA table_info(orcamentos)");
  const existing = new Set(info.rows.map((row) => String(row.name)));

  const additions: [column: string, sql: string][] = [
    ["status", "ALTER TABLE orcamentos ADD COLUMN status TEXT NOT NULL DEFAULT 'novo'"],
    ["notas", "ALTER TABLE orcamentos ADD COLUMN notas TEXT"],
    ["atualizado_em", "ALTER TABLE orcamentos ADD COLUMN atualizado_em TEXT"],
  ];

  for (const [column, sql] of additions) {
    if (existing.has(column)) continue;
    try {
      await db.execute(sql);
    } catch (error) {
      // Duas instâncias podem migrar ao mesmo tempo; a coluna já existir é o caso feliz.
      if (!String(error).includes("duplicate column")) throw error;
    }
  }

  const materialInfo = await db.execute(
    "PRAGMA table_info(orcamentos_material)",
  );
  const materialColumns = new Set(
    materialInfo.rows.map((row) => String(row.name)),
  );
  const materialAdditions: [column: string, sql: string][] = [
    [
      "mao_obra_cents",
      "ALTER TABLE orcamentos_material ADD COLUMN mao_obra_cents INTEGER NOT NULL DEFAULT 0",
    ],
    [
      "mao_obra_descricao",
      "ALTER TABLE orcamentos_material ADD COLUMN mao_obra_descricao TEXT",
    ],
    ["lead_id", "ALTER TABLE orcamentos_material ADD COLUMN lead_id INTEGER"],
    ["servico_id", "ALTER TABLE orcamentos_material ADD COLUMN servico_id TEXT"],
    ["contato_id", "ALTER TABLE orcamentos_material ADD COLUMN contato_id INTEGER"],
  ];

  for (const [column, sql] of materialAdditions) {
    if (materialColumns.has(column)) continue;
    try {
      await db.execute(sql);
    } catch (error) {
      if (!String(error).includes("duplicate column")) throw error;
    }
  }

  const templateInfo = await db.execute(
    "PRAGMA table_info(materiais_template)",
  );
  const templateColumns = new Set(
    templateInfo.rows.map((row) => String(row.name)),
  );

  if (!templateColumns.has("regra")) {
    try {
      await db.execute(
        "ALTER TABLE materiais_template ADD COLUMN regra TEXT NOT NULL DEFAULT 'auto'",
      );
      await db.execute(
        "UPDATE materiais_template SET regra = 'area' WHERE quantidade_m2 IS NOT NULL AND regra = 'auto'",
      );
    } catch (error) {
      if (!String(error).includes("duplicate column")) throw error;
    }
  }
}

export async function ensureCrmSchema(): Promise<void> {
  if (!columnsReady) {
    columnsReady = ensureCrmColumns().catch((error) => {
      columnsReady = undefined;
      throw error;
    });
  }

  await columnsReady;
}

function mapLead(row: Record<string, unknown>): Lead {
  let servicos: LeadService[] = [];
  if (typeof row.servicos === "string") {
    try {
      const parsed: unknown = JSON.parse(row.servicos);
      if (Array.isArray(parsed)) {
        servicos = parsed.filter(
          (item): item is LeadService =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as LeadService).id === "string" &&
            typeof (item as LeadService).titulo === "string",
        );
      }
    } catch {
      servicos = [];
    }
  }

  return {
    id: Number(row.id),
    criadoEm: String(row.criado_em ?? ""),
    nome: String(row.nome ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    email: String(row.email ?? ""),
    servicos,
    tipoImovel: String(row.tipo_imovel ?? ""),
    areaM2: row.area_m2 === null ? null : Number(row.area_m2),
    ambientes: row.ambientes === null ? null : Number(row.ambientes),
    cidade: String(row.cidade ?? ""),
    bairro: String(row.bairro ?? ""),
    prazo: String(row.prazo ?? ""),
    detalhes: String(row.detalhes ?? ""),
    arquivo: String(row.arquivo ?? ""),
    origem: String(row.origem ?? "orcamento-online"),
    status: isLeadStatus(row.status) ? row.status : "novo",
    notas: String(row.notas ?? ""),
    atualizadoEm: row.atualizado_em ? String(row.atualizado_em) : null,
  };
}

export async function listLeads(options: {
  status?: LeadStatus;
  query?: string;
}): Promise<Lead[]> {
  await ensureCrmSchema();

  const filters: string[] = [];
  const args: (string | number)[] = [];

  if (options.status) {
    filters.push("status = ?");
    args.push(options.status);
  }

  if (options.query) {
    const term = `%${options.query.replace(/[%_\\]/g, (match) => `\\${match}`)}%`;
    filters.push(
      "(nome LIKE ? ESCAPE '\\' OR whatsapp LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR cidade LIKE ? ESCAPE '\\' OR bairro LIKE ? ESCAPE '\\')",
    );
    args.push(term, term, term, term, term);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const result = await getDb().execute({
    sql: `SELECT * FROM orcamentos ${where} ORDER BY criado_em DESC, id DESC LIMIT 200`,
    args,
  });

  return result.rows.map((row) => mapLead(row as Record<string, unknown>));
}

export async function leadCounts(): Promise<{
  total: number;
  byStatus: Record<LeadStatus, number>;
}> {
  await ensureCrmSchema();

  const result = await getDb().execute(
    "SELECT status, COUNT(*) AS total FROM orcamentos GROUP BY status",
  );
  const byStatus: Record<LeadStatus, number> = {
    novo: 0,
    em_contato: 0,
    orcado: 0,
    ganho: 0,
    perdido: 0,
  };

  let total = 0;
  for (const row of result.rows) {
    const count = Number(row.total);
    total += count;
    if (isLeadStatus(row.status)) byStatus[row.status] = count;
  }

  return { total, byStatus };
}

export async function getLead(id: number): Promise<Lead | null> {
  await ensureCrmSchema();

  const result = await getDb().execute({
    sql: "SELECT * FROM orcamentos WHERE id = ? LIMIT 1",
    args: [id],
  });
  const row = result.rows[0];

  return row ? mapLead(row as Record<string, unknown>) : null;
}

export function isLeadOrigem(value: unknown): boolean {
  return leadOrigens.some((item) => item.id === value);
}

export async function updateLead(
  id: number,
  status: LeadStatus,
  notas: string,
  origem?: string,
): Promise<void> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: `UPDATE orcamentos
          SET status = ?, notas = ?, origem = COALESCE(?, origem),
              atualizado_em = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
          WHERE id = ?`,
    args: [status, notas, origem ?? null, id],
  });
}

export async function removeLead(id: number): Promise<void> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: "DELETE FROM orcamentos WHERE id = ?",
    args: [id],
  });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function whatsappHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

export type PedidoEditavel = {
  nome: string;
  whatsapp: string;
  email: string;
  areaM2: number | null;
  ambientes: number | null;
  cidade: string;
  bairro: string;
  prazo: string;
  detalhes: string;
  servicos: { id: string; titulo: string; area?: number | null }[];
};

export async function atualizarPedido(id: number, d: PedidoEditavel): Promise<void> {
  await ensureCrmSchema();
  await getDb().execute({
    sql: `UPDATE orcamentos
             SET nome = ?, whatsapp = ?, email = ?, area_m2 = ?, ambientes = ?,
                 cidade = ?, bairro = ?, prazo = ?, detalhes = ?, servicos = ?,
                 atualizado_em = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
           WHERE id = ?`,
    args: [d.nome, d.whatsapp || null, d.email || null, d.areaM2, d.ambientes,
           d.cidade, d.bairro || null, d.prazo, d.detalhes || null,
           JSON.stringify(d.servicos), id],
  });
}

export async function garantirClienteDoLead(id: number): Promise<number | null> {
  await ensureCrmSchema();
  const rs = await getDb().execute({
    sql: "SELECT nome, whatsapp, email, cidade, bairro FROM orcamentos WHERE id = ?",
    args: [id],
  });
  if (rs.rows.length === 0) return null;
  const r = rs.rows[0];
  const nome = String(r.nome ?? "").trim();
  if (!nome) return null;
  const whatsapp = r.whatsapp ? String(r.whatsapp) : null;
  const email = r.email ? String(r.email) : null;
  const ex = await getDb().execute({
    sql: `SELECT id FROM clientes
           WHERE (whatsapp IS NOT NULL AND whatsapp = ?) OR (email IS NOT NULL AND email = ?)
           LIMIT 1`,
    args: [whatsapp, email],
  });
  if (ex.rows.length > 0) return Number(ex.rows[0].id);
  const ins = await getDb().execute({
    sql: `INSERT INTO clientes (nome, whatsapp, email, cidade, bairro, observacoes)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [nome, whatsapp, email, String(r.cidade ?? ""), r.bairro ? String(r.bairro) : null,
           `Contato inicial · lead #${id} (formulário do site)`],
  });
  return Number(ins.lastInsertRowid);
}
