import { getDb } from "@/lib/db";

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
    return Number(res.lastInsertRowid ?? 0) || null;
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
