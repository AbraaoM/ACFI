import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACFI - RAG Agent",
  description: "Sistema de chat com documentos usando RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="acfi-theme">
      <body className="min-h-screen bg-acfi-neutral">
        {children}
      </body>
    </html>
  );
}
