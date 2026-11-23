import { isUnidade, type OrcamentoUnidade } from "@/lib/orcamento-material";

export const sistemasMaterial = [
  { id: "parede", nome: "Parede em drywall (2 faces)" },
  { id: "forro", nome: "Forro em drywall" },
  { id: "piso", nome: "Piso vinílico / modular" },
] as const;

export type SistemaMaterial = (typeof sistemasMaterial)[number]["id"];

export type MedidasArea = {
  medidaA: number;
  medidaB: number;
  vaos: number;
  perdaPercent: number;
};

export type TemplateItem = {
  chave: string;
  descricao: string;
  unidade: OrcamentoUnidade;
  valorUnitCents: number;
  /** Quantidade por m²; null usa a regra padrão do sistema. */
  quantidadeM2: number | null;
};

export type TemplatesPorSistema = Record<SistemaMaterial, TemplateItem[]>;

const PLACA_M2 = 1.8 * 1.2;
const ESPACO_MONTANTE_M = 0.4;

export const templatesPadrao: TemplatesPorSistema = {
  parede: [
    {
      chave: "placa",
      descricao: "Placa de drywall 1,80 × 1,20",
      unidade: "un",
      valorUnitCents: 4290,
      quantidadeM2: null,
    },
    {
      chave: "montante",
      descricao: "Montante 48 mm (barra 3 m)",
      unidade: "un",
      valorUnitCents: 1850,
      quantidadeM2: null,
    },
    {
      chave: "guia",
      descricao: "Guia 48 mm (barra 3 m)",
      unidade: "un",
      valorUnitCents: 1590,
      quantidadeM2: null,
    },
    {
      chave: "parafuso",
      descricao: "Parafuso GN25 para drywall",
      unidade: "un",
      valorUnitCents: 12,
      quantidadeM2: null,
    },
    {
      chave: "fita",
      descricao: "Fita para junta (rolo 90 m)",
      unidade: "un",
      valorUnitCents: 2850,
      quantidadeM2: null,
    },
    {
      chave: "massa",
      descricao: "Massa para junta 20 kg",
      unidade: "un",
      valorUnitCents: 6200,
      quantidadeM2: null,
    },
    {
      chave: "la",
      descricao: "Lã de vidro 50 mm",
      unidade: "m²",
      valorUnitCents: 1250,
      quantidadeM2: null,
    },
  ],
  forro: [
    {
      chave: "placa",
      descricao: "Placa de drywall 1,80 × 1,20",
      unidade: "un",
      valorUnitCents: 4290,
      quantidadeM2: null,
    },
    {
      chave: "perfil",
      descricao: "Perfil metálico (barra 3 m)",
      unidade: "un",
      valorUnitCents: 2200,
      quantidadeM2: null,
    },
    {
      chave: "guia",
      descricao: "Guia 48 mm (barra 3 m)",
      unidade: "un",
      valorUnitCents: 1590,
      quantidadeM2: null,
    },
    {
      chave: "parafuso",
      descricao: "Parafuso GN25 para drywall",
      unidade: "un",
      valorUnitCents: 12,
      quantidadeM2: null,
    },
    {
      chave: "fita",
      descricao: "Fita para junta (rolo 90 m)",
      unidade: "un",
      valorUnitCents: 2850,
      quantidadeM2: null,
    },
    {
      chave: "massa",
      descricao: "Massa para junta 20 kg",
      unidade: "un",
      valorUnitCents: 6200,
      quantidadeM2: null,
    },
  ],
  piso: [
    {
      chave: "piso",
      descricao: "Piso vinílico / modular",
      unidade: "m²",
      valorUnitCents: 9500,
      quantidadeM2: null,
    },
    {
      chave: "manta",
      descricao: "Manta / adesivo para piso",
      unidade: "m²",
      valorUnitCents: 950,
      quantidadeM2: null,
    },
    {
      chave: "rodape",
      descricao: "Rodapé",
      unidade: "m",
      valorUnitCents: 1400,
      quantidadeM2: null,
    },
  ],
};

export function isSistemaMaterial(value: unknown): value is SistemaMaterial {
  return sistemasMaterial.some((sistema) => sistema.id === value);
}

function arredondar(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Evita 11,0000000002 virar 12 peças por erro de ponto flutuante. */
function pecas(value: number): number {
  return Math.max(0, Math.ceil(value - 1e-9));
}

export function areaDoProjeto(
  sistema: SistemaMaterial,
  medidas: MedidasArea,
): number {
  const bruto = Math.max(0, medidas.medidaA * medidas.medidaB);
  const desconto = sistema === "piso" ? 0 : Math.max(0, medidas.vaos);
  return arredondar(Math.max(0, bruto - desconto));
}

function perimetro(medidas: MedidasArea): number {
  return 2 * (medidas.medidaA + medidas.medidaB);
}

function quantidadeRegra(
  chave: string,
  sistema: SistemaMaterial,
  medidas: MedidasArea,
): number {
  const area = areaDoProjeto(sistema, medidas);
  const perda = 1 + Math.max(0, medidas.perdaPercent) / 100;

  switch (chave) {
    case "placa":
      return sistema === "parede"
        ? pecas((area * 2 * perda) / PLACA_M2)
        : pecas((area * perda) / PLACA_M2);
    case "montante":
      return pecas(medidas.medidaA / ESPACO_MONTANTE_M) + 1;
    case "guia":
      return sistema === "forro"
        ? pecas(perimetro(medidas) / 3)
        : pecas((medidas.medidaA * 2) / 3);
    case "perfil":
      return pecas((area * perda) / 2.4);
    case "parafuso":
      return pecas(area * (sistema === "forro" ? 25 : 30) * perda);
    case "fita":
      return pecas((area * (sistema === "forro" ? 1.5 : 3)) / 90);
    case "massa":
      return pecas((area * perda) / (sistema === "forro" ? 12 : 10));
    case "la":
      return arredondar(area);
    case "piso":
      return arredondar(area * perda);
    case "manta":
      return arredondar(area * 1.05);
    case "rodape":
      return arredondar(perimetro(medidas));
    default:
      return 0;
  }
}

export function quantidadeDoItem(
  item: TemplateItem,
  sistema: SistemaMaterial,
  medidas: MedidasArea,
): number {
  if (item.quantidadeM2 !== null) {
    const bruto = areaDoProjeto(sistema, medidas) * item.quantidadeM2;
    return item.unidade === "un" ? pecas(bruto) : arredondar(bruto);
  }

  return quantidadeRegra(item.chave, sistema, medidas);
}

/** Aceita apenas itens completos vindos do editor de template. */
export function sanitizeTemplateItens(value: unknown): TemplateItem[] {
  if (!Array.isArray(value)) return [];

  const itens: TemplateItem[] = [];
  const chaves = new Set<string>();

  for (const entry of value.slice(0, 40)) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;

    const descricao = String(row.descricao ?? "")
      .trim()
      .slice(0, 120);
    if (!descricao) continue;

    const valorUnitCents = Math.max(
      0,
      Math.round(Number(row.valorUnitCents ?? 0)),
    );
    if (!Number.isFinite(valorUnitCents)) continue;

    const quantidadeM2Raw =
      row.quantidadeM2 === null || row.quantidadeM2 === undefined
        ? null
        : Number(row.quantidadeM2);
    const quantidadeM2 =
      quantidadeM2Raw !== null &&
      Number.isFinite(quantidadeM2Raw) &&
      quantidadeM2Raw >= 0 &&
      quantidadeM2Raw <= 1000
        ? quantidadeM2Raw
        : null;

    let chave = String(row.chave ?? "").trim().slice(0, 40);
    if (!chave || chaves.has(chave)) chave = `item-${itens.length + 1}`;
    chaves.add(chave);

    itens.push({
      chave,
      descricao,
      unidade: isUnidade(row.unidade) ? row.unidade : "un",
      valorUnitCents,
      quantidadeM2,
    });
  }

  return itens;
}

const regrasPorSistema: Record<SistemaMaterial, Record<string, string>> = {
  parede: {
    placa: "Área × 2 faces ÷ 2,16 m² por placa, com perda.",
    montante: "Comprimento ÷ 0,40 m + 1 barra de 3 m.",
    guia: "Comprimento × 2 (piso e teto) ÷ 3 m por barra.",
    parafuso: "Área × 30 parafusos/m², com perda.",
    fita: "Área × 3 m de junta/m² ÷ 90 m por rolo.",
    massa: "Área ÷ 10 m² por saco de 20 kg, com perda.",
    la: "Área da parede, sem perda.",
  },
  forro: {
    placa: "Área ÷ 2,16 m² por placa, com perda.",
    perfil: "Área ÷ 2,4 m² por barra de 3 m, com perda.",
    guia: "Perímetro ÷ 3 m por barra.",
    parafuso: "Área × 25 parafusos/m², com perda.",
    fita: "Área × 1,5 m de junta/m² ÷ 90 m por rolo.",
    massa: "Área ÷ 12 m² por saco de 20 kg, com perda.",
  },
  piso: {
    piso: "Área com perda.",
    manta: "Área × 1,05 (sobreposição).",
    rodape: "Perímetro do ambiente em metros.",
  },
};

export function formulaArea(sistema: SistemaMaterial): string {
  if (sistema === "parede") {
    return "Área = comprimento × altura − vãos.";
  }
  if (sistema === "forro") {
    return "Área = largura × comprimento − vãos.";
  }
  return "Área = largura × comprimento.";
}

export function descricaoRegra(
  chave: string,
  sistema: SistemaMaterial,
  quantidadeM2: number | null,
): string {
  if (quantidadeM2 !== null) {
    return `Coeficiente informado: ${String(Number(quantidadeM2.toFixed(4))).replace(".", ",")} por m².`;
  }

  return (
    regrasPorSistema[sistema][chave] ??
    "Quantidade calculada pela área; ajuste manualmente se precisar."
  );
}
