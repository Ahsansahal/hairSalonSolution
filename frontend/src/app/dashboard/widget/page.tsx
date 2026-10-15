"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code, Copy, Check, ExternalLink, Globe, Sparkles, Smartphone,
  Monitor, Layout, Palette, ArrowRight, Eye, ShieldCheck, CheckCircle2
} from "lucide-react";
import { PageHeader, Card, Stat } from "@/components/ui/card";

export default function WebsiteWidgetPage() {
  const [activeTab, setActiveTab] = useState<"simulator" | "snippets">("simulator");
  const [simulatorRoute, setSimulatorRoute] = useState<string>("/book");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [widgetTheme, setWidgetTheme] = useState("dark");
  const [buttonText, setButtonText] = useState("Book Luxury Treatment");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://shay.salon";
  const widgetUrl = `${baseUrl}/book${selectedBranch !== "all" ? `?branch=${selectedBranch}` : ""}`;

  const iframeSnippet = `<!-- SHAY Salon & Spa Luxury Booking Widget -->
<iframe
  src="${widgetUrl}"
  width="100%"
  height="750px"
  frameborder="0"
  style="border: none; border-radius: 20px; box-shadow: 0 20px 40px rgba(10,25,49,0.15);"
  allow="payment"
></iframe>`;

  const buttonSnippet = `<!-- SHAY Floating Booking Button Script -->
<script
  src="${baseUrl}/widget.js"
  data-salon="shay-karachi"
  data-button-text="${buttonText}"
  data-theme="${widgetTheme}"
  data-branch="${selectedBranch}"
  defer
></script>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Online Booking &amp; Client Acquisition"
        title="Website Booking Widget &amp; Embed Snippets"
        description="Embed high-converting online booking directly onto your existing salon website (WordPress, Wix, Squarespace, or Shopify)"
        actions={
          <Link
            href="/book"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 text-xs font-extrabold text-[#0A1931] shadow-md transition"
          >
            <span>Open Public Client Booking</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* 3 Value Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          label="Direct Web Bookings"
          value="24/7 Live"
          tone="brand"
          icon={<Globe className="w-4 h-4 text-blue-600" />}
        />
        <Stat
          label="Platform Compatibility"
          value="WordPress &amp; Wix"
          tone="success"
          icon={<Layout className="w-4 h-4 text-emerald-600" />}
        />
        <Stat
          label="Zero Commission Fees"
          value="100% Direct"
          tone="warning"
          icon={<Sparkles className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "simulator"
                ? "bg-[#0A1931] text-amber-400 shadow-md ring-2 ring-amber-400/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Interactive Mobile View Simulator</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/20 text-amber-300 font-extrabold uppercase">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab("snippets")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "snippets"
                ? "bg-[#0A1931] text-amber-400 shadow-md ring-2 ring-amber-400/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Code className="w-4 h-4 text-blue-400" />
            <span>Embed Codes &amp; Snippets</span>
          </button>
        </div>

        {activeTab === "simulator" && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-2">Simulate Screen:</span>
            <button
              onClick={() => setSimulatorRoute("/book")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                simulatorRoute === "/book" ? "bg-white text-[#0A1931] shadow-2xs" : "text-slate-600 hover:text-black"
              }`}
            >
              Guest Booking
            </button>
            <button
              onClick={() => setSimulatorRoute("/deals")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                simulatorRoute === "/deals" ? "bg-white text-[#0A1931] shadow-2xs" : "text-slate-600 hover:text-black"
              }`}
            >
              Deals &amp; Packages
            </button>
            <button
              onClick={() => setSimulatorRoute("/dashboard")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                simulatorRoute === "/dashboard" ? "bg-white text-[#0A1931] shadow-2xs" : "text-slate-600 hover:text-black"
              }`}
            >
              Staff Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Interactive Mobile Simulator */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left: Realistic iPhone Device Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[380px] bg-[#0A1931] rounded-[50px] p-3.5 shadow-2xl border-4 border-slate-800 ring-2 ring-amber-500/20">
              {/* Screen Container */}
              <div className="bg-white rounded-[38px] overflow-hidden relative border border-slate-700/40 flex flex-col h-[680px]">
                {/* Simulated Top iOS Island & Status Bar */}
                <div className="h-10 bg-[#0A1931] text-white flex items-center justify-between px-6 pt-1 select-none shrink-0 z-30">
                  <span className="text-[11px] font-bold tracking-tight">09:41</span>
                  {/* Dynamic Island Pill */}
                  <div className="w-20 h-4 bg-black rounded-full border border-slate-800" />
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-[9px] font-semibold">5G</span>
                    <div className="w-4 h-2 rounded-xs border border-white/80 p-0.5 flex items-center">
                      <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Simulated Safari / Chrome URL Bar */}
                <div className="bg-[#F8FAFC] px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
                  <span className="font-mono text-[10px] truncate text-slate-600">
                    shay.salon{simulatorRoute}
                  </span>
                  <a
                    href={`${baseUrl}${simulatorRoute}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 hover:text-amber-700 font-bold ml-2 flex items-center gap-1 shrink-0"
                    title="Open in new browser tab"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Live Responsive iFrame */}
                <iframe
                  src={`${baseUrl}${simulatorRoute}`}
                  className="w-full flex-1 border-none bg-white"
                  title="Mobile View Simulator"
                />

                {/* Home Indicator Bar */}
                <div className="h-4 bg-white flex items-center justify-center shrink-0">
                  <div className="w-28 h-1 bg-slate-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Where to View & Instructions */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Smartphone className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-base text-[#0B1B3D]">
                  3 Ways to Experience &amp; Test Mobile Views
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Method 1 */}
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-[#0A1931]">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-[#0A1931] text-[11px] flex items-center justify-center">
                      1
                    </span>
                    <span>Live Interactive Simulator (Left)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                    Use the iPhone simulator right next to this panel to test buttons, stylist selectors, date slots, and the mobile bottom navigation bar in real-time.
                  </p>
                </div>

                {/* Method 2 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-[#0A1931]">
                    <span className="w-5 h-5 rounded-full bg-[#0A1931] text-amber-400 text-[11px] flex items-center justify-center">
                      2
                    </span>
                    <span>Browser DevTools (Chrome / Edge / Safari)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                    Open any page, press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">F12</kbd> (or right click &rarr; Inspect), then press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">Ctrl + Shift + M</kbd> (Mac: <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">Cmd + Shift + M</kbd>). You can toggle between iPhone 14 Pro, Samsung Galaxy S20, iPad, or custom mobile dimensions.
                  </p>
                </div>

                {/* Method 3 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-[#0A1931]">
                    <span className="w-5 h-5 rounded-full bg-[#0A1931] text-amber-400 text-[11px] flex items-center justify-center">
                      3
                    </span>
                    <span>On Your Physical Phone (Wi-Fi or Cloud)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                    Once deployed to Vercel or running on your local network, scan the QR code or visit the site from mobile Safari or Chrome to experience native touch gestures.
                  </p>
                </div>
              </div>

              {/* Direct Quick Launch Links */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <Link
                  href="/book"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Open Client Booking (/book)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </Link>
                <Link
                  href="/deals"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Open Deals &amp; Packages (/deals)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Embed Code Generators */}
      {activeTab === "snippets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Customizer Controls */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-sm text-[#0B1B3D] flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-500" />
                <span>Widget Customization</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pre-Selected Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="all">Consolidated (Allow Guest to Choose)</option>
                  <option value="b1">Clifton Flagship Branch (Block 4)</option>
                  <option value="b2">DHA Bukhari Studio (Phase 6)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Floating Button Label</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color Theme</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setWidgetTheme("dark")}
                    className={`p-2.5 rounded-xl border font-bold text-left transition ${
                      widgetTheme === "dark"
                        ? "border-[#0A1931] bg-[#0A1931] text-amber-400"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    Midnight Luxe
                  </button>
                  <button
                    type="button"
                    onClick={() => setWidgetTheme("light")}
                    className={`p-2.5 rounded-xl border font-bold text-left transition ${
                      widgetTheme === "light"
                        ? "border-amber-500 bg-amber-50 text-amber-900"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    Rose Pearl
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mobile Responsive</span>
                </p>
                <p className="text-[11px] text-emerald-700">
                  Automatically adapts to iOS, Android, tablets, and desktop browsers.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Embed Code Generators */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Iframe Embed Code */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  <h3 className="font-serif font-bold text-sm text-[#0B1B3D]">
                    Option 1: Inline Website iFrame Embed
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(iframeSnippet, "iframe")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedType === "iframe" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy iFrame Code</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Paste this block into any HTML page, Elementor widget, or Custom HTML block in WordPress:
              </p>
              <pre className="p-3.5 rounded-xl bg-[#0A1931] text-amber-400 font-mono text-[11px] overflow-x-auto">
                {iframeSnippet}
              </pre>
            </div>

            {/* 2. Floating Pop-Up Button Script */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif font-bold text-sm text-[#0B1B3D]">
                    Option 2: Floating Sticky Booking Bubble
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(buttonSnippet, "script")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedType === "script" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Script Tag</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Adds a modern golden floating booking badge in the bottom right corner of your salon website:
              </p>
              <pre className="p-3.5 rounded-xl bg-[#0A1931] text-amber-400 font-mono text-[11px] overflow-x-auto">
                {buttonSnippet}
              </pre>
            </div>

            {/* 3. Direct Public URLs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Globe className="w-4 h-4 text-emerald-600" />
                <h3 className="font-serif font-bold text-sm text-[#0B1B3D]">
                  Option 3: Direct Booking &amp; Deals Links (For Instagram Bio &amp; WhatsApp)
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                  <span className="font-mono text-slate-700 truncate mr-2">{widgetUrl}</span>
                  <button
                    onClick={() => copyToClipboard(widgetUrl, "url-book")}
                    className="text-blue-600 font-bold hover:underline shrink-0"
                  >
                    {copiedType === "url-book" ? "Copied!" : "Copy Link"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                  <span className="font-mono text-slate-700 truncate mr-2">{baseUrl}/deals</span>
                  <button
                    onClick={() => copyToClipboard(`${baseUrl}/deals`, "url-deals")}
                    className="text-blue-600 font-bold hover:underline shrink-0"
                  >
                    {copiedType === "url-deals" ? "Copied!" : "Copy Deals Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
