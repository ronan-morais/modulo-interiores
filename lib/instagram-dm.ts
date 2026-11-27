/**
 * Atendimento automático do Direct do Instagram da Módulo.
 *
 * Regras (espelham /opt/data/modulo/ig/dm_auto.py):
 * - tom de atendente humano, PT-BR, mineiro leve
 * - nunca inventa preço: explica que depende da metragem e manda pro site
 * - sempre encaminha para /servicos ou /orcamento
 * - se a pessoa pedir atendente humano, chama o Ronan no WhatsApp
 */
export const SITE = "https://modulointeriores.com.br";
export const WHATSAPP = "(31) 99740-8629";
export const LINK_ORCAMENTO = `${SITE}/orcamento`;
export const LINK_SERVICOS = `${SITE}/servicos`;

function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function has(text: string, ...words: string[]): boolean {
  return words.some((word) => text.includes(normalize(word).trim()));
}

export function responder(texto: string, primeiroContato: boolean): string {
  const t = normalize(texto);
  const saudacao = primeiroContato ? "Oi! Tudo bem? 😊" : "Tudo bem!";

  if (has(t, "parar", "atendente humano", "falar com alguem", "falar com o ronan", "humano")) {
    return `Claro! Já chamei o Ronan da Módulo pra falar direto com você 😊 Se quiser adiantar, o WhatsApp dele é ${WHATSAPP}.`;
  }

  if (has(t, "obrigad", "valeu", "vlw", "brigad")) {
    return `Imagina! Qualquer coisa é só chamar aqui 😊 Quando quiser, a cotação sai em 2 minutos: ${LINK_ORCAMENTO}`;
  }

  if (
    has(
      t,
      "preco",
      "preço",
      "valor",
      "quanto custa",
      "quanto fica",
      "quanto sai",
      "quanto e",
      "orcamento",
      "orçamento",
      "cotacao",
      "cotação",
      "cotar",
      "quanto voces cobram",
    )
  ) {
    return `${saudacao} O valor depende da metragem e do que vai ser feito (parede, forro, piso, móvel). A gente calcula certinho pelo site, é rapidinho e volta com o orçamento: ${LINK_ORCAMENTO}\nSe preferir, me passa aqui a metragem e o tipo de serviço que eu te adianto.`;
  }

  if (has(t, "prazo", "quanto tempo", "demora", "quando pode", "agenda", "disponibilidade")) {
    return `Os forros e paredes saem rápido: serviço pequeno costuma ficar entre 3 e 7 dias, obra maior a gente monta o cronograma junto no orçamento. Me conta o que você precisa que eu te passo o prazo: ${LINK_ORCAMENTO}`;
  }

  if (has(t, "onde", "atende", "atendem", "regiao", "região", "endereco", "endereço", "bh", "belo horizonte", "contagem")) {
    return `A gente atende Belo Horizonte e Contagem 😊 O atendimento é na obra e no escritório, agendado. Dá uma olhada nos serviços e fala com a gente por aqui: ${LINK_SERVICOS}`;
  }

  if (has(t, "telefone", "whatsapp", "whats", "numero", "número", "contato", "email", "e-mail")) {
    return `Nosso WhatsApp é ${WHATSAPP} 📱 e o e-mail contato@modulointeriores.com.br. O formulário do site também cai direto pra gente: ${LINK_ORCAMENTO}`;
  }

  if (
    has(
      t,
      "drywall",
      "forro",
      "pvc",
      "piso",
      "vinilico",
      "vinílico",
      "sanca",
      "movel",
      "móvel",
      "parede",
      "divisoria",
      "divisória",
      "rebaixamento",
      "manutencao",
      "manutenção",
      "acustico",
      "acústico",
      "closet",
      "nicho",
      "modular",
      "la de vidro",
      "lã de vidro",
      "teto",
    )
  ) {
    return `${saudacao} Trabalhamos com drywall, forros (inclusive PVC e modular), pisos, móveis sob medida e manutenção — obra a seco, sem quebra-quebra. Veja os detalhes: ${LINK_SERVICOS}\nPra cotar o seu caso é só preencher aqui: ${LINK_ORCAMENTO}`;
  }

  if (has(t, "oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "tudo bem", "opa", "e ai", "e aí")) {
    const opcoes = [
      `Oi! Tudo bem? 😊 Aqui é da Módulo Interiores, de BH — drywall, forros e pisos. Como posso te ajudar? Se já quiser adiantar, os serviços estão em ${LINK_SERVICOS}`,
      `Olá! Tudo ótimo 😊 Módulo Interiores aqui. Me conta o que você está precisando que eu já te oriento — ou dá uma olhada em ${LINK_SERVICOS}`,
    ];
    let soma = 0;
    for (let i = 0; i < texto.length; i += 1) soma += texto.charCodeAt(i);
    return opcoes[soma % opcoes.length];
  }

  return `${saudacao} Aqui é da Módulo Interiores, de BH — drywall, forros, pisos e móveis sob medida. Me conta o que você precisa (e a metragem, se souber) que eu te ajudo. Os serviços e o formulário de cotação estão no site: ${LINK_ORCAMENTO}`;
}
