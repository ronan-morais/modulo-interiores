"use client";

import { useState } from "react";

const sistemas = [
  { id: "parede", nome: "Parede em drywall", material: 95, mao: 110 },
  { id: "forro", nome: "Forro em drywall", material: 85, mao: 95 },
  { id: "sanca", nome: "Sanca e rebaixamento", material: 120, mao: 140 },
  { id: "vinilico", nome: "Piso vinílico", material: 110, mao: 60 },
  { id: "modular", nome: "Piso modular", material: 95, mao: 55 },
] as const;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function toNumber(value: string): number {
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function CrmCalculator() {
  const [sistemaId, setSistemaId] = useState<string>(sistemas[0].id);
  const [area, setArea] = useState("20");
  const [material, setMaterial] = useState(String(sistemas[0].material));
  const [mao, setMao] = useState(String(sistemas[0].mao));
  const [margem, setMargem] = useState("25");

  const areaM2 = toNumber(area);
  const custoMaterial = areaM2 * toNumber(material);
  const custoMao = areaM2 * toNumber(mao);
  const custo = custoMaterial + custoMao;
  const preco = custo * (1 + toNumber(margem) / 100);

  return (
    <div className="crm-detail-grid">
      <section className="crm-panel" aria-labelledby="calc-title">
        <h2 id="calc-title">Dados da obra</h2>

        <div className="field-group">
          <label className="field-label" htmlFor="calc-sistema">
            Sistema
          </label>
          <select
            className="select"
            id="calc-sistema"
            value={sistemaId}
            onChange={(event) => {
              const next = sistemas.find(
                (item) => item.id === event.target.value,
              );
              if (!next) return;
              setSistemaId(next.id);
              setMaterial(String(next.material));
              setMao(String(next.mao));
            }}
          >
            {sistemas.map((sistema) => (
              <option key={sistema.id} value={sistema.id}>
                {sistema.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="calc-area">
              Área (m²)
            </label>
            <input
              className="input"
              id="calc-area"
              type="number"
              min={0}
              step={0.5}
              inputMode="decimal"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="calc-margem">
              Margem (%)
            </label>
            <input
              className="input"
              id="calc-margem"
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              value={margem}
              onChange={(event) => setMargem(event.target.value)}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="calc-material">
              Material (R$/m²)
            </label>
            <input
              className="input"
              id="calc-material"
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
            />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="calc-mao">
              Mão de obra (R$/m²)
            </label>
            <input
              className="input"
              id="calc-mao"
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              value={mao}
              onChange={(event) => setMao(event.target.value)}
            />
          </div>
        </div>

        <p className="crm-calc-note">
          Valores de referência por sistema. Ajuste material e mão de obra
          conforme a obra antes de fechar a proposta.
        </p>
      </section>

      <aside className="crm-panel" aria-label="Estimativa">
        <h2>Estimativa</h2>
        <dl className="crm-calc-rows" aria-live="polite">
          <div>
            <dt>Material</dt>
            <dd>{brlFormatter.format(custoMaterial)}</dd>
          </div>
          <div>
            <dt>Mão de obra</dt>
            <dd>{brlFormatter.format(custoMao)}</dd>
          </div>
          <div>
            <dt>Custo total</dt>
            <dd>{brlFormatter.format(custo)}</dd>
          </div>
          <div>
            <dt>Preço sugerido</dt>
            <dd>{brlFormatter.format(preco)}</dd>
          </div>
        </dl>

        <div className="crm-calc-total">
          <span>Preço por m²</span>
          <strong>
            {areaM2 > 0 ? brlFormatter.format(preco / areaM2) : "—"}
          </strong>
        </div>
      </aside>
    </div>
  );
}
