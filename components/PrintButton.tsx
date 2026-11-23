"use client";

import { Icon } from "@/components/Icon";

export function PrintButton() {
  return (
    <button
      className="btn btn-outline btn-sm"
      type="button"
      onClick={() => window.print()}
    >
      <Icon name="printer" size={15} />
      Imprimir / salvar PDF
    </button>
  );
}
