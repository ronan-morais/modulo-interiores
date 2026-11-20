import { maintenance, services, site } from "@/lib/site";

const serviceCatalog = [...services, maintenance];

const businessId = `${site.url}/#business`;
const websiteId = `${site.url}/#website`;

export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
        "@id": businessId,
        name: site.name,
        url: site.url,
        description: site.description,
        telephone: site.phone.e164,
        email: site.email,
        image: `${site.url}/images/og-modulo-interiores.jpg`,
        logo: `${site.url}/icon.svg`,
        priceRange: "$$",
        sameAs: [site.instagramUrl],
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          addressRegion: site.address.state,
          addressCountry: site.address.country,
        },
        areaServed: site.areasServed.map((city) => ({
          "@type": "City",
          name: city,
        })),
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Saturday"],
            opens: "08:00",
            closes: "12:00",
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Serviços de drywall, forros e pisos",
          itemListElement: serviceCatalog.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.title,
              description: service.pageDescription,
              serviceType: service.category,
              areaServed: site.areasServed.map((city) => ({
                "@type": "City",
                name: city,
              })),
              provider: { "@id": businessId },
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: site.url,
        name: site.name,
        inLanguage: "pt-BR",
        publisher: { "@id": businessId },
      },
    ],
  };
}

export function breadcrumbSchema(
  crumbs: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  };
}

export function serviceListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Serviços da Módulo Interiores",
    itemListElement: serviceCatalog.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.pageDescription,
        serviceType: service.category,
        url: `${site.url}/servicos#${service.id}`,
        provider: { "@id": businessId },
      },
    })),
  };
}

export function quotePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Orçamento online",
    url: `${site.url}/orcamento`,
    description:
      "Solicite um orçamento de drywall, forros e pisos em Belo Horizonte e região metropolitana.",
    mainEntity: { "@id": businessId },
  };
}
