import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SHAY | Luxury Salon & Spa Collective (Karachi)",
  description: "Haute coiffure, bridal artistry, balayage, and sanctuary wellness across Clifton & DHA, Karachi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#faf7f4] text-[#1b1520] antialiased selection:bg-[#fbe9ef] selection:text-[#a3214f]">
        {children}
      </body>
    </html>
  );
}
