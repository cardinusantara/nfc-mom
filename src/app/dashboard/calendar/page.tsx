"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Mic,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import AudioRecordModal from "@/components/AudioRecordModal";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string;
  location: string;
  status: "upcoming" | "completed";
  source: "NFC Tap" | "MoM Action Item" | "Manual";
}

export default function DashboardCalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "ev_1",
      title: "Follow-up Demo Integrasi NFC Card & MoM",
      date: "2026-10-24",
      time: "14:00 - 15:00",
      attendees: "Deo Cardi Nathanael, Budi Santoso",
      location: "Google Meet / Kantor Cardi",
      status: "upcoming",
      source: "MoM Action Item",
    },
    {
      id: "ev_2",
      title: "Presentasi Kartu Bisnis Perusahaan",
      date: "2026-10-26",
      time: "10:30 - 11:30",
      attendees: "Siti Rahmawati (PT Samudra)",
      location: "Plaza Senayan, Jakarta",
      status: "upcoming",
      source: "NFC Tap",
    },
    {
      id: "ev_3",
      title: "Rapat Perdana Pertukaran Kartu NFC",
      date: "2026-10-21",
      time: "16:00 - 16:25",
      attendees: "Budi Santoso",
      location: "Starbucks Pacific Place",
      status: "completed",
      source: "NFC Tap",
    },
  ]);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<string | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("2026-10-25");
  const [newTime, setNewTime] = useState("10:00");
  const [newAttendees, setNewAttendees] = useState("");
  const [newLocation, setNewLocation] = useState("Pertemuan Tatap Muka");

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setEvents([
      ...events,
      {
        id: `ev_${Date.now()}`,
        title: newTitle,
        date: newDate,
        time: newTime,
        attendees: newAttendees || "Deo Cardi Nathanael",
        location: newLocation,
        status: "upcoming",
        source: "Manual",
      },
    ]);
    setShowAddModal(false);
    setNewTitle("");
    setNewAttendees("");
  };

  const handleStartRecordForEvent = (attendees: string) => {
    setSelectedAttendee(attendees);
    setIsRecordModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#f59e0b]" />
            Agenda &amp; Jadwal Follow-up Rapat
          </h1>
          <p className="text-xs text-white/60">
            Sinkronisasi jadwal otomatis dari action items notula MoM dan pertukaran kartu NFC.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#3b7cfa] hover:bg-[#2563eb] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Baru</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-[#161619] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-white/20 transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-mono">
                  {ev.source}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ev.status === "upcoming"
                      ? "bg-[#3b7cfa]/20 text-[#3b7cfa]"
                      : "bg-[#10b981]/20 text-[#10b981]"
                  }`}
                >
                  {ev.status === "upcoming" ? "Mendatang" : "Selesai"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{ev.title}</h3>

              <div className="space-y-1.5 text-xs text-white/70 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#3b7cfa]" />
                  <span>{ev.date}</span>
                  <span className="text-white/40">&bull;</span>
                  <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span className="font-mono">{ev.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>{ev.attendees}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-white/40" />
                  <span>{ev.location}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="text-[10px] text-white/40">
                {ev.status === "completed" ? "Notula MoM tersedia" : "Siap direkam"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartRecordForEvent(ev.attendees)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444]/30 border border-[#ef4444]/40 text-red-400 text-xs font-bold transition"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Mulai MoM</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#18181b] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-white">
            <h3 className="text-sm font-bold text-white mb-4">
              Jadwalkan Pertemuan Baru
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                  Judul Pertemuan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diskusi Kerjasama Kartu NFC"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#3b7cfa]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#3b7cfa]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                    Jam
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#3b7cfa]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                  Peserta
                </label>
                <input
                  type="text"
                  placeholder="Nama kolega atau prospek"
                  value={newAttendees}
                  onChange={(e) => setNewAttendees(e.target.value)}
                  className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#3b7cfa]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#202024] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#3b7cfa]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#3b7cfa] hover:bg-[#2563eb] text-white font-bold text-xs"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Modal */}
      <AudioRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        defaultAttendee={selectedAttendee}
      />
    </div>
  );
}
