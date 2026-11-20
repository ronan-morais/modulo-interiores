export const site = {
  name: "Módulo Interiores",
  shortName: "Módulo",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://modulointeriores.com.br",
  description:
    "Instalação e manutenção a seco em Belo Horizonte: drywall, forros de PVC, modular e gesso, piso modular e vinílico. Obra sem quebra-quebra, com prazo curto e imóvel em uso.",
  phone: {
    display: "(31) 99740-8629",
    href: "tel:+5531997408629",
    e164: "+5531997408629",
  },
  whatsapp: {
    display: "(31) 99740-8629",
    number: "5531997408629",
    href: "https://wa.me/5531997408629",
  },
  email: "contato@modulointeriores.com.br",
  instagram: "@modulointeriores",
  instagramUrl: "https://www.instagram.com/modulointeriores",
  address: {
    street: "Rua dos Aimorés, 1200",
    district: "Funcionários",
    city: "Belo Horizonte",
    state: "MG",
    country: "BR",
    postalCode: "",
  },
  areasServed: [
    "Belo Horizonte",
    "Contagem",
    "Betim",
    "Nova Lima",
    "Sabará",
    "Ibirité",
  ],
  coverageCities: ["Belo Horizonte", "Contagem", "Nova Lima", "Ibirité"],
  openingHours: [
    { days: "Segunda a sexta", hours: "8h às 18h" },
    { days: "Sábado", hours: "8h às 12h" },
  ],
} as const;

export type Service = {
  id: string;
  index: string;
  category: string;
  title: string;
  homeDescription: string;
  pageDescription: string;
  lead: string;
  bullets: string[];
  image: string;
  alt: string;
};

export const services: Service[] = [
  {
    id: "divisorias-drywall",
    index: "01",
    category: "Divisórias",
    title: "Paredes e divisórias em drywall",
    homeDescription:
      "Parede nova sem alvenaria, com isolamento acústico e acabamento pronto para pintura.",
    pageDescription:
      "Estrutura metálica com montantes reforçados, isolamento em lã de vidro e fechamento em placas. A parede nasce pronta para pintura, com portas, batentes e rodapé no mesmo acabamento — sem demolição, sem argamassa e sem entulho dentro de casa.",
    lead: "Ambiente novo no lugar de uma parede que não existia, em poucos dias.",
    bullets: [
      "Divisórias acústicas e corta-fogo",
      "Nichos, sancas e prateleiras embutidas",
      "Pronto para pintura, com portas e rodapé",
    ],
    image: "/images/divisorias-drywall-bh.webp",
    alt: "Sala integrada com divisória em drywall e porta de vidro",
  },
  {
    id: "forro-pvc",
    index: "02",
    category: "Forro",
    title: "Forro de PVC",
    homeDescription:
      "Lavável e resistente à umidade, instalado sem quebrar o revestimento.",
    pageDescription:
      "Placas de PVC com perfis aparentes ou ocultos, resistentes à umidade e fáceis de lavar. Instalação seca sobre a laje existente, sem quebrar revestimento nem tirar o ambiente de uso por muito tempo.",
    lead: "Área molhada resolvida sem quebra de alvenaria.",
    bullets: [
      "100% lavável e resistente à umidade",
      "Instalação seca, sem quebra de alvenaria",
      "Troca de placas sem obra",
    ],
    image: "/images/forro-pvc-bh.webp",
    alt: "Forro de PVC instalado em banheiro com iluminação embutida",
  },
  {
    id: "forro-modular",
    index: "03",
    category: "Forro",
    title: "Forro modular",
    homeDescription:
      "Placas removíveis com acesso à infraestrutura elétrica e hidráulica.",
    pageDescription:
      "Malha de sustentação oculta com placas removíveis, permitindo acesso à infraestrutura elétrica e hidráulica sem obra. Muito usado em escritórios, lojas e clínicas que não podem parar.",
    lead: "Manutenção simples, com a operação rodando.",
    bullets: [
      "Placas removíveis para infraestrutura",
      "Malha alinhada ao layout e à iluminação",
      "Integração com luminárias e difusores",
    ],
    image: "/images/forro-modular-bh.webp",
    alt: "Forro modular instalado em corredor de escritório",
  },
  {
    id: "forro-placa-gesso",
    index: "04",
    category: "Forro",
    title: "Forro em placa de gesso",
    homeDescription:
      "Sancas, rebaixos e luz embutida desenhados para cada ambiente.",
    pageDescription:
      "Sancas, rebaixos, cortineiros e iluminação indireta desenhados sob medida, montados em estrutura seca sob a laje. Acabamento em gesso liso ou massa corrida, sem emendas aparentes.",
    lead: "Desenho de luz que valoriza cada ambiente.",
    bullets: [
      "Sancas, rebaixos e cortineiros",
      "Iluminação indireta e spots embutidos",
      "Acabamento em gesso liso ou massa",
    ],
    image: "/images/forro-gesso-bh.webp",
    alt: "Sala de estar com forro de gesso e iluminação indireta",
  },
  {
    id: "piso-modular",
    index: "05",
    category: "Piso",
    title: "Piso modular",
    homeDescription:
      "Piso elevado com acesso ao cabeamento, instalado sem parar a operação.",
    pageDescription:
      "Placas elevadas de alta resistência sobre pedestais, com acesso rápido ao piso técnico. Para salas de servidores, lojas, auditórios e áreas com cabeamento — instalado sem parar a operação.",
    lead: "Piso técnico com acesso imediato à infraestrutura.",
    bullets: [
      "Acesso rápido ao piso técnico",
      "Alta resistência a carga e tráfego",
      "Instalação sem parar a operação",
    ],
    image: "/images/piso-modular-bh.webp",
    alt: "Escritório amplo com piso modular elevado",
  },
  {
    id: "piso-vinilico",
    index: "06",
    category: "Piso",
    title: "Piso vinílico",
    homeDescription:
      "Aplicado sobre o piso atual, com conforto acústico e limpeza fácil.",
    pageDescription:
      "Régua, manta ou placa adesiva, em camadas de uso residencial e comercial. Aplicado sobre o piso existente: sem quebra-quebra, sem entulho e com o ambiente de volta no mesmo dia.",
    lead: "Acabamento quente, silencioso e resistente.",
    bullets: [
      "Régua, manta ou placa adesiva",
      "Aplicação sobre piso existente",
      "Conforto acústico e limpeza fácil",
    ],
    image: "/images/piso-vinilico-bh.webp",
    alt: "Sala de estar com piso vinílico claro",
  },
];

export const maintenance = {
  id: "manutencao",
  index: "07",
  category: "Manutenção",
  title: "Manutenção e reparo",
  homeDescription:
    "Reparo pontual, troca de placas e revisão de acabamento em paredes, forros e pisos, sem obra no restante do imóvel.",
  pageDescription:
    "Reparo pontual, troca de placas e revisão de acabamento em paredes, forros e pisos já instalados. A intervenção fica restrita ao ponto danificado, sem demolição e sem parar o imóvel inteiro.",
  bullets: [
    "Reparo pontual em placas e emendas",
    "Troca de placas de forro e parede",
    "Revisão de forro já instalado",
  ],
} as const;

export const maintenanceWhatsappHref = `${site.whatsapp.href}?text=${encodeURIComponent(
  "Olá! Preciso de manutenção em parede, forro ou piso.",
)}`;

export const quoteOptions = [
  ...services.map(({ id, index, title }) => ({ id, index, title })),
  { id: maintenance.id, index: maintenance.index, title: maintenance.title },
];

export type Advantage = {
  index: string;
  title: string;
  description: string;
};

export const advantages: Advantage[] = [
  {
    index: "01",
    title: "Sem demolição",
    description:
      "Perfis, placas e painéis chegam prontos. Nada de quebrar alvenaria ou carregar entulho pela casa.",
  },
  {
    index: "02",
    title: "Prazo previsível",
    description:
      "A etapa seca não espera cura de cimento nem secagem de argamassa.",
  },
  {
    index: "03",
    title: "Imóvel em uso",
    description:
      "Obra por etapas, com piso e móveis protegidos e limpeza ao fim de cada dia.",
  },
];

export const navLinks = [
  { label: "Serviços", href: "/servicos" },
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Contato", href: "/#contato" },
];
