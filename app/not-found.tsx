import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo" className="not-found">
        <div className="container">
          <p className="eyebrow">Erro 404</p>
          <h1>Página não encontrada</h1>
          <p>
            O endereço pode ter mudado. Volte ao início ou peça um orçamento
            online.
          </p>
          <Link className="btn btn-dark btn-md" href="/">
            Voltar ao início
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
