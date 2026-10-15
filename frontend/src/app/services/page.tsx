"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, Calendar, Clock, CheckCircle2, MessageSquare,
  ShieldCheck, MapPin, Phone, ArrowRight, Tag,
  Scissors, Heart, Star, ChevronRight, Gift, Eye, HelpCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export default function GuestServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const branches = await apiFetch("/public/branches/");
        const bList = Array.isArray(branches) ? branches : [];
        let allServices: any[] = [];
        if (bList.length > 0) {
          const catalog = await apiFetch(`/public/catalog/?branch_id=${bList[0].id}`);
          allServices = catalog.services || [];
        } else {
          allServices = await apiFetch("/public/services/");
        }
        // Filter for individual single services (not packages/deals)
        const singles = allServices.filter(
          (s: any) =>
            !s.category?.toLowerCase().includes("deal") &&
            !s.name?.toLowerCase().includes("deal") &&
            s.category !== "30 Men's Deals"
        );
        setServices(singles);
      } catch (e) {
        console.error("Failed to load services", e);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const categories = Array.from(new Set(services.map((s) => s.category))).filter(Boolean);

  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getWhatsAppLink = (service: any) => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum SHAY Salon & Spa Karachi! I would like to inquire about booking "${service.name}" (Rs. ${Number(service.base_price).toLocaleString()} PKR). What are the earliest available slots at your Clifton or DHA branch?`
    );
    return `https://wa.me/923001234567?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1B3D] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header / Navbar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0A1931] to-[#12285A] border border-slate-700 flex items-center justify-center text-amber-400 shadow-xs group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xl font-serif tracking-wider font-extrabold text-[#0B1B3D] block leading-none">
                SHAY
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5">
                Salon &amp; Spa Collective · Karachi
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/deals"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-xs font-bold transition shadow-xs"
            >
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span>30 Active Deals</span>
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A1931] text-xs font-extrabold transition shadow-sm transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-amber-50/20 to-[#F8FAFC] border-b border-slate-200/80 pt-14 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Scissors className="w-3.5 h-3.5 text-amber-600" />
            <span>Complete Men&apos;s Grooming Menu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#0B1B3D] leading-tight mb-4">
            Men&apos;s Salon <span className="text-amber-600">Services</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Choose a service category, review what it covers, and book your branch-based visit. 
            Final styling suitability, duration, and consultations are confirmed during your appointment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link
              href="/book"
              className="px-6 py-2.5 rounded-xl bg-[#0B1B3D] text-amber-300 font-bold text-xs hover:bg-[#071120] transition shadow-sm"
            >
              Book Appointment
            </Link>
            <Link
              href="/deals"
              className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0B1B3D] font-bold text-xs hover:bg-slate-50 transition shadow-xs"
            >
              View 30 Deals
            </Link>
          </div>

          {/* Karachi Hours Notice */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-slate-200/60 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Mon–Thu: 11:00 AM – 10:30 PM</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Fri–Sun: 11:00 AM – 11:00 PM</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Clifton Flagship &amp; DHA Bukhari Studios</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Services Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full space-y-8">
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              selectedCategory === "all"
                ? "bg-[#0B1B3D] text-amber-300 shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Services ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                selectedCategory === cat
                  ? "bg-[#0B1B3D] text-amber-300 shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading Men&apos;s Grooming Catalog...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-xs">
            <Scissors className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-base text-[#0B1B3D]">No Services Found</h3>
            <p className="text-xs text-slate-500 mt-1">Please select another category above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, idx) => (
              <div
                key={service.id || idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{service.default_duration_minutes} mins</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
                      {service.category}
                    </span>
                    <h3 className="text-base font-bold text-[#0B1B3D] group-hover:text-amber-800 transition mt-0.5">
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Treatment Fee:</span>
                    <span className="font-serif font-extrabold text-base text-[#0B1B3D]">
                      {formatCurrency(service.base_price)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/book?service_id=${service.id}`}
                      className="px-3 py-2 rounded-xl bg-[#0B1B3D] hover:bg-[#071120] text-amber-300 text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Book Seat</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <a
                      href={getWhatsAppLink(service)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold text-center transition flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preparation Guidelines Section (Matching Lavish Before Your Appointment) */}
        <section className="bg-gradient-to-r from-[#0A1931] via-[#0B1B3D] to-[#12285A] rounded-3xl p-8 text-white shadow-xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              Before Your Appointment
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold">
              Help Our Artisans Prepare For Your Visit
            </h2>
            <p className="text-xs text-slate-300">
              Four simple recommendations to ensure your styling or skin session is smooth and relaxing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#08152A]/80 p-4 rounded-2xl border border-slate-700/60 space-y-1.5">
              <span className="font-mono text-amber-400 font-extrabold text-sm">01</span>
              <h4 className="font-bold text-white">Share Your Goal</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Bring reference photos or discuss your preferred finish with our master stylist during consultation.
              </p>
            </div>

            <div className="bg-[#08152A]/80 p-4 rounded-2xl border border-slate-700/60 space-y-1.5">
              <span className="font-mono text-amber-400 font-extrabold text-sm">02</span>
              <h4 className="font-bold text-white">Mention Hair History</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Inform the team about previous bleach, keratin, henna, or scalp sensitivity before chemical work.
              </p>
            </div>

            <div className="bg-[#08152A]/80 p-4 rounded-2xl border border-slate-700/60 space-y-1.5">
              <span className="font-mono text-amber-400 font-extrabold text-sm">03</span>
              <h4 className="font-bold text-white">Allow Dedicated Time</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                HydraFacials and Keratin smoothing take between 60 to 150 minutes for clinical perfection.
              </p>
            </div>

            <div className="bg-[#08152A]/80 p-4 rounded-2xl border border-slate-700/60 space-y-1.5">
              <span className="font-mono text-amber-400 font-extrabold text-sm">04</span>
              <h4 className="font-bold text-white">Confirm Branch</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Select either Clifton Block 4 or DHA Phase 6 Bukhari Studio when reserving your visit.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#0B1B3D] flex items-center justify-center text-amber-400 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-[#0B1B3D] block">SHAY Luxury Salon &amp; Spa</span>
              <span className="text-[10px]">Clifton &amp; DHA Bukhari Studios · Karachi, Pakistan</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/services" className="font-semibold text-slate-800 hover:text-amber-700 transition">
              Services
            </Link>
            <Link href="/deals" className="font-semibold text-slate-800 hover:text-amber-700 transition">
              30 Deals
            </Link>
            <Link href="/book" className="font-semibold text-slate-800 hover:text-amber-700 transition">
              Book Appointment
            </Link>
            <Link href="/dashboard" className="font-semibold text-slate-800 hover:text-amber-700 transition">
              Manager Portal
            </Link>
          </div>

          <p className="text-[11px]">
            &copy; 2026 SHAY Luxury Salon &amp; Spa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
