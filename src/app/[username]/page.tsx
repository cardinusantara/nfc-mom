"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Download,
  MessageCircle,
  Mail,
  Globe,
  MapPin,
  Mic,
  Calendar,
  Share2,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Radio,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function PublicCardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-white/50 text-sm">
          Memuat profil kartu...
        </div>
      }
    >
      <PublicCardContent />
    </React.Suspense>
  );
}

function PublicCardContent() {
  const params = useParams();
  const router = useRouter();
  const username = (params?.username as string) || "deo";
  const { cardProfile, addMeeting } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [recordingSaved, setRecordingSaved] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${cardProfile.fullName} - Cardi NFC Business Card`,
        text: `Hubungkan profil digital & rekam rapat bersama ${cardProfile.fullName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startQuickRecord = () => {
    setIsRecording(true);
    setRecordDuration(0);
    setRecordingSaved(false);
    const interval = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopQuickRecord = () => {
    if (timerInterval) clearInterval(timerInterval);
    setIsRecording(false);
    setRecordingSaved(true);

    // Save to global MoM meeting store
    addMeeting({
      id: `mtg_${Date.now()}`,
      title: `Rapat Tatap Muka: ${cardProfile.fullName}`,
      titleIsDefault: false,
      date: new Date().toISOString().split("T")[0],
      startTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      durationMinutes: Math.max(1, Math.ceil(recordDuration / 60)),
      attendees: `Tamu NFC, ${cardProfile.fullName}`,
      location: "Pertemuan Langsung (NFC Tap)",
      status: "ready",
      failedStage: null,
      failureReason: null,
      mom: {
        shortSummary: `Diskusi langsung setelah pertukaran kartu bisnis NFC bersama ${cardProfile.fullName}.`,
        executiveSummary: `Percakapan tatap muka berhasil direkam dan diringkas secara otomatis oleh Cardi AI Agent. Rapat berlangsung selama ${recordDuration} detik dengan poin kesepakatan kerjasama.`,
        discussionPoints: [
          {
            topic: "Inisiasi Kolaborasi",
            detail: `Diskusi peluang integrasi dan penjadwalan presentasi produk.`,
            sourceMs: [2000, 10000],
          },
        ],
        decisions: [
          { text: "Lakukan follow-up WhatsApp dalam waktu 24 jam.", sourceMs: [15000] },
        ],
        actionItems: [
          {
            item: `Kirimkan dokumen pengenalan produk ke ${cardProfile.email}`,
            owner: "Perekam Rapat",
            dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            dueDateText: "besok",
            sourceMs: [20000],
          },
        ],
        openIssues: [],
        nextSteps: [{ text: "Tambahkan kontak ke agenda telepon", sourceMs: [] }],
        model: "gpt-4o-transcribe-v2",
        promptVersion: "1.2.0",
      },
      momReadAt: null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-start p-4 sm:p-6 pb-20 selection:bg-[#3b7cfa]">
      {/* Top Navbar */}
      <div className="w-full max-w-md flex items-center justify-between py-3 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tight">
            Cardi<span className="text-[#3b7cfa]">.id</span>
          </span>
          <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-mono">
            NFC TAP
          </span>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? "Tersalin!" : "Bagikan"}</span>
        </button>
      </div>

      <main className="w-full max-w-md flex flex-col gap-4">
        {/* PHYSICAL NFC CARD MOCKUP PREVIEW */}
        <div className="relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-[#1c1c1f] via-[#242429] to-[#0f0f11] p-6 border border-white/15 shadow-2xl flex flex-col justify-between overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#3b7cfa]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />

          {/* Card Top */}
          <div className="flex justify-between items-start z-10">
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                Cardi<span className="text-[#3b7cfa]">Card</span>
              </span>
              <p className="text-[10px] text-white/50 tracking-wider uppercase font-medium">
                Business & AI MoM Connected
              </p>
            </div>
            {/* NFC Contactless Wave Icon */}
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/90">
              <Radio className="w-5 h-5 text-[#3b7cfa] animate-pulse" />
            </div>
          </div>

          {/* Card Chip Symbol */}
          <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-[#e5c07b] via-[#f7df94] to-[#c99a4e] border border-[#ffecb3]/40 shadow-inner flex items-center justify-around px-1 z-10">
            <div className="w-[1px] h-full bg-black/20" />
            <div className="w-2.5 h-2.5 rounded-full border border-black/30" />
            <div className="w-[1px] h-full bg-black/20" />
          </div>

          {/* Card Bottom: Holder Name & Company */}
          <div className="flex justify-between items-end z-10">
            <div>
              <p className="text-sm font-bold tracking-wide text-white uppercase">
                {cardProfile.fullName}
              </p>
              <p className="text-[11px] text-white/60 font-light">
                {cardProfile.headline} · {cardProfile.company}
              </p>
            </div>
            <span className="text-[10px] font-mono text-white/40 tracking-widest">
              NTAG215
            </span>
          </div>
        </div>

        {/* PROFILE INFO CARD */}
        <div className="bg-[#18181b] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#3b7cfa] p-0.5 bg-black">
              {/* Avatar placeholder / photo */}
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#3b7cfa] to-[#1a4fbf] flex items-center justify-center text-xl font-bold text-white">
                {cardProfile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-[#10b981] border-2 border-[#18181b] w-5 h-5 rounded-full flex items-center justify-center" title="Online / Aktif">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>

          <h1 className="text-lg font-bold tracking-tight text-white mb-0.5">
            {cardProfile.fullName}
          </h1>
          <p className="text-xs text-[#3b7cfa] font-medium mb-1">
            {cardProfile.headline}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/60 mb-3">
            <span className="font-semibold text-white/80">{cardProfile.company}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-white/40" />
              {cardProfile.location}
            </span>
          </div>

          <p className="text-xs text-white/70 max-w-sm mb-4 leading-relaxed font-normal">
            {cardProfile.bio}
          </p>

          {/* PRIMARY BUTTON: SAVE CONTACT (.VCF) */}
          <div className="w-full flex flex-col gap-2">
            <a
              href={`/api/vcard/${username}?name=${encodeURIComponent(cardProfile.fullName)}&title=${encodeURIComponent(cardProfile.headline)}&company=${encodeURIComponent(cardProfile.company)}&phone=${encodeURIComponent(cardProfile.phone)}&email=${encodeURIComponent(cardProfile.email)}&website=${encodeURIComponent(cardProfile.website)}&address=${encodeURIComponent(cardProfile.location)}`}
              download={`${username}-contact.vcf`}
              className="w-full bg-[#3b7cfa] hover:bg-[#1a4fbf] text-white py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#3b7cfa]/20 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Simpan Kontak ke Telepon (.vcf)</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={cardProfile.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="bg-[#27272a] hover:bg-[#323238] border border-white/10 text-white py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4 text-[#10b981]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`mailto:${cardProfile.email}`}
                className="bg-[#27272a] hover:bg-[#323238] border border-white/10 text-white py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition"
              >
                <Mail className="w-4 h-4 text-[#3b7cfa]" />
                <span>Kirim Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* EXCLUSIVE INTEGRATION: CARDI MoM TRIGGER */}
        <div className="bg-gradient-to-r from-[#172033] to-[#111827] border-2 border-[#3b7cfa]/40 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b7cfa]/20 border border-[#3b7cfa]/40 flex items-center justify-center flex-shrink-0 text-[#3b7cfa]">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sedang Bertemu Sekarang?
                </h3>
                <span className="text-[10px] bg-[#3b7cfa] text-white px-2 py-0.2 rounded-full font-bold">
                  AI MoM
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed mb-3">
                Rekam percakapan rapat saat ini langsung via Cardi Agent. AI otomatis membuat notula formal &amp; action items.
              </p>
              <button
                onClick={() => setShowRecordModal(true)}
                className="w-full bg-gradient-to-r from-[#3b7cfa] to-[#2563eb] hover:from-[#1a4fbf] hover:to-[#1d4ed8] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Radio className="w-4 h-4 text-white" />
                <span>Mulai Rekam Meeting via Cardi MoM</span>
              </button>
            </div>
          </div>
        </div>

        {/* QUICK APPOINTMENT / SCHEDULE */}
        <div className="bg-[#18181b] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
              <Calendar className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Jadwalkan Pertemuan</h4>
              <p className="text-[11px] text-white/60">Pilih waktu luang di kalender</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/calendar")}
            className="text-xs bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-xl flex items-center gap-1 font-medium transition"
          >
            <span>Buka</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SOCIAL LINKS */}
        <div className="flex justify-center gap-3 py-2">
          {cardProfile.socials.linkedin && (
            <a
              href={cardProfile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
              title="LinkedIn"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {cardProfile.website && (
            <a
              href={cardProfile.website}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* FOOTER */}
        <footer className="text-center pt-2 pb-4 text-[11px] text-white/40">
          <p>Powered by Cardi Card &amp; MoM Ecosystem</p>
          <p className="text-[10px] mt-1 text-white/30">
            Tersedia di Play Store &amp; App Store
          </p>
        </footer>
      </main>

      {/* MODAL: LIVE RECORDING CARDI MoM */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#18181b] border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-150">
            <div className="w-full flex justify-between items-center pb-2 border-b border-white/10 mb-4">
              <span className="text-xs font-bold text-[#3b7cfa] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Cardi MoM Recorder
              </span>
              <button
                onClick={() => {
                  if (timerInterval) clearInterval(timerInterval);
                  setShowRecordModal(false);
                  setIsRecording(false);
                }}
                className="text-xs text-white/50 hover:text-white"
              >
                ✕ Tutup
              </button>
            </div>

            {!recordingSaved ? (
              <>
                <p className="text-sm font-semibold text-white mb-1">
                  Perekam Rapat Otomatis
                </p>
                <p className="text-xs text-white/60 mb-6">
                  {isRecording
                    ? "Sedang merekam suara rapat tatap muka..."
                    : "Tekan tombol di bawah untuk mulai merekam."}
                </p>

                {/* Animated Waveform Equalizer */}
                <div className="w-full h-16 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 px-4 mb-6">
                  {isRecording ? (
                    Array.from({ length: 18 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-[#3b7cfa] rounded-full animate-wave-bar"
                        style={{
                          animationDelay: `${(i % 5) * 0.15}s`,
                          height: `${Math.max(8, (i * 13) % 28)}px`,
                        }}
                      />
                    ))
                  ) : (
                    <span className="text-xs text-white/40">Mikrofon siap</span>
                  )}
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 mb-6">
                  {isRecording && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-record-dot" />
                  )}
                  <span className="text-2xl font-mono font-bold text-white">
                    {formatTimer(recordDuration)}
                  </span>
                </div>

                {/* Controls */}
                {!isRecording ? (
                  <button
                    onClick={startQuickRecord}
                    className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Mulai Rekam Suara</span>
                  </button>
                ) : (
                  <button
                    onClick={stopQuickRecord}
                    className="w-full bg-[#3b7cfa] hover:bg-[#2563eb] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <span>Selesai &amp; Proses Notula AI</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <CheckCircle className="w-12 h-12 text-[#10b981] mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">
                  Rekaman Berhasil Disimpan!
                </h4>
                <p className="text-xs text-white/70 mb-5 leading-relaxed">
                  Audio telah dienkripsi dan dikirim ke Cardi MoM. Ringkasan &amp; Action Items sedang diproses.
                </p>
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => router.push("/dashboard/mom")}
                    className="w-full bg-[#3b7cfa] hover:bg-[#1a4fbf] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <span>Buka Notula di Dashboard MoM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowRecordModal(false);
                      setRecordingSaved(false);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-white/80 py-2 rounded-xl text-xs"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
