"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import {
  Smartphone,
  QrCode,
  Mail,
  CheckCircle,
  Copy,
  RefreshCw,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cardiApi } from "@/lib/api";

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PairingModal({ isOpen, onClose }: PairingModalProps) {
  const { account, setPairedApp, updateCoinBalance } = useAppStore();
  const [tab, setTab] = useState<"qr" | "email">("qr");

  // Real QR Pairing State
  const [pairingId, setPairingId] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoadingPairing, setIsLoadingPairing] = useState(false);
  const [pairingExpired, setPairingExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email OTP state
  const [emailInput, setEmailInput] = useState(account.email || "");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const initPairing = useCallback(async () => {
    stopPolling();
    setIsLoadingPairing(true);
    setPairingExpired(false);
    setErrorMessage(null);

    try {
      const res = await cardiApi.startPairing();
      setPairingId(res.pairingId);

      const dataUrl = await QRCode.toDataURL(res.pairingId, {
        width: 220,
        margin: 1,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      });
      setQrDataUrl(dataUrl);

      // Start polling loop every 2.5s
      pollTimerRef.current = setInterval(async () => {
        try {
          const pollRes = await cardiApi.pollPairing(res.pairingId);
          if (pollRes.status === "confirmed") {
            stopPolling();
            cardiApi.setToken(pollRes.sessionToken);
            setPairedApp({
              deviceId: pollRes.account.pairedApp?.deviceId || "dev_mobile",
              deviceModel: pollRes.account.pairedApp?.deviceModel || "Cardi MoM Mobile App",
              pairedAt: new Date().toISOString(),
            });
            const coins = pollRes.account.coinsBalance ?? pollRes.account.coinBalance ?? 0;
            updateCoinBalance(coins);
            setSuccessMessage("Aplikasi Cardi MoM berhasil terhubung! Koin disinkronkan.");
            setTimeout(() => {
              setSuccessMessage(null);
              onClose();
            }, 1800);
          } else if (pollRes.status === "expired") {
            stopPolling();
            setPairingExpired(true);
          }
        } catch {
          // ignore transient poll errors
        }
      }, 2500);
    } catch {
      setErrorMessage("Gagal menghubungkan ke server pairing.");
    } finally {
      setIsLoadingPairing(false);
    }
  }, [onClose, setPairedApp, stopPolling, updateCoinBalance]);

  useEffect(() => {
    if (isOpen && !account.pairedApp && tab === "qr") {
      initPairing();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isOpen, account.pairedApp, tab, initPairing, stopPolling]);

  if (!isOpen) return null;

  const handleCopyPairingId = () => {
    if (!pairingId) return;
    navigator.clipboard.writeText(pairingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailLoading(true);
    setErrorMessage(null);
    try {
      await cardiApi.requestEmailOtp(emailInput);
      setOtpSent(true);
    } catch {
      setErrorMessage("Gagal mengirim kode OTP ke email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setEmailLoading(true);
    setErrorMessage(null);
    try {
      const res = await cardiApi.verifyEmailOtp(emailInput, otpInput);
      if (res.token) {
        cardiApi.setToken(res.token);
      }
      setPairedApp({
        deviceId: "dev_email_sync",
        deviceModel: `Akun Terverifikasi (${emailInput})`,
        pairedAt: new Date().toISOString(),
      });
      const coins = res.account.coinsBalance ?? res.account.coinBalance ?? 200;
      updateCoinBalance(coins);
      setSuccessMessage("Akun email MoM tersambung dengan sukses!");
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1800);
    } catch {
      setErrorMessage("Kode OTP tidak valid atau telah kedaluwarsa.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDisconnect = () => {
    setPairedApp(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#18181b] border border-white/15 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#3b7cfa]/20 border border-[#3b7cfa]/40 flex items-center justify-center text-[#3b7cfa]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Koneksi Aplikasi Cardi MoM
            </h2>
            <p className="text-xs text-white/60">
              Sinkronkan akun, koin &amp; notula dari Play Store / App Store
            </p>
          </div>
        </div>

        {/* Current Connection Status */}
        {account.pairedApp ? (
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#10b981] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#10b981]">Terhubung Aktif</p>
                <p className="text-[11px] text-white/80">{account.pairedApp.deviceModel}</p>
                <p className="text-[10px] text-white/50">
                  Ditautkan: {new Date(account.pairedApp.pairedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition"
            >
              Putuskan
            </button>
          </div>
        ) : (
          /* Method Switcher Tabs */
          <div className="flex border-b border-white/10 mb-5">
            <button
              onClick={() => setTab("qr")}
              className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
                tab === "qr"
                  ? "border-[#3b7cfa] text-[#3b7cfa]"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Aplikasi</span>
            </button>
            <button
              onClick={() => setTab("email")}
              className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
                tab === "email"
                  ? "border-[#3b7cfa] text-[#3b7cfa]"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email Akun MoM</span>
            </button>
          </div>
        )}

        {/* Tab 1: Live QR Scanner via Mobile App */}
        {!account.pairedApp && tab === "qr" && (
          <div className="flex flex-col items-center text-center">
            <p className="text-xs text-white/70 mb-4 leading-relaxed">
              Buka aplikasi <strong>Cardi MoM</strong> di Android / iOS, buka menu scanner, lalu pindai kode QR di bawah:
            </p>

            {/* QR Code Container */}
            <div className="relative bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center mb-3">
              {isLoadingPairing ? (
                <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-black/50 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mb-2 text-[#3b7cfa]" />
                  <span>Membuat sesi pairing...</span>
                </div>
              ) : pairingExpired ? (
                <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-black/70 text-xs p-4 text-center">
                  <AlertCircle className="w-7 h-7 text-red-500 mb-2" />
                  <span className="font-semibold text-red-600 mb-2">QR Kedaluwarsa</span>
                  <button
                    onClick={initPairing}
                    className="bg-[#3b7cfa] text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    Muat Ulang
                  </button>
                </div>
              ) : qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Scan QR Pairing Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              ) : null}
            </div>

            {/* Pairing ID and Copy Button */}
            {pairingId && !pairingExpired && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  ID: {pairingId}
                </span>
                <button
                  onClick={handleCopyPairingId}
                  className="text-white/50 hover:text-white p-1"
                  title="Salin ID Pairing"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span className="text-[10px] text-[#10b981]">Disalin</span>}
              </div>
            )}

            {/* Status Indicator */}
            {!pairingExpired && (
              <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                <RefreshCw className="w-3 h-3 animate-spin text-[#3b7cfa]" />
                <span>Menunggu scan dari aplikasi ponsel...</span>
              </div>
            )}

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-left w-full flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/60 leading-normal">
                Setelah tersambung, saldo koin Anda akan digabungkan otomatis. Notula dari kartu NFC dan aplikasi mobile tersinkron langsung secara real-time.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Email OTP Login */}
        {!account.pairedApp && tab === "email" && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendEmailOtp} className="space-y-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  Masukkan alamat email yang Anda gunakan saat login di aplikasi Cardi MoM (Play Store / App Store):
                </p>
                <div>
                  <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                    Email Akun MoM
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-[#242429] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#3b7cfa]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full bg-[#3b7cfa] hover:bg-[#2563eb] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  {emailLoading ? "Mengirim OTP..." : "Kirim Kode OTP Masuk"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  Kami telah mengirimkan 6-digit kode OTP ke <strong>{emailInput}</strong>.
                </p>
                <div>
                  <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                    Kode OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#242429] border border-white/15 rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-white placeholder-white/30 focus:outline-none focus:border-[#3b7cfa]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  {emailLoading ? "Memverifikasi..." : "Verifikasi & Hubungkan Akun"}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-[11px] text-white/50 hover:text-white"
                >
                  Ganti email
                </button>
              </form>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-400 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mt-4 p-3 bg-[#10b981]/20 border border-[#10b981] rounded-xl text-xs text-[#10b981] font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
