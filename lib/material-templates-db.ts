import { ensureCrmSchema } from "@/lib/crm";
import { getDb } from "@/lib/db";
import {
  isRegraQuantidade,
  sistemasPadrao,
  templatesPadrao,
  type SistemaDef,
  type TemplateItem,
  type TemplatesPorSistema,
} from "@/lib/material-quantidades";

function mapSistema(row: Record<string, unknown>): SistemaDef {
  return {
    id: String(row.slug ?? ""),
    nome: String(row.nome ?? ""),
    medidaA: String(row.medida_a ?? "Comprimento (m)"),
    medidaB: String(row.medida_b ?? "Altura (m)"),
    usaVaos: Number(row.usa_vaos ?? 0) === 1,
    padrao: Number(row.padrao ?? 0) === 1,
  };
}

function mapTemplateItem(row: Record<string, unknown>): TemplateItem {
  return {
    chave: String(row.chave ?? ""),
    descricao: String(row.descricao ?? ""),
    unidade: String(row.unidade ?? "un") as TemplateItem["unidade"],
    valorUnitCents: Number(row.valor_unit_cents ?? 0),
    regra: isRegraQuantidade(row.regra) ? row.regra : "auto",
    fator:
      row.quantidade_m2 === null || row.quantidade_m2 === undefined
        ? null
        : Number(row.quantidade_m2),
  };
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function seedSistemasPadrao(): Promise<void> {
  const statements = sistemasPadrao.map((sistema, index) => ({
    sql: `INSERT INTO sistemas_material
            (slug, nome, medida_a, medida_b, usa_vaos, padrao, ordem)
          VALUES (?, ?, ?, ?, ?, 1, ?)
          ON CONFLICT(slug) DO NOTHING`,
    args: [
      sistema.id,
      sistema.nome,
      sistema.medidaA,
      sistema.medidaB,
      sistema.usaVaos ? 1 : 0,
      index,
    ],
  }));

  if (statements.length) await getDb().batch(statements, "write");
}

export async function listSistemasMaterial(): Promise<SistemaDef[]> {
  await ensureCrmSchema();
  await seedSistemasPadrao();

  const result = await getDb().execute(
    "SELECT * FROM sistemas_material ORDER BY padrao DESC, ordem ASC, id ASC",
  );

  return result.rows.map((row) => mapSistema(row as Record<string, unknown>));
}

export async function createSistemaMaterial(input: {
  nome: string;
  medidaA: string;
  medidaB: string;
  usaVaos: boolean;
}): Promise<SistemaDef | null> {
  await ensureCrmSchema();
  await seedSistemasPadrao();

  const base = slugify(input.nome);
  if (!base) return null;

  const existing = await getDb().execute("SELECT slug FROM sistemas_material");
  const used = new Set(existing.rows.map((row) => String(row.slug)));

  let slug = base;
  let suffix = 2;
  while (used.has(slug)) {
    slug = `${base}-${suffix++}`;
  }

  const ordemResult = await getDb().execute(
    "SELECT COALESCE(MAX(ordem), 0) + 1 AS proxima FROM sistemas_material",
  );
  const ordem = Number(ordemResult.rows[0]?.proxima ?? 1);

  await getDb().execute({
    sql: `INSERT INTO sistemas_material
            (slug, nome, medida_a, medida_b, usa_vaos, padrao, ordem)
          VALUES (?, ?, ?, ?, ?, 0, ?)`,
    args: [
      slug,
      input.nome,
      input.medidaA,
      input.medidaB,
      input.usaVaos ? 1 : 0,
      ordem,
    ],
  });

  return {
    id: slug,
    nome: input.nome,
    medidaA: input.medidaA,
    medidaB: input.medidaB,
    usaVaos: input.usaVaos,
    padrao: false,
  };
}

export async function deleteSistemaMaterial(slug: string): Promise<boolean> {
  await ensureCrmSchema();

  const result = await getDb().execute({
    sql: "DELETE FROM sistemas_material WHERE slug = ? AND padrao = 0",
    args: [slug],
  });

  if (!result.rowsAffected) return false;

  await getDb().execute({
    sql: "DELETE FROM materiais_template WHERE sistema = ?",
    args: [slug],
  });

  return true;
}

async function seedTemplate(slug: string): Promise<TemplateItem[]> {
  const itens = templatesPadrao[slug] ?? [];
  const statements = itens.map((item, index) => ({
    sql: `INSERT INTO materiais_template
            (sistema, chave, descricao, unidade, valor_unit_cents, regra, quantidade_m2, ordem)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      slug,
      item.chave,
      item.descricao,
      item.unidade,
      item.valorUnitCents,
      item.regra,
      item.fator,
      index,
    ],
  }));

  if (statements.length) await getDb().batch(statements, "write");

  return itens.map((item) => ({ ...item }));
}

export async function listMaterialTemplates(): Promise<TemplatesPorSistema> {
  await ensureCrmSchema();

  const sistemas = await listSistemasMaterial();
  await garantirVersaoSeed();
  const result = await getDb().execute(
    "SELECT * FROM materiais_template ORDER BY sistema, ordem, id",
  );

  const grouped: TemplatesPorSistema = {};
  for (const sistema of sistemas) grouped[sistema.id] = [];

  for (const row of result.rows) {
    const id = String(row.sistema);
    if (!grouped[id]) continue;
    grouped[id].push(mapTemplateItem(row as Record<string, unknown>));
  }

  for (const sistema of sistemas) {
    if (sistema.padrao && grouped[sistema.id].length === 0) {
      grouped[sistema.id] = await seedTemplate(sistema.id);
    }
  }

  return grouped;
}

export async function replaceMaterialTemplate(
  sistema: string,
  itens: TemplateItem[],
): Promise<void> {
  await ensureCrmSchema();

  const statements = [
    {
      sql: "DELETE FROM materiais_template WHERE sistema = ?",
      args: [sistema],
    },
    ...itens.map((item, index) => ({
      sql: `INSERT INTO materiais_template
              (sistema, chave, descricao, unidade, valor_unit_cents, regra, quantidade_m2, ordem)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sistema,
        item.chave,
        item.descricao,
        item.unidade,
        item.valorUnitCents,
        item.regra,
        item.fator,
        index,
      ],
    })),
  ];

  await getDb().batch(statements, "write");
}

export async function resetMaterialTemplate(
  sistema: string,
): Promise<TemplateItem[]> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: "DELETE FROM materiais_template WHERE sistema = ?",
    args: [sistema],
  });

  if (!templatesPadrao[sistema]) return [];

  return seedTemplate(sistema);
}

/** Versão dos templates padrão: quando muda, a base é re-semeada uma vez. */
const SEED_VERSAO = 2;

async function garantirVersaoSeed(): Promise<void> {
  await getDb().execute(
    `CREATE TABLE IF NOT EXISTS material_seed (id INTEGER PRIMARY KEY CHECK (id = 1), versao INTEGER NOT NULL DEFAULT 0)`,
  );
  const atual = await getDb().execute("SELECT versao FROM material_seed WHERE id = 1");
  const versao = Number(atual.rows[0]?.versao ?? 0);
  if (versao >= SEED_VERSAO) return;

  for (const slug of Object.keys(templatesPadrao)) {
    await getDb().execute({
      sql: "DELETE FROM materiais_template WHERE sistema = ?",
      args: [slug],
    });
    await seedTemplate(slug);
  }

  await getDb().execute({
    sql: `INSERT INTO material_seed (id, versao) VALUES (1, ?)
          ON CONFLICT(id) DO UPDATE SET versao = excluded.versao`,
    args: [SEED_VERSAO],
  });
}
