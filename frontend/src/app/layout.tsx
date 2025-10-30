import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRIBUT.AI - RAG Agent",
  description: "Sistema de chat com documentos usando RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body className="min-h-screen bg-neutral">
        {children}
      </body>
    </html>
  );
}
