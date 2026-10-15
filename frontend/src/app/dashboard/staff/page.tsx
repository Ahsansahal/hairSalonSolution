"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Phone, Calendar, Clock, Scissors, MapPin, Plus, Search, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card, PageHeader, Stat } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadStaff = () => {
    setLoading(true);
    const activeBranch = localStorage.getItem("salon_active_branch") || "all";
    const branchParam = activeBranch !== "all" ? `?branch_id=${activeBranch}` : "";

    apiFetch(`/staff/${branchParam}`)
      .then((data) => {
        setStaffList(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => {
        console.error("Failed to load staff", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStaff();
    const handleBranchChange = () => loadStaff();
    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, []);

  const filteredStaff = staffList.filter((st) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      st.full_name?.toLowerCase().includes(term) ||
      st.title?.toLowerCase().includes(term) ||
      st.employee_code?.toLowerCase().includes(term)
    );
  });

  const activeStaffCount = staffList.filter((s) => s.is_active).length;
  const totalServicesCovered = new Set(
    staffList.flatMap((s) => s.qualified_services?.map((qs: any) => qs.service_name) || [])
  ).size;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <PageHeader
        eyebrow="Talent & Roster"
        title="Artisans & Stylists"
        description="Talent directory, branch assignments, treatment qualifications, and scheduled shifts"
        actions={
          <button
            onClick={() => alert("Staff invitation sent to admin email.")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#a3214f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#8b1b42]"
          >
            <Plus className="h-4 w-4" />
            <span>Invite New Stylist</span>
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Total Stylists"
          value={staffList.length}
          tone="brand"
          icon={<Users className="h-4 w-4 text-[#a3214f]" />}
        />
        <Stat
          label="Active on Roster"
          value={activeStaffCount}
          tone="success"
          icon={<ShieldCheck className="h-4 w-4 text-[#15803d]" />}
        />
        <Stat
          label="Services Covered"
          value={totalServicesCovered}
          tone="info"
          icon={<Scissors className="h-4 w-4 text-[#1d5fbf]" />}
        />
        <Stat
          label="Weekly Shifts"
          value={staffList.reduce((acc, s) => acc + (s.shifts?.length || 0), 0)}
          tone="warning"
          icon={<Clock className="h-4 w-4 text-[#b45309]" />}
        />
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7a7180] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stylist by name, title, or code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
          />
        </div>
      </Card>

      {/* Staff Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#7a7180]">Loading stylist directory...</div>
      ) : filteredStaff.length === 0 ? (
        <Card className="p-12 text-center text-[#7a7180]">
          <Users className="w-8 h-8 text-[#d6ccc3] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#1b1520]">No stylists found</p>
          <p className="text-xs mt-1">Try refining your search filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredStaff.map((st) => {
            const initials = st.full_name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "ST";

            return (
              <Card
                key={st.id}
                className="p-5 flex flex-col justify-between hover:border-[#d6ccc3] transition hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] flex items-center justify-center font-bold text-sm">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#1b1520]">{st.full_name}</h3>
                          <Badge tone="brand" className="font-mono text-[9px] px-1.5 py-0.5">
                            {st.employee_code}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-[#a3214f] mt-0.5">
                          {st.title || "Master Artisan"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        st.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {st.is_active ? "Active" : "On Leave"}
                    </span>
                  </div>

                  <p className="text-xs text-[#7a7180] leading-relaxed line-clamp-2">
                    {st.bio || "Specialist salon professional dedicated to luxury styling and guest care."}
                  </p>

                  {/* Branch Assignments */}
                  <div className="pt-3 border-t border-[#e7dfd8]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7a7180] block mb-2">
                      Assigned Salons
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {st.branch_assignments?.map((ba: any) => (
                        <span
                          key={ba.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#faf7f4] border border-[#e7dfd8] text-xs text-[#1b1520]"
                        >
                          <MapPin className="w-3 h-3 text-[#a3214f]" />
                          <span className="font-medium">{ba.branch_name}</span>
                          {ba.is_primary && (
                            <span className="text-[9px] font-bold text-[#a3214f] ml-0.5">★ Primary</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Qualified Services */}
                  <div className="pt-3 border-t border-[#e7dfd8]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7a7180] block mb-2">
                      Certified Treatments
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {st.qualified_services?.map((qs: any) => (
                        <span
                          key={qs.id}
                          className="px-2 py-0.5 rounded-md bg-[#faf7f4] border border-[#e7dfd8] text-[11px] text-[#4a4250] flex items-center gap-1"
                        >
                          <Scissors className="w-2.5 h-2.5 text-[#a3214f]" />
                          <span>{qs.service_name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shift Schedule Footer */}
                {st.shifts && st.shifts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#e7dfd8] flex items-center justify-between text-[11px] text-[#7a7180]">
                    <span className="flex items-center gap-1.5 font-medium text-[#1b1520]">
                      <Clock className="w-3.5 h-3.5 text-[#a3214f]" />
                      <span>{st.shifts.length} weekly shifts scheduled</span>
                    </span>
                    <span className="text-[#7a7180] bg-[#faf7f4] px-2 py-0.5 rounded border border-[#e7dfd8]">
                      Break: 13:00 - 14:00
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
