import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  title: "PjBL SPtLDV — Dapur Matematika Tata Boga",
  description:
    "Platform Project Based Learning Sistem Pertidaksamaan Linear Dua Variabel untuk siswa SMK Tata Boga. Masak angka, racik solusi.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${jakarta.variable} ${grotesk.variable}`}>
      <body className="grain min-h-screen">{children}</body>
    </html>
  );
}
