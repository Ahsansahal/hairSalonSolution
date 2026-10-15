"use client";

import { useState } from "react";
import {
  MessageSquare, Send, RefreshCw, Smartphone, Bot, ShieldCheck, CheckCircle2,
  Sparkles, Bell, Clock, Receipt, Check, Share2, Copy
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card, PageHeader, Stat } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function WhatsAppSimulatorPage() {
  const [phone, setPhone] = useState("+923001234567");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "👋 Welcome to SHAY Salon & Spa (Karachi) WhatsApp Concierge!\nType 'hi' or 'menu' to begin your luxury booking.",
      time: "Just now",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [sessionState, setSessionState] = useState("GREETING");
  const [loading, setLoading] = useState(false);
  const [copiedTrigger, setCopiedTrigger] = useState<string | null>(null);

  const sendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputMsg).trim();
    if (!textToSend) return;

    if (!customText) setInputMsg("");
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: "user", text: textToSend, time: nowTime }]);
    setLoading(true);

    try {
      const res = await apiFetch("/webhooks/whatsapp/simulate/", {
        method: "POST",
        body: JSON.stringify({
          phone: phone,
          message: textToSend,
        }),
      });

      setSessionState(res.session_state);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.bot_reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Error: ${err.message}`, time: nowTime },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Automated WhatsApp Triggers (What User Requested)
  const triggerAutomatedMessage = (type: "CONFIRMATION" | "REMINDER" | "RECEIPT") => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let text = "";

    if (type === "CONFIRMATION") {
      text = `✨ *SHAY Salon & Spa · Luxury Booking Confirmed* ✨\n\nDear Shayan Merchant,\nYour VIP appointment has been reserved:\n\n✂️ *Service:* SHAY Deal 01: Executive Grooming Suite\n📍 *Branch:* Clifton Flagship (Block 4, Near Bilawal House)\n📅 *Date & Time:* Today, 02:00 PM\n👤 *Lead Artisan:* Aliya Rizvi\n\nFor Google Maps directions: https://maps.google.com/?q=SHAY+Clifton\nNeed to modify? Reply 'RESCHEDULE' to this chat.`;
    } else if (type === "REMINDER") {
      text = `⏰ *Appointment Reminder · 2 Hours Prior*\n\nDear Shayan Merchant,\nThis is a friendly reminder that your salon session starts in *2 hours* (02:00 PM) at our Clifton Flagship branch.\n\nComplimentary valet parking and artisan refreshments will be ready upon your arrival.\n\nReply 'CONFIRM' or 'DELAY 15' if you need a short grace period.`;
    } else if (type === "RECEIPT") {
      text = `🧾 *SHAY Luxury Collective · 80mm Digital E-Receipt*\n\nInvoice #: *SHAY-INV-2026-9041*\nDate: ${new Date().toISOString().split("T")[0]}\nGuest: Shayan Merchant\nBranch: Clifton Flagship\n\nItemized Breakdown:\n• Executive Grooming Suite: Rs. 4,500\n• Hydra-Glow Facial: Rs. 9,500\n\nSubtotal: Rs. 14,000\nSRB 13% SST Tax: Rs. 1,820\n*Total Paid:* Rs. 15,820 (Card Alfalah)\n\nSRB SNTN: 8941202-3\nThank you for choosing SHAY. Please share your experience: https://g.page/r/shay-salon/review`;
    }

    setMessages((prev) => [...prev, { sender: "bot", text, time: nowTime }]);
    setCopiedTrigger(type);
    setTimeout(() => setCopiedTrigger(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="WhatsApp Business API Automations"
        title="WhatsApp Confirmations, Reminders &amp; Digital Receipts"
        description="Instant appointment confirmations, automated 2-hour prior reminders, and post-checkout 80mm digital receipts"
      />

      {/* 3 Automated Templates Action Bar (What User Requested) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Template 1: Confirmation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B1B3D]">1. Booking Confirmation</h4>
              <p className="text-[10px] text-slate-500">Sent instantly after booking</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 line-clamp-2">
            Includes branch Google Maps link, stylist name, treatment date &amp; calendar details.
          </p>
          <button
            onClick={() => triggerAutomatedMessage("CONFIRMATION")}
            className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-3 h-3 text-emerald-600" />
            <span>{copiedTrigger === "CONFIRMATION" ? "Dispatched to Chat!" : "Simulate Confirmation"}</span>
          </button>
        </div>

        {/* Template 2: 2-Hour Reminder */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B1B3D]">2. 2-Hour Prior Reminder</h4>
              <p className="text-[10px] text-slate-500">Reduces no-shows to &lt; 2%</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 line-clamp-2">
            Alerts client 2 hours before scheduled slot with quick valet &amp; delay reply tags.
          </p>
          <button
            onClick={() => triggerAutomatedMessage("REMINDER")}
            className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition flex items-center justify-center gap-1.5"
          >
            <Bell className="w-3 h-3 text-amber-600" />
            <span>{copiedTrigger === "REMINDER" ? "Dispatched to Chat!" : "Simulate 2h Reminder"}</span>
          </button>
        </div>

        {/* Template 3: 80mm Digital E-Receipt */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B1B3D]">3. 80mm Digital Receipt</h4>
              <p className="text-[10px] text-slate-500">Sent on invoice payment</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 line-clamp-2">
            Itemized services, SRB 13% SST tax proof, and Google Reviews feedback link.
          </p>
          <button
            onClick={() => triggerAutomatedMessage("RECEIPT")}
            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3 h-3 text-blue-600" />
            <span>{copiedTrigger === "RECEIPT" ? "Dispatched to Chat!" : "Simulate Digital Slip"}</span>
          </button>
        </div>
      </div>

      {/* Interactive WhatsApp Device Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Settings & Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#0B1B3D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Gateway Integration</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Guest Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-[#F8FAFC]"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Twilio / Meta Cloud Connected</span>
              </p>
              <p className="text-[11px] text-emerald-700">
                Official Karachi Business Profile (Green Checkmark Verified).
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block mb-2">Interactive Quick Prompts</span>
              <div className="flex flex-wrap gap-1.5">
                {["hi", "1", "a", "yes", "deals", "branch", "menu"].map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(undefined, p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Realistic Smartphone Mockup */}
        <div className="md:col-span-2 flex justify-center">
          <div className="w-full max-w-sm rounded-[36px] bg-[#111B21] p-3 shadow-2xl border-4 border-slate-800 flex flex-col h-[560px]">
            {/* WhatsApp App Header */}
            <div className="bg-[#202C33] px-4 py-3 rounded-t-[28px] flex items-center justify-between text-white border-b border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-[#0A1931] flex items-center justify-center font-bold text-xs shrink-0">
                  SHAY
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs">SHAY Karachi Concierge</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Official Business Account</span>
                </div>
              </div>
              <button
                onClick={() =>
                  setMessages([
                    {
                      sender: "bot",
                      text: "👋 Welcome to SHAY Salon & Spa (Karachi) WhatsApp Concierge!\nType 'hi' or 'menu' to begin your luxury booking.",
                      time: "Just now",
                    },
                  ])
                }
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400"
                title="Reset Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0B141A] text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs whitespace-pre-wrap leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#005C4B] text-white rounded-br-xs"
                        : "bg-[#202C33] text-[#E9EDEF] rounded-bl-xs border border-slate-700/40"
                    }`}
                  >
                    <p className="text-xs">{m.text}</p>
                    <span className="text-[9px] text-slate-400 float-right mt-1 ml-2 font-mono">
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
                  <span>SHAY Concierge is typing...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => sendMessage(e)} className="p-2 bg-[#202C33] rounded-b-[28px] flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type 'hi', '1', or reply..."
                className="flex-1 bg-[#2A3942] text-white placeholder-slate-400 text-xs px-3.5 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                className="p-2 rounded-full bg-[#00A884] hover:bg-[#029071] text-white transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
