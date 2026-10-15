"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, AlertCircle, Clock, Calendar, Scissors, Phone, Sparkles, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface WalkInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialServiceId?: string;
}

export function WalkInDialog({ isOpen, onClose, onSuccess, initialServiceId }: WalkInDialogProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [branchId, setBranchId] = useState("");
  const [serviceId, setServiceId] = useState(initialServiceId || "");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(initialServiceId ? [initialServiceId] : []);
  const [bookingType, setBookingType] = useState<"all" | "single" | "deal">("all");
  const [staffId, setStaffId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const stored = localStorage.getItem("salon_user");
    let isUserOwner = true;
    let uBranch = "b1";
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        isUserOwner = u.system_role === "BUSINESS_OWNER" || u.system_role === "PLATFORM_ADMIN";
        uBranch = u.branch_id || u.branch_roles?.[0]?.branch_id || "b1";
      } catch (e) {}
    }

    if (initialServiceId) {
      setServiceId(initialServiceId);
    }

    // Default time: now rounded to nearest 15m
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    setStartTime(now.toISOString().slice(0, 16));

    apiFetch("/branches/").then((data) => {
      const bList = Array.isArray(data) ? data : data.results || [];
      setBranches(bList);
      if (!isUserOwner) {
        setBranchId(uBranch);
      } else {
        const activeBranch = localStorage.getItem("salon_active_branch");
        if (activeBranch && activeBranch !== "all") {
          setBranchId(activeBranch);
        } else if (bList.length > 0) {
          setBranchId(bList[0].id);
        }
      }
    });

    apiFetch("/services/").then((data) => {
      const sList = Array.isArray(data) ? data : data.results || [];
      setServices(sList);
      if (initialServiceId) {
        setServiceId(initialServiceId);
        setSelectedServiceIds([initialServiceId]);
      } else if (sList.length > 0 && selectedServiceIds.length === 0) {
        setServiceId(sList[0].id);
        setSelectedServiceIds([sList[0].id]);
      }
    });

    apiFetch("/staff/").then((data) => {
      const stList = Array.isArray(data) ? data : data.results || [];
      setStaffList(stList);
      if (stList.length > 0) setStaffId(stList[0].id);
    });
  }, [isOpen]);

  const isOwner = user?.system_role === "BUSINESS_OWNER" || user?.system_role === "PLATFORM_ADMIN";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          branch_id: branchId,
          service_ids: selectedServiceIds.length > 0 ? selectedServiceIds : [serviceId],
          staff_id: staffId || null,
          customer_name: customerName,
          customer_phone: customerPhone,
          start_time: new Date(startTime).toISOString(),
          source: "WALK_IN",
          notes: notes,
        }),
      });

      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not book walk-in appointment. Please verify stylist availability.");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const isDeal = s.category === "Deals & Packages" || s.category === "Wedding & Groom Packages" || s.name?.toLowerCase().includes("deal");
    if (bookingType === "single") return !isDeal;
    if (bookingType === "deal") return isDeal;
    return true;
  });

  const categories = Array.from(new Set(filteredServices.map((s) => s.category || "General Grooming")));
  const effectiveServiceIds = selectedServiceIds.length > 0 ? selectedServiceIds : (serviceId ? [serviceId] : []);
  const selectedServicesList = services.filter((s) => effectiveServiceIds.includes(s.id));
  const totalAmount = selectedServicesList.reduce((acc, s) => acc + Number(s.base_price || 0), 0);
  const totalDuration = selectedServicesList.reduce((acc, s) => acc + Number(s.default_duration_minutes || 0), 0);
  const selectedSvc = services.find((s) => s.id === serviceId);

  return (
    <div className="fixed inset-0 z-50 bg-[#1b1520]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#e7dfd8] max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up relative">
        {/* Top Gradient Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#a3214f] via-[#b38742] to-[#a3214f]" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e7dfd8] bg-[#faf7f4] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#a3214f]">
            <div className="w-8 h-8 rounded-xl bg-[#fbe9ef] border border-[#f3cad8] flex items-center justify-center text-[#a3214f]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1b1520] leading-none">Add Walk-In Guest</h3>
              <span className="text-[10px] text-[#7a7180] font-semibold uppercase tracking-wider">
                Instant Reception Check-In
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7a7180] hover:text-[#1b1520] hover:bg-[#e7dfd8]/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Booking Type Filter Tabs */}
          <div className="flex items-center justify-between p-1 rounded-xl bg-[#f4efea] border border-[#e7dfd8] text-xs">
            <button
              type="button"
              onClick={() => {
                setBookingType("all");
                if (filteredServices.length > 0 && !filteredServices.find(s => s.id === serviceId)) {
                  setServiceId(filteredServices[0].id);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition text-center ${
                bookingType === "all" ? "bg-white text-[#1b1520] shadow-xs" : "text-[#7a7180] hover:text-[#1b1520]"
              }`}
            >
              All Treatments
            </button>
            <button
              type="button"
              onClick={() => {
                setBookingType("single");
                const singles = services.filter(s => !(s.category === "Deals & Packages" || s.category === "Wedding & Groom Packages" || s.name?.toLowerCase().includes("deal")));
                if (singles.length > 0 && !singles.find(s => s.id === serviceId)) {
                  setServiceId(singles[0].id);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition text-center ${
                bookingType === "single" ? "bg-[#a3214f] text-white shadow-xs" : "text-[#7a7180] hover:text-[#1b1520]"
              }`}
            >
              ✂️ Single Services
            </button>
            <button
              type="button"
              onClick={() => {
                setBookingType("deal");
                const deals = services.filter(s => (s.category === "Deals & Packages" || s.category === "Wedding & Groom Packages" || s.name?.toLowerCase().includes("deal")));
                if (deals.length > 0 && !deals.find(s => s.id === serviceId)) {
                  setServiceId(deals[0].id);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg font-bold transition text-center ${
                bookingType === "deal" ? "bg-[#b38742] text-white shadow-xs" : "text-[#7a7180] hover:text-[#1b1520]"
              }`}
            >
              🎁 Combo Deals
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4a4250] mb-1">Salon Branch</label>
              {isOwner ? (
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-bold text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-bold text-[#1b1520] flex items-center justify-between cursor-not-allowed select-none">
                  <span className="truncate">{branches.find((b) => b.id === branchId)?.name || "Clifton Flagship Branch"}</span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md font-bold shrink-0">
                    🔒 Station Locked
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#4a4250]">Service Treatment</label>
                <button
                  type="button"
                  onClick={() => {
                    if (serviceId && !selectedServiceIds.includes(serviceId)) {
                      setSelectedServiceIds([...selectedServiceIds, serviceId]);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a3214f] hover:text-[#7f1339] transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add More Services</span>
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={serviceId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setServiceId(newId);
                    if (selectedServiceIds.length <= 1) {
                      setSelectedServiceIds([newId]);
                    }
                  }}
                  required
                  className="flex-1 px-3 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-bold text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                >
                  {categories.map((cat) => (
                    <optgroup key={cat} label={`── ${cat} ──`}>
                      {filteredServices
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
                    if (serviceId && !selectedServiceIds.includes(serviceId)) {
                      setSelectedServiceIds([...selectedServiceIds, serviceId]);
                    }
                  }}
                  className="px-2.5 py-2 rounded-xl bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] text-xs font-bold hover:bg-[#f8d7e3] transition shrink-0"
                  title="Add another service to this guest's visit"
                >
                  + Add
                </button>
              </div>

              {/* Multi-service chips */}
              {selectedServicesList.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedServicesList.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fbe9ef] border border-[#f3cad8] text-[11px] font-semibold text-[#1b1520]"
                    >
                      <span>{s.name}</span>
                      <strong className="text-[#a3214f]">Rs. {Number(s.base_price).toLocaleString()}</strong>
                      {selectedServicesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSelectedServiceIds(selectedServiceIds.filter((id) => id !== s.id))}
                          className="ml-1 text-[#a3214f] hover:text-rose-900 font-bold"
                          title="Remove service"
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
              <label className="block text-xs font-bold text-[#4a4250] mb-1">Assigned Stylist</label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-bold text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
              >
                <option value="">Auto-Assign Available Stylist</option>
                {staffList
                  .filter((st) => !branchId || !st.branch_id || st.branch_id === branchId)
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4a4250] mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-bold text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4a4250] mb-1">Client Full Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="e.g. Ayesha Khan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-semibold text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4a4250] mb-1">Contact Phone *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-semibold text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4a4250] mb-1">Special Notes / Preferences</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Warm towel massage preference"
              className="w-full px-3.5 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-medium text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#e7dfd8] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1b1520] flex items-center gap-1.5">
                <span>Total Fee:</span>
                <span className="text-[#a3214f] font-serif text-sm">Rs. {totalAmount.toLocaleString()}</span>
              </span>
              <span className="text-[10px] text-[#7a7180]">
                {selectedServicesList.length} service(s) · {totalDuration} mins estimated
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#e7dfd8] text-xs font-semibold text-[#7a7180] hover:bg-[#faf7f4] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a3214f] to-[#88183f] hover:from-[#8b1b42] hover:to-[#6f1232] text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {loading ? "Locking Slot..." : "Confirm & Seat Guest"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
