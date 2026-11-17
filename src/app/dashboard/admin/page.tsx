"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Radio,
  Search,
  RefreshCw,
  ExternalLink,
  Trash2,
  Check,
  X,
  TrendingUp,
  Mic,
  AlertCircle,
  Phone,
  Mail,
  Tag,
  Download,
} from "lucide-react";
import { useAppStore, useAuthSession } from "@/lib/store";
import { isAdminEmail } from "@/lib/adminAuth";
import type { CardProfile } from "@/lib/types";

export default function AdminDashboardPage() {
  const { theme } = useAppStore();
  const { hasHydrated, isAuthenticated, account, sessionToken } = useAuthSession();
  const isDark = theme === "dark";

  const isAdmin = Boolean(
    hasHydrated &&
    isAuthenticated &&
    account?.email &&
    isAdminEmail(account.email)
  );

  const [profiles, setProfiles] = useState<CardProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [actionLoadingUser, setActionLoadingUser] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cards", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${sessionToken || ""}`,
          "x-admin-email": account?.email || "",
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles(data.profiles || []);
      } else {
        setError(data.error || "Gagal mengambil daftar kartu dari database");
      }
    } catch {
      setError("Koneksi ke server database terputus");
    } finally {
      setLoading(false);
    }
  }, [sessionToken, account]);

  useEffect(() => {
    let ignore = false;
    if (isAdmin) {
      fetch("/api/admin/cards", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${sessionToken || ""}`,
          "x-admin-email": account?.email || "",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) {
            if (data.success) {
              setProfiles(data.profiles || []);
            } else {
              setError(data.error || "Gagal mengambil daftar kartu dari database");
            }
            setLoading(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            setError("Koneksi ke server database terputus");
            setLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [isAdmin, sessionToken, account]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleActive = async (profile: CardProfile) => {
    setActionLoadingUser(profile.username);
    try {
      const nextStatus = !profile.isActivated;
      const res = await fetch("/api/admin/cards", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken || ""}`,
          "x-admin-email": account?.email || "",
        },
        body: JSON.stringify({
          username: profile.username,
          isActivated: nextStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.username === profile.username ? { ...p, isActivated: nextStatus } : p
          )
        );
        showToast(
          `Status kartu @${profile.username} diubah ke ${
            nextStatus ? "Aktif" : "Nonaktif"
          }`
        );
      } else {
        alert(data.error || "Gagal mengubah status aktivasi kartu");
      }
    } catch {
      alert("Gagal menghubungi server");
    } finally {
      setActionLoadingUser(null);
    }
  };

  const handleDeleteCard = async (username: string) => {
    setActionLoadingUser(username);
    try {
      const res = await fetch(
        `/api/admin/cards?username=${encodeURIComponent(username)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionToken || ""}`,
            "x-admin-email": account?.email || "",
          },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles((prev) => prev.filter((p) => p.username !== username));
        setDeleteConfirmUser(null);
        showToast(`Kartu @${username} berhasil dihapus dari database`);
      } else {
        alert(data.error || "Gagal menghapus data kartu");
      }
    } catch {
      alert("Gagal menghapus kartu dari server");
    } finally {
      setActionLoadingUser(null);
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        p.username.toLowerCase().includes(query) ||
        (p.fullName && p.fullName.toLowerCase().includes(query)) ||
        (p.email && p.email.toLowerCase().includes(query)) ||
        (p.tagId && p.tagId.toLowerCase().includes(query)) ||
        (p.company && p.company.toLowerCase().includes(query));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActivated) ||
        (statusFilter === "inactive" && !p.isActivated);

      return matchSearch && matchStatus;
    });
  }, [profiles, searchQuery, statusFilter]);

  const exportCardsToCsv = () => {
    if (profiles.length === 0) return;
    const headers = [
      "Username",
      "Tag ID",
      "Nama Lengkap",
      "Headline",
      "Perusahaan",
      "Email",
      "No. HP",
      "Status Aktivasi",
      "Total Taps",
      "Kontak Tersimpan",
      "MoM Diinisiasi",
      "Dibuat",
    ];
    const rows = profiles.map((p) => [
      `"${(p.username || "").replace(/"/g, '""')}"`,
      `"${(p.tagId || "").replace(/"/g, '""')}"`,
      `"${(p.fullName || "").replace(/"/g, '""')}"`,
      `"${(p.headline || "").replace(/"/g, '""')}"`,
      `"${(p.company || "").replace(/"/g, '""')}"`,
      `"${(p.email || "").replace(/"/g, '""')}"`,
      `"${(p.phone || "").replace(/"/g, '""')}"`,
      `"${p.isActivated ? "Aktif" : "Nonaktif"}"`,
      `"${p.metrics?.totalTaps ?? 0}"`,
      `"${p.metrics?.contactsSaved ?? 0}"`,
      `"${p.metrics?.momInitiated ?? 0}"`,
      `"${p.createdAt ? new Date(p.createdAt).toISOString() : ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `cardi_semua_kartu_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    const total = profiles.length;
    const active = profiles.filter((p) => p.isActivated).length;
    const totalTaps = profiles.reduce(
      (acc, cur) => acc + (cur.metrics?.totalTaps || 0),
      0
    );
    const totalMom = profiles.reduce(
      (acc, cur) => acc + (cur.metrics?.momInitiated || 0),
      0
    );
    return { total, active, totalTaps, totalMom };
  }, [profiles]);

  if (!hasHydrated) {
    return (
      <div className="py-24 text-center space-y-3 animate-in fade-in duration-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-500" />
        <p className="text-xs font-bold opacity-60">Memeriksa hak akses admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-500/5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-mono font-bold uppercase tracking-wider">
            403 Forbidden
          </div>
          <h1
            className={`text-2xl font-black tracking-tight ${
              isDark ? "text-white" : "text-[#0A1633]"
            }`}
          >
            Akses Ditolak
          </h1>
          <p
            className={`text-xs leading-relaxed ${
              isDark ? "text-white/60" : "text-slate-500"
            }`}
          >
            Halaman konsol administrasi ini dilindungi dan hanya dapat diakses oleh administrator terdaftar (<strong className="font-mono text-sky-500">cardinusantara@gmail.com</strong> dan <strong className="font-mono text-sky-500">dimasaldi428@gmail.com</strong>).
          </p>
          {account?.email && (
            <p className="text-[11px] opacity-50 font-mono">
              Akun aktif: {account.email}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-xs"
            >
              Masuk sebagai Admin
            </Link>
          ) : (
            <Link
              href="/dashboard/card"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-xs"
            >
              Kembali ke Dashboard Kartu
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-3">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b transition-colors ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-sky-500/15 text-sky-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Database SQLite
            </span>
            <span className="text-xs opacity-40">&bull;</span>
            <span className="text-xs opacity-60">Admin Console</span>
          </div>
          <h1
            className={`text-2xl font-black tracking-tight ${
              isDark ? "text-white" : "text-[#0A1633]"
            }`}
          >
            Kelola Kartu & Profil Pengguna
          </h1>
          <p
            className={`text-xs mt-1 max-w-xl ${
              isDark ? "text-white/60" : "text-slate-500"
            }`}
          >
            Pantau semua kartu NFC yang terdaftar, status aktivasi, kepemilikan tag fisik, dan metrik interaksi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchCards}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition ${
              isDark
                ? "bg-white/5 hover:bg-white/10 border-white/15 text-white"
                : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan Data</span>
          </button>

          <button
            type="button"
            onClick={exportCardsToCsv}
            disabled={profiles.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition ${
              profiles.length === 0
                ? "opacity-40 cursor-not-allowed border-slate-300 dark:border-white/10"
                : isDark
                ? "bg-white/5 hover:bg-white/10 border-white/15 text-white"
                : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs"
            }`}
            title="Ekspor seluruh data kartu ke file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/activate"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white text-xs font-bold transition shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
            <span>Aktivasi Kartu Baru</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-2xl border transition ${
            isDark
              ? "bg-[#0E1A33] border-white/10 shadow-lg"
              : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
              Total Terdaftar
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight mb-1">
            {stats.total}
          </div>
          <span className="text-[10px] opacity-60">Profil kartu di database</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            isDark
              ? "bg-[#0E1A33] border-white/10 shadow-lg"
              : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
              Kartu Aktif
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight mb-1 text-emerald-500">
            {stats.active}
          </div>
          <span className="text-[10px] opacity-60">Siap di-tap dan dibuka klien</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            isDark
              ? "bg-[#0E1A33] border-white/10 shadow-lg"
              : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
              Total Interaksi Tap
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight mb-1">
            {stats.totalTaps}
          </div>
          <span className="text-[10px] opacity-60 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Akumulasi kunjungan profil</span>
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            isDark
              ? "bg-[#0E1A33] border-white/10 shadow-lg"
              : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
              Meeting AI Dimulai
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight mb-1">
            {stats.totalMom}
          </div>
          <span className="text-[10px] opacity-60">Sesi MoM lewat kartu</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition ${
          isDark
            ? "bg-[#0E1A33] border-white/10 shadow-lg"
            : "bg-white border-slate-200 shadow-xs"
        }`}
      >
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            placeholder="Cari username, nama, email, tag ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border outline-none transition ${
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-sky-500"
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-50 mr-1 hidden sm:inline">
            Status:
          </span>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-sky-600 text-white shadow-xs"
                : isDark
                ? "bg-white/5 text-slate-300 hover:bg-white/10"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Semua ({profiles.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white shadow-xs"
                : isDark
                ? "bg-white/5 text-slate-300 hover:bg-white/10"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Aktif ({profiles.filter((p) => p.isActivated).length})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === "inactive"
                ? "bg-red-600 text-white shadow-xs"
                : isDark
                ? "bg-white/5 text-slate-300 hover:bg-white/10"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Nonaktif ({profiles.filter((p) => !p.isActivated).length})
          </button>
        </div>
      </div>

      {/* Main Table / List View */}
      <div
        className={`rounded-2xl border overflow-hidden transition ${
          isDark
            ? "bg-[#0E1A33] border-white/10 shadow-xl"
            : "bg-white border-slate-200 shadow-xs"
        }`}
      >
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-500 mb-3" />
            <p className="text-xs font-bold opacity-60">Memuat data dari database...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
            <p className="text-xs font-bold">{error}</p>
            <button
              onClick={fetchCards}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="py-16 text-center opacity-60">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold">Tidak ada kartu yang cocok</p>
            <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b font-mono uppercase tracking-wider text-[11px] ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white/60"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <th className="py-3.5 px-4 font-semibold">Pengguna & Profil</th>
                  <th className="py-3.5 px-4 font-semibold">Chip NFC / Tag ID</th>
                  <th className="py-3.5 px-4 font-semibold">Kontak</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Metrik</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredProfiles.map((p) => {
                  const isActionLoading = actionLoadingUser === p.username;

                  return (
                    <tr
                      key={p.username}
                      className={`transition ${
                        isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* 1. Pengguna & Profil */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                            {p.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.avatarUrl}
                                alt={p.fullName || p.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{(p.fullName || p.username).charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm leading-tight flex items-center gap-2">
                              <span>{p.fullName || "Tanpa Nama"}</span>
                              {p.username === "deo" && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] opacity-60 font-mono mt-0.5">
                              @{p.username}
                            </div>
                            {p.headline && (
                              <div className="text-[10px] text-sky-500 font-semibold mt-0.5">
                                {p.headline} {p.company ? `(${p.company})` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Chip NFC / Tag ID */}
                      <td className="py-4 px-4 align-middle">
                        {p.tagId ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 font-mono text-[11px] font-bold">
                            <Tag className="w-3 h-3" />
                            <span>{p.tagId}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-white/30 italic text-[11px]">
                            Belum dipasangkan
                          </span>
                        )}
                        <div className="text-[10px] opacity-40 font-mono mt-1">
                          Desain: {p.cardDesign || "black-gold"}
                        </div>
                      </td>

                      {/* 3. Kontak */}
                      <td className="py-4 px-4 align-middle">
                        <div className="space-y-1 text-[11px]">
                          {p.email ? (
                            <div className="flex items-center gap-1.5 opacity-80">
                              <Mail className="w-3 h-3 text-sky-400 flex-shrink-0" />
                              <span className="truncate max-w-[170px]">{p.email}</span>
                            </div>
                          ) : null}
                          {p.phone ? (
                            <div className="flex items-center gap-1.5 opacity-80 font-mono">
                              <Phone className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>{p.phone}</span>
                            </div>
                          ) : null}
                          {!p.email && !p.phone && (
                            <span className="text-slate-400 dark:text-white/30 italic">
                              Tidak ada kontak
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Status Aktivasi */}
                      <td className="py-4 px-4 align-middle text-center">
                        <button
                          onClick={() => handleToggleActive(p)}
                          disabled={isActionLoading}
                          title={p.isActivated ? "Klik untuk Nonaktifkan" : "Klik untuk Aktifkan"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition border ${
                            p.isActivated
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/25"
                              : "bg-red-500/15 border-red-500/30 text-red-500 hover:bg-red-500/25"
                          }`}
                        >
                          {p.isActivated ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 5. Metrik Interaksi */}
                      <td className="py-4 px-4 align-middle text-center">
                        <div className="inline-flex items-center gap-3 font-mono text-[11px]">
                          <div title="Total Kunjungan Tap">
                            <span className="font-bold text-sky-500">
                              {p.metrics?.totalTaps ?? 0}
                            </span>
                            <span className="text-[10px] opacity-40 ml-0.5">tap</span>
                          </div>
                          <span className="opacity-30">|</span>
                          <div title="MoM Dibuat">
                            <span className="font-bold text-amber-500">
                              {p.metrics?.momInitiated ?? 0}
                            </span>
                            <span className="text-[10px] opacity-40 ml-0.5">MoM</span>
                          </div>
                        </div>
                      </td>

                      {/* 6. Aksi */}
                      <td className="py-4 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/${p.username}`}
                            target="_blank"
                            className={`p-2 rounded-xl border transition ${
                              isDark
                                ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                            }`}
                            title="Buka Halaman Tap Publik"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setDeleteConfirmUser(p.username)}
                            disabled={isActionLoading}
                            className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition"
                            title="Hapus Kartu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl space-y-4 animate-in zoom-in-95 duration-100 ${
              isDark
                ? "bg-[#0E1A33] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Hapus Kartu Pengguna?</h3>
                <p className="text-[11px] opacity-60">Tindakan ini permanen</p>
              </div>
            </div>

            <p className="text-xs opacity-80 leading-relaxed">
              Kartu milik <strong className="font-mono text-sky-400">@{deleteConfirmUser}</strong> akan dihapus dari database SQLite. Profil tap tidak akan dapat diakses lagi.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCard(deleteConfirmUser)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition"
              >
                Ya, Hapus Kartu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
