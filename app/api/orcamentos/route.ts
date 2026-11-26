import { NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { quoteOptions } from "@/lib/site";

export const runtime = "nodejs";

const LIMITS = {
  nome: 120,
  contato: 160,
  cidade: 80,
  bairro: 80,
  prazo: 60,
  detalhes: 2000,
  arquivo: 160,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function wholeNumber(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return rounded >= min && rounded <= max ? rounded : null;
}

function invalid(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return invalid("Corpo da requisição inválido.");
  }

  const nome = text(payload.name, LIMITS.nome);
  const whatsapp = text(payload.phone, LIMITS.contato);
  const email = text(payload.email, LIMITS.contato);
  const cidade = text(payload.city, LIMITS.cidade);
  const bairro = text(payload.district, LIMITS.bairro);
  const prazo = text(payload.timeline, LIMITS.prazo);
  const detalhes = text(payload.details, LIMITS.detalhes);
  const arquivo = text(payload.fileName, LIMITS.arquivo);
  const tipoImovel =
    payload.property === "Comercial"
      ? "Comercial"
      : payload.property === "Residencial"
        ? "Residencial"
        : "";
  const consentimento = payload.consent === true;
  const area = wholeNumber(payload.area, 1, 100_000);
  const ambientes = wholeNumber(payload.rooms, 1, 200);

  const ids = Array.isArray(payload.services)
    ? payload.services.filter((id): id is string => typeof id === "string")
    : [];
  const servicos = ids
    .slice(0, quoteOptions.length)
    .map((id) => quoteOptions.find((option) => option.id === id))
    .filter((option): option is (typeof quoteOptions)[number] => Boolean(option));

  if (!nome) return invalid("Informe o nome.");
  if (!whatsapp && !email) return invalid("Informe um WhatsApp ou e-mail.");
  if (email && !EMAIL_PATTERN.test(email)) return invalid("E-mail inválido.");
  if (!consentimento) return invalid("O consentimento é obrigatório.");
  if (!tipoImovel) return invalid("Informe o tipo de imóvel.");
  if (!cidade) return invalid("Informe a cidade.");
  if (!prazo) return invalid("Informe o prazo desejado.");
  if (servicos.length === 0) return invalid("Selecione pelo menos um serviço.");

  try {
    await ensureSchema();

    const result = await getDb().execute({
      sql: `INSERT INTO orcamentos (
        nome, whatsapp, email, servicos, tipo_imovel, area_m2, ambientes,
        cidade, bairro, prazo, detalhes, arquivo, consentimento, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nome,
        whatsapp || null,
        email || null,
        JSON.stringify(
          servicos.map((servico) => ({ id: servico.id, titulo: servico.title })),
        ),
        tipoImovel,
        area,
        ambientes,
        cidade,
        bairro || null,
        prazo,
        detalhes || null,
        arquivo || null,
        1,
        request.headers.get("user-agent")?.slice(0, 300) ?? null,
      ],
    });

    const leadId = Number(result.lastInsertRowid);

    // Cria o contato no CRM na entrada do lead (status inicial), se ainda não existir.
    try {
      const existente = await getDb().execute({
        sql: `SELECT id FROM clientes
               WHERE (? IS NOT NULL AND whatsapp = ?) OR (? IS NOT NULL AND email = ?)
               LIMIT 1`,
        args: [whatsapp || null, whatsapp || null, email || null, email || null],
      });
      if (existente.rows.length === 0) {
        await getDb().execute({
          sql: `INSERT INTO clientes (nome, whatsapp, email, cidade, bairro, observacoes)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            nome,
            whatsapp || null,
            email || null,
            cidade,
            bairro || null,
            `Contato inicial · lead #${leadId} (formulário do site)`,
          ],
        });
      }
    } catch (error) {
      console.error("Falha ao criar contato a partir do lead", error);
    }

    return NextResponse.json(
      { id: leadId },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Falha ao registrar orçamento", error);
    return NextResponse.json(
      { error: "Não foi possível registrar o pedido agora." },
      { status: 503 },
    );
  }
}
