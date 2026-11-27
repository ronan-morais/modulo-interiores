/**
 * Atendimento do Direct da Módulo: reconhece o que o cliente disse e responde
 * com base nisso (serviço + metragem), sem repetir pergunta e sem link à toa.
 *
 * Regras do Ronan (27/11/2026):
 * - primeiro ESCUTA: se o cliente falou "forro de PVC 3 m²", a resposta tem que
 *   citar forro de PVC e 3 m² — nunca perguntar de novo o que já foi dito
 * - link do site só quando pedirem link OU quando fecha orçamento (e mesmo aí,
 *   sem URL, falando "no site", pra não gerar miniatura)
 * - sem repetir a mesma resposta na mesma conversa
 */
export type Contexto = {
  primeiro: boolean;
  anteriores: string[];
  servico?: string | null;
  metragem?: string | null;
};

const SERVICOS: [RegExp, string][] = [
  [/forro\s+(de\s+)?pvc|pvc/i, "Forro de PVC"],
  [/forro\s+modular|modular/i, "Forro modular"],
  [/forro\s+(de\s+)?gesso|gesso|sanca|rebaix/i, "Forro em gesso"],
  [/piso\s+vin[ií]lico|vin[ií]lico|vinil/i, "Piso vinílico"],
  [/piso\s+modular|piso\s+elevado|piso\s+t[eé]cnico/i, "Piso modular"],
  [/m[oó]vel|closet|arm[aá]rio|nicho/i, "Móveis de drywall"],
  [/drywall|divis[oó]ria|parede/i, "Parede de drywall"],
];

const NUMEROS: Record<string, string> = {
  um: "1", dois: "2", tres: "3", três: "3", quatro: "4", cinco: "5",
  seis: "6", sete: "7", oito: "8", nove: "9", dez: "10", doze: "12",
  quinze: "15", vinte: "20", trinta: "30", quarenta: "40", cinquenta: "50",
};

export function extrairServico(texto: string): string | null {
  for (const [padrao, nome] of SERVICOS) {
    if (padrao.test(texto)) return nome;
  }
  return null;
}

export function extrairMetragem(texto: string): string | null {
  const limpo = texto.toLowerCase();
  const numerico = limpo.match(/(\d+[.,]?\d*)\s*(m2|m²|mts?|metros?(\s+quadrados)?)/);
  if (numerico) {
    const valor = numerico[1].replace(",", ".");
    return `${valor} m²`;
  }
  const palavra = limpo.match(/\b(um|dois|tres|três|quatro|cinco|seis|sete|oito|nove|dez|doze|quinze|vinte|trinta|quarenta|cinquenta)\s*(metros?|m2|m²)/);
  if (palavra) return `${NUMEROS[palavra[1]]} m²`;
  return null;
}

const SITE = "modulointeriores.com.br";
const ORCAMENTO = "modulointeriores.com.br/orcamento";

function variar(opcoes: string[], anteriores: string[]): string {
  const livres = opcoes.filter((o) => !anteriores.includes(o));
  return (livres.length ? livres : opcoes)[0];
}

export function responder(texto: string, ctx: Contexto): string {
  const t = texto.toLowerCase().trim();
  const antes = ctx.anteriores ?? [];
  const pediuLink = /\blink\b|qual\s+o\s+site|manda\s+o\s+site|endere[cç]o\s+do\s+site/i.test(t);
  const reclamou = /j[aá]\s+falei|como\s+falei|de\s+novo|repit/i.test(t);
  const servico = ctx.servico ?? null;
  const metragem = ctx.metragem ?? null;

  if (pediuLink) {
    return variar(
      [
        `Claro: ${SITE}. O formulário de orçamento fica em ${ORCAMENTO} — preenchendo serviço e metragem a gente responde com o valor.`,
        `O site é ${SITE}, e o orçamento em ${ORCAMENTO}. Se preferir, me passa aqui serviço e metragem que eu já encaminho.`,
      ],
      antes,
    );
  }

  // serviço + metragem já conhecidos: reconhece e encaminha pro orçamento
  if (servico && metragem) {
    const base = `${servico} em ${metragem}${reclamou ? ", anotado de novo e sem perguntar outra vez" : ", anotado"}.`;
    if (/or[cç]amento|cota[cç][aã]o|valor|pre[cç]o|quanto/i.test(t) || reclamou || metragem) {
      return variar(
        [
          `${base} Pra fechar o valor a gente usa o formulário de orçamento do site: você informa o serviço e a metragem e a gente responde com a conta. Se quiser, já passo pro Ronan te chamar.`,
          `${base} A cotação sai pelo formulário do site — só serviço e metragem — e a resposta vem com o valor. Prefere que o Ronan te chame no WhatsApp?`,
        ],
        antes,
      );
    }
  }

  if (servico && !metragem) {
    return variar(
      [
        `${servico}, certo. Quantos metros quadrados, mais ou menos?`,
        `${servico}, anotado. Me diz a metragem aproximada que eu já te oriento.`,
      ],
      antes,
    );
  }

  if (metragem && !servico) {
    return variar(
      [
        `${metragem}, anotado. É forro, parede ou piso?`,
        `${metragem} de área. Qual o serviço — forro, parede ou piso?`,
      ],
      antes,
    );
  }

  if (/pre[cç]o|valor|quanto\s+custa|or[cç]amento|cota[cç][aã]o|quanto\s+fica/i.test(t)) {
    return variar(
      [
        "O valor depende do serviço e da metragem. Me diz o que você quer fazer e o tamanho do ambiente que eu já te passo uma faixa.",
        "Pra te dar número eu preciso de duas coisas: serviço e metragem. Me passa esses dois que eu já respondo.",
      ],
      antes,
    );
  }

  if (/whats|telefone|n[uú]mero|contato|email|e-mail/i.test(t)) {
    return variar(
      [
        "WhatsApp da Módulo: (31) 99740-8629. O site também tem o contato e o formulário de orçamento.",
        "Falo com você pelo (31) 99740-8629 no WhatsApp. E no site da Módulo tem o contato e o orçamento online.",
      ],
      antes,
    );
  }

  if (/onde|atende|regi[aã]o|bh|contagem|endere[cç]o/i.test(t)) {
    return variar(
      [
        "Atendemos Belo Horizonte e região metropolitana, com visita técnica sem custo.",
        "É BH e região metropolitana (Contagem e entorno). A visita técnica pra medir não é cobrada.",
      ],
      antes,
    );
  }

  if (/prazo|quando|demora|tempo/i.test(t)) {
    return variar(
      [
        "O prazo depende do tamanho e da agenda. Passando serviço e metragem eu já te digo a previsão.",
        "Varia com a metragem e o serviço — me diz os dois que eu falo o prazo.",
      ],
      antes,
    );
  }

  if (/obrigad|valeu|vlw|agradec/i.test(t)) {
    return variar(
      ["Eu que agradeço 😊 Qualquer coisa é só chamar.", "Imagina! Qualquer dúvida me chama aqui 😊"],
      antes,
    );
  }

  if (/^(oi|ola|olá|opa|bom dia|boa tarde|boa noite|tudo bem|e ai|e aí)[\s!.?]*$/i.test(t)) {
    if (ctx.primeiro) {
      return variar(
        [
          "Oi! Tudo bem? 😊 Aqui é a Módulo Interiores, de BH. O que você precisa — forro, parede, piso ou móvel sob medida?",
          "Olá! Tudo certo por aqui 😊 Módulo Interiores. Me conta o que você quer fazer que eu já te oriento.",
        ],
        antes,
      );
    }
    return variar(
      ["Oi de novo! 😊 Seguimos no que você precisa?", "Oi! Continuo por aqui — o que você quer fazer?"],
      antes,
    );
  }

  return variar(
    [
      "Entendi. É forro, parede, piso ou móvel? Com o serviço e a metragem eu já te oriento no valor.",
      "Me diz o serviço (forro, parede, piso, móvel) e a metragem que eu já respondo certinho.",
    ],
    antes,
  );
}
