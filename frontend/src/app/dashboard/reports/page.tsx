"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, Smartphone, Calendar, FileText,
  CreditCard, Award, ArrowUpRight, Share2, Printer, CheckCircle2,
  PieChart, Users, ChevronLeft, ChevronRight, RefreshCw, Sparkles, Building
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PageHeader, Card, Stat } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export default function DailySalesReportsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const loadReport = () => {
    setLoading(true);
    const activeBranch = localStorage.getItem("salon_active_branch") || "all";
    const branchParam = activeBranch !== "all" ? `&branch_id=${activeBranch}` : "";

    apiFetch(`/reports/daily-sales/?date=${selectedDate}${branchParam}`)
      .then((data) => setReport(data))
      .catch((err) => console.error("Report load failed", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
    const handleBranchChange = () => loadReport();
    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleShareToWhatsApp = () => {
    if (!report) return;
    const s = report.summary;
    const text = `📊 *SHAY Salon & Spa (Karachi) - Daily Sales Report*
📅 Date: ${report.report_date}
💰 Gross Revenue: ${formatCurrency(s.gross_revenue)}
🧾 13% Sindh SST Tax: ${formatCurrency(s.tax_collected)}
✨ Net Revenue: ${formatCurrency(s.net_revenue)}
👥 Total Clients Served: ${s.completed_appointments}
💳 Payment Breakdown:
• Cash: ${formatCurrency(report.payment_methods.CASH)}
• Card: ${formatCurrency(report.payment_methods.CARD)}
• Raast / IBFT: ${formatCurrency(report.payment_methods.BANK_TRANSFER)}
• Wallets (EasyPaisa/JazzCash): ${formatCurrency(report.payment_methods.WALLET)}

Generated securely from SHAY Salon Management Cloud.`;

    const encoded = encodeURI(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const summary = report?.summary || {
    gross_revenue: "0",
    tax_collected: "0",
    net_revenue: "0",
    total_appointments: 0,
    completed_appointments: 0,
    in_chair_appointments: 0,
  };

  const paymentMethods = report?.payment_methods || {
    CASH: "0",
    CARD: "0",
    BANK_TRANSFER: "0",
    WALLET: "0",
  };

  const branchReports = report?.branch_reports || [];
  const stylistCommissions = report?.stylist_commissions || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Mobile-Friendly Executive Header */}
      <div className="bg-gradient-to-r from-[#180e1c] via-[#24132b] to-[#140a18] p-5 sm:p-6 rounded-3xl border border-[#3e234a] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-[#fca5a5] border border-rose-500/30">
                Executive Owner Mobile View
              </span>
              <span className="text-[11px] text-[#a896aa] flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#f472b6]" />
                <span>Responsive Smartphone Sync</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
              Daily Sales &amp; Commission Audit
            </h1>
            <p className="text-xs text-[#d4c3d8] mt-1 max-w-xl">
              Real-time daily closeout statement with 13% Sindh SST tax segregation, payment method audit, and master stylist commission tallies.
            </p>
          </div>

          {/* Quick Date Switcher Controls */}
          <div className="flex items-center gap-2 bg-[#120815]/80 p-1.5 rounded-2xl border border-[#3e234a] shrink-0 self-start md:self-auto">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 rounded-xl text-[#d4c3d8] hover:text-white hover:bg-white/10 transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-[#1f0f25] border border-[#442352] text-xs font-bold text-white rounded-xl focus:outline-none"
            />
            <button
              onClick={() => changeDate(1)}
              className="p-2 rounded-xl text-[#d4c3d8] hover:text-white hover:bg-white/10 transition"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white text-xs font-bold shadow-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-5 pt-4 border-t border-[#341b3d] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareToWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition transform active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send Daily Close to Owner WhatsApp</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Audit Slip</span>
            </button>
          </div>

          {copiedNotification && (
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Report formatted for WhatsApp delivery!</span>
            </span>
          )}
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Stat
          label="Total Gross Sales"
          value={formatCurrency(summary.gross_revenue)}
          tone="brand"
          trend="Total Billed"
          hint="All completed visits + retail products"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <Stat
          label="13% Sindh SST Tax"
          value={formatCurrency(summary.tax_collected)}
          tone="warning"
          trend="SRB Applicable"
          hint="Government services tax segregated"
          icon={<FileText className="w-4 h-4" />}
        />
        <Stat
          label="Net Salon Takings"
          value={formatCurrency(summary.net_revenue)}
          tone="success"
          trend="Net Revenue"
          hint="Gross revenue minus tax"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <Stat
          label="Guests Accommodated"
          value={summary.completed_appointments}
          tone="info"
          trend={`${summary.in_chair_appointments} currently seated`}
          hint="Completed salon appointments today"
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      {/* Payment Tender Split Breakdown */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd8]/80">
          <div>
            <h2 className="text-base font-bold text-[#1b1520] font-serif">
              Tender &amp; Payment Method Reconciliation
            </h2>
            <p className="text-xs text-[#7a7180]">
              Audit physical cash drawer balances against electronic card &amp; Raast settlements
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#a3214f] bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
            {formatCurrency(summary.gross_revenue)} Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Cash */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f0fdf4] to-white border border-[#bbf7d0] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Cash in Register
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Physical Cash
              </span>
            </div>
            <p className="text-xl font-bold font-serif text-emerald-900 tabular-nums">
              {formatCurrency(paymentMethods.CASH)}
            </p>
            <p className="text-[11px] text-[#7a7180]">Counter cash count to reconcile with register drop</p>
          </div>

          {/* Cards */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#eff6ff] to-white border border-[#bfdbfe] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                Credit / Debit Card
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                POS Terminal
              </span>
            </div>
            <p className="text-xl font-bold font-serif text-blue-900 tabular-nums">
              {formatCurrency(paymentMethods.CARD)}
            </p>
            <p className="text-[11px] text-[#7a7180]">Visa / Mastercard merchant bank batch slip</p>
          </div>

          {/* Bank Wire / Raast */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#faf5ff] to-white border border-[#e9d5ff] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                Raast / Bank Wire
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                IBFT Instant
              </span>
            </div>
            <p className="text-xl font-bold font-serif text-purple-900 tabular-nums">
              {formatCurrency(paymentMethods.BANK_TRANSFER)}
            </p>
            <p className="text-[11px] text-[#7a7180]">Direct online transfers with TXN references</p>
          </div>

          {/* Wallets */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#fffbeb] to-white border border-[#fde68a] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Digital Wallets
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                EasyPaisa/JazzCash
              </span>
            </div>
            <p className="text-xl font-bold font-serif text-amber-900 tabular-nums">
              {formatCurrency(paymentMethods.WALLET)}
            </p>
            <p className="text-[11px] text-[#7a7180]">QR code &amp; wallet payments collected</p>
          </div>
        </div>
      </Card>

      {/* Two Column Section: Branch Performance & Stylist Commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Revenue Comparison */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd8]/80">
            <div>
              <h2 className="text-[15px] font-bold text-[#1b1520] font-serif">Karachi Branch Takings</h2>
              <p className="text-xs text-[#7a7180]">Location sales split for {selectedDate}</p>
            </div>
            <Building className="w-4 h-4 text-[#a3214f]" />
          </div>

          <div className="space-y-3">
            {branchReports.map((br: any) => (
              <div
                key={br.branch_id}
                className="p-4 rounded-2xl bg-gradient-to-b from-[#faf7f4] to-white border border-[#e7dfd8] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#1b1520]">{br.branch_name}</h4>
                  <p className="text-xs text-[#7a7180] mt-0.5">
                    {br.city} · <strong className="text-[#a3214f]">{br.appointments} appointments</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-serif font-bold text-[#1b1520] block">
                    {formatCurrency(br.revenue)}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Synced
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Master Stylist Daily Commission Audit */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd8]/80">
            <div>
              <h2 className="text-[15px] font-bold text-[#1b1520] font-serif">Stylist Commission Ledger</h2>
              <p className="text-xs text-[#7a7180]">Daily service takings &amp; 10% commission allocation</p>
            </div>
            <Award className="w-4 h-4 text-amber-600" />
          </div>

          <div className="space-y-2.5">
            {stylistCommissions.length === 0 ? (
              <p className="text-xs text-[#7a7180] py-6 text-center">
                No completed services recorded yet for this date.
              </p>
            ) : (
              stylistCommissions.map((st: any) => (
                <div
                  key={st.staff_id}
                  className="p-3.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8]/80 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-[#1b1520] block truncate">{st.staff_name}</span>
                    <span className="text-[11px] text-[#7a7180] block">
                      {st.completed_treatments} treatments · Volume: {formatCurrency(st.service_revenue)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-700 font-serif text-sm block">
                      +{formatCurrency(st.commission_earned)}
                    </span>
                    <span className="text-[10px] text-[#7a7180] uppercase tracking-wider">
                      10% Commission
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
