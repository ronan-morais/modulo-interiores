import base from "@/lib/coeficientes.json";
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
  const lado = Math.sqrt(Math.max(area, 0.01));

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
    // forro de PVC
    case "regua_pvc":
      return pecas((area * perda) / 1.19);
    case "trilho_pvc":
      return pecas((perimetro(medidas)) / 3);
    case "montante_pvc": {
      const linhas = pecas(lado / 1.0) + 1;
      return pecas((linhas * lado) / 3);
    }
    case "arame":
      return arredondar(area * 0.1);
    // forro modular
    case "placa_mineral":
      return pecas((area * perda) / 0.3906);
    case "perfil_t_principal":
      return pecas((area * 0.8) / 3.6);
    case "perfil_t_secundario":
      return pecas((area * 1.6) / 1.2);
    case "tirante":
      return pecas(area * 0.7);
    // piso vinílico
    case "piso_vinilico":
      return arredondar(area * perda);
    case "cola_piso":
      return arredondar(area * 0.3);
    case "rodape_pvc":
      return pecas(perimetro(medidas) / 2.4);
    // piso modular
    case "placa_modular":
      return pecas((area * perda) / 0.36);
    case "pedestal":
      return pecas(area * 3.2);
    case "borda_piso":
      return pecas(perimetro(medidas) / 0.6);
    // móveis de drywall (painel = área do móvel × 2,2 faces)
    case "chapa_movel":
      return pecas((area * 2.2 * perda) / 2.16);
    case "montante_movel": {
      const linhas = pecas(lado / 0.5) + 1;
      return pecas((linhas * 2.4) / 3);
    }
    case "guia_movel":
      return pecas((2 * lado + 4.8) / 3);
    case "parafuso_movel":
      return Math.max(1, pecas((area * 2.2 * 28) / 1000));
    case "massa_movel":
      return Math.max(1, pecas((area * 2.2 * 0.6) / 20));
    case "fita_movel":
      return Math.max(1, pecas((area * 2.2 * 2.2) / 150));
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

/* ---------- sistemas adicionais (mesma engine, templates por m²) ---------- */

const PRECOS = base.precos as unknown as Record<string, { preco: number }>;
const pr = (codigo: string, fallback = 0): number =>
  Math.round((PRECOS[codigo]?.preco ?? fallback) * 100);

sistemasPadrao.push(
  {
    id: "forro_pvc",
    nome: "Forro de PVC",
    medidaA: "Largura (m)",
    medidaB: "Comprimento (m)",
    usaVaos: true,
    padrao: true,
  },
  {
    id: "forro_modular",
    nome: "Forro modular",
    medidaA: "Largura (m)",
    medidaB: "Comprimento (m)",
    usaVaos: true,
    padrao: true,
  },
  {
    id: "piso_vinilico",
    nome: "Piso vinílico",
    medidaA: "Largura (m)",
    medidaB: "Comprimento (m)",
    usaVaos: false,
    padrao: true,
  },
  {
    id: "piso_modular",
    nome: "Piso modular elevado",
    medidaA: "Largura (m)",
    medidaB: "Comprimento (m)",
    usaVaos: false,
    padrao: true,
  },
  {
    id: "movel",
    nome: "Móveis de drywall",
    medidaA: "Frente (m)",
    medidaB: "Altura (m)",
    usaVaos: false,
    padrao: true,
  },
);

const templatesNovos: TemplatesPorSistema = {
  forro_pvc: [
    { chave: "regua_pvc", descricao: "Régua de PVC 20 cm × 5,95 m", unidade: "un", valorUnitCents: pr("regua_pvc", 46), regra: "auto", fator: null },
    { chave: "trilho_pvc", descricao: "Trilho / cantoneira PVC — barra 3 m", unidade: "un", valorUnitCents: pr("trilho_pvc", 22), regra: "auto", fator: null },
    { chave: "montante_pvc", descricao: "Montante 48 — barra 3 m (estrutura)", unidade: "un", valorUnitCents: pr("montante_48", 21.5), regra: "auto", fator: null },
    { chave: "arame", descricao: "Arame galvanizado nº 18", unidade: "kg", valorUnitCents: pr("arame_18", 14), regra: "auto", fator: null },
  ],
  forro_modular: [
    { chave: "placa_mineral", descricao: "Placa mineral 625 × 625 mm", unidade: "un", valorUnitCents: pr("placa_mineral", 32), regra: "auto", fator: null },
    { chave: "perfil_t_principal", descricao: "Perfil T principal — barra 3,60 m", unidade: "un", valorUnitCents: pr("perfil_t_principal", 36), regra: "auto", fator: null },
    { chave: "perfil_t_secundario", descricao: "Perfil T secundário — barra 1,20 m", unidade: "un", valorUnitCents: pr("perfil_t_secundario", 11), regra: "auto", fator: null },
    { chave: "tirante", descricao: "Tirante / arame de sustentação", unidade: "un", valorUnitCents: pr("tirante", 8.5), regra: "auto", fator: null },
  ],
};

Object.assign(templatesNovos, {
  piso_vinilico: [
    { chave: "piso_vinilico", descricao: "Piso vinílico em régua (m²)", unidade: "m²", valorUnitCents: pr("piso_vinilico_m2", 89), regra: "auto", fator: null },
    { chave: "cola_piso", descricao: "Cola para piso vinílico", unidade: "kg", valorUnitCents: pr("cola_piso", 28), regra: "auto", fator: null },
    { chave: "rodape_pvc", descricao: "Rodapé PVC — barra 2,40 m", unidade: "un", valorUnitCents: pr("rodape", 34), regra: "auto", fator: null },
  ],
  piso_modular: [
    { chave: "placa_modular", descricao: "Placa modular 60 × 60 cm", unidade: "un", valorUnitCents: pr("placa_modular", 46), regra: "auto", fator: null },
    { chave: "pedestal", descricao: "Pedestal regulável", unidade: "un", valorUnitCents: pr("pedestal", 9.5), regra: "auto", fator: null },
    { chave: "borda_piso", descricao: "Perfil de borda — peça 60 cm", unidade: "un", valorUnitCents: pr("canaleta_f47", 16.9), regra: "auto", fator: null },
  ],
  movel: [
    { chave: "chapa_movel", descricao: "Chapa drywall 1,80 × 1,20 × 12,5 mm", unidade: "un", valorUnitCents: pr("placa_std_125", 62), regra: "auto", fator: null },
    { chave: "montante_movel", descricao: "Montante 48 — barra 3 m", unidade: "un", valorUnitCents: pr("montante_48", 21.5), regra: "auto", fator: null },
    { chave: "guia_movel", descricao: "Guia 48 — barra 3 m", unidade: "un", valorUnitCents: pr("guia_48", 17.8), regra: "auto", fator: null },
    { chave: "parafuso_movel", descricao: "Parafuso GN25 — caixa 1.000", unidade: "cx", valorUnitCents: pr("parafuso_gn25", 92), regra: "auto", fator: null },
    { chave: "massa_movel", descricao: "Massa para juntas — saco 20 kg", unidade: "un", valorUnitCents: pr("massa_20kg", 79), regra: "auto", fator: null },
    { chave: "fita_movel", descricao: "Fita de papel — rolo 150 m", unidade: "un", valorUnitCents: pr("fita_150m", 46), regra: "auto", fator: null },
  ],
});

Object.assign(templatesPadrao, templatesNovos);
