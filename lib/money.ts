const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(cents: number): string {
  return brlFormatter.format(cents / 100);
}

/** Aceita "1.500,00", "1500,00", "1.500" e "1500.50". */
export function parseAmountToCents(raw: string): number | null {
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return null;

  let normalized = cleaned;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;

  return Math.round(value * 100);
}

/** Aceita "2,5" e "2.5". */
export function parseQuantity(raw: string): number {
  const cleaned = raw.replace(/[^\d,.]/g, "").trim();
  const value = Number(cleaned.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : 0;
}
