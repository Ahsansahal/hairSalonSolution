"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, Plus, Search, Tag, Clock, Scissors,
  CheckCircle2, Share2, Copy, ExternalLink, Calendar,
  TrendingUp, Users, ArrowUpRight, Check, X, ShieldAlert,
  Percent, Gift
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { WalkInDialog } from "@/components/walk-in-dialog";

export default function DealsDashboardPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Walk-in dialog integration
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | undefined>(undefined);

  // New Deal modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDealName, setNewDealName] = useState("");
  const [newDealCategory, setNewDealCategory] = useState("Deals & Packages");
  const [newDealPrice, setNewDealPrice] = useState("");
  const [newDealOriginalPrice, setNewDealOriginalPrice] = useState("");
  const [newDealDuration, setNewDealDuration] = useState("60");
  const [newDealInclusions, setNewDealInclusions] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/services/");
      const serviceList = Array.isArray(data) ? data : data.results || [];
      // Filter for deals & packages or services with "Deal" or "Package" in name/category
      const dealList = serviceList.filter(
        (s: any) =>
          s.category?.toLowerCase().includes("deal") ||
          s.category?.toLowerCase().includes("package") ||
          s.name?.toLowerCase().includes("deal") ||
          s.name?.toLowerCase().includes("package")
      );
      setDeals(dealList);
    } catch (err) {
      console.error("Failed to fetch deals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleSeatWalkIn = (dealId: string) => {
    setSelectedDealId(dealId);
    setWalkInOpen(true);
  };

  const handleCopyWhatsAppLink = (deal: any) => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum SHAY Salon & Spa Karachi! I would like to book "${deal.name}" (Rs. ${Number(deal.base_price).toLocaleString()} PKR). Could you please confirm the nearest available slot at your Clifton / DHA branch?`
    );
    const waUrl = `https://wa.me/923001234567?text=${text}`;
    navigator.clipboard.writeText(waUrl);
    setCopiedId(deal.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const desc = `${newDealInclusions} ${
        newDealOriginalPrice ? `(Valued at Rs. ${Number(newDealOriginalPrice).toLocaleString()})` : ""
      }`.trim();

      await apiFetch("/services/", {
        method: "POST",
        body: JSON.stringify({
          name: newDealName,
          category: newDealCategory,
          base_price: parseFloat(newDealPrice) || 0,
          default_duration_minutes: parseInt(newDealDuration, 10) || 60,
          description: desc,
          is_active: true,
          public_bookable: true,
        }),
      });

      setCreateModalOpen(false);
      setNewDealName("");
      setNewDealPrice("");
      setNewDealOriginalPrice("");
      setNewDealInclusions("");
      await loadDeals();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create new deal package.");
    } finally {
      setCreating(false);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      deal.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(deals.map((d) => d.category))).filter(Boolean);

  // Helper to extract inclusions and value
  const parseDealDetails = (description: string = "") => {
    const valueMatch = description.match(/Valued at Rs\.?\s*([\d,]+)/i) || description.match(/Normal Value:?\s*Rs\.?\s*([\d,]+)/i);
    const originalPrice = valueMatch ? valueMatch[1] : null;

    const saveMatch = description.match(/Save\s*(\d+%?)/i);
    const savings = saveMatch ? saveMatch[1] : null;

    // Split clean list of treatments
    let cleanText = description.replace(/\([^)]*\)/g, "").trim();
    const items = cleanText
      .split(/[+·\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.toLowerCase().startsWith("valued at"));

    return { originalPrice, savings, items };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0A1931] via-[#12285A] to-[#1E3A6E] p-6 sm:p-8 rounded-3xl border border-slate-700/50 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-500/10 via-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Gift className="w-3.5 h-3.5" /> High-Conversion Karachi Packages
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Percent className="w-3.5 h-3.5" /> Up to 35% Customer Savings
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Deals &amp; Signature Packages
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Streamline multi-service bookings, WhatsApp promotion campaigns, and instant walk-in seating. 
            All deals are pre-configured with SRB 13% tax compliance and stylist commission tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/deals"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-medium transition shadow-sm"
          >
            <span>Live Guest Deals Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
          </Link>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A1931] text-xs font-extrabold shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Deal</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e8dfd8] shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium mb-1">
            <span>Active Signature Deals</span>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#1b1520]">{deals.length} Active</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Available across Clifton &amp; DHA</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8dfd8] shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium mb-1">
            <span>Average Deal Value</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#1b1520]">
            Rs.{" "}
            {deals.length > 0
              ? Math.round(
                  deals.reduce((acc, d) => acc + parseFloat(d.base_price || 0), 0) / deals.length
                ).toLocaleString()
              : "0"}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Karachi premium price index</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8dfd8] shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium mb-1">
            <span>Top Conversion Category</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-serif font-bold text-[#1b1520] truncate">
            Wedding &amp; Groom
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Highest margin &amp; guest retention</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8dfd8] shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium mb-1">
            <span>Walk-In Conversion</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#1b1520]">68%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Prefer combo packages over singles</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e8dfd8] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search deals, facial, keratin, groom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#faf7f4] border border-[#e8dfd8] rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white text-zinc-800 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === "all"
                ? "bg-[#180e1c] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All Packages ({deals.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#180e1c] text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Loading Karachi signature salon deals...</p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#e8dfd8] p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-zinc-800">No matching deals found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Try adjusting your search criteria or create a new deal to expand your salon offerings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => {
            const { originalPrice, savings, items } = parseDealDetails(deal.description);
            const isCopied = copiedId === deal.id;

            return (
              <div
                key={deal.id}
                className="bg-white rounded-3xl border border-[#e8dfd8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-rose-300"
              >
                {/* Card Top Banner */}
                <div>
                  <div className="p-6 pb-4 border-b border-[#f4eee8] bg-gradient-to-b from-[#faf6f2] to-white relative">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-semibold tracking-wide">
                        {deal.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium bg-white px-2 py-0.5 rounded-full border border-zinc-200">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{deal.default_duration_minutes} mins</span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#0B1B3D] group-hover:text-amber-700 transition-colors leading-snug">
                      {deal.name}
                    </h3>

                    {/* Price and Savings Header */}
                    <div className="mt-4 flex items-baseline gap-2.5">
                      <span className="font-serif font-extrabold text-2xl text-[#0B1B3D]">
                        Rs. {Number(deal.base_price).toLocaleString()}
                      </span>
                      {originalPrice && (
                        <span className="text-xs text-slate-400 line-through font-medium">
                          Rs. {originalPrice}
                        </span>
                      )}
                      {savings && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Save {savings}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Treatments / Inclusions List */}
                  <div className="p-6 py-5 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Package Inclusions:
                    </p>
                    <ul className="space-y-2">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0 border-t border-slate-100 bg-[#F8FAFC]/60">
                  <div className="pt-4 flex flex-col gap-2">
                    {/* Primary Action: Instant Seat Walk-in */}
                    <button
                      onClick={() => handleSeatWalkIn(deal.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0A1931] hover:bg-[#12285A] text-white text-xs font-bold shadow-md transition transform active:scale-95"
                    >
                      <Scissors className="w-3.5 h-3.5 text-amber-400" />
                      <span>Seat Guest with this Deal</span>
                    </button>

                    {/* Secondary Action: Copy WhatsApp Link */}
                    <button
                      onClick={() => handleCopyWhatsAppLink(deal)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">WhatsApp Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy WhatsApp Promo Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Deal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0A1931] via-amber-500 to-[#0A1931]" />

            <div className="px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#0B1B3D]">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-[#0B1B3D]">
                  Create New Signature Deal / Package
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Package / Deal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SHAY Deal 07: Eid Glow & Royal Beard"
                  value={newDealName}
                  onChange={(e) => setNewDealName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#faf7f4] border border-[#e8dfd8] rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newDealCategory}
                    onChange={(e) => setNewDealCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#faf7f4] border border-[#e8dfd8] rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white text-zinc-900"
                  >
                    <option value="Deals & Packages">Deals &amp; Packages</option>
                    <option value="Wedding & Groom Packages">Wedding &amp; Groom Packages</option>
                    <option value="Skin & Hydra Rituals">Skin &amp; Hydra Rituals</option>
                    <option value="Hair Spa & Treatments">Hair Spa &amp; Treatments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Estimated Duration (mins) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={newDealDuration}
                    onChange={(e) => setNewDealDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#faf7f4] border border-[#e8dfd8] rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Deal Offer Price (Rs. PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 4500"
                    value={newDealPrice}
                    onChange={(e) => setNewDealPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#faf7f4] border border-[#e8dfd8] rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Original Value (Rs. PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 6500"
                    value={newDealOriginalPrice}
                    onChange={(e) => setNewDealOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#faf7f4] border border-[#e8dfd8] rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Included Treatments (Separate with +) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Precision Haircut + Charcoal Beard Trim + Mint Cleanser + Scalp Spa"
                  value={newDealInclusions}
                  onChange={(e) => setNewDealInclusions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#faf7f4] border border-[#e8dfd8] rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white text-zinc-900"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Each service separated by "+" will render as a checkmark in the guest and dashboard cards.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0B1B3D] text-amber-300 hover:bg-[#071120] border border-amber-500/20 transition disabled:opacity-50 shadow-md"
                >
                  {creating ? "Publishing Deal..." : "Publish Deal Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Walk-in seating dialog */}
      <WalkInDialog
        isOpen={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onSuccess={() => {
          // Toast or refresh
        }}
        initialServiceId={selectedDealId}
      />
    </div>
  );
}
