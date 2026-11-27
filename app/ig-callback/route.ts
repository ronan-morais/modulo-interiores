/**
 * Alias do webhook do Direct do Instagram.
 *
 * A URL de callback registrada no app da Meta é /ig-callback; a implementação
 * fica em /api/instagram/webhook e é reexportada aqui para manter as duas
 * funcionando.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export { GET, POST } from "@/app/api/instagram/webhook/route";
