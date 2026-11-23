import { isUnidade, type OrcamentoUnidade } from "@/lib/orcamento-material";

export type RegraQuantidade =
  | "auto"
  | "area"
  | "comprimento"
  | "perimetro"
  | "fixo";

export type SistemaDef = {
  id: string;
  nome: string;
  medidaA: string;
  medidaB: string;
  usaVaos: boolean;
  padrao: boolean;
};

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
  regra: RegraQuantidade;
  fator: number | null;
};

export type TemplatesPorSistema = Record<string, TemplateItem[]>;

export const sistemasPadrao: SistemaDef[] = [
  {
    id: "parede",
    nome: "Parede em drywall (2 faces)",
    medidaA: "Comprimento (m)",
    medidaB: "Altura (m)",
    usaVaos: true,
    padrao: true,
  },
  {
    id: "forro",
    nome: "Forro em drywall",
    medidaA: "Largura (m)",
    medidaB: "Comprimento (m)",
    usaVaos: true,
    padrao: true,
  },
  {
    id: "piso",
    nome: "Piso vinílico / modular",
    medidaA: "Largura (m)",
    medidaB: "Comprimento (m)",
    usaVaos: false,
    padrao: true,
  },
];

const PLACA_M2 = 1.8 * 1.2;
const ESPACO_MONTANTE_M = 0.4;

const regrasPadrao: Record<string, string> = {
  placa: "Área × 2 faces ÷ 2,16 m² por placa, com perda.",
  montante: "Comprimento ÷ 0,40 m + 1 barra de 3 m.",
  guia: "Comprimento × 2 (piso e teto) ÷ 3 m por barra.",
  parafuso: "Área × 30 parafusos/m², com perda.",
  fita: "Área × 3 m de junta/m² ÷ 90 m por rolo.",
  massa: "Área ÷ 10 m² por saco de 20 kg, com perda.",
  la: "Área da parede, sem perda.",
  perfil: "Área ÷ 2,4 m² por barra de 3 m, com perda.",
  piso: "Área com perda.",
  manta: "Área × 1,05 (sobreposição).",
  rodape: "Perímetro do ambiente em metros.",
};

const regrasForro: Record<string, string> = {
  placa: "Área ÷ 2,16 m² por placa, com perda.",
  perfil: "Área ÷ 2,4 m² por barra de 3 m, com perda.",
  guia: "Perímetro ÷ 3 m por barra.",
  parafuso: "Área × 25 parafusos/m², com perda.",
  fita: "Área × 1,5 m de junta/m² ÷ 90 m por rolo.",
  massa: "Área ÷ 12 m² por saco de 20 kg, com perda.",
};

export const templatesPadrao: TemplatesPorSistema = {
  parede: [
    {
      chave: "placa",
      descricao: "Placa de drywall 1,80 × 1,20",
      unidade: "un",
      valorUnitCents: 4290,
      regra: "auto",
      fator: null,
    },
    {
      chave: "montante",
      descricao: "Montante 48 mm (barra 3 m)",
      unidade: "un",
      valorUnitCents: 1850,
      regra: "auto",
      fator: null,
    },
    {
      chave: "guia",
      descricao: "Guia 48 mm (barra 3 m)",
      unidade: "un",
      valorUnitCents: 1590,
      regra: "auto",
      fator: null,
    },
    {
      chave: "parafuso",
      descricao: "Parafuso GN25 para drywall",
      unidade: "un",
      valorUnitCents: 12,
      regra: "auto",
      fator: null,
    },
    {
      chave: "fita",
      descricao: "Fita para junta (rolo 90 m)",
      unidade: "un",
      valorUnitCents: 2850,
      regra: "auto",
      fator: null,
    },
    {
      chave: "massa",
      descricao: "Massa para junta 20 kg",
      unidade: "un",
      valorUnitCents: 6200,
      regra: "auto",
      fator: null,
    },
    {
      chave: "la",
      descricao: "Lã de vidro 50 mm",
      unidade: "m²",
      valorUnitCents: 1250,
      regra: "auto",
      fator: null,
    },
  ],
  forro: [
    {
      chave: "placa",
      descricao: "Placa de drywall 1,80 × 1,20",
      unidade: "un",
      valorUnitCents: 4290,
      regra: "auto",
      fator: null,
    },
    {
      chave: "perfil",
      descricao: "Perfil metálico (barra 3 m)",
      unidade: "un",
      valorUnitCents: 2200,
      regra: "auto",
      fator: null,
    },
    {
      chave: "guia",
      descricao: "Guia 48 mm (barra 3 m)",
      unidade: "un",
      valorUnitCents: 1590,
      regra: "auto",
      fator: null,
    },
    {
      chave: "parafuso",
      descricao: "Parafuso GN25 para drywall",
      unidade: "un",
      valorUnitCents: 12,
      regra: "auto",
      fator: null,
    },
    {
      chave: "fita",
      descricao: "Fita para junta (rolo 90 m)",
      unidade: "un",
      valorUnitCents: 2850,
      regra: "auto",
      fator: null,
    },
    {
      chave: "massa",
      descricao: "Massa para junta 20 kg",
      unidade: "un",
      valorUnitCents: 6200,
      regra: "auto",
      fator: null,
    },
  ],
  piso: [
    {
      chave: "piso",
      descricao: "Piso vinílico / modular",
      unidade: "m²",
      valorUnitCents: 9500,
      regra: "auto",
      fator: null,
    },
    {
      chave: "manta",
      descricao: "Manta / adesivo para piso",
      unidade: "m²",
      valorUnitCents: 950,
      regra: "auto",
      fator: null,
    },
    {
      chave: "rodape",
      descricao: "Rodapé",
      unidade: "m",
      valorUnitCents: 1400,
      regra: "auto",
      fator: null,
    },
  ],
};

export function isRegraQuantidade(value: unknown): value is RegraQuantidade {
  return (
    value === "auto" ||
    value === "area" ||
    value === "comprimento" ||
    value === "perimetro" ||
    value === "fixo"
  );
}

export function sistemaPorId(
  sistemas: SistemaDef[],
  id: string,
): SistemaDef {
  return sistemas.find((sistema) => sistema.id === id) ?? sistemas[0];
}

function arredondar(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Evita 11,0000000002 virar 12 peças por erro de ponto flutuante. */
function pecas(value: number): number {
  return Math.max(0, Math.ceil(value - 1e-9));
}

export function areaDoProjeto(
  sistema: SistemaDef,
  medidas: MedidasArea,
): number {
  const bruto = Math.max(0, medidas.medidaA * medidas.medidaB);
  const desconto = sistema.usaVaos ? Math.max(0, medidas.vaos) : 0;
  return arredondar(Math.max(0, bruto - desconto));
}

function perimetro(medidas: MedidasArea): number {
  return 2 * (medidas.medidaA + medidas.medidaB);
}

function rotuloCurto(label: string): string {
  return label.replace(/\s*\(m\)\s*$/i, "").toLowerCase();
}

export function formulaArea(sistema: SistemaDef): string {
  const base = `Área = ${rotuloCurto(sistema.medidaA)} × ${rotuloCurto(sistema.medidaB)}`;
  return sistema.usaVaos ? `${base} − vãos.` : `${base}.`;
}

function quantidadeAuto(
  chave: string,
  sistema: SistemaDef,
  medidas: MedidasArea,
): number {
  const area = areaDoProjeto(sistema, medidas);
  const perda = 1 + Math.max(0, medidas.perdaPercent) / 100;

  switch (chave) {
    case "placa":
      return sistema.id === "parede"
        ? pecas((area * 2 * perda) / PLACA_M2)
        : pecas((area * perda) / PLACA_M2);
    case "montante":
      return pecas(medidas.medidaA / ESPACO_MONTANTE_M) + 1;
    case "guia":
      return sistema.id === "forro"
        ? pecas(perimetro(medidas) / 3)
        : pecas((medidas.medidaA * 2) / 3);
    case "perfil":
      return pecas((area * perda) / 2.4);
    case "parafuso":
      return pecas(area * (sistema.id === "forro" ? 25 : 30) * perda);
    case "fita":
      return pecas((area * (sistema.id === "forro" ? 1.5 : 3)) / 90);
    case "massa":
      return pecas((area * perda) / (sistema.id === "forro" ? 12 : 10));
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

function baseDaRegra(
  regra: RegraQuantidade,
  sistema: SistemaDef,
  medidas: MedidasArea,
): number {
  switch (regra) {
    case "area":
      return areaDoProjeto(sistema, medidas);
    case "comprimento":
      return Math.max(0, medidas.medidaA);
    case "perimetro":
      return perimetro(medidas);
    case "fixo":
      return 1;
    default:
      return 0;
  }
}

export function quantidadeDoItem(
  item: TemplateItem,
  sistema: SistemaDef,
  medidas: MedidasArea,
): number {
  if (item.regra === "auto") {
    return quantidadeAuto(item.chave, sistema, medidas);
  }

  const fator = Math.max(0, item.fator ?? 0);
  const bruto = baseDaRegra(item.regra, sistema, medidas) * fator;

  return item.unidade === "un" ? pecas(bruto) : arredondar(bruto);
}

export function descricaoRegra(
  item: TemplateItem,
  sistema: SistemaDef,
): string {
  if (item.regra === "auto") {
    const map = sistema.id === "forro" ? regrasForro : regrasPadrao;
    return (
      map[item.chave] ??
      "Regra do sistema; ajuste a quantidade manualmente se precisar."
    );
  }

  const fator = String(Number((item.fator ?? 0).toFixed(4))).replace(".", ",");

  if (item.regra === "area") {
    return `Área × ${fator} por m², sem perda.`;
  }
  if (item.regra === "comprimento") {
    return `${rotuloCurto(sistema.medidaA)} × ${fator}.`;
  }
  if (item.regra === "perimetro") {
    return `Perímetro × ${fator}.`;
  }
  return `Quantidade fixa: ${fator}.`;
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

    const regra = isRegraQuantidade(row.regra) ? row.regra : "auto";
    const fatorRaw =
      row.fator === null || row.fator === undefined ? null : Number(row.fator);
    const fator =
      fatorRaw !== null && Number.isFinite(fatorRaw) && fatorRaw >= 0
        ? fatorRaw
        : regra === "auto"
          ? null
          : 0;

    let chave = String(row.chave ?? "").trim().slice(0, 40);
    if (!chave || chaves.has(chave)) chave = `item-${itens.length + 1}`;
    chaves.add(chave);

    itens.push({
      chave,
      descricao,
      unidade: isUnidade(row.unidade) ? row.unidade : "un",
      valorUnitCents,
      regra,
      fator,
    });
  }

  return itens;
}
