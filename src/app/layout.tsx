import type { Metadata } from "next";
import { archivo, pressStart } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nahuel Cernadas — Portfolio: el juego",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${pressStart.variable} ${archivo.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
