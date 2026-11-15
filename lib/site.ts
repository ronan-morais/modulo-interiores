export const site = {
  name: "Módulo Interiores",
  shortName: "Módulo",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://modulointeriores.com.br",
  description:
    "Instalação e manutenção de paredes em drywall, forros de PVC, modular e gesso, e pisos em Belo Horizonte e região metropolitana.",
  phone: {
    display: "(31) 3213-4567",
    href: "tel:+553132134567",
  },
  whatsapp: {
    display: "(31) 99123-4567",
    number: "5531991234567",
    href: "https://wa.me/5531991234567",
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
      "Estrutura metálica, isolamento acústico e acabamento em gesso liso. Do traçado da planta à pintura final.",
    pageDescription:
      "Estrutura metálica com montantes reforçados, isolamento em lã de vidro e fechamento em placas. Entregamos pronto para pintura, com portas, batentes e rodapé no mesmo acabamento.",
    lead: "Criamos novos ambientes sem quebra-quebra, com obra seca e limpa.",
    bullets: [
      "Divisórias acústicas e corta-fogo",
      "Nichos, sancas e prateleiras embutidas",
      "Portas e batentes no mesmo acabamento",
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
      "Placas laváveis e resistentes à umidade para cozinhas, banheiros, varandas e áreas de serviço.",
    pageDescription:
      "Placas de PVC com perfis aparentes ou ocultos, resistentes à umidade e fáceis de lavar. Indicado para cozinhas, banheiros, varandas e áreas de serviço.",
    lead: "A solução mais rápida para ambientes molhados.",
    bullets: [
      "100% lavável e à prova de umidade",
      "Instalação sem quebra de alvenaria",
      "Manutenção com troca de placas",
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
      "Placas removíveis com malha de sustentação. Ideal para escritórios, lojas e manutenção sem obra.",
    pageDescription:
      "Malha de sustentação oculta com placas removíveis, permitindo acesso à infraestrutura elétrica e hidráulica sem obra. Muito usado em escritórios, lojas e clínicas.",
    lead: "Manutenção simples, sem interromper a operação.",
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
      "Sancas, rebaixos e iluminação embutida desenhados sob medida para cada ambiente.",
    pageDescription:
      "Sancas, rebaixos, cortineiros e iluminação indireta desenhados sob medida. Acabamento em gesso liso ou massa corrida, sem emendas aparentes.",
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
      "Placas elevadas de alta resistência para salas técnicas, lojas, auditórios e escritórios.",
    pageDescription:
      "Placas elevadas de alta resistência sobre pedestais, com acesso rápido ao piso técnico. Para salas de servidores, lojas, auditórios e áreas com cabeamento.",
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
      "Régua ou manta, conforto acústico e instalação rápida sobre piso existente, sem quebra-quebra.",
    pageDescription:
      "Régua, manta ou placa adesiva, em camadas de uso residencial e comercial. Instalação sobre piso existente, com conforto acústico e limpeza fácil.",
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

export const navLinks = [
  { label: "Serviços", href: "/servicos" },
  { label: "Obras", href: "/#obras" },
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Contato", href: "/#contato" },
];
