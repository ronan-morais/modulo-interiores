import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import PrivacidadePage from "../privacidade/page";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidade",
  description: "Como a Módulo Interiores trata os dados enviados no formulário de cotação online.",
  path: "/politica-de-privacidade",
});

export default PrivacidadePage;
