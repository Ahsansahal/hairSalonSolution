"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles, Calendar, Clock, CheckCircle2,
  MapPin, AlertCircle, ArrowLeft, Search, XCircle,
  RefreshCw, Scissors, User, Phone, Mail, Check,
  ChevronRight, ArrowRight, ShieldCheck, Heart
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  duration_minutes: number;
}

interface Staff {
  id: string;
  full_name: string;
  title: string;
  bio: string;
}

interface Slot {
  time: string;
  datetime: string;
  staff_id: string;
  staff_name: string;
  duration_minutes: number;
}

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<"book" | "manage">("book");

  // Step 1: Branch & Service
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceCategory, setServiceCategory] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<string>("");

  // Step 2: Date & Slot
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Step 3: Client Details
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(true);

  // Status & Confirmation
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Lookup existing
  const [lookupRef, setLookupRef] = useState<string>("");
  const [lookupPhone, setLookupPhone] = useState<string>("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string>("");

  useEffect(() => {
    apiFetch<Branch[]>("/public/branches/")
      .then((data) => {
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0]);
      })
      .catch((err) => {
        setErrorMsg("Failed to connect to backend server.");
      });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;
    setSelectedServices([]);
    setSelectedSlot(null);
    setSlots([]);

    apiFetch<{ services: Service[]; staff: Staff[] }>(`/public/catalog/?branch_id=${selectedBranch.id}`)
      .then((data) => {
        setServices(data.services);
        setStaffMembers(data.staff);
      })
      .catch((err) => {
        console.error("Catalog load error", err);
      });
  }, [selectedBranch]);

  useEffect(() => {
    if (!selectedBranch || selectedServices.length === 0 || !selectedDate) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSelectedSlot(null);
    setErrorMsg("");

    const params = new URLSearchParams();
    params.set("branch_id", selectedBranch.id);
    selectedServices.forEach((sId) => params.append("service_ids", sId));
    params.set("date", selectedDate);
    if (selectedStaff) params.set("staff_id", selectedStaff);

    apiFetch<{ slots: Slot[] }>(`/public/availability/?${params.toString()}`)
      .then((data) => {
        setSlots(data.slots || []);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to calculate open times.");
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedBranch, selectedServices, selectedDate, selectedStaff]);

  const toggleService = (sId: string) => {
    if (selectedServices.includes(sId)) {
      setSelectedServices(selectedServices.filter((id) => id !== sId));
    } else {
      setSelectedServices([...selectedServices, sId]);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || selectedServices.length === 0 || !selectedSlot) {
      setErrorMsg("Please choose your service and time slot.");
      return;
    }
    if (!fullName || !phone) {
      setErrorMsg("Please provide your name and phone number.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        branch_id: selectedBranch.id,
        service_ids: selectedServices,
        start_time: selectedSlot.datetime,
        preferred_staff_id: selectedSlot.staff_id,
        full_name: fullName,
        phone: phone,
        email: email,
        notes: notes,
        whatsapp_opt_in: whatsappOptIn,
      };

      const result = await apiFetch("/public/bookings/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setConfirmedBooking(result);
    } catch (err: any) {
      setErrorMsg(err.message || "This time slot is no longer available. Please select another time.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRef) return;
    setLookupLoading(true);
    setLookupError("");
    setLookupResult(null);

    try {
      const data = await apiFetch(`/public/bookings/${lookupRef.trim().toUpperCase()}/?phone=${encodeURIComponent(lookupPhone.trim())}`);
      setLookupResult(data);
    } catch (err: any) {
      setLookupError(err.message || "Appointment not found. Please double-check your reference code.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!lookupResult) return;
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await apiFetch(`/public/bookings/${lookupResult.booking_reference}/cancel/`, {
        method: "POST",
        body: JSON.stringify({ phone: lookupPhone, reason: "Cancelled by customer" }),
      });
      setLookupResult(res);
      alert("Appointment cancelled successfully.");
    } catch (err: any) {
      alert(err.message || "Cancellation failed.");
    }
  };

  // Categories calculation
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["all", ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (serviceCategory === "all") return services;
    return services.filter((s) => s.category === serviceCategory);
  }, [services, serviceCategory]);

  // Selected services objects
  const selectedServiceObjects = useMemo(() => {
    return services.filter((s) => selectedServices.includes(s.id));
  }, [services, selectedServices]);

  const totalCost = useMemo(() => {
    return selectedServiceObjects.reduce((acc, s) => acc + parseFloat(s.price || "0"), 0);
  }, [selectedServiceObjects]);

  const totalDuration = useMemo(() => {
    return selectedServiceObjects.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  }, [selectedServiceObjects]);

  // Group slots by morning / afternoon / evening
  const groupedSlots = useMemo(() => {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.time.split(":")[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  }, [slots]);

  return (
    <div className="min-h-screen bg-[#faf7f4] text-[#1b1520] flex flex-col font-sans selection:bg-[#fbe9ef] selection:text-[#a3214f]">
      {/* Top Boutique Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#e7dfd8] sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fbe9ef] to-[#f6d7e2] border border-[#f3cad8] flex items-center justify-center text-[#a3214f] shadow-xs group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-[#a3214f]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-wider text-[#1b1520] block leading-none">
                SHAY
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#7a7180] font-semibold">
                Salon &amp; Luxury Spa · Karachi
              </span>
            </div>
          </Link>

          {/* Tab switch pills */}
          <div className="flex items-center p-1 rounded-full bg-[#f4efea] border border-[#e7dfd8]">
            <button
              onClick={() => setActiveTab("book")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "book"
                  ? "bg-[#a3214f] text-white shadow-xs"
                  : "text-[#7a7180] hover:text-[#1b1520]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserve Visit</span>
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "manage"
                  ? "bg-[#a3214f] text-white shadow-xs"
                  : "text-[#7a7180] hover:text-[#1b1520]"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup Booking</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Sub-Header */}
      <div className="bg-gradient-to-b from-white via-white/80 to-[#faf7f4] border-b border-[#e7dfd8]/60 py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clifton Flagship &amp; DHA Bukhari · Karachi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1b1520] tracking-tight">
            Reserve Your Visit at SHAY
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#7a7180] max-w-xl mx-auto leading-relaxed">
            Select your preferred Karachi sanctuary (Clifton or DHA), master stylist, and curated treatments. Instant confirmation dispatched via WhatsApp &amp; SMS.
          </p>

          {/* Stepper Indicator */}
          {activeTab === "book" && !confirmedBooking && (
            <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4 max-w-lg mx-auto">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  selectedServices.length > 0 ? "bg-[#a3214f] text-white" : "bg-[#fbe9ef] text-[#a3214f] border border-[#f3cad8]"
                }`}>
                  1
                </span>
                <span className="text-xs font-bold text-[#1b1520]">Treatments</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#d6ccc3]" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  selectedSlot ? "bg-[#a3214f] text-white" : "bg-[#f4efea] text-[#7a7180] border border-[#e7dfd8]"
                }`}>
                  2
                </span>
                <span className={`text-xs font-semibold ${selectedServices.length > 0 ? "text-[#1b1520]" : "text-[#7a7180]"}`}>
                  Artisan & Time
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#d6ccc3]" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  confirmedBooking ? "bg-[#15803d] text-white" : "bg-[#f4efea] text-[#7a7180] border border-[#e7dfd8]"
                }`}>
                  3
                </span>
                <span className={`text-xs font-semibold ${selectedSlot ? "text-[#1b1520]" : "text-[#7a7180]"}`}>
                  Confirm
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Find My Booking Tab */}
        {activeTab === "manage" && (
          <div className="max-w-lg mx-auto bg-white border border-[#e7dfd8] rounded-3xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1b1520]">Lookup Your Reservation</h2>
              <p className="text-xs text-[#7a7180] mt-1">
                Enter your booking reference code (e.g. BK-SHAY-001) to view status, schedule details, or cancel your visit.
              </p>
            </div>

            <form onSubmit={handleLookupBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4a4250] mb-1">Booking Reference Code</label>
                <input
                  type="text"
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value)}
                  placeholder="BK-SHAY-001"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-mono uppercase tracking-wider font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a4250] mb-1">Your Mobile Phone</label>
                <input
                  type="text"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                />
              </div>

              {lookupError && (
                <div className="p-3.5 rounded-xl bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a3214f] to-[#88183f] hover:from-[#8b1b42] hover:to-[#6f1232] text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-2"
              >
                {lookupLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching records...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find My Reservation</span>
                  </>
                )}
              </button>
            </form>

            {lookupResult && (
              <div className="mt-8 pt-6 border-t border-[#e7dfd8] space-y-4">
                <div className="p-5 rounded-2xl bg-[#faf7f4] border border-[#e7dfd8] space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#e7dfd8]">
                    <span className="font-mono font-bold text-[#a3214f]">{lookupResult.booking_reference}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      lookupResult.status === "COMPLETED"
                        ? "bg-[#e3f5e8] text-[#15803d] border border-[#b5e7c3]"
                        : lookupResult.status === "CONFIRMED"
                        ? "bg-[#e5eefc] text-[#1d5fbf] border border-[#b8d2f8]"
                        : lookupResult.status === "CANCELLED"
                        ? "bg-[#fbe9ef] text-[#a3214f] border border-[#f3cad8]"
                        : "bg-stone-100 text-stone-700"
                    }`}>
                      {lookupResult.status}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#7a7180]">Guest Name</span>
                    <span className="font-bold text-[#1b1520]">{lookupResult.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a7180]">Salon Location</span>
                    <span className="font-semibold text-[#1b1520]">{lookupResult.branch_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a7180]">Artisan Stylist</span>
                    <span className="font-semibold text-[#1b1520]">{lookupResult.staff_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a7180]">Scheduled Time</span>
                    <span className="font-semibold text-[#1b1520]">
                      {new Date(lookupResult.start_time).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#e7dfd8]">
                    <span className="text-[#7a7180] font-bold">Total Service Fee</span>
                    <span className="font-serif font-bold text-base text-[#a3214f]">
                      {formatCurrency(lookupResult.total_amount)}
                    </span>
                  </div>
                </div>

                {lookupResult.status !== "CANCELLED" && lookupResult.status !== "COMPLETED" && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-2.5 rounded-xl border border-[#f3cad8] hover:bg-[#fbe9ef] text-[#a3214f] font-bold text-xs transition"
                  >
                    Cancel This Reservation
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* New Booking Flow */}
        {activeTab === "book" && (
          <div>
            {confirmedBooking ? (
              /* High-End Confirmation Voucher */
              <div className="max-w-xl mx-auto bg-white border border-[#e7dfd8] rounded-3xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#a3214f] via-[#b38742] to-[#a3214f]" />

                <div className="w-16 h-16 rounded-full bg-[#e3f5e8] text-[#15803d] flex items-center justify-center mx-auto mb-4 border border-[#b5e7c3] shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#1b1520]">Your Visit is Reserved</h2>
                <p className="text-xs text-[#7a7180] mt-1.5 max-w-sm mx-auto">
                  We eagerly anticipate welcoming you, <strong className="text-[#1b1520]">{confirmedBooking.customer_name}</strong>.
                </p>

                {/* Ticket Body */}
                <div className="mt-8 p-6 rounded-2xl bg-[#faf7f4] border border-[#e7dfd8] text-left space-y-3.5 text-xs relative">
                  <div className="flex justify-between items-center pb-3 border-b border-[#e7dfd8]">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#7a7180] block">
                        Reservation Voucher
                      </span>
                      <span className="font-mono text-base font-bold text-[#a3214f]">
                        {confirmedBooking.booking_reference}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#e3f5e8] text-[#15803d] border border-[#b5e7c3] text-[10px] font-bold uppercase tracking-wider">
                      Confirmed
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#7a7180]">Salon Boutique</span>
                    <span className="font-bold text-[#1b1520]">{confirmedBooking.branch_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a7180]">Stylist Artisan</span>
                    <span className="font-bold text-[#1b1520]">{confirmedBooking.staff_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a7180]">Appointment Time</span>
                    <span className="font-bold text-[#1b1520]">
                      {new Date(confirmedBooking.start_time).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#e7dfd8]">
                    <span className="text-[#7a7180] font-bold">Total Service Fee</span>
                    <span className="font-serif font-bold text-lg text-[#a3214f]">
                      {formatCurrency(confirmedBooking.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-3.5 rounded-xl bg-[#e8f7ee] border border-[#bce8cb] text-[#1b7a42] text-xs flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Confirmation & WhatsApp reminder sent to <strong>{confirmedBooking.customer_phone}</strong></span>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setConfirmedBooking(null);
                      setSelectedServices([]);
                      setSelectedSlot(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#a3214f] to-[#88183f] hover:from-[#8b1b42] hover:to-[#6f1232] text-white font-bold text-xs shadow-sm transition"
                  >
                    Reserve Another Visit
                  </button>
                  <Link
                    href="/"
                    className="py-3 px-6 rounded-xl border border-[#e7dfd8] hover:bg-[#faf7f4] text-[#1b1520] font-semibold text-xs transition"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              /* 3-Step Interactive Booking Layout with Sticky Sidebar */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Steps Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Step 1: Location & Services */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e7dfd8] shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7dfd8]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#fbe9ef] text-[#a3214f] font-bold text-xs flex items-center justify-center">
                            1
                          </span>
                          <h2 className="text-xl font-serif font-bold text-[#1b1520]">
                            Select Salon & Treatments
                          </h2>
                        </div>
                        <p className="text-xs text-[#7a7180] mt-1">Choose your destination boutique and service treatments</p>
                      </div>

                      {/* Location Selector Pill */}
                      <div className="flex items-center gap-2 bg-[#faf7f4] border border-[#e7dfd8] px-3.5 py-2 rounded-2xl shadow-2xs">
                        <MapPin className="w-4 h-4 text-[#a3214f]" />
                        <select
                          value={selectedBranch?.id || ""}
                          onChange={(e) => {
                            const b = branches.find((item) => item.id === e.target.value);
                            if (b) setSelectedBranch(b);
                          }}
                          className="bg-transparent text-xs font-bold text-[#1b1520] focus:outline-none cursor-pointer"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Category Filter Chips */}
                    {categories.length > 2 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setServiceCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${
                              serviceCategory === cat
                                ? "bg-[#1b1520] text-white shadow-xs"
                                : "bg-[#faf7f4] text-[#7a7180] hover:text-[#1b1520] hover:bg-[#f2ece6] border border-[#e7dfd8]"
                            }`}
                          >
                            {cat === "all" ? "All Treatments" : cat}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {filteredServices.map((s) => {
                        const isSelected = selectedServices.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={() => toggleService(s.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between group ${
                              isSelected
                                ? "bg-[#fef8fa] border-[#a3214f] shadow-xs ring-1 ring-[#a3214f]/20"
                                : "bg-[#faf7f4]/60 border-[#e7dfd8] hover:border-[#d6ccc3] hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition flex-shrink-0 ${
                                  isSelected
                                    ? "bg-[#a3214f] border-[#a3214f] text-white"
                                    : "border-[#d6ccc3] bg-white group-hover:border-[#a3214f]"
                                }`}>
                                  {isSelected && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-[#1b1520] group-hover:text-[#a3214f] transition">
                                    {s.name}
                                  </h4>
                                  <p className="text-[11px] text-[#7a7180] line-clamp-2 mt-0.5 leading-relaxed">
                                    {s.description || "Bespoke treatment executed with artisanal care."}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#e7dfd8]/60 text-xs">
                              <span className="text-[10px] font-semibold text-[#7a7180] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#7a7180]" />
                                <span>{s.duration_minutes} mins</span>
                              </span>
                              <span className="font-serif font-bold text-sm text-[#1b1520]">
                                {formatCurrency(s.price)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Date & Available Times */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e7dfd8] shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7dfd8]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#fbe9ef] text-[#a3214f] font-bold text-xs flex items-center justify-center">
                            2
                          </span>
                          <h2 className="text-xl font-serif font-bold text-[#1b1520]">
                            Select Date & Stylist
                          </h2>
                        </div>
                        <p className="text-xs text-[#7a7180] mt-1">Pick your preferred calendar date and artisan specialist</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <input
                          type="date"
                          value={selectedDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-3.5 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-bold text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 shadow-2xs"
                        />

                        <select
                          value={selectedStaff}
                          onChange={(e) => setSelectedStaff(e.target.value)}
                          className="px-3.5 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-xs font-bold text-[#1b1520] focus:outline-none cursor-pointer shadow-2xs"
                        >
                          <option value="">Any Available Stylist</option>
                          {staffMembers.map((st) => (
                            <option key={st.id} value={st.id}>{st.full_name} ({st.title || "Stylist"})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Slots Area */}
                    <div>
                      {loadingSlots && (
                        <div className="py-12 text-center text-xs text-[#a3214f] flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          <span className="font-semibold">Searching live salon schedule...</span>
                        </div>
                      )}

                      {!loadingSlots && slots.length === 0 && (
                        <div className="py-12 text-center text-xs text-[#7a7180] bg-[#faf7f4] rounded-2xl border border-dashed border-[#e7dfd8] p-6">
                          <Clock className="w-8 h-8 text-[#d6ccc3] mx-auto mb-2" />
                          <p className="font-bold text-[#1b1520]">
                            {selectedServices.length === 0
                              ? "Select at least one treatment above to inspect open time slots."
                              : "No open times on this date. Please pick another day or select 'Any Available Stylist'."}
                          </p>
                        </div>
                      )}

                      {!loadingSlots && slots.length > 0 && (
                        <div className="space-y-4">
                          {groupedSlots.morning.length > 0 && (
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7a7180] block mb-2">
                                Morning Hours
                              </span>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {groupedSlots.morning.map((slot, idx) => {
                                  const isSelected = selectedSlot?.datetime === slot.datetime && selectedSlot?.staff_id === slot.staff_id;
                                  return (
                                    <button
                                      key={`${slot.datetime}-${idx}`}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`py-2.5 px-2 rounded-xl text-center border transition ${
                                        isSelected
                                          ? "bg-[#a3214f] border-[#a3214f] text-white shadow-xs font-bold ring-2 ring-[#a3214f]/20"
                                          : "bg-[#faf7f4] border-[#e7dfd8] hover:border-[#a3214f]/40 hover:bg-white text-[#1b1520] font-semibold text-xs"
                                      }`}
                                    >
                                      <span className="block text-xs">{slot.time}</span>
                                      <span className={`block text-[10px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-[#7a7180]"}`}>
                                        {slot.staff_name.split(" ")[0]}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {groupedSlots.afternoon.length > 0 && (
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7a7180] block mb-2">
                                Afternoon Hours
                              </span>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {groupedSlots.afternoon.map((slot, idx) => {
                                  const isSelected = selectedSlot?.datetime === slot.datetime && selectedSlot?.staff_id === slot.staff_id;
                                  return (
                                    <button
                                      key={`${slot.datetime}-${idx}`}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`py-2.5 px-2 rounded-xl text-center border transition ${
                                        isSelected
                                          ? "bg-[#a3214f] border-[#a3214f] text-white shadow-xs font-bold ring-2 ring-[#a3214f]/20"
                                          : "bg-[#faf7f4] border-[#e7dfd8] hover:border-[#a3214f]/40 hover:bg-white text-[#1b1520] font-semibold text-xs"
                                      }`}
                                    >
                                      <span className="block text-xs">{slot.time}</span>
                                      <span className={`block text-[10px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-[#7a7180]"}`}>
                                        {slot.staff_name.split(" ")[0]}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {groupedSlots.evening.length > 0 && (
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7a7180] block mb-2">
                                Evening Hours
                              </span>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {groupedSlots.evening.map((slot, idx) => {
                                  const isSelected = selectedSlot?.datetime === slot.datetime && selectedSlot?.staff_id === slot.staff_id;
                                  return (
                                    <button
                                      key={`${slot.datetime}-${idx}`}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`py-2.5 px-2 rounded-xl text-center border transition ${
                                        isSelected
                                          ? "bg-[#a3214f] border-[#a3214f] text-white shadow-xs font-bold ring-2 ring-[#a3214f]/20"
                                          : "bg-[#faf7f4] border-[#e7dfd8] hover:border-[#a3214f]/40 hover:bg-white text-[#1b1520] font-semibold text-xs"
                                      }`}
                                    >
                                      <span className="block text-xs">{slot.time}</span>
                                      <span className={`block text-[10px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-[#7a7180]"}`}>
                                        {slot.staff_name.split(" ")[0]}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Contact & Notes */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e7dfd8] shadow-xs space-y-6">
                    <div className="pb-4 border-b border-[#e7dfd8]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#fbe9ef] text-[#a3214f] font-bold text-xs flex items-center justify-center">
                          3
                        </span>
                        <h2 className="text-xl font-serif font-bold text-[#1b1520]">
                          Guest Information & Contact
                        </h2>
                      </div>
                      <p className="text-xs text-[#7a7180] mt-1">
                        Where should we dispatch your appointment confirmation and schedule reminders?
                      </p>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#4a4250] mb-1">Your Full Name *</label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="e.g. Mahnoor Baloch"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4a4250] mb-1">Mobile Phone (for SMS / WhatsApp) *</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="+92 300 1234567"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#4a4250] mb-1">Email Address (Optional)</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="mahnoor@gmail.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4a4250] mb-1">Special Treatment Notes (Optional)</label>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Sensitive scalp, blonde toner preference"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 pt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whatsappOptIn}
                          onChange={(e) => setWhatsappOptIn(e.target.checked)}
                          className="rounded text-[#a3214f] focus:ring-[#a3214f]"
                        />
                        <span className="text-xs text-[#7a7180]">
                          Receive real-time WhatsApp booking updates and appointment reminders
                        </span>
                      </label>

                      {errorMsg && (
                        <div className="p-3.5 rounded-xl bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-[#e7dfd8] flex items-center justify-between">
                        <div className="text-xs text-[#7a7180]">
                          {selectedSlot ? (
                            <span>
                              Selected: <strong className="text-[#1b1520]">{selectedDate} at {selectedSlot.time}</strong> with {selectedSlot.staff_name}
                            </span>
                          ) : (
                            <span>Please choose your date & time slot above</span>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={submitting || !selectedSlot}
                          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#a3214f] to-[#88183f] hover:from-[#8b1b42] hover:to-[#6f1232] disabled:opacity-50 text-white font-bold text-xs shadow-md transition transform hover:-translate-y-0.5"
                        >
                          {submitting ? "Securing Your Reservation..." : "Confirm Reservation"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Sticky Luxury Order Summary Rail */}
                <div className="lg:col-span-1 sticky top-24 space-y-4">
                  <div className="bg-white border border-[#e7dfd8] rounded-3xl p-6 shadow-sm">
                    <div className="pb-3 border-b border-[#e7dfd8] flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#7a7180]">
                        Your Reservation
                      </span>
                      <Sparkles className="w-4 h-4 text-[#a3214f]" />
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                      {/* Location */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#7a7180] block">Location</span>
                        <div className="font-bold text-[#1b1520] mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#a3214f]" />
                          <span>{selectedBranch?.name || "Select Branch"}</span>
                        </div>
                        <span className="text-[11px] text-[#7a7180] block ml-5">{selectedBranch?.address}</span>
                      </div>

                      {/* Selected Services */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#7a7180] block">Selected Treatments</span>
                        {selectedServiceObjects.length === 0 ? (
                          <span className="text-[#7a7180] italic block mt-1">No treatments chosen yet</span>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {selectedServiceObjects.map((s) => (
                              <div key={s.id} className="flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-semibold text-[#1b1520] block">{s.name}</span>
                                  <span className="text-[10px] text-[#7a7180]">{s.duration_minutes}m</span>
                                </div>
                                <span className="font-bold text-[#1b1520]">{formatCurrency(s.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Schedule */}
                      {selectedSlot && (
                        <div className="pt-3 border-t border-[#e7dfd8]">
                          <span className="text-[10px] uppercase font-bold text-[#7a7180] block">Time & Stylist</span>
                          <div className="font-bold text-[#1b1520] mt-0.5">
                            {selectedDate} at {selectedSlot.time}
                          </div>
                          <span className="text-[11px] text-[#7a7180] block">
                            Stylist: <strong className="text-[#1b1520]">{selectedSlot.staff_name}</strong>
                          </span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="pt-4 border-t border-[#e7dfd8] flex justify-between items-baseline">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#7a7180] block">Estimated Total</span>
                          <span className="text-[11px] text-[#7a7180]">
                            {totalDuration > 0 ? `${totalDuration} mins duration` : "Taxes included"}
                          </span>
                        </div>
                        <span className="text-2xl font-serif font-bold text-[#a3214f]">
                          {formatCurrency(totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust guarantees */}
                  <div className="p-4 rounded-2xl bg-[#faf7f4] border border-[#e7dfd8] text-[11px] text-[#7a7180] space-y-2">
                    <div className="flex items-center gap-2 text-[#1b1520] font-semibold">
                      <ShieldCheck className="w-4 h-4 text-[#15803d]" />
                      <span>Complimentary Rescheduling</span>
                    </div>
                    <p className="leading-relaxed">
                      Cancel or adjust your booking up to 24 hours prior without cancellation fees.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
