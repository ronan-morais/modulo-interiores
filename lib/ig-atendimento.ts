/** Coleta do formulario de cotacao pelo Direct. */
import { extrairMetragem, extrairServico } from "@/lib/instagram-dm";

export type Dados = {
  servico?: string;
  area?: number;
  tipo?: string;
  ambientes?: number;
  cidade?: string;
  bairro?: string;
  prazo?: string;
  nome?: string;
  whatsapp?: string;
  detalhes?: string;
};

export type Estado = { etapa: string; dados: Dados };

const ORDEM = ["servico", "area", "tipo", "ambientes", "cidade", "bairro", "prazo", "nome", "whatsapp"] as const;

const PERGUNTAS: Record<string, string> = {
  servico: "Qual serviço você precisa? (parede de drywall, forro, piso, móvel sob medida...)",
  area: "Quantos metros quadrados, mais ou menos?",
  tipo: "E o imóvel: residencial ou comercial?",
  ambientes: "Quantos ambientes entram na obra?",
  cidade: "Em qual cidade?",
  bairro: "Qual bairro?",
  prazo: "Pra quando você precisa? (este mês, em 30 dias, sem pressa)",
  nome: "Qual seu nome?",
  whatsapp: "Me passa um WhatsApp pra contato.",
};

export function faltando(d: Dados): (typeof ORDEM)[number] | null {
  for (const campo of ORDEM) {
    const valor = d[campo as keyof Dados];
    if (valor === undefined || valor === null || valor === "") return campo;
  }
  return null;
}

function limpar(t: string): string {
  return t.replace(/^(meu nome e|meu nome é|sou o|sou a|e o|é o|e a|é a|fica em|fica no|moro em|moro no)\s+/i, "").trim();
}

function numero(t: string): number | null {
  const m = t.match(/\d{1,4}([.,]\d{1,2})?/);
  if (!m) return null;
  const n = Number(m[1] ? m[0].replace(",", ".") : m[0]);
  return Number.isFinite(n) && n > 0 && n <= 100000 ? Math.round(n) : null;
}

/** Lê a mensagem e preenche o campo que está sendo perguntado (e atalhos). */
export function absorver(texto: string, estado: Estado): Estado {
  const t = texto.toLowerCase().trim();
  const dados: Dados = { ...estado.dados };
  let etapa = estado.etapa || "servico";

  // atalhos: servico e metragem podem vir em qualquer mensagem
  const servico = extrairServico(texto);
  const metragem = extrairMetragem(texto);
  if (servico && !dados.servico) dados.servico = servico;
  if (metragem && !dados.area) dados.area = numero(metragem) ?? undefined;

  if (etapa === "servico" && dados.servico) etapa = "area";
  if (etapa === "area" && dados.area) etapa = "tipo";
  if (etapa !== estado.etapa) return { etapa, dados };

  // um campo por mensagem: o que não foi respondido agora fica pra próxima
  if (etapa === "tipo") {
    if (/comercial|loja|escritorio|escritório|clinica|clínica|galpao|galpão/.test(t)) { dados.tipo = "Comercial"; etapa = "ambientes"; }
    else if (/residencial|casa|apartamento|apto|sobrado|cozinha|quarto|sala/.test(t)) { dados.tipo = "Residencial"; etapa = "ambientes"; }
  } else if (etapa === "ambientes") {
    const n = numero(t);
    if (n && n <= 200) { dados.ambientes = n; etapa = "cidade"; }
  } else if (etapa === "cidade") {
    const c = limpar(texto);
    if (c.length >= 2 && !/\?/.test(c)) { dados.cidade = c.slice(0, 80); etapa = "bairro"; }
  } else if (etapa === "bairro") {
    const b = limpar(texto).replace(/^bairro\s+(de\s+|do\s+|da\s+)?/i, "");
    if (b.length >= 2 && !/\?/.test(b)) { dados.bairro = b.slice(0, 80); etapa = "prazo"; }
  } else if (etapa === "prazo") {
    if (t.length >= 2 && !/\?/.test(t)) { dados.prazo = texto.slice(0, 60); etapa = "nome"; }
  } else if (etapa === "nome") {
    let n = limpar(texto).replace(/^(meu nome (e|é)|me chamo|sou (o|a))\s+/i, "");
    // "Ronan, Tirol" = nome + bairro na mesma mensagem
    if (n.includes(",") && !dados.bairro) {
      const [nomeParte, ...resto] = n.split(",");
      n = nomeParte.trim();
      const bairroParte = resto.join(" ").replace(/^bairro\s+/i, "").trim();
      if (bairroParte.length >= 2) dados.bairro = bairroParte.slice(0, 80);
    }
    if (n.length >= 2 && !/\d/.test(n) && !/\?/.test(n)) { dados.nome = n.slice(0, 120); etapa = "whatsapp"; }
  } else if (etapa === "whatsapp") {
    const digitos = texto.replace(/\D/g, "");
    if (digitos.length >= 10) {
      dados.whatsapp = digitos.length >= 12
        ? texto.slice(0, 160)
        : `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
      etapa = "fim";
    }
  }
  return { etapa, dados };
}

function eco(antes: Dados, depois: Dados): string {
  if (depois.servico && depois.servico !== antes.servico) return `${depois.servico}, certo.`;
  if (depois.area && depois.area !== antes.area) return `${depois.area} m2, anotado.`;
  if (depois.tipo && depois.tipo !== antes.tipo) return `${depois.tipo}, ok.`;
  if (depois.nome && depois.nome !== antes.nome) return `Prazer, ${depois.nome}.`;
  return "";
}

export function atender(texto: string, estado: Estado): { estado: Estado; resposta: string; completo: boolean } {
  const novo = absorver(texto, estado);
  const falta = faltando(novo.dados);

  if (!falta) {
    const d = novo.dados;
    const resumo = [
      `${d.servico} - ${d.area} m2`,
      `${d.tipo}, ${d.ambientes} ambiente(s)`,
      `${d.cidade}${d.bairro ? ` / ${d.bairro}` : ""}`,
      `prazo: ${d.prazo}`,
      `${d.nome} - ${d.whatsapp}`,
    ].join(" | ");
    return {
      estado: { etapa: "fim", dados: d },
      completo: true,
      resposta: `Fechado, ${d.nome?.split(" ")[0]}! Registrei seu pedido: ${resumo}. O orçamento chega pelo WhatsApp que você passou. Obrigado!`,
    };
  }

  const prefixo = eco(estado.dados, novo.dados);
  const pergunta = PERGUNTAS[falta] ?? "";
  return {
    estado: { etapa: falta, dados: novo.dados },
    completo: false,
    resposta: prefixo ? `${prefixo} ${pergunta}` : pergunta,
  };
}
