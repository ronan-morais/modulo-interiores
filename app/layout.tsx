import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { businessSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Drywall, forros e pisos em Belo Horizonte | Módulo Interiores",
    template: "%s | Módulo Interiores",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "drywall Belo Horizonte",
    "divisórias em drywall",
    "forro de PVC BH",
    "forro modular",
    "forro de gesso",
    "piso modular",
    "piso vinílico",
    "instalação de forro",
    "reforma comercial BH",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.name,
    title: "Drywall, forros e pisos em Belo Horizonte | Módulo Interiores",
    description: site.description,
    images: [
      {
        url: "/images/og-modulo-interiores.jpg",
        width: 1200,
        height: 630,
        alt: "Interiores executados pela Módulo Interiores em Belo Horizonte",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drywall, forros e pisos em Belo Horizonte | Módulo Interiores",
    description: site.description,
    images: ["/images/og-modulo-interiores.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "home services",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15171A",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${hanken.variable} ${plexMono.variable}`}
    >
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        {children}
        <JsonLd data={businessSchema()} />
      </body>
    </html>
  );
}
