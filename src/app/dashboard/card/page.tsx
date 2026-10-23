"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Radio,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Users,
  Mic,
  MessageCircle,
  Edit3,
  Save,
  Sparkles,
  Smartphone,
  Share2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ContactLead } from "@/lib/types";
import AudioRecordModal from "@/components/AudioRecordModal";

export default function DashboardCardPage() {
  const { cardProfile, updateCardProfile, leads } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [nfcWriteStatus, setNfcWriteStatus] = useState<string | null>(null);
  const [selectedLeadForMeeting, setSelectedLeadForMeeting] = useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(cardProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const cardPublicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${cardProfile.username}`
    : `https://cardi.co.id/${cardProfile.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardPublicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Web NFC API integration (Chrome on Android)
  const handleWriteNfc = async () => {
    if ("NDEFReader" in window) {
      try {
        setNfcWriteStatus("Dekatkan kartu fisik NFC ke bagian belakang ponsel Anda...");
        // @ts-expect-error - Web NFC standard API
        const ndef = new window.NDEFReader();
        await ndef.write({
          records: [{ recordType: "url", data: cardPublicUrl }],
        });
        setNfcWriteStatus("Sukses! Link profil kartu berhasil ditulis ke chip NFC.");
        setTimeout(() => setNfcWriteStatus(null), 4000);
      } catch (err) {
        setNfcWriteStatus("Gagal menulis NFC: Pastikan fitur NFC aktif dan izin diberikan.");
        setTimeout(() => setNfcWriteStatus(null), 4000);
      }
    } else {
      setNfcWriteStatus("Browser ini belum mendukung Web NFC. Anda dapat memprogram chip NTAG215 via aplikasi NFC Tools dengan URL di atas.");
      setTimeout(() => setNfcWriteStatus(null), 6000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCardProfile(editForm);
    setIsEditingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleStartMeetingWithLead = (leadName: string) => {
    setSelectedLeadForMeeting(leadName);
    setIsRecordModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#3b7cfa]" />
            Kartu Bisnis NFC &amp; Profil Digital
          </h1>
          <p className="text-xs text-white/60">
            Kelola profil digital kartu Anda, tulis ke chip fisik, dan pantau kontak masuk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Tersalin" : "Salin Link"}</span>
          </button>

          <Link
            href={`/${cardProfile.username}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3b7cfa] hover:bg-[#2563eb] text-xs font-bold text-white transition shadow-sm"
          >
            <span>Buka Profil Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Physical Card Preview & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Card Mockup Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center justify-between">
            <span>Tampilan Kartu Fisik</span>
            <span className="text-[10px] text-[#3b7cfa] font-mono">CHIP NTAG215</span>
          </div>

          {/* Physical Glossy Card */}
          <div className="relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-[#1c1c1f] via-[#242429] to-[#0d0d0f] p-6 border border-white/15 shadow-2xl flex flex-col justify-between overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#3b7cfa]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06)_0%,transparent_60%)] pointer-events-none" />

            {/* Top row */}
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  Cardi<span className="text-[#3b7cfa]">Card</span>
                </span>
                <p className="text-[9px] text-white/50 tracking-wider uppercase font-semibold">
                  Business &bull; AI MoM
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <Radio className="w-4 h-4 text-[#3b7cfa] animate-pulse" />
              </div>
            </div>

            {/* Gold Chip */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-[#e5c07b] via-[#f7df94] to-[#c99a4e] border border-[#ffecb3]/40 shadow-inner flex items-center justify-around px-1 z-10">
              <div className="w-[1px] h-full bg-black/25" />
              <div className="w-2 h-2 rounded-full border border-black/30" />
              <div className="w-[1px] h-full bg-black/25" />
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end z-10">
              <div>
                <p className="text-sm font-bold tracking-wide text-white uppercase">
                  {cardProfile.fullName}
                </p>
                <p className="text-[11px] text-white/60 font-light truncate max-w-[200px]">
                  {cardProfile.headline}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-white/40 block">SCAN / TAP</span>
                <span className="text-xs font-mono font-bold text-white/70">cardi.id</span>
              </div>
            </div>
          </div>

          {/* Quick Hardware Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWriteNfc}
              className="bg-[#1e1e24] hover:bg-[#25252e] border border-white/10 rounded-xl p-3 text-left transition flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Radio className="w-3.5 h-3.5 text-[#3b7cfa]" />
                <span>Tulis ke Chip NFC</span>
              </div>
              <p className="text-[10px] text-white/50">
                Program kartu fisik via Web NFC Android
              </p>
            </button>

            <button
              onClick={handleCopyLink}
              className="bg-[#1e1e24] hover:bg-[#25252e] border border-white/10 rounded-xl p-3 text-left transition flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <QrCode className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Salin URL Kartu</span>
              </div>
              <p className="text-[10px] text-white/50 truncate">
                /{cardProfile.username}
              </p>
            </button>
          </div>

          {nfcWriteStatus && (
            <div className="p-3 bg-[#3b7cfa]/10 border border-[#3b7cfa]/30 rounded-xl text-xs text-white/90">
              {nfcWriteStatus}
            </div>
          )}
        </div>

        {/* Right: Profile Editor / Overview (7 Cols) */}
        <div className="lg:col-span-7 bg-[#161619] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Data Profil Kartu Bisnis</h2>
              <p className="text-xs text-white/60">
                Informasi ini muncul ketika kartu NFC Anda di-tap atau QR di-scan.
              </p>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? "Batal" : "Edit Profil"}</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="mb-4 p-2.5 bg-[#10b981]/20 border border-[#10b981] rounded-xl text-xs text-[#10b981] font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Profil kartu bisnis berhasil diperbarui!</span>
            </div>
          )}

          {!isEditingProfile ? (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block mb-0.5">
                  Nama Lengkap
                </span>
                <p className="font-semibold text-white">{cardProfile.fullName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block mb-0.5">
                  Jabatan / Headline
                </span>
                <p className="font-semibold text-white">{cardProfile.headline}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block mb-0.5">
                  Perusahaan
                </span>
                <p className="font-semibold text-white">{cardProfile.company}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block mb-0.5">
                  Lokasi
                </span>
                <p className="font-semibold text-white">{cardProfile.location}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block mb-0.5">
                  Nomor WhatsApp / Telp
                </span>
                <p className="font-semibold text-white">{cardProfile.phone}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block mb-0.5">
                  Email
                </span>
                <p className="font-semibold text-white">{cardProfile.email}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-white/40 uppercase block mb-0.5">
                  Bio Singkat
                </span>
                <p className="text-white/80 leading-relaxed">{cardProfile.bio}</p>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-[#3b7cfa] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={editForm.headline}
                    onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                    className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-[#3b7cfa] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                    Perusahaan
                  </label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-[#3b7cfa] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-[#3b7cfa] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-[#3b7cfa] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-[#3b7cfa] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                  Bio Singkat
                </label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-[#3b7cfa] outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#3b7cfa] hover:bg-[#2563eb] text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* KONTAK MASUK / LEADS FROM NFC SCANS */}
      <div className="bg-[#161619] border border-white/10 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#10b981]" />
              Kontak Masuk &amp; Pertemuan Baru ({leads.length})
            </h3>
            <p className="text-xs text-white/60">
              Daftar orang yang bertukar kontak setelah tap kartu NFC Anda. Klik untuk langsung rekam MoM bersama mereka!
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase font-semibold text-[10px]">
                <th className="pb-2.5">Nama &amp; Perusahaan</th>
                <th className="pb-2.5">Kontak</th>
                <th className="pb-2.5">Catatan Pertemuan</th>
                <th className="pb-2.5">Waktu Tap</th>
                <th className="pb-2.5 text-right">Aksi Terintegrasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead: ContactLead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition">
                  <td className="py-3 pr-3">
                    <p className="font-bold text-white">{lead.name}</p>
                    <p className="text-[11px] text-white/60">{lead.company}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <p className="text-white/80">{lead.phone}</p>
                    <p className="text-[11px] text-white/50">{lead.email}</p>
                  </td>
                  <td className="py-3 pr-3 max-w-xs">
                    <p className="text-white/70 line-clamp-1">{lead.notes}</p>
                  </td>
                  <td className="py-3 pr-3 text-white/50 text-[11px]">
                    {new Date(lead.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#10b981]" />
                        </a>
                      )}
                      {/* PRIMARY INTEGRATION: START MOM RECORDING WITH THIS LEAD */}
                      <button
                        onClick={() => handleStartMeetingWithLead(lead.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b7cfa]/20 hover:bg-[#3b7cfa]/30 border border-[#3b7cfa]/40 text-[#3b7cfa] hover:text-white text-xs font-bold transition"
                        title="Mulai Rekaman MoM Otomatis Bersama Kontak Ini"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Rekam MoM</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal with selected lead */}
      <AudioRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        defaultAttendee={selectedLeadForMeeting || undefined}
      />
    </div>
  );
}
