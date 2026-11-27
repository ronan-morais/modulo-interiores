"use client";

import { useRef, useState } from "react";

type Arquivo = { nome: string; dados: string; tamanho: number };

const MAX_ARQUIVOS = 8;
const MAX_BYTES = 1_500_000;

async function comprimir(file: File): Promise<Arquivo | null> {
  if (file.type.startsWith("image/")) {
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (bitmap) {
      const escala = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * escala);
      canvas.height = Math.round(bitmap.height * escala);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const dados = canvas.toDataURL("image/jpeg", 0.82);
        return { nome: file.name, dados, tamanho: Math.round(dados.length * 0.75) };
      }
    }
  }

  if (file.size > MAX_BYTES) return null;
  const dados = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
  return dados ? { nome: file.name, dados, tamanho: file.size } : null;
}

export function CrmAnexoInput({ id = "nc-anexos" }: { id?: string }) {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [aviso, setAviso] = useState("");
  const [lendo, setLendo] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function escolher(lista: FileList | null) {
    if (!lista?.length) return;
    setLendo(true);
    setAviso("");
    const novos: Arquivo[] = [];
    for (const file of Array.from(lista).slice(0, MAX_ARQUIVOS - arquivos.length)) {
      const item = await comprimir(file);
      if (item) novos.push(item);
      else setAviso("Arquivo grande demais (limite 1,5 MB por foto).");
    }
    setArquivos((atual) => [...atual, ...novos].slice(0, MAX_ARQUIVOS));
    setLendo(false);
    if (input.current) input.current.value = "";
  }

  function remover(nome: string) {
    setArquivos((atual) => atual.filter((a) => a.nome !== nome));
  }

  return (
    <div className="crm-anexos">
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/*,application/pdf"
        multiple
        hidden
        onChange={(event) => void escolher(event.target.files)}
      />
      <input type="hidden" name="anexos" value={JSON.stringify(arquivos)} />

      <div className="crm-anexos-acoes">
        <label className="btn btn-outline btn-sm" htmlFor={id}>
          {lendo ? "Lendo..." : "Anexar fotos ou planta"}
        </label>
        <span className="crm-hint">
          {arquivos.length}/{MAX_ARQUIVOS} · fotos são reduzidas automaticamente
        </span>
      </div>

      {aviso ? (
        <p className="crm-alert" role="alert">{aviso}</p>
      ) : null}

      {arquivos.length ? (
        <ul className="crm-anexos-lista">
          {arquivos.map((arquivo) => (
            <li key={arquivo.nome + arquivo.tamanho}>
              <img src={arquivo.dados} alt={arquivo.nome} />
              <button type="button" onClick={() => remover(arquivo.nome)} aria-label={`Remover ${arquivo.nome}`}>
                x
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
