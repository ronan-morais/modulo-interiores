"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  credentialsValid,
  isAuthenticated,
  isLeadStatus,
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

  await updateLead(id, isLeadStatus(status) ? status : "novo", notas);
  revalidatePath("/crm");
  revalidatePath(`/crm/${id}`);
  redirect(`/crm/${id}?salvo=1`);
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

  const id = await createOrcamentoMaterial({
    titulo,
    clienteNome: readText(formData, "clienteNome", 120),
    clienteEmail: readText(formData, "clienteEmail", 160),
    clienteWhatsapp: readText(formData, "clienteWhatsapp", 40),
    observacoes: readText(formData, "observacoes", 2000),
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
