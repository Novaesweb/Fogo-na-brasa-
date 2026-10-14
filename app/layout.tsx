import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Fogo na Brasa | Sabor que vem do fogo", description: "Hambúrgueres, churrasco, lanches e muito mais. Peça no Fogo na Brasa em Canoas, RS." };
export const viewport: Viewport = { themeColor: "#171514", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
