import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppExperience from "./components/AppExperience";

export const metadata: Metadata = {
  title: "Fogo na Brasa | Sabor que vem do fogo",
  description: "Hambúrgueres, churrasco, lanches e muito mais. Peça no Fogo na Brasa em Canoas, RS.",
};
export const viewport: Viewport = { themeColor: "#171514", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const buildVersion = process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version || "local";
  return (
    <html lang="pt-BR">
      <body>
        <AppExperience buildVersion={buildVersion}>{children}</AppExperience>
      </body>
    </html>
  );
}
