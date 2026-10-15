"use client";

import { useState, useEffect } from "react";
import {
  Clock, ShieldCheck, Play, CheckCircle2, AlertCircle, DollarSign,
  Calendar, Cpu, UserCheck, Lock, Eye, AlertTriangle, Check, ArrowRight
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card, PageHeader, Stat } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatMoney } from "@/lib/format";

export default function AttendancePage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Punch simulator state
  const [selectedStaffBioId, setSelectedStaffBioId] = useState("BIO-001");
  const [punchType, setPunchType] = useState("CHECK_IN");
  const [punchFeedback, setPunchFeedback] = useState<any | null>(null);
  const [punchLoading, setPunchLoading] = useState(false);

  // Draft payroll & disbursement state
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [payrollFeedback, setPayrollFeedback] = useState<any | null>(null);
  const [disbursingId, setDisbursingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    const activeBranch = localStorage.getItem("salon_active_branch") || "all";
    const branchParam = activeBranch !== "all" ? `?branch_id=${activeBranch}` : "";

    // Read stored user
    try {
      const stored = localStorage.getItem("salon_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    }

    Promise.all([
      apiFetch(`/attendance/devices/${branchParam}`),
      apiFetch(`/attendance/summaries/${branchParam}`),
      apiFetch(`/payroll/runs/${branchParam}`),
      apiFetch(`/staff/${branchParam}`),
    ])
      .then(([dData, sData, pData, stData]) => {
        setDevices(Array.isArray(dData) ? dData : dData.results || []);
        setSummaries(Array.isArray(sData) ? sData : sData.results || []);
        setPayrollRuns(Array.isArray(pData) ? pData : pData.results || []);

        const staffArr = Array.isArray(stData) ? stData : stData.results || [];
        setStaffList(staffArr);
        if (staffArr.length > 0 && !selectedStaffBioId) {
          setSelectedStaffBioId(staffArr[0].biometric_user_id || "BIO-001");
        }
      })
      .catch((err) => console.error("Failed to load attendance", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const handleBranchChange = () => loadData();
    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, []);

  const isOwner = currentUser?.system_role === "BUSINESS_OWNER" || currentUser?.system_role === "PLATFORM_ADMIN";
  const userRole = currentUser?.branch_roles?.[0]?.role || currentUser?.system_role || "STAFF";
  const isManager = userRole === "BRANCH_MANAGER" || currentUser?.email?.includes("manager");
  const isAccountant = userRole === "ACCOUNTANT" || currentUser?.system_role === "ACCOUNTANT";
  const canManagePayroll = isOwner || isAccountant;

  const handleSimulatePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPunchFeedback(null);
    setPunchLoading(true);

    const activeBranch = localStorage.getItem("salon_active_branch");
    let targetBranchId = activeBranch;
    if (!targetBranchId || targetBranchId === "all") {
      const bRes = await apiFetch("/branches/");
      const bList = Array.isArray(bRes) ? bRes : bRes.results || [];
      if (bList.length > 0) targetBranchId = bList[0].id;
    }

    try {
      const res = await apiFetch("/attendance/events/ingest/", {
        method: "POST",
        body: JSON.stringify({
          branch_id: targetBranchId,
          device_serial: devices.length > 0 ? devices[0].serial_number : "ZK-BIO-CLIF01",
          punches: [
            {
              biometric_user_id: selectedStaffBioId,
              timestamp: new Date().toISOString(),
              event_type: punchType,
            },
          ],
        }),
      });
      setPunchFeedback(res);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to simulate punch");
    } finally {
      setPunchLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    if (!canManagePayroll) {
      alert("Manager Read-Only: Only the Business Owner or Accountant can generate payroll cycles.");
      return;
    }

    setGeneratingPayroll(true);
    setPayrollFeedback(null);

    try {
      const activeBranch = localStorage.getItem("salon_active_branch");
      let targetBranchId = activeBranch;
      if (!targetBranchId || targetBranchId === "all") {
        const bRes = await apiFetch("/branches/");
        const bList = Array.isArray(bRes) ? bRes : bRes.results || [];
        targetBranchId = bList[0]?.id;
      }

      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];

      const res = await apiFetch("/payroll/runs/", {
        method: "POST",
        body: JSON.stringify({
          branch_id: targetBranchId,
          period_start: firstDay,
          period_end: lastDay,
        }),
      });
      setPayrollFeedback(res);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to generate draft payroll");
    } finally {
      setGeneratingPayroll(false);
    }
  };

  const handleDisburseItem = async (runId: string, itemId: string) => {
    if (!canManagePayroll) {
      alert("Manager Read-Only: Only the Business Owner or Accountant can disburse funds.");
      return;
    }

    setDisbursingId(itemId);
    try {
      await apiFetch(`/payroll/runs/${runId}/record-disbursement/`, {
        method: "POST",
        body: JSON.stringify({
          item_id: itemId,
        }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to disburse payment");
    } finally {
      setDisbursingId(null);
    }
  };

  const handleFinalizeRun = async (runId: string) => {
    if (!canManagePayroll) {
      alert("Manager Read-Only: Only the Business Owner or Accountant can finalize payroll runs.");
      return;
    }

    if (!confirm("Finalize this payroll cycle? All pending balances will be verified and locked.")) {
      return;
    }

    try {
      await apiFetch(`/payroll/runs/${runId}/finalize/`, {
        method: "POST",
      });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to finalize payroll cycle");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <PageHeader
        eyebrow="Workforce & Financial Audit"
        title="Staff Attendance, Salaries & Overtime"
        description="Biometric time-clock sync, shift attendance tracking, overtime allowances, deductions, and payment status audit"
        actions={
          canManagePayroll ? (
            <button
              onClick={handleGeneratePayroll}
              disabled={generatingPayroll}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0B1B3D] to-[#12285A] hover:bg-[#0A1931] px-4 py-2.5 text-xs font-bold text-amber-300 shadow-sm border border-[#0B1B3D] transition disabled:opacity-50"
            >
              <DollarSign className="h-4 w-4 text-amber-400" />
              <span>{generatingPayroll ? "Calculating..." : "Run Month-End Payroll"}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-500 shadow-2xs">
              <Eye className="h-4 w-4 text-amber-600" />
              <span>Manager Audit Mode (Read-Only)</span>
            </div>
          )
        }
      />

      {/* Role Notice Banner for Branch Managers */}
      {isManager && !isOwner && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-950 text-sm">Branch Manager Salary & Overtime Audit Access</span>
              <Badge tone="warning" className="text-[10px]">Read-Only Permissions</Badge>
            </div>
            <p className="text-amber-800 leading-relaxed">
              As Branch Manager, you have authorized visibility to look after your team&apos;s base salaries, logged attendance, overtime allowances, absence deductions, and payout status (who has been paid vs remaining unpaid balances).
              You do not have permission to alter, create, or finalize payroll runs—all disbursements and financial adjustments are strictly handled by the Business Owner and Accountant.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Biometric Stations"
          value={devices.length}
          tone="brand"
          icon={<Cpu className="h-4 w-4 text-amber-600" />}
        />
        <Stat
          label="Shift Summaries Logged"
          value={summaries.length}
          tone="default"
          icon={<UserCheck className="h-4 w-4 text-[#4a4250]" />}
        />
        <Stat
          label="Payroll Cycles"
          value={payrollRuns.length}
          tone="success"
          icon={<Calendar className="h-4 w-4 text-[#15803d]" />}
        />
        <Stat
          label="Latest Cycle Net"
          value={payrollRuns.length > 0 ? formatCurrency(payrollRuns[0].total_net) : "Rs. 0"}
          tone="info"
          icon={<DollarSign className="h-4 w-4 text-[#1d5fbf]" />}
        />
      </div>

      {/* Hardware Stations & Simulator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Stations */}
        <Card className="p-5 space-y-4 border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-[15px] font-bold text-[#0B1B3D]">Registered Biometric Terminals</h2>
              <p className="text-xs text-slate-500">Physical time-clocks connected via cloud bridge</p>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online</span>
            </span>
          </div>

          <div className="space-y-3">
            {devices.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No biometric stations registered yet.</p>
            ) : (
              devices.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#0B1B3D]">{d.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {d.device_model} • <span className="text-amber-700 font-medium">{d.branch_name}</span>
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                      S/N: {d.serial_number}
                    </span>
                  </div>
                  <Badge tone="success" className="text-[9px]">
                    {d.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Punch Ingestion Simulator */}
        <Card className="p-5 space-y-4">
          <div className="pb-3 border-b border-[#e7dfd8]">
            <h2 className="text-[15px] font-bold text-[#1b1520]">Staff Time-Clock Station (Check-In / Out)</h2>
            <p className="text-xs text-[#7a7180]">
              Staff do not log in to dashboard; they clock in/out here to determine payoff &amp; deductions.
            </p>
          </div>

          <form onSubmit={handleSimulatePunch} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0B1B3D] mb-1">
                  Artisan / Stylist
                </label>
                <select
                  value={selectedStaffBioId}
                  onChange={(e) => setSelectedStaffBioId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                >
                  {staffList.length > 0 ? (
                    staffList.map((st) => (
                      <option key={st.id} value={st.biometric_user_id || st.employee_code}>
                        {st.full_name} ({st.biometric_user_id || st.employee_code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="BIO-001">Aliya Rizvi (BIO-001)</option>
                      <option value="BIO-002">Tariq Mehmood (BIO-002)</option>
                      <option value="BIO-003">Dr. Sana Hashmi (BIO-003)</option>
                      <option value="BIO-004">Bilal Qureshi (BIO-004)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1B3D] mb-1">
                  Scan Action
                </label>
                <select
                  value={punchType}
                  onChange={(e) => setPunchType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0B1B3D] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                >
                  <option value="CHECK_IN">Check In (Shift Start)</option>
                  <option value="CHECK_OUT">Check Out (Shift End)</option>
                  <option value="BREAK_OUT">Break Out</option>
                  <option value="BREAK_IN">Break In</option>
                </select>
              </div>
            </div>

            {punchFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>
                  Scan logged: {punchFeedback.imported} imported, {punchFeedback.duplicated} duplicates ignored. Shift hours updated!
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={punchLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0B1B3D] to-[#12285A] hover:bg-[#0A1931] text-amber-300 text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span>{punchLoading ? "Recording Scan..." : "Punch Time Clock"}</span>
            </button>

            <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-2.5 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-[#0B1B3D]">Attendance-Driven Compensation Rules:</p>
              <p>• Standard month = 20 work days (160 hours).</p>
              <p>• Overtime: Hours &gt; 160h are compensated at <strong>1.5x</strong> base hourly wage.</p>
              <p>• Deductions: Missed shifts/days incur proportionate hourly deductions.</p>
            </div>
          </form>
        </Card>
      </div>

      {/* Salaries, Overtime & Payment Audit Section (The Core Requirement) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#1b1520]">Staff Salaries, Overtime &amp; Payment Audit</h2>
            <p className="text-xs text-[#7a7180]">
              Inspect salaries, overtime allowances, deductions, amount paid, and remaining unpaid balance per employee
            </p>
          </div>
          {isManager && !isOwner && (
            <Badge tone="brand" className="text-xs px-3 py-1">
              Branch Manager Inspection
            </Badge>
          )}
        </div>

        {payrollFeedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            Draft Payroll generated for <strong>{payrollFeedback.period_start}</strong> to <strong>{payrollFeedback.period_end}</strong>! Gross: {formatCurrency(payrollFeedback.total_gross)}, Net: {formatCurrency(payrollFeedback.total_net)}.
          </div>
        )}

        {payrollRuns.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#7a7180]">
            No payroll cycles run yet.
            {canManagePayroll && " Click 'Run Month-End Payroll' to calculate wages from staff attendance."}
          </Card>
        ) : (
          payrollRuns.map((pr) => (
            <Card key={pr.id} className="p-5 space-y-4">
              {/* Cycle Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#e7dfd8] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1b1520]">
                      Cycle: {pr.period_start} to {pr.period_end}
                    </span>
                    <Badge tone={pr.status === "FINALIZED" ? "success" : "brand"} className="text-[10px]">
                      {pr.status}
                    </Badge>
                    <span className="text-xs text-amber-800 font-semibold">
                      ({pr.branch_name || "All Branches"})
                    </span>
                  </div>
                  <p className="text-xs text-[#7a7180] mt-0.5">
                    Calculated from physical biometric check-in &amp; check-out events + 10% completed service commissions
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {canManagePayroll && pr.status !== "FINALIZED" && (
                    <button
                      onClick={() => handleFinalizeRun(pr.id)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition"
                    >
                      Finalize Cycle
                    </button>
                  )}
                  {isManager && !isOwner && (
                    <span className="text-[11px] text-[#7a7180] flex items-center gap-1 bg-[#faf7f4] px-2.5 py-1 rounded-lg border border-[#e7dfd8]">
                      <Lock className="w-3 h-3 text-[#7a7180]" />
                      <span>Audit Only</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Cycle Financial Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf7f4] p-3 rounded-xl border border-[#e7dfd8]/60 text-xs">
                <div>
                  <span className="text-[10px] text-[#7a7180] uppercase tracking-wider font-semibold block">Total Gross Wages</span>
                  <span className="font-bold text-[#1b1520] text-sm">{formatCurrency(pr.total_gross)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7a7180] uppercase tracking-wider font-semibold block">Service Commissions</span>
                  <span className="font-bold text-amber-700 text-sm">+{formatCurrency(pr.total_commissions)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7a7180] uppercase tracking-wider font-semibold block">Attendance Deductions</span>
                  <span className="font-bold text-rose-700 text-sm">-{formatCurrency(pr.total_deductions)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7a7180] uppercase tracking-wider font-semibold block">Total Net Payoff</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatCurrency(pr.total_net)}</span>
                </div>
              </div>

              {/* Individual Staff Compensation Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#e7dfd8] bg-[#faf7f4] text-[#7a7180] font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-3">Stylist / Artisan</th>
                      <th className="py-3 px-3">Base Salary</th>
                      <th className="py-3 px-3">Attendance</th>
                      <th className="py-3 px-3">Overtime Allowance</th>
                      <th className="py-3 px-3">Deductions</th>
                      <th className="py-3 px-3">Commissions</th>
                      <th className="py-3 px-3">Net Payoff</th>
                      <th className="py-3 px-3">Amount Paid</th>
                      <th className="py-3 px-3">Remaining Payment</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">
                        {canManagePayroll ? "Disbursement" : "Audit"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7dfd8]/60 text-[#1b1520]">
                    {pr.items && pr.items.length > 0 ? (
                      pr.items.map((item: any) => {
                        const remaining = parseFloat(item.remaining_balance || "0");
                        const isFullyPaid = item.payment_status === "PAID";
                        const isPartial = item.payment_status === "PARTIAL";

                        return (
                          <tr key={item.id} className="hover:bg-[#faf7f4]/60 transition">
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#1b1520] block">{item.staff_name}</span>
                              <span className="text-[10px] text-[#7a7180] block">
                                {item.staff_title || item.employee_code}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-medium">
                              {formatCurrency(item.base_pay)}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-[#1b1520]">{item.days_worked} days</span>
                              <span className="text-[10px] text-[#7a7180] block">logged scans</span>
                            </td>
                            <td className="py-3 px-3">
                              {parseFloat(item.overtime_pay) > 0 ? (
                                <div>
                                  <span className="font-bold text-emerald-700">
                                    +{formatCurrency(item.overtime_pay)}
                                  </span>
                                  <span className="text-[10px] text-[#7a7180] block">
                                    {item.overtime_hours} hrs @ 1.5x
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#7a7180]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {parseFloat(item.deductions) > 0 ? (
                                <div>
                                  <span className="font-bold text-rose-700">
                                    -{formatCurrency(item.deductions)}
                                  </span>
                                  <span className="text-[10px] text-[#7a7180] block">
                                    {item.late_deduction_hours} missed hrs
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#7a7180]">Rs. 0</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-semibold text-amber-700">
                              +{formatCurrency(item.commission_pay)}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#1b1520] tabular-nums">
                              {formatCurrency(item.net_pay)}
                            </td>
                            <td className="py-3 px-3 font-medium text-emerald-700 tabular-nums">
                              {formatCurrency(item.amount_paid)}
                            </td>
                            <td className="py-3 px-3 tabular-nums">
                              {remaining > 0 ? (
                                <span className="font-bold text-amber-700">
                                  {formatCurrency(item.remaining_balance)}
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-semibold">Rs. 0</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {isFullyPaid ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 inline-flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>PAID</span>
                                </span>
                              ) : isPartial ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 inline-flex items-center gap-1">
                                  <span>PARTIAL</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 inline-flex items-center gap-1">
                                  <span>PENDING</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {canManagePayroll ? (
                                !isFullyPaid ? (
                                  <button
                                    onClick={() => handleDisburseItem(pr.id, item.id)}
                                    disabled={disbursingId === item.id}
                                    className="px-2.5 py-1 rounded-lg bg-[#0B1B3D] hover:bg-[#071120] text-amber-300 text-[11px] font-semibold transition disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
                                  >
                                    <span>{disbursingId === item.id ? "Paying..." : "Pay Remaining"}</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-emerald-700 font-medium">Cleared</span>
                                )
                              ) : (
                                <span className="text-[11px] text-[#7a7180] inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={11} className="py-4 text-center text-[#7a7180]">
                          No staff compensation records in this cycle.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Daily Attendance Summaries Table */}
      <Card className="p-5">
        <div className="pb-3 border-b border-[#e7dfd8] mb-4">
          <h2 className="text-[15px] font-bold text-[#1b1520]">Daily Attendance Summaries</h2>
          <p className="text-xs text-[#7a7180]">Aggregated shift hours and worked minutes per stylist</p>
        </div>

        {summaries.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7a7180]">
            No attendance scans recorded yet. Use the simulator above to log an employee punch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e7dfd8] bg-[#faf7f4] text-[#7a7180] font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Stylist</th>
                  <th className="py-3 px-3.5">First Check-In</th>
                  <th className="py-3 px-3.5">Last Check-Out</th>
                  <th className="py-3 px-3.5">Time Logged</th>
                  <th className="py-3 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7dfd8]/60 text-[#1b1520]">
                {summaries.map((s) => (
                  <tr key={s.id} className="hover:bg-[#faf7f4]/60 transition">
                    <td className="py-3 px-3.5 font-medium">{s.work_date}</td>
                    <td className="py-3 px-3.5 font-bold text-[#1b1520]">{s.staff_name}</td>
                    <td className="py-3 px-3.5 text-[#7a7180]">
                      {s.first_check_in ? new Date(s.first_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </td>
                    <td className="py-3 px-3.5 text-[#7a7180]">
                      {s.last_check_out ? new Date(s.last_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-[#0B1B3D] tabular-nums">{s.worked_minutes} mins</td>
                    <td className="py-3 px-3.5">
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
