"use client";

import React, { useState } from "react";
import {
  Sparkles, Clock, User, Scissors, CheckCircle2,
  AlertCircle, Lock, Play, Plus, RefreshCw, UserCheck
} from "lucide-react";
import { Badge } from "./ui/badge";
import { formatCurrency } from "@/lib/format";

interface FloorBoardProps {
  appointments: any[];
  staffList: any[];
  onSelectAppointment: (appointment: any) => void;
  onAddWalkIn: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function FloorBoard({
  appointments,
  staffList,
  onSelectAppointment,
  onAddWalkIn,
  onRefresh,
  loading = false,
}: FloorBoardProps) {
  // Mock / Virtual Station definitions (can map to branches)
  const defaultStations = [
    { id: "st-1", name: "Styling Station 01", type: "Cutting & Styling Chair", area: "Main Atelier" },
    { id: "st-2", name: "Styling Station 02", type: "Cutting & Styling Chair", area: "Main Atelier" },
    { id: "st-3", name: "Balayage & Color Bay", type: "Technical Color Station", area: "Color Laboratory" },
    { id: "st-4", name: "Restorative Wash Lounge", type: "Shampoo & Head Spa Basin", area: "Sanctuary Spa" },
    { id: "st-5", name: "VIP Private Suite", type: "Private Master Suite", area: "Penthouse Wing" },
    { id: "st-6", name: "Express Blowout Bar", type: "Fast Finish Station", area: "Front Atelier" },
  ];

  // Match active appointments to stations
  const activeAppts = appointments.filter(
    (a) => a.status === "IN_PROGRESS" || a.status === "CHECKED_IN"
  );
  const upcomingAppts = appointments.filter((a) => a.status === "CONFIRMED");

  // Assign appointments to stations dynamically
  const stationStatuses = defaultStations.map((station, idx) => {
    const activeBooking = activeAppts[idx] || null;
    const upcomingBooking = !activeBooking ? upcomingAppts[idx] || null : null;

    let state: "IN_SERVICE" | "CHECKED_IN" | "BOOKED" | "AVAILABLE" = "AVAILABLE";
    if (activeBooking) {
      state = activeBooking.status === "IN_PROGRESS" ? "IN_SERVICE" : "CHECKED_IN";
    } else if (upcomingBooking) {
      state = "BOOKED";
    }

    // Calculate elapsed & remaining progress
    let progress = 0;
    let elapsedText = "";
    if (activeBooking) {
      const startMs = new Date(activeBooking.start_time).getTime();
      const durMinutes = activeBooking.total_duration_minutes || 60;
      const endMs = startMs + durMinutes * 60 * 1000;
      const nowMs = Date.now();

      if (nowMs >= startMs && nowMs <= endMs) {
        progress = Math.min(100, Math.max(10, ((nowMs - startMs) / (endMs - startMs)) * 100));
        const remMins = Math.max(1, Math.round((endMs - nowMs) / 60000));
        elapsedText = `${remMins}m remaining`;
      } else if (nowMs > endMs) {
        progress = 100;
        elapsedText = "Wrap up / Ready for Checkout";
      } else {
        progress = 15;
        elapsedText = "Starting shortly";
      }
    }

    return {
      ...station,
      state,
      activeBooking,
      upcomingBooking,
      progress,
      elapsedText,
    };
  });

  const availableCount = stationStatuses.filter((s) => s.state === "AVAILABLE").length;
  const inServiceCount = stationStatuses.filter((s) => s.state === "IN_SERVICE" || s.state === "CHECKED_IN").length;
  const reservedCount = stationStatuses.filter((s) => s.state === "BOOKED").length;

  return (
    <div className="space-y-4">
      {/* Board Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#e7dfd8] shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="success" dot className="font-semibold text-xs py-1 px-3">
            {availableCount} Available Chairs
          </Badge>
          <Badge tone="brand" dot className="font-semibold text-xs py-1 px-3">
            {inServiceCount} In Service
          </Badge>
          <Badge tone="info" dot className="font-semibold text-xs py-1 px-3">
            {reservedCount} Reserved Ahead
          </Badge>
          <span className="text-[11px] text-[#7a7180] hidden sm:inline-block">
            · Real-time Floor Map & Chair Occupancy
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            title="Refresh floor status"
            className="p-2 rounded-xl border border-[#e7dfd8] bg-[#faf7f4] hover:bg-[#f2ece6] text-[#4a4250] transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#a3214f]" : ""}`} />
          </button>
          <button
            onClick={onAddWalkIn}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#a3214f] to-[#88183f] text-white font-bold text-xs shadow-xs hover:from-[#8b1b42] hover:to-[#6f1232] transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Seat Walk-In</span>
          </button>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stationStatuses.map((st) => {
          const isBusy = st.state === "IN_SERVICE" || st.state === "CHECKED_IN";
          const booking = st.activeBooking || st.upcomingBooking;

          return (
            <div
              key={st.id}
              className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                st.state === "IN_SERVICE"
                  ? "bg-gradient-to-br from-[#fff1f5] via-white to-[#ffe4e9] border-[#fbcfe8] hover:border-[#f472b6] shadow-sm hover:shadow-glow-brand/20"
                  : st.state === "CHECKED_IN"
                  ? "bg-gradient-to-br from-[#faf5ff] via-white to-[#f3e8ff] border-[#e9d5ff] hover:border-[#c084fc] shadow-sm hover:shadow-glow-purple/20"
                  : st.state === "BOOKED"
                  ? "bg-gradient-to-br from-[#f0f9ff] via-white to-[#e0f2fe] border-[#bae6fd] hover:border-[#60a5fa] shadow-sm hover:shadow-glow-sapphire/20"
                  : "bg-gradient-to-br from-[#f0fdf4] via-white to-[#dcfce7] border-[#bbf7d0] hover:border-[#4ade80] shadow-2xs hover:shadow-glow-emerald/20"
              }`}
            >
              {/* Station Header */}
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#e7dfd8]/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7a7180] block">
                      {st.area}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#1b1520]">{st.name}</h3>
                    <span className="text-[11px] text-[#7a7180]">{st.type}</span>
                  </div>

                  <Badge
                    dot
                    tone={
                      st.state === "IN_SERVICE"
                        ? "brand"
                        : st.state === "CHECKED_IN"
                        ? "purple"
                        : st.state === "BOOKED"
                        ? "info"
                        : "success"
                    }
                  >
                    {st.state === "IN_SERVICE"
                      ? "In Service"
                      : st.state === "CHECKED_IN"
                      ? "Seated / Ready"
                      : st.state === "BOOKED"
                      ? "Booked"
                      : "Ready"}
                  </Badge>
                </div>

                {/* Booking Content */}
                {booking ? (
                  <div className="mt-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1b1520] text-white flex items-center justify-center text-[10px] font-bold">
                          {(booking.customer_name || "G").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-[#1b1520] block">
                            {booking.customer_name}
                          </span>
                          <span className="text-[11px] text-[#7a7180]">
                            Artisan: <strong className="text-[#1b1520]">{booking.staff_name}</strong>
                          </span>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-xs text-[#a3214f]">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>

                    {/* Progress Bar for Active Service */}
                    {isBusy && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] font-semibold text-[#7a7180]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#a3214f]" />
                            <span>{st.elapsedText}</span>
                          </span>
                          <span>{Math.round(st.progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-rose-100/70 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#f59e0b] rounded-full transition-all duration-500 shadow-xs"
                            style={{ width: `${st.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 py-4 text-center">
                    <span className="text-xs text-[#7a7180] block font-medium">Station is currently open</span>
                    <span className="text-[10px] text-[#15803d] font-bold uppercase tracking-wider block mt-0.5">
                      Ready for immediate styling
                    </span>
                  </div>
                )}
              </div>

              {/* Station Actions Footer */}
              <div className="mt-4 pt-3 border-t border-[#e7dfd8]/60 flex items-center justify-between">
                {booking ? (
                  <button
                    onClick={() => onSelectAppointment(booking)}
                    className="w-full py-2 rounded-xl bg-white border border-[#e7dfd8] hover:border-[#a3214f]/40 hover:bg-[#faf7f4] text-[#1b1520] font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#a3214f]" />
                    <span>View Guest Ticket</span>
                  </button>
                ) : (
                  <button
                    onClick={onAddWalkIn}
                    className="w-full py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] hover:bg-[#a3214f] hover:text-white hover:border-[#a3214f] text-[#1b1520] font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Seat Client Here</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
