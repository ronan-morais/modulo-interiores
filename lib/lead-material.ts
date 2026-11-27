import type { OrcamentoItem } from "@/lib/orcamento-material";
import {
  quantidadeDoItem,
  sistemaPorId,
  sistemasPadrao,
  templatesPadrao,
  type MedidasArea,
  type SistemaDef,
  type TemplatesPorSistema,
} from "@/lib/material-quantidades";

/**
 * Ligação entre o serviço que o cliente pediu e o sistema de material da
 * calculadora. Toda a conta (coeficiente por m², barra, rolo, perda) vem de
 * lib/material-quantidades — a mesma engine dos templates do CRM.
 */

export const SERVICO_POR_ID: Record<string, string> = {
  "forro-placa-gesso": "forro",
  "paredes-drywall": "parede",
  "divisorias-drywall": "parede",
  "forro-pvc": "forro_pvc",
  "forro-modular": "forro_modular",
  "piso-vinilico": "piso_vinilico",
  "piso-modular": "piso_modular",
  "moveis-drywall": "movel",
};

/** Perda técnica por sistema (a mesma que a norma de aplicação pede). */
export const PERDA_POR_SISTEMA: Record<string, number> = {
  parede: 10,
  forro: 10,
  forro_pvc: 10,
  forro_modular: 5,
  piso: 7,
  piso_vinilico: 7,
  piso_modular: 5,
  movel: 12,
};

/** Ambiente aproximado por quadrado: A = B = √área. */
export function medidasDaArea(area: number, sistemaId: string): MedidasArea {
  const lado = Math.sqrt(Math.max(area, 0.01));
  return {
    medidaA: lado,
    medidaB: lado,
    vaos: 0,
    perdaPercent: PERDA_POR_SISTEMA[sistemaId] ?? 10,
  };
}

/** Itens de material de um serviço, usando o template do sistema. */
export function itensDoServico(
  servicoId: string,
  area: number,
  templates: TemplatesPorSistema = templatesPadrao,
): OrcamentoItem[] {
  const sistemaId = SERVICO_POR_ID[servicoId];
  if (!sistemaId) return [];
  const sistema: SistemaDef = sistemaPorId(sistemasPadrao, sistemaId);
  const linhas = templates[sistemaId] ?? templatesPadrao[sistemaId] ?? [];
  if (linhas.length === 0 || area <= 0) return [];
  const medidas = medidasDaArea(area, sistemaId);

  return linhas.map((linha) => ({
    descricao: linha.descricao,
    unidade: linha.unidade,
    quantidade: quantidadeDoItem(linha, sistema, medidas),
    valorUnitCents: linha.valorUnitCents,
    freteCents: 0,
    descontoCents: 0,
  }));
}

export function areaPorServico(areaTotal: number, quantidade: number): number {
  if (quantidade <= 0) return 0;
  return Math.round((areaTotal / quantidade) * 100) / 100;
}
