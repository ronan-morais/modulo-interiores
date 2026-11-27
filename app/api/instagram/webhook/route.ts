import { after, NextResponse } from "next/server";

import { responder } from "@/lib/instagram-dm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRAPH = "https://graph.facebook.com/v23.0";

type IgEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    attachments?: { type?: string }[];
  };
  postback?: { mid?: string; title?: string; payload?: string };
};

type IgPayload = { object?: string; entry?: { id?: string; messaging?: IgEvent[] }[] };

function token(): string | undefined {
  return process.env.IG_ACCESS_TOKEN ?? process.env.IG_TOKEN;
}

function igUserId(): string | undefined {
  return process.env.IG_USER_ID ?? process.env.IG_ID ?? "17841480893320913";
}

function verifyToken(): string | undefined {
  return process.env.IG_VERIFY_TOKEN ?? process.env.IG_WEBHOOK_TOKEN;
}

/** GET /api/instagram/webhook — verificação do webhook pela Meta. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  if (params.get("diag") === "1") {
    return NextResponse.json({
      token: Boolean(token()),
      ig_user: Boolean(igUserId()),
      verify: Boolean(verifyToken()),
    });
  }

  const modo = params.get("hub.mode");
  const recebido = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge") ?? "";

  // Diagnóstico protegido: GET ?debug=<verify_token>&to=<igsid>[&text=...]
  // envia a resposta de forma síncrona e devolve o retorno cru da Graph API.
  const debug = params.get("debug");
  if (debug && verifyToken() && debug === verifyToken()) {
    const para = params.get("to");
    if (!para) return NextResponse.json({ error: "to obrigatorio" }, { status: 400 });
    const texto = params.get("text") ?? responder("oi", true);
    const resultado = await enviar(para, texto);
    return NextResponse.json({ ...resultado, texto });
  }

  if (modo === "subscribe" && verifyToken() && recebido === verifyToken()) {
    return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } });
  }

  return new Response("forbidden", { status: 403 });
}

async function enviar(para: string, texto: string): Promise<{ ok: boolean; status: number; corpo: string }> {
  const tok = token();
  if (!tok) {
    console.error("[ig-dm] IG_ACCESS_TOKEN ausente");
    return { ok: false, status: 0, corpo: "IG_ACCESS_TOKEN ausente" };
  }
  const resp = await fetch(`${GRAPH}/${igUserId()}/messages`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      recipient: JSON.stringify({ id: para }),
      message: JSON.stringify({ text: texto }),
      access_token: tok,
    }),
  });

  const corpo = (await resp.text()).slice(0, 600);
  if (!resp.ok) {
    console.error("[ig-dm] falha ao responder", para, resp.status, corpo);
  } else {
    console.log("[ig-dm] respondido", para);
  }
  return { ok: resp.ok, status: resp.status, corpo };
}


/** POST /api/instagram/webhook — eventos de mensagem do Direct. */
export async function POST(request: Request) {
  let payload: IgPayload;
  try {
    payload = (await request.json()) as IgPayload;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const proprio = igUserId();
  const tarefas: { para: string; texto: string; chave: string }[] = [];

  for (const entry of payload.entry ?? []) {
    for (const evento of entry.messaging ?? []) {
      const de = evento.sender?.id;
      if (!de || de === proprio) continue; // eco da própria conta
      if (evento.message?.is_echo) continue;

      const recebido = (evento.message?.text ?? evento.postback?.title ?? "").trim();
      const temAnexo = Boolean(evento.message?.attachments?.length);
      if (!recebido && !temAnexo) continue; // read / reaction / delivery

      const chave = evento.message?.mid ?? evento.postback?.mid ?? `${de}-${evento.timestamp ?? Date.now()}`;
      const texto = recebido
        ? responder(recebido, false)
        : "Recebi seu arquivo 😊 Pra eu te passar o valor certinho, me conta a metragem e o que você quer fazer. O orçamento completo sai aqui: https://modulointeriores.com.br/orcamento";

      tarefas.push({ para: de, texto, chave });
    }
  }

  if (tarefas.length > 0) {
    after(async () => {
      for (const tarefa of tarefas) {
        try {
          await enviar(tarefa.para, tarefa.texto);
        } catch (erro) {
          console.error("[ig-dm] erro inesperado", tarefa.chave, erro);
        }
      }
    });
  }

  // A Meta exige 200 rápido, senão reenvia o evento.
  return NextResponse.json({ ok: true, respondidas: tarefas.length });
}
