import { NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/crm";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureSchema();
  const { id } = await ctx.params;
  const rs = await getDb().execute({
    sql: "SELECT nome, tipo, dados FROM anexos WHERE id = ?",
    args: [Number(id) || 0],
  });
  if (rs.rows.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const row = rs.rows[0];
  const bytes = Buffer.from(String(row.dados), "base64");
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": String(row.tipo),
      "Content-Disposition": `inline; filename="${String(row.nome).replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
