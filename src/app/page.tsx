import type { Metadata } from "next";
import Link from "next/link";
import Game from "@/components/game/Game";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* Para teclado y lectores de pantalla: la versión de solo texto (visible al recibir foco). */}
      <Link
        href="/lectura"
        className="btn btn-gold sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70]"
      >
        IR A LA VERSIÓN DE SOLO TEXTO
      </Link>
      <noscript>
        <p className="fixed inset-x-0 top-0 z-[80] bg-panel p-4 text-center">
          El juego necesita JavaScript. <a href="/lectura" className="text-gold underline">Leé el portfolio en versión texto</a>.
        </p>
      </noscript>
      <Game />
    </>
  );
}
