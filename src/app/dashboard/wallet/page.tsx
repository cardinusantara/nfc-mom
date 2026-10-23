"use client";

import React, { useState } from "react";
import {
  Coins,
  Smartphone,
  CheckCircle,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  Mail,
  Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { CoinTransaction } from "@/lib/types";
import PairingModal from "@/components/PairingModal";

export default function DashboardWalletPage() {
  const { account, coinHistory, addCoins } = useAppStore();
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);

  const coinPackages = [
    { coins: 50, price: "Rp 25.000", tag: "Starter", desc: "10x transkripsi notula rapat AI" },
    { coins: 150, price: "Rp 65.000", tag: "Terpopuler", desc: "30x transkripsi + prioritas processing", popular: true },
    { coins: 500, price: "Rp 180.000", tag: "Bisnis", desc: "100x transkripsi + integrasi tim" },
  ];

  const handleBuyPackage = (coins: number, label: string) => {
    addCoins(coins, `Top-up Paket ${label}`);
    setTopUpSuccess(`Berhasil mengisi ${coins} Koin (${label})! Saldo koin telah diperbarui.`);
    setTimeout(() => setTopUpSuccess(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#f59e0b]" />
            Saldo Koin Terpadu &amp; Koneksi Aplikasi MoM
          </h1>
          <p className="text-xs text-white/60">
            Satu saldo koin untuk kartu nama NFC dan pembuatan notula AI di website maupun aplikasi ponsel.
          </p>
        </div>
      </div>

      {topUpSuccess && (
        <div className="p-3 bg-[#10b981]/20 border border-[#10b981] rounded-xl text-xs text-[#10b981] font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{topUpSuccess}</span>
        </div>
      )}

      {/* 2-Column: Balance & Mobile Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-[#1c1c22] via-[#18181d] to-[#121215] border border-white/15 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#f59e0b]/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                Saldo Koin Bersama
              </span>
              <span className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded-full font-bold">
                AKTIF
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white tracking-tight">
                {account.coinBalance}
              </span>
              <span className="text-sm font-semibold text-[#f59e0b]">KOIN</span>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Dapat dipakai untuk notula rapat otomatis (5 koin/rapat) dan fitur AI lanjutan di web maupun aplikasi Android/iOS.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 p-2.5 rounded-xl">
              <span className="text-[10px] text-white/40 block">Kartu NFC Fisik</span>
              <span className="text-white font-bold">Unlimited Tap</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl">
              <span className="text-[10px] text-white/40 block">Sisa Rapat AI</span>
              <span className="text-white font-bold">
                {Math.floor((account.coinBalance ?? account.coinsBalance ?? 0) / 5)} Rapat
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Device Connection Card */}
        <div className="bg-[#161619] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#3b7cfa]" />
                Koneksi Aplikasi Mobile
              </span>
              {account.pairedApp ? (
                <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full font-bold">
                  TERHUBUNG
                </span>
              ) : (
                <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full font-bold">
                  BELUM TERHUBUNG
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-white mb-1.5">
              {account.pairedApp
                ? account.pairedApp.deviceModel
                : "Hubungkan dengan Aplikasi Cardi MoM"}
            </h3>

            <p className="text-xs text-white/60 leading-relaxed mb-4">
              {account.pairedApp
                ? `Akun Anda telah disinkronkan pada ${new Date(
                    account.pairedApp.pairedAt
                  ).toLocaleDateString("id-ID")}. Notula dan koin otomatis terbarui di kedua perangkat.`
                : "Tautkan akun Anda dengan aplikasi Cardi MoM dari Play Store atau App Store menggunakan Email OTP atau Scan QR."}
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => setIsPairingModalOpen(true)}
              className="w-full bg-[#3b7cfa] hover:bg-[#2563eb] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>
                {account.pairedApp ? "Kelola Koneksi Perangkat" : "Hubungkan Akun MoM Sekarang"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Coin Packages Top-up */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Isi Ulang Saldo Koin
          </h2>
          <p className="text-xs text-white/60">
            Pilih paket koin sesuai kebutuhan frekuensi pertemuan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coinPackages.map((pkg, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 border relative flex flex-col justify-between transition ${
                pkg.popular
                  ? "bg-[#1c2233] border-[#3b7cfa] shadow-xl"
                  : "bg-[#161619] border-white/10 hover:border-white/20"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 right-4 bg-[#3b7cfa] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Paling Populer
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white/70">{pkg.tag}</span>
                  <Coins className="w-4 h-4 text-[#f59e0b]" />
                </div>
                <div className="text-2xl font-black text-white mb-1">
                  {pkg.coins} Koin
                </div>
                <p className="text-sm font-bold text-[#3b7cfa] mb-3">{pkg.price}</p>
                <p className="text-xs text-white/60 leading-relaxed mb-6">
                  {pkg.desc}
                </p>
              </div>

              <button
                onClick={() => handleBuyPackage(pkg.coins, pkg.tag)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  pkg.popular
                    ? "bg-[#3b7cfa] hover:bg-[#2563eb] text-white shadow-lg"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Beli Paket</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[#161619] border border-white/10 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span>Riwayat Transaksi Koin</span>
        </h3>

        <div className="divide-y divide-white/5 text-xs">
          {coinHistory.map((tx: CoinTransaction) => (
            <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.amount > 0
                      ? "bg-[#10b981]/10 text-[#10b981]"
                      : "bg-white/5 text-white/60"
                  }`}
                >
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{tx.description}</p>
                  <p className="text-[10px] text-white/40">
                    {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <span
                className={`font-mono font-bold ${
                  tx.amount > 0 ? "text-[#10b981]" : "text-white/60"
                }`}
              >
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Koin
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pairing Modal */}
      <PairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
      />
    </div>
  );
}
