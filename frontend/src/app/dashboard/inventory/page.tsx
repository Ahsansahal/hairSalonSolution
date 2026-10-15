"use client";

import { useState, useEffect } from "react";
import {
  Package, DollarSign, Plus, ArrowDownRight, ArrowUpRight, CheckCircle2,
  AlertCircle, ShoppingBag, CreditCard, RefreshCw, Printer, AlertTriangle,
  Scissors, Search, Check, X, ShieldAlert, Sparkles
} from "lucide-react";
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

  // Retail Product Sale Modal
  const [showRetailSaleModal, setShowRetailSaleModal] = useState(false);
  const [saleProduct, setSaleProduct] = useState<any | null>(null);
  const [saleQty, setSaleQty] = useState(1);
  const [saleGuestName, setSaleGuestName] = useState("");
  const [saleGuestPhone, setSaleGuestPhone] = useState("");
  const [salePayMethod, setSalePayMethod] = useState("CARD");
  const [submittingSale, setSubmittingSale] = useState(false);

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
          setSaleProduct(iList[0]);
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

  // Fast Retail Product Sale Handler
  const handleFastRetailSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleProduct) return;
    setSubmittingSale(true);

    const price = saleProduct.unit_retail_price || 3500;
    const subtotal = price * saleQty;
    const tax = Math.round(subtotal * 0.13); // 13% SRB SST
    const total = subtotal + tax;

    const newInvoice = {
      id: `inv-retail-${Date.now()}`,
      invoice_number: `SHAY-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: saleGuestName || "Walk-In Retail Client",
      customer_phone: saleGuestPhone || "+92 300 0000000",
      branch_name: "Clifton Flagship Branch",
      status: "PAID",
      subtotal_amount: subtotal,
      tax_amount: tax,
      total_amount: total,
      amount_paid: total,
      balance_due: 0,
      issued_at: new Date().toISOString(),
      items: [
        {
          name: saleProduct.product_name,
          quantity: saleQty,
          unit_price: price,
          total_price: subtotal,
        },
      ],
      payments: [{ method: salePayMethod, amount: total }],
    };

    // Update in-memory inventory and invoice list
    setInventory((prev) =>
      prev.map((item) =>
        item.id === saleProduct.id
          ? { ...item, quantity_on_hand: Math.max(0, item.quantity_on_hand - saleQty) }
          : item
      )
    );
    setInvoices((prev) => [newInvoice, ...prev]);

    setSubmittingSale(false);
    setShowRetailSaleModal(false);

    // Immediately launch thermal receipt modal
    setReceiptInvoice(newInvoice);
    setShowReceiptModal(true);
  };

  const lowStockItems = inventory.filter((item) => item.quantity_on_hand <= 15);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + parseFloat(inv.balance_due || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === "PAID").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Stock & POS Billing"
        title="Inventory, Retail Sales & Invoices"
        description="Branch stock levels, restock ledger, counter retail sales, and 80mm thermal receipts"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRetailSaleModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 text-xs font-extrabold text-[#0A1931] shadow-md transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>+ Sell Retail Product</span>
            </button>
            <button
              onClick={() => setShowStockModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A1931] hover:bg-[#15284F] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Record Stock In/Out</span>
            </button>
          </div>
        }
      />

      {/* Low Stock Alert Banner (What User Requested) */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-900">
                Low-Stock Threshold Alert ({lowStockItems.length} Products Below Safety Level)
              </h3>
              <p className="text-[11px] text-rose-700 mt-0.5">
                {lowStockItems.map((item) => `${item.product_name} (${item.quantity_on_hand} left)`).join(" · ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedInvId(lowStockItems[0].id);
              setMovementType("PURCHASE");
              setQuantityDelta("25");
              setShowStockModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-sm transition shrink-0"
          >
            Create Restock Order &rarr;
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Tracked Products"
          value={inventory.length}
          tone="brand"
          icon={<Package className="h-4 w-4 text-blue-600" />}
        />
        <Stat
          label="Low Stock Warnings"
          value={lowStockItems.length}
          tone={lowStockItems.length > 0 ? "danger" : "success"}
          icon={<AlertCircle className="h-4 w-4 text-rose-600" />}
        />
        <Stat
          label="Completed Invoices"
          value={paidCount}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <Stat
          label="Total Balance Due"
          value={formatCurrency(totalOutstanding)}
          tone={totalOutstanding > 0 ? "warning" : "default"}
          icon={<DollarSign className="h-4 w-4 text-amber-600" />}
        />
      </div>

      {/* Stock Balances Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#0B1B3D]">Branch Inventory Balances</h2>
            <p className="text-xs text-slate-500">Real-time shelf counts for consumables &amp; luxury retail products</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRetailSaleModal(true)}
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>+ Quick Sale</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {inventory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No inventory items tracked yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => {
              const isLow = item.quantity_on_hand <= 15;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition space-y-2.5 ${
                    isLow
                      ? "bg-rose-50/40 border-rose-200"
                      : "bg-[#F8FAFC] border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {item.sku || "SHAY-SKU"}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isLow
                          ? "bg-rose-100 text-rose-700 border border-rose-300"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#0B1B3D] line-clamp-1">{item.product_name}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Retail: {formatCurrency(item.unit_retail_price || 3500)}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-between items-baseline border-t border-slate-200/70">
                    <span className="text-[11px] text-slate-500">Available:</span>
                    <span className={`text-lg font-serif font-extrabold tabular-nums ${isLow ? "text-rose-600" : "text-[#0B1B3D]"}`}>
                      {item.quantity_on_hand} <span className="text-xs font-sans font-normal text-slate-500">units</span>
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSaleProduct(item);
                        setShowRetailSaleModal(true);
                      }}
                      className="font-bold text-amber-600 hover:underline"
                    >
                      Sell Item &rarr;
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInvId(item.id);
                        setShowStockModal(true);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POS Invoices Table Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-[#0B1B3D]">Invoices &amp; Payment Processing</h2>
            <p className="text-xs text-slate-500">Checkout receipts, split tenders, and 80mm thermal printing</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{invoices.length} Invoices Recorded</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No invoices generated yet. Invoices are automatically created upon booking completion or counter sale.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-[#F8FAFC] text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Invoice #</th>
                  <th className="py-3 px-3.5">Guest</th>
                  <th className="py-3 px-3.5">Branch</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Total</th>
                  <th className="py-3 px-3.5">Paid</th>
                  <th className="py-3 px-3.5">Balance Due</th>
                  <th className="py-3 px-3.5 text-right">80mm Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0B1B3D]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3.5 font-mono font-bold text-amber-700">{inv.invoice_number}</td>
                    <td className="py-3 px-3.5 font-medium">{inv.customer_name || "Walk-In Guest"}</td>
                    <td className="py-3 px-3.5 text-slate-500">{inv.branch_name}</td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
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
                    <td className="py-3 px-3.5 text-rose-600 font-bold tabular-nums">{formatCurrency(inv.balance_due)}</td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setReceiptInvoice(inv);
                            setShowReceiptModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-600" />
                          <span>80mm Slip</span>
                        </button>

                        {inv.status !== "PAID" && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentAmount(inv.balance_due);
                              setShowPaymentModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fast Retail Product Sale Counter Modal (What User Requested) */}
      {showRetailSaleModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0B1B3D]">POS Fast Retail Product Sale</h3>
                <p className="text-xs text-slate-500">Sell products directly at front desk with instant 80mm slip.</p>
              </div>
              <button
                onClick={() => setShowRetailSaleModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFastRetailSale} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Product to Sell</label>
                <select
                  value={saleProduct?.id || ""}
                  onChange={(e) => {
                    const found = inventory.find((item) => item.id === e.target.value);
                    if (found) setSaleProduct(found);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product_name} · ({formatCurrency(item.unit_retail_price || 3500)}) · {item.quantity_on_hand} left
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={saleProduct?.quantity_on_hand || 10}
                    value={saleQty}
                    onChange={(e) => setSaleQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={salePayMethod}
                    onChange={(e) => setSalePayMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="CARD (Bank Alfalah)">Card (Bank Alfalah POS)</option>
                    <option value="CASH">Cash Counter</option>
                    <option value="RAAST_IBFT">Raast / QR Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={saleGuestName}
                  onChange={(e) => setSaleGuestName(e.target.value)}
                  placeholder="e.g. Shayan Merchant"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Price Calculation Box */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold">{formatCurrency((saleProduct?.unit_retail_price || 3500) * saleQty)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SRB SST 13% Tax:</span>
                  <span className="font-bold text-slate-700">
                    {formatCurrency(Math.round((saleProduct?.unit_retail_price || 3500) * saleQty * 0.13))}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#0B1B3D] pt-1 border-t border-slate-200">
                  <span>Total Amount Due:</span>
                  <span className="font-serif font-extrabold">
                    {formatCurrency(Math.round((saleProduct?.unit_retail_price || 3500) * saleQty * 1.13))}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRetailSaleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSale}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-[#0A1931] text-xs font-extrabold shadow-sm transition"
                >
                  {submittingSale ? "Processing..." : "Complete Sale & Print 80mm Slip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Stock In/Out Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0B1B3D]">Record Stock Movement</h3>
                <p className="text-xs text-slate-500">Add purchases, salon internal usage, or inventory audits.</p>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockMovement} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product</label>
                <select
                  value={selectedInvId}
                  onChange={(e) => setSelectedInvId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product_name} ({item.quantity_on_hand} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Movement Type</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="PURCHASE">Purchase Restock (+)</option>
                    <option value="INTERNAL_USE">Internal Salon Use (-)</option>
                    <option value="DAMAGE">Damaged / Expired (-)</option>
                    <option value="ADJUSTMENT">Stock Audit Correction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Delta</label>
                  <input
                    type="number"
                    required
                    value={quantityDelta}
                    onChange={(e) => setQuantityDelta(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Supplier Invoice #</label>
                <input
                  type="text"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  placeholder="e.g. L'Oreal Official Distributor PO-8921"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStock}
                  className="px-5 py-2 rounded-xl bg-[#0A1931] hover:bg-[#15284F] text-white text-xs font-bold shadow-sm transition"
                >
                  {submittingStock ? "Saving..." : "Update Stock Level"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0B1B3D]">Record Payment</h3>
                <p className="text-xs text-slate-500">Invoice #{selectedInvoice.invoice_number}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="CASH">Cash Counter</option>
                  <option value="CARD">Card POS (Bank Alfalah)</option>
                  <option value="BANK_TRANSFER">Raast / IBFT</option>
                  <option value="WALLET">EasyPaisa / JazzCash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Pay (PKR)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Reference / Auth Code</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. ALF-POS-7821"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                >
                  {submittingPayment ? "Recording..." : "Record Payment & Settle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 80mm Thermal Receipt Modal */}
      {showReceiptModal && (
        <ThermalReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          invoice={receiptInvoice}
        />
      )}
    </div>
  );
}
