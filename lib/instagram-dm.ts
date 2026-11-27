/**
 * Atendimento do Direct da Módulo: respostas curtas, humanas e sem repetição.
 *
 * Regras do Ronan (27/11/2026):
 * - nada de link do site em toda resposta (gera miniatura no chat). Só manda
 *   link quando a pessoa pedir o site/link explicitamente.
 * - a resposta não pode repetir a anterior da mesma conversa.
 * - quando a pessoa pergunta valor, pede metragem e serviço antes de opinar.
 */
const SITE = "modulointeriores.com.br";
const WHATS = "(31) 99740-8629";

export type Contexto = {
  primeiro: boolean;
  anteriores: string[];
};

function normal(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escolher(opcoes: string[], anteriores: string[], semente: string): string {
  const livres = opcoes.filter((o) => !anteriores.includes(o));
  const lista = livres.length > 0 ? livres : opcoes;
  let soma = 0;
  for (let i = 0; i < semente.length; i += 1) soma += semente.charCodeAt(i);
  return lista[soma % lista.length];
}

const TEM = (t: string, palavras: string[]) => palavras.some((p) => t.includes(p));

export function temPedidoDeLink(t: string): boolean {
  return TEM(t, ["link", "site", "endereco do site", "pagina", "formulario"]);
}

export function responder(texto: string, ctx: Contexto): string {
  const t = normal(texto);
  const antes = ctx.anteriores ?? [];
  const escolha = (opcoes: string[]) => escolher(opcoes, antes, t);

  if (TEM(t, ["parar", "nao quero", "sair"])) {
    return "Tudo bem, sem problema. Se precisar é só chamar por aqui 😊";
  }

  if (temPedidoDeLink(t)) {
    return (
      `O site é ${SITE} — o orçamento fica em ${SITE}/orcamento e os serviços em ${SITE}/servicos. ` +
      `Se preferir, eu mesmo já monto o orçamento por aqui: me diz o serviço e a metragem.`
    );
  }

  if (TEM(t, ["quanto custa", "quanto fica", "preco", "valor", "quanto sai", "custa"])) {
    return escolha([
      "O valor depende da metragem e do que vai ser feito. Me diz o serviço e o tamanho aproximado do ambiente que eu já te passo uma faixa.",
      "Pra te dar um número eu preciso de duas coisas: o serviço e a metragem. Me conta que eu já te oriento.",
      "Muda bastante entre forro, parede e piso. Qual é o seu caso e quantos metros, mais ou menos?",
    ]);
  }

  if (TEM(t, ["orcamento", "cotacao", "cotar", "simular"])) {
    return escolha([
      "Eu monto o orçamento por aqui mesmo: me diz o serviço, a metragem e o bairro. Se preferir, o site da Módulo tem o formulário que faz essa conta.",
      "Consigo levantar agora: serviço, metragem e bairro. Também tem o formulário no site da Módulo, se você preferir preencher sozinho.",
    ]);
  }

  if (TEM(t, ["telefone", "whatsapp", "zap", "contato", "email", "e-mail", "numero"])) {
    return escolha([
      `WhatsApp ${WHATS} — é o caminho mais rápido. O site da Módulo também tem contato e formulário, se preferir por lá.`,
      `Pode chamar no ${WHATS}. Se quiser ver tudo antes, o site da Módulo tem os serviços e o contato completo.`,
    ]);
  }

  if (TEM(t, ["onde", "atende", "atendem", "regiao", "bh", "belo horizonte", "contagem", "endereco"])) {
    return escolha([
      "Atendemos Belo Horizonte e região metropolitana, com visita técnica sem custo. De qual bairro você fala?",
      "Trabalhamos em BH e região (Contagem, Betim, Santa Luzia). A visita pra medir é sem custo.",
    ]);
  }

  if (TEM(t, ["prazo", "quando fica", "demora", "tempo", "entrega"])) {
    return escolha([
      "O prazo depende do tamanho e da agenda da equipe. Passando o serviço e a metragem eu já te digo a previsão.",
      "Forro e parede são rápidos; obra maior entra em agenda. Me diz o tamanho que eu te passo a previsão real.",
    ]);
  }

  if (TEM(t, ["drywall", "parede", "divisoria", "forro", "pvc", "gesso", "modular", "piso", "vinilico", "movei", "sanca"])) {
    return escolha([
      "Trabalhamos com isso: projeto, estrutura e acabamento, com equipe própria. Me conta o ambiente e a metragem que eu já te oriento e passo a faixa de valor.",
      "É um dos nossos serviços — do projeto ao acabamento pronto pra pintar. Quantos metros, mais ou menos, e em qual ambiente?",
    ]);
  }

  if (ctx.primeiro || TEM(t, ["oi", "ola", "bom dia", "boa tarde", "boa noite", "tudo bem", "opa"])) {
    return escolha([
      "Oi! Tudo bem? 😊 Aqui é a Módulo Interiores, de BH — drywall, forros, pisos e móveis sob medida. O que você está precisando?",
      "Olá! Tudo certo por aqui 😊 Módulo Interiores. Me conta o que você quer fazer que eu já te oriento.",
      "Oi! Tudo bem? Me diz o ambiente e o que você quer fazer que eu te ajudo a chegar no valor.",
    ]);
  }

  if (TEM(t, ["obrigad", "valeu", "vlw", "agradec"])) {
    return escolha([
      "Eu que agradeço 😊 Qualquer coisa é só chamar por aqui.",
      "Imagina! Tô por aqui se precisar.",
    ]);
  }

  return escolha([
    "Me conta um pouco mais: é forro, parede, piso ou móvel sob medida? Com isso eu já te oriento e passo a faixa de valor.",
    "Pra eu te ajudar direito: qual serviço você precisa e qual o tamanho do ambiente?",
    "Consigo te orientar sim. Me diz o que você quer fazer e quantos metros, mais ou menos.",
  ]);
}
