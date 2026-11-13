import { CardProfile, UserAccount } from "./types";

export interface UserEntity {
  account: UserAccount;
  cardProfile: CardProfile;
}

// Hanya menyimpan verified profile organisasi atau kosong jika belum terdaftar
export const USER_REGISTRY: Record<string, UserEntity> = {
  deo: {
    account: {
      email: "cardinusantara@gmail.com",
      name: "Deo Cardi Nathanael",
      avatarUrl: "",
      coinsBalance: 0,
      coinBalance: 0,
      freemiumGranted: true,
      subscription: {
        status: "active",
        tier: "pro",
        currentPeriodEnd: "2026-12-31T00:00:00Z",
      },
      pairedApp: {
        deviceId: "dev_verified_primary",
        deviceModel: "Cardi MoM App",
        pairedAt: "2026-01-01T00:00:00Z",
      },
    },
    cardProfile: {
      username: "deo",
      fullName: "Deo Cardi Nathanael",
      headline: "Founder & CEO",
      company: "cardi.co.id",
      phone: "+62 812-8989-5646",
      email: "cardinusantara@gmail.com",
      website: "https://www.cardi.co.id",
      location: "Jakarta, Indonesia",
      bio: "Membangun solusi AI Meeting Intelligence dan Smart NFC Networking untuk efisiensi bisnis.",
      avatarUrl: "",
      cardDesign: "black-gold",
      isActivated: true,
      tagId: "CRD-DEO-001",
      socials: {
        whatsapp: "https://wa.me/6281289895646",
        linkedin: "https://linkedin.com/in/deocardi",
      },
      metrics: {
        totalTaps: 0,
        contactsSaved: 0,
        momInitiated: 0,
      },
    },
  },
};

export function getProfileByUsername(username: string): CardProfile {
  const key = username.toLowerCase().trim();
  if (USER_REGISTRY[key]) {
    return USER_REGISTRY[key].cardProfile;
  }
  // Default clean profile template untuk username baru (tanpa data fiktif / fake stats)
  return {
    username: key,
    fullName: key.charAt(0).toUpperCase() + key.slice(1),
    headline: "Pengguna Cardi Smart Card",
    company: "Cardi Network",
    phone: "",
    email: "",
    website: "https://www.cardi.co.id",
    location: "Indonesia",
    bio: "Pengguna kartu bisnis pintar Cardi Smart NFC Card dan AI MoM.",
    avatarUrl: "",
    cardDesign: "black-gold",
    socials: {},
    metrics: {
      totalTaps: 0,
      contactsSaved: 0,
      momInitiated: 0,
    },
  };
}
