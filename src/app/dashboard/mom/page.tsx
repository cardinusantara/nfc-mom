"use client";

import React, { useState } from "react";
import {
  Mic,
  FileText,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  Share2,
  Download,
  Search,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Meeting } from "@/lib/types";
import AudioRecordModal from "@/components/AudioRecordModal";

export default function DashboardMomPage() {
  const { meetings } = useAppStore();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    meetings[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const filteredMeetings = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.attendees?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const formatWhatsAppMinutes = (m: Meeting) => {
    if (!m.mom) return "";
    const lines = [
      `*NOTULA RAPAT: ${m.title.toUpperCase()}*`,
      `📅 Tanggal: ${m.date} | ⏱️ Durasi: ${m.durationMinutes} menit`,
      `👥 Peserta: ${m.attendees}`,
      ``,
      `*RINGKASAN EKSEKUTIF:*`,
      m.mom.executiveSummary,
      ``,
      `*KEPUTUSAN:*`,
      ...m.mom.decisions.map((d, i) => `${i + 1}. ${d.text}`),
      ``,
      `*ACTION ITEMS (TINDAK LANJUT):*`,
      ...m.mom.actionItems.map(
        (ai, i) => `${i + 1}. ${ai.item} [PIC: ${ai.owner || "-"}] (Deadline: ${ai.dueDateText || ai.dueDate || "-"})`
      ),
      ``,
      `_Diringkas otomatis oleh Cardi AI Agent (aiagent.cardi.co.id)_`,
    ];
    return lines.join("\n");
  };

  const handleShareToWhatsApp = () => {
    if (!selectedMeeting) return;
    const text = encodeURIComponent(formatWhatsAppMinutes(selectedMeeting));
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleCopyMinutes = () => {
    if (!selectedMeeting) return;
    navigator.clipboard.writeText(formatWhatsAppMinutes(selectedMeeting));
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#3b7cfa]" />
            Cardi MoM &bull; Notula Rapat &amp; AI Intelligence
          </h1>
          <p className="text-xs text-white/60">
            Rekam pembicaraan rapat tatap muka, transkripsi otomatis, dan ringkasan eksekutif AI.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 transition active:scale-[0.98]"
        >
          <Mic className="w-4 h-4" />
          <span>Rekam Rapat Baru</span>
        </button>
      </div>

      {/* 2-Column Split: Meeting List (Left) and Meeting Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meeting List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              placeholder="Cari judul atau nama peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#3b7cfa]"
            />
          </div>

          {/* Cards List */}
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-10 bg-[#161619] rounded-2xl border border-white/10 p-4">
                <p className="text-xs text-white/50">Tidak ada rapat ditemukan.</p>
              </div>
            ) : (
              filteredMeetings.map((mtg) => {
                const isSelected = mtg.id === selectedMeeting?.id;
                return (
                  <div
                    key={mtg.id}
                    onClick={() => setSelectedMeetingId(mtg.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
                      isSelected
                        ? "bg-[#1c2438] border-[#3b7cfa] shadow-md"
                        : "bg-[#161619] border-white/10 hover:border-white/20 hover:bg-[#1a1a1e]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {mtg.title}
                      </h4>
                      <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        Selesai
                      </span>
                    </div>

                    <p className="text-[11px] text-white/60 line-clamp-2 mb-2 italic">
                      {mtg.mom?.shortSummary || "Ringkasan rapat..."}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {mtg.date}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {mtg.durationMinutes} menit
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Meeting Detail (8 Cols) */}
        <div className="lg:col-span-8 bg-[#161619] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col min-h-[600px]">
          {selectedMeeting ? (
            <div className="space-y-6">
              {/* Meeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-[#3b7cfa]/20 text-[#3b7cfa] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Cardi MoM Verified
                    </span>
                    <span className="text-xs text-white/40">&bull;</span>
                    <span className="text-xs text-white/50">{selectedMeeting.location || "Tatap Muka"}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {selectedMeeting.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#3b7cfa]" />
                      {selectedMeeting.date}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                      {selectedMeeting.durationMinutes} Menit
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#10b981]" />
                      {selectedMeeting.attendees}
                    </span>
                  </div>
                </div>

                {/* Export & Share buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareToWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition shadow-sm"
                    title="Bagikan ke WhatsApp Group"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyMinutes}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition"
                    title="Salin Teks Notula Lengkap"
                  >
                    {copiedShare ? (
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedShare ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
              </div>

              {/* 1. Ringkasan Eksekutif */}
              <div className="bg-[#202026] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#3b7cfa] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Ringkasan Eksekutif</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-normal">
                  {selectedMeeting.mom?.executiveSummary}
                </p>
              </div>

              {/* 2. Poin-poin Pembahasan */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Poin Pembahasan Rapat
                </h3>
                <div className="space-y-2.5">
                  {selectedMeeting.mom?.discussionPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs"
                    >
                      <h4 className="font-bold text-white mb-1">{pt.topic}</h4>
                      <p className="text-white/70 leading-relaxed">{pt.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Keputusan Rapat */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Keputusan yang Disepakati
                </h3>
                <div className="space-y-2">
                  {selectedMeeting.mom?.decisions.map((dec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 bg-[#10b981]/10 border border-[#10b981]/25 rounded-xl text-xs text-white/90"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                      <span>{dec.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Action Items (Tindak Lanjut) */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Action Items (Tindak Lanjut &amp; PIC)
                </h3>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-white/50 uppercase text-[10px]">
                        <th className="p-2.5">Tugas / Item</th>
                        <th className="p-2.5">Penanggung Jawab</th>
                        <th className="p-2.5">Tenggat Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedMeeting.mom?.actionItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition">
                          <td className="p-2.5 font-medium text-white">{item.item}</td>
                          <td className="p-2.5 text-white/70">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">
                              {item.owner || "Belum ditentukan"}
                            </span>
                          </td>
                          <td className="p-2.5 text-white/60 font-mono text-[11px]">
                            {item.dueDateText || item.dueDate || "Segera"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <FileText className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-xs text-white/50">Pilih salah satu rapat untuk melihat detail notula.</p>
            </div>
          )}
        </div>
      </div>

      {/* Record Modal */}
      <AudioRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </div>
  );
}
