import { after, NextResponse } from "next/server";

import { extrairMetragem, extrairServico, responder } from "@/lib/instagram-dm";
import { atender } from "@/lib/ig-atendimento";
import { atualizarEnvio, carregarEstado, historicoRecente, registrarEvento, salvarEstado, salvarLead, ultimosEventos } from "@/lib/ig-log";

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

  // Últimos eventos do Direct (uso interno): GET ?eventos=<verify_token>
  const eventos = params.get("eventos");
  if (eventos && verifyToken() && eventos === verifyToken()) {
    try {
      const linhas = await ultimosEventos(Number(params.get("limite") ?? 10));
      return NextResponse.json({ eventos: linhas });
    } catch (erro) {
      return NextResponse.json({ error: String(erro) }, { status: 503 });
    }
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
    const texto = params.get("text") ?? responder("oi", { primeiro: true, anteriores: [] });
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


/** Modo teste: quando IG_DM_TESTE=1, só responde os IGSIDs listados (evita falar
 *  com cliente real enquanto o atendimento ainda está sendo ajustado. */
function testeRestrito(): string[] | null {
  if ((process.env.IG_DM_TESTE ?? "") !== "1") return null;
  return (process.env.IG_DM_TESTE_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
  const brutos: { para: string; chave: string; recebido: string; texto: string }[] = [];

  for (const entry of payload.entry ?? []) {
    for (const evento of entry.messaging ?? []) {
      const de = evento.sender?.id;
      if (!de || de === proprio) continue; // eco da própria conta
      if (evento.message?.is_echo) continue;
      const restrito = testeRestrito();
      if (restrito && !restrito.includes(de)) continue;

      const recebido = (evento.message?.text ?? evento.postback?.title ?? "").trim();
      const temAnexo = Boolean(evento.message?.attachments?.length);
      if (!recebido && !temAnexo) continue; // read / reaction / delivery

      const chave = evento.message?.mid ?? evento.postback?.mid ?? `${de}-${evento.timestamp ?? Date.now()}`;
      brutos.push({ para: de, chave, recebido: recebido || "[anexo]", texto: recebido });
    }
  }

  // memória curta por conversa: histórico + serviço/metragem já ditos pelo cliente
  const memorias = new Map<string, { respostas: string[]; recebidos: string[] }>();
  for (const bruto of brutos) {
    if (memorias.has(bruto.para)) continue;
    const linhas = await historicoRecente(bruto.para, 6);
    memorias.set(bruto.para, {
      respostas: linhas.map((l) => l.resposta),
      recebidos: linhas.map((l) => l.recebido),
    });
  }

  const tarefas: { para: string; texto: string; chave: string; recebido: string; id: number | null }[] = [];
  for (const bruto of brutos) {
    const memoria = memorias.get(bruto.para) ?? { respostas: [], recebidos: [] };
    let servico: string | null = null;
    let metragem: string | null = null;
    for (const antigo of [...memoria.recebidos].reverse()) {
      servico = servico ?? extrairServico(antigo);
      metragem = metragem ?? extrairMetragem(antigo);
    }
    servico = extrairServico(bruto.texto) ?? servico;
    metragem = extrairMetragem(bruto.texto) ?? metragem;

    // coleta do formulário de cotação: pergunta campo por campo e salva o lead
    const estado = await carregarEstado(bruto.para);
    const perguntaSolto = /\?\s*$/.test(bruto.texto.trim());
    const querOrcamento = /or[cç]amento|cota[cç][aã]o|quero|preciso|quanto|valor|pre[cç]o|forro|piso|parede|drywall|gesso|pvc|vinil|movel|móvel|reparo/i.test(bruto.texto);

    let texto: string;
    if (!bruto.texto) {
      texto = "Recebi o arquivo 😊 Me conta o que você quer fazer com ele e a metragem.";
    } else if (estado.etapa && estado.etapa !== "fim" && perguntaSolto) {
      texto = responder(bruto.texto, {
        primeiro: false,
        anteriores: memoria.respostas,
        servico: estado.dados.servico ?? servico,
        metragem: estado.dados.area ? `${estado.dados.area} m²` : metragem,
      });
    } else if (estado.etapa && estado.etapa !== "fim") {
      const r = atender(bruto.texto, { etapa: estado.etapa, dados: estado.dados });
      if (r.completo) {
        const leadId = await salvarLead(r.estado.dados);
        await salvarEstado(bruto.para, "fim", r.estado.dados);
        texto = leadId ? `${r.resposta} (pedido #${leadId})` : `${r.resposta} Anotei aqui e o Ronan vai registrar.`;
      } else {
        await salvarEstado(bruto.para, r.estado.etapa, r.estado.dados);
        texto = r.resposta;
      }
    } else if (querOrcamento) {
      const r = atender(bruto.texto, { etapa: estado.etapa === "fim" ? "" : estado.etapa, dados: estado.etapa === "fim" ? {} : estado.dados });
      if (r.completo) {
        const leadId = await salvarLead(r.estado.dados);
        await salvarEstado(bruto.para, "fim", r.estado.dados);
        texto = leadId ? `${r.resposta} (pedido #${leadId})` : r.resposta;
      } else {
        await salvarEstado(bruto.para, r.estado.etapa, r.estado.dados);
        texto = r.resposta;
      }
    } else {
      texto = responder(bruto.texto, {
        primeiro: memoria.respostas.length === 0,
        anteriores: memoria.respostas,
        servico,
        metragem,
      });
    }
    memoria.respostas.push(texto);
    tarefas.push({ para: bruto.para, texto, chave: bruto.chave, recebido: bruto.recebido, id: null });
  }

  for (const tarefa of tarefas) {
    tarefa.id = await registrarEvento({
      igsid: tarefa.para,
      mid: tarefa.chave,
      recebido: tarefa.recebido,
      resposta: tarefa.texto,
    });
  }

  if (tarefas.length > 0) {
    after(async () => {
      for (const tarefa of tarefas) {
        try {
          const resultado = await enviar(tarefa.para, tarefa.texto);
          await atualizarEnvio(tarefa.id, resultado.ok, resultado.status, resultado.corpo);
        } catch (erro) {
          console.error("[ig-dm] erro inesperado", tarefa.chave, erro);
          await atualizarEnvio(tarefa.id, false, 0, String(erro));
        }
      }
    });
  }

  // A Meta exige 200 rápido, senão reenvia o evento.
  return NextResponse.json({ ok: true, respondidas: tarefas.length });
}
