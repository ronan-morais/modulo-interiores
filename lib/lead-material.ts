import type { OrcamentoItem } from "@/lib/orcamento-material";

/** Lista de material por serviço do site, estimada pela área do lead. */

type Servico = "forro_drywall" | "forro_pvc" | "forro_modular" | "parede_drywall" | "piso_vinilico" | "piso_modular" | "movel_drywall";

export const SERVICO_POR_ID: Record<string, Servico> = {
  "forro-placa-gesso": "forro_drywall",
  "forro-pvc": "forro_pvc",
  "forro-modular": "forro_modular",
  "divisorias-drywall": "parede_drywall",
  "piso-vinilico": "piso_vinilico",
  "piso-modular": "piso_modular",
  "moveis-drywall": "movel_drywall",
};

const REF: Record<string, number> = {
  placa: 6200, perfil_f530: 2350, canaleta: 1690, montante: 2150, guia: 1780, tabica: 2600,
  pendural: 520, gn25_cx: 9200, massa_20: 7900, fita_150: 4600, regua_pvc: 4600,
  trilho_pvc: 2200, arame_kg: 1800, vinilico_m2: 8900, cola_kg: 2800, rodape: 3400,
  placa_modular: 4600, pedestal: 950, borda: 1200,
  placa_mineral: 3200, perfil_t: 3600, tirante: 850,
};

const ceil = (n: number) => Math.max(0, Math.ceil(n - 1e-9));
const r2 = (n: number) => Math.round(n * 100) / 100;

function item(descricao: string, unidade: OrcamentoItem["unidade"], quantidade: number, valorUnitCents: number): OrcamentoItem {
  return { descricao, quantidade: r2(quantidade), unidade, valorUnitCents, freteCents: 0, descontoCents: 0 };
}

/** Dimensões estimadas a partir da área do serviço. */
export function medidas(fatia: number) {
  const lado = Math.sqrt(Math.max(fatia, 0.01));
  return { lado: r2(lado), altura: 2.8, comprimento: r2(fatia / 2.8), frente: r2(fatia) };
}

export function itensDoServico(sistema: Servico, fatia: number): OrcamentoItem[] {
  const m = medidas(fatia);
  const out: OrcamentoItem[] = [];

  if (sistema === "forro_drywall") {
    const linhas = ceil(m.lado / 0.6) + 1;
    out.push(item("Chapa drywall 1,80 × 1,20 × 12,5 mm", "un", ceil(fatia * 1.1 / 2.16), REF.placa));
    out.push(item("Perfil F530 — barra 3 m", "un", ceil(linhas * m.lado / 3), REF.perfil_f530));
    out.push(item("Canaleta perimetral F47 — barra 3 m", "un", ceil(4 * m.lado / 3), REF.canaleta));
    out.push(item("Tabica de acabamento — barra 3 m", "un", ceil(4 * m.lado / 3), REF.tabica));
    out.push(item("Pendural regulável", "un", linhas * ceil(m.lado / 1.2), REF.pendural));
    out.push(item("Parafuso GN25 — caixa 1.000", "cx", Math.max(1, ceil(fatia * 18 / 1000)), REF.gn25_cx));
    out.push(item("Massa para juntas — saco 20 kg", "un", Math.max(1, ceil(fatia * 0.5 / 20)), REF.massa_20));
    out.push(item("Fita de papel — rolo 150 m", "un", Math.max(1, ceil(fatia * 1.6 / 150)), REF.fita_150));
  }

  if (sistema === "forro_pvc") {
    const linhas = ceil(m.lado / 1.0) + 1;
    out.push(item("Régua de PVC 20 cm × 5,95 m", "un", ceil(fatia * 1.1 / 1.19), REF.regua_pvc));
    out.push(item("Trilho / cantoneira PVC — barra 3 m", "un", ceil(4 * m.lado / 3), REF.trilho_pvc));
    out.push(item("Montante 48 — barra 3 m", "un", ceil(linhas * m.lado / 3), REF.montante));
    out.push(item("Arame galvanizado nº 18", "kg", r2(fatia * 0.1), REF.arame_kg));
  }

  if (sistema === "parede_drywall") {
    const altura = 2.8;
    const nMont = ceil(m.comprimento / 0.6) + 1;
    out.push(item("Chapa drywall 1,80 × 1,20 × 12,5 mm", "un", ceil(fatia * 2 * 1.08 / 2.16), REF.placa));
    out.push(item("Montante 48 — barra 3 m", "un", ceil(nMont * altura / 3), REF.montante));
    out.push(item("Guia 48 — barra 3 m", "un", ceil(2 * m.comprimento / 3), REF.guia));
    out.push(item("Parafuso GN25 — caixa 1.000", "cx", Math.max(1, ceil(fatia * 30 / 1000)), REF.gn25_cx));
    out.push(item("Massa para juntas — saco 20 kg", "un", Math.max(1, ceil(fatia * 0.6 / 20)), REF.massa_20));
    out.push(item("Fita de papel — rolo 150 m", "un", Math.max(1, ceil(fatia * 2.2 / 150)), REF.fita_150));
  }

  if (sistema === "forro_modular") {
    out.push(item("Placa mineral 625 × 625 mm", "un", ceil(fatia * 1.05 / 0.3906), REF.placa_mineral));
    out.push(item("Perfil T principal — barra 3,60 m", "un", ceil(fatia * 0.8 / 3.6), REF.perfil_t));
    out.push(item("Perfil T secundário — barra 1,20 m", "un", ceil(fatia * 1.6 / 1.2), REF.perfil_t));
    out.push(item("Tirante / arame de sustentação", "un", ceil(fatia * 0.7), REF.tirante));
  }

  if (sistema === "piso_vinilico") {
    const perim = 4 * m.lado;
    out.push(item("Piso vinílico em régua", "m²", r2(fatia * 1.07), REF.vinilico_m2));
    out.push(item("Cola para piso vinílico", "kg", r2(fatia * 0.3), REF.cola_kg));
    out.push(item("Rodapé PVC — barra 2,40 m", "un", ceil(perim / 2.4), REF.rodape));
  }

  if (sistema === "piso_modular") {
    const perim = 4 * m.lado;
    out.push(item("Placa modular 60 × 60 cm", "un", ceil(fatia * 1.05 / 0.36), REF.placa_modular));
    out.push(item("Pedestal regulável", "un", ceil(fatia * 3.2), REF.pedestal));
    out.push(item("Perfil de borda — peça 60 cm", "un", ceil(perim / 0.6), REF.borda));
  }

  if (sistema === "movel_drywall") {
    const painel = fatia * 2.2;
    out.push(item("Chapa drywall 1,80 × 1,20 × 12,5 mm", "un", ceil(painel * 1.12 / 2.16), REF.placa));
    out.push(item("Montante 48 — barra 3 m", "un", ceil((ceil(m.lado / 0.5) + 1) * 2.4 / 3), REF.montante));
    out.push(item("Guia 48 — barra 3 m", "un", ceil((2 * m.lado + 4.8) / 3), REF.guia));
    out.push(item("Parafuso GN25 — caixa 1.000", "cx", Math.max(1, ceil(painel * 28 / 1000)), REF.gn25_cx));
    out.push(item("Massa para juntas — saco 20 kg", "un", Math.max(1, ceil(painel * 0.6 / 20)), REF.massa_20));
    out.push(item("Fita de papel — rolo 150 m", "un", Math.max(1, ceil(painel * 2.2 / 150)), REF.fita_150));
  }

  return out;
}

export function areaPorServico(areaTotal: number, quantidade: number): number {
  if (quantidade <= 0) return 0;
  return r2(areaTotal / quantidade);
}
