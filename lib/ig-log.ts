import { getDb } from "@/lib/db";
import { garantirClienteDoLead } from "@/lib/crm";

/**
 * Log dos eventos do Direct no Turso. Serve pra depurar o webhook e auditar o
 * que o atendimento automático respondeu (a Meta não dá log de fácil acesso no
 * Vercel).
 */
let pronto: Promise<void> | undefined;

async function tabela(): Promise<void> {
  if (!pronto) {
    pronto = (async () => {
      await getDb().execute(`CREATE TABLE IF NOT EXISTS ig_dm_eventos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        igsid TEXT,
        mid TEXT,
        recebido TEXT,
        resposta TEXT,
        envio_ok INTEGER,
        envio_status INTEGER,
        envio_erro TEXT
      )`);
    })();
  }
  await pronto;
}

export async function registrarEvento(dados: {
  igsid: string;
  mid: string;
  recebido: string;
  resposta: string;
}): Promise<number | null> {
  try {
    await tabela();
    const res = await getDb().execute({
      sql: `INSERT INTO ig_dm_eventos (igsid, mid, recebido, resposta) VALUES (?, ?, ?, ?)`,
      args: [dados.igsid, dados.mid, dados.recebido.slice(0, 1000), dados.resposta.slice(0, 2000)],
    });
    const leadId = Number(res.lastInsertRowid ?? 0);
    // lead do Direct também vira cliente, igual ao formulário do site
    if (leadId) {
      try {
        await garantirClienteDoLead(leadId, "Instagram Direct");
      } catch {
        /* cliente é opcional: não derruba o lead */
      }
    }
    return leadId || null;
  } catch (erro) {
    console.error("[ig-dm] falha ao registrar evento", erro);
    return null;
  }
}

export async function atualizarEnvio(
  id: number | null,
  ok: boolean,
  status: number,
  erro: string,
): Promise<void> {
  if (!id) return;
  try {
    await tabela();
    await getDb().execute({
      sql: `UPDATE ig_dm_eventos SET envio_ok = ?, envio_status = ?, envio_erro = ? WHERE id = ?`,
      args: [ok ? 1 : 0, status, erro.slice(0, 600), id],
    });
  } catch (falha) {
    console.error("[ig-dm] falha ao atualizar evento", falha);
  }
}

export async function ultimosEventos(limite = 10) {
  await tabela();
  const res = await getDb().execute({
    sql: `SELECT id, criado_em, igsid, recebido, resposta, envio_ok, envio_status, envio_erro
            FROM ig_dm_eventos ORDER BY id DESC LIMIT ?`,
    args: [Math.min(Math.max(limite, 1), 50)],
  });
  return res.rows;
}

/** Últimas trocas de uma conversa (memória curta do atendimento). */
export async function historicoRecente(igsid: string, limite = 6) {
  try {
    await tabela();
    const res = await getDb().execute({
      sql: `SELECT recebido, resposta, criado_em
              FROM ig_dm_eventos
             WHERE igsid = ? AND resposta IS NOT NULL AND resposta != ''
             ORDER BY id DESC LIMIT ?`,
      args: [igsid, Math.min(Math.max(limite, 1), 20)],
    });
    return res.rows.map((r) => ({
      recebido: String(r.recebido ?? ""),
      resposta: String(r.resposta ?? ""),
      quando: String(r.criado_em ?? ""),
    }));
  } catch (falha) {
    console.error("[ig-dm] falha ao ler historico", falha);
    return [];
  }
}

let estadoPronto: Promise<void> | undefined;
async function tabelaEstado(): Promise<void> {
  if (!estadoPronto) {
    estadoPronto = (async () => {
      await getDb().execute(`CREATE TABLE IF NOT EXISTS ig_dm_estado (
        igsid TEXT PRIMARY KEY,
        etapa TEXT NOT NULL,
        dados TEXT NOT NULL,
        atualizado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`);
    })();
  }
  return estadoPronto;
}

export async function carregarEstado(igsid: string) {
  try {
    await tabelaEstado();
    const res = await getDb().execute({ sql: `SELECT etapa, dados FROM ig_dm_estado WHERE igsid = ?`, args: [igsid] });
    const linha = res.rows[0];
    if (!linha) return { etapa: "", dados: {} };
    return { etapa: String(linha.etapa), dados: JSON.parse(String(linha.dados)) };
  } catch (falha) {
    console.error("[ig-dm] falha ao carregar estado", falha);
    return { etapa: "", dados: {} };
  }
}

export async function salvarEstado(igsid: string, etapa: string, dados: unknown) {
  try {
    await tabelaEstado();
    await getDb().execute({
      sql: `INSERT INTO ig_dm_estado (igsid, etapa, dados, atualizado_em)
            VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
            ON CONFLICT(igsid) DO UPDATE SET etapa = excluded.etapa, dados = excluded.dados, atualizado_em = excluded.atualizado_em`,
      args: [igsid, etapa, JSON.stringify(dados)],
    });
  } catch (falha) {
    console.error("[ig-dm] falha ao salvar estado", falha);
  }
}

export type LeadDirect = {
  nome?: string; whatsapp?: string; servico?: string; area?: number; tipo?: string;
  ambientes?: number; cidade?: string; bairro?: string; prazo?: string; detalhes?: string;
};

function idDoServico(titulo?: string): string {
  if (!titulo) return "forro-pvc";
  const t = titulo.toLowerCase();
  if (t.includes("movel") || t.includes("móvel")) return "moveis-drywall";
  if (t.includes("parede") || t.includes("divis")) return "paredes-drywall";
  if (t.includes("gesso") || t.includes("sanca")) return "forro-placa-gesso";
  if (t.includes("modular") && t.includes("forro")) return "forro-modular";
  if (t.includes("modular")) return "piso-modular";
  if (t.includes("vinil")) return "piso-vinilico";
  if (t.includes("manuten")) return "manutencao";
  return "forro-pvc";
}

/** Grava o pedido coletado no Direct como um lead do formulário. */
export async function salvarLead(d: LeadDirect): Promise<number | null> {
  try {
    await getDb().execute(`CREATE TABLE IF NOT EXISTS orcamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      nome TEXT NOT NULL, whatsapp TEXT, email TEXT, servicos TEXT NOT NULL,
      tipo_imovel TEXT NOT NULL, area_m2 INTEGER, ambientes INTEGER,
      cidade TEXT NOT NULL, bairro TEXT, prazo TEXT NOT NULL, detalhes TEXT,
      arquivo TEXT, consentimento INTEGER NOT NULL DEFAULT 0,
      origem TEXT NOT NULL DEFAULT 'orcamento-online', user_agent TEXT
    )`);
    const servicos = JSON.stringify([{ id: idDoServico(d.servico), titulo: d.servico ?? "A definir", area: d.area ?? null }]);
    const res = await getDb().execute({
      sql: `INSERT INTO orcamentos (nome, whatsapp, email, servicos, tipo_imovel, area_m2, ambientes,
              cidade, bairro, prazo, detalhes, arquivo, consentimento, origem, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'instagram-direct', 'instagram-direct')`,
      args: [
        (d.nome ?? "Contato Instagram").slice(0, 120),
        d.whatsapp ?? null,
        null,
        servicos,
        d.tipo ?? "Residencial",
        d.area ?? null,
        d.ambientes ?? null,
        (d.cidade ?? "Belo Horizonte").slice(0, 80),
        d.bairro ?? null,
        (d.prazo ?? "a definir").slice(0, 60),
        d.detalhes ?? null,
        null,
      ],
    });
    return Number(res.lastInsertRowid ?? 0) || null;
  } catch (falha) {
    console.error("[ig-dm] falha ao salvar lead", falha);
    return null;
  }
}
