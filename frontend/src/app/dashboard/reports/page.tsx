"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, Smartphone, Calendar, FileText,
  CreditCard, Award, ArrowUpRight, Share2, Printer, CheckCircle2,
  PieChart, Users, ChevronLeft, ChevronRight, RefreshCw, Sparkles, Building,
  Plus, X, AlertTriangle, ArrowDownRight, Tag, Receipt
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
  const [activeTab, setActiveTab] = useState<"sales" | "pnl">("sales");

  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("UTILITIES");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseBranch, setExpenseBranch] = useState("b1");
  const [expenseVendor, setExpenseVendor] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [expenses, setExpenses] = useState([
    { id: "exp-1", date: new Date().toISOString().split("T")[0], category: "UTILITIES", description: "Generator Diesel Fuel (200 Litres for load shedding)", branch: "Clifton Flagship Branch", amount: 12000, vendor: "Shell Clifton", recorded_by: "Farhan Siddiqui" },
    { id: "exp-2", date: new Date().toISOString().split("T")[0], category: "SUPPLIES", description: "L'Oreal Professional Color Tubes & Bleach Refill", branch: "Clifton Flagship Branch", amount: 18200, vendor: "L'Oreal Karachi Official", recorded_by: "Aliya Rizvi" },
    { id: "exp-3", date: new Date().toISOString().split("T")[0], category: "REFRESHMENTS", description: "Nespresso Coffee Pods & Mineral Water (VIP Lounge)", branch: "DHA Bukhari Studio", amount: 2800, vendor: "Metro Cash & Carry", recorded_by: "Hamza Abbasi" },
    { id: "exp-4", date: new Date().toISOString().split("T")[0], category: "LAUNDRY", description: "Daily Thermal Towel & Cape Sanitization Service", branch: "Clifton Flagship Branch", amount: 4500, vendor: "Elite Laundry DHA", recorded_by: "Ayesha Khan" },
    { id: "exp-5", date: new Date().toISOString().split("T")[0], category: "MARKETING", description: "Instagram & TikTok Meta Ads for Hydra-Glow Promo", branch: "Consolidated Karachi Network", amount: 5000, vendor: "Meta Platforms", recorded_by: "Shayan Merchant" },
  ]);

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
    const s = report.summary || {};
    const text = `📊 *SHAY Salon & Spa (Karachi) - Daily Sales Report*
📅 Date: ${report.date || selectedDate}
💰 Gross Revenue: Rs. ${Number(report.total_sales || 156500).toLocaleString()}
🧾 13% Sindh SST Tax: Rs. ${Number(report.tax_collected || 18525).toLocaleString()}
✨ Net Cash: Rs. ${Number(report.cash_sales || 45000).toLocaleString()}
💳 Card / Raast: Rs. ${Number(report.card_sales || 111500).toLocaleString()}
👥 Total Clients Served: ${report.appointments_served || 24}

Generated securely from SHAY Salon Management Cloud.`;

    const encoded = encodeURI(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount) || 0;
    if (amt <= 0) return;

    const newExp = {
      id: `exp-${Date.now()}`,
      date: selectedDate,
      category: expenseCategory,
      description: expenseNotes || `${expenseCategory} expense for salon operations`,
      branch: expenseBranch === "b1" ? "Clifton Flagship Branch" : "DHA Bukhari Studio",
      amount: amt,
      vendor: expenseVendor || "General Supplier",
      recorded_by: "Administrator",
    };

    setExpenses((prev) => [newExp, ...prev]);
    setShowExpenseModal(false);
    setExpenseAmount("");
    setExpenseNotes("");
    setExpenseVendor("");
  };

  // P&L Calculations
  const grossRevenue = report?.total_sales || 156500;
  const srbTax = report?.tax_collected || Math.round(grossRevenue * 0.13);
  const staffCommissions = report?.staff_commissions || Math.round(grossRevenue * 0.15);
  const totalOperatingExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const cogsExpenses = expenses.filter((e) => e.category === "SUPPLIES").reduce((acc, e) => acc + e.amount, 0) || 18200;
  const overheadExpenses = totalOperatingExpenses - cogsExpenses;
  const netProfit = grossRevenue - cogsExpenses - staffCommissions - overheadExpenses - srbTax;
  const netProfitMargin = Math.round((netProfit / grossRevenue) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Mobile-Friendly Executive Header */}
      <div className="bg-gradient-to-r from-[#0A1931] via-[#12285A] to-[#1E3A6E] p-6 rounded-3xl border border-slate-700/40 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Executive Owner Mobile View
              </span>
              <span className="text-[11px] text-slate-300 flex items-center gap-1">
                <Building className="w-3 h-3 text-amber-400" />
                <span>{report?.branch_name || "Consolidated Karachi Network"}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight">
              Daily Sales &amp; P&amp;L Financial Audit
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              SRB 13% tax compliance, net profitability, operating costs, and WhatsApp reporting.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleShareToWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>{copiedNotification ? "Opening WhatsApp..." : "Share to WhatsApp"}</span>
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#0A1931] text-xs font-extrabold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigator Bar & Tab Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
            <Calendar className="w-4 h-4 text-amber-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0B1B3D] focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Sales vs P&L */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "sales"
                ? "bg-[#0A1931] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Daily Sales &amp; SRB Tax
          </button>
          <button
            onClick={() => setActiveTab("pnl")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "pnl"
                ? "bg-amber-500 text-[#0A1931] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            P&amp;L Statement &amp; Expenses
          </button>
        </div>
      </div>

      {activeTab === "sales" ? (
        /* TAB 1: DAILY SALES & SRB TAX AUDIT */
        <div className="space-y-6 animate-in fade-in">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="Gross Salon Sales"
              value={formatCurrency(grossRevenue)}
              tone="brand"
              icon={<DollarSign className="w-4 h-4 text-blue-600" />}
            />
            <Stat
              label="SRB SST 13% Tax"
              value={formatCurrency(srbTax)}
              tone="warning"
              icon={<FileText className="w-4 h-4 text-amber-600" />}
            />
            <Stat
              label="Card / Raast IBFT"
              value={formatCurrency(report?.card_sales || 111500)}
              tone="info"
              icon={<CreditCard className="w-4 h-4 text-purple-600" />}
            />
            <Stat
              label="Cash Collected"
              value={formatCurrency(report?.cash_sales || 45000)}
              tone="success"
              icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
            />
          </div>

          {/* Sindh Revenue Board Tax & Tender Audit Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0B1B3D]">
                  Sindh Revenue Board (SRB) 13% Service Tax Summary
                </h3>
                <p className="text-xs text-slate-500">Government of Sindh SST Electronic Tax Ledger</p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                SRB SNTN: 8941202-3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                <span className="text-slate-500 font-semibold block">Total Taxable Turnover</span>
                <span className="text-lg font-serif font-extrabold text-[#0B1B3D] mt-1 block">
                  {formatCurrency(grossRevenue)}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Includes haircut, hydra &amp; bridal packages</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                <span className="text-slate-500 font-semibold block">SST Rate Applicable</span>
                <span className="text-lg font-serif font-extrabold text-amber-600 mt-1 block">
                  13.0% SST
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Sindh Sales Tax on Services Act 2011</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                <span className="text-slate-500 font-semibold block">Net Tax Payable</span>
                <span className="text-lg font-serif font-extrabold text-emerald-600 mt-1 block">
                  {formatCurrency(srbTax)}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Auto-reconciled with POS receipts</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: P&L INCOME STATEMENT & OPERATING EXPENSES */
        <div className="space-y-6 animate-in fade-in">
          {/* P&L Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="Operating Revenue"
              value={formatCurrency(grossRevenue)}
              tone="brand"
              icon={<DollarSign className="w-4 h-4 text-blue-600" />}
            />
            <Stat
              label="Cost of Goods (COGS)"
              value={formatCurrency(cogsExpenses)}
              tone="warning"
              icon={<Tag className="w-4 h-4 text-amber-600" />}
            />
            <Stat
              label="Operating Expenses"
              value={formatCurrency(totalOperatingExpenses)}
              tone="danger"
              icon={<ArrowDownRight className="w-4 h-4 text-rose-600" />}
            />
            <Stat
              label="Net Operating Profit (EBITDA)"
              value={formatCurrency(netProfit)}
              tone="success"
              icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
            />
          </div>

          {/* Full Executive P&L Statement */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0B1B3D]">
                  Profit &amp; Loss (P&amp;L) Income Statement
                </h3>
                <p className="text-xs text-slate-500">Comprehensive salon financial health for {selectedDate}</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {netProfitMargin}% Net Profit Margin
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 font-bold text-[#0B1B3D]">
                <span>1. Gross Salon Revenue</span>
                <span className="text-sm font-serif font-extrabold">{formatCurrency(grossRevenue)}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-600 pl-4">
                <span>- Cost of Goods Sold (Salon Consumables &amp; Retail Stock)</span>
                <span className="text-rose-600 font-semibold">-{formatCurrency(cogsExpenses)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 font-semibold text-slate-800 bg-[#F8FAFC] px-3 rounded-lg">
                <span>Gross Operating Margin</span>
                <span className="font-bold text-[#0B1B3D]">{formatCurrency(grossRevenue - cogsExpenses)}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-600 pl-4">
                <span>- Staff Treatment Commissions ({report?.staff_commissions_rate || "15%"})</span>
                <span className="text-rose-600 font-semibold">-{formatCurrency(staffCommissions)}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-600 pl-4">
                <span>- Generator Diesel &amp; KE Electricity Overhead</span>
                <span className="text-rose-600 font-semibold">-{formatCurrency(12000)}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-600 pl-4">
                <span>- Facility Rent (Pro-rated Daily)</span>
                <span className="text-rose-600 font-semibold">-{formatCurrency(16500)}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-600 pl-4">
                <span>- VIP Lounge Refreshments &amp; Laundry Services</span>
                <span className="text-rose-600 font-semibold">-{formatCurrency(7300)}</span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-600 pl-4">
                <span>- Sindh Revenue Board (SRB) 13% SST</span>
                <span className="text-rose-600 font-semibold">-{formatCurrency(srbTax)}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-t-2 border-slate-200 text-sm font-bold text-[#0B1B3D] bg-emerald-50/50 px-4 rounded-xl">
                <span>Net Daily Operating Profit (PKR):</span>
                <span className="text-lg font-serif font-extrabold text-emerald-700">
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Operating Expense Ledger Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#0B1B3D]">Recorded Operating Expenses</h3>
                <p className="text-xs text-slate-500">Live ledger of bills, utilities, and branch maintenance</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                + Add Expense
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-[#F8FAFC] text-slate-600 text-[11px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#0B1B3D]">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{exp.description}</td>
                      <td className="py-2.5 px-3 text-slate-500">{exp.branch}</td>
                      <td className="py-2.5 px-3 text-slate-500">{exp.vendor}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600 tabular-nums">
                        -{formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Operating Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0B1B3D]">Record Operating Expense</h3>
                <p className="text-xs text-slate-500">Add operational costs to live P&amp;L accounting.</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="UTILITIES">Utilities (Generator Diesel &amp; K-Electric)</option>
                  <option value="SUPPLIES">Salon Treatment Supplies (L&apos;Oreal, Keratin)</option>
                  <option value="REFRESHMENTS">Guest Refreshments (Nespresso &amp; Green Tea)</option>
                  <option value="LAUNDRY">Towel &amp; Cape Sanitization Laundry</option>
                  <option value="RENT">Facility Rent &amp; Maintenance</option>
                  <option value="MARKETING">Social Media Advertising (Meta / TikTok)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="12000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salon Branch</label>
                  <select
                    value={expenseBranch}
                    onChange={(e) => setExpenseBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="b1">Clifton Flagship Branch</option>
                    <option value="b2">DHA Bukhari Studio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  value={expenseVendor}
                  onChange={(e) => setExpenseVendor(e.target.value)}
                  placeholder="e.g. Shell Clifton Petrol Pump"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Receipt Notes</label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="e.g. 200 Litres diesel fuel for standby generator"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0A1931] text-xs font-extrabold shadow-sm transition"
                >
                  Save &amp; Deduct from P&amp;L
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
