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
    <header className="sticky top-0 z-40 w-full bg-[#121214]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard/card" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">
              Cardi<span className="text-[#3b7cfa]">.id</span>
            </span>
            <span className="text-[10px] bg-gradient-to-r from-[#3b7cfa] to-[#10b981] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              NFC + MoM
            </span>
          </Link>

          {/* Nav Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#1a1a1e] p-1 rounded-xl border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#3b7cfa] text-white shadow-sm"
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
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              account.pairedApp
                ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/20"
                : "bg-white/5 text-white/70 border-white/15 hover:bg-white/10"
            }`}
            title="Koneksi Aplikasi MoM Play Store / App Store"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {account.pairedApp ? "App MoM Terhubung" : "Hubungkan App MoM"}
            </span>
          </button>

          {/* Unified Coin Balance */}
          <Link
            href="/dashboard/wallet"
            className="flex items-center gap-1.5 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] px-3 py-1 rounded-lg text-xs font-bold transition"
            title="Saldo Koin Bersama (NFC Card & AI MoM Transkripsi)"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{account.coinBalance} Koin</span>
          </Link>

          {/* User Profile Mini */}
          <Link
            href={`/${cardProfile.username}`}
            target="_blank"
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5 text-xs text-white/80 transition border border-transparent hover:border-white/10"
            title="Lihat Halaman Publik NFC Anda"
          >
            <div className="w-7 h-7 rounded-full bg-[#3b7cfa] text-white flex items-center justify-center font-bold text-xs">
              {cardProfile.fullName.charAt(0)}
            </div>
            <span className="hidden lg:inline font-medium">
              {cardProfile.fullName.split(" ")[0]}
            </span>
            <ExternalLink className="w-3 h-3 text-white/40" />
          </Link>
        </div>
      </div>

      {/* Mobile Tab Bar (Bottom on mobile) */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/10 bg-[#161619]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
                isActive ? "text-[#3b7cfa]" : "text-white/50 hover:text-white"
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
