"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, Calendar, Clock, CheckCircle2, MessageSquare,
  ShieldCheck, MapPin, Phone, ArrowRight, Tag, Percent,
  Scissors, Heart, Star, ChevronRight, Gift
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function GuestDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function fetchDeals() {
      setLoading(true);
      try {
        const branches = await apiFetch("/public/branches/");
        const bList = Array.isArray(branches) ? branches : [];
        let allServices: any[] = [];
        if (bList.length > 0) {
          const catalog = await apiFetch(`/public/catalog/?branch_id=${bList[0].id}`);
          allServices = catalog.services || [];
        }
        const dealList = allServices.filter(
          (s: any) =>
            s.category?.toLowerCase().includes("deal") ||
            s.category?.toLowerCase().includes("package") ||
            s.name?.toLowerCase().includes("deal") ||
            s.name?.toLowerCase().includes("package")
        );
        setDeals(dealList);
      } catch (e) {
        console.error("Failed to load deals", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  const parseDealDetails = (description: string = "") => {
    const valueMatch = description.match(/Valued at Rs\.?\s*([\d,]+)/i) || description.match(/Normal Value:?\s*Rs\.?\s*([\d,]+)/i);
    const originalPrice = valueMatch ? valueMatch[1] : null;

    const saveMatch = description.match(/Save\s*(\d+%?)/i);
    const savings = saveMatch ? saveMatch[1] : null;

    let cleanText = description.replace(/\([^)]*\)/g, "").trim();
    const items = cleanText
      .split(/[+·\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.toLowerCase().startsWith("valued at"));

    return { originalPrice, savings, items };
  };

  const filteredDeals = deals.filter((deal) => {
    if (selectedCategory === "all") return true;
    return deal.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = Array.from(new Set(deals.map((d) => d.category))).filter(Boolean);

  const getWhatsAppLink = (deal: any) => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum SHAY Salon & Spa Karachi! I would like to book "${deal.name}" (Rs. ${Number(deal.base_price).toLocaleString()} PKR). Could you please let me know the available time slots for Clifton / DHA today or this weekend?`
    );
    return `https://wa.me/923001234567?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#faf7f4] text-[#1b1520] flex flex-col font-sans selection:bg-[#fbe9ef] selection:text-[#a3214f]">
      {/* Header / Navbar */}
      <header className="border-b border-[#e7dfd8] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fbe9ef] to-[#f6d7e2] border border-[#f3cad8] flex items-center justify-center text-[#a3214f] shadow-xs group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-[#a3214f]" />
            </div>
            <div>
              <span className="text-xl font-serif tracking-wider font-bold text-[#1b1520] block leading-none">
                SHAY
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-[#7a7180] font-semibold mt-0.5">
                Salon &amp; Spa Collective · Karachi
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/book"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#a3214f] to-[#88183f] hover:from-[#8b1b42] hover:to-[#6f1232] text-white text-xs font-bold transition shadow-sm transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-[#e7dfd8] hover:bg-[#faf7f4] text-[#1b1520] text-xs font-bold transition"
            >
              <ShieldCheck className="w-4 h-4 text-[#a3214f]" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 text-center bg-gradient-to-b from-white to-[#faf7f4] border-b border-[#e7dfd8]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-rose-200/30 via-pink-100/20 to-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] text-[11px] font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Gift className="w-3.5 h-3.5" />
            <span>Karachi Signature Combos &amp; Seasonal Packages</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#1b1520] leading-tight mb-4">
            Luxury Grooming &amp; Spa Deals
          </h1>
          <p className="text-sm sm:text-base text-[#5c5464] max-w-2xl leading-relaxed">
            Experience Karachi&apos;s finest styling, restorative Hydra facials, and couture wedding rituals. 
            Enjoy up to 35% savings with our curated all-inclusive packages at Clifton and DHA Bukhari.
          </p>

          {/* Karachi Salon Hours & Branch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl text-left">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#e8dfd8] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#a3214f]">
                <MapPin className="w-4 h-4" />
                <span>Clifton Flagship Branch</span>
              </div>
              <p className="text-[11px] text-[#7a7180] mt-1">Block 4, Clifton · Near Bilawal House</p>
              <div className="mt-2 text-xs text-[#1b1520] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Mon–Thu: 11:00 AM – 10:30 PM | Fri–Sun: 11:00 AM – 11:00 PM</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#e8dfd8] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#a3214f]">
                <MapPin className="w-4 h-4" />
                <span>DHA Bukhari Commercial</span>
              </div>
              <p className="text-[11px] text-[#7a7180] mt-1">Bukhari Commercial Lane 3, Phase 6</p>
              <div className="mt-2 text-xs text-[#1b1520] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Mon–Thu: 11:30 AM – 10:30 PM | Fri–Sun: 11:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Deals Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition shadow-xs ${
              selectedCategory === "all"
                ? "bg-[#a3214f] text-white shadow-rose-900/20"
                : "bg-white text-zinc-700 border border-[#e8dfd8] hover:bg-[#faf7f4]"
            }`}
          >
            All Signature Deals ({deals.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition shadow-xs ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#a3214f] text-white shadow-rose-900/20"
                  : "bg-white text-zinc-700 border border-[#e8dfd8] hover:bg-[#faf7f4]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Deals Cards */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500">Loading exclusive Karachi salon packages...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-[#e8dfd8] p-12 text-center">
            <p className="text-zinc-500 text-sm">No packages currently found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal, idx) => {
              const { originalPrice, savings, items } = parseDealDetails(deal.description);
              const waUrl = getWhatsAppLink(deal);

              return (
                <div
                  key={deal.id}
                  className="bg-white rounded-3xl border border-[#e8dfd8] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 hover:border-rose-300 relative"
                >
                  {/* Top Badge */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#a3214f] via-[#d4af37] to-[#a3214f]" />

                  <div>
                    <div className="p-6 pb-4 border-b border-[#f4eee8] bg-[#faf7f4]">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-[#a3214f] uppercase tracking-wider">
                          Deal #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-600 font-medium bg-white px-2.5 py-0.5 rounded-full border border-[#e8dfd8]">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{deal.default_duration_minutes} mins</span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-xl text-[#1b1520] group-hover:text-[#a3214f] transition-colors leading-snug">
                        {deal.name}
                      </h3>

                      {/* Pricing Tag */}
                      <div className="mt-4 flex items-baseline gap-2.5">
                        <span className="font-serif font-extrabold text-2xl text-[#1b1520]">
                          Rs. {Number(deal.base_price).toLocaleString()}
                        </span>
                        {originalPrice && (
                          <span className="text-xs text-zinc-400 line-through font-medium">
                            Rs. {originalPrice}
                          </span>
                        )}
                        {savings && (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            Save {savings}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                        *Inclusive of SRB 13% tax &amp; premium imported products
                      </p>
                    </div>

                    {/* Inclusions */}
                    <div className="p-6 py-5 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Included Treatments:
                      </p>
                      <ul className="space-y-2.5">
                        {items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Booking Buttons */}
                  <div className="p-6 pt-0 border-t border-[#f4eee8] bg-[#faf7f4]/60">
                    <div className="pt-4 flex flex-col gap-2.5">
                      {/* WhatsApp 1-tap Booking */}
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm transform active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4 fill-white" />
                        <span>Book on WhatsApp</span>
                      </a>

                      {/* Web Appointment Booking */}
                      <Link
                        href={`/book?service=${deal.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-[#e8dfd8] text-xs font-semibold transition"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#a3214f]" />
                        <span>Book Online System</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating WhatsApp CTA */}
      <a
        href="https://wa.me/923001234567?text=Assalam-o-Alaikum%20SHAY%20Salon!%20I%20have%20an%20inquiry%20regarding%20deals%20and%20packages."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
      >
        <MessageSquare className="w-5 h-5 fill-white" />
        <span className="text-xs font-bold pr-1">Chat on WhatsApp</span>
      </a>

      {/* Footer */}
      <footer className="border-t border-[#e7dfd8] bg-white py-12 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="font-serif font-bold text-base text-[#1b1520]">SHAY</span>
            <span>·</span>
            <span>Karachi Luxury Salon &amp; Spa Collective</span>
          </div>
          <p className="max-w-md mx-auto text-zinc-400 text-[11px]">
            Operating across Clifton Flagship (Block 4) and DHA Bukhari Commercial (Phase 6).
            Appointments, VIP grooming suites, and bespoke bridal packages.
          </p>
          <div className="pt-2 text-[11px] text-zinc-400">
            &copy; {new Date().getFullYear()} SHAY Salon &amp; Spa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
