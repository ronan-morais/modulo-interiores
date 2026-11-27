import { NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { ensureCrmSchema } from "@/lib/crm";
import { sanitizeItens, orcamentoTotais } from "@/lib/orcamento-material";
import { itensDoServico, SERVICO_POR_ID } from "@/lib/lead-material";
import { listMaterialTemplates } from "@/lib/material-templates-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const token = process.env.LEADS_API_TOKEN ?? process.env.LEADS_API_KEY;
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  return header.replace(/^Bearer\s+/i, "").trim() === token;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "json invalido" }, { status: 400 });
  }

  const titulo = String(body.titulo ?? "").trim().slice(0, 200);
  const itens = sanitizeItens(body.itens);
  if (!titulo || itens.length === 0) {
    return NextResponse.json({ error: "titulo e itens sao obrigatorios" }, { status: 400 });
  }

  const maoObraCents = Math.max(0, Math.round(Number(body.maoObraCents ?? 0)));
  const totais = orcamentoTotais(itens, maoObraCents);
  const leadId = Number.isFinite(Number(body.leadId)) && Number(body.leadId) > 0 ? Number(body.leadId) : null;

  try {
    await ensureSchema();
    await ensureCrmSchema();
    const res = await getDb().execute({
      sql: `INSERT INTO orcamentos_material
              (titulo, cliente_nome, cliente_email, cliente_whatsapp, observacoes,
               itens, subtotal_cents, frete_cents, desconto_cents,
               mao_obra_cents, mao_obra_descricao, total_cents, lead_id, servico_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        titulo,
        String(body.clienteNome ?? "").slice(0, 160) || null,
        String(body.clienteEmail ?? "").slice(0, 160) || null,
        String(body.clienteWhatsapp ?? "").slice(0, 40) || null,
        String(body.observacoes ?? "").slice(0, 2000) || null,
        JSON.stringify(itens),
        totais.subtotalCents,
        totais.freteCents,
        totais.descontoCents,
        maoObraCents,
        String(body.maoObraDescricao ?? "").slice(0, 300) || null,
        totais.totalCents,
        leadId,
        String(body.servicoId ?? "").slice(0, 60) || null,
      ],
    });
    return NextResponse.json({ id: Number(res.lastInsertRowid), totalCents: totais.totalCents }, { status: 201 });
  } catch (error) {
    console.error("Falha ao salvar lista de material", error);
    return NextResponse.json({ error: "falha ao salvar" }, { status: 503 });
  }
}

/**
 * GET /api/materiais?servico=<id>&area=<m²> — prévia da lista de material
 * usando a mesma engine da calculadora (diagnóstico/QA).
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const servico = url.searchParams.get("servico") ?? "forro-placa-gesso";
  const area = Number(url.searchParams.get("area") ?? "12");
  if (!(area > 0)) return NextResponse.json({ error: "area invalida" }, { status: 400 });

  const templates = await listMaterialTemplates();
  const itens = itensDoServico(servico, area, templates);
  const total = itens.reduce((soma, item) => soma + Math.round(item.quantidade * item.valorUnitCents), 0);
  return NextResponse.json({
    servico,
    area,
    sistema: SERVICO_POR_ID[servico] ?? null,
    itens,
    totalCents: total,
  });
}
