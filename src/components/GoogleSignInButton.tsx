"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { UserAccount } from "@/lib/types";

interface GoogleSignInButtonProps {
  onSuccess: (data: {
    email: string;
    name: string;
    avatarUrl?: string;
    sessionToken: string;
    account?: UserAccount;
  }) => void;
  onError?: (err: string) => void;
  className?: string;
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "546607031496-gq2vvqt2vmgclj5mtt53nmvgia7hj5pq.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number;
              locale?: string;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  className = "",
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response.credential) {
        const errorText = "Kredensial dari Google tidak diterima.";
        setErrorMessage(errorText);
        onError?.(errorText);
        return;
      }

      setIsVerifying(true);
      setErrorMessage(null);

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: response.credential,
            deviceId: "web_nfc_portal",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal otentikasi Google Sign-In.");
        }

        onSuccess({
          email: data.account.email,
          name: data.account.name || data.account.email.split("@")[0],
          avatarUrl: data.account.avatarUrl,
          sessionToken: data.sessionToken,
          account: data.account,
        });
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat masuk dengan Google.";
        setErrorMessage(msg);
        onError?.(msg);
      } finally {
        setIsVerifying(false);
      }
    },
    [onError, onSuccess]
  );

  useEffect(() => {
    let isMounted = true;

    const setupButton = () => {
      if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        buttonRef.current.innerHTML = "";
        const targetWidth = buttonRef.current
          ? Math.min(360, Math.max(240, buttonRef.current.clientWidth || 320))
          : 320;

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: targetWidth,
        });

        setIsScriptReady(true);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Gagal menginisialisasi Google Sign-In.";
        setErrorMessage(msg);
        onError?.(msg);
      }
    };

    if (window.google?.accounts?.id) {
      setupButton();
      return;
    }

    const scriptId = "google-identity-services-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setupButton();
      };
      script.onerror = () => {
        if (isMounted) {
          const msg =
            "Gagal memuat Google Identity Services. Periksa koneksi internet Anda.";
          setErrorMessage(msg);
          onError?.(msg);
        }
      };
      document.head.appendChild(script);
    } else {
      if (window.google?.accounts?.id) {
        setupButton();
      } else {
        script.addEventListener("load", setupButton);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [handleCredentialResponse, onError]);

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {isVerifying && (
        <div className="flex items-center gap-2 mb-3 text-xs text-sky-600 font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memverifikasi akun Google dengan backend...</span>
        </div>
      )}

      <div
        ref={buttonRef}
        className="min-h-[44px] flex items-center justify-center w-full"
      />

      {!isScriptReady && !errorMessage && !isVerifying && (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Menyiapkan Google Sign-In...</span>
        </div>
      )}

      {errorMessage && (
        <p className="mt-2 text-xs text-red-500 font-medium text-center">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
