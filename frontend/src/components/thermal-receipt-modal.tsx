"use client";

import React, { useRef } from "react";
import {
  Printer, X, Share2, Check, Download, Scissors,
  Sparkles, Phone, MapPin, Receipt, ArrowRight
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  branchName?: string;
}

export function ThermalReceiptModal({
  isOpen,
  onClose,
  invoice,
  branchName = "Clifton Flagship Branch",
}: ThermalReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  // Format data
  const invoiceNum = invoice.invoice_number || `SHAY-INV-${String(invoice.id || "1001").slice(0, 8).toUpperCase()}`;
  const dateStr = invoice.issued_at
    ? new Date(invoice.issued_at).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const clientName = invoice.customer_name || invoice.customer?.full_name || "Valued Guest";
  const clientPhone = invoice.customer_phone || invoice.customer?.phone || "+92 300 0000000";
  const items = invoice.items || [
    { name: "Executive Grooming Suite", quantity: 1, unit_price: 4500, total_price: 4500 },
    { name: "Hydra-Glow Facial Cleanse", quantity: 1, unit_price: 9500, total_price: 9500 },
  ];

  const subtotal = invoice.subtotal_amount ?? items.reduce((acc: number, it: any) => acc + (Number(it.total_price) || 0), 0);
  const taxAmount = invoice.tax_amount ?? (subtotal * 0.13); // Sindh Revenue Board 13% SST
  const totalAmount = invoice.total_amount ?? (subtotal + taxAmount);
  const paidAmount = invoice.paid_amount ?? totalAmount;
  const balanceDue = invoice.balance_due ?? 0;
  const paymentMethod = invoice.payments?.[0]?.method || "CASH";

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsAppReceipt = () => {
    let msg = `*SHAY | LUXURY SALON & SPA KARACHI*\n`;
    msg += `📍 ${branchName}\n`;
    msg += `🧾 Receipt: ${invoiceNum}\n`;
    msg += `📅 Date: ${dateStr}\n`;
    msg += `👤 Guest: ${clientName}\n`;
    msg += `--------------------------------\n`;
    items.forEach((item: any) => {
      msg += `• ${item.name || item.product_name || "Service"} x${item.quantity || 1} = Rs. ${Number(item.total_price || item.unit_price).toLocaleString()}\n`;
    });
    msg += `--------------------------------\n`;
    msg += `Subtotal: Rs. ${Number(subtotal).toLocaleString()}\n`;
    msg += `Sindh SST (13%): Rs. ${Number(taxAmount).toLocaleString()}\n`;
    msg += `*NET TOTAL: Rs. ${Number(totalAmount).toLocaleString()}*\n`;
    msg += `Payment Method: ${paymentMethod} (PAID)\n`;
    msg += `--------------------------------\n`;
    msg += `Thank you for choosing SHAY! ✨\n`;
    msg += `Instagram: @shay.salon.pk`;

    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1B3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Global Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-print-area,
          #thermal-print-area * {
            visibility: visible !important;
          }
          #thermal-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm 3mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: "Courier New", Courier, monospace !important;
            font-size: 11px !important;
            line-height: 1.25 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#0B1B3D] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-white">80mm Thermal Receipt</h3>
              <p className="text-[10px] text-slate-300">ESC/POS Thermal Standard · SRB Compliant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 bg-[#F4F7FB] overflow-y-auto flex-1 flex justify-center">
          {/* Printable 80mm Container */}
          <div
            id="thermal-print-area"
            ref={receiptRef}
            className="w-[78mm] bg-white p-4 shadow-md border border-slate-200 font-mono text-[11px] leading-tight text-black select-text"
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-black space-y-0.5">
              <p className="font-bold text-sm tracking-wider uppercase">SHAY SALON &amp; SPA</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-700">Luxury Collective · Karachi</p>
              <p className="text-[10px] mt-1 font-semibold">{branchName}</p>
              <p className="text-[9px]">Block 4, Clifton / Bukhari DHA 6</p>
              <p className="text-[9px]">UAN / WhatsApp: +92 300 1234567</p>
              <p className="text-[9px] font-bold">SRB SNTN: 8934521-7</p>
            </div>

            {/* Meta Info */}
            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>RECEIPT #:</span>
                <span className="font-bold">{invoiceNum}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{dateStr}</span>
              </div>
              <div className="flex justify-between">
                <span>GUEST:</span>
                <span className="font-semibold truncate max-w-[130px]">{clientName}</span>
              </div>
              <div className="flex justify-between">
                <span>PHONE:</span>
                <span>{clientPhone}</span>
              </div>
            </div>

            {/* Items Header */}
            <div className="py-1.5 border-b border-black text-[10px] font-bold flex justify-between">
              <span>DESCRIPTION</span>
              <span>AMOUNT</span>
            </div>

            {/* Items List */}
            <div className="py-2 space-y-1.5 border-b border-dashed border-black text-[10px]">
              {items.map((it: any, idx: number) => {
                const name = it.name || it.product_name || "Salon Treatment";
                const qty = it.quantity || 1;
                const price = Number(it.total_price || it.unit_price || 0);

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold max-w-[160px] leading-tight">{name}</span>
                      <span className="font-bold">Rs. {price.toLocaleString()}</span>
                    </div>
                    {qty > 1 && (
                      <div className="text-[9px] text-slate-600">
                        {qty} x Rs. {(price / qty).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="py-2 border-b border-black text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>Gross Subtotal:</span>
                <span>Rs. {Number(subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Sindh SST (13%):</span>
                <span>Rs. {Number(taxAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-black">
                <span>NET TOTAL:</span>
                <span>Rs. {Number(totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Payment Method:</span>
                <span className="font-semibold uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>AMOUNT PAID:</span>
                <span>Rs. {Number(paidAmount).toLocaleString()}</span>
              </div>
              {balanceDue > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>BALANCE DUE:</span>
                  <span>Rs. {Number(balanceDue).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Barcode & Footer Note */}
            <div className="pt-3 text-center space-y-1 text-[9px] leading-tight">
              {/* Simulated Thermal Barcode */}
              <div className="py-1 tracking-widest font-mono text-center text-xs border-y border-dashed border-slate-300">
                * {invoiceNum} *
              </div>
              <p className="font-bold pt-1">THANK YOU FOR YOUR VISIT</p>
              <p>Luxury Hair · Esthetics · Bridal Concierge</p>
              <p className="text-[8px] text-slate-600">
                Retail product returns accepted within 7 days with original receipt.
              </p>
              <p className="font-semibold pt-1">Instagram: @shay.salon.pk</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0B1B3D] hover:bg-[#12285a] text-white text-xs font-bold shadow-md transition transform active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print 80mm Receipt</span>
          </button>

          <button
            onClick={handleCopyWhatsAppReceipt}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied E-Receipt!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>WhatsApp E-Receipt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
