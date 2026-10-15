"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar, Search, Plus, Filter, Clock, User, Phone,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Scissors,
  UserCheck, Sparkles, MapPin, Check, ChevronRight,
  LayoutGrid, List, ChevronLeft
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Card, PageHeader, Stat } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingDialog } from "@/components/booking-dialog";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Walk-in modal
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInBranch, setWalkInBranch] = useState("");
  const [walkInBookingType, setWalkInBookingType] = useState<"all" | "single" | "deal">("all");
  const [walkInService, setWalkInService] = useState("");
  const [walkInSelectedServices, setWalkInSelectedServices] = useState<string[]>([]);
  const [walkInStaff, setWalkInStaff] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInTime, setWalkInTime] = useState("");
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [walkInError, setWalkInError] = useState("");

  // User & RBAC state
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("salon_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        const isUserOwner = u.system_role === "BUSINESS_OWNER" || u.system_role === "PLATFORM_ADMIN";
        if (!isUserOwner) {
          const uBranch = u.branch_id || u.branch_roles?.[0]?.branch_id || "b1";
          setWalkInBranch(uBranch);
        }
      } catch (e) {}
    }
  }, []);

  const isOwner = user?.system_role === "BUSINESS_OWNER" || user?.system_role === "PLATFORM_ADMIN";
  const userAssignedBranch = user?.branch_id || user?.branch_roles?.[0]?.branch_id || "b1";

  const loadAppointments = () => {
    setLoading(true);
    const stored = typeof window !== "undefined" ? localStorage.getItem("salon_user") : null;
    let isUserOwner = true;
    let uBranch = "b1";
    if (stored) {
      try {
        const u = JSON.parse(stored);
        isUserOwner = u.system_role === "BUSINESS_OWNER" || u.system_role === "PLATFORM_ADMIN";
        uBranch = u.branch_id || u.branch_roles?.[0]?.branch_id || "b1";
      } catch (e) {}
    }
    const branchFromStorage = typeof window !== "undefined" ? (localStorage.getItem("salon_active_branch") || "all") : "all";
    const activeBranch = !isUserOwner ? uBranch : branchFromStorage;

    const params = new URLSearchParams();
    if (activeBranch !== "all") params.set("branch_id", activeBranch);
    if (statusFilter !== "all") params.set("status", statusFilter);

    apiFetch(`/appointments/?${params.toString()}`)
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load appointments");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
    const handleBranchChange = () => loadAppointments();
    window.addEventListener("branchChanged", handleBranchChange);

    apiFetch("/branches/").then((res) => {
      const bList = Array.isArray(res) ? res : res.results || [];
      setBranches(bList);
      const stored = localStorage.getItem("salon_user");
      let isUserOwner = true;
      let uBranch = "b1";
      if (stored) {
        try {
          const u = JSON.parse(stored);
          isUserOwner = u.system_role === "BUSINESS_OWNER" || u.system_role === "PLATFORM_ADMIN";
          uBranch = u.branch_id || u.branch_roles?.[0]?.branch_id || "b1";
        } catch (e) {}
      }

      if (!isUserOwner) {
        setWalkInBranch(uBranch);
      } else {
        const active = localStorage.getItem("salon_active_branch");
        if (active && active !== "all") {
          setWalkInBranch(active);
        } else if (bList.length > 0) {
          setWalkInBranch(bList[0].id);
        }
      }
    });

    apiFetch("/services/").then((res) => {
      const sList = Array.isArray(res) ? res : res.results || [];
      setServices(sList);
      if (sList.length > 0) setWalkInService(sList[0].id);
    });

    apiFetch("/staff/").then((res) => {
      const stList = Array.isArray(res) ? res : res.results || [];
      setStaffList(stList);
      if (stList.length > 0) setWalkInStaff(stList[0].id);
    });

    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    setWalkInTime(now.toISOString().slice(0, 16));

    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, [statusFilter]);

  const handleStatusTransition = async (apptId: string, newStatus: string) => {
    try {
      await apiFetch(`/appointments/${apptId}/status/`, {
        method: "POST",
        body: JSON.stringify({ status: newStatus, reason: `Status changed to ${newStatus}` }),
      });
      loadAppointments();
    } catch (err: any) {
      alert(err.message || "Failed to update appointment status");
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInSubmitting(true);
    setWalkInError("");

    try {
      await apiFetch("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          branch_id: walkInBranch,
          service_ids: walkInSelectedServices.length > 0 ? walkInSelectedServices : [walkInService],
          staff_id: walkInStaff,
          customer_name: walkInName,
          customer_phone: walkInPhone,
          start_time: new Date(walkInTime).toISOString(),
          source: "WALK_IN",
        }),
      });
      setShowWalkInModal(false);
      setWalkInName("");
      setWalkInPhone("");
      loadAppointments();
    } catch (err: any) {
      setWalkInError(err.message || "Failed to book walk-in appointment.");
    } finally {
      setWalkInSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.customer_name?.toLowerCase().includes(term) ||
      a.booking_reference?.toLowerCase().includes(term) ||
      a.staff_name?.toLowerCase().includes(term) ||
      a.branch_name?.toLowerCase().includes(term)
    );
  });

  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const inProgressCount = appointments.filter((a) => a.status === "IN_PROGRESS" || a.status === "CHECKED_IN").length;
  const completedTodayCount = appointments.filter((a) => a.status === "COMPLETED").length;

  // Group appointments by date for timeline
  const timelineDateAppts = useMemo(() => {
    return appointments.filter((a) => {
      const aDate = new Date(a.start_time).toISOString().split("T")[0];
      return aDate === selectedDate;
    });
  }, [appointments, selectedDate]);

  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        eyebrow="Boutique Schedule"
        title="Appointments & Calendar"
        description="Real-time multi-branch schedule, guest check-in desk, and walk-in reservation queue"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadAppointments}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#0B1B3D] hover:bg-slate-50 transition shadow-xs"
              title="Refresh Schedule"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            </button>
            <button
              onClick={() => setShowWalkInModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0B1B3D] to-[#12285A] hover:bg-[#0A1931] text-amber-300 text-xs font-bold shadow-xs transition transform hover:-translate-y-0.5 border border-[#0B1B3D]"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Walk-In Guest</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Total Bookings"
          value={appointments.length}
          tone="brand"
          trend="Live Roster"
          icon={<Calendar className="w-4 h-4 text-amber-600" />}
        />
        <Stat
          label="Upcoming Confirmed"
          value={confirmedCount}
          tone="info"
          trend="Ready to arrive"
          icon={<Clock className="w-4 h-4 text-[#1d5fbf]" />}
        />
        <Stat
          label="In Chair / Checked In"
          value={inProgressCount}
          tone="warning"
          trend="Active treatments"
          icon={<Scissors className="w-4 h-4 text-[#b45309]" />}
        />
        <Stat
          label="Completed Today"
          value={completedTodayCount}
          tone="success"
          trend="Discharged & Paid"
          icon={<CheckCircle2 className="w-4 h-4 text-[#15803d]" />}
        />
      </div>

      {/* View Switcher & Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search box & View Switcher */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* View switcher buttons */}
            <div className="flex items-center p-1 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-[#0B1B3D] text-amber-300 shadow-xs"
                    : "text-slate-500 hover:text-[#0B1B3D] hover:bg-slate-100"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  viewMode === "timeline"
                    ? "bg-[#0B1B3D] text-amber-300 shadow-xs"
                    : "text-slate-500 hover:text-[#0B1B3D] hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Stylist Lanes</span>
              </button>
            </div>

            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guest, ref, stylist..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium placeholder-slate-400"
              />
            </div>
          </div>

          {/* Status Segmented Buttons (in List View) or Date Nav (in Timeline View) */}
          {viewMode === "list" ? (
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              {[
                { id: "all", label: "All", activeClass: "bg-[#0B1B3D] text-amber-300 font-bold shadow-xs" },
                { id: "CONFIRMED", label: "Confirmed", activeClass: "bg-sky-700 text-white shadow-xs" },
                { id: "CHECKED_IN", label: "Checked In", activeClass: "bg-indigo-700 text-white shadow-xs" },
                { id: "IN_PROGRESS", label: "In Chair", activeClass: "bg-amber-600 text-white shadow-xs" },
                { id: "COMPLETED", label: "Completed", activeClass: "bg-emerald-700 text-white shadow-xs" },
                { id: "CANCELLED", label: "Cancelled", activeClass: "bg-rose-700 text-white shadow-xs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === tab.id
                      ? tab.activeClass
                      : "bg-slate-50 text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            /* Timeline Date Controls */
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDateBy(-1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B1B3D] focus:outline-none"
              />
              <button
                onClick={() => changeDateBy(1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
              >
                Today
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* VIEW 1: Stylist Lanes Timeline Calendar */}
      {viewMode === "timeline" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staffList.map((st) => {
              const staffAppts = timelineDateAppts.filter(
                (a) => a.staff_id === st.id || a.staff_name === st.full_name
              );

              return (
                <div
                  key={st.id}
                  className="bg-white rounded-3xl border border-[#e7dfd8] shadow-xs flex flex-col overflow-hidden"
                >
                  {/* Stylist Lane Header */}
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                        {st.full_name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#0B1B3D] leading-tight">{st.full_name}</h4>
                        <span className="text-[10px] text-slate-500">{st.title || "Master Artisan"}</span>
                      </div>
                    </div>
                    <Badge tone="brand" className="text-[10px] font-bold">
                      {staffAppts.length} Bookings
                    </Badge>
                  </div>

                  {/* Appointments in Lane */}
                  <div className="p-3.5 space-y-2.5 flex-1 min-h-[300px] bg-[#faf7f4]/40">
                    {staffAppts.length === 0 ? (
                      <div className="py-12 text-center text-[11px] text-[#7a7180]">
                        <Clock className="w-5 h-5 text-[#d6ccc3] mx-auto mb-1.5" />
                        <span>No appointments on this day</span>
                      </div>
                    ) : (
                      staffAppts.map((a) => {
                        const timeStr = new Date(a.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={a.id}
                            onClick={() => setSelectedAppointment(a)}
                            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition cursor-pointer space-y-1.5 group"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                {timeStr}
                              </span>
                              <Badge
                                dot
                                tone={
                                  a.status === "COMPLETED"
                                    ? "success"
                                    : a.status === "CONFIRMED"
                                    ? "info"
                                    : a.status === "CHECKED_IN"
                                    ? "purple"
                                    : a.status === "IN_PROGRESS"
                                    ? "warning"
                                    : "danger"
                                }
                              >
                                {a.status === "CHECKED_IN" ? "Seated" : a.status === "IN_PROGRESS" ? "In Chair" : a.status}
                              </Badge>
                            </div>

                            <div>
                              <h5 className="font-bold text-xs text-[#0B1B3D] group-hover:text-amber-700 transition">
                                {a.customer_name}
                              </h5>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {a.customer_phone}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                              <span className="text-slate-500">{a.total_duration_minutes}m duration</span>
                              <span className="font-serif font-bold text-[#0B1B3D]">
                                {formatCurrency(a.total_amount)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: List / Table View */}
      {viewMode === "list" && (
        <Card className="overflow-hidden border-slate-200">
          {loading && appointments.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
              <span>Synchronizing salon schedules...</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-semibold text-[#0B1B3D]">No appointments found</p>
              <p className="text-xs">Try adjusting your status filter or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Ref Code</th>
                    <th className="py-3.5 px-5">Guest</th>
                    <th className="py-3.5 px-5">Location</th>
                    <th className="py-3.5 px-5">Artisan</th>
                    <th className="py-3.5 px-5">Appointment Time</th>
                    <th className="py-3.5 px-5">Channel</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Total</th>
                    <th className="py-3.5 px-5 text-right">Floor Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#0B1B3D]">
                  {filteredAppointments.map((a) => {
                    const guestInitials = (a.customer_name || "Guest")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    const dateObj = new Date(a.start_time);
                    const isToday = new Date().toDateString() === dateObj.toDateString();

                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedAppointment(a)}
                        className="hover:bg-slate-50/80 transition group cursor-pointer"
                      >
                        {/* Ref code */}
                        <td className="py-4 px-5">
                          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {a.booking_reference}
                          </span>
                        </td>

                        {/* Guest */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B1B3D] to-[#12285A] text-amber-300 flex items-center justify-center text-[10px] font-bold shadow-xs flex-shrink-0">
                              {guestInitials}
                            </div>
                            <div>
                              <span className="font-semibold block text-[#0B1B3D] group-hover:text-amber-700 transition">
                                {a.customer_name}
                              </span>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {a.customer_phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-medium text-xs">{a.branch_name}</span>
                          </div>
                        </td>

                        {/* Stylist */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="font-semibold text-xs text-[#0B1B3D]">{a.staff_name}</span>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-5">
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-[#0B1B3D]">
                              {isToday && (
                                <span className="text-[9px] uppercase tracking-wide font-bold bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                                  Today
                                </span>
                              )}
                              <span>{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({a.total_duration_minutes}m)
                            </span>
                          </div>
                        </td>

                        {/* Booking Channel */}
                        <td className="py-4 px-5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            a.source === "WHATSAPP"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : a.source === "WALK_IN"
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            {a.source || "ONLINE"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <Badge
                            tone={
                              a.status === "COMPLETED"
                                ? "success"
                                : a.status === "CONFIRMED"
                                ? "info"
                                : a.status === "CHECKED_IN"
                                ? "purple"
                                : a.status === "IN_PROGRESS"
                                ? "warning"
                                : a.status === "CANCELLED"
                                ? "danger"
                                : "default"
                            }
                            dot={a.status === "IN_PROGRESS" || a.status === "CHECKED_IN"}
                          >
                            {a.status === "CHECKED_IN"
                              ? "Checked In"
                              : a.status === "IN_PROGRESS"
                              ? "In Chair"
                              : a.status === "CONFIRMED"
                              ? "Confirmed"
                              : a.status === "COMPLETED"
                              ? "Completed"
                              : a.status === "CANCELLED"
                              ? "Cancelled"
                              : a.status}
                          </Badge>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-5 font-serif font-bold text-sm text-[#1b1520]">
                          {formatCurrency(a.total_amount)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {a.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleStatusTransition(a.id, "CHECKED_IN")}
                                className="px-2.5 py-1 rounded-lg bg-[#f0e8f7] hover:bg-[#e4d4f2] text-[#6b21a8] font-bold text-[11px] border border-[#dfc5f5] transition"
                              >
                                Check In
                              </button>
                            )}
                            {a.status === "CHECKED_IN" && (
                              <button
                                onClick={() => handleStatusTransition(a.id, "IN_PROGRESS")}
                                className="px-2.5 py-1 rounded-lg bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] font-bold text-[11px] border border-[#fcd34d] transition"
                              >
                                Seat Guest
                              </button>
                            )}
                            {a.status === "IN_PROGRESS" && (
                              <button
                                onClick={() => setSelectedAppointment(a)}
                                className="px-2.5 py-1 rounded-lg bg-[#e3f5e8] hover:bg-[#cceed4] text-[#15803d] font-bold text-[11px] border border-[#b5e7c3] transition"
                              >
                                Checkout
                              </button>
                            )}
                            {a.status !== "COMPLETED" && a.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusTransition(a.id, "CANCELLED")}
                                className="px-2 py-1 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-700 text-[11px] font-medium transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Appointment Detail / Ticket Dialog */}
      {selectedAppointment && (
        <BookingDialog
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChanged={loadAppointments}
        />
      )}

      {/* Luxury Walk-In Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1B3D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 transform transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block">
                  Concierge Desk
                </span>
                <h3 className="text-xl font-serif font-bold text-[#0B1B3D]">New Walk-In Reservation</h3>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-[#0B1B3D] p-1.5 rounded-full hover:bg-slate-50 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const filteredWalkInServices = services.filter((s) => {
                const isDeal = s.category === "Deals & Packages" || s.category === "Wedding & Groom Packages" || s.name?.toLowerCase().includes("deal");
                if (walkInBookingType === "single") return !isDeal;
                if (walkInBookingType === "deal") return isDeal;
                return true;
              });
              const walkInCategories = Array.from(new Set(filteredWalkInServices.map((s) => s.category || "General Grooming")));
              const effectiveWalkInIds = walkInSelectedServices.length > 0 ? walkInSelectedServices : (walkInService ? [walkInService] : []);
              const selectedWalkInServicesList = services.filter((s) => effectiveWalkInIds.includes(s.id));
              const totalWalkInFee = selectedWalkInServicesList.reduce((acc, s) => acc + Number(s.base_price || 0), 0);
              const totalWalkInDuration = selectedWalkInServicesList.reduce((acc, s) => acc + Number(s.default_duration_minutes || 0), 0);

              return (
                <form onSubmit={handleCreateWalkIn} className="mt-5 space-y-4">
                  {/* Booking Type Filter Tabs */}
                  <div className="flex items-center justify-between p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setWalkInBookingType("all");
                        if (filteredWalkInServices.length > 0 && !filteredWalkInServices.find(s => s.id === walkInService)) {
                          setWalkInService(filteredWalkInServices[0].id);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition text-center ${
                        walkInBookingType === "all" ? "bg-white text-[#0B1B3D] shadow-xs" : "text-slate-500 hover:text-[#0B1B3D]"
                      }`}
                    >
                      All Treatments
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWalkInBookingType("single");
                        const singles = services.filter(s => !(s.category === "Deals & Packages" || s.category === "Wedding & Groom Packages" || s.name?.toLowerCase().includes("deal")));
                        if (singles.length > 0 && !singles.find(s => s.id === walkInService)) {
                          setWalkInService(singles[0].id);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition text-center ${
                        walkInBookingType === "single" ? "bg-[#0B1B3D] text-amber-300 shadow-xs font-bold" : "text-slate-500 hover:text-[#0B1B3D]"
                      }`}
                    >
                      ✂️ Single Services
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWalkInBookingType("deal");
                        const deals = services.filter(s => (s.category === "Deals & Packages" || s.category === "Wedding & Groom Packages" || s.name?.toLowerCase().includes("deal")));
                        if (deals.length > 0 && !deals.find(s => s.id === walkInService)) {
                          setWalkInService(deals[0].id);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition text-center ${
                        walkInBookingType === "deal" ? "bg-amber-600 text-white shadow-xs font-bold" : "text-slate-500 hover:text-[#0B1B3D]"
                      }`}
                    >
                      🎁 Combo Deals
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Branch Location</label>
                      {isOwner ? (
                        <select
                          value={walkInBranch}
                          onChange={(e) => setWalkInBranch(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs font-semibold flex items-center justify-between cursor-not-allowed select-none">
                          <span className="truncate">{branches.find((b) => b.id === (walkInBranch || userAssignedBranch))?.name || "Clifton Flagship Branch"}</span>
                          <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md font-bold shrink-0">
                            🔒 Station Locked
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">Treatment</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (walkInService && !walkInSelectedServices.includes(walkInService)) {
                              setWalkInSelectedServices([...walkInSelectedServices, walkInService]);
                            }
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition"
                        >
                          + Add More Services
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={walkInService}
                          onChange={(e) => {
                            const newId = e.target.value;
                            setWalkInService(newId);
                            if (walkInSelectedServices.length <= 1) {
                              setWalkInSelectedServices([newId]);
                            }
                          }}
                          required
                          className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                          {walkInCategories.map((cat) => (
                            <optgroup key={cat} label={`── ${cat} ──`}>
                              {filteredWalkInServices
                                .filter((s) => (s.category || "General Grooming") === cat)
                                .map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} ({s.default_duration_minutes || 30}m · Rs. {Number(s.base_price).toLocaleString()})
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (walkInService && !walkInSelectedServices.includes(walkInService)) {
                              setWalkInSelectedServices([...walkInSelectedServices, walkInService]);
                            }
                          }}
                          className="px-2.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition shrink-0"
                          title="Add another treatment"
                        >
                          + Add
                        </button>
                      </div>

                      {/* Selected treatments pills */}
                      {walkInSelectedServices.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {services
                            .filter((s) => walkInSelectedServices.includes(s.id))
                            .map((s) => (
                              <span
                                key={s.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-semibold text-[#0B1B3D]"
                              >
                                <span>{s.name}</span>
                                <strong className="text-amber-800">Rs. {Number(s.base_price).toLocaleString()}</strong>
                                {walkInSelectedServices.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setWalkInSelectedServices(walkInSelectedServices.filter((id) => id !== s.id))}
                                    className="ml-1 text-slate-400 hover:text-rose-600 font-bold"
                                    title="Remove treatment"
                                  >
                                    ✕
                                  </button>
                                )}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stylist / Artisan</label>
                  <select
                    value={walkInStaff}
                    onChange={(e) => setWalkInStaff(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {staffList
                      .filter((st) => !walkInBranch || !st.branch_id || st.branch_id === walkInBranch)
                      .map((st) => (
                        <option key={st.id} value={st.id}>{st.full_name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="e.g. Ayesha Khan"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {walkInError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{walkInError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
                    <span>Total Fee:</span>
                    <span className="text-amber-800 font-serif text-sm">Rs. {totalWalkInFee.toLocaleString()}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {selectedWalkInServicesList.length} service(s) · {totalWalkInDuration} mins
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWalkInModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={walkInSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0B1B3D] to-[#12285A] hover:bg-[#0A1931] text-amber-300 text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {walkInSubmitting ? "Locking Slot..." : "Confirm & Seat Guest"}
                  </button>
                </div>
              </div>
            </form>
          );
        })()}
          </div>
        </div>
      )}
    </div>
  );
}
