"use client";

import React, { useState, useRef } from "react";
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
  Award,
  Zap,
  Rotate3d,
  Layers,
  Send,
} from "lucide-react";

export default function HomePage() {
  const [activeHeroTab, setActiveHeroTab] = useState<"card" | "mom">("card");
  const [activeSimTab, setActiveSimTab] = useState<"trans" | "summary" | "actions">("summary");
  const [isSimulatingTap, setIsSimulatingTap] = useState(false);
  const [tapStep, setTapStep] = useState<"idle" | "tapping" | "success">("idle");

  // Hero Card 3D Tilt Effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [sheen, setSheen] = useState({ x: 50, y: 50 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotX(-((y - centerY) / centerY) * 14);
    setRotY(((x - centerX) / centerX) * 16);
    setSheen({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleCardMouseLeave = () => {
    setRotX(0);
    setRotY(0);
  };

  const triggerTapSimulation = () => {
    setTapStep("tapping");
    setIsSimulatingTap(true);
    setTimeout(() => {
      setTapStep("success");
      setTimeout(() => {
        setTapStep("idle");
        setIsSimulatingTap(false);
      }, 4000);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#0A1633] flex flex-col font-sans selection:bg-[#1E4FFF] selection:text-white">
      
      {/* 00. Top Ecosystem Announcement Bar */}
      <div className="bg-[#070D1E] text-white/70 text-[11px] py-1.5 border-b border-white/10 hidden sm:block">
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

      {/* 01. Sticky Header / Navbar */}
      <header className="sticky top-2 z-50 max-w-[1240px] mx-auto px-4 w-full">
        <div className="bg-white/90 backdrop-blur-xl border border-[#E6ECF7] rounded-2xl shadow-[0_10px_35px_rgba(10,22,51,0.06)] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0258A4] via-[#1E4FFF] to-[#00C2D1] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#1E4FFF]/25 group-hover:scale-105 transition">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-[#0A1633] leading-none">
                  Cardi <span className="text-[#1E4FFF]">Smart NFC</span>
                </span>
                <span className="text-[10px] text-[#6B7A9C] font-semibold tracking-wider uppercase mt-0.5">
                  &amp; AI MoM Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-[#3D4B6B]">
            <a href="#fitur-nfc" className="hover:text-[#1E4FFF] transition">Fitur Kartu</a>
            <a href="#cara-kerja" className="hover:text-[#1E4FFF] transition">Alur Rapat AI</a>
            <a href="#hardware-card" className="hover:text-[#1E4FFF] transition flex items-center gap-1.5">
              <span>Spesifikasi Chip</span>
              <span className="bg-[#1E4FFF]/10 text-[#1E4FFF] text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">NTAG215</span>
            </a>
            <a href="#mobile-app" className="hover:text-[#1E4FFF] transition">Aplikasi Mobile</a>
            <a href="#harga" className="hover:text-[#1E4FFF] transition">Skema Koin</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/deo"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4FFF] bg-[#EEF4FF] hover:bg-[#1E4FFF]/15 px-3.5 py-2 rounded-xl transition btn-press"
            >
              <Radio className="w-3.5 h-3.5 text-[#1E4FFF] animate-pulse" />
              <span>Simulasi Tap Kartu</span>
            </Link>
            <Link
              href="/dashboard/card"
              className="bg-[#1E4FFF] hover:bg-[#153DCC] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#1E4FFF]/25 transition flex items-center gap-1.5 btn-press"
            >
              <span>Dashboard Kartu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 02. HERO SECTION */}
      <section className="relative grid-bg pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden ambient-glow">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <div className="eyebrow-badge mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#1E4FFF]" />
                <span>NFC SMART CARD + AI MINUTES OF MEETING</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[45px] font-black tracking-tight text-[#0A1633] leading-[1.12] mb-5">
                Sekali Tap Kartu, <br />
                <span className="text-[#1E4FFF]">Simpan Kontak</span> &amp; Rekam Notula Rapat AI.
              </h1>

              <p className="text-[#3D4B6B] text-base leading-relaxed mb-6 max-w-xl">
                Tinggalkan kartu nama kertas kuno. Cardi menggabungkan kartu bisnis NFC fisik kelas eksekutif dengan kecerdasan AI MoM. Simpan kontak (.vcf) instan, rekam suara rapat, dan bagikan notula resmi ke WhatsApp tanpa catat manual.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-7 w-full sm:w-auto">
                <Link
                  href="/deo"
                  target="_blank"
                  className="w-full sm:w-auto bg-[#1E4FFF] hover:bg-[#153DCC] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-[#1E4FFF]/25 flex items-center justify-center gap-2 transition btn-press"
                >
                  <Radio className="w-4 h-4 text-[#00C2D1]" />
                  <span>Coba Demo Tap Profil Deo</span>
                </Link>

                <Link
                  href="/dashboard/card"
                  className="w-full sm:w-auto bg-white hover:bg-[#F5F8FE] border border-[#E6ECF7] text-[#0A1633] px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm btn-press"
                >
                  <CreditCard className="w-4 h-4 text-[#1E4FFF]" />
                  <span>Kelola Kartu Anda</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-[#E6ECF7] w-full flex flex-wrap items-center gap-4 text-xs font-semibold text-[#6B7A9C]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>NTAG215 (504 Bytes)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#1E4FFF]" />
                  <span>Tap Tanpa Instal Aplikasi</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#00C2D1]" />
                  <span>iOS &amp; Android Ready</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Showcase Column */}
            <div className="lg:col-span-6 flex flex-col items-center">
              
              {/* Tab Selector between Card & MoM AI Engine */}
              <div className="bg-white/80 backdrop-blur-md border border-[#E6ECF7] p-1.5 rounded-2xl flex gap-1 mb-4 shadow-sm w-full max-w-md">
                <button
                  onClick={() => setActiveHeroTab("card")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                    activeHeroTab === "card"
                      ? "bg-[#1E4FFF] text-white shadow-md shadow-[#1E4FFF]/20"
                      : "text-[#6B7A9C] hover:text-[#0A1633]"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Smart NFC Card</span>
                </button>
                <button
                  onClick={() => setActiveHeroTab("mom")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                    activeHeroTab === "mom"
                      ? "bg-[#1E4FFF] text-white shadow-md shadow-[#1E4FFF]/20"
                      : "text-[#6B7A9C] hover:text-[#0A1633]"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>AI MoM Engine</span>
                </button>
              </div>

              {/* SHOWCASE VIEW 1: SMART NFC CARD WITH TAP SIMULATOR */}
              {activeHeroTab === "card" && (
                <div className="w-full max-w-md flex flex-col items-center">
                  <div className="card-perspective w-full">
                    <div
                      ref={cardRef}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      style={{
                        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                      }}
                      className="card-3d relative w-full aspect-[1.586/1] rounded-[24px] bg-gradient-to-br from-[#0F172A] via-[#0A1633] to-[#040817] p-6 text-white border border-white/20 shadow-[0_25px_60px_-15px_rgba(10,22,51,0.5)] flex flex-col justify-between overflow-hidden cursor-pointer select-none group"
                    >
                      {/* Holographic light sheen */}
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60"
                        style={{
                          background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)`,
                        }}
                      />

                      {/* Ambient glowing orb */}
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#1E4FFF]/30 rounded-full blur-3xl pointer-events-none" />

                      {/* Card Top */}
                      <div className="flex justify-between items-center z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#1E4FFF] flex items-center justify-center font-black text-sm text-white shadow-md shadow-[#1E4FFF]/30">
                            C
                          </div>
                          <div>
                            <span className="font-extrabold tracking-tight text-sm text-white flex items-center gap-1">
                              CARDI <span className="text-[#00C2D1]">SMART</span>
                            </span>
                            <span className="text-[9px] text-white/50 tracking-wider font-mono block">
                              NFC + AI MoM Connected
                            </span>
                          </div>
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                          <Radio className="w-4 h-4 text-[#00C2D1] animate-pulse" />
                        </div>
                      </div>

                      {/* Microchip EMV */}
                      <div className="w-12 h-9 rounded-lg bg-gradient-to-tr from-[#F3D079] via-[#ECC062] to-[#B38728] border border-white/40 shadow-md flex items-center justify-around px-1 z-10">
                        <div className="w-[1px] h-full bg-black/25" />
                        <div className="w-3.5 h-3.5 rounded-full border border-black/35 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                        </div>
                        <div className="w-[1px] h-full bg-black/25" />
                      </div>

                      {/* Card Bottom: Holder Name */}
                      <div className="flex justify-between items-end z-10 pt-2 border-t border-white/10">
                        <div>
                          <div className="text-[9.5px] uppercase font-mono tracking-widest text-[#93C5FD]">
                            EXECUTIVE PROFILE
                          </div>
                          <div className="text-base font-black tracking-wide text-white">
                            Deo Cardi Nathanael
                          </div>
                          <div className="text-[11px] text-white/70">
                            Founder &amp; CEO, Cardi Nusantara
                          </div>
                        </div>

                        <div className="text-[10px] font-mono bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-bold px-2 py-0.5 rounded-full">
                          ACTIVE NFC
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Tap Simulator Control */}
                  <div className="w-full mt-4 bg-white border border-[#E6ECF7] rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                    <button
                      onClick={triggerTapSimulation}
                      disabled={isSimulatingTap}
                      className="w-full bg-gradient-to-r from-[#1E4FFF] to-[#0258A4] hover:from-[#153DCC] hover:to-[#01417A] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#1E4FFF]/25 transition btn-press"
                    >
                      <Radio className="w-4 h-4 text-[#00C2D1]" />
                      <span>{isSimulatingTap ? "Menempelkan Kartu ke Ponsel..." : "Uji Tap Kartu ke HP (Simulasi)"}</span>
                    </button>

                    {tapStep === "tapping" && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-[#1E4FFF] font-semibold animate-pulse">
                        <Radio className="w-4 h-4 animate-spin" />
                        <span>Membaca sinyal frekuensi 13.56 MHz NTAG215...</span>
                      </div>
                    )}

                    {tapStep === "success" && (
                      <div className="mt-3 bg-[#EEF4FF] border border-[#1E4FFF]/30 rounded-xl p-3 w-full text-left animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1E4FFF] mb-1">
                          <CheckCircle className="w-4 h-4 text-[#10B981]" />
                          <span>Tap Berhasil! Notifikasi Ponsel Terbuka:</span>
                        </div>
                        <p className="text-xs text-[#0A1633] font-semibold">
                          &quot;Buka Profil Deo Cardi &amp; Unduh Kontak (.vcf)&quot;
                        </p>
                        <p className="text-[11px] text-[#3D4B6B] mt-0.5">
                          Tamu rapat langsung dapat menyimpan kontak atau menekan tombol rekam notula MoM.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SHOWCASE VIEW 2: CARDI MoM AI MEETING SIMULATOR */}
              {activeHeroTab === "mom" && (
                <div className="w-full max-w-md bg-white border border-[#E6ECF7] rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-200">
                  {/* MoM Header */}
                  <div className="bg-[#0A1633] text-white p-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#1E4FFF] flex items-center justify-center text-white">
                        <Mic className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Rapat Kemitraan Strategis</span>
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        </div>
                        <p className="text-[10.5px] text-white/60">Tatap Muka • NFC Tap Active • 32 Menit</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#EF4444] text-white font-black px-2 py-0.5 rounded-full uppercase">
                      Live AI
                    </span>
                  </div>

                  {/* MoM Tabs */}
                  <div className="bg-[#F5F8FE] border-b border-[#E6ECF7] px-4 flex gap-4 text-xs font-bold text-[#6B7A9C]">
                    <button
                      onClick={() => setActiveSimTab("summary")}
                      className={`py-2.5 border-b-2 transition ${
                        activeSimTab === "summary"
                          ? "border-[#1E4FFF] text-[#1E4FFF]"
                          : "border-transparent hover:text-[#0A1633]"
                      }`}
                    >
                      Ringkasan Notula
                    </button>
                    <button
                      onClick={() => setActiveSimTab("actions")}
                      className={`py-2.5 border-b-2 transition ${
                        activeSimTab === "actions"
                          ? "border-[#1E4FFF] text-[#1E4FFF]"
                          : "border-transparent hover:text-[#0A1633]"
                      }`}
                    >
                      Action Items
                    </button>
                    <button
                      onClick={() => setActiveSimTab("trans")}
                      className={`py-2.5 border-b-2 transition ${
                        activeSimTab === "trans"
                          ? "border-[#1E4FFF] text-[#1E4FFF]"
                          : "border-transparent hover:text-[#0A1633]"
                      }`}
                    >
                      Transkripsi
                    </button>
                  </div>

                  {/* MoM Body */}
                  <div className="p-4 text-xs text-[#0A1633]">
                    {activeSimTab === "summary" && (
                      <div className="space-y-3">
                        <div className="p-3 bg-[#EEF4FF] rounded-xl border border-[#1E4FFF]/20">
                          <strong className="text-[#1E4FFF] block mb-1">Executive Summary:</strong>
                          <p className="text-[#3D4B6B] leading-relaxed">
                            Kedua belah pihak menyepakati integrasi 50 unit Smart NFC Card untuk jajaran direksi dan divisi sales. Transkripsi suara rapat otomatis langsung memotong saldo koin bersama.
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#6B7A9C]">
                          <span>Model AI: Whisper + GPT-4o</span>
                          <span className="text-[#10B981] font-semibold">100% Notula Valid</span>
                        </div>
                      </div>
                    )}

                    {activeSimTab === "actions" && (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-[#F8FAFD] border border-[#E6ECF7] rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                            <span className="font-semibold">Kirim MoU &amp; Invoice sampel kartu</span>
                          </div>
                          <span className="text-[10px] bg-[#EEF4FF] text-[#1E4FFF] font-bold px-2 py-0.5 rounded">Deo Cardi</span>
                        </div>
                        <div className="p-2.5 bg-[#F8FAFD] border border-[#E6ECF7] rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                            <span className="font-semibold">Jadwalkan demo teknis Google Meet</span>
                          </div>
                          <span className="text-[10px] bg-white border border-[#E6ECF7] text-[#6B7A9C] font-bold px-2 py-0.5 rounded">Tamu</span>
                        </div>
                      </div>
                    )}

                    {activeSimTab === "trans" && (
                      <div className="space-y-2 text-[#3D4B6B]">
                        <p><strong>Deo:</strong> &quot;Begitu kartu ditap di meja rapat, rekaman audio bisa langsung dimulai dari HP.&quot;</p>
                        <p><strong>Partner:</strong> &quot;Sangat efisien. Jadi kita tidak perlu lagi menunjuk satu orang sekretaris khusus.&quot;</p>
                      </div>
                    )}

                    {/* Animated Waveform Equalizer */}
                    <div className="mt-4 pt-3 border-t border-[#E6ECF7] flex items-center justify-between">
                      <div className="flex items-center gap-1 h-5">
                        {[12, 22, 34, 18, 28, 14, 26, 32, 16, 24, 10, 20].map((h, i) => (
                          <span
                            key={i}
                            className="w-1 bg-[#1E4FFF] rounded-full animate-wave-bar"
                            style={{ animationDelay: `${i * 0.08}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#1E4FFF] font-mono font-bold flex items-center gap-1">
                        <Radio className="w-3 h-3" /> Live Audio Buffer
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 03. PROOF & METRICS BAR */}
      <section className="bg-white border-y border-[#E6ECF7] py-8">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl lg:text-4xl font-black text-[#1E4FFF] tracking-tight">0.2 dtk</span>
              <span className="text-xs text-[#6B7A9C] font-semibold mt-1">Kecepatan Tap &amp; Baca NTAG215</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl lg:text-4xl font-black text-[#0A1633] tracking-tight">99.4%</span>
              <span className="text-xs text-[#6B7A9C] font-semibold mt-1">Akurasi Transkripsi Dialek Indonesia</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl lg:text-4xl font-black text-[#00C2D1] tracking-tight">10.000+</span>
              <span className="text-xs text-[#6B7A9C] font-semibold mt-1">Menit Rapat Diproses Bulanan</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl lg:text-4xl font-black text-[#10B981] tracking-tight">100%</span>
              <span className="text-xs text-[#6B7A9C] font-semibold mt-1">Bebas Aplikasi Pihak Ketiga Bagi Tamu</span>
            </div>
          </div>
        </div>
      </section>

      {/* 04. SEAMLESS 4-STEP WORKFLOW */}
      <section id="cara-kerja" className="py-20 bg-[#F8FAFD] border-b border-[#E6ECF7]">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="eyebrow-badge mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#1E4FFF]" />
              <span>WORKFLOW OTOMATIS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A1633] tracking-tight">
              Dari Pertukaran Kartu <br />
              <span className="text-[#1E4FFF]">Hingga Notula Rapat Siap Eksekusi</span>
            </h2>
            <p className="text-[#3D4B6B] text-sm sm:text-base mt-3">
              Satu ekosistem mulus yang menghubungkan perkenalan fisik dengan teknologi kecerdasan buatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6ECF7] shadow-sm flex flex-col justify-between hover:border-[#1E4FFF]/40 transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1E4FFF] font-black text-sm flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  01
                </div>
                <h3 className="font-bold text-base text-[#0A1633] mb-1.5">Tap Kartu NFC ke HP</h3>
                <p className="text-xs text-[#3D4B6B] leading-relaxed">
                  Tempelkan kartu ke punggung HP rekan bisnis. Browser langsung terbuka otomatis menampilkan profil eksekutif Anda.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E6ECF7] text-[11px] font-semibold text-[#1E4FFF] flex items-center gap-1">
                <span>NTAG215 Contactless</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6ECF7] shadow-sm flex flex-col justify-between hover:border-[#1E4FFF]/40 transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1E4FFF] font-black text-sm flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  02
                </div>
                <h3 className="font-bold text-base text-[#0A1633] mb-1.5">Simpan Kontak (.vcf)</h3>
                <p className="text-xs text-[#3D4B6B] leading-relaxed">
                  Rekan Anda menekan satu tombol &quot;Simpan Kontak&quot;. Seluruh nama, jabatan, email, dan nomor WhatsApp otomatis tersimpan di buku telepon.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E6ECF7] text-[11px] font-semibold text-[#1E4FFF] flex items-center gap-1">
                <span>Ekspor vCard Instan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6ECF7] shadow-sm flex flex-col justify-between hover:border-[#1E4FFF]/40 transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1E4FFF] font-black text-sm flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  03
                </div>
                <h3 className="font-bold text-base text-[#0A1633] mb-1.5">Rekam Suara Rapat</h3>
                <p className="text-xs text-[#3D4B6B] leading-relaxed">
                  Luncurkan perekam Cardi MoM langsung dari halaman tap. Suara rapat tatap muka direkam dan dienkripsi dengan standar korporasi.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E6ECF7] text-[11px] font-semibold text-[#1E4FFF] flex items-center gap-1">
                <span>AI Voice Recording</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6ECF7] shadow-sm flex flex-col justify-between hover:border-[#1E4FFF]/40 transition group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1E4FFF] font-black text-sm flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  04
                </div>
                <h3 className="font-bold text-base text-[#0A1633] mb-1.5">Notula &amp; WA Otomatis</h3>
                <p className="text-xs text-[#3D4B6B] leading-relaxed">
                  Dalam hitungan detik, AI membedah poin kesepakatan, ringkasan eksekutif, dan pembagian tugas yang langsung dikirim ke WhatsApp tim.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E6ECF7] text-[11px] font-semibold text-[#1E4FFF] flex items-center gap-1">
                <span>Action Items Sync</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05. HARDWARE CRAFTSMANSHIP & CHIP SPECIFICATIONS */}
      <section id="hardware-card" className="py-20 bg-white border-b border-[#E6ECF7]">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Card Craftsmanship */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-[420px] bg-[#070D1E] p-7 rounded-[28px] border border-white/15 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E4FFF]/25 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#00C2D1]" />
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      Cardi Hardware Spec
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] font-mono font-bold px-2 py-0.5 rounded-full border border-[#10B981]/30">
                    ISO/IEC 14443 Type A
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-white/60">Chip Model:</span>
                    <span className="text-white font-bold font-mono">NXP NTAG215 (High Frequency)</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-white/60">Frekuensi Operasional:</span>
                    <span className="text-white font-bold font-mono">13.56 MHz Contactless</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-white/60">Kapasitas Penyimpanan:</span>
                    <span className="text-white font-bold font-mono">504 Bytes (NDEF Formatted)</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-white/60">Daya Tahan Penulisan:</span>
                    <span className="text-white font-bold font-mono">100.000 Siklus Baca/Tulis</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-white/60">Retensi Data:</span>
                    <span className="text-white font-bold font-mono">10 Tahun Tanpa Baterai</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-white/60">Material Kartu:</span>
                    <span className="text-white font-bold">Matte PVC Premium / Metal Steel</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                  <span>Kompatibel: iPhone XR+ &amp; Semua Android NFC</span>
                  <Radio className="w-4 h-4 text-[#00C2D1] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Hardware Feature Copy */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <div className="eyebrow-badge mb-3">
                <CreditCard className="w-3.5 h-3.5 text-[#1E4FFF]" />
                <span>KUALITAS PERANGKAT KERAS</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0A1633] tracking-tight leading-tight mb-4">
                Didesain Mewah. <br />
                <span className="text-[#1E4FFF]">Tahan Air &amp; Tanpa Baterai.</span>
              </h2>
              <p className="text-[#3D4B6B] text-sm sm:text-base leading-relaxed mb-6">
                Setiap kartu pintar Cardi dilengkapi chip NTAG215 presisi tinggi yang dapat ditulis ulang kapan saja melalui dashboard browser atau aplikasi NFC Tools.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="p-4 bg-[#F8FAFD] rounded-xl border border-[#E6ECF7]">
                  <h4 className="font-bold text-xs text-[#0A1633] mb-1">Web NFC Direct Writer</h4>
                  <p className="text-[11px] text-[#3D4B6B]">
                    Tulis URL profil ke chip kartu fisik langsung dari Chrome Android tanpa aplikasi tambahan.
                  </p>
                </div>
                <div className="p-4 bg-[#F8FAFD] rounded-xl border border-[#E6ECF7]">
                  <h4 className="font-bold text-xs text-[#0A1633] mb-1">Passcode Lock Protection</h4>
                  <p className="text-[11px] text-[#3D4B6B]">
                    Dapat dikunci secara permanen atau dilindungi password agar data URL tidak bisa ditimpa orang lain.
                  </p>
                </div>
                <div className="p-4 bg-[#F8FAFD] rounded-xl border border-[#E6ECF7]">
                  <h4 className="font-bold text-xs text-[#0A1633] mb-1">Finishing Eksekutif</h4>
                  <p className="text-[11px] text-[#3D4B6B]">
                    Pilihan lapisan matte obsidian, gold foil, dan laser engraving untuk logo perusahaan Anda.
                  </p>
                </div>
                <div className="p-4 bg-[#F8FAFD] rounded-xl border border-[#E6ECF7]">
                  <h4 className="font-bold text-xs text-[#0A1633] mb-1">Sinkronisasi Real-Time</h4>
                  <p className="text-[11px] text-[#3D4B6B]">
                    Ubah nomor WA atau jabatan di dashboard kapan saja tanpa perlu mencetak kartu baru.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 06. MOBILE APP & COIN ECOSYSTEM */}
      <section id="mobile-app" className="py-20 bg-[#070D1E] text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-dark opacity-40 pointer-events-none" />
        <div className="max-w-[1240px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="eyebrow-badge-dark mb-3">
                <Smartphone className="w-3.5 h-3.5 text-[#00C2D1]" />
                <span>APLIKASI MOBILE &amp; DOMPET KOIN</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                Satu Akun, Satu Saldo Koin <br />
                <span className="text-[#00C2D1]">Untuk Kartu &amp; Rekaman MoM</span>
              </h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
                Hubungkan kartu fisik Anda ke aplikasi <strong>Cardi MoM (Play Store &amp; App Store)</strong>. Saldo koin rapat dapat digunakan bersama untuk transkripsi audio AI, ekspor notula ke WhatsApp, dan pengelolaan profil kartu.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/wallet"
                  className="bg-[#00C2D1] hover:bg-[#00A8B8] text-[#070D1E] px-6 py-3 rounded-xl font-extrabold text-xs shadow-lg transition btn-press flex items-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  <span>Cek Pairing &amp; Saldo Koin</span>
                </Link>
                <Link
                  href="/deo"
                  target="_blank"
                  className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-3 rounded-xl font-bold text-xs transition btn-press flex items-center gap-2"
                >
                  <span>Lihat Demo Profil Publik</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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

      {/* 07. PRICING & COIN SCHEME */}
      <section id="harga" className="py-20 bg-white border-b border-[#E6ECF7]">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="eyebrow-badge mb-3">
              <Coins className="w-3.5 h-3.5 text-[#1E4FFF]" />
              <span>SKEMA HARGA &amp; KOIN</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A1633] tracking-tight">
              Mulai Rp 99 Ribu. <br />
              <span className="text-[#1E4FFF]">Sederhana, Transparan, &amp; Fleksibel.</span>
            </h2>
            <p className="text-[#3D4B6B] text-sm sm:text-base mt-3">
              Gunakan sistem koin bersama. 1 jam rekaman rapat = 10 koin. Top-up saldo koin kapan saja sesuai kebutuhan tim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-[#F8FAFD] p-6 rounded-2xl border border-[#E6ECF7] flex flex-col justify-between hover:border-[#1E4FFF]/40 transition">
              <div>
                <span className="text-xs font-bold text-[#6B7A9C] uppercase tracking-wider">Starter</span>
                <div className="text-2xl font-black text-[#0A1633] mt-2 mb-1">
                  Rp 99.000 <span className="text-xs font-normal text-[#6B7A9C]">/ bln</span>
                </div>
                <p className="text-xs text-[#3D4B6B] mb-5">Cocok untuk profesional &amp; freelancer.</p>
                <div className="space-y-2 text-xs text-[#3D4B6B]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>100 Koin Rapat (~10 jam rekaman)</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>1 Smart NFC Card Fisik (Matte PVC)</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Ekspor Notula ke WhatsApp</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Download Profil vCard .vcf</span></div>
                </div>
              </div>
              <Link href="/dashboard/wallet" className="mt-6 w-full py-2.5 rounded-xl bg-white border border-[#E6ECF7] hover:bg-[#EEF4FF] text-[#1E4FFF] font-bold text-xs text-center transition btn-press">
                Pilih Starter
              </Link>
            </div>

            {/* Business Pro (Popular) */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#1E4FFF] shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3 right-6 bg-[#1E4FFF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                Paling Populer
              </span>
              <div>
                <span className="text-xs font-bold text-[#1E4FFF] uppercase tracking-wider">Business Pro</span>
                <div className="text-2xl font-black text-[#0A1633] mt-2 mb-1">
                  Rp 299.000 <span className="text-xs font-normal text-[#6B7A9C]">/ bln</span>
                </div>
                <p className="text-xs text-[#3D4B6B] mb-5">Untuk tim manajerial &amp; konsultan bisnis.</p>
                <div className="space-y-2 text-xs text-[#3D4B6B]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E4FFF]" /> <span>400 Koin Rapat (~40 jam rekaman)</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E4FFF]" /> <span>3 Smart NFC Card Fisik Custom Logo</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E4FFF]" /> <span>Multi-speaker Diarization Akurat</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E4FFF]" /> <span>Sinkronisasi Google Calendar Otomatis</span></div>
                </div>
              </div>
              <Link href="/dashboard/wallet" className="mt-6 w-full py-2.5 rounded-xl bg-[#1E4FFF] hover:bg-[#153DCC] text-white font-bold text-xs text-center transition shadow-md shadow-[#1E4FFF]/25 btn-press">
                Mulai Business Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-[#F8FAFD] p-6 rounded-2xl border border-[#E6ECF7] flex flex-col justify-between hover:border-[#1E4FFF]/40 transition">
              <div>
                <span className="text-xs font-bold text-[#6B7A9C] uppercase tracking-wider">Enterprise</span>
                <div className="text-2xl font-black text-[#0A1633] mt-2 mb-1">
                  Custom <span className="text-xs font-normal text-[#6B7A9C]">/ tim</span>
                </div>
                <p className="text-xs text-[#3D4B6B] mb-5">Untuk korporasi dan institusi skala besar.</p>
                <div className="space-y-2 text-xs text-[#3D4B6B]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Koin Tanpa Batas / Kuota Besar</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Kartu NFC Fisik Metal / Stainless Steel</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Integrasi API &amp; Webhook ERP</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> <span>Dedicated Account Manager</span></div>
                </div>
              </div>
              <Link href="https://wa.me/6281283625471" target="_blank" className="mt-6 w-full py-2.5 rounded-xl bg-white border border-[#E6ECF7] hover:bg-[#EEF4FF] text-[#0A1633] font-bold text-xs text-center transition btn-press">
                Hubungi Sales via WA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 08. FOOTER */}
      <footer className="bg-[#070D1E] text-white border-t border-white/10 pt-16 pb-12">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#1E4FFF] flex items-center justify-center font-black text-sm">C</div>
                <span className="text-lg font-black tracking-tight">Cardi MoM &amp; Smart NFC</span>
              </div>
              <p className="text-xs text-white/70 max-w-sm leading-relaxed mb-4">
                Ekosistem kartu nama pintar NFC terintegrasi langsung dengan AI Minutes of Meeting (MoM). Rapat selesai, notula beres, relasi bisnis terjaga.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] font-semibold text-[#00C2D1]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enkripsi Standar Korporasi · Data Rapat Aman</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Navigasi</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><a href="#fitur-nfc" className="hover:text-white transition">Fitur Kartu</a></li>
                <li><a href="#cara-kerja" className="hover:text-white transition">Alur Rapat AI</a></li>
                <li><a href="#hardware-card" className="hover:text-white transition">Spesifikasi Chip</a></li>
                <li><a href="#harga" className="hover:text-white transition">Skema Koin</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Aplikasi &amp; Demo</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><Link href="/deo" target="_blank" className="hover:text-white transition">Demo Tap Kartu Deo</Link></li>
                <li><Link href="/dashboard/card" className="hover:text-white transition">Dashboard Kartu</Link></li>
                <li><Link href="/dashboard/mom" className="hover:text-white transition">Recorder MoM</Link></li>
                <li><Link href="/dashboard/wallet" className="hover:text-white transition">Top-Up Koin</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Ekosistem Cardi</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><a href="https://www.cardi.co.id" target="_blank" className="hover:text-white transition">Cardi Indonesia Official</a></li>
                <li><a href="https://aiagent.cardi.co.id" target="_blank" className="hover:text-white transition">Cardi AI Agent Platform</a></li>
                <li><a href="https://aiagent.cardi.co.id/mom" target="_blank" className="hover:text-white transition">Cardi MoM Web Landing</a></li>
                <li><a href="https://wa.me/6281283625471" target="_blank" className="hover:text-white transition">WhatsApp Support Tim</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50">
            <p>&copy; 2026 PT Cardi Nusantara Indonesia. Seluruh hak cipta dilindungi.</p>
            <p className="mt-2 sm:mt-0">Ditenagai oleh NXP NTAG215 &amp; Cardi AI Intelligence.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
