import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "CRM", template: "%s · CRM | Módulo Interiores" },
  robots: { index: false, follow: false, nocache: true },
};

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
