import type { Metadata, Viewport } from "next";
import { PROFILE } from "@/content/chapters";
import { OG_BASE, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { archivo, pressStart } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PROFILE.name} — Portfolio: el juego`,
    template: `%s · ${PROFILE.name}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: PROFILE.name, url: PROFILE.github }],
  openGraph: {
    ...OG_BASE,
    title: `${PROFILE.name} — Portfolio: el juego`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E1220",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${pressStart.variable} ${archivo.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
