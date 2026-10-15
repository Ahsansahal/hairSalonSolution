"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles, Calendar, Clock, Scissors, Users,
  CreditCard, MessageSquare, LogOut, ChevronDown, ExternalLink,
  MapPin, Plus, UserPlus, LayoutGrid, CheckCircle2, Shield, Building,
  TrendingUp, UserCheck, Search, Bell, Mail, ChevronRight, Gift,
  Check, X, AlertTriangle, ArrowRight, Store, RefreshCw, Smartphone
} from "lucide-react";
import { apiFetch, getAuthToken, getCurrentUser, clearSession } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { WalkInDialog } from "@/components/walk-in-dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [authVerified, setAuthVerified] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [walkInOpen, setWalkInOpen] = useState(false);

  // Header Dropdown States
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Notification Items
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Low Inventory Alert",
      desc: "Moroccan Argan Shampoo (250ml) is down to 8 units at Clifton Flagship.",
      time: "12m ago",
      unread: true,
      type: "inventory",
      href: "/dashboard/inventory",
    },
    {
      id: "notif-2",
      title: "New Online Booking Received",
      desc: "Zainab Tariq booked Hydra-Glow Facial for 01:30 PM at DHA Bukhari Studio.",
      time: "35m ago",
      unread: true,
      type: "booking",
      href: "/dashboard/appointments",
    },
    {
      id: "notif-3",
      title: "Staff Shift Attendance",
      desc: "Aliya Rizvi (Senior Stylist) clocked in at Clifton Flagship Chair 01.",
      time: "1h ago",
      unread: true,
      type: "staff",
      href: "/dashboard/attendance",
    },
    {
      id: "notif-4",
      title: "SRB 13% Tax Batch Ready",
      desc: "Sindh Revenue Board SST filing report ready for export (Rs. 18,525).",
      time: "2h ago",
      unread: false,
      type: "tax",
      href: "/dashboard/reports",
    },
  ]);

  // Messages Items
  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "Mrs. Thompson",
      phone: "+92 300 9876543",
      snippet: "Hi! Can I reschedule my Hydra-Glow Facial to 3:30 PM today?",
      time: "5m ago",
      unread: true,
      avatar: "T",
      branch: "DHA Bukhari",
    },
    {
      id: "msg-2",
      sender: "Shayan Merchant",
      phone: "+92 300 1234567",
      snippet: "Thank you for the VIP Suite service today. Excellent haircut by Aliya!",
      time: "42m ago",
      unread: true,
      avatar: "S",
      branch: "Clifton Flagship",
    },
    {
      id: "msg-3",
      sender: "Zainab Tariq",
      phone: "+92 321 9876543",
      snippet: "Is Dr. Sana Hashmi available at DHA Bukhari tomorrow morning?",
      time: "1h ago",
      unread: true,
      avatar: "Z",
      branch: "DHA Bukhari",
    },
    {
      id: "msg-4",
      sender: "Farhan Siddiqui",
      phone: "+92 333 4455667",
      snippet: "Please send the 80mm invoice copy on WhatsApp.",
      time: "2h ago",
      unread: true,
      avatar: "F",
      branch: "DHA Bukhari",
    },
    {
      id: "msg-5",
      sender: "Amina Alvi",
      phone: "+92 345 5566778",
      snippet: "Looking for bridal makeover consultation package details.",
      time: "3h ago",
      unread: true,
      avatar: "A",
      branch: "Clifton Flagship",
    },
  ]);

  // Search Knowledge Database
  const searchItems = [
    { title: "Today's Schedule & Floor Board", category: "Navigation", href: "/dashboard", desc: "Real-time chairs, overview and targets" },
    { title: "All Bookings & Appointments", category: "Navigation", href: "/dashboard/appointments", desc: "Calendar, timeline, confirmed bookings" },
    { title: "Daily Sales & SRB Tax Reports", category: "Navigation", href: "/dashboard/reports", desc: "Daily revenue, tax audit & commissions" },
    { title: "Deals & Packages Catalog", category: "Navigation", href: "/dashboard/deals", desc: "Active combos, savings & pricing" },
    { title: "Checkout & POS 80mm Receipts", category: "Navigation", href: "/dashboard/inventory", desc: "Fast billing & thermal printing" },
    { title: "Staff Time Clock & Attendance", category: "Navigation", href: "/dashboard/attendance", desc: "Biometric simulator & shift records" },
    { title: "WhatsApp Concierge Assistant", category: "Navigation", href: "/dashboard/whatsapp", desc: "Interactive guest chatbot simulator" },
    { title: "Client Records & CRM", category: "Navigation", href: "/dashboard/clients", desc: "Customer profiles & spend history" },
    { title: "SHAY Deal 01: Executive Grooming Suite", category: "Deals", href: "/dashboard/deals", desc: "Rs. 4,500 · 60 mins · Haircut + Beard" },
    { title: "Hydra-Glow Luxury Facial", category: "Services", href: "/dashboard/services", desc: "Rs. 9,500 · 75 mins · Esthetics" },
    { title: "Aliya Rizvi (Senior Stylist)", category: "Staff", href: "/dashboard/staff", desc: "Clifton Flagship Branch · Master Stylist" },
    { title: "Dr. Sana Hashmi (Clinical Esthetician)", category: "Staff", href: "/dashboard/staff", desc: "DHA Bukhari Studio · Skin Specialist" },
    { title: "Shayan Merchant (SHAY-CLF-8921)", category: "Clients", href: "/dashboard/appointments", desc: "Clifton Flagship · VIP Guest" },
    { title: "Zainab Tariq (SHAY-DHA-4412)", category: "Clients", href: "/dashboard/appointments", desc: "DHA Bukhari Studio · Online Guest" },
  ];

  const filteredSearchResults = searchQuery.trim()
    ? searchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    async function initSession() {
      const token = getAuthToken();
      const parsedUser = getCurrentUser();

      if (!token || !parsedUser) {
        clearSession();
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      setUser(parsedUser);
      setAuthVerified(true);

      apiFetch("/branches/")
        .then((data) => {
          const branchList = Array.isArray(data) ? data : data.results || [];
          setBranches(branchList);

          const isOwner = parsedUser?.system_role === "BUSINESS_OWNER" || parsedUser?.system_role === "PLATFORM_ADMIN";
          const currentStored = localStorage.getItem("salon_active_branch");

          if (!isOwner && branchList.length > 0) {
            const allowedIds = branchList.map((b: any) => b.id);
            if (!currentStored || !allowedIds.includes(currentStored) || currentStored === "all") {
              const defaultBranch = branchList[0].id;
              localStorage.setItem("salon_active_branch", defaultBranch);
              setSelectedBranchId(defaultBranch);
              window.dispatchEvent(new Event("branchChanged"));
            } else {
              setSelectedBranchId(currentStored);
            }
          } else {
            if (currentStored) {
              setSelectedBranchId(currentStored);
            } else {
              setSelectedBranchId("all");
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load branches", err);
          if (err.message && err.message.toLowerCase().includes("session")) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          }
        });
    }

    initSession();

    const handleExternalBranchChange = () => {
      const active = localStorage.getItem("salon_active_branch");
      if (active) setSelectedBranchId(active);
    };

    window.addEventListener("branchChanged", handleExternalBranchChange);
    return () => window.removeEventListener("branchChanged", handleExternalBranchChange);
  }, [router, pathname]);

  const handleBranchChange = (newBranchId: string) => {
    setSelectedBranchId(newBranchId);
    localStorage.setItem("salon_active_branch", newBranchId);
    window.dispatchEvent(new Event("branchChanged"));
  };

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  // Quick Role Switching for Instant Testing
  const handleSwitchProfile = (roleKey: string) => {
    const profileMap: Record<string, any> = {
      owner: {
        email: "owner@shay.salon",
        full_name: "Shayan Merchant",
        system_role: "BUSINESS_OWNER",
        branch_roles: [],
        branch_id: "all",
      },
      clifton_manager: {
        email: "manager.clifton@shay.salon",
        full_name: "Zainab Tariq",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b1", role: "BRANCH_MANAGER" }],
        branch_id: "b1",
      },
      dha_manager: {
        email: "manager.dha@shay.salon",
        full_name: "Hamza Abbasi",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b2", role: "BRANCH_MANAGER" }],
        branch_id: "b2",
      },
      clifton_reception: {
        email: "reception.clifton@shay.salon",
        full_name: "Ayesha Khan",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b1", role: "RECEPTIONIST" }],
        branch_id: "b1",
      },
      accountant: {
        email: "accountant@shay.salon",
        full_name: "Farhan Siddiqui",
        system_role: "STAFF",
        branch_roles: [{ branch_id: "b1", role: "ACCOUNTANT" }],
        branch_id: "all",
      },
    };

    const target = profileMap[roleKey];
    if (target) {
      setUser(target);
      localStorage.setItem("salon_user", JSON.stringify(target));
      localStorage.setItem("salon_active_branch", target.branch_id);
      setSelectedBranchId(target.branch_id);
      window.dispatchEvent(new Event("branchChanged"));
      setProfileMenuOpen(false);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAllMessagesRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, unread: false })));
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const unreadMsgCount = messages.filter((m) => m.unread).length;

  const isOwner = user?.system_role === "BUSINESS_OWNER" || user?.system_role === "PLATFORM_ADMIN";
  const userRole = user?.branch_roles?.[0]?.role || user?.system_role || "STAFF";
  const isReceptionist = userRole === "RECEPTIONIST" || user?.email?.includes("reception");
  const assignedBranchName = branches.length > 0 ? branches[0].name : "Clifton Flagship Branch";

  const navGroups = [
    {
      title: "Daily Operations",
      items: [
        { label: "Today's Schedule", href: "/dashboard", icon: Calendar, exact: true },
        { label: "All Bookings", href: "/dashboard/appointments", icon: Clock },
        { label: "Daily Sales Reports", href: "/dashboard/reports", icon: TrendingUp },
      ],
    },
    {
      title: "Salon Management",
      items: [
        { label: "Deals & Packages", href: "/dashboard/deals", icon: Sparkles },
        { label: "Client Records", href: "/dashboard/clients", icon: UserCheck },
        { label: "Services & Prices", href: "/dashboard/services", icon: Scissors },
        { label: "Team & Shifts", href: "/dashboard/staff", icon: Users },
        { label: "Checkout & POS", href: "/dashboard/inventory", icon: CreditCard },
      ],
    },
    {
      title: "Automations & Tools",
      items: [
        { label: "Staff Time Clock", href: "/dashboard/attendance", icon: Clock },
        { label: "WhatsApp Assistant", href: "/dashboard/whatsapp", icon: MessageSquare },
      ],
    },
  ];

  if (!authVerified) {
    return (
      <div className="min-h-screen bg-[#0A1931] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4 shadow-xl animate-pulse">
          <Sparkles className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="font-serif font-bold text-xl text-white tracking-wide">SHAY Luxury Salon &amp; Spa</h2>
        <p className="text-xs text-slate-300 mt-1 font-sans">Verifying security credentials &amp; branch access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1E293B] flex flex-col md:flex-row relative font-sans">
      {/* Sidebar - Deep Midnight Navy */}
      <aside className="w-full md:w-64 bg-[#0A1931] border-r border-[#15284F] flex flex-col flex-shrink-0 shadow-2xl z-30 text-white">
        {/* Brand Header */}
        <div className="h-20 px-5 border-b border-[#15284F] flex items-center justify-between bg-[#08152A]">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0A1931] shadow-md group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 font-bold" />
            </div>
            <div>
              <span className="font-serif tracking-wider font-extrabold text-white text-base leading-none block">
                SHAY
              </span>
              <span className="block text-[9px] uppercase tracking-[0.24em] text-amber-400 font-bold mt-1">
                Salon &amp; Spa · Karachi
              </span>
            </div>
          </Link>
        </div>

        {/* Location Switcher / Front Desk Terminal Box */}
        <div className="p-3.5 border-b border-[#15284F]">
          {isOwner || branches.length > 1 ? (
            <div className="rounded-2xl border border-[#1E3A6E] bg-[#0E2246] p-3 shadow-inner">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Salon Branch</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  HQ Live
                </span>
              </div>

              <div className="relative mt-2">
                <select
                  value={selectedBranchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-[#08152A] border border-[#1E3A6E] pl-3 pr-8 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer shadow-sm hover:border-amber-400/50 transition"
                >
                  <option value="all" className="bg-[#0A1931] text-white">Consolidated (All Branches)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#0A1931] text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              <div className="mt-2 pt-2 border-t border-[#15284F] flex items-center justify-between text-[11px]">
                <span className="text-slate-300 truncate mr-2 font-medium">
                  {selectedBranchId === "all" ? "Cross-Branch View" : branches.find((b) => b.id === selectedBranchId)?.name}
                </span>
                <Link
                  href="/book"
                  target="_blank"
                  className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 transition"
                >
                  <span>Client Site</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-500/30 bg-[#0E2246] p-3 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400">
                  Front Desk Station
                </span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active</span>
                </span>
              </div>
              <p className="text-xs font-bold text-white leading-tight">{assignedBranchName}</p>
              <div className="pt-1.5 border-t border-[#15284F] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">POS Terminal</span>
                <Link href="/book" target="_blank" className="font-bold text-amber-400 hover:underline flex items-center gap-0.5">
                  <span>Guest Site</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Walk-In Button */}
        <div className="px-3.5 py-3">
          <button
            onClick={() => setWalkInOpen(true)}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A1931] text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 text-[#0A1931] group-hover:scale-110 transition-transform" />
            <span>+ Add Walk-In Client</span>
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3.5 py-2 space-y-5 overflow-y-auto">
          {navGroups.map((grp, idx) => (
            <div key={idx}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {grp.title}
              </p>
              <div className="space-y-1">
                {grp.items.map((n) => {
                  const Icon = n.icon;
                  const isActive = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all ${
                        isActive
                          ? "bg-[#FBB040] text-[#0A1931] font-extrabold shadow-md shadow-amber-500/20"
                          : "text-slate-300 hover:text-white hover:bg-white/10 font-semibold"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#0A1931]" : "text-slate-400"}`} />
                        <span>{n.label}</span>
                      </div>
                      {!isActive && (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 -rotate-90 opacity-60" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer with Avatar and Sign Out */}
        <div className="p-3.5 border-t border-[#15284F] bg-[#08152A]">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0E2246] border border-[#1E3A6E]">
            <div className="flex items-center gap-2.5 min-w-0 mr-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-[#0A1931] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {(user?.full_name || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-white truncate">
                  {user?.full_name || user?.email || "Admin"}
                </span>
                <span className="block text-[10px] text-amber-400 font-semibold truncate">
                  {isOwner
                    ? "Super Administrator"
                    : isReceptionist
                    ? `${assignedBranchName} Desk`
                    : userRole === "BRANCH_MANAGER"
                    ? `${assignedBranchName} Manager`
                    : user?.email}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar matching Screenshot */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          {/* Search Bar with Live Suggestions Dropdown */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search appointments, clients, services, reports..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#F4F7FB] border border-slate-200 rounded-full focus:outline-none focus:border-amber-400 focus:bg-white text-slate-800 transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Search Suggestions Dropdown */}
            {searchOpen && searchQuery.trim() && (
              <div className="absolute top-11 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Results for &quot;{searchQuery}&quot;</span>
                  <span>{filteredSearchResults.length} found</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((res, i) => (
                      <Link
                        key={i}
                        href={res.href}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-[#0B1B3D] group-hover:text-amber-600 truncate">
                            {res.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{res.desc}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {res.category}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching services or records found for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Header Controls (Messages, Notifications, User) */}
          <div className="flex items-center space-x-3 sm:space-x-4 ml-auto relative">
            {/* Messages Icon with interactive popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setMessagesOpen(!messagesOpen);
                  setNotificationsOpen(false);
                  setProfileMenuOpen(false);
                }}
                className={`relative p-2.5 rounded-full transition cursor-pointer ${
                  messagesOpen ? "bg-amber-100 text-amber-700" : "hover:bg-slate-100 text-slate-600"
                }`}
                title="Guest Inquiries & Messages"
              >
                <Mail className="w-4 h-4" />
                {unreadMsgCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadMsgCount}
                  </span>
                )}
              </button>

              {/* Messages Popover Dropdown */}
              {messagesOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC] rounded-t-2xl">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="font-serif font-bold text-sm text-[#0B1B3D]">WhatsApp Inquiries</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {unreadMsgCount > 0 && (
                        <button
                          onClick={markAllMessagesRead}
                          className="text-[11px] font-bold text-amber-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                          m.unread ? "bg-amber-50/30" : ""
                        }`}
                        onClick={() => {
                          setMessagesOpen(false);
                          router.push("/dashboard/whatsapp");
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {m.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between pb-0.5">
                            <span className="font-bold text-xs text-[#0B1B3D] truncate">{m.sender}</span>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">{m.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 truncate">{m.snippet}</p>
                          <span className="inline-block text-[10px] font-semibold text-emerald-600 mt-0.5">
                            {m.branch}
                          </span>
                        </div>
                        {m.unread && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-[#F8FAFC] rounded-b-2xl flex items-center justify-between text-xs">
                    <Link
                      href="/dashboard/whatsapp"
                      onClick={() => setMessagesOpen(false)}
                      className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Open WhatsApp Concierge</span>
                    </Link>
                    <span className="text-[10px] text-slate-400">Twilio / Cloud API</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell with interactive popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setMessagesOpen(false);
                  setProfileMenuOpen(false);
                }}
                className={`relative p-2.5 rounded-full transition cursor-pointer ${
                  notificationsOpen ? "bg-amber-100 text-amber-700" : "hover:bg-slate-100 text-slate-600"
                }`}
                title="Real-Time System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC] rounded-t-2xl">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span className="font-serif font-bold text-sm text-[#0B1B3D]">System Alerts &amp; Updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[11px] font-bold text-amber-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-400 hover:text-rose-500"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.href}
                          onClick={() => setNotificationsOpen(false)}
                          className={`p-3.5 hover:bg-slate-50 transition block ${n.unread ? "bg-amber-50/30" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              n.type === "inventory"
                                ? "bg-rose-100 text-rose-600"
                                : n.type === "booking"
                                ? "bg-blue-100 text-blue-600"
                                : n.type === "staff"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}>
                              {n.type === "inventory" ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : n.type === "booking" ? (
                                <Calendar className="w-4 h-4" />
                              ) : n.type === "staff" ? (
                                <Users className="w-4 h-4" />
                              ) : (
                                <TrendingUp className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-xs text-[#0B1B3D] truncate">{n.title}</p>
                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
                            </div>
                            {n.unread && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">All notifications caught up!</div>
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-[#F8FAFC] rounded-b-2xl text-center">
                    <span className="text-[11px] text-slate-500">Live Webhook &amp; Inventory Listeners Active</span>
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-slate-200" />

            {/* User Profile Pill with Interactive Menu & 1-Click Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                  setMessagesOpen(false);
                }}
                className={`flex items-center space-x-3 p-1 rounded-2xl transition cursor-pointer border ${
                  profileMenuOpen
                    ? "border-amber-400 bg-amber-50/50"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0A1931] to-[#1E3A6E] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-200">
                  {(user?.full_name || user?.email || "A")[0].toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-[#0A1931] leading-none">
                    {user?.full_name || "Admin"}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium mt-1 leading-none">
                    {isOwner ? "Super Administrator" : isReceptionist ? "Front Desk" : "Branch Manager"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu with 1-Click Role Switcher */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 animate-in fade-in slide-in-from-top-2 p-3 space-y-3">
                  {/* Current Active Profile Info */}
                  <div className="p-3 rounded-xl bg-[#0A1931] text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-[#0A1931] font-bold text-xs flex items-center justify-center">
                        {(user?.full_name || user?.email || "A")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-xs text-white truncate">
                          {user?.full_name || user?.email}
                        </span>
                        <span className="block text-[10px] text-amber-400 font-semibold truncate">
                          {isOwner ? "Super Administrator · HQ" : userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Role Testing Switcher */}
                  <div className="space-y-1.5">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Role Profile (Live Test Mode)
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {/* Owner */}
                      <button
                        onClick={() => handleSwitchProfile("owner")}
                        className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
                          user?.email === "owner@shay.salon"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-amber-500" />
                          <span>Super Administrator</span>
                        </div>
                        {user?.email === "owner@shay.salon" && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </button>

                      {/* Clifton Manager */}
                      <button
                        onClick={() => handleSwitchProfile("clifton_manager")}
                        className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
                          user?.email === "manager.clifton@shay.salon"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-blue-500" />
                          <span>Clifton Branch Manager</span>
                        </div>
                        {user?.email === "manager.clifton@shay.salon" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>

                      {/* DHA Manager */}
                      <button
                        onClick={() => handleSwitchProfile("dha_manager")}
                        className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
                          user?.email === "manager.dha@shay.salon"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-purple-500" />
                          <span>DHA Bukhari Manager</span>
                        </div>
                        {user?.email === "manager.dha@shay.salon" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </button>

                      {/* Receptionist */}
                      <button
                        onClick={() => handleSwitchProfile("clifton_reception")}
                        className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
                          user?.email === "reception.clifton@shay.salon"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Front Desk Receptionist</span>
                        </div>
                        {user?.email === "reception.clifton@shay.salon" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>

                      {/* Accountant */}
                      <button
                        onClick={() => handleSwitchProfile("accountant")}
                        className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
                          user?.email === "accountant@shay.salon"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Accountant (SRB Filing)</span>
                        </div>
                        {user?.email === "accountant@shay.salon" && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions & Sign Out */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <Link
                      href="/dashboard/attendance"
                      onClick={() => setProfileMenuOpen(false)}
                      className="p-2 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Staff Time Clock</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full p-2 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Walk-in dialog */}
      <WalkInDialog
        isOpen={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event("branchChanged"));
        }}
      />
    </div>
  );
}
