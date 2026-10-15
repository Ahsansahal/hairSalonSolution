"use client";

import { useState, useEffect } from "react";
import { Package, DollarSign, Plus, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle, ShoppingBag, CreditCard, RefreshCw, Printer } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card, PageHeader, Stat } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { ThermalReceiptModal } from "@/components/thermal-receipt-modal";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Thermal Receipt state
  const [receiptInvoice, setReceiptInvoice] = useState<any | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Stock movement modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedInvId, setSelectedInvId] = useState("");
  const [movementType, setMovementType] = useState("PURCHASE");
  const [quantityDelta, setQuantityDelta] = useState("10");
  const [movementNotes, setMovementNotes] = useState("");
  const [submittingStock, setSubmittingStock] = useState(false);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadData = () => {
    setLoading(true);
    const activeBranch = localStorage.getItem("salon_active_branch") || "all";
    const branchParam = activeBranch !== "all" ? `?branch_id=${activeBranch}` : "";

    Promise.all([
      apiFetch(`/inventory/stocks/${branchParam}`),
      apiFetch(`/billing/invoices/${branchParam}`),
    ])
      .then(([invData, invsData]) => {
        const iList = Array.isArray(invData) ? invData : invData.results || [];
        setInventory(iList);
        if (iList.length > 0 && !selectedInvId) {
          setSelectedInvId(iList[0].id);
        }
        setInvoices(Array.isArray(invsData) ? invsData : invsData.results || []);
      })
      .catch((err) => console.error("Failed to load inventory/billing", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const handleBranchChange = () => loadData();
    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, []);

  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStock(true);
    try {
      await apiFetch("/inventory/movements/", {
        method: "POST",
        body: JSON.stringify({
          branch_inventory_id: selectedInvId,
          movement_type: movementType,
          quantity_delta: quantityDelta,
          notes: movementNotes,
        }),
      });
      setShowStockModal(false);
      setMovementNotes("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to record stock movement");
    } finally {
      setSubmittingStock(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmittingPayment(true);

    try {
      await apiFetch(`/billing/invoices/${selectedInvoice.id}/payments/`, {
        method: "POST",
        body: JSON.stringify({
          method: paymentMethod,
          amount: paymentAmount,
          reference_code: paymentRef,
        }),
      });
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const totalOutstanding = invoices.reduce((acc, inv) => acc + parseFloat(inv.balance_due || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === "PAID").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <PageHeader
        eyebrow="Stock & POS Billing"
        title="Inventory & Invoices"
        description="Branch stock levels, restock ledger, retail products, and split-payment checkout"
        actions={
          <button
            onClick={() => setShowStockModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#a3214f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#8b1b42]"
          >
            <Plus className="h-4 w-4" />
            <span>Record Stock Movement</span>
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Tracked Products"
          value={inventory.length}
          tone="brand"
          icon={<Package className="h-4 w-4 text-[#a3214f]" />}
        />
        <Stat
          label="Total Invoices"
          value={invoices.length}
          tone="default"
          icon={<ShoppingBag className="h-4 w-4 text-[#4a4250]" />}
        />
        <Stat
          label="Paid Invoices"
          value={paidCount}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4 text-[#15803d]" />}
        />
        <Stat
          label="Balance Due"
          value={formatCurrency(totalOutstanding)}
          tone={totalOutstanding > 0 ? "warning" : "default"}
          icon={<DollarSign className="h-4 w-4 text-[#b45309]" />}
        />
      </div>

      {/* Stock Balances Section */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd8] mb-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#1b1520]">Branch Inventory Balances</h2>
            <p className="text-xs text-[#7a7180]">Real-time shelf counts for consumables & retail products</p>
          </div>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] hover:bg-[#f2ece6] text-[#7a7180] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {inventory.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7a7180]">No inventory items tracked yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] hover:border-[#d6ccc3] transition space-y-2"
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white border border-[#e7dfd8] text-[#7a7180]">
                    {item.product_sku}
                  </span>
                  <Badge tone={item.product_category === "RETAIL" ? "brand" : "info"} className="text-[9px]">
                    {item.product_category}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-[#1b1520] line-clamp-1">{item.product_name}</h4>
                <div className="pt-2 flex justify-between items-baseline border-t border-[#e7dfd8]">
                  <span className="text-[11px] text-[#7a7180]">In Stock:</span>
                  <span className="text-lg font-serif font-bold text-[#a3214f] tabular-nums">
                    {item.quantity_on_hand} <span className="text-xs font-sans text-[#7a7180] font-normal">{item.product_unit}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* POS Invoices Table Card */}
      <Card className="p-5">
        <div className="pb-3 border-b border-[#e7dfd8] mb-4">
          <h2 className="text-[15px] font-bold text-[#1b1520]">Invoices & Payment Processing</h2>
          <p className="text-xs text-[#7a7180]">Checkout receipts, split tenders, and outstanding account balances</p>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7a7180]">
            No invoices generated yet. Invoices are automatically created upon booking completion.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e7dfd8] bg-[#faf7f4] text-[#7a7180] font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Invoice #</th>
                  <th className="py-3 px-3.5">Guest</th>
                  <th className="py-3 px-3.5">Branch</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Total</th>
                  <th className="py-3 px-3.5">Paid</th>
                  <th className="py-3 px-3.5">Balance Due</th>
                  <th className="py-3 px-3.5 text-right">Quick Checkout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7dfd8]/60 text-[#1b1520]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#faf7f4]/60 transition">
                    <td className="py-3 px-3.5 font-mono font-semibold text-[#a3214f]">{inv.invoice_number}</td>
                    <td className="py-3 px-3.5 font-medium">{inv.customer_name || "Guest"}</td>
                    <td className="py-3 px-3.5 text-[#7a7180]">{inv.branch_name}</td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inv.status === "PARTIALLY_PAID"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold tabular-nums">{formatCurrency(inv.total_amount)}</td>
                    <td className="py-3 px-3.5 text-emerald-700 font-medium tabular-nums">{formatCurrency(inv.amount_paid)}</td>
                    <td className="py-3 px-3.5 text-[#a3214f] font-bold tabular-nums">{formatCurrency(inv.balance_due)}</td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setReceiptInvoice(inv);
                            setShowReceiptModal(true);
                          }}
                          title="Print 80mm Thermal Receipt"
                          className="p-1.5 rounded-lg border border-[#e7dfd8] bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        {inv.status !== "PAID" ? (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentAmount(inv.balance_due);
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#a3214f] hover:bg-[#8b1b42] text-white text-[11px] font-semibold shadow-xs transition"
                          >
                            Collect Payment
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Settled</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stock Movement Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e7dfd8] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd8]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b1520]">Record Stock Movement</h3>
                <p className="text-xs text-[#7a7180]">Adjust physical inventory with audit traceability</p>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-[#7a7180] hover:text-[#1b1520] p-1.5 rounded-full hover:bg-stone-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockMovement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                  Product
                </label>
                <select
                  value={selectedInvId}
                  onChange={(e) => setSelectedInvId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-medium"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.product_name} (Current: {i.quantity_on_hand})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                    Movement Type
                  </label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                  >
                    <option value="PURCHASE">Purchase / Restock (+)</option>
                    <option value="SALE">Retail Sale (-)</option>
                    <option value="CONSUMPTION">Salon Service Use (-)</option>
                    <option value="ADJUSTMENT">Audit Adjustment (+/-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                    Quantity Delta
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quantityDelta}
                    onChange={(e) => setQuantityDelta(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                  Audit Notes / Reason
                </label>
                <input
                  type="text"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  placeholder="e.g. Weekly replenishment from central supplier"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e7dfd8] hover:bg-[#faf7f4] text-[#7a7180] text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStock}
                  className="px-5 py-2.5 rounded-xl bg-[#a3214f] hover:bg-[#8b1b42] text-white text-xs font-semibold shadow-sm transition"
                >
                  {submittingStock ? "Saving..." : "Record Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e7dfd8] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd8]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b1520]">Collect Payment</h3>
                <p className="text-xs text-[#7a7180] mt-0.5">
                  Invoice <span className="font-mono text-[#a3214f] font-semibold">{selectedInvoice.invoice_number}</span> • Due: <strong className="text-[#a3214f]">{formatCurrency(selectedInvoice.balance_due)}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[#7a7180] hover:text-[#1b1520] p-1.5 rounded-full hover:bg-stone-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-medium"
                  >
                    <option value="CASH">Cash (PKR)</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER">Bank Wire / IBFT (Raast)</option>
                    <option value="WALLET">Digital Wallet (EasyPaisa / JazzCash / Nayapay)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                    Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1b1520] mb-1">
                  Card / Reference Code
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. TXN-CARD-9902"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#a3214f]/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e7dfd8] hover:bg-[#faf7f4] text-[#7a7180] text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition"
                >
                  {submittingPayment ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 80mm Thermal Receipt Modal */}
      <ThermalReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        invoice={receiptInvoice}
      />
    </div>
  );
}
