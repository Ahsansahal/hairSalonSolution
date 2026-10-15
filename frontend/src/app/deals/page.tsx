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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1B3D] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header / Navbar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-xl font-serif tracking-wider font-bold text-[#0B1B3D] block leading-none">
                SHAY
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5">
                Salon &amp; Spa Collective · Karachi
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/book"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0B1B3D] to-[#12285A] hover:bg-[#0A1931] text-amber-300 text-xs font-bold transition shadow-sm transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-[#0B1B3D] text-xs font-bold transition"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 text-center bg-gradient-to-b from-white to-[#F8FAFC] border-b border-slate-200">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-200/20 via-slate-100/30 to-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>Karachi Signature Combos &amp; Seasonal Packages</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0B1B3D] leading-tight mb-4">
            Luxury Grooming &amp; Spa Deals
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Experience Karachi&apos;s finest styling, restorative Hydra facials, and couture wedding rituals. 
            Enjoy up to 35% savings with our curated all-inclusive packages at Clifton and DHA Bukhari.
          </p>

          {/* Karachi Salon Hours & Branch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl text-left">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                <MapPin className="w-4 h-4" />
                <span>Clifton Flagship Branch</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Block 4, Clifton · Near Bilawal House</p>
              <div className="mt-2 text-xs text-[#0B1B3D] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Mon–Thu: 11:00 AM – 10:30 PM | Fri–Sun: 11:00 AM – 11:00 PM</span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                <MapPin className="w-4 h-4" />
                <span>DHA Bukhari Commercial</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Bukhari Commercial Lane 3, Phase 6</p>
              <div className="mt-2 text-xs text-[#0B1B3D] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
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
                ? "bg-[#0B1B3D] text-amber-400 font-bold shadow-md ring-1 ring-amber-400/40"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
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
                  ? "bg-[#0B1B3D] text-amber-400 font-bold shadow-md ring-1 ring-amber-400/40"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Deals Cards */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading exclusive Karachi salon packages...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-sm">No packages currently found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal, idx) => {
              const { originalPrice, savings, items } = parseDealDetails(deal.description);
              const waUrl = getWhatsAppLink(deal);

              return (
                <div
                  key={deal.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 hover:border-amber-300 relative"
                >
                  {/* Top Badge */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#0B1B3D] via-amber-500 to-[#0B1B3D]" />

                  <div>
                    <div className="p-6 pb-4 border-b border-slate-100 bg-[#F8FAFC]">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                          Deal #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{deal.default_duration_minutes} mins</span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-xl text-[#0B1B3D] group-hover:text-amber-700 transition-colors leading-snug">
                        {deal.name}
                      </h3>

                      {/* Pricing Tag */}
                      <div className="mt-4 flex items-baseline gap-2.5">
                        <span className="font-serif font-extrabold text-2xl text-[#0B1B3D]">
                          Rs. {Number(deal.base_price).toLocaleString()}
                        </span>
                        {originalPrice && (
                          <span className="text-xs text-slate-400 line-through font-medium">
                            Rs. {originalPrice}
                          </span>
                        )}
                        {savings && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Save {savings}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
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
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
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
