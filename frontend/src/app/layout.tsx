/**
 * Root Layout.
 * Wraps the entire application and configures global fonts, styles, and metadata.
 */
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic"], display: "swap" });

export const metadata: Metadata = {
  title: "منصة راصد",
  description: "منصة للإبلاغ عن مشاكل محطات الكهرباء",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${cairo.className} bg-zinc-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
