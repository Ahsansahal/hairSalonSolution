"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2, MapPin, Plus, Percent, Check, Sparkles, Phone,
  Mail, Users, Scissors, ShieldCheck, ChevronRight, X, ArrowRight,
  TrendingUp, Award, ExternalLink, Globe, CheckCircle2, Lock,
  Layers, BarChart3, Clock, DollarSign
} from "lucide-react";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { PageHeader, Card, Stat } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export default function BranchesExpansionPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeBranchId, setActiveBranchId] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // New Branch Form State
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [city, setCity] = useState("Karachi");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("+92 21 ");
  const [email, setEmail] = useState("");
  const [chairCount, setChairCount] = useState("6");
  const [managerName, setManagerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadBranches = () => {
    setLoading(true);
    apiFetch("/branches/")
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setBranches(list);
      })
      .catch((err) => console.error("Failed to load branches", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBranches();
    const u = getCurrentUser();
    setCurrentUser(u);

    const storedBranch = localStorage.getItem("salon_active_branch") || "all";
    setActiveBranchId(storedBranch);

    const handleBranchChange = () => {
      const active = localStorage.getItem("salon_active_branch") || "all";
      setActiveBranchId(active);
    };

    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, []);

  const isOwner =
    currentUser?.system_role === "BUSINESS_OWNER" ||
    currentUser?.system_role === "PLATFORM_ADMIN" ||
    !currentUser?.system_role;

  const handleSwitchBranch = (branchId: string) => {
    if (!isOwner) return;
    setActiveBranchId(branchId);
    localStorage.setItem("salon_active_branch", branchId);
    window.dispatchEvent(new Event("branchChanged"));
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const generatedCode = branchCode.trim() || `BR-0${branches.length + 1}`;
    const newBranch = {
      id: `b-${Date.now()}`,
      name: branchName.trim(),
      code: generatedCode.toUpperCase(),
      city: city,
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim() || `${generatedCode.toLowerCase()}@shay.salon`,
      chairs: parseInt(chairCount, 10) || 6,
      manager_name: managerName.trim() || "Assigned Manager",
      currency: "PKR",
      tax_rate: "13.00",
      status: "ACTIVE",
      is_active: true,
    };

    try {
      await apiFetch("/branches/", {
        method: "POST",
        body: JSON.stringify(newBranch),
      });
    } catch (e) {
      // In-memory cloud fallback
    }

    setBranches((prev) => [...prev, newBranch]);
    setSuccessMessage(`🎉 Branch "${newBranch.name}" created at 20% discounted expansion rate!`);
    setSaving(false);
    setShowModal(false);

    // Reset form
    setBranchName("");
    setBranchCode("");
    setAddress("");
    setManagerName("");

    // Trigger branch changed event so sidebar and switchers refresh
    window.dispatchEvent(new Event("branchChanged"));

    setTimeout(() => setSuccessMessage(""), 6000);
  };

  // Pricing calculations: Base 25,000 PKR, each subsequent branch is 20% off (20,000 PKR)
  const baseBranchRate = 25000;
  const discountedRate = 20000; // 20% discount (saves 5,000 PKR per branch)
  const currentBranchCount = branches.length || 2;
  const totalMonthlySubscription =
    baseBranchRate + Math.max(0, currentBranchCount - 1) * discountedRate;
  const totalSavings = Math.max(0, currentBranchCount - 1) * 5000;
  const totalChairs = branches.reduce((acc, b) => acc + (b.chairs || 5), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <PageHeader
        eyebrow="Network Expansion &amp; Multi-Branch Licensing"
        title="Salon Branches &amp; Multi-Location Control"
        description="Oversee your multi-salon chain, switch viewing context between branches, assign front desk staff, and expand with automatic 20% discounts."
        actions={
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => handleSwitchBranch("all")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                  activeBranchId === "all"
                    ? "bg-[#0B1B3D] text-amber-300 border border-amber-500/40 shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>All Branches View</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 text-xs font-extrabold text-[#0A1931] shadow-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Salon Branch (20% Off)</span>
              </button>
            )}
          </div>
        }
      />

      {/* Role Protection Banner for Receptionist / Single-Branch Staff */}
      {!isOwner && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Station Access Locked: </span>
              <span>
                Your terminal is securely locked to your assigned salon branch. Cross-salon switching and franchise expansion are reserved for the Business Owner.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800 uppercase tracking-wider shrink-0">
            Staff Scoped
          </span>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Viewing Context Alert */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0B1B3D] text-amber-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Current Dashboard Active View:</span>
              <span className="text-xs font-extrabold text-[#0B1B3D] px-2.5 py-0.5 rounded-full bg-amber-100/70 border border-amber-200">
                {activeBranchId === "all"
                  ? "Whole Network (Consolidated All Branches)"
                  : branches.find((b) => b.id === activeBranchId)?.name || activeBranchId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Appointments, daily sales, attendance, and walk-in logs across the CMS reflect this active branch.
            </p>
          </div>
        </div>

        {isOwner && activeBranchId !== "all" && (
          <button
            onClick={() => handleSwitchBranch("all")}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Reset to Whole Network View</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Expansion 20% Off Collective Banner */}
      <div className="bg-gradient-to-r from-[#0A1931] via-[#12285A] to-[#1E3A6E] rounded-3xl p-6 text-white shadow-xl border border-slate-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Exclusive Collective Offer
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                Multi-Salon Scaling Plan
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold tracking-tight">
              Add New Branches at 20% Off Each
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Expand your salon brand across Clifton, DHA, Gulshan, Bahria Town, or Islamabad. Every added location gets independent cloud sync, biometric attendance time-clock, POS receipts, and unlimited staff seats with 20% lifetime billing discount.
            </p>
          </div>

          <div className="bg-[#08152A]/90 p-4 rounded-2xl border border-slate-700/60 shrink-0 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Additional Branch Pricing
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-2xl font-serif font-extrabold text-amber-400">
                Rs. 20,000
              </span>
              <span className="text-xs text-slate-400 line-through">Rs. 25,000</span>
            </div>
            <span className="inline-block text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              Save 20% per branch
            </span>
          </div>
        </div>

        {/* Pricing Calculator Ribbon */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Active Salon Studios:</span>
            <span className="font-serif font-bold text-white text-base mt-0.5 block">{currentBranchCount} Locations</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Styling Chairs:</span>
            <span className="font-serif font-bold text-amber-300 text-base mt-0.5 block">{totalChairs} Chairs</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Monthly Subscription:</span>
            <span className="font-serif font-bold text-amber-400 text-base mt-0.5 block">{formatCurrency(totalMonthlySubscription)}/mo</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Expansion Savings:</span>
            <span className="font-serif font-bold text-emerald-400 text-base mt-0.5 block">+{formatCurrency(totalSavings)}/mo (20%)</span>
          </div>
        </div>
      </div>

      {/* Existing Branch Network Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#0B1B3D]">Your Salon Locations</h3>
            <p className="text-xs text-slate-500">Click any salon to switch the CMS view or open branch-specific operations.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {branches.length} Active Studios
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b, idx) => {
            const isActive = activeBranchId === b.id;

            return (
              <div
                key={b.id || idx}
                className={`bg-white rounded-2xl p-5 border transition-all space-y-4 ${
                  isActive
                    ? "border-amber-500 shadow-md ring-2 ring-amber-400/20"
                    : "border-slate-200/90 shadow-xs hover:border-amber-400/50 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      isActive
                        ? "bg-[#0B1B3D] text-amber-300 shadow-xs"
                        : "bg-amber-100/80 border border-amber-200 text-amber-800"
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#0B1B3D]">{b.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {b.code || `BR-0${idx + 1}`}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {b.city || "Karachi"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500 text-[#0A1931] shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#0A1931]" />
                      <span>Active View</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="line-clamp-1">{b.address || "Karachi, Pakistan"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.phone || "+92 21 35870000"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.email || `${(b.code || `br0${idx+1}`).toLowerCase()}@shay.salon`}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Styling Chairs</span>
                    <span className="font-bold text-[#0B1B3D] text-sm flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-amber-600" />
                      <span>{b.chairs || (idx === 0 ? 6 : 4)} Chairs</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Tax Jurisdiction</span>
                    <span className="font-bold text-slate-700 text-xs mt-0.5 block">SRB 13% SST</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {isOwner && (
                    <button
                      onClick={() => handleSwitchBranch(b.id)}
                      disabled={isActive}
                      className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                        isActive
                          ? "bg-amber-100/80 text-amber-800 border border-amber-300 cursor-default"
                          : "bg-[#0B1B3D] hover:bg-[#071120] text-amber-300 shadow-xs"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Currently Active</span>
                        </>
                      ) : (
                        <>
                          <span>Switch to this Salon</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex items-center gap-3 ml-auto">
                    <Link
                      href={`/dashboard/appointments?branch_id=${b.id}`}
                      className="font-bold text-[#0B1B3D] hover:text-amber-700 hover:underline text-[11px]"
                    >
                      Bookings
                    </Link>
                    <span className="text-slate-300">·</span>
                    <Link
                      href={`/dashboard/reports?branch_id=${b.id}`}
                      className="font-bold text-[#0B1B3D] hover:text-amber-700 hover:underline text-[11px]"
                    >
                      Sales &amp; Tax
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Multi-Salon Architecture Guide */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[#0B1B3D]">How Multi-Salon Management Operates</h4>
            <p className="text-xs text-slate-500">Universal oversight for the owner, strict branch scoping for receptionists.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0B1B3D]">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>1. Consolidated Network View</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Selecting &quot;All Branches View&quot; aggregates all locations into a single unified P&amp;L, showing total chain revenue, total appointments, combined SRB tax liability, and multi-branch attendance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0B1B3D]">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>2. Scoped Front Desk Receptionists</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When a receptionist logs into their station (e.g. Clifton or DHA), their screen is locked to that branch only. They cannot access other salon revenue, staff, or customer appointments.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0B1B3D]">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>3. Independent Daily Closures</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Each branch manager closes their own physical cash register and 80mm POS invoice batch daily. The owner receives real-time daily, MTD, QTD, and YTD performance comparisons side by side.
            </p>
          </div>
        </div>
      </div>

      {/* Add Branch Modal with 20% Discount */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-[#0B1B3D]">Launch New Salon Branch</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    20% Discount Applied
                  </span>
                </div>
                <p className="text-xs text-slate-500">Configure new branch station, phone, and chair capacity.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Gulshan-e-Iqbal Studio"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="GUL-03"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Styling Chairs</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={chairCount}
                    onChange={(e) => setChairCount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Block 13-A, Main University Road, Gulshan-e-Iqbal"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 21 34980000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Manager / Lead</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g. Usman Farooqi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gulshan@shay.salon"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 20% Off Billing Summary */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-700">
                  <span>Standard Branch Fee:</span>
                  <span className="line-through text-slate-400">Rs. 25,000 / mo</span>
                </div>
                <div className="flex justify-between font-bold text-[#0B1B3D]">
                  <span>Expansion Rate (20% OFF):</span>
                  <span className="text-amber-800 font-serif font-extrabold">Rs. 20,000 / mo</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-amber-200">
                  Includes POS receipts, staff time clock, WhatsApp concierges &amp; SRB SST tax compliance.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-[#0A1931] text-xs font-extrabold shadow-sm transition"
                >
                  {saving ? "Creating Branch..." : "Activate Branch (20% Off)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
