import { createClient, type Client } from "@libsql/client";

let client: Client | undefined;
let schemaReady: Promise<void> | undefined;

/**
 * Cliente Turso/libSQL. Em desenvolvimento, `TURSO_DATABASE_URL=file:./.data/orcamentos.db`
 * dispensa credenciais; em produção use a URL `libsql://…` e o token do banco.
 */
export function getDb(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL não está definida.");
  }

  client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return client;
}

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS orcamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    nome TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    servicos TEXT NOT NULL,
    tipo_imovel TEXT NOT NULL,
    area_m2 INTEGER,
    ambientes INTEGER,
    cidade TEXT NOT NULL,
    bairro TEXT,
    prazo TEXT NOT NULL,
    detalhes TEXT,
    arquivo TEXT,
    consentimento INTEGER NOT NULL DEFAULT 0,
    origem TEXT NOT NULL DEFAULT 'orcamento-online',
    user_agent TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orcamentos_criado_em ON orcamentos (criado_em)`,
  `CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    nome TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    cidade TEXT,
    bairro TEXT,
    observacoes TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS lancamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    data TEXT NOT NULL,
    tipo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor_cents INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos (data)`,
  `CREATE TABLE IF NOT EXISTS orcamentos_material (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    titulo TEXT NOT NULL,
    cliente_nome TEXT,
    cliente_email TEXT,
    cliente_whatsapp TEXT,
    observacoes TEXT,
    itens TEXT NOT NULL,
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    frete_cents INTEGER NOT NULL DEFAULT 0,
    desconto_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orcamentos_material_criado_em ON orcamentos_material (criado_em)`,
];

/** Cria a tabela na primeira gravação de cada instância do servidor. */
export async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getDb()
      .batch(schemaStatements, "write")
      .then(() => undefined)
      .catch((error) => {
        schemaReady = undefined;
        throw error;
      });
  }

  await schemaReady;
}
