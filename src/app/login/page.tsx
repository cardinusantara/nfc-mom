"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Mail,
  QrCode,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Globe,
  Sun,
  Moon,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAppStore, useAuthSession } from "@/lib/store";
import { cardiApi } from "@/lib/api";
import { UserAccount, Meeting } from "@/lib/types";
import { CardiMomLogo } from "@/components/CardiMomLogo";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthSession();
  const {
    setSession,
    loginWithGoogle,
    setMeetings,
    theme,
    toggleTheme,
    locale,
    toggleLocale,
  } = useAppStore();

  const isDark = theme === "dark";

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/dashboard/card");
    }
  }, [hasHydrated, isAuthenticated, router]);

  const [authMethod, setAuthMethod] = useState<"qr" | "email">("qr");

  // QR Pairing State (ADR 0002)
  const [pairingId, setPairingId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoadingPairing, setIsLoadingPairing] = useState(false);
  const [pairingExpired, setPairingExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  // Email OTP State (ADR 0007)
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pairingExpiresAtRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPollingLoop = useCallback((pid: string) => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      try {
        const pollRes = await cardiApi.pollPairing(pid);
        if (pollRes.status === "confirmed") {
          stopPolling();
          cardiApi.setToken(pollRes.sessionToken);
          setSession(pollRes.sessionToken, pollRes.account);

          // Sync live meetings from mobile app immediately
          try {
            const syncData = await cardiApi.syncMeetings();
            if (syncData.entries) {
              const liveMeetings = syncData.entries
                .filter((e) => !e.deleted && e.meeting)
                .map((e) => (e as { deleted: false; meeting: Meeting }).meeting);
              setMeetings(liveMeetings);
            }
          } catch {
            // sync will retry on dashboard mount
          }

          setSuccessMessage("Perangkat aplikasi mobile berhasil tersambung!");
          setTimeout(() => {
            router.push("/dashboard/card");
          }, 400);
        } else if (pollRes.status === "expired") {
          stopPolling();
          setPairingExpired(true);
        }
      } catch {
        // ignore transient poll error
      }
    }, 2000);
  }, [router, setMeetings, setSession, stopPolling]);

  const initPairing = useCallback(async () => {
    if (hasHydrated && isAuthenticated) return;
    stopPolling();
    setIsLoadingPairing(true);
    setPairingExpired(false);
    setErrorMessage(null);

    try {
      const res = await cardiApi.startPairing();
      setPairingId(res.pairingId);

      if (res.expiresAt) {
        pairingExpiresAtRef.current = new Date(res.expiresAt).getTime();
      } else {
        pairingExpiresAtRef.current = Date.now() + 5 * 60 * 1000;
      }

      let dataUrl: string;
      try {
        dataUrl = await QRCode.toDataURL(res.pairingId, {
          width: 240,
          margin: 1,
          color: {
            dark: "#0B1528",
            light: "#FFFFFF",
          },
        });
      } catch {
        const svgString = await QRCode.toString(res.pairingId, {
          type: "svg",
          margin: 1,
          color: {
            dark: "#0B1528",
            light: "#FFFFFF",
          },
        });
        dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      }
      setQrDataUrl(dataUrl);

      startPollingLoop(res.pairingId);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal membuat sesi pairing aplikasi mobile. Periksa koneksi internet Anda.";
      setErrorMessage(msg);
    } finally {
      setIsLoadingPairing(false);
    }
  }, [hasHydrated, isAuthenticated, startPollingLoop, stopPolling]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      stopPolling();
      return;
    }

    if (authMethod === "qr") {
      const isStillValid =
        pairingId &&
        qrDataUrl &&
        pairingExpiresAtRef.current &&
        Date.now() < pairingExpiresAtRef.current &&
        !pairingExpired;

      if (!isStillValid) {
        initPairing();
      } else if (!pollTimerRef.current) {
        startPollingLoop(pairingId);
      }
    } else {
      stopPolling();
    }
    return () => {
      stopPolling();
    };
  }, [authMethod, hasHydrated, isAuthenticated, initPairing, pairingExpired, pairingId, qrDataUrl, startPollingLoop, stopPolling]);

  const handleCopyPairingId = () => {
    if (!pairingId) return;
    navigator.clipboard.writeText(pairingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Handle Google Sign In Success
  const handleGoogleSuccess = async (userData: {
    email: string;
    name: string;
    avatarUrl?: string;
    sessionToken: string;
    account?: UserAccount;
  }) => {
    cardiApi.setToken(userData.sessionToken);
    if (userData.account) {
      setSession(userData.sessionToken, {
        ...userData.account,
        name: userData.name || userData.account.name,
        avatarUrl: userData.avatarUrl || userData.account.avatarUrl,
      });
    } else {
      loginWithGoogle(
        {
          email: userData.email,
          name: userData.name,
          avatarUrl: userData.avatarUrl,
        },
        userData.sessionToken
      );
    }

    try {
      const syncData = await cardiApi.syncMeetings();
      if (syncData.entries) {
        const liveMeetings = syncData.entries
          .filter((e) => !e.deleted && e.meeting)
          .map((e) => (e as { deleted: false; meeting: Meeting }).meeting);
        setMeetings(liveMeetings);
      }
    } catch {
      // ignore transient sync error
    }

    setSuccessMessage(`Berhasil masuk sebagai ${userData.name}!`);
    setTimeout(() => {
      router.push("/dashboard/card");
    }, 400);
  };

  // Handle Send OTP
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await cardiApi.sendEmailCode(email);
      setIsOtpSent(true);
      setSuccessMessage("Kode OTP 6 digit berhasil dikirim ke email Anda.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengirim kode OTP. Periksa alamat email dan coba lagi.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await cardiApi.verifyEmailCode(email, otpCode, "web_nfc_portal");
      cardiApi.setToken(res.token);
      setSession(res.token, res.account);

      try {
        const syncData = await cardiApi.syncMeetings();
        if (syncData.entries) {
          const liveMeetings = syncData.entries
            .filter((e) => !e.deleted && e.meeting)
            .map((e) => (e as { deleted: false; meeting: Meeting }).meeting);
          setMeetings(liveMeetings);
        }
      } catch {
        // ignore
      }

      setSuccessMessage(`Berhasil masuk sebagai ${res.account.email}!`);
      setTimeout(() => {
        router.push("/dashboard/card");
      }, 400);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Kode OTP salah atau telah kedaluwarsa.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasHydrated && isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 ${
          isDark ? "bg-[#090D16] text-white" : "bg-[#F8FAFD] text-slate-900"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {locale === "id" ? "Mengarahkan ke Dashboard..." : "Redirecting to Dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? "bg-[#090D16] text-white selection:bg-sky-500 selection:text-white"
          : "bg-[#F8FAFD] text-slate-900 selection:bg-sky-500 selection:text-white"
      }`}
    >
      {/* Top Header */}
      <header
        className={`border-b backdrop-blur-md sticky top-0 z-40 transition-colors ${
          isDark
            ? "border-white/10 bg-[#0B1528]/80"
            : "border-slate-200 bg-white/90 shadow-xs"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CardiMomLogo size="sm" colorMode={isDark ? "dark" : "light"} showTagline />
          </Link>

          <div className="flex items-center gap-3">
            {/* Locale & Theme Switcher */}
            <button
              onClick={toggleLocale}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                isDark
                  ? "bg-white/5 border-white/15 text-white/80 hover:bg-white/10"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span className="uppercase text-[11px] font-mono">{locale}</span>
            </button>

            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border transition ${
                isDark
                  ? "bg-white/5 border-white/15 text-amber-400 hover:bg-white/10"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <Link
              href="/activate"
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 transition ml-2"
            >
              <span>Aktivasi Kartu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div
          className={`w-full max-w-md border rounded-3xl p-6 sm:p-8 shadow-xl relative transition-colors ${
            isDark
              ? "bg-[#0E1A30]/90 border-white/15 shadow-black/40"
              : "bg-white border-slate-200 shadow-slate-200/50"
          }`}
        >
          {/* Brand Logo from Official Assets */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <CardiMomLogo size="md" colorMode={isDark ? "dark" : "light"} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {locale === "id"
                ? "Masuk ke Ekosistem Cardi MoM"
                : "Sign in to Cardi MoM"}
            </h1>
            <p
              className={`text-xs mt-1.5 max-w-xs mx-auto leading-relaxed ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {locale === "id"
                ? "Terhubung langsung antara Web Smart NFC Card, Google Calendar, dan Aplikasi Mobile MoM."
                : "Connected between Web Smart NFC Card, Google Calendar, and Mobile MoM App."}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* PRIMARY: GOOGLE SIGN-IN */}
          <div className="space-y-4 mb-6">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={(err) => setErrorMessage(err)}
            />

            <div className="flex items-center gap-3 my-4">
              <div className={`flex-1 h-[1px] ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
              <span className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {locale === "id" ? "atau akses alternatif" : "or alternative access"}
              </span>
              <div className={`flex-1 h-[1px] ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
            </div>
          </div>

          {/* Secondary Methods Tabs */}
          <div className={`flex border-b mb-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("qr");
                if ((!qrDataUrl || pairingExpired) && !isLoadingPairing) {
                  initPairing();
                }
              }}
              className={`flex-1 pb-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
                authMethod === "qr"
                  ? "border-sky-600 text-sky-600 dark:text-sky-400"
                  : isDark
                  ? "border-transparent text-slate-400 hover:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{locale === "id" ? "Aplikasi Mobile" : "Mobile App"}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod("email")}
              className={`flex-1 pb-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
                authMethod === "email"
                  ? "border-sky-600 text-sky-600 dark:text-sky-400"
                  : isDark
                  ? "border-transparent text-slate-400 hover:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{locale === "id" ? "Email OTP Korporat" : "Corporate Email OTP"}</span>
            </button>
          </div>

          {/* Method: QR Device Pairing */}
          {authMethod === "qr" && (
            <div className="flex flex-col items-center text-center space-y-4">
              <p
                className={`text-xs leading-relaxed max-w-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Buka aplikasi <strong>Cardi MoM</strong> di ponsel Anda, buka menu{" "}
                <strong>Tautkan Web</strong>, lalu pindai kode QR di bawah:
              </p>

              <div
                className={`p-3 rounded-2xl border shadow-md relative flex items-center justify-center min-w-[240px] min-h-[240px] ${
                  isDark
                    ? "bg-[#070F1E] border-white/15"
                    : "bg-white border-slate-200"
                }`}
              >
                {isLoadingPairing ? (
                  <div className="flex flex-col items-center justify-center gap-2 p-8 text-xs text-slate-400">
                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                    <span>Menghubungkan ke server pairing...</span>
                  </div>
                ) : pairingExpired ? (
                  <div className="flex flex-col items-center justify-center gap-2.5 p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Sesi QR telah kedaluwarsa
                    </span>
                    <button
                      type="button"
                      onClick={initPairing}
                      className="mt-1 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Buat Kode QR Baru</span>
                    </button>
                  </div>
                ) : qrDataUrl ? (
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="Kode QR Pairing Cardi MoM"
                      width={220}
                      height={220}
                      className="rounded-xl shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2.5 p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[200px]">
                      {errorMessage || "Gagal memuat Kode QR pairing"}
                    </span>
                    <button
                      type="button"
                      onClick={initPairing}
                      className="mt-1 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Coba Lagi</span>
                    </button>
                  </div>
                )}
              </div>

              {pairingId && !pairingExpired && (
                <div className="w-full max-w-xs space-y-2">
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-mono ${
                      isDark
                        ? "bg-[#070F1E] border-white/10 text-slate-300"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="truncate tracking-wider text-[11px]">
                      {pairingId}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleCopyPairingId}
                        className="p-1 text-slate-400 hover:text-sky-500 transition rounded-md"
                        title="Salin ID Pairing"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={initPairing}
                        className="p-1 text-slate-400 hover:text-sky-500 transition rounded-md"
                        title="Refresh QR"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <RefreshCw className="w-3 h-3 text-sky-500 animate-spin" />
                    <span>Menunggu konfirmasi scan dari aplikasi ponsel...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Method: Email OTP */}
          {authMethod === "email" && (
            <div>
              {!isOtpSent ? (
                <form onSubmit={handleSendEmailOtp} className="space-y-4">
                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Alamat Email Akun Anda
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-500 transition ${
                        isDark
                          ? "bg-[#070F1E] border-white/15 text-white placeholder-slate-500"
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim Kode OTP...</span>
                      </>
                    ) : (
                      "Kirim 6-Digit Kode OTP"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Kode 6 digit dikirim ke <strong>{email}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpSent(false);
                        setOtpCode("");
                        setErrorMessage(null);
                      }}
                      className="text-[11px] text-sky-600 hover:underline cursor-pointer"
                    >
                      Ganti email
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-center text-xl font-mono tracking-widest text-sky-600 focus:outline-none focus:border-sky-500 transition ${
                        isDark
                          ? "bg-[#070F1E] border-white/15"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      "Verifikasi & Masuk"
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bottom Security & Corporate Disclaimer */}
          <div className={`mt-6 pt-5 border-t text-center text-[11px] space-y-1.5 ${isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              Portal Akses Manajemen Eksekutif • PT Cardi Nusantara Kreasi
            </p>
            <p className="text-[10.5px] opacity-75">
              Sistem Keamanan Akses Terverifikasi &amp; Perlindungan Kerahasiaan Data Rapat
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 text-[11px]">
              <Link href="/activate" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                Aktivasi Chip NFC
              </Link>
              <span className="opacity-30">•</span>
              <Link href="/" className="hover:underline opacity-80 hover:opacity-100">
                Kembali ke Info Kartu
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
