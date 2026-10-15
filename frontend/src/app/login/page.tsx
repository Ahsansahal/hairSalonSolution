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
      setSuccessMsg(`Welcome, ${data.user.full_name || data.user.email}! Redirecting to dashboard...`);

      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
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
    <div className="w-full max-w-lg bg-white border border-[#e7dfd8] rounded-3xl p-8 sm:p-10 shadow-[0_4px_24px_-4px_rgba(27,21,32,0.06),0_1px_2px_rgba(27,21,32,0.04)] relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fbe9ef] via-[#f8d7e3] to-[#f4c2d3] border border-[#f4c2d3] text-[#a3214f] flex items-center justify-center mx-auto mb-3.5 shadow-sm">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b1520] tracking-tight">
          SHAY
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#a3214f] font-bold mt-1">
          Salon Management &amp; Terminal Portal · Karachi
        </p>
        <p className="text-xs text-[#7a7180] mt-1.5">
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
          <Lock className="w-4 h-4 flex-shrink-0 text-[#a3214f]" />
          <span>Login required to access this salon management terminal.</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#1b1520] mb-1.5">
            Staff / Manager Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#7a7180] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. owner@shay.salon"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-medium transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1b1520] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#7a7180] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-medium transition"
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-[#fde7e7] border border-[#fecaca] text-[#c0262d] text-xs flex items-start gap-2.5">
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
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a3214f] to-[#88183f] hover:from-[#88183f] hover:to-[#6d1332] text-white font-bold text-xs shadow-md shadow-[#a3214f]/15 transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.99] disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? "Authenticating & Verifying..." : "Sign In to Terminal"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {/* 1-Click Role Accounts Selector */}
      <div className="mt-7 pt-5 border-t border-[#e7dfd8]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7a7180] font-bold">
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
                ? "bg-[#fbe9ef] border-[#a3214f] text-[#a3214f] shadow-2xs font-bold"
                : "bg-[#faf7f4] hover:bg-[#f2ece6] border-[#e7dfd8] text-[#1b1520]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Business Owner</span>
              <Shield className="w-3.5 h-3.5 text-[#a3214f]" />
            </div>
            <span className="text-[10px] text-[#7a7180] block mt-0.5">Shayan (Clifton + DHA)</span>
          </button>

          {/* Accountant */}
          <button
            type="button"
            onClick={() => setDemoRole("accountant@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "accountant@shay.salon"
                ? "bg-[#fbe9ef] border-[#a3214f] text-[#a3214f] shadow-2xs font-bold"
                : "bg-[#faf7f4] hover:bg-[#f2ece6] border-[#e7dfd8] text-[#1b1520]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Accountant</span>
              <Calculator className="w-3.5 h-3.5 text-[#15803d]" />
            </div>
            <span className="text-[10px] text-[#7a7180] block mt-0.5">Farhan (Pay &amp; Taxes)</span>
          </button>

          {/* Clifton Manager */}
          <button
            type="button"
            onClick={() => setDemoRole("manager.clifton@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "manager.clifton@shay.salon"
                ? "bg-[#fbe9ef] border-[#a3214f] text-[#a3214f] shadow-2xs font-bold"
                : "bg-[#faf7f4] hover:bg-[#f2ece6] border-[#e7dfd8] text-[#1b1520]"
            }`}
          >
            <span className="font-bold block">Clifton Manager</span>
            <span className="text-[10px] text-[#7a7180] block mt-0.5">Zainab Tariq</span>
          </button>

          {/* DHA Manager */}
          <button
            type="button"
            onClick={() => setDemoRole("manager.dha@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "manager.dha@shay.salon"
                ? "bg-[#fbe9ef] border-[#a3214f] text-[#a3214f] shadow-2xs font-bold"
                : "bg-[#faf7f4] hover:bg-[#f2ece6] border-[#e7dfd8] text-[#1b1520]"
            }`}
          >
            <span className="font-bold block">DHA Manager</span>
            <span className="text-[10px] text-[#7a7180] block mt-0.5">Hamza Abbasi</span>
          </button>

          {/* Clifton Reception */}
          <button
            type="button"
            onClick={() => setDemoRole("reception.clifton@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "reception.clifton@shay.salon"
                ? "bg-[#fbe9ef] border-[#a3214f] text-[#a3214f] shadow-2xs font-bold"
                : "bg-[#faf7f4] hover:bg-[#f2ece6] border-[#e7dfd8] text-[#1b1520]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Clifton Reception</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <span className="text-[10px] text-[#7a7180] block mt-0.5">Ayesha (Front Desk)</span>
          </button>

          {/* DHA Reception */}
          <button
            type="button"
            onClick={() => setDemoRole("reception.dha@shay.salon")}
            className={`p-2.5 rounded-xl border text-left transition ${
              email === "reception.dha@shay.salon"
                ? "bg-[#fbe9ef] border-[#a3214f] text-[#a3214f] shadow-2xs font-bold"
                : "bg-[#faf7f4] hover:bg-[#f2ece6] border-[#e7dfd8] text-[#1b1520]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">DHA Reception</span>
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            </div>
            <span className="text-[10px] text-[#7a7180] block mt-0.5">Hira (Front Desk)</span>
          </button>
        </div>

        {/* Staff Policy & Restriction Demo */}
        <div className="mt-4 p-3 rounded-2xl bg-[#faf7f4] border border-[#e7dfd8] text-[11px] text-[#7a7180] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1b1520]">Stylist &amp; Staff Login Restriction:</span>
            <button
              type="button"
              onClick={() => setDemoRole("aliya.rizvi@shay.salon")}
              className="text-[10px] font-bold text-rose-700 hover:underline"
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
          className="text-xs text-[#7a7180] hover:text-[#1b1520] transition font-medium"
        >
          &larr; Return to Shay Karachi Sanctuary
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#faf7f4] text-[#1b1520] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-[#fbe9ef]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#fbf5eb]/70 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-lg bg-white border border-[#e7dfd8] rounded-3xl p-10 text-center">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Loading terminal...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
