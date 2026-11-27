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

export function responder(texto: string, ctx: Contexto): string | null {
  const t = texto.toLowerCase().trim();
  const antes = ctx.anteriores ?? [];
  const pediuLink = /\blink\b|qual\s+o\s+site|manda\s+o\s+site/i.test(t);
  const reclamou = /j[aá]\s+falei|como\s+falei|repit|voce ja falou|você já falou/i.test(t);
  const servico = ctx.servico ?? null;
  const metragem = ctx.metragem ?? null;
  const assunto = servico ? `${servico}${metragem ? ` em ${metragem}` : ""}` : null;
  const jaFalouOrcamento = antes.some((r) => /formul[aá]rio|cota[cç][aã]o/i.test(r));
  const jaPediuDados = antes.some((r) => /teu nome|seu nome|bairro/i.test(r));

  if (pediuLink) {
    return variar(
      [
        `Claro: ${SITE}. O formulário de orçamento fica em ${ORCAMENTO} — preenchendo serviço e metragem a gente responde com o valor.`,
        `O site é ${SITE}, e o orçamento em ${ORCAMENTO}. Se preferir, me passa aqui serviço e metragem que eu já encaminho.`,
      ],
      antes,
    );
  }

  if (reclamou) {
    if (assunto && !metragem) {
      return `Desculpa a repetição. Já tenho o serviço: ${assunto}. Falta só a metragem — quantos m², mais ou menos?`;
    }
    if (assunto && metragem) {
      return jaPediuDados
        ? `Desculpa. Deixa comigo: ${assunto}, já tenho tudo. O Ronan te chama no WhatsApp pra fechar.`
        : `Desculpa a repetição. Anotei: ${assunto}. Me passa teu nome e o bairro que eu passo pro Ronan.`;
    }
    return "Desculpa. Me diz em uma frase o que você precisa (serviço + metragem) que eu já encaminho.";
  }

  if (/prazo|quando|demora|tempo/i.test(t)) {
    return variar(
      assunto
        ? [
            `Sobre ${assunto}: o prazo depende da agenda da equipe — eu confirmo a data com o Ronan e te falo.`,
            `${assunto} entra na agenda da semana; o Ronan confirma o dia exato.`,
          ]
        : [
            "O prazo depende do tamanho e da agenda. Passando serviço e metragem eu já te digo a previsão.",
            "Varia com a metragem e o serviço — me diz os dois que eu falo o prazo.",
          ],
      antes,
    );
  }

  if (/whats|telefone|n[uú]mero|contato|e-?mail/i.test(t)) {
    return variar(
      [
        "WhatsApp da Módulo: (31) 99740-8629. O site também tem o contato e o formulário de orçamento.",
        "Falo contigo pelo (31) 99740-8629 no WhatsApp. E no site da Módulo tem o contato e o orçamento online.",
      ],
      antes,
    );
  }

  if (/onde|atende|regi[aã]o|contagem|endere[cç]o/i.test(t)) {
    return variar(
      [
        "Atendemos Belo Horizonte e região metropolitana, com visita técnica sem custo.",
        "É BH e região metropolitana (Contagem e entorno). A visita pra medir não é cobrada.",
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

  if (/^(oi|ola|olá|opa|bom dia|boa tarde|boa noite|tudo bem|e aí)[\s!.?]*$/i.test(t)) {
    return variar(
      [
        "Oi! Tudo bem? 😊 Módulo Interiores, de BH. O que você precisa — forro, parede, piso ou móvel?",
        "Olá! Tudo certo 😊 Me conta o que você quer fazer que eu já te oriento.",
      ],
      antes,
    );
  }

  return null;
}
