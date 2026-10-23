"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import PairingModal from "@/components/PairingModal";
import AudioRecordModal from "@/components/AudioRecordModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-white flex flex-col font-sans selection:bg-[#3b7cfa]">
      <Navbar onOpenPairingModal={() => setPairingModalOpen(true)} />
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-24">
        {children}
      </main>

      <PairingModal
        isOpen={pairingModalOpen}
        onClose={() => setPairingModalOpen(false)}
      />

      <AudioRecordModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
      />
    </div>
  );
}
