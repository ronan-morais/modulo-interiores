import type { Metadata } from "next";
import { site } from "@/lib/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  absoluteTitle?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  image = "/images/og-modulo-interiores.jpg",
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const url = `${site.url}${path}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url,
      siteName: site.name,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "Interiores executados pela Módulo Interiores em Belo Horizonte",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
