import { ensureCrmSchema } from "@/lib/crm";
import { getDb } from "@/lib/db";
import {
  isSistemaMaterial,
  sistemasMaterial,
  templatesPadrao,
  type SistemaMaterial,
  type TemplateItem,
  type TemplatesPorSistema,
} from "@/lib/material-quantidades";

function mapTemplateItem(row: Record<string, unknown>): TemplateItem {
  return {
    chave: String(row.chave ?? ""),
    descricao: String(row.descricao ?? ""),
    unidade: String(row.unidade ?? "un") as TemplateItem["unidade"],
    valorUnitCents: Number(row.valor_unit_cents ?? 0),
    quantidadeM2:
      row.quantidade_m2 === null || row.quantidade_m2 === undefined
        ? null
        : Number(row.quantidade_m2),
  };
}

async function seedTemplate(sistema: SistemaMaterial): Promise<TemplateItem[]> {
  const itens = templatesPadrao[sistema];
  const statements = itens.map((item, index) => ({
    sql: `INSERT INTO materiais_template
            (sistema, chave, descricao, unidade, valor_unit_cents, quantidade_m2, ordem)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      sistema,
      item.chave,
      item.descricao,
      item.unidade,
      item.valorUnitCents,
      item.quantidadeM2,
      index,
    ],
  }));

  if (statements.length) await getDb().batch(statements, "write");

  return itens.map((item) => ({ ...item }));
}

export async function listMaterialTemplates(): Promise<TemplatesPorSistema> {
  await ensureCrmSchema();

  const result = await getDb().execute(
    "SELECT * FROM materiais_template ORDER BY sistema, ordem, id",
  );

  const grouped: TemplatesPorSistema = {
    parede: [],
    forro: [],
    piso: [],
  };

  for (const row of result.rows) {
    if (!isSistemaMaterial(row.sistema)) continue;
    grouped[row.sistema].push(mapTemplateItem(row as Record<string, unknown>));
  }

  for (const sistema of sistemasMaterial) {
    if (grouped[sistema.id].length === 0) {
      grouped[sistema.id] = await seedTemplate(sistema.id);
    }
  }

  return grouped;
}

export async function replaceMaterialTemplate(
  sistema: SistemaMaterial,
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
              (sistema, chave, descricao, unidade, valor_unit_cents, quantidade_m2, ordem)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sistema,
        item.chave,
        item.descricao,
        item.unidade,
        item.valorUnitCents,
        item.quantidadeM2,
        index,
      ],
    })),
  ];

  await getDb().batch(statements, "write");
}

export async function resetMaterialTemplate(
  sistema: SistemaMaterial,
): Promise<TemplateItem[]> {
  await ensureCrmSchema();

  await getDb().execute({
    sql: "DELETE FROM materiais_template WHERE sistema = ?",
    args: [sistema],
  });

  return seedTemplate(sistema);
}
