"use client";

import { useState } from "react";
import { MessageSquare, Send, RefreshCw, Smartphone, Bot, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";
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

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setInputMsg("");
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: "user", text: userText, time: nowTime }]);
    setLoading(true);

    try {
      const res = await apiFetch("/webhooks/whatsapp/simulate/", {
        method: "POST",
        body: JSON.stringify({
          phone: phone,
          message: userText,
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

  const handleQuickReply = (cmd: string) => {
    setInputMsg(cmd);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <PageHeader
        eyebrow="Omnichannel Concierge"
        title="WhatsApp Booking Engine"
        description="Conversational booking state machine executing live scheduling algorithms with Meta Cloud API readiness"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="State Machine"
          value={sessionState}
          tone="brand"
          icon={<Bot className="h-4 w-4 text-[#a3214f]" />}
        />
        <Stat
          label="Webhook Security"
          value="SHA-256"
          tone="success"
          hint="Idempotent replay defense"
          icon={<ShieldCheck className="h-4 w-4 text-[#15803d]" />}
        />
        <Stat
          label="Meta Cloud API"
          value="Verified"
          tone="info"
          hint="Graph API v19.0"
          icon={<Sparkles className="h-4 w-4 text-[#1d5fbf]" />}
        />
        <Stat
          label="Active Engine"
          value="Live"
          tone="default"
          hint="Direct DB synchronization"
          icon={<Smartphone className="h-4 w-4 text-[#4a4250]" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Phone Frame */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden flex flex-col h-[650px] shadow-lg border-[#e7dfd8]">
            {/* Phone Header */}
            <div className="p-4 bg-[#075e54] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">SHAY Salon Concierge · Karachi</h3>
                  <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    <span>Verified Official Business (+92)</span>
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/20 text-white/90">
                {sessionState}
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow-xs ${
                      m.sender === "user"
                        ? "bg-[#dcf8c6] text-[#1b1520] rounded-tr-none border border-[#c5e6ad]"
                        : "bg-white text-[#1b1520] rounded-tl-none border border-[#e7dfd8]"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-[#7a7180] mt-1 px-1">{m.time}</span>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-[#7a7180] bg-white px-3 py-1.5 rounded-full w-fit border border-[#e7dfd8] shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#a3214f]" />
                  <span>Concierge is typing...</span>
                </div>
              )}
            </div>

            {/* Quick Reply Shortcuts */}
            <div className="p-2.5 bg-white border-t border-[#e7dfd8] flex gap-2 overflow-x-auto text-[11px]">
              <button
                onClick={() => handleQuickReply("hi")}
                className="px-3 py-1 rounded-lg bg-[#faf7f4] hover:bg-[#f2ece6] text-[#1b1520] border border-[#e7dfd8] whitespace-nowrap font-medium transition"
              >
                "hi" (Start)
              </button>
              <button
                onClick={() => handleQuickReply("1")}
                className="px-3 py-1 rounded-lg bg-[#faf7f4] hover:bg-[#f2ece6] text-[#1b1520] border border-[#e7dfd8] whitespace-nowrap font-medium transition"
              >
                "1" (Clifton Flagship)
              </button>
              <button
                onClick={() => handleQuickReply("2")}
                className="px-3 py-1 rounded-lg bg-[#faf7f4] hover:bg-[#f2ece6] text-[#1b1520] border border-[#e7dfd8] whitespace-nowrap font-medium transition"
              >
                "2" (DHA Bukhari)
              </button>
              <button
                onClick={() => handleQuickReply("1")}
                className="px-3 py-1 rounded-lg bg-[#faf7f4] hover:bg-[#f2ece6] text-[#1b1520] border border-[#e7dfd8] whitespace-nowrap font-medium transition"
              >
                "1" (Select Item)
              </button>
              <button
                onClick={() => handleQuickReply("Mahnoor Baloch")}
                className="px-3 py-1 rounded-lg bg-[#faf7f4] hover:bg-[#f2ece6] text-[#1b1520] border border-[#e7dfd8] whitespace-nowrap font-medium transition"
              >
                "Mahnoor Baloch"
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-[#e7dfd8] flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type reply or pick quick option..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] text-[#1b1520] text-xs focus:outline-none focus:ring-2 focus:ring-[#075e54]/20"
              />
              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#075e54] hover:bg-[#064e46] text-white text-xs font-semibold transition shadow-xs flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </Card>
        </div>

        {/* Right Column: Meta Cloud Architecture Card */}
        <Card className="p-5 space-y-4 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e7dfd8]">
            <Smartphone className="w-4 h-4 text-[#a3214f]" />
            <h3 className="font-serif font-bold text-sm text-[#1b1520]">Meta Cloud Integration</h3>
          </div>

          <div className="space-y-3 text-xs text-[#7a7180]">
            <p className="leading-relaxed">
              The salon conversational booking engine runs independently from delivery channels:
            </p>

            <div className="p-3.5 rounded-xl bg-[#faf7f4] border border-[#e7dfd8] space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#7a7180]">Webhook Path:</span>
                <span className="font-mono text-[#a3214f] font-semibold">/api/v1/webhooks/whatsapp/</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a7180]">Replay Protection:</span>
                <span className="text-emerald-700 font-medium">SHA-256 Event Dedup</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a7180]">Session Persistence:</span>
                <span className="text-[#1b1520] font-medium">Postgres / SQLite ORM</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fbe9ef] border border-[#f3cad8] text-[#a3214f] text-xs leading-relaxed">
              <strong>Production Deployment:</strong> Add <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">WHATSAPP_PHONE_NUMBER_ID</code> and <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">WHATSAPP_ACCESS_TOKEN</code> in your environment when connected to your live Meta Business Manager account.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
