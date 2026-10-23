"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Mic,
  Coins,
  Smartphone,
  Sparkles,
  ArrowRight,
  Radio,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MessageSquare,
  FileText,
  Play,
  Share2,
  Users,
  Clock,
  ChevronRight,
  Download,
  Check,
  Headphones,
  Award
} from "lucide-react";

export default function HomePage() {
  const [activeSimTab, setActiveSimTab] = useState<"trans" | "summary" | "actions" | "insights">("trans");

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#0A1633] flex flex-col font-sans selection:bg-[#1E4FFF] selection:text-white">
      {/* 00. Top Ecosystem Bar (from aiagent main / mom.astro) */}
      <div className="bg-[#0A1633] text-white/70 text-[11.5px] py-1.5 border-b border-white/10 hidden sm:block">
        <div className="max-w-[1240px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C2D1] animate-pulse"></span>
            <span className="text-[#64B5F6] font-bold">Cardi Agent AI Ecosystem</span>
            <span className="text-white/30">•</span>
            <span className="text-white/80">Solusi AI Meeting Intelligence &amp; Smart NFC Pertama di Indonesia</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="https://aiagent.cardi.co.id" target="_blank" className="hover:text-white transition flex items-center gap-1">
              Cardi Agent <ExternalLink className="w-3 h-3 text-white/50" />
            </Link>
            <span className="text-white/30">|</span>
            <Link href="https://aiagent.cardi.co.id/mom" target="_blank" className="text-white hover:text-[#00C2D1] transition flex items-center gap-1">
              Cardi MoM AI
            </Link>
            <span className="text-white/30">|</span>
            <span className="text-[#00C2D1] font-bold">Cardi Smart Card NFC</span>
          </div>
        </div>
      </div>

      {/* 01. Sticky Header / Navbar (Clean Glassmorphism) */}
      <header className="sticky top-2 z-50 max-w-[1240px] mx-auto px-4 w-full">
        <div className="bg-white/95 backdrop-blur-md border border-[#E6ECF7] rounded-2xl shadow-[0_8px_30px_rgba(10,22,51,0.06)] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0258A4] to-[#1E4FFF] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#1E4FFF]/25">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-[#0A1633] leading-none">
                  Cardi <span className="text-[#1E4FFF]">MoM</span>
                </span>
                <span className="text-[10px] text-[#6B7A9C] font-semibold tracking-wider uppercase">
                  Smart NFC &amp; AI
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-[#3D4B6B]">
            <a href="#fitur" className="hover:text-[#1E4FFF] transition">Fitur Rapat</a>
            <a href="#cara-kerja" className="hover:text-[#1E4FFF] transition">Cara Kerja</a>
            <a href="#hardware-card" className="hover:text-[#1E4FFF] transition flex items-center gap-1.5">
              <span>Kartu NFC</span>
              <span className="bg-[#1E4FFF]/10 text-[#1E4FFF] text-[10px] px-1.5 py-0.5 rounded font-bold">NTAG215</span>
            </a>
            <a href="#mobile-app" className="hover:text-[#1E4FFF] transition">Aplikasi Mobile</a>
            <a href="#harga" className="hover:text-[#1E4FFF] transition">Skema Koin</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/deo"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4FFF] bg-[#EEF4FF] hover:bg-[#1E4FFF]/15 px-3.5 py-2 rounded-xl transition"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Simulasi Tap Kartu</span>
            </Link>
            <Link
              href="/dashboard/card"
              className="bg-[#1E4FFF] hover:bg-[#153DCC] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#1E4FFF]/25 transition flex items-center gap-1.5"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 02. Hero Section with Blueprint Grid */}
      <section className="relative grid-bg pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <div className="eyebrow-badge mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#1E4FFF]" />
                <span>AI MEETING INTELLIGENCE &amp; SMART NFC</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-black tracking-tight text-[#0A1633] leading-[1.14] mb-5">
                Ubah Waktu Rapat Jadi <br />
                <span className="text-[#1E4FFF]">Tindakan Nyata</span> &amp; Eksekusi Cepat.
              </h1>

              <p className="text-[#3D4B6B] text-base leading-relaxed mb-7 max-w-xl">
                Cardi MoM &amp; Smart Business Card merekam suara, mentranskripsi dialek Indonesia/Jaksel, merangkum poin krusial, dan membagikan notula resmi ke WhatsApp serta kalender — cukup dengan satu tap kartu NFC di meja rapat.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
                <Link
                  href="/dashboard/mom"
                  className="w-full sm:w-auto bg-[#1E4FFF] hover:bg-[#153DCC] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1E4FFF]/25 flex items-center justify-center gap-2 transition"
                >
                  <Mic className="w-4 h-4" />
                  <span>Mulai Rekam Rapat AI</span>
                </Link>

                <Link
                  href="/dashboard/card"
                  className="w-full sm:w-auto bg-white hover:bg-[#F5F8FE] border border-[#E6ECF7] text-[#0A1633] px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <CreditCard className="w-4 h-4 text-[#1E4FFF]" />
                  <span>Kelola Kartu NFC Anda</span>
                </Link>
              </div>

              {/* Mobile Store Notice & Badges */}
              <div className="pt-4 border-t border-[#E6ECF7] w-full flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-xs font-bold text-[#6B7A9C] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#1E4FFF]" />
                  Tersedia di Smartphone:
                </span>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white border border-[#E6ECF7] rounded-lg text-xs font-semibold text-[#0A1633] flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    <span>Google Play Store</span>
                  </div>
                  <div className="px-3 py-1 bg-white border border-[#E6ECF7] rounded-lg text-xs font-semibold text-[#0A1633] flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    <span>Apple App Store</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Simulator Column (Exact replica from mom.astro) */}
            <div className="lg:col-span-6">
              <div className="relative">
                {/* Background ambient glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#1E4FFF]/20 via-[#00C2D1]/20 to-[#0258A4]/20 rounded-3xl blur-2xl opacity-70"></div>

                {/* Simulator Window */}
                <div className="relative bg-white border border-[#E6ECF7] rounded-2xl shadow-[0_20px_50px_rgba(10,22,51,0.12)] overflow-hidden">
                  {/* Window Top Bar */}
                  <div className="bg-[#0A1633] text-white p-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1E4FFF] flex items-center justify-center text-white shadow-sm">
                        <Mic className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-white">Rapat Koordinasi Roadmap Q3</strong>
                          <span className="bg-[#EF4444] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> Live
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60">Hari ini, 10:00 • 48:12 • Hybrid (NFC Tap + Online)</p>
                      </div>
                    </div>
                    {/* Avatars */}
                    <div className="flex -space-x-1.5">
                      <div className="w-7 h-7 rounded-full bg-[#1E4FFF] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A1633]">DI</div>
                      <div className="w-7 h-7 rounded-full bg-[#00C2D1] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A1633]">RA</div>
                      <div className="w-7 h-7 rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A1633]">SA</div>
                      <div className="w-7 h-7 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A1633]">+2</div>
                    </div>
                  </div>

                  {/* Simulator Tabs */}
                  <div className="bg-[#F5F8FE] border-b border-[#E6ECF7] px-4 flex gap-6 text-xs font-bold text-[#6B7A9C]">
                    <button
                      onClick={() => setActiveSimTab("trans")}
                      className={`py-3 border-b-2 transition ${activeSimTab === "trans" ? "border-[#1E4FFF] text-[#1E4FFF]" : "border-transparent hover:text-[#0A1633]"}`}
                    >
                      Transkripsi Live
                    </button>
                    <button
                      onClick={() => setActiveSimTab("summary")}
                      className={`py-3 border-b-2 transition ${activeSimTab === "summary" ? "border-[#1E4FFF] text-[#1E4FFF]" : "border-transparent hover:text-[#0A1633]"}`}
                    >
                      Rangkuman AI
                    </button>
                    <button
                      onClick={() => setActiveSimTab("actions")}
                      className={`py-3 border-b-2 transition ${activeSimTab === "actions" ? "border-[#1E4FFF] text-[#1E4FFF]" : "border-transparent hover:text-[#0A1633]"}`}
                    >
                      Action Items (4)
                    </button>
                  </div>

                  {/* Simulator Body */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Transcript or Active View */}
                    <div className="md:col-span-7 flex flex-col gap-3.5">
                      {activeSimTab === "trans" && (
                        <>
                          <div className="flex gap-2.5 items-start">
                            <span className="w-6 h-6 rounded-md bg-[#1E4FFF]/15 text-[#1E4FFF] text-[10px] font-bold flex items-center justify-center shrink-0">DI</span>
                            <div>
                              <div className="text-[11px] font-bold text-[#0A1633]">Diana (Product) <span className="text-[#6B7A9C] font-normal">10:01</span></div>
                              <p className="text-xs text-[#3D4B6B] mt-0.5 leading-snug">Target Q3 adalah menghubungkan NFC card fisik langsung ke sinkronisasi notula meeting.</p>
                            </div>
                          </div>

                          <div className="flex gap-2.5 items-start">
                            <span className="w-6 h-6 rounded-md bg-[#00C2D1]/20 text-[#008764] text-[10px] font-bold flex items-center justify-center shrink-0">RA</span>
                            <div>
                              <div className="text-[11px] font-bold text-[#0A1633]">Rafi (Tech Lead) <span className="text-[#6B7A9C] font-normal">10:02</span></div>
                              <p className="text-xs text-[#3D4B6B] mt-0.5 leading-snug">Modul Web NFC API NTAG215 dan sinkronisasi saldo koin bersama sudah siap diuji.</p>
                            </div>
                          </div>

                          <div className="flex gap-2.5 items-start">
                            <span className="w-6 h-6 rounded-md bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold flex items-center justify-center shrink-0">SA</span>
                            <div>
                              <div className="text-[11px] font-bold text-[#0A1633]">Sarah (Design) <span className="text-[#6B7A9C] font-normal">10:03</span></div>
                              <p className="text-xs text-[#3D4B6B] mt-0.5 leading-snug">Desain vCard export dan halaman publik NFC sudah diselaraskan ke brand standard.</p>
                            </div>
                          </div>

                          {/* Live Audio Waveform Animation */}
                          <div className="mt-3 p-3 bg-[#F5F8FE] rounded-xl border border-[#E6ECF7] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 h-6">
                              {[8, 18, 28, 14, 22, 30, 12, 26, 18, 24, 10, 20, 32, 16].map((h, i) => (
                                <span
                                  key={i}
                                  className="w-1 bg-[#1E4FFF] rounded-full animate-wave-bar"
                                  style={{ animationDelay: `${i * 0.08}s` }}
                                ></span>
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-[#1E4FFF] flex items-center gap-1">
                              <Radio className="w-3 h-3 animate-spin" /> Live audio stream
                            </span>
                          </div>
                        </>
                      )}

                      {activeSimTab === "summary" && (
                        <div className="p-3 bg-[#EEF4FF] rounded-xl border border-[#1E4FFF]/20 text-xs text-[#0A1633] space-y-2">
                          <p className="font-bold text-[#1E4FFF]">Ringkasan Eksekutif AI:</p>
                          <p className="text-[#3D4B6B] leading-relaxed">
                            Rapat menyepakati peluncuran ekosistem smart NFC kartu nama yang terintegrasi langsung dengan perekaman notula rapat Cardi MoM. Tim teknis mengonfirmasi kompatibilitas NTAG215 dan sinkronisasi koin bersama.
                          </p>
                        </div>
                      )}

                      {activeSimTab === "actions" && (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-[#F5F8FE] rounded-lg border border-[#E6ECF7] text-xs flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                            <span className="font-bold text-[#0A1633]">Rafi:</span>
                            <span className="text-[#3D4B6B]">Deploy Web NFC writer NTAG215</span>
                          </div>
                          <div className="p-2.5 bg-[#F5F8FE] rounded-lg border border-[#E6ECF7] text-xs flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                            <span className="font-bold text-[#0A1633]">Diana:</span>
                            <span className="text-[#3D4B6B]">Finalisasi pricing skema koin</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Panel Inside Simulator */}
                    <div className="md:col-span-5 flex flex-col gap-3">
                      <div className="p-3.5 bg-[#F8FAFD] border border-[#E6ECF7] rounded-xl">
                        <div className="text-[11px] font-bold text-[#0A1633] uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Action Items</span>
                          <span className="text-[#1E4FFF] text-[10px]">Auto-Sync</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-[#3D4B6B]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1E4FFF]"></div>
                            <span className="line-clamp-1">Kirim notula ke grup WhatsApp</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00C2D1]"></div>
                            <span className="line-clamp-1">Simpan kontak klien via NFC</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                            <span className="line-clamp-1">Sinkronisasi kalender Google</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#F8FAFD] border border-[#E6ECF7] rounded-xl">
                        <div className="text-[11px] font-bold text-[#0A1633] uppercase tracking-wider mb-2">
                          Kontribusi Pembicara
                        </div>
                        <div className="space-y-2 text-[11px]">
                          <div>
                            <div className="flex justify-between text-[#6B7A9C] mb-1">
                              <span>Diana (Product)</span>
                              <span className="font-bold text-[#0A1633]">46%</span>
                            </div>
                            <div className="w-full bg-[#E6ECF7] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#1E4FFF] h-full rounded-full w-[46%]"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[#6B7A9C] mb-1">
                              <span>Rafi (Eng)</span>
                              <span className="font-bold text-[#0A1633]">32%</span>
                            </div>
                            <div className="w-full bg-[#E6ECF7] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#00C2D1] h-full rounded-full w-[32%]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 03. Proof Bar (Matched to aiagent main proof bar) */}
      <section className="bg-white border-y border-[#E6ECF7] py-8">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl lg:text-4xl font-black text-[#1E4FFF] tracking-tight">99.2%</span>
              <span className="text-xs text-[#6B7A9C] font-semibold mt-1">Akurasi Transkripsi Dialek Indonesia</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl lg:text-4xl font-black text-[#0A1633] tracking-tight">&lt; 90 dtk</span>
              <span className="text-xs text-[#6B7A9C] font-semibold mt-1">Dari Rekaman ke Notula &amp; WhatsApp</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl lg:text-4xl font-black text-[#1E4FFF] tracking-tight">10.000+</span>
              <span className="text-xs text-[#6B7A9C] font-semibold mt-1">Menit Rapat Tim Diproses / Bulan</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl lg:text-4xl font-black text-[#10B981] tracking-tight">0</span>
              <span className="text-xs text-[#6B7A9C] font-semibold mt-1">Action Items yang Terlewat</span>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Hardware Showcase: Smart NFC Business Card */}
      <section id="hardware-card" className="py-20 bg-[#F5F8FE] border-b border-[#E6ECF7]">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="eyebrow-badge mb-3">
              <CreditCard className="w-3.5 h-3.5 text-[#1E4FFF]" />
              <span>NFC HARDWARE INTEGRATION</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A1633] tracking-tight">
              Cardi Smart Business Card. <br />
              <span className="text-[#1E4FFF]">Bukan Sekadar Kartu Nama Biasa.</span>
            </h2>
            <p className="text-[#3D4B6B] text-sm sm:text-base mt-3">
              Tempelkan kartu ke ponsel rekan bisnis Anda. Kontak langsung tersimpan (.vcf), profil Anda terbuka, dan obrolan rapat bisa langsung direkam oleh Cardi MoM AI.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Interactive Card Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[360px] aspect-[1.586/1] bg-gradient-to-br from-[#0A1633] via-[#0E1E42] to-[#0258A4] rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden border border-white/10 flex flex-col justify-between group hover:scale-[1.02] transition duration-300">
                <div className="absolute top-0 right-0 w-44 h-44 bg-[#1E4FFF]/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#1E4FFF] flex items-center justify-center font-black text-xs">C</div>
                    <span className="font-extrabold tracking-tight text-sm">CARDI SMART CARD</span>
                  </div>
                  <Radio className="w-5 h-5 text-[#00C2D1] animate-pulse" />
                </div>

                <div className="relative z-10">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#93C5FD]">NFC TAP &amp; CONNECT</div>
                  <div className="text-xl font-black mt-0.5 tracking-wide">Deo Cardi Nathanael</div>
                  <div className="text-xs text-white/70">Founder &amp; CEO, Cardi Nusantara</div>
                </div>

                <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/10">
                  <div className="text-[10px] font-mono text-white/50">CHIP: NTAG215 (504 Bytes)</div>
                  <span className="text-[10px] bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] font-bold px-2 py-0.5 rounded-full">
                    Active &amp; Linked
                  </span>
                </div>
              </div>
            </div>

            {/* Features of the NFC Card */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E6ECF7] shadow-sm hover:border-[#1E4FFF]/30 transition">
                <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#1E4FFF] flex items-center justify-center mb-3">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#0A1633] mb-1">Tap Sekali Tanpa Aplikasi</h3>
                <p className="text-xs text-[#3D4B6B] leading-relaxed">
                  Penerima tidak perlu instal aplikasi apapun. Web NFC dan QR code membuka profil instan di iOS &amp; Android.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E6ECF7] shadow-sm hover:border-[#1E4FFF]/30 transition">
                <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#1E4FFF] flex items-center justify-center mb-3">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#0A1633] mb-1">Simpan vCard (.vcf) Otomatis</h3>
                <p className="text-xs text-[#3D4B6B] leading-relaxed">
                  Satu tombol langsung mengunduh nomor telepon, email, dan jabatan ke buku kontak telepon penerima.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E6ECF7] shadow-sm hover:border-[#1E4FFF]/30 transition">
                <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#1E4FFF] flex items-center justify-center mb-3">
                  <Mic className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#0A1633] mb-1">Mulai Rekam Rapat di Tempat</h3>
                <p className="text-xs text-[#3D4B6B] leading-relaxed">
                  Langsung luncurkan recorder notula rapat MoM saat bertatap muka tanpa repot buka aplikasi lain.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E6ECF7] shadow-sm hover:border-[#1E4FFF]/30 transition">
                <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#1E4FFF] flex items-center justify-center mb-3">
                  <Coins className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#0A1633] mb-1">Satu Dompet Koin Bersama</h3>
                <p className="text-xs text-[#3D4B6B] leading-relaxed">
                  Saldo koin akun di aplikasi mobile MoM (Play Store / App Store) terhubung ke dashboard web kartu Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05. Cara Kerja (Workflow 5 Steps from aiagent main) */}
      <section id="cara-kerja" className="py-20 bg-white border-b border-[#E6ECF7]">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="eyebrow-badge mb-3">
              <span>ALUR KERJA OTOMATIS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A1633] tracking-tight">
              Dari Rekaman ke Notula, <br />
              <span className="text-[#1E4FFF]">Tanpa Perlu Catat Manual.</span>
            </h2>
            <p className="text-[#3D4B6B] text-sm sm:text-base mt-3">
              Alur cerdas membebaskan tim Anda dari beban administrasi rapat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-[#F8FAFD] p-5 rounded-2xl border border-[#E6ECF7] relative">
              <span className="font-mono text-xs font-black text-[#1E4FFF] bg-[#EEF4FF] px-2 py-0.5 rounded">01</span>
              <h3 className="font-bold text-sm text-[#0A1633] mt-3 mb-1">Rekam / Tap NFC</h3>
              <p className="text-xs text-[#3D4B6B] leading-relaxed">
                Rekam langsung via web, tap kartu NFC, atau rekam di HP via app Cardi MoM.
              </p>
            </div>

            <div className="bg-[#F8FAFD] p-5 rounded-2xl border border-[#E6ECF7] relative">
              <span className="font-mono text-xs font-black text-[#1E4FFF] bg-[#EEF4FF] px-2 py-0.5 rounded">02</span>
              <h3 className="font-bold text-sm text-[#0A1633] mt-3 mb-1">Transkripsi Cerdas</h3>
              <p className="text-xs text-[#3D4B6B] leading-relaxed">
                Audio diubah menjadi teks akurat dengan pemisahan pembicara (speaker diarization).
              </p>
            </div>

            <div className="bg-[#F8FAFD] p-5 rounded-2xl border border-[#E6ECF7] relative">
              <span className="font-mono text-xs font-black text-[#1E4FFF] bg-[#EEF4FF] px-2 py-0.5 rounded">03</span>
              <h3 className="font-bold text-sm text-[#0A1633] mt-3 mb-1">Sintesis Notula</h3>
              <p className="text-xs text-[#3D4B6B] leading-relaxed">
                AI merangkum ringkasan eksekutif, keputusan penting, PIC, dan deadline.
              </p>
            </div>

            <div className="bg-[#F8FAFD] p-5 rounded-2xl border border-[#E6ECF7] relative">
              <span className="font-mono text-xs font-black text-[#1E4FFF] bg-[#EEF4FF] px-2 py-0.5 rounded">04</span>
              <h3 className="font-bold text-sm text-[#0A1633] mt-3 mb-1">Distribusi WhatsApp</h3>
              <p className="text-xs text-[#3D4B6B] leading-relaxed">
                Notula formal langsung dibagikan ke WhatsApp dan email peserta rapat.
              </p>
            </div>

            <div className="bg-[#F8FAFD] p-5 rounded-2xl border border-[#E6ECF7] relative">
              <span className="font-mono text-xs font-black text-[#1E4FFF] bg-[#EEF4FF] px-2 py-0.5 rounded">05</span>
              <h3 className="font-bold text-sm text-[#0A1633] mt-3 mb-1">Eskalasi Task AI</h3>
              <p className="text-xs text-[#3D4B6B] leading-relaxed">
                Action item otomatis masuk ke jadwal kalender follow-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 06. Mobile App Integration Section */}
      <section id="mobile-app" className="py-20 bg-[#0A1633] text-white">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-[#00C2D1] mb-4">
                <Smartphone className="w-3.5 h-3.5" />
                <span>MOBILE APP SYNC</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-4">
                Hubungkan Akun Aplikasi MoM <br />
                <span className="text-[#00C2D1]">Play Store &amp; App Store</span> ke Kartu Anda.
              </h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
                Cukup scan QR code pairing di dashboard kartu web atau masukkan email akun aplikasi mobile Anda. Semua riwayat rekaman notula, kontak leads yang di-tap, dan saldo koin otomatis tersinkronisasi secara real-time.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#00C2D1]" />
                  <span className="text-sm font-semibold text-white/90">Satu kali pairing via OTP email / scan barcode kamera HP</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#00C2D1]" />
                  <span className="text-sm font-semibold text-white/90">Saldo koin otomatis terpotong saat rekam di web maupun ponsel</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#00C2D1]" />
                  <span className="text-sm font-semibold text-white/90">Ekspor notula langsung ke WhatsApp kontak hasil tap kartu</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/wallet"
                  className="bg-[#00C2D1] hover:bg-[#00A8B8] text-[#0A1633] px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg transition flex items-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  <span>Cek Pairing &amp; Saldo Koin</span>
                </Link>
                <Link
                  href="/deo"
                  target="_blank"
                  className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2"
                >
                  <span>Lihat Demo Profil Publik</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[320px] bg-gradient-to-b from-[#0E1E42] to-[#0A1633] p-6 rounded-3xl border border-white/15 shadow-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1E4FFF] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#1E4FFF]/30">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-white mb-1">Cardi MoM Mobile</h4>
                <p className="text-xs text-white/60 mb-5">Tersedia untuk Android &amp; iOS</p>
                <div className="space-y-2.5">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-left flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Google Play Store</span>
                    <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] font-bold px-2 py-0.5 rounded">Rilis</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-left flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Apple App Store</span>
                    <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] font-bold px-2 py-0.5 rounded">Rilis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07. Skema Harga & Koin (Pricing Table from aiagent main) */}
      <section id="harga" className="py-20 bg-white border-b border-[#E6ECF7]">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="eyebrow-badge mb-3">
              <span>SKEMA HARGA &amp; KOIN</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A1633] tracking-tight">
              Mulai Rp 99 Ribu. <br />
              <span className="text-[#1E4FFF]">Sederhana, Transparan, &amp; Fleksibel.</span>
            </h2>
            <p className="text-[#3D4B6B] text-sm sm:text-base mt-3">
              Gunakan sistem koin bersama. 1 jam rekaman rapat = 10 koin. Top-up saldo koin kapan saja sesuai kebutuhan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-[#F8FAFD] p-6 rounded-2xl border border-[#E6ECF7] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#6B7A9C] uppercase tracking-wider">Starter</span>
                <div className="text-2xl font-black text-[#0A1633] mt-2 mb-1">Rp 99.000 <span className="text-xs font-normal text-[#6B7A9C]">/ bln</span></div>
                <p className="text-xs text-[#3D4B6B] mb-5">Cocok untuk profesional &amp; freelancer.</p>
                <div className="space-y-2 text-xs text-[#3D4B6B]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>100 Koin Rapat (~10 jam rekaman)</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>1 Smart NFC Card Fisik</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Ekspor Notula ke WhatsApp</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Download Profil vCard .vcf</span></div>
                </div>
              </div>
              <Link href="/dashboard/wallet" className="mt-6 w-full py-2.5 rounded-xl bg-white border border-[#E6ECF7] hover:bg-[#EEF4FF] text-[#1E4FFF] font-bold text-xs text-center transition">
                Pilih Starter
              </Link>
            </div>

            {/* Business (Popular) */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#1E4FFF] shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3 right-6 bg-[#1E4FFF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Paling Populer
              </span>
              <div>
                <span className="text-xs font-bold text-[#1E4FFF] uppercase tracking-wider">Business Pro</span>
                <div className="text-2xl font-black text-[#0A1633] mt-2 mb-1">Rp 299.000 <span className="text-xs font-normal text-[#6B7A9C]">/ bln</span></div>
                <p className="text-xs text-[#3D4B6B] mb-5">Untuk tim manajerial &amp; konsultan bisnis.</p>
                <div className="space-y-2 text-xs text-[#3D4B6B]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E4FFF]" /> <span>400 Koin Rapat (~40 jam rekaman)</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E4FFF]" /> <span>3 Smart NFC Card Fisik Custom</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E4FFF]" /> <span>Multi-speaker Diarization</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E4FFF]" /> <span>Sinkronisasi Google Calendar</span></div>
                </div>
              </div>
              <Link href="/dashboard/wallet" className="mt-6 w-full py-2.5 rounded-xl bg-[#1E4FFF] hover:bg-[#153DCC] text-white font-bold text-xs text-center transition shadow-md shadow-[#1E4FFF]/25">
                Mulai Business Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-[#F8FAFD] p-6 rounded-2xl border border-[#E6ECF7] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#6B7A9C] uppercase tracking-wider">Enterprise</span>
                <div className="text-2xl font-black text-[#0A1633] mt-2 mb-1">Custom <span className="text-xs font-normal text-[#6B7A9C]">/ tim</span></div>
                <p className="text-xs text-[#3D4B6B] mb-5">Untuk korporasi dan institusi skala besar.</p>
                <div className="space-y-2 text-xs text-[#3D4B6B]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Koin Tanpa Batas / Kuota Besar</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Kartu NFC Fisik Metal / Custom Logo</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Integrasi API &amp; Webhook ERP</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Dedicated Account Manager</span></div>
                </div>
              </div>
              <Link href="https://wa.me/6281289895646" target="_blank" className="mt-6 w-full py-2.5 rounded-xl bg-white border border-[#E6ECF7] hover:bg-[#EEF4FF] text-[#0A1633] font-bold text-xs text-center transition">
                Hubungi Sales via WA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 08. Footer (Matched to aiagent main & mom.astro) */}
      <footer className="bg-[#0A1633] text-white border-t border-white/10 pt-16 pb-12">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#1E4FFF] flex items-center justify-center font-black text-sm">C</div>
                <span className="text-lg font-black tracking-tight">Cardi MoM &amp; Smart NFC</span>
              </div>
              <p className="text-xs text-white/70 max-w-sm leading-relaxed mb-4">
                Ekosistem kartu nama pintar NFC terintegrasi otomatis dengan AI Minutes of Meeting (MoM). Rapat selesai, notula beres, relasi bisnis terjaga.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] font-semibold text-[#00C2D1]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enkripsi Standar Korporasi · Data Rapat Aman</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Navigasi</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><a href="#fitur" className="hover:text-white transition">Fitur MoM</a></li>
                <li><a href="#cara-kerja" className="hover:text-white transition">Cara Kerja</a></li>
                <li><a href="#hardware-card" className="hover:text-white transition">Kartu NFC</a></li>
                <li><a href="#harga" className="hover:text-white transition">Skema Koin</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Aplikasi &amp; Demo</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><Link href="/deo" target="_blank" className="hover:text-white transition">Demo Tap Kartu</Link></li>
                <li><Link href="/dashboard/card" className="hover:text-white transition">Dashboard Kartu</Link></li>
                <li><Link href="/dashboard/mom" className="hover:text-white transition">Recorder MoM</Link></li>
                <li><Link href="/dashboard/wallet" className="hover:text-white transition">Top-Up Koin</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Ekosistem Cardi</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><a href="https://cardi.co.id" target="_blank" className="hover:text-white transition">Cardi Indonesia Official</a></li>
                <li><a href="https://aiagent.cardi.co.id" target="_blank" className="hover:text-white transition">Cardi AI Agent Platform</a></li>
                <li><a href="https://aiagent.cardi.co.id/mom" target="_blank" className="hover:text-white transition">Cardi MoM Web Landing</a></li>
                <li><a href="https://wa.me/6281289895646" target="_blank" className="hover:text-white transition">WhatsApp Support Tim</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-white/50 gap-4">
            <div>
              &copy; 2026 PT Cardi Nusantara AI. Seluruh Hak Cipta Dilindungi.
            </div>
            <div className="flex gap-4">
              <span>Keamanan &amp; Privasi</span>
              <span>Syarat &amp; Ketentuan</span>
              <span>Dokumentasi API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
