"use client";

import React, { useState, useRef, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
  Mic,
  Calendar,
  Share2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Radio,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Send,
  UserCheck,
  Building,
  Rotate3d,
  Layers,
  ChevronRight,
  Play,
  Square,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function PublicCardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#070D1E] flex items-center justify-center text-white/50 text-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#1E4FFF] border-t-transparent animate-spin" />
            <span>Memuat Profil Kartu Cardi...</span>
          </div>
        </div>
      }
    >
      <PublicCardContent />
    </React.Suspense>
  );
}

type CardFinish = "obsidian" | "navy" | "titanium";

function PublicCardContent() {
  const params = useParams();
  const router = useRouter();
  const username = (params?.username as string) || "deo";
  const { cardProfile, addMeeting } = useAppStore();

  // State
  const [cardFinish, setCardFinish] = useState<CardFinish>("obsidian");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [exchangeSubmitted, setExchangeSubmitted] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorContact, setVisitorContact] = useState("");
  const [visitorNote, setVisitorNote] = useState("");

  // MoM In-Person Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordInterval, setRecordInterval] = useState<NodeJS.Timeout | null>(null);
  const [momResult, setMomResult] = useState<{
    summary: string;
    decisions: string[];
    actions: { item: string; owner: string }[];
  } | null>(null);

  // 3D Card Interactive Tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenPosition, setSheenPosition] = useState({ x: 50, y: 50 });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotateX(rotX);
    setRotateY(rotY);
    setSheenPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleCardMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `${cardProfile.fullName} — Cardi Smart NFC Card`,
        text: `Profil Eksekutif & Notula Rapat AI bersama ${cardProfile.fullName}`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Tautan profil berhasil disalin!");
    }
  };

  const startMeetingRecord = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    setMomResult(null);
    const interval = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    setRecordInterval(interval);
  };

  const stopMeetingRecord = () => {
    if (recordInterval) clearInterval(recordInterval);
    setIsRecording(false);

    const generatedMom = {
      summary: `Pertemuan tatap muka langsung berhasil direkam via kartu NFC Cardi bersama ${cardProfile.fullName}. Diskusi menyepakati kolaborasi strategis dan integrasi solusi.`,
      decisions: [
        "Menyetujui agenda tindak lanjut pengenalan solusi Cardi.",
        "Mengirimkan dokumen pengantar resmi dalam 24 jam.",
      ],
      actions: [
        { item: `Kirimkan ringkasan hasil pertemuan ke ${cardProfile.email}`, owner: "Deo Cardi" },
        { item: "Follow-up pesan WhatsApp koordinasi tim", owner: "Tamu Rapat" },
      ],
    };

    setMomResult(generatedMom);

    // Save to global MoM store
    addMeeting({
      id: `mtg_${Date.now()}`,
      title: `Rapat Tatap Muka: ${cardProfile.fullName}`,
      titleIsDefault: false,
      date: new Date().toISOString().split("T")[0],
      startTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      durationMinutes: Math.max(1, Math.ceil(recordSeconds / 60)),
      attendees: `Tamu NFC, ${cardProfile.fullName}`,
      location: "Pertemuan Langsung (NFC Tap)",
      status: "ready",
      failedStage: null,
      failureReason: null,
      mom: {
        shortSummary: generatedMom.summary,
        executiveSummary: generatedMom.summary,
        discussionPoints: [
          { topic: "Pembahasan Kolaborasi", detail: "Inisiasi kerjasama strategis.", sourceMs: [2000, 8000] },
        ],
        decisions: generatedMom.decisions.map((text, idx) => ({ text, sourceMs: [(idx + 1) * 10000] })),
        actionItems: generatedMom.actions.map((act, idx) => ({
          item: act.item,
          owner: act.owner,
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
          dueDateText: "2 hari lagi",
          sourceMs: [(idx + 1) * 15000],
        })),
        openIssues: [],
        nextSteps: [{ text: "Follow-up via WhatsApp", sourceMs: [] }],
        model: "gpt-4o-transcribe-v2",
        promptVersion: "1.2.0",
      },
      momReadAt: null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    showToast("Notula rapat berhasil dibuat & tersimpan di MoM!");
  };

  const handleExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    setExchangeSubmitted(true);
    showToast("Kontak Anda telah terkirim ke Deo Cardi!");
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // VCard link
  const vCardUrl = `/api/vcard/${username}?name=${encodeURIComponent(
    cardProfile.fullName
  )}&title=${encodeURIComponent(cardProfile.headline)}&company=${encodeURIComponent(
    cardProfile.company
  )}&phone=${encodeURIComponent(cardProfile.phone)}&email=${encodeURIComponent(
    cardProfile.email
  )}&website=${encodeURIComponent(cardProfile.website)}&address=${encodeURIComponent(
    cardProfile.location
  )}`;

  // Card Appearance Styles based on Finish
  const finishStyles = {
    obsidian: {
      bg: "from-[#10141E] via-[#0A0D17] to-[#04060C]",
      border: "border-white/20",
      accent: "text-[#D4AF37]",
      chip: "from-[#F3D079] via-[#ECC062] to-[#B38728]",
      glow: "rgba(212, 175, 55, 0.25)",
      pill: "bg-[#D4AF37]/15 text-[#F3D079] border-[#D4AF37]/30",
    },
    navy: {
      bg: "from-[#08215E] via-[#0A1633] to-[#03091B]",
      border: "border-[#1E4FFF]/40",
      accent: "text-[#64B5F6]",
      chip: "from-[#E2E8F0] via-[#94A3B8] to-[#475569]",
      glow: "rgba(30, 79, 255, 0.35)",
      pill: "bg-[#1E4FFF]/20 text-[#93C5FD] border-[#1E4FFF]/40",
    },
    titanium: {
      bg: "from-[#1E293B] via-[#0F172A] to-[#020617]",
      border: "border-[#00C2D1]/40",
      accent: "text-[#00C2D1]",
      chip: "from-[#67E8F9] via-[#06B6D4] to-[#0E7490]",
      glow: "rgba(0, 194, 209, 0.25)",
      pill: "bg-[#00C2D1]/15 text-[#67E8F9] border-[#00C2D1]/30",
    },
  }[cardFinish];

  return (
    <div className="min-h-screen bg-[#070D1E] text-white flex flex-col items-center justify-start p-4 sm:p-6 pb-24 selection:bg-[#1E4FFF] selection:text-white relative overflow-x-hidden ambient-glow-dark">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-50 bg-[#1E4FFF] text-white font-medium text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00C2D1]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="w-full max-w-md flex items-center justify-between py-3 mb-3 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0258A4] to-[#1E4FFF] flex items-center justify-center font-black text-xs text-white shadow-sm">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-[#00C2D1] transition">
              Cardi<span className="text-[#1E4FFF]">.id</span>
            </span>
            <span className="text-[9px] text-white/50 uppercase tracking-widest font-mono">
              Smart NFC Profile
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* QR Code button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition btn-press"
            title="Tampilkan QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition btn-press"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-md flex flex-col gap-4">
        
        {/* FINISH SELECTOR / CARD STYLES */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-white/60">
            <Layers className="w-3.5 h-3.5 text-[#1E4FFF]" />
            <span>Edisi Kartu:</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setCardFinish("obsidian")}
              className={`text-[10.5px] px-2.5 py-1 rounded-lg font-semibold transition ${
                cardFinish === "obsidian"
                  ? "bg-[#D4AF37]/20 text-[#F3D079] border border-[#D4AF37]/40 shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Obsidian Gold
            </button>
            <button
              onClick={() => setCardFinish("navy")}
              className={`text-[10.5px] px-2.5 py-1 rounded-lg font-semibold transition ${
                cardFinish === "navy"
                  ? "bg-[#1E4FFF]/25 text-[#93C5FD] border border-[#1E4FFF]/40 shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Royal Navy
            </button>
            <button
              onClick={() => setCardFinish("titanium")}
              className={`text-[10.5px] px-2.5 py-1 rounded-lg font-semibold transition ${
                cardFinish === "titanium"
                  ? "bg-[#00C2D1]/20 text-[#67E8F9] border border-[#00C2D1]/40 shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Titanium
            </button>
          </div>
        </div>

        {/* 3D INTERACTIVE PHYSICAL NFC CARD MOCKUP */}
        <div className="card-perspective w-full">
          <div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            }}
            className={`card-3d relative w-full aspect-[1.586/1] rounded-[22px] bg-gradient-to-br ${finishStyles.bg} p-6 border ${finishStyles.border} shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden cursor-pointer select-none`}
          >
            {/* Dynamic Holographic Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60"
              style={{
                background: `radial-gradient(circle at ${sheenPosition.x}% ${sheenPosition.y}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 65%)`,
              }}
            />

            {/* Ambient Background Aura */}
            <div
              className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
              style={{ backgroundColor: finishStyles.glow }}
            />

            {/* Card Header: Cardi Logo & Contactless NFC Waves */}
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-sm text-white shadow-inner">
                  C
                </div>
                <div>
                  <div className="text-base font-black tracking-wider text-white uppercase flex items-center gap-1 leading-none">
                    CARDI <span className={finishStyles.accent}>SMART</span>
                  </div>
                  <div className="text-[9px] text-white/50 tracking-widest font-mono uppercase mt-0.5">
                    NFC Business &amp; AI MoM
                  </div>
                </div>
              </div>

              {/* NFC Contactless Wave with radiating pulse ring */}
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  <Radio className="w-5 h-5 text-[#00C2D1] animate-pulse" />
                </div>
                <div className="absolute -inset-1 rounded-xl border border-[#00C2D1]/30 animate-ping pointer-events-none" />
              </div>
            </div>

            {/* Card Center: EMV Chip & Holographic Foil */}
            <div className="flex items-center justify-between z-10">
              {/* Luxury EMV Microchip */}
              <div
                className={`w-12 h-9 rounded-lg bg-gradient-to-tr ${finishStyles.chip} border border-white/40 shadow-md flex items-center justify-around px-1 relative overflow-hidden`}
              >
                <div className="w-[1px] h-full bg-black/25" />
                <div className="w-3.5 h-3.5 rounded-full border border-black/35 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                </div>
                <div className="w-[1px] h-full bg-black/25" />
              </div>

              <div className="text-[9.5px] font-mono tracking-widest uppercase text-white/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>NTAG215 • 504B</span>
              </div>
            </div>

            {/* Card Bottom: Holder Name & Company */}
            <div className="flex justify-between items-end z-10 pt-2 border-t border-white/10">
              <div>
                <p className="text-[14px] font-extrabold tracking-wide text-white uppercase leading-tight">
                  {cardProfile.fullName}
                </p>
                <p className="text-[11px] text-white/70 font-medium">
                  {cardProfile.headline} · {cardProfile.company}
                </p>
              </div>

              <div className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${finishStyles.pill} font-bold`}>
                VERIFIED
              </div>
            </div>
          </div>
        </div>

        {/* 3D Tilt Instruction Hint */}
        <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-white/40 font-mono text-center -mt-2">
          <Rotate3d className="w-3.5 h-3.5 text-white/50" />
          <span>Arahkan kursor atau sentuh kartu untuk efek 3D reflektif</span>
        </div>

        {/* EXECUTIVE PROFILE & IDENTITY CARD */}
        <div className="glass-panel-dark rounded-[24px] p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle Ambient Top Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#1E4FFF] to-transparent" />

          {/* Avatar with Status Ring */}
          <div className="relative mb-3.5">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#1E4FFF] via-[#00C2D1] to-[#D4AF37] shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0A1633] relative">
                {cardProfile.avatarUrl ? (
                  <img
                    src={cardProfile.avatarUrl}
                    alt={cardProfile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-white">
                    {cardProfile.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                )}
              </div>
            </div>
            {/* Active Status Badge */}
            <div
              className="absolute bottom-1 right-1 bg-[#10B981] border-[2.5px] border-[#0A1633] w-6 h-6 rounded-full flex items-center justify-center shadow-md"
              title="Kartu NFC Aktif & Terhubung"
            >
              <Check className="w-3 h-3 text-white stroke-[3]" />
            </div>
          </div>

          {/* Name & Headline */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-xl font-black tracking-tight text-white">
              {cardProfile.fullName}
            </h1>
            <span title="Akun Resmi Terverifikasi">
              <ShieldCheck className="w-4 h-4 text-[#00C2D1]" />
            </span>
          </div>

          <p className="text-xs font-semibold text-[#64B5F6] mb-1.5">
            {cardProfile.headline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/60 mb-4">
            <span className="flex items-center gap-1 text-white/90 font-medium">
              <Building className="w-3.5 h-3.5 text-white/40" />
              {cardProfile.company}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-white/40" />
              {cardProfile.location}
            </span>
          </div>

          {/* Bio */}
          <p className="text-xs text-white/75 leading-relaxed max-w-sm mb-6 font-normal">
            {cardProfile.bio}
          </p>

          {/* PRIMARY HERO CTA: SAVE CONTACT (.VCF) */}
          <div className="w-full flex flex-col gap-2.5">
            <a
              href={vCardUrl}
              download={`${username}-contact.vcf`}
              onClick={() => showToast("Kontak Deo Cardi sedang diunduh ke buku telepon!")}
              className="w-full bg-gradient-to-r from-[#1E4FFF] to-[#0258A4] hover:from-[#153DCC] hover:to-[#01417A] text-white py-3.5 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-xl shadow-[#1E4FFF]/30 transition-all btn-press border border-white/20"
            >
              <Download className="w-4 h-4 text-[#00C2D1]" />
              <span>Simpan Kontak ke Telepon (.vcf)</span>
            </a>

            {/* QUICK CONNECT ROW */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <a
                href={cardProfile.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition btn-press"
              >
                <MessageCircle className="w-4 h-4 text-[#10B981]" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`mailto:${cardProfile.email}?subject=Diskusi%20Kerjasama%20via%20Cardi%20NFC`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition btn-press"
              >
                <Mail className="w-4 h-4 text-[#64B5F6]" />
                <span>Kirim Email</span>
              </a>

              <a
                href={`tel:${cardProfile.phone}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition btn-press"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Telepon</span>
              </a>

              <a
                href={cardProfile.website}
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition btn-press"
              >
                <Globe className="w-3.5 h-3.5 text-[#00C2D1]" />
                <span>Website</span>
              </a>
            </div>
          </div>
        </div>

        {/* IN-PERSON AI MoM RECORDER WIDGET */}
        <div className="glass-panel-dark rounded-[24px] p-5 border border-[#1E4FFF]/30 shadow-xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1E4FFF]/20 border border-[#1E4FFF]/40 flex items-center justify-center text-[#1E4FFF]">
                <Mic className="w-4 h-4 text-[#00C2D1] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Sedang Bertemu Langsung?
                  </h3>
                  <span className="text-[9px] bg-[#1E4FFF] text-white px-2 py-0.5 rounded-full font-bold">
                    AI MoM
                  </span>
                </div>
                <p className="text-[11px] text-white/60">
                  Rekam percakapan rapat. AI otomatis membuat notula resmi &amp; action items.
                </p>
              </div>
            </div>
          </div>

          {/* Equalizer & Controls */}
          <div className="bg-[#050A18] border border-white/10 rounded-2xl p-4 flex flex-col items-center">
            {/* Audio Waveform Visualization */}
            <div className="w-full h-12 flex items-center justify-center gap-1.5 px-2 mb-3">
              {isRecording ? (
                Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-[#1E4FFF] to-[#00C2D1] rounded-full animate-wave-bar"
                    style={{
                      animationDelay: `${(i % 6) * 0.12}s`,
                      height: `${Math.max(6, ((i * 11) % 36) + 6)}px`,
                    }}
                  />
                ))
              ) : (
                <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#00C2D1]" />
                  <span>Mikrofon siap merekam rapat tatap muka</span>
                </div>
              )}
            </div>

            {/* Timer & Status */}
            <div className="flex items-center justify-between w-full mb-3 px-1">
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-record-dot" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                )}
                <span className="text-xs text-white/70 font-mono">
                  {isRecording ? "Sedang Merekam..." : "Durasi"}
                </span>
              </div>
              <span className="text-base font-mono font-bold text-white tracking-wider">
                {formatTimer(recordSeconds)}
              </span>
            </div>

            {/* Action Buttons */}
            {!isRecording ? (
              <button
                onClick={startMeetingRecord}
                className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#EF4444]/25 transition btn-press"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Rekam Rapat Tatap Muka</span>
              </button>
            ) : (
              <button
                onClick={stopMeetingRecord}
                className="w-full bg-gradient-to-r from-[#1E4FFF] to-[#00C2D1] text-[#0A1633] py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition btn-press"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Selesai &amp; Buat Notula AI</span>
              </button>
            )}

            {/* Generated MoM Result Preview */}
            {momResult && (
              <div className="w-full mt-4 pt-3 border-t border-white/10 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#00C2D1] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hasil Notula Siap
                  </span>
                  <Link
                    href="/dashboard/mom"
                    className="text-[10px] text-[#64B5F6] hover:underline flex items-center gap-1"
                  >
                    Buka di Dashboard <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-xs text-white/80 leading-relaxed mb-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                  {momResult.summary}
                </p>
                <div className="space-y-1">
                  <span className="text-[10px] text-white/50 uppercase font-mono">Action Items:</span>
                  {momResult.actions.map((act, i) => (
                    <div key={i} className="text-xs text-white/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E4FFF]" />
                      <span>{act.item} ({act.owner})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LEAD CAPTURE: TUKAR KONTAK BALIK */}
        <div className="glass-panel-dark rounded-[24px] p-5 shadow-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tukar Kontak Balik
              </h3>
            </div>
            <button
              onClick={() => setShowExchangeForm(!showExchangeForm)}
              className="text-[11px] text-[#64B5F6] hover:underline"
            >
              {showExchangeForm ? "Sembunyikan" : "Buka Formulir"}
            </button>
          </div>

          <p className="text-xs text-white/60 mb-3">
            Tinggalkan nama &amp; kontak Anda agar Deo Cardi dapat langsung menghubungi Anda balik.
          </p>

          {exchangeSubmitted ? (
            <div className="bg-[#10B981]/15 border border-[#10B981]/30 p-3.5 rounded-xl text-center">
              <CheckCircle2 className="w-6 h-6 text-[#10B981] mx-auto mb-1" />
              <p className="text-xs font-bold text-white">Kontak Anda Berhasil Terkirim!</p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Deo Cardi akan segera menindaklanjuti pesan Anda.
              </p>
            </div>
          ) : (
            showExchangeForm && (
              <form onSubmit={handleExchangeSubmit} className="space-y-2.5 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="Nama Lengkap Anda"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#1E4FFF]"
                />
                <input
                  type="text"
                  placeholder="Nomor WhatsApp / Email"
                  value={visitorContact}
                  onChange={(e) => setVisitorContact(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#1E4FFF]"
                />
                <textarea
                  placeholder="Catatan / Topik Pembicaraan (Opsional)"
                  value={visitorNote}
                  onChange={(e) => setVisitorNote(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#1E4FFF]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#1E4FFF] hover:bg-[#153DCC] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition btn-press shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Kontak ke Deo Cardi</span>
                </button>
              </form>
            )
          )}
        </div>

        {/* QUICK CALENDAR / APPOINTMENT */}
        <div className="glass-panel-dark rounded-[24px] p-4 flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Jadwalkan Rapat</h4>
              <p className="text-[11px] text-white/60">Pilih agenda atau sinkronkan kalender</p>
            </div>
          </div>
          <Link
            href="/dashboard/calendar"
            className="text-xs bg-white/10 hover:bg-white/15 text-white px-3.5 py-2 rounded-xl flex items-center gap-1 font-semibold transition btn-press"
          >
            <span>Buka</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* FOOTER */}
        <footer className="text-center pt-3 pb-6 text-xs text-white/40 space-y-1">
          <p className="font-semibold text-white/60">Cardi Smart NFC &amp; AI MoM Ecosystem</p>
          <p className="text-[11px]">
            Tersedia untuk Android &amp; iOS · Dilindungi Enkripsi Standar Perusahaan
          </p>
        </footer>
      </main>

      {/* QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-[#0A1633] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-full flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Scan QR Code Profil
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-white/50 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* QR Mockup Box */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.href : "https://www.cardi.co.id/deo"
                )}`}
                alt="QR Code Profil Deo Cardi"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Arahkan kamera HP ke kode QR di atas untuk membuka profil &amp; simpan kontak langsung.
            </p>

            <button
              onClick={() => {
                if (typeof navigator !== "undefined") {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Tautan profil berhasil disalin!");
                }
              }}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Link Profil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
