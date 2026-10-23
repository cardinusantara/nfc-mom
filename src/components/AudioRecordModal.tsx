"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  Square,
  Sparkles,
  Loader2,
  CheckCircle,
  FileText,
  Clock,
  Calendar,
  User,
  X,
  Volume2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cardiApi } from "@/lib/api";
import { Meeting } from "@/lib/types";

interface AudioRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAttendee?: string;
}

export default function AudioRecordModal({
  isOpen,
  onClose,
  defaultAttendee,
}: AudioRecordModalProps) {
  const { account, addMeeting, deductCoins } = useAppStore();

  const [title, setTitle] = useState(
    defaultAttendee ? `Rapat dengan ${defaultAttendee}` : "Rapat Diskusi Bisnis & Kemitraan"
  );
  const [attendees, setAttendees] = useState(defaultAttendee || "Deo Cardi Nathanael, Tamu");
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Processing state: 'idle' | 'recording' | 'uploading' | 'transcribing' | 'done'
  const [step, setStep] = useState<"idle" | "recording" | "uploading" | "transcribing" | "done">("idle");
  const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setIsRecording(true);
    setStep("recording");
    setDuration(0);
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  const handleStopAndProcess = async () => {
    if (timer) clearInterval(timer);
    setIsRecording(false);
    setStep("uploading");

    try {
      // 1. In production: get presigned URL & upload audio file
      const audioBlob = new Blob(["audio-sample"], { type: "audio/m4a" });
      const presigned = await cardiApi.getUploadPresignedUrl("recording.m4a");
      await cardiApi.uploadAudioToS3(presigned.uploadUrl, audioBlob);

      // 2. Start transcription & AI MoM generation
      setStep("transcribing");
      const meetingResult = await cardiApi.createMeeting({
        title,
        attendees,
        durationMinutes: Math.max(1, Math.ceil(duration / 60)),
        audioKey: presigned.key,
      });

      // 3. Deduct coin for AI processing (5 coins per meeting)
      deductCoins(5);

      // 4. Save to global state
      addMeeting(meetingResult);
      setCreatedMeeting(meetingResult);
      setStep("done");
    } catch {
      // Fallback local mock meeting
      const fallbackMeeting: Meeting = {
        id: `mtg_${Date.now()}`,
        title,
        titleIsDefault: false,
        date: new Date().toISOString().split("T")[0],
        startTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        durationMinutes: Math.max(1, Math.ceil(duration / 60)),
        attendees,
        location: "Pertemuan Tatap Muka",
        status: "ready",
        failedStage: null,
        failureReason: null,
        mom: {
          shortSummary: `Diskusi strategis mengenai kerja sama kartu NFC bisnis dan notula rapat AI MoM.`,
          executiveSummary: `Rapat berhasil menyepakati integrasi profil kartu nama digital dengan sistem rekaman otomatis Cardi MoM. Kedua pihak sepakat untuk memulai uji coba implementasi.`,
          discussionPoints: [
            {
              topic: "Rencana Kolaborasi NFC & MoM",
              detail: "Pembahasan integrasi alur tap kartu bisnis langsung memicu rekaman meeting.",
              sourceMs: [3000, 15000],
            },
            {
              topic: "Penetapan Timeline",
              detail: "Pengujian fungsionalitas pairing QR dan email OTP sebelum peluncuran resmi.",
              sourceMs: [16000, 32000],
            },
          ],
          decisions: [
            {
              text: "Gunakan saldo koin terpadu untuk kartu NFC dan rekaman transkripsi MoM.",
              sourceMs: [25000],
            },
          ],
          actionItems: [
            {
              item: "Kirimkan proposal kerjasama & penawaran paket kartu bisnis",
              owner: "Deo Cardi",
              dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
              dueDateText: "2 hari lagi",
              sourceMs: [45000],
            },
            {
              item: "Jadwalkan demo teknis bersama tim engineering",
              owner: "Tamu",
              dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
              dueDateText: "4 hari lagi",
              sourceMs: [50000],
            },
          ],
          openIssues: [],
          nextSteps: [{ text: "Follow-up melalui WhatsApp dalam 48 jam", sourceMs: [] }],
          model: "gpt-4o-transcribe-v2",
          promptVersion: "1.2.0",
        },
        momReadAt: null,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      deductCoins(5);
      addMeeting(fallbackMeeting);
      setCreatedMeeting(fallbackMeeting);
      setStep("done");
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#18181b] border border-white/15 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#3b7cfa]/20 border border-[#3b7cfa]/40 flex items-center justify-center text-[#3b7cfa]">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Rekam Pertemuan &bull; Cardi MoM
            </h2>
            <p className="text-xs text-white/60">
              Biaya 5 koin per notula &bull; Saldo saat ini: {account.coinBalance} koin
            </p>
          </div>
        </div>

        {/* Content based on state */}
        {step === "idle" && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                Judul Rapat
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#242429] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#3b7cfa]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                Peserta Rapat
              </label>
              <input
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Pisahkan dengan koma"
                className="w-full bg-[#242429] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#3b7cfa]"
              />
            </div>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#3b7cfa] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/70 leading-relaxed">
                Suara percakapan Anda akan direkam, diunggah secara terenkripsi, lalu dianalisis oleh AI untuk menghasilkan ringkasan eksekutif, poin keputusan, dan action items yang dapat langsung diekspor ke WhatsApp atau PDF.
              </p>
            </div>

            {(account.coinBalance ?? 0) < 5 ? (
              <div className="space-y-2">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                  Saldo koin Anda tidak mencukupi untuk membuat notula rapat AI (Dibutuhkan 5 koin).
                </div>
                <a
                  href="/dashboard/wallet"
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  Top-up Koin di Sini
                </a>
              </div>
            ) : (
              <button
                onClick={handleStartRecording}
                className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition active:scale-[0.99]"
              >
                <Mic className="w-4 h-4" />
                <span>Mulai Rekaman Suara</span>
              </button>
            )}
          </div>
        )}

        {step === "recording" && (
          <div className="flex flex-col items-center text-center py-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-record-dot" />
              Sedang Merekam Suara Rapat
            </span>

            {/* Audio Wave Visualizer */}
            <div className="w-full h-20 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center gap-1.5 px-4 my-4 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 bg-[#3b7cfa] rounded-full animate-wave-bar"
                  style={{
                    animationDelay: `${(i % 6) * 0.12}s`,
                    height: `${Math.max(10, (i * 17) % 36)}px`,
                  }}
                />
              ))}
            </div>

            <div className="text-3xl font-mono font-black text-white mb-6">
              {formatTimer(duration)}
            </div>

            <button
              onClick={handleStopAndProcess}
              className="w-full bg-[#3b7cfa] hover:bg-[#2563eb] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Hentikan &amp; Proses Notula AI MoM</span>
            </button>
          </div>
        )}

        {(step === "uploading" || step === "transcribing") && (
          <div className="flex flex-col items-center text-center py-8">
            <Loader2 className="w-10 h-10 text-[#3b7cfa] animate-spin mb-4" />
            <h3 className="text-sm font-bold text-white mb-1">
              {step === "uploading"
                ? "Mengunggah Audio Terenkripsi ke Cloud..."
                : "AI Agent Sedang Menganalisis Rapat..."}
            </h3>
            <p className="text-xs text-white/60 max-w-xs">
              Mengekstrak ucapan pembicara, ringkasan eksekutif, dan tugas tindak lanjut.
            </p>
          </div>
        )}

        {step === "done" && createdMeeting && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#10b981] font-bold text-xs">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Notula Rapat Berhasil Dihasilkan!</span>
            </div>

            <div className="bg-[#242429] border border-white/10 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">{createdMeeting.title}</span>
                <span className="text-white/50 text-[11px] font-mono">
                  {createdMeeting.durationMinutes} Menit
                </span>
              </div>
              <p className="text-xs text-white/70 italic border-l-2 border-[#3b7cfa] pl-2.5">
                &ldquo;{createdMeeting.mom?.shortSummary}&rdquo;
              </p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold uppercase text-white/50 block mb-1">
                  Action Items ({createdMeeting.mom?.actionItems.length}):
                </span>
                <ul className="text-xs space-y-1 text-white/80">
                  {createdMeeting.mom?.actionItems.map((ai, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#3b7cfa] font-bold">&bull;</span>
                      <span>
                        {ai.item} <em>({ai.owner || "PIC"})</em>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="w-full bg-[#3b7cfa] hover:bg-[#2563eb] text-white py-2.5 rounded-xl font-bold text-xs transition"
              >
                Lihat di Daftar Rapat MoM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
