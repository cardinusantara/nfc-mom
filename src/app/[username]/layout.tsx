import type { Metadata } from "next";
import { cardiApi } from "@/lib/api";

type Props = {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const username = resolvedParams?.username || "user";
  const capitalized = username.charAt(0).toUpperCase() + username.slice(1);

  let title = `${capitalized} | Profil Kartu Nama Digital Cardi`;
  let description = `Hubungkan langsung dengan ${capitalized} via kartu pintar Cardi NFC. Simpan kontak instan ke smartphone dan jadwalkan sesi diskusi.`;

  try {
    const p = await cardiApi.fetchPublicProfile(username);
    if (p) {
      const displayName = p.fullName?.trim() || capitalized;
      const job = p.headline ? `${p.headline}${p.company ? ` di ${p.company}` : ""}` : "Profil Profesional";
      title = `${displayName} - ${job} | Cardi NFC`;
      if (p.bio?.trim()) {
        description = p.bio.trim();
      } else {
        description = `Hubungkan langsung dengan ${displayName} (${job}). Simpan kontak instan ke smartphone dan jadwalkan sesi diskusi.`;
      }
    }
  } catch {
    // Graceful fallback if backend unavailable during SSR
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://nfc.cardi.co.id/${username}`,
      siteName: "Cardi NFC Ecosystem",
      type: "profile",
      images: [
        {
          url: "https://nfc.cardi.co.id/logos/mom/badge-mom.png",
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["https://nfc.cardi.co.id/logos/mom/badge-mom.png"],
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
