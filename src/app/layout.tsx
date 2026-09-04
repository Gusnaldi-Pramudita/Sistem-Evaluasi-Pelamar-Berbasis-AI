import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanso | Evaluasi Pelamar",
  description: "Sistem evaluasi CV berbasis AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
