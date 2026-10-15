"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, Calendar, Clock, Scissors, Users,
  CreditCard, TrendingUp, Sun, ChevronRight, UserPlus,
  CheckCircle2, ArrowUpRight, DollarSign, CalendarCheck,
  Gift, Heart, Shield, RefreshCw, Printer, Search,
  Phone, MessageSquare, AlertCircle, FileText, Settings
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
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"overview" | "floor">("overview");

  const loadDashboard = () => {
    setLoading(true);
    const activeBranch = typeof window !== "undefined" ? (localStorage.getItem("salon_active_branch") || "all") : "all";
    const branchParam = activeBranch !== "all" ? `?branch_id=${activeBranch}` : "";

    const storedUser = typeof window !== "undefined" ? localStorage.getItem("salon_user") : null;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    Promise.all([
      apiFetch(`/dashboard/summary/${branchParam}`),
      apiFetch(`/staff/${branchParam}`),
    ])
      .then(([res, stData]) => {
        setData(res);
        setStaffList(Array.isArray(stData) ? stData : stData.results || []);
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

  const metrics = data?.metrics || {};
  const recentAppts = data?.recent_appointments || [];
  const userName = user?.full_name?.split(" ")[0] || "Admin";

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
      {/* 1. Contextual Greeting Banner matching Screenshot */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Good morning, Admin! */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-500 shadow-xs">
            <Sun className="w-7 h-7 fill-amber-400 text-amber-500 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1B3D] tracking-tight">
              Good morning, {userName}!
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Here&apos;s an overview of your salon&apos;s performance today across Karachi.
            </p>
          </div>
        </div>

        {/* Right: Inspirational Art Card */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#12285A] to-[#1E3A6E] rounded-2xl p-4 px-6 text-white shadow-md border border-slate-700/40 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              SHAY Karachi Collective
            </p>
            <p className="text-sm font-serif font-bold text-white mt-0.5">
              Empowering Luxury Hair, Esthetics &amp; Bridal Artistry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "overview" ? "floor" : "overview")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B1B3D] text-xs font-extrabold shadow-sm transition"
            >
              {viewMode === "overview" ? "Floor Stations Map" : "Executive View"}
            </button>
          </div>
        </div>
      </div>

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

      {/* 2. Top 4 Pastel Metric Cards (Exact match from screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blue Card: Total Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-3xl font-serif font-extrabold text-[#0B1B3D] block">
              {metrics.today_appointments ?? 24}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">Today&apos;s Appointments</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
              <span>&uarr; 6%</span>
              <span className="text-slate-400 font-normal">from last month</span>
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
            <span className="text-xs font-semibold text-slate-500 block">Artisans on Floor</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
              <span>&uarr; 3%</span>
              <span className="text-slate-400 font-normal">full shift attendance</span>
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
              6
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
              Rs. {Number(metrics.today_revenue ?? 142500).toLocaleString()}
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

      {/* 3. Mid Section Charts (Line Chart Overview + Vertical Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Enrollment / Revenue Overview Line Chart (2 Columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="font-serif font-bold text-base text-[#0B1B3D]">
                Sales &amp; Booking Growth Overview
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
                  248
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Total Monthly Guests</span>
              </div>
              <div>
                <span className="text-2xl font-serif font-extrabold text-emerald-600 block">
                  +36
                </span>
                <span className="text-[11px] text-slate-500 font-medium">New First-Time Clients</span>
              </div>
              <div>
                <span className="text-2xl font-serif font-extrabold text-purple-600 block">
                  68%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Combo Deal Conversion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Vertical Bar Chart (Services by Category) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-serif font-bold text-base text-[#0B1B3D]">
              Services by Category
            </h2>
            <Link href="/dashboard/services" className="text-xs font-bold text-blue-600 hover:underline flex items-center">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5 Vertical Color Bars */}
          <div className="pt-4 h-48 flex items-end justify-between gap-3 px-2">
            {/* Bar 1: Hair (Sky Blue) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">42</span>
              <div className="w-full bg-[#38BDF8] rounded-t-xl h-28 shadow-xs" />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Hair</span>
            </div>

            {/* Bar 2: Beard (Emerald Green) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">38</span>
              <div className="w-full bg-[#34D399] rounded-t-xl h-24 shadow-xs" />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Beard</span>
            </div>

            {/* Bar 3: Facial (Amber Gold) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">40</span>
              <div className="w-full bg-[#FBBF24] rounded-t-xl h-26 shadow-xs" />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Hydra</span>
            </div>

            {/* Bar 4: Deals (Purple) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">52</span>
              <div className="w-full bg-[#A855F7] rounded-t-xl h-36 shadow-xs" />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Deals</span>
            </div>

            {/* Bar 5: Bridal (Deep Navy) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600">50</span>
              <div className="w-full bg-[#0B1B3D] rounded-t-xl h-32 shadow-xs" />
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">Groom</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Activity | Upcoming Schedule | 2-Column Pastel Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent Activity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif font-bold text-sm text-[#0B1B3D] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Recent Salon Activity</span>
            </h3>
            <Link href="/dashboard/appointments" className="text-[11px] font-bold text-blue-600 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-3.5 py-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0B1B3D] truncate">Walk-In Guest Seated</p>
                <p className="text-slate-500 text-[11px] truncate">Sophia Martinez (Chair 02 · Clifton)</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">10:24 AM</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0B1B3D] truncate">SHAY Deal 01 Completed</p>
                <p className="text-slate-500 text-[11px] truncate">Ethan Johnson (Aliya Rizvi)</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">09:15 AM</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0B1B3D] truncate">WhatsApp Booking Request</p>
                <p className="text-slate-500 text-[11px] truncate">Mrs. Thompson (Hydra-Glow Facial)</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">08:42 AM</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0B1B3D] truncate">Invoice Paid (Rs. 19,500)</p>
                <p className="text-slate-500 text-[11px] truncate">Card Terminal Alfalah · Groom Package</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Yesterday</span>
            </div>
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
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex flex-col items-center justify-center shrink-0">
                <span className="text-[8px] uppercase font-extrabold tracking-wider">OCT</span>
                <span className="text-sm font-bold leading-none">15</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0B1B3D] truncate">Royal Grooming Suite</p>
                <p className="text-slate-500 text-[11px]">VIP Guest · 02:00 PM - 04:30 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center shrink-0">
                <span className="text-[8px] uppercase font-extrabold tracking-wider">OCT</span>
                <span className="text-sm font-bold leading-none">16</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0B1B3D] truncate">Keratin Silk Treatment</p>
                <p className="text-slate-500 text-[11px]">Elena Rostova · 04:00 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex flex-col items-center justify-center shrink-0">
                <span className="text-[8px] uppercase font-extrabold tracking-wider">OCT</span>
                <span className="text-sm font-bold leading-none">18</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0B1B3D] truncate">Hydra-Luxe Facial Session</p>
                <p className="text-slate-500 text-[11px]">Dr. Maya Lin · 11:30 AM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: 2-Column Pastel "Quick Actions" Grid (Exact match from screenshot) */}
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
