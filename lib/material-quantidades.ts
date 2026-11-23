import type { OrcamentoUnidade } from "@/lib/orcamento-material";

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

export type MaterialCalculado = {
  chave: string;
  descricao: string;
  unidade: OrcamentoUnidade;
  quantidade: number;
  valorUnitCents: number;
};

const PLACA_M2 = 1.8 * 1.2;
const ESPACO_MONTANTE_M = 0.4;

function arredondar(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Evita 11,0000000002 virar 12 peças por erro de ponto flutuante. */
function pecas(value: number): number {
  return Math.max(0, Math.ceil(value - 1e-9));
}

/**
 * Quantidades de referência para obra a seco, já com a perda informada.
 * Parede: duas faces, montantes a cada 40 cm, guias no piso e no teto.
 * Forro: placas em uma face, perfis a cada ~2,4 m² e guias no perímetro.
 * Piso: material e manta sobre a área, rodapé no perímetro.
 */
export function calcularMateriais(
  sistema: SistemaMaterial,
  medidas: MedidasArea,
): { areaM2: number; itens: MaterialCalculado[] } {
  const bruto = Math.max(0, medidas.medidaA * medidas.medidaB);
  const areaM2 = arredondar(Math.max(0, bruto - Math.max(0, medidas.vaos)));
  const perda = 1 + Math.max(0, medidas.perdaPercent) / 100;
  const perimetro = 2 * (medidas.medidaA + medidas.medidaB);

  if (areaM2 <= 0) return { areaM2: 0, itens: [] };

  if (sistema === "parede") {
    return {
      areaM2,
      itens: [
        {
          chave: "placa",
          descricao: "Placa de drywall 1,80 × 1,20",
          unidade: "un",
          quantidade: pecas((areaM2 * 2 * perda) / PLACA_M2),
          valorUnitCents: 4290,
        },
        {
          chave: "montante",
          descricao: "Montante 48 mm (barra 3 m)",
          unidade: "un",
          quantidade:
            pecas(medidas.medidaA / ESPACO_MONTANTE_M) + 1,
          valorUnitCents: 1850,
        },
        {
          chave: "guia",
          descricao: "Guia 48 mm (barra 3 m)",
          unidade: "un",
          quantidade: pecas((medidas.medidaA * 2) / 3),
          valorUnitCents: 1590,
        },
        {
          chave: "parafuso",
          descricao: "Parafuso GN25 para drywall",
          unidade: "un",
          quantidade: pecas(areaM2 * 30 * perda),
          valorUnitCents: 12,
        },
        {
          chave: "fita",
          descricao: "Fita para junta (rolo 90 m)",
          unidade: "un",
          quantidade: pecas((areaM2 * 3) / 90),
          valorUnitCents: 2850,
        },
        {
          chave: "massa",
          descricao: "Massa para junta 20 kg",
          unidade: "un",
          quantidade: pecas((areaM2 * perda) / 10),
          valorUnitCents: 6200,
        },
        {
          chave: "la",
          descricao: "Lã de vidro 50 mm",
          unidade: "m²",
          quantidade: arredondar(areaM2),
          valorUnitCents: 1250,
        },
      ],
    };
  }

  if (sistema === "forro") {
    return {
      areaM2,
      itens: [
        {
          chave: "placa",
          descricao: "Placa de drywall 1,80 × 1,20",
          unidade: "un",
          quantidade: pecas((areaM2 * perda) / PLACA_M2),
          valorUnitCents: 4290,
        },
        {
          chave: "perfil",
          descricao: "Perfil metálico (barra 3 m)",
          unidade: "un",
          quantidade: pecas((areaM2 * perda) / 2.4),
          valorUnitCents: 2200,
        },
        {
          chave: "guia",
          descricao: "Guia 48 mm (barra 3 m)",
          unidade: "un",
          quantidade: pecas(perimetro / 3),
          valorUnitCents: 1590,
        },
        {
          chave: "parafuso",
          descricao: "Parafuso GN25 para drywall",
          unidade: "un",
          quantidade: pecas(areaM2 * 25 * perda),
          valorUnitCents: 12,
        },
        {
          chave: "fita",
          descricao: "Fita para junta (rolo 90 m)",
          unidade: "un",
          quantidade: pecas((areaM2 * 1.5) / 90),
          valorUnitCents: 2850,
        },
        {
          chave: "massa",
          descricao: "Massa para junta 20 kg",
          unidade: "un",
          quantidade: pecas((areaM2 * perda) / 12),
          valorUnitCents: 6200,
        },
      ],
    };
  }

  return {
    areaM2,
    itens: [
      {
        chave: "piso",
        descricao: "Piso vinílico / modular",
        unidade: "m²",
        quantidade: arredondar(areaM2 * perda),
        valorUnitCents: 9500,
      },
      {
        chave: "manta",
        descricao: "Manta / adesivo para piso",
        unidade: "m²",
        quantidade: arredondar(areaM2 * 1.05),
        valorUnitCents: 950,
      },
      {
        chave: "rodape",
        descricao: "Rodapé",
        unidade: "m",
        quantidade: arredondar(perimetro),
        valorUnitCents: 1400,
      },
    ],
  };
}
