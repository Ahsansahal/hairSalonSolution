"use client";

import React, { useState } from "react";
import {
  X, User, Phone, Calendar, Clock, Scissors, CreditCard,
  CheckCircle2, AlertTriangle, UserCheck, Play, Sparkles, MapPin
} from "lucide-react";
import { Badge } from "./ui/badge";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

interface BookingDialogProps {
  appointment: any | null;
  onClose: () => void;
  onStatusChanged: () => void;
}

export function BookingDialog({ appointment, onClose, onStatusChanged }: BookingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [payMethod, setPayMethod] = useState("CASH");
  const [payAmount, setPayAmount] = useState(appointment?.total_amount || "");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  if (!appointment) return null;

  const handleStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await apiFetch(`/appointments/${appointment.id}/status/`, {
        method: "POST",
        body: JSON.stringify({ status: newStatus, reason: `Updated to ${newStatus} from desk` }),
      });
      onStatusChanged();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Generate invoice if not already generated
      const inv = await apiFetch("/billing/invoices/from-appointment/", {
        method: "POST",
        body: JSON.stringify({ appointment_id: appointment.id }),
      });

      // 2. Record payment
      await apiFetch(`/billing/invoices/${inv.id}/payments/`, {
        method: "POST",
        body: JSON.stringify({
          method: payMethod,
          amount: payAmount || appointment.total_amount,
          reference_code: `POS-${Date.now().toString().slice(-4)}`,
        }),
      });

      // 3. Mark appointment completed
      await apiFetch(`/appointments/${appointment.id}/status/`, {
        method: "POST",
        body: JSON.stringify({ status: "COMPLETED", reason: "Checked out & paid" }),
      });

      onStatusChanged();
      onClose();
    } catch (err: any) {
      alert(err.message || "Payment checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const statusTone =
    appointment.status === "COMPLETED"
      ? "success"
      : appointment.status === "CONFIRMED"
      ? "info"
      : appointment.status === "CHECKED_IN"
      ? "purple"
      : appointment.status === "IN_PROGRESS"
      ? "warning"
      : "danger";

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up relative">
        {/* Decorative Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0A1931] via-amber-500 to-[#0A1931]" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              {appointment.booking_reference}
            </span>
            <Badge tone={statusTone as any} dot={appointment.status === "IN_PROGRESS" || appointment.status === "CHECKED_IN"}>
              {appointment.status === "CHECKED_IN"
                ? "Checked In"
                : appointment.status === "IN_PROGRESS"
                ? "In Chair"
                : appointment.status === "CONFIRMED"
                ? "Confirmed"
                : appointment.status === "COMPLETED"
                ? "Completed"
                : appointment.status}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Client Details */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0A1931] to-[#12285A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {(appointment.customer_name || "G").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B1B3D]">{appointment.customer_name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-amber-600" />
                  <span>{appointment.customer_phone}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-serif text-[#0B1B3D]">
                {formatCurrency(appointment.total_amount)}
              </span>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                {appointment.total_duration_minutes} Mins Duration
              </span>
            </div>
          </div>

          {/* Ticket Perforated Meta Box */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2.5 text-xs text-[#0B1B3D] relative">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Branch Sanctuary:</span>
              <span className="font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600" />
                {appointment.branch_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Artisan Stylist:</span>
              <span className="font-bold text-amber-700 flex items-center gap-1">
                <Scissors className="w-3 h-3" />
                {appointment.staff_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7a7180]">Scheduled Slot:</span>
              <span className="font-semibold">
                {new Date(appointment.start_time).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} at {new Date(appointment.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {appointment.source && (
              <div className="flex justify-between items-center pt-2 border-t border-[#e7dfd8]/70">
                <span className="text-[#7a7180]">Booking Source:</span>
                <span className="font-semibold uppercase tracking-wider text-[10px] text-[#4a4250]">
                  {appointment.source}
                </span>
              </div>
            )}

            {appointment.notes && (
              <div className="pt-2 border-t border-[#e7dfd8]/70">
                <span className="text-[#7a7180] block text-[10px] uppercase tracking-wider font-bold">Client Notes:</span>
                <p className="text-xs text-[#4a4250] mt-0.5 italic">"{appointment.notes}"</p>
              </div>
            )}
          </div>

          {/* Quick Checkout Form matching Zyniq Sync Checkout */}
          {showCheckout ? (
            <form onSubmit={handleCheckoutPayment} className="p-4 rounded-2xl bg-[#0A1931] border border-[#1E3A6E] text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#15284F]">
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">Checkout</h4>
                  <p className="text-[10px] text-slate-300">
                    {appointment.service_name || "Salon Treatment"} — {appointment.customer_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back
                </button>
              </div>

              {/* Discount Caps (up to 10%) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Discount (up to 10%)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "No discount", percent: 0 },
                    { label: "5% off", percent: 5 },
                    { label: "10% off", percent: 10 },
                  ].map((d) => (
                    <button
                      type="button"
                      key={d.percent}
                      onClick={() => {
                        setDiscountPercent(d.percent);
                        const discounted = Math.round((Number(appointment.total_amount) || 2000) * (1 - d.percent / 100));
                        setPayAmount(discounted);
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                        discountPercent === d.percent
                          ? "bg-amber-500 text-[#0A1931] shadow-md ring-2 ring-amber-400/40"
                          : "bg-[#0E2246] hover:bg-[#15284F] text-slate-300 border border-[#1E3A6E]"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount (RS) Input & Savings */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Amount (Rs)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#08152A] border border-[#1E3A6E] text-white text-base font-extrabold focus:outline-none focus:border-amber-400"
                />
                {discountPercent > 0 && (
                  <span className="text-[11px] font-bold text-emerald-400 block mt-1.5">
                    {discountPercent}% off Rs {Number(appointment.total_amount || 2000).toLocaleString()} — saving Rs {Math.round(((Number(appointment.total_amount) || 2000) * discountPercent) / 100).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "CASH", label: "Cash" },
                    { id: "CARD", label: "Card" },
                    { id: "BANK_TRANSFER", label: "Bank transfer" },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                        payMethod === m.id
                          ? "bg-emerald-500 text-white shadow-md ring-2 ring-emerald-400/30"
                          : "bg-[#0E2246] hover:bg-[#15284F] text-slate-300 border border-[#1E3A6E]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#1E3A6E] text-xs font-bold text-slate-300 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
                >
                  {loading ? "Recording..." : `Record payment (Rs ${Number(payAmount).toLocaleString()})`}
                </button>
              </div>
            </form>
          ) : (
            /* Action Buttons */
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {appointment.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleStatus("CHECKED_IN")}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center justify-center gap-1.5 transition shadow-2xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Check In Guest</span>
                  </button>
                )}

                {(appointment.status === "CONFIRMED" || appointment.status === "CHECKED_IN") && (
                  <button
                    onClick={() => handleStatus("IN_PROGRESS")}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-[#fdf0dc] hover:bg-[#fed7aa] text-[#b45309] font-bold text-xs border border-[#fed7aa] flex items-center justify-center gap-1.5 transition shadow-2xs"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Seat in Chair</span>
                  </button>
                )}

                {appointment.status !== "COMPLETED" && (
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#15803d] to-[#166534] hover:from-[#136e34] hover:to-[#115029] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition col-span-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Instant POS Checkout ({formatCurrency(appointment.total_amount)})</span>
                  </button>
                )}
              </div>

              {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                <button
                  onClick={() => handleStatus("CANCELLED")}
                  disabled={loading}
                  className="w-full py-2 text-xs font-semibold text-[#c0262d] hover:bg-[#fde7e7] rounded-xl transition"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          )}

          {/* Micro Barcode Aesthetic Accent */}
          <div className="pt-2 text-center text-[#d6ccc3] font-mono tracking-[0.3em] text-[10px] select-none">
            ||| | |||| | || | ||| |||| | |||
          </div>
        </div>
      </div>
    </div>
  );
}
