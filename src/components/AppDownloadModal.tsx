"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Smartphone,
  Download,
  ExternalLink,
  X,
  Volume2,
  Calendar,
  Coins,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { getDeviceInfo, STORE_URLS } from "@/lib/device";

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId?: string;
  title?: string;
}

export default function AppDownloadModal({
  isOpen,
  onClose,
  meetingId,
  title,
}: AppDownloadModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState(() => getDeviceInfo());

  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    QRCode.toDataURL(STORE_URLS.downloadLanding, {
      width: 190,
      margin: 1,
      color: {
        dark: "#070D1E",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch((err) => {
        console.warn("[AppDownloadModal] QR code generation notice:", err);
      });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { isAndroid, isIOS, isDesktop } = deviceInfo;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-download-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0B1528] border border-white/15 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl relative text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog unduh aplikasi"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1E4FFF] to-[#00C2D1] flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="app-download-title" className="text-base sm:text-lg font-bold tracking-tight text-white">
                Buka di Aplikasi Mobile Cardi MoM
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {title ? `Akses ${title} dengan fitur lengkap di ponsel` : "Pengalaman notula dan pemutaran audio terbaik"}
            </p>
          </div>
        </div>

        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-start gap-2.5">
            <Volume2 className="w-4 h-4 text-[#00C2D1] shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-white">Pemutaran Audio</div>
              <div className="text-[10px] text-slate-400">Stream rekaman langsung dari cloud</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-white">Notula Offline</div>
              <div className="text-[10px] text-slate-400">Akses ringkasan tanpa internet</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-white">Google Tasks</div>
              <div className="text-[10px] text-slate-400">Sinkronisasi action item 1-klik</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-start gap-2.5">
            <Coins className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-white">Reward Koin</div>
              <div className="text-[10px] text-slate-400">Bonus koin untuk tiap notula rapat</div>
            </div>
          </div>
        </div>

        {/* Platform-Aware Action Options */}
        {isDesktop ? (
          <div className="bg-[#070D1E] border border-white/10 rounded-2xl p-4 text-center mb-5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {qrDataUrl ? (
                <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                  <img
                    src={qrDataUrl}
                    alt="QR Code Unduh Cardi MoM"
                    className="w-32 h-32 block rounded"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                </div>
              )}
              <div className="text-left space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#00C2D1]" />
                  <span>Pindai dengan Kamera Ponsel Anda</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Arahkan kamera smartphone ke kode QR untuk memasang aplikasi Cardi MoM secara instan di Android atau iOS.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={STORE_URLS.googlePlay}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#00C2D1] hover:underline flex items-center gap-1"
                  >
                    Google Play <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <span className="text-slate-600">|</span>
                  <a
                    href={STORE_URLS.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#00C2D1] hover:underline flex items-center gap-1"
                  >
                    App Store <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <span className="text-slate-600">|</span>
                  <a
                    href={STORE_URLS.directApk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#00C2D1] hover:underline flex items-center gap-1"
                  >
                    APK <Download className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 mb-5">
            {/* Android Targeted Buttons */}
            {isAndroid && (
              <>
                <a
                  href={STORE_URLS.googlePlay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#1E4FFF] to-[#00C2D1] hover:from-[#183ec9] hover:to-[#00a8b5] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang dari Google Play Store</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                </a>

                <a
                  href={STORE_URLS.directApk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unduh File APK Langsung (Android)</span>
                </a>
              </>
            )}

            {/* iOS Targeted Button */}
            {isIOS && (
              <a
                href={STORE_URLS.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-[#1E4FFF] to-[#00C2D1] hover:from-[#183ec9] hover:to-[#00a8b5] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh di Apple App Store</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
              </a>
            )}

            {/* Fallback button if mobile but neither detected */}
            {!isAndroid && !isIOS && (
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={STORE_URLS.googlePlay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/15 border border-white/10 text-white py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Google Play</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={STORE_URLS.appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/15 border border-white/10 text-white py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>App Store</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="text-[10px] text-slate-400">
            {meetingId ? `ID Rapat: ${meetingId}` : "Aplikasi Cardi MoM v1.0"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Lanjutkan di Web
          </button>
        </div>
      </div>
    </div>
  );
}
