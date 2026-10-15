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
      <body className="min-h-full bg-[#F8FAFC] text-[#0B1B3D] antialiased selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
