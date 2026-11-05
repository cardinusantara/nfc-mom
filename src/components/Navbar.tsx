"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Mic,
  Calendar,
  Coins,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Radio,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface NavbarProps {
  onOpenPairingModal?: () => void;
}

export default function Navbar({ onOpenPairingModal }: NavbarProps) {
  const pathname = usePathname();
  const { account, cardProfile } = useAppStore();

  const tabs = [
    { label: "Card", href: "/dashboard/card", icon: CreditCard },
    { label: "MoM", href: "/dashboard/mom", icon: Mic },
    { label: "Kalender", href: "/dashboard/calendar", icon: Calendar },
    { label: "Koin & Akun", href: "/dashboard/wallet", icon: Coins },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070D1E]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0258A4] via-[#1E4FFF] to-[#00C2D1] flex items-center justify-center font-black text-sm text-white shadow-md shadow-[#1E4FFF]/20 group-hover:scale-105 transition">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white leading-none">
                Cardi <span className="text-[#1E4FFF]">Smart</span>
              </span>
              <span className="text-[9px] text-[#64B5F6] font-mono font-semibold uppercase tracking-wider mt-0.5">
                NFC &amp; AI MoM
              </span>
            </div>
          </Link>

          {/* Nav Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#1E4FFF] text-white shadow-md shadow-[#1E4FFF]/25"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Koin balance, App Pairing status, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Mobile App Connected Badge */}
          <button
            onClick={onOpenPairingModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              account.pairedApp
                ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/25"
                : "bg-white/5 text-white/70 border-white/15 hover:bg-white/10"
            }`}
            title="Koneksi Aplikasi MoM Play Store / App Store"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00C2D1]" />
            <span className="hidden sm:inline">
              {account.pairedApp ? "App MoM Terhubung" : "Hubungkan App MoM"}
            </span>
          </button>

          {/* Unified Coin Balance */}
          <Link
            href="/dashboard/wallet"
            className="flex items-center gap-1.5 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] px-3 py-1.5 rounded-xl text-xs font-bold transition"
            title="Saldo Koin Bersama (NFC Card & AI MoM Transkripsi)"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{account.coinBalance} Koin</span>
          </Link>

          {/* User Profile Mini */}
          <Link
            href={`/${cardProfile.username}`}
            target="_blank"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-white/5 text-xs text-white/90 transition border border-transparent hover:border-white/10"
            title="Buka Kartu Publik NFC Anda"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1E4FFF] to-[#00C2D1] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {cardProfile.fullName.charAt(0)}
            </div>
            <span className="hidden lg:inline font-semibold">
              {cardProfile.fullName.split(" ")[0]}
            </span>
            <ExternalLink className="w-3 h-3 text-white/40" />
          </Link>
        </div>
      </div>

      {/* Mobile Tab Bar (Bottom on mobile) */}
      <div className="md:hidden flex items-center justify-around py-2.5 border-t border-white/10 bg-[#070D1E]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
                isActive ? "text-[#1E4FFF] font-bold" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
