"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  credentialsValid,
  createLead,
  getLead,
  isAuthenticated,
  isLeadOrigem,
  isLeadStatus,
  salvarAnexos,
  removeLead,
  updateLead,
} from "@/lib/crm";
import {
  createCliente,
  removeCliente,
  updateCliente,
  type ClienteInput,
} from "@/lib/clientes";
import {
  categoriasFor,
  createLancamento,
  isLancamentoTipo,
  normalizeMonth,
  parseAmountToCents,
  removeLancamento,
} from "@/lib/financeiro";
import {
  createOrcamentoMaterial,
  removeOrcamentoMaterial,
} from "@/lib/orcamento-material-db";
import { sanitizeItens } from "@/lib/orcamento-material";
import {
  sanitizeTemplateItens,
  type SistemaDef,
  type TemplateItem,
} from "@/lib/material-quantidades";
import {
  createSistemaMaterial,
  deleteSistemaMaterial,
  replaceMaterialTemplate,
  resetMaterialTemplate,
} from "@/lib/material-templates-db";
import { SERVICO_POR_ID, itensDoServico, areaPorServico } from "@/lib/lead-material";
import { atualizarPedido, garantirClienteDoLead } from "@/lib/crm";
import { getDb } from "@/lib/db";
import { quoteOptions } from "@/lib/site";
import { salvarMaterialDoLead } from "@/lib/lead-material-db";

const attempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 6;
const BLOCK_WINDOW_MS = 10 * 60 * 1000;

async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/crm");
}

function readText(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

export async function login(formData: FormData) {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  const headerList = await headers();
  const key =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  const now = Date.now();
  const record = attempts.get(key) ?? { count: 0, blockedUntil: 0 };

  if (record.blockedUntil > now) redirect("/crm?erro=bloqueado");

  if (!credentialsValid(usuario, senha)) {
    const count = record.count + 1;
    attempts.set(
      key,
      count >= MAX_ATTEMPTS
        ? { count: 0, blockedUntil: now + BLOCK_WINDOW_MS }
        : { count, blockedUntil: 0 },
    );
    redirect("/crm?erro=1");
  }

  attempts.delete(key);

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/crm",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/crm");
}

export async function logout() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/crm",
    maxAge: 0,
  });

  redirect("/crm");
}

export async function saveLead(formData: FormData) {
  await requireSession();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) redirect("/crm");

  const status = formData.get("status");
  const notas = String(formData.get("notas") ?? "")
    .trim()
    .slice(0, 4000);

  const origem = String(formData.get("origem") ?? "").trim();
  await updateLead(
    id,
    isLeadStatus(status) ? status : "novo",
    notas,
    isLeadOrigem(origem) ? origem : undefined,
  );
  revalidatePath("/crm");
  revalidatePath(`/crm/${id}`);
  redirect(`/crm/${id}?salvo=1`);
}


export async function createLeadManual(formData: FormData) {
  await requireSession();

  const nome = readText(formData, "nome", 120);
  if (!nome) redirect("/crm?erro=lead");

  const marcados = new Set(
    formData.getAll("servicos").filter((v): v is string => typeof v === "string"),
  );
  // metragem digitada já marca o serviço (mesmo sem clicar no check)
  const servicos = quoteOptions
    .map((opcao) => ({
      id: opcao.id,
      titulo: opcao.title,
      area: Number(formData.get(`area_${opcao.id}`)) || null,
    }))
    .filter((item) => marcados.has(item.id) || item.area !== null);

  const id = await createLead({
    nome,
    whatsapp: readText(formData, "whatsapp", 40),
    email: readText(formData, "email", 160),
    servicos,
    tipoImovel: readText(formData, "tipoImovel", 20) || "Residencial",
    areaM2: Number(formData.get("areaM2")) || null,
    ambientes: Number(formData.get("ambientes")) || null,
    cidade: readText(formData, "cidade", 80),
    bairro: readText(formData, "bairro", 80),
    prazo: readText(formData, "prazo", 60),
    detalhes: readText(formData, "detalhes", 2000),
    notas: readText(formData, "notas", 4000),
    origem: isLeadOrigem(formData.get("origem")) ? String(formData.get("origem")) : "presencial",
  });

  // fotos e planta escolhidas no drawer (data URLs em JSON)
  const bruto = String(formData.get("anexos") ?? "").trim();
  if (bruto) {
    try {
      const arquivos = JSON.parse(bruto) as { nome?: string; dados?: string }[];
      if (Array.isArray(arquivos)) {
        await salvarAnexos(
          id,
          arquivos
            .filter((a) => typeof a?.dados === "string")
            .map((a) => ({ nome: String(a.nome ?? "anexo"), dados: String(a.dados) })),
        );
      }
    } catch {
      // JSON invalido: contato salvo, anexos ignorados
    }
  }

  revalidatePath("/crm");
  revalidatePath(`/crm/${id}`);
  redirect(`/crm?salvo=${id}`);
}

export async function deleteLead(formData: FormData) {
  await requireSession();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await removeLead(id);
    revalidatePath("/crm");
  }

  redirect("/crm");
}

function clienteFromForm(formData: FormData): ClienteInput {
  return {
    nome: readText(formData, "nome", 120),
    whatsapp: readText(formData, "whatsapp", 40),
    email: readText(formData, "email", 160),
    cidade: readText(formData, "cidade", 80),
    bairro: readText(formData, "bairro", 80),
    observacoes: readText(formData, "observacoes", 2000),
  };
}

export async function saveCliente(formData: FormData) {
  await requireSession();

  const input = clienteFromForm(formData);
  if (!input.nome) redirect("/crm/clientes?erro=nome");

  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await updateCliente(id, input);
  } else {
    await createCliente(input);
  }

  revalidatePath("/crm/clientes");
  redirect("/crm/clientes?salvo=1");
}

export async function deleteCliente(formData: FormData) {
  await requireSession();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await removeCliente(id);
    revalidatePath("/crm/clientes");
  }

  redirect("/crm/clientes");
}

export async function saveLancamento(formData: FormData) {
  await requireSession();

  const mes = normalizeMonth(formData.get("mes"));
  const back = `/crm/financeiro?mes=${mes}`;
  const data = String(formData.get("data") ?? "");
  const tipo = formData.get("tipo");
  const descricao = readText(formData, "descricao", 160);
  const valorCents = parseAmountToCents(String(formData.get("valor") ?? ""));
  const categoria = readText(formData, "categoria", 40);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) redirect(`${back}&erro=data`);
  if (!isLancamentoTipo(tipo)) redirect(`${back}&erro=tipo`);
  if (!descricao) redirect(`${back}&erro=descricao`);
  if (!valorCents) redirect(`${back}&erro=valor`);
  if (!categoriasFor(tipo).includes(categoria)) {
    redirect(`${back}&erro=categoria`);
  }

  await createLancamento({
    data,
    tipo,
    categoria,
    descricao,
    valorCents,
  });

  revalidatePath("/crm/financeiro");
  redirect(`/crm/financeiro?mes=${data.slice(0, 7)}&salvo=1`);
}

export async function deleteLancamento(formData: FormData) {
  await requireSession();

  const mes = normalizeMonth(formData.get("mes"));
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await removeLancamento(id);
    revalidatePath("/crm/financeiro");
  }

  redirect(`/crm/financeiro?mes=${mes}`);
}

export async function saveOrcamentoMaterial(formData: FormData) {
  await requireSession();

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(String(formData.get("itens") ?? "[]"));
  } catch {
    parsed = null;
  }

  const itens = sanitizeItens(parsed);
  if (!itens.length) redirect("/crm/calculadora?erro=itens");

  const titulo = readText(formData, "titulo", 120);
  if (!titulo) redirect("/crm/calculadora?erro=titulo");

  const maoObraRaw = Number(formData.get("maoObraCents") ?? 0);
  const maoObraCents = Number.isFinite(maoObraRaw)
    ? Math.min(100_000_000, Math.max(0, Math.round(maoObraRaw)))
    : 0;

  const id = await createOrcamentoMaterial({
    titulo,
    clienteNome: readText(formData, "clienteNome", 120),
    clienteEmail: readText(formData, "clienteEmail", 160),
    clienteWhatsapp: readText(formData, "clienteWhatsapp", 40),
    observacoes: readText(formData, "observacoes", 2000),
    maoObraCents,
    maoObraDescricao: readText(formData, "maoObraDescricao", 120),
    itens,
  });

  revalidatePath("/crm/calculadora");
  redirect(`/crm/calculadora/${id}?salvo=1`);
}

export async function deleteOrcamentoMaterial(formData: FormData) {
  await requireSession();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await removeOrcamentoMaterial(id);
    revalidatePath("/crm/calculadora");
  }

  redirect("/crm/calculadora");
}

export async function saveMaterialTemplate(
  sistema: string,
  itensJson: string,
): Promise<void> {
  await requireSession();
  const sistemaId = String(sistema ?? "").trim().slice(0, 40);
  if (!sistemaId) return;

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(itensJson);
  } catch {
    parsed = null;
  }

  const itens = sanitizeTemplateItens(parsed);
  if (!itens.length) return;

  await replaceMaterialTemplate(sistemaId, itens);
  revalidatePath("/crm/calculadora");
}

export async function resetMaterialTemplateAction(
  sistema: string,
): Promise<TemplateItem[]> {
  await requireSession();
  const sistemaId = String(sistema ?? "").trim().slice(0, 40);
  if (!sistemaId) return [];

  const itens = await resetMaterialTemplate(sistemaId);
  revalidatePath("/crm/calculadora");
  return itens;
}

export async function createMaterialSystemAction(
  nome: string,
  medidaA: string,
  medidaB: string,
  usaVaos: boolean,
): Promise<SistemaDef | null> {
  await requireSession();

  const nomeLimpo = String(nome ?? "").trim().slice(0, 60);
  const rotuloA = String(medidaA ?? "").trim().slice(0, 40);
  const rotuloB = String(medidaB ?? "").trim().slice(0, 40);
  if (!nomeLimpo || !rotuloA || !rotuloB) return null;

  const sistema = await createSistemaMaterial({
    nome: nomeLimpo,
    medidaA: rotuloA,
    medidaB: rotuloB,
    usaVaos: Boolean(usaVaos),
  });

  revalidatePath("/crm/calculadora");
  return sistema;
}

export async function deleteMaterialSystemAction(
  sistema: string,
): Promise<boolean> {
  await requireSession();
  const removed = await deleteSistemaMaterial(String(sistema ?? "").slice(0, 40));
  revalidatePath("/crm/calculadora");
  return removed;
}

export async function gerarMateriaisDoLead(formData: FormData) {
  await requireSession();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) redirect("/crm");

  const lead = await getLead(id);
  if (!lead) redirect("/crm");

  const servicos = lead.servicos.filter((s) => SERVICO_POR_ID[s.id]);
  const area = lead.areaM2 ?? 0;

  if (servicos.length > 0 && area > 0) {
    const fatia = areaPorServico(area, servicos.length);
    for (const servico of servicos) {
      const areaServico =
        servico.area && servico.area > 0 ? servico.area : fatia;
      const itens = itensDoServico(SERVICO_POR_ID[servico.id], areaServico);
      await salvarMaterialDoLead({
        leadId: id,
        servicoId: servico.id,
        titulo: servico.titulo + " — " + areaServico.toFixed(2) + " m² (lead #" + id + ")",
        clienteNome: lead.nome,
        clienteEmail: lead.email,
        clienteWhatsapp: lead.whatsapp,
        observacoes:
          "Estimativa pela área informada no site (" + area + " m² no total" +
          (lead.ambientes ? ", " + lead.ambientes + " ambientes" : "") +
          "). Confirmar medidas no local antes de comprar.",
        itens,
        maoObraCents: 0,
        maoObraDescricao: "",
      });
    }
  }

  revalidatePath("/crm");
  revalidatePath("/crm/" + id);
  redirect("/crm/" + id + "?materiais=1");
}

export async function savePedido(formData: FormData) {
  await requireSession();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) redirect("/crm");

  const texto = (campo: string, limite = 300) =>
    String(formData.get(campo) ?? "").trim().slice(0, limite);
  const numero = (campo: string) => {
    const valor = Number(formData.get(campo));
    return Number.isFinite(valor) && valor > 0 ? Math.round(valor) : null;
  };

  const escolhidos = formData.getAll("servicos").map((valor) => String(valor));
  const servicos = escolhidos
    .map((sid) => quoteOptions.find((opcao) => opcao.id === sid))
    .filter((opcao): opcao is NonNullable<typeof opcao> => Boolean(opcao))
    .map((opcao) => ({
      id: opcao.id,
      titulo: opcao.title,
      area: numero("area__" + opcao.id),
    }));
  const somaAreas = servicos.reduce((total, servico) => total + (servico.area ?? 0), 0);

  await atualizarPedido(id, {
    nome: texto("nome", 120) || "Sem nome",
    whatsapp: texto("whatsapp", 30),
    email: texto("email", 160),
    areaM2: somaAreas > 0 ? somaAreas : numero("area"),
    ambientes: numero("ambientes"),
    cidade: texto("cidade", 80) || "Belo Horizonte",
    bairro: texto("bairro", 80),
    prazo: texto("prazo", 60) || "A definir",
    detalhes: texto("detalhes", 2000),
    servicos,
  });
  await garantirClienteDoLead(id);

  revalidatePath("/crm");
  revalidatePath("/crm/clientes");
  revalidatePath(`/crm/${id}`);
  redirect(`/crm/${id}?editado=1`);
}

export async function sincronizarContatos() {
  await requireSession();

  const rs = await getDb().execute("SELECT id FROM orcamentos ORDER BY id DESC");
  let criados = 0;
  for (const row of rs.rows) {
    const antes = await garantirClienteDoLead(Number(row.id));
    if (antes) criados += 1;
  }

  revalidatePath("/crm/clientes");
  redirect(`/crm/clientes?sincronizados=${criados}`);
}
