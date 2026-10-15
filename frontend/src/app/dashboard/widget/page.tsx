"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code, Copy, Check, ExternalLink, Globe, Sparkles, Smartphone,
  Monitor, Layout, Palette, ArrowRight, Eye, ShieldCheck, CheckCircle2
} from "lucide-react";
import { PageHeader, Card, Stat } from "@/components/ui/card";

export default function WebsiteWidgetPage() {
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

      {/* Widget Customizer & Embed Code Grid */}
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
    </div>
  );
}
