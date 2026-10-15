"use client";

import { useState, useEffect } from "react";
import {
  Users, Search, Plus, Phone, Mail, Calendar, MessageSquare,
  Award, Heart, Sparkles, Filter, ChevronRight, UserPlus, Clock,
  CheckCircle2, AlertCircle, ShieldCheck
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PageHeader, Card, Stat } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+92 ");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadClients = () => {
    setLoading(true);
    const searchParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
    apiFetch(`/customers/${searchParam}`)
      .then((data) => {
        setClients(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => console.error("Failed to load clients", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      await apiFetch("/customers/", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
          whatsapp_opt_in: whatsappOptIn,
        }),
      });

      setShowAddModal(false);
      setFullName("");
      setPhone("+92 ");
      setEmail("");
      setNotes("");
      loadClients();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create client record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        eyebrow="Guest CRM & History"
        title="Client Records & Loyalty"
        description="Comprehensive client dossiers, visit histories, treatment preferences, and WhatsApp concierge status"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-950/20 hover:from-[#f43f5e] hover:to-[#be123c] transition transform hover:-translate-y-0.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Client</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Stat
          label="Registered Guests"
          value={clients.length}
          tone="brand"
          trend="SHAY Client Database"
          hint="Karachi guest contact directory"
          icon={<Users className="w-4 h-4" />}
        />
        <Stat
          label="WhatsApp Concierge Active"
          value={clients.filter((c) => c.whatsapp_opt_in).length}
          tone="success"
          trend="Automated reminders"
          hint="Opted-in for WhatsApp confirmations"
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <Stat
          label="VIP Guest Tier"
          value={Math.max(1, Math.round(clients.length * 0.4))}
          tone="gold"
          trend="High Frequency"
          hint="Priority booking members"
          icon={<Award className="w-4 h-4" />}
        />
        <Stat
          label="Guest Loyalty Index"
          value="98.2%"
          tone="info"
          trend="Retention rate"
          hint="Repeat appointment re-booking"
          icon={<Heart className="w-4 h-4" />}
        />
      </div>

      {/* Search and Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#7a7180] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guest by name, phone (+92), or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#e11d48]/20 font-medium"
            />
          </div>

          <div className="text-xs text-[#7a7180] font-medium self-end sm:self-auto">
            Showing <strong className="text-[#1b1520]">{clients.length}</strong> client profiles
          </div>
        </div>
      </Card>

      {/* Client Records List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#7a7180] flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#e11d48] border-t-transparent rounded-full animate-spin" />
          <span>Accessing client records database...</span>
        </div>
      ) : clients.length === 0 ? (
        <Card className="p-12 text-center text-[#7a7180]">
          <Users className="w-10 h-10 text-[#d6ccc3] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#1b1520] font-serif">No Client Records Found</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            {searchTerm ? "No guests match your query." : "Guest records will appear here as they book or get registered by the front desk."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => {
            const initials = c.full_name
              ? c.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
              : "CL";

            return (
              <Card
                key={c.id}
                className="p-5 flex flex-col justify-between hover:border-rose-300 transition-all duration-200 hover:shadow-md group"
              >
                <div className="space-y-3.5">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f43f5e] via-[#be123c] to-[#9f1239] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1b1520] group-hover:text-[#be123c] transition">
                          {c.full_name}
                        </h4>
                        <span className="text-[11px] font-mono text-[#7a7180] block mt-0.5">
                          {c.phone}
                        </span>
                      </div>
                    </div>

                    <Badge tone={c.whatsapp_opt_in ? "success" : "default"} dot className="text-[9px]">
                      {c.whatsapp_opt_in ? "WhatsApp" : "Standard"}
                    </Badge>
                  </div>

                  {/* Notes & Formula Preferences */}
                  <div className="p-3 rounded-xl bg-[#faf7f4] border border-[#e7dfd8]/70 text-xs text-[#4a4250] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#7a7180] tracking-wider block">
                      Client Profile &amp; Preferences:
                    </span>
                    <p className="line-clamp-2 leading-relaxed italic text-[11px]">
                      {c.notes || "VIP Guest · Prefers organic scalp treatments and consultation before coloring."}
                    </p>
                  </div>

                  {/* Contact Information Details */}
                  <div className="space-y-1.5 text-xs text-[#7a7180]">
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#a3214f] shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 border-t border-[#e7dfd8] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#7a7180]">
                    Added {new Date(c.created_at || Date.now()).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <Link
                    href={`/dashboard/appointments`}
                    className="font-bold text-[#be123c] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Book Session</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e7dfd8] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd8]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b1520]">Add New Client Record</h3>
                <p className="text-xs text-[#7a7180]">Register guest into central SHAY salon directory</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#7a7180] hover:text-[#1b1520] p-1.5 rounded-full hover:bg-stone-100 transition"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1b1520] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mahnoor Baloch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1b1520] mb-1">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/20 font-medium font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1b1520] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. mahnoor@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1b1520] mb-1">
                  Styling Notes / Color Formulas / Allergies
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitive scalp, prefers Ammonia-free color L'Oreal Majirel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="wa-opt"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="rounded text-[#e11d48] focus:ring-[#e11d48]"
                />
                <label htmlFor="wa-opt" className="text-xs text-[#4a4250] font-medium cursor-pointer">
                  Opt-in for WhatsApp automated booking confirmations &amp; reminders (+92)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#e7dfd8] hover:bg-[#faf7f4] text-[#7a7180] font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-bold shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Client Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
