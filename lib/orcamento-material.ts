export const unidades = ["un", "pç", "m", "m²", "m³", "kg", "cx"] as const;

export type OrcamentoUnidade = (typeof unidades)[number];

export type OrcamentoItem = {
  descricao: string;
  quantidade: number;
  unidade: OrcamentoUnidade;
  valorUnitCents: number;
  freteCents: number;
  descontoCents: number;
};

export type OrcamentoTotais = {
  subtotalCents: number;
  freteCents: number;
  descontoCents: number;
  totalCents: number;
};

export function isUnidade(value: unknown): value is OrcamentoUnidade {
  return unidades.some((unidade) => unidade === value);
}

export function lineSubtotalCents(item: OrcamentoItem): number {
  return Math.round(item.quantidade * item.valorUnitCents);
}

export function lineTotalCents(item: OrcamentoItem): number {
  return Math.max(
    0,
    lineSubtotalCents(item) + item.freteCents - item.descontoCents,
  );
}

export function orcamentoTotais(itens: OrcamentoItem[]): OrcamentoTotais {
  let subtotalCents = 0;
  let freteCents = 0;
  let descontoCents = 0;

  for (const item of itens) {
    subtotalCents += lineSubtotalCents(item);
    freteCents += item.freteCents;
    descontoCents += item.descontoCents;
  }

  return {
    subtotalCents,
    freteCents,
    descontoCents,
    totalCents: Math.max(
      0,
      subtotalCents + freteCents - descontoCents,
    ),
  };
}

/** Aceita apenas linhas completas; descarta o que não dá para cobrar. */
export function sanitizeItens(value: unknown): OrcamentoItem[] {
  if (!Array.isArray(value)) return [];

  const itens: OrcamentoItem[] = [];

  for (const entry of value.slice(0, 60)) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;

    const descricao = String(row.descricao ?? "")
      .trim()
      .slice(0, 120);
    const quantidade = Number(row.quantidade);
    const valorUnitCents = Math.round(Number(row.valorUnitCents));
    const freteCents = Math.max(0, Math.round(Number(row.freteCents ?? 0)));
    const descontoCents = Math.max(
      0,
      Math.round(Number(row.descontoCents ?? 0)),
    );

    const valido =
      descricao.length > 0 &&
      Number.isFinite(quantidade) &&
      quantidade > 0 &&
      quantidade <= 9999 &&
      Number.isFinite(valorUnitCents) &&
      valorUnitCents > 0 &&
      Number.isFinite(freteCents) &&
      Number.isFinite(descontoCents);

    if (!valido) continue;

    itens.push({
      descricao,
      quantidade,
      unidade: isUnidade(row.unidade) ? row.unidade : "un",
      valorUnitCents,
      freteCents,
      descontoCents,
    });
  }

  return itens;
}
