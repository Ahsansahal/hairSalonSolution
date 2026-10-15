"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles, Calendar, Clock, Scissors, Users,
  CreditCard, MessageSquare, LogOut, ChevronDown, ExternalLink,
  MapPin, Plus, UserPlus, LayoutGrid, CheckCircle2, Shield, Building,
  TrendingUp, UserCheck, Search, Bell, Mail, ChevronRight, Gift
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
  const [searchQuery, setSearchQuery] = useState("");

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
        <header className="h-20 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Search Bar (Pill style from screenshot) */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search appointments, clients, services, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F4F7FB] border border-slate-200 rounded-full focus:outline-none focus:border-amber-400 focus:bg-white text-slate-800 transition"
            />
          </div>

          {/* Right Header Controls (Messages, Notifications, User) */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Messages Icon with badge count 5 */}
            <div className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition cursor-pointer">
              <Mail className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                5
              </span>
            </div>

            {/* Notifications Bell with badge count 3 */}
            <div className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-slate-200" />

            {/* User Profile Pill */}
            <div className="flex items-center space-x-3 pl-1">
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
