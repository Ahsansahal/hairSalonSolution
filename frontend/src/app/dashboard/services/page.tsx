"use client";

import { useState, useEffect } from "react";
import { Scissors, Plus, Search, Tag, Clock, DollarSign, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card, PageHeader, Stat } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [branchServices, setBranchServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // New service modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hair Services");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("3500");
  const [bufferMinutes, setBufferMinutes] = useState("15");
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    const activeBranch = localStorage.getItem("salon_active_branch") || "all";
    const branchParam = activeBranch !== "all" ? `?branch_id=${activeBranch}` : "";

    Promise.all([
      apiFetch("/services/"),
      apiFetch(`/branch-services/${branchParam}`),
    ])
      .then(([sData, bsData]) => {
        setServices(Array.isArray(sData) ? sData : sData.results || []);
        setBranchServices(Array.isArray(bsData) ? bsData : bsData.results || []);
      })
      .catch((err) => {
        console.error("Failed to load services", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const handleBranchChange = () => loadData();
    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/services/", {
        method: "POST",
        body: JSON.stringify({
          name,
          category,
          description,
          default_duration_minutes: parseInt(duration, 10),
          base_price: price,
          buffer_minutes: parseInt(bufferMinutes, 10),
          is_active: true,
          public_bookable: true,
        }),
      });
      setShowAddModal(false);
      setName("");
      setDescription("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const avgDuration = services.length
    ? Math.round(services.reduce((acc, s) => acc + (s.default_duration_minutes || 0), 0) / services.length)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        eyebrow="Treatment Menu"
        title="Services & Treatments"
        description="Master treatment catalog with transparent pricing and customizable branch overrides"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#a3214f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#8b1b42]"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Service</span>
          </button>
        }
      />

      {/* Stat Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Total Treatments"
          value={services.length}
          tone="brand"
          icon={<Scissors className="h-4 w-4 text-[#a3214f]" />}
        />
        <Stat
          label="Categories"
          value={categories.length - 1 || 0}
          tone="default"
          icon={<Tag className="h-4 w-4 text-[#4a4250]" />}
        />
        <Stat
          label="Avg Duration"
          value={`${avgDuration}m`}
          tone="info"
          icon={<Clock className="h-4 w-4 text-[#1d5fbf]" />}
        />
        <Stat
          label="Branch Overrides"
          value={branchServices.length}
          tone="success"
          icon={<Sparkles className="h-4 w-4 text-[#15803d]" />}
        />
      </div>

      {/* Search and Category Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7a7180] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search treatments or descriptions..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                  selectedCategory === cat
                    ? "bg-[#1b1520] text-white shadow-xs"
                    : "bg-[#faf7f4] text-[#7a7180] hover:bg-[#f2ece6] border border-[#e7dfd8]"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Services Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#7a7180]">Loading salon catalog...</div>
      ) : filteredServices.length === 0 ? (
        <Card className="p-12 text-center text-[#7a7180]">
          <Scissors className="w-8 h-8 text-[#d6ccc3] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#1b1520]">No services found</p>
          <p className="text-xs mt-1">Try adjusting your search query or category filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((s) => {
            const overrides = branchServices.filter((bs) => bs.service === s.id);
            return (
              <Card
                key={s.id}
                className="p-5 flex flex-col justify-between hover:border-[#d6ccc3] transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone="brand" className="text-[10px] font-semibold uppercase tracking-wider">
                      {s.category || "Treatment"}
                    </Badge>
                    <span className="text-xl font-serif font-bold text-[#a3214f] tabular-nums">
                      {formatCurrency(s.base_price)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1b1520] mt-3">{s.name}</h3>
                  <p className="text-xs text-[#7a7180] mt-1.5 line-clamp-2 leading-relaxed">
                    {s.description || "Indulgent bespoke salon treatment tailored to your style."}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-[#7a7180]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#a3214f]" />
                      <span className="font-medium text-[#1b1520]">{s.default_duration_minutes} mins</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#7a7180]" />
                      <span>+{s.buffer_minutes || 15}m reset</span>
                    </span>
                  </div>
                </div>

                {/* Overrides footer */}
                <div className="mt-5 pt-3 border-t border-[#e7dfd8] flex items-center justify-between text-[11px]">
                  {overrides.length > 0 ? (
                    <span className="text-[#a3214f] font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {overrides.length} branch variation(s)
                    </span>
                  ) : (
                    <span className="text-[#7a7180]">Standard chain pricing</span>
                  )}
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    Active
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e7dfd8] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd8]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b1520]">Add Master Service</h3>
                <p className="text-xs text-[#7a7180]">Add a treatment to your central organization catalog</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#7a7180] hover:text-[#1b1520] p-1.5 rounded-full hover:bg-stone-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Balayage & Silk Infusion"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                  >
                    <option value="Hair Services">Hair Services</option>
                    <option value="Hair Color">Hair Color</option>
                    <option value="Esthetics & Skincare">Esthetics & Skincare</option>
                    <option value="Body Spa">Body Spa</option>
                    <option value="Nail Care">Nail Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                    Base Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                    Buffer Reset (Mins)
                  </label>
                  <input
                    type="number"
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail the treatment experience, techniques, and results..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e7dfd8] hover:bg-[#faf7f4] text-[#7a7180] text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#a3214f] hover:bg-[#8b1b42] text-white text-xs font-semibold shadow-sm transition"
                >
                  {submitting ? "Saving..." : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
