"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Lock, Mail, AlertCircle, ArrowRight, Shield,
  Calculator, UserCheck, ShieldAlert, CheckCircle2, Building,
  Clock, LogIn, KeyRound
} from "lucide-react";
import { apiFetch, setSession, clearSession } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const isExpired = searchParams.get("expired") === "1";

  const [email, setEmail] = useState("owner@shay.salon");
  const [password, setPassword] = useState("SalonPass123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const data = await apiFetch("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      // Save token, user details, and cookies for Next.js route protection
      setSession(data.access, data.refresh, data.user);
      setSuccessMsg(`Welcome, ${data.user.full_name || data.user.email}! Redirecting...`);

      // Immediate hard navigation ensures cookies and auth session are synchronously applied
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(
        err.message || "Authentication failed. Please verify your credentials or network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("SalonPass123!");
    setError("");
    setSuccessMsg("");
  };

  return (
    <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A1931] to-[#12285A] border border-slate-700 text-amber-400 flex items-center justify-center mx-auto mb-3.5 shadow-md">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0B1B3D] tracking-tight">
          SHAY
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-extrabold mt-1">
          Salon Management &amp; Terminal Portal · Karachi
        </p>
        <p className="text-xs text-slate-500 mt-1.5">
          Clifton Flagship (Block 4) &amp; DHA Bukhari Studio (Phase 6)
        </p>
      </div>

      {isExpired && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>Your session has expired. Please sign in to resume operations.</span>
        </div>
      )}

      {redirectUrl && redirectUrl !== "/dashboard" && !isExpired && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>Login required to access this salon management terminal.</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Staff / Manager Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. owner@shay.salon"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[#0B1B3D] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[#0B1B3D] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium transition"
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A1931] font-extrabold text-xs shadow-md transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.99] disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? "Authenticating & Verifying..." : "Sign In to Terminal"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {/* 1-Click Role Accounts Selector */}
      <div className="mt-7 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-bold">
            Select Role Demo Accounts
          </p>
          <Badge tone="brand" className="text-[9px]">Karachi Branch Isolated</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Business Owner */}
          <button
            type="button"
            onClick={() => setDemoRole("owner@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "owner@shay.salon"
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold"
                : "bg-[#F8FAFC] hover:bg-slate-100 border-slate-200 text-[#0B1B3D]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Business Owner</span>
              <Shield className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Shayan (Clifton + DHA)</span>
          </button>

          {/* Accountant */}
          <button
            type="button"
            onClick={() => setDemoRole("accountant@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "accountant@shay.salon"
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold"
                : "bg-[#F8FAFC] hover:bg-slate-100 border-slate-200 text-[#0B1B3D]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Accountant</span>
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Farhan (Pay &amp; Taxes)</span>
          </button>

          {/* Clifton Manager */}
          <button
            type="button"
            onClick={() => setDemoRole("manager.clifton@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "manager.clifton@shay.salon"
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold"
                : "bg-[#F8FAFC] hover:bg-slate-100 border-slate-200 text-[#0B1B3D]"
            }`}
          >
            <span className="font-bold block">Clifton Manager</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Zainab Tariq</span>
          </button>

          {/* DHA Manager */}
          <button
            type="button"
            onClick={() => setDemoRole("manager.dha@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "manager.dha@shay.salon"
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold"
                : "bg-[#F8FAFC] hover:bg-slate-100 border-slate-200 text-[#0B1B3D]"
            }`}
          >
            <span className="font-bold block">DHA Manager</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Hamza Abbasi</span>
          </button>

          {/* Clifton Reception */}
          <button
            type="button"
            onClick={() => setDemoRole("reception.clifton@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "reception.clifton@shay.salon"
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold"
                : "bg-[#F8FAFC] hover:bg-slate-100 border-slate-200 text-[#0B1B3D]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Clifton Reception</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Ayesha (Front Desk)</span>
          </button>

          {/* DHA Reception */}
          <button
            type="button"
            onClick={() => setDemoRole("reception.dha@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "reception.dha@shay.salon"
                ? "bg-amber-50 border-amber-500 text-[#0B1B3D] shadow-2xs font-bold ring-1 ring-amber-400"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">DHA Reception</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Hira (Front Desk)</span>
          </button>
        </div>

        {/* Staff Policy & Restriction Demo */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0B1B3D]">Stylist &amp; Staff Login Restriction:</span>
            <button
              type="button"
              onClick={() => setDemoRole("aliya.rizvi@shay.salon")}
              className="text-[10px] font-bold text-amber-700 hover:underline"
            >
              Test Blocked Stylist
            </button>
          </div>
          <p className="leading-relaxed">
            Floor staff &amp; stylists (e.g. Aliya Rizvi) cannot log in to the management dashboard. 
            They only punch attendance via biometric terminals.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-[#0B1B3D] transition font-medium"
        >
          &larr; Return to Shay Karachi Sanctuary
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1B3D] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-10 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading terminal...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
