import Link from "next/link";
import {
  Sparkles, Calendar, ShieldCheck, ArrowRight, Building2,
  Clock, CheckCircle2, MapPin, Phone, Star, Scissors,
  Heart, Award, ChevronRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf7f4] text-[#1b1520] flex flex-col font-sans selection:bg-[#fbe9ef] selection:text-[#a3214f]">
      {/* Top Navbar */}
      <header className="border-b border-[#e7dfd8] bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
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
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/deals"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-[#a3214f] text-xs font-bold transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#a3214f]" />
              <span>Deals &amp; Packages</span>
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#a3214f] to-[#88183f] hover:from-[#8b1b42] hover:to-[#6f1232] text-white text-xs font-bold transition shadow-sm transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve Visit</span>
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
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-6 text-center">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#fbe9ef]/60 to-[#fdf2e9]/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] text-[11px] font-bold uppercase tracking-wider mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clifton Flagship &amp; DHA Bukhari Studio · Karachi</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#1b1520] leading-tight sm:leading-tight">
            Haute Coiffure &amp; Luxury Sanctuary in Karachi
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#7a7180] max-w-2xl leading-relaxed font-normal">
            Welcome to <strong>SHAY</strong>. Experience Parisian-inspired hair artistry, bespoke balayage, keratin smoothing, and rejuvenating clinical facials. Instant bookings with guaranteed zero double-bookings.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#a3214f] to-[#88183f] hover:from-[#8b1b42] hover:to-[#6f1232] text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
            >
              <span>Book Your Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-white border border-[#e7dfd8] hover:border-[#d6ccc3] hover:bg-[#faf7f4] text-[#1b1520] font-bold text-sm transition shadow-2xs"
            >
              <Building2 className="w-4 h-4 text-[#a3214f]" />
              <span>Salon Floor Dashboard</span>
            </Link>
          </div>

          {/* Luxury Credibility Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl pt-10 border-t border-[#e7dfd8]">
            <div className="p-3 text-center">
              <span className="text-2xl font-serif font-bold text-[#1b1520] block">2 Locations</span>
              <span className="text-xs text-[#7a7180] font-medium">Clifton &amp; DHA Phase 6</span>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl font-serif font-bold text-[#a3214f] block">100%</span>
              <span className="text-xs text-[#7a7180] font-medium">Zero Double-Booking</span>
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
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#a3214f] block mb-1">
            Karachi Sanctuaries
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#1b1520]">Two Prime Karachi Destinations</h2>
          <p className="text-xs text-[#7a7180] mt-1.5">
            Visit our Clifton Flagship near Bilawal Chowrangi or our intimate DHA Bukhari Studio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clifton Flagship */}
          <div className="p-8 rounded-3xl bg-white border border-[#e7dfd8] shadow-sm hover:border-[#d6ccc3] transition flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-[#fbe9ef] text-[#a3214f] text-[10px] font-bold uppercase tracking-wider">
                  Clifton Flagship
                </span>
                <span className="text-xs font-semibold text-[#15803d] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse" />
                  Open Today
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#1b1520] mt-4 group-hover:text-[#a3214f] transition">
                Shay Clifton Flagship
              </h3>
              <p className="text-xs text-[#7a7180] mt-2 leading-relaxed">
                Our grand two-story atelier featuring 10 styling stations, private VIP bridal suite, restorative head spa wash lounge, and master color bar.
              </p>

              <div className="mt-6 space-y-2 text-xs text-[#4a4250]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#a3214f]" />
                  <span>Plot 14-C, Block 4, Clifton (near Bilawal Chowrangi), Karachi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#a3214f]" />
                  <span>Mon – Sun: 10:00 AM – 09:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#a3214f]" />
                  <span>+92 (21) 3587-0111</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e7dfd8]">
              <Link
                href="/book"
                className="w-full py-3 rounded-xl bg-[#faf7f4] hover:bg-[#a3214f] hover:text-white text-[#1b1520] font-bold text-xs transition flex items-center justify-center gap-2 border border-[#e7dfd8]"
              >
                <span>Reserve at Clifton Flagship</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* DHA Bukhari Studio */}
          <div className="p-8 rounded-3xl bg-white border border-[#e7dfd8] shadow-sm hover:border-[#d6ccc3] transition flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-[#f4efea] text-[#1b1520] text-[10px] font-bold uppercase tracking-wider">
                  DHA Studio
                </span>
                <span className="text-xs font-semibold text-[#15803d] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse" />
                  Open Today
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#1b1520] mt-4 group-hover:text-[#a3214f] transition">
                Shay DHA Bukhari Studio
              </h3>
              <p className="text-xs text-[#7a7180] mt-2 leading-relaxed">
                An intimate, sunlit aesthetic suite in Bukhari Commercial offering express styling, scalp wellness rituals, and clinical skincare.
              </p>

              <div className="mt-6 space-y-2 text-xs text-[#4a4250]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#a3214f]" />
                  <span>42-C, Main Bukhari Commercial, Phase 6, DHA, Karachi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#a3214f]" />
                  <span>Mon – Sun: 10:00 AM – 09:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#a3214f]" />
                  <span>+92 (21) 3584-0122</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e7dfd8]">
              <Link
                href="/book"
                className="w-full py-3 rounded-xl bg-[#faf7f4] hover:bg-[#a3214f] hover:text-white text-[#1b1520] font-bold text-xs transition flex items-center justify-center gap-2 border border-[#e7dfd8]"
              >
                <span>Reserve at DHA Bukhari</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Pillars */}
      <section className="bg-white border-y border-[#e7dfd8] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a3214f] block mb-1">
              Boutique Excellence
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#1b1520]">Designed for Luxury Salon Operations</h2>
            <p className="text-xs text-[#7a7180] mt-1.5">
              Engineered with transactional row-locks, biometric staff attendance, and transparent reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#faf7f4] border border-[#e7dfd8]">
              <div className="w-12 h-12 rounded-2xl bg-[#fbe9ef] text-[#a3214f] flex items-center justify-center mb-4 border border-[#f3cad8]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1b1520]">Zero Double-Bookings</h3>
              <p className="text-xs text-[#7a7180] mt-2 leading-relaxed">
                Database row-level concurrency locks with automated stylist buffer windows guarantee schedule perfection across both online and walk-in bookings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#faf7f4] border border-[#e7dfd8]">
              <div className="w-12 h-12 rounded-2xl bg-[#e3f5e8] text-[#15803d] flex items-center justify-center mb-4 border border-[#b5e7c3]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#1b1520]">Biometric Attendance &amp; Payroll</h3>
              <p className="text-xs text-[#7a7180] mt-2 leading-relaxed">
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
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#fbe9ef]">
              <Sparkles className="w-5 h-5 text-white" />
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
