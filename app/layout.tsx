import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { businessSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import "./globals.css";

const GTM_ID = "GTM-PW6XJWCB";
const gtmEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_GTM_ENABLED === "true";

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
    default: "Drywall, sancas, forros e pisos em Belo Horizonte | Módulo Interiores",
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
    "parede de drywall",
    "forro de drywall",
    "sanca de gesso",
    "rebaixamento de teto",
    "armário de drywall",
    "closet em drywall",
    "guarda-roupa em drywall",
    "nicho de drywall",
    "forro de PVC BH",
    "forro modular",
    "forro de gesso",
    "piso modular",
    "piso vinílico",
    "instalação de forro",
    "manutenção de forro",
    "reparo de drywall",
    "reforma comercial BH",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.name,
    title: "Drywall, sancas, forros e pisos em Belo Horizonte | Módulo Interiores",
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
    title: "Drywall, sancas, forros e pisos em Belo Horizonte | Módulo Interiores",
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
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        {children}
        <Reveal />
        <JsonLd data={businessSchema()} />
        {gtmEnabled ? (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
