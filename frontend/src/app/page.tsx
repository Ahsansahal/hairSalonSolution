import Link from "next/link";
import {
  Sparkles, Calendar, ShieldCheck, ArrowRight, Building2,
  Clock, CheckCircle2, MapPin, Phone, Star, Scissors,
  Heart, Award, ChevronRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1B3D] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
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
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/deals"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-xs font-bold transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Deals &amp; Packages</span>
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A1931] text-xs font-extrabold transition shadow-sm transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve Visit</span>
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
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-6 text-center">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-100/50 to-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Clifton Flagship &amp; DHA Bukhari Studio · Karachi</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold text-[#0B1B3D] leading-tight sm:leading-tight">
            Haute Coiffure &amp; Luxury Sanctuary in Karachi
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
            Welcome to <strong>SHAY</strong>. Experience Parisian-inspired hair artistry, bespoke balayage, keratin smoothing, and rejuvenating clinical facials. Instant bookings with guaranteed zero double-bookings.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A1931] font-extrabold text-sm shadow-md transition transform hover:-translate-y-0.5"
            >
              <span>Book Your Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#0B1B3D] font-bold text-sm transition shadow-2xs"
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Salon Floor Dashboard</span>
            </Link>
          </div>

          {/* Luxury Credibility Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl pt-10 border-t border-slate-200">
            <div className="p-3 text-center">
              <span className="text-2xl font-serif font-bold text-[#0B1B3D] block">2 Locations</span>
              <span className="text-xs text-slate-500 font-medium">Clifton &amp; DHA Phase 6</span>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl font-serif font-bold text-amber-600 block">100%</span>
              <span className="text-xs text-slate-500 font-medium">Zero Double-Booking</span>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl font-serif font-bold text-[#1b1520] block">4.95 ★</span>
              <span className="text-xs text-[#7a7180] font-medium">Karachi's Top Rated</span>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl font-serif font-bold text-[#15803d] block">WhatsApp</span>
              <span className="text-xs text-[#7a7180] font-medium">Instant Concierge</span>
            </div>
          </div>
        </div>
      </section>

      {/* Karachi Salon Locations */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block mb-1">
            Karachi Sanctuaries
          </span>
          <h2 className="text-3xl font-serif font-extrabold text-[#0B1B3D]">Two Prime Karachi Destinations</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Visit our Clifton Flagship near Bilawal Chowrangi or our intimate DHA Bukhari Studio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clifton Flagship */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                  Clifton Flagship
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Open Today
                </span>
              </div>
              <h3 className="text-2xl font-serif font-extrabold text-[#0B1B3D] mt-4 group-hover:text-amber-700 transition">
                Shay Clifton Flagship
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Our grand two-story atelier featuring 10 styling stations, private VIP bridal suite, restorative head spa wash lounge, and master color bar.
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Plot 14-C, Block 4, Clifton (near Bilawal Chowrangi), Karachi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Mon – Sun: 10:00 AM – 09:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>+92 (21) 3587-0111</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/book"
                className="w-full py-3 rounded-xl bg-slate-50 hover:bg-[#0A1931] hover:text-white text-[#0B1B3D] font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-200"
              >
                <span>Reserve at Clifton Flagship</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* DHA Bukhari Studio */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                  DHA Studio
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Open Today
                </span>
              </div>
              <h3 className="text-2xl font-serif font-extrabold text-[#0B1B3D] mt-4 group-hover:text-amber-700 transition">
                Shay DHA Bukhari Studio
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                An intimate, sunlit aesthetic suite in Bukhari Commercial offering express styling, scalp wellness rituals, and clinical skincare.
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>42-C, Main Bukhari Commercial, Phase 6, DHA, Karachi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Mon – Sun: 10:00 AM – 09:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>+92 (21) 3584-0122</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/book"
                className="w-full py-3 rounded-xl bg-slate-50 hover:bg-[#0A1931] hover:text-white text-[#0B1B3D] font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-200"
              >
                <span>Reserve at DHA Bukhari</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Pillars */}
      <section className="bg-white border-y border-slate-200 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block mb-1">
              Boutique Excellence
            </span>
            <h2 className="text-3xl font-serif font-extrabold text-[#0B1B3D]">Designed for Luxury Salon Operations</h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Engineered with transactional row-locks, biometric staff attendance, and transparent reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-200">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#0B1B3D]">Zero Double-Bookings</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Database row-level concurrency locks with automated stylist buffer windows guarantee schedule perfection across both online and walk-in bookings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#0B1B3D]">Biometric Attendance &amp; Payroll</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Staff check-in/out terminal records attendance to calculate precise monthly hours, 1.5x overtime allowances, and manager read-only disbursement audits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#faf7f4] border border-[#e7dfd8]">
              <div className="w-12 h-12 rounded-2xl bg-[#e5eefc] text-[#1d5fbf] flex items-center justify-center mb-4 border border-[#b8d2f8]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1b1520]">Stateful WhatsApp Concierge</h3>
              <p className="text-xs text-[#7a7180] mt-2 leading-relaxed">
                Automated conversational AI booking bot powered by deterministic state machines, instant slot locking, and Meta Cloud API webhooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1b1520] text-white py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#a09aa6]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-wider text-white block">SHAY</span>
              <span className="text-[10px] text-[#a09aa6]">Clifton &amp; DHA Phase 6 · Karachi, Pakistan</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/book" className="hover:text-white transition">Book Appointment</Link>
            <Link href="/dashboard" className="hover:text-white transition">Manager Portal</Link>
            <Link href="/login" className="hover:text-white transition">Staff Terminal</Link>
          </div>

          <div>
            <span>&copy; {new Date().getFullYear()} Shay Salon &amp; Spa (Pvt) Ltd. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
