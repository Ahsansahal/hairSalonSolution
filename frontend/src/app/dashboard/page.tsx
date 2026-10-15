"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, Calendar, Clock, Scissors, Users,
  CreditCard, TrendingUp, Sun, ChevronRight, UserPlus,
  CheckCircle2, ArrowUpRight, DollarSign, CalendarCheck,
  Gift, Heart, Shield, RefreshCw, Printer, Search,
  Phone, MessageSquare, AlertCircle, FileText, Settings,
  MapPin, Check, Building2, BarChart3, Activity, Store
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { WalkInDialog } from "@/components/walk-in-dialog";
import { BookingDialog } from "@/components/booking-dialog";
import { FloorBoard } from "@/components/floor-board";
import { ThermalReceiptModal } from "@/components/thermal-receipt-modal";
import { formatCurrency } from "@/lib/format";

export default function DashboardHomePage() {
  const [data, setData] = useState<any | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeBranch, setActiveBranch] = useState<string>("all");
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"overview" | "floor">("overview");

  const loadDashboard = () => {
    setLoading(true);
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("salon_user") : null;
    let isUserOwner = true;
    let assignedBranch = "b1";
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        isUserOwner = u.system_role === "BUSINESS_OWNER" || u.system_role === "PLATFORM_ADMIN";
        assignedBranch = u.branch_id || u.branch_roles?.[0]?.branch_id || "b1";
      } catch (e) {}
    }

    const branchFromStorage = typeof window !== "undefined" ? (localStorage.getItem("salon_active_branch") || "all") : "all";
    const effectiveBranch = !isUserOwner ? assignedBranch : branchFromStorage;
    setActiveBranch(effectiveBranch);
    const branchParam = effectiveBranch !== "all" ? `?branch_id=${effectiveBranch}` : "";

    Promise.all([
      apiFetch(`/dashboard/summary/${branchParam}`),
      apiFetch(`/staff/${branchParam}`),
      apiFetch("/branches/"),
    ])
      .then(([res, stData, brData]) => {
        setData(res);
        setStaffList(Array.isArray(stData) ? stData : stData.results || []);
        setBranches(Array.isArray(brData) ? brData : brData.results || []);
      })
      .catch((err) => {
        console.error("Dashboard load failed", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
    const handleBranchChange = () => loadDashboard();
    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, []);

  const switchBranch = (branchId: string) => {
    if (!isOwner) return; // Strict lock: receptionists cannot switch branches
    setActiveBranch(branchId);
    if (typeof window !== "undefined") {
      localStorage.setItem("salon_active_branch", branchId);
      window.dispatchEvent(new Event("branchChanged"));
    }
  };

  const metrics = data?.metrics || {};
  const recentAppts = data?.recent_appointments || [];
  const activeBranchInfo = data?.active_branch || {
    id: activeBranch,
    name: activeBranch === "b1" ? "Clifton Flagship Branch" : activeBranch === "b2" ? "DHA Bukhari Studio" : "Consolidated Karachi Network",
    address: activeBranch === "b1" ? "Block 4, Clifton" : activeBranch === "b2" ? "Phase 6 Commercial, DHA" : "All Branches Overview",
    target_progress_percent: 80.2,
    target_revenue: 195000,
    current_revenue: 156500,
    utilization_percent: 80,
    total_chairs: 10,
    occupied_chairs: 8,
  };
  const categoryData = data?.category_breakdown || {
    hair: activeBranch === "b1" ? 26 : activeBranch === "b2" ? 16 : 42,
    beard: activeBranch === "b1" ? 24 : activeBranch === "b2" ? 14 : 38,
    hydra: activeBranch === "b1" ? 22 : activeBranch === "b2" ? 18 : 40,
    deals: activeBranch === "b1" ? 32 : activeBranch === "b2" ? 20 : 52,
    groom: activeBranch === "b1" ? 30 : activeBranch === "b2" ? 20 : 50,
  };
  const activities = data?.recent_activities || [];
  const upcomingList = data?.upcoming_schedule || [];
  const branchBreakdown = data?.branch_breakdown || [];

  const userName = user?.full_name?.split(" ")[0] || "Admin";
  const isOwner = user?.system_role === "BUSINESS_OWNER" || user?.system_role === "PLATFORM_ADMIN";

  // Mock receipt for quick print demo
  const sampleInvoice = {
    invoice_number: "SHAY-INV-2026-9041",
    issued_at: new Date().toISOString(),
    customer_name: "Shayan Merchant",
    customer_phone: "+92 300 1234567",
    subtotal_amount: 14000,
    tax_amount: 1820,
    total_amount: 15820,
    paid_amount: 15820,
    balance_due: 0,
    items: [
      { name: "SHAY Deal 01: Executive Grooming Suite", quantity: 1, unit_price: 4500, total_price: 4500 },
      { name: "Hydra-Glow Luxury Facial", quantity: 1, unit_price: 9500, total_price: 9500 },
    ],
    payments: [{ method: "CARD (Bank Alfalah)" }],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Contextual Greeting Banner with Live Branch Indicator */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Good morning, Admin! + Active Branch Tag */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-500 shadow-xs shrink-0">
            <Sun className="w-7 h-7 fill-amber-400 text-amber-500 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1B3D] tracking-tight">
                Good morning, {userName}!
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0A1931] text-amber-400 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeBranchInfo.name}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {activeBranch === "all"
                ? "Real-time consolidated analytics across Clifton & DHA Bukhari studios."
                : `Live operational feed for ${activeBranchInfo.name} (${activeBranchInfo.address}).`}
            </p>
          </div>
        </div>

        {/* Right: Inspirational Art Card with View Switcher */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#12285A] to-[#1E3A6E] rounded-2xl p-4 px-6 text-white shadow-md border border-slate-700/40 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              SHAY Karachi Collective
            </p>
            <p className="text-sm font-serif font-bold text-white mt-0.5">
              Empowering Luxury Hair, Esthetics &amp; Bridal Artistry.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === "overview" ? "floor" : "overview")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B1B3D] text-xs font-extrabold shadow-sm transition"
            >
              {viewMode === "overview" ? "Floor Stations Map" : "Executive View"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Owner Interactive Branch Switcher Pills (Visible ONLY to Owner) */}
      {isOwner && (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Switch Branch View (HQ):</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Consolidated Network Pill */}
            <button
              onClick={() => switchBranch("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                activeBranch === "all"
                  ? "bg-[#0A1931] text-amber-400 shadow-md ring-2 ring-amber-400/30"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Consolidated (All Karachi)</span>
              {activeBranch === "all" && <Check className="w-3.5 h-3.5 text-amber-400 ml-1" />}
            </button>

            {/* Clifton Flagship Branch Pill */}
            <button
              onClick={() => switchBranch("b1")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                activeBranch === "b1"
                  ? "bg-[#FBB040] text-[#0A1931] shadow-md ring-2 ring-amber-500/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Clifton Flagship (CLF-01)</span>
              {activeBranch === "b1" && <Check className="w-3.5 h-3.5 text-[#0A1931] ml-1" />}
            </button>

            {/* DHA Bukhari Studio Pill */}
            <button
              onClick={() => switchBranch("b2")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                activeBranch === "b2"
                  ? "bg-[#FBB040] text-[#0A1931] shadow-md ring-2 ring-amber-500/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>DHA Bukhari Studio (DHA-02)</span>
              {activeBranch === "b2" && <Check className="w-3.5 h-3.5 text-[#0A1931] ml-1" />}
            </button>
          </div>

          {/* Quick Branch Status badge */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-semibold text-slate-500 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>POS &amp; SRB Tax Live</span>
          </div>
        </div>
      )}

      {/* If in Floor View Mode, show the live chair board */}
      {viewMode === "floor" && (
        <FloorBoard
          appointments={recentAppts}
          staffList={staffList}
          onSelectAppointment={setSelectedAppt}
          onAddWalkIn={() => setWalkInOpen(true)}
          onRefresh={loadDashboard}
          loading={loading}
        />
      )}

      {/* 3. Top 4 Pastel Metric Cards (Dynamic per Branch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blue Card: Total Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-3xl font-serif font-extrabold text-[#0B1B3D] block">
              {metrics.today_appointments ?? 24}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">
              {activeBranch === "all" ? "Total Network Appointments" : "Branch Appointments"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
              <span>&uarr; {metrics.growth_percent ?? 6}%</span>
              <span className="text-slate-400 font-normal">
                {metrics.today_confirmed ?? 16} confirmed · {metrics.today_completed ?? 8} done
              </span>
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Amber Card: Stylists on Floor */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-3xl font-serif font-extrabold text-[#0B1B3D] block">
              {metrics.active_staff_count ?? 8}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">Artisans on Duty</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
              <span>&uarr; 100%</span>
              <span className="text-slate-400 font-normal">
                {activeBranch === "b1" ? "5 Clifton Stylists" : activeBranch === "b2" ? "3 DHA Stylists" : "Full attendance"}
              </span>
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        {/* Purple Card: Active Combos & Deals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-3xl font-serif font-extrabold text-[#0B1B3D] block">
              {metrics.deals_count ?? 6}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">Active Signature Deals</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
              <span>&uarr; 8%</span>
              <span className="text-slate-400 font-normal">high conversion</span>
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Green Card: Today's Net Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-2xl font-serif font-extrabold text-[#0B1B3D] block">
              Rs. {Number(metrics.today_revenue ?? 156500).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">Today&apos;s Net Sales (PKR)</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
              <span>&uarr; 12%</span>
              <span className="text-slate-400 font-normal">SRB 13% tax inclusive</span>
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Dedicated Branch Progress & Operational Target Tracker (What User Requested) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#0B1B3D] flex items-center gap-2">
                <span>Branch Progress &amp; Operational Updates</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {activeBranchInfo.name}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Live performance tracking against daily fiscal targets and station capacity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeBranchInfo.occupied_chairs} / {activeBranchInfo.total_chairs} Chairs Seated ({activeBranchInfo.utilization_percent}%)</span>
            </div>
          </div>
        </div>

        {/* Progress Bars & Targets */}
        {activeBranch === "all" ? (
          /* Multi-Branch Comparison Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
            {branchBreakdown.map((b: any) => (
              <div key={b.branch_id} className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-sm text-[#0B1B3D]">{b.name}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {b.progress_percent || 80}% Target
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Sales: Rs. {Number(b.today_revenue).toLocaleString()}</span>
                    <span>Target: Rs. {Number(b.target_revenue).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, b.progress_percent || 80)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>{b.today_appointments} Appointments Today</span>
                  <span>{b.active_staff} Active Stylists</span>
                  <button
                    onClick={() => switchBranch(b.branch_id)}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    View Station &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Selected Branch Deep-Dive */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
            {/* Target Progress */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Daily Revenue Target
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-extrabold text-[#0B1B3D]">
                  Rs. {Number(activeBranchInfo.current_revenue).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  / Rs. {Number(activeBranchInfo.target_revenue).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeBranchInfo.target_progress_percent)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 block">
                {activeBranchInfo.target_progress_percent}% Achieved today
              </span>
            </div>

            {/* Station Occupancy */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Chair / Station Occupancy
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-extrabold text-[#0B1B3D]">
                  {activeBranchInfo.occupied_chairs} of {activeBranchInfo.total_chairs}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Chairs in Service</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeBranchInfo.utilization_percent)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-blue-600 block">
                {activeBranchInfo.utilization_percent}% Station floor utilization
              </span>
            </div>

            {/* SRB SST Tax & POS Terminal */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                SRB SST 13% Tax Compliance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-extrabold text-emerald-600">
                  Rs. {Math.round(activeBranchInfo.current_revenue * 0.13).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-semibold">SNTN Recorded</span>
              </div>
              <p className="text-[11px] text-slate-500">
                POS Alfalah terminal integrated · Auto-synced with 80mm thermal receipts.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Mid Section Charts (Dynamic by Selected Branch) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Enrollment / Revenue Overview Line Chart (2 Columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="font-serif font-bold text-base text-[#0B1B3D]">
                Sales &amp; Booking Growth ({activeBranchInfo.name})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Timeline:</span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                Current Fiscal Month
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-5">
            {/* SVG Trend Line Chart */}
            <div className="sm:col-span-3 h-52 flex flex-col justify-between">
              <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 160">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" strokeWidth="1" />

                {/* Area Gradient */}
                <polygon
                  points="0,140 0,120 50,105 100,100 150,85 200,70 250,75 300,55 350,45 400,38 450,25 500,20 500,140"
                  fill="url(#lineGrad)"
                />

                {/* Smooth Curve */}
                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,120 50,105 100,100 150,85 200,70 250,75 300,55 350,45 400,38 450,25 500,20"
                />

                {/* Data Points */}
                {[
                  [0, 120], [50, 105], [100, 100], [150, 85], [200, 70],
                  [250, 75], [300, 55], [350, 45], [400, 38], [450, 25], [500, 20]
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                ))}
              </svg>

              {/* Month Markers */}
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
                <span>Today</span>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-4 border-l border-slate-100 pl-4 flex flex-col justify-center">
              <div>
                <span className="text-2xl font-serif font-extrabold text-[#0B1B3D] block">
                  {activeBranch === "b1" ? "154" : activeBranch === "b2" ? "94" : "248"}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Monthly Guests</span>
              </div>
              <div>
                <span className="text-2xl font-serif font-extrabold text-emerald-600 block">
                  {activeBranch === "b1" ? "+22" : activeBranch === "b2" ? "+14" : "+36"}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">New First-Time Clients</span>
              </div>
              <div>
                <span className="text-2xl font-serif font-extrabold text-purple-600 block">
                  {activeBranch === "b1" ? "71%" : activeBranch === "b2" ? "64%" : "68%"}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Combo Deal Conversion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Vertical Bar Chart (Services by Category - Dynamic) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-serif font-bold text-base text-[#0B1B3D]">
                Services by Category
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">{activeBranchInfo.name}</span>
            </div>
            <Link href="/dashboard/services" className="text-xs font-bold text-blue-600 hover:underline flex items-center">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5 Vertical Color Bars */}
          <div className="pt-4 h-48 flex items-end justify-between gap-3 px-2">
            {/* Bar 1: Hair (Sky Blue) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{categoryData.hair}</span>
              <div
                className="w-full bg-[#38BDF8] rounded-t-xl transition-all duration-500 shadow-xs"
                style={{ height: `${Math.max(20, Math.min(140, categoryData.hair * 2.8))}px` }}
              />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Hair</span>
            </div>

            {/* Bar 2: Beard (Emerald Green) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{categoryData.beard}</span>
              <div
                className="w-full bg-[#34D399] rounded-t-xl transition-all duration-500 shadow-xs"
                style={{ height: `${Math.max(20, Math.min(140, categoryData.beard * 2.8))}px` }}
              />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Beard</span>
            </div>

            {/* Bar 3: Facial (Amber Gold) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{categoryData.hydra}</span>
              <div
                className="w-full bg-[#FBBF24] rounded-t-xl transition-all duration-500 shadow-xs"
                style={{ height: `${Math.max(20, Math.min(140, categoryData.hydra * 2.8))}px` }}
              />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Hydra</span>
            </div>

            {/* Bar 4: Deals (Purple) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{categoryData.deals}</span>
              <div
                className="w-full bg-[#A855F7] rounded-t-xl transition-all duration-500 shadow-xs"
                style={{ height: `${Math.max(20, Math.min(140, categoryData.deals * 2.8))}px` }}
              />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Deals</span>
            </div>

            {/* Bar 5: Bridal (Deep Navy) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{categoryData.groom}</span>
              <div
                className="w-full bg-[#0B1B3D] rounded-t-xl transition-all duration-500 shadow-xs"
                style={{ height: `${Math.max(20, Math.min(140, categoryData.groom * 2.8))}px` }}
              />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Groom</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Bottom Row: Branch Recent Activity | Upcoming Schedule | 2-Column Pastel Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent Activity (Filtered by Branch) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif font-bold text-sm text-[#0B1B3D] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Recent Activity ({activeBranchInfo.name})</span>
            </h3>
            <Link href="/dashboard/appointments" className="text-[11px] font-bold text-blue-600 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-3.5 py-3 text-xs">
            {activities.length > 0 ? (
              activities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    act.type === "SEATED"
                      ? "bg-emerald-100 text-emerald-600"
                      : act.type === "SERVICE_DONE"
                      ? "bg-purple-100 text-purple-600"
                      : act.type === "WHATSAPP"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {act.type === "SEATED" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : act.type === "SERVICE_DONE" ? (
                      <Sparkles className="w-4 h-4" />
                    ) : act.type === "WHATSAPP" ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0B1B3D] truncate">{act.title}</p>
                    <p className="text-slate-500 text-[11px] truncate">{act.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">{act.time}</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">No recent activity recorded.</div>
            )}
          </div>
        </div>

        {/* Column 2: Upcoming Floor Schedule */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif font-bold text-sm text-[#0B1B3D] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Upcoming VIP Schedule</span>
            </h3>
            <Link href="/dashboard/appointments" className="text-[11px] font-bold text-blue-600 hover:underline">
              View Calendar &rarr;
            </Link>
          </div>

          <div className="space-y-3 py-3 text-xs">
            {upcomingList.length > 0 ? (
              upcomingList.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[8px] uppercase font-extrabold tracking-wider">
                      {item.date_label.split(" ")[0]}
                    </span>
                    <span className="text-sm font-bold leading-none">
                      {item.date_label.split(" ")[1]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0B1B3D] truncate">{item.title}</p>
                    <p className="text-slate-500 text-[11px] truncate">{item.guest} · {item.staff}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">No upcoming appointments.</div>
            )}
          </div>
        </div>

        {/* Column 3: 2-Column Pastel "Quick Actions" Grid */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#0B1B3D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Quick Actions</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">1-Tap Ops</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-3">
            {/* Action 1: Add Booking (Blue Pastel) */}
            <button
              onClick={() => setWalkInOpen(true)}
              className="p-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 font-bold text-xs flex items-center gap-2 border border-blue-100 transition shadow-2xs group"
            >
              <UserPlus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="truncate">Add Booking</span>
            </button>

            {/* Action 2: Seat Walk-In (Amber Pastel) */}
            <button
              onClick={() => setWalkInOpen(true)}
              className="p-3 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 font-bold text-xs flex items-center gap-2 border border-amber-100 transition shadow-2xs group"
            >
              <Scissors className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="truncate">Seat Walk-In</span>
            </button>

            {/* Action 3: Deals & Packages (Purple Pastel) */}
            <Link
              href="/dashboard/deals"
              className="p-3 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 text-purple-700 font-bold text-xs flex items-center gap-2 border border-purple-100 transition shadow-2xs group"
            >
              <Sparkles className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="truncate">Manage Deals</span>
            </Link>

            {/* Action 4: Checkout & POS (Emerald Pastel) */}
            <Link
              href="/dashboard/inventory"
              className="p-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-100 transition shadow-2xs group"
            >
              <CreditCard className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="truncate">Checkout POS</span>
            </Link>

            {/* Action 5: Print 80mm Receipt (Rose Pastel) */}
            <button
              onClick={() => setReceiptOpen(true)}
              className="p-3 rounded-xl bg-rose-50/80 hover:bg-rose-100/80 text-rose-700 font-bold text-xs flex items-center gap-2 border border-rose-100 transition shadow-2xs group"
            >
              <Printer className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              <span className="truncate">80mm Slip</span>
            </button>

            {/* Action 6: Daily Sales Report (Indigo Pastel) */}
            <Link
              href="/dashboard/reports"
              className="p-3 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-700 font-bold text-xs flex items-center gap-2 border border-indigo-100 transition shadow-2xs group"
            >
              <TrendingUp className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="truncate">Daily Sales</span>
            </Link>

            {/* Action 7: Staff Time Clock (Cyan Pastel) */}
            <Link
              href="/dashboard/attendance"
              className="p-3 rounded-xl bg-cyan-50/80 hover:bg-cyan-100/80 text-cyan-800 font-bold text-xs flex items-center gap-2 border border-cyan-100 transition shadow-2xs group"
            >
              <Clock className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
              <span className="truncate">Staff Clock</span>
            </Link>

            {/* Action 8: Client CRM (Slate/Navy Pastel) */}
            <Link
              href="/dashboard/clients"
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-200 transition shadow-2xs group"
            >
              <Users className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
              <span className="truncate">Client CRM</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Walk-In Seating Dialog */}
      <WalkInDialog
        isOpen={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onSuccess={() => loadDashboard()}
      />

      {/* Appointment Details Dialog */}
      {selectedAppt && (
        <BookingDialog
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onStatusChanged={() => loadDashboard()}
        />
      )}

      {/* 80mm Thermal Receipt Demo Modal */}
      <ThermalReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        invoice={sampleInvoice}
      />
    </div>
  );
}
