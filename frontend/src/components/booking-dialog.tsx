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
    <div className="fixed inset-0 z-50 bg-[#1b1520]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#e7dfd8] max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up relative">
        {/* Decorative Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#a3214f] via-[#b38742] to-[#a3214f]" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e7dfd8] bg-[#faf7f4] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-[#a3214f] bg-[#fbe9ef] px-2.5 py-0.5 rounded-md border border-[#f3cad8]">
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
            className="p-1.5 rounded-full text-[#7a7180] hover:text-[#1b1520] hover:bg-[#e7dfd8]/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Client Details */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1b1520] to-[#3a3242] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {(appointment.customer_name || "G").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1b1520]">{appointment.customer_name}</h3>
                <p className="text-xs text-[#7a7180] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-[#a3214f]" />
                  <span>{appointment.customer_phone}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-serif text-[#a3214f]">
                {formatCurrency(appointment.total_amount)}
              </span>
              <span className="block text-[10px] uppercase font-bold text-[#7a7180] tracking-wider mt-0.5">
                {appointment.total_duration_minutes} Mins Duration
              </span>
            </div>
          </div>

          {/* Ticket Perforated Meta Box */}
          <div className="p-4 rounded-2xl bg-[#faf7f4] border border-[#e7dfd8] space-y-2.5 text-xs text-[#1b1520] relative">
            <div className="flex justify-between items-center">
              <span className="text-[#7a7180]">Branch Sanctuary:</span>
              <span className="font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#a3214f]" />
                {appointment.branch_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7a7180]">Artisan Stylist:</span>
              <span className="font-bold text-[#a3214f] flex items-center gap-1">
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

          {/* Quick Checkout Form (when user clicks Checkout & Pay) */}
          {showCheckout ? (
            <form onSubmit={handleCheckoutPayment} className="p-4 rounded-2xl bg-[#e3f5e8]/50 border border-[#bbf0cb] space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#bbf0cb]">
                <span className="text-xs font-bold text-[#15803d] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Instant POS Checkout</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-xs font-semibold text-[#7a7180] hover:text-[#1b1520]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4a4250] mb-1">Tender Type</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#e7dfd8] text-xs font-bold focus:outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER">Bank Wire</option>
                    <option value="WALLET">Apple / Google Pay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4a4250] mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#e7dfd8] text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#15803d] to-[#166534] hover:from-[#136e34] hover:to-[#115029] text-white font-bold text-xs shadow-sm transition"
              >
                {loading ? "Processing..." : `Complete & Disburse (${formatCurrency(payAmount || appointment.total_amount)})`}
              </button>
            </form>
          ) : (
            /* Action Buttons */
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {appointment.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleStatus("CHECKED_IN")}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-[#fbe9ef] hover:bg-[#f4c2d3] text-[#a3214f] font-bold text-xs border border-[#f4c2d3] flex items-center justify-center gap-1.5 transition shadow-2xs"
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
