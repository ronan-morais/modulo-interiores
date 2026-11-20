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

const attempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 6;
const BLOCK_WINDOW_MS = 10 * 60 * 1000;

async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/crm");
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
