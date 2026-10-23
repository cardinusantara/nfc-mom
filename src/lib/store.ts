import { create } from "zustand";
import {
  CardProfile,
  CoinTransaction,
  ContactLead,
  Meeting,
  PairedDevice,
  UserAccount,
} from "./types";
import { MOCK_MEETINGS } from "./api";

interface AppState {
  // Auth & Account
  account: UserAccount;
  sessionToken: string | null;
  setSession: (token: string, account: UserAccount) => void;
  setPairedApp: (paired: PairedDevice | null) => void;
  updateCoinBalance: (balance: number) => void;
  deductCoins: (amount: number, reason?: string) => boolean;
  addCoins: (amount: number, reason?: string) => void;

  // Digital Card Profile
  cardProfile: CardProfile;
  updateCardProfile: (updates: Partial<CardProfile>) => void;
  incrementTaps: () => void;

  // Meetings & MoM
  meetings: Meeting[];
  activeRecording: boolean;
  recordingSeconds: number;
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  setActiveRecording: (active: boolean) => void;
  setRecordingSeconds: (seconds: number | ((prev: number) => number)) => void;

  // Contacts / Leads
  contacts: ContactLead[];
  leads: ContactLead[]; // alias for convenience
  addContact: (contact: ContactLead) => void;
  addLead: (lead: ContactLead) => void;
  updateContactStatus: (id: string, status: "hot" | "warm" | "cold") => void;

  // Transactions & History
  transactions: CoinTransaction[];
  coinHistory: CoinTransaction[]; // alias for convenience

  // Active Tab Filter
  currentProductTab: "card" | "mom" | "calendar";
  setCurrentProductTab: (tab: "card" | "mom" | "calendar") => void;
}

const INITIAL_CONTACTS: ContactLead[] = [
  {
    id: "cnt_01",
    name: "Budi Hartono",
    company: "PT Mandiri Tech",
    phone: "+62 811-9876-5432",
    email: "budi@mandiritech.id",
    tappedAt: "2026-10-21 10:30",
    createdAt: "2026-10-21T10:30:00Z",
    status: "hot",
    notes: "Minat 50 unit kartu NFC untuk tim Business Development",
    connectedMomId: "mtg_02",
  },
  {
    id: "cnt_02",
    name: "Siti Rahmawati",
    company: "Kreatif Media Hub",
    phone: "+62 856-1122-3344",
    email: "siti@kreatifmedia.com",
    tappedAt: "2026-10-20 16:45",
    createdAt: "2026-10-20T16:45:00Z",
    status: "warm",
    notes: "Minta sampel fisik warna black-gold",
  },
  {
    id: "cnt_03",
    name: "Denny Setiawan",
    company: "Venture Global Indo",
    phone: "+62 818-4455-6677",
    email: "denny@ventureglobal.id",
    tappedAt: "2026-10-18 11:20",
    createdAt: "2026-10-18T11:20:00Z",
    status: "cold",
    notes: "Tap di acara TechInAsia conference",
  },
];

const INITIAL_TRANSACTIONS: CoinTransaction[] = [
  {
    id: "tx_01",
    type: "usage",
    amount: -5,
    service: "mom_transcribe",
    description: "MoM AI: Kickoff Integrasi NFC Card",
    timestamp: "2026-10-22 14:48",
    createdAt: "2026-10-22T14:48:00Z",
  },
  {
    id: "tx_02",
    type: "usage",
    amount: -5,
    service: "mom_transcribe",
    description: "MoM AI: Review Partnership Mandiri Tech",
    timestamp: "2026-10-21 11:05",
    createdAt: "2026-10-21T11:05:00Z",
  },
  {
    id: "tx_03",
    type: "bonus",
    amount: 50,
    service: "topup_pack",
    description: "Bonus Aktivasi NFC Card Baru",
    timestamp: "2026-10-20 09:00",
    createdAt: "2026-10-20T09:00:00Z",
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  // Auth & Account State
  account: {
    email: "deo@cardi.co.id",
    name: "Deo Cardi Nathanael",
    avatarUrl: "https://www.cardi.co.id/deo-cardi.jpg",
    coinsBalance: 240,
    coinBalance: 240,
    freemiumGranted: true,
    subscription: {
      status: "active",
      tier: "pro",
      currentPeriodEnd: "2026-12-31T00:00:00Z",
    },
    pairedApp: {
      deviceId: "dev_samsung_s24",
      deviceModel: "Samsung Galaxy S24 Ultra (Cardi MoM App)",
      pairedAt: "2026-10-20T10:00:00Z",
    },
  },
  sessionToken: "tok_session_active",
  setSession: (token, account) => set({ sessionToken: token, account }),

  setPairedApp: (paired) =>
    set((state) => ({
      account: {
        ...state.account,
        pairedApp: paired,
      },
    })),

  updateCoinBalance: (balance) =>
    set((state) => ({
      account: {
        ...state.account,
        coinsBalance: balance,
        coinBalance: balance,
      },
    })),

  deductCoins: (amount, reason = "Transkripsi MoM AI") => {
    const current = get().account.coinsBalance;
    if (current < amount) return false;
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}`,
      type: "usage",
      amount: -amount,
      service: "mom_transcribe",
      description: reason,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      account: {
        ...state.account,
        coinsBalance: current - amount,
        coinBalance: current - amount,
      },
      transactions: [newTx, ...state.transactions],
      coinHistory: [newTx, ...state.transactions],
    }));
    return true;
  },

  addCoins: (amount, reason = "Top-up Koin") => {
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}`,
      type: "topup",
      amount,
      service: "topup_pack",
      description: reason,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const nextBalance = state.account.coinsBalance + amount;
      return {
        account: {
          ...state.account,
          coinsBalance: nextBalance,
          coinBalance: nextBalance,
        },
        transactions: [newTx, ...state.transactions],
        coinHistory: [newTx, ...state.transactions],
      };
    });
  },

  // NFC Card Profile
  cardProfile: {
    username: "deo",
    fullName: "Deo Cardi Nathanael",
    headline: "Founder & CEO, Cardi Nusantara",
    company: "PT Digital Cardi Nusantara",
    phone: "+62 812-8989-5646",
    email: "deo@cardi.co.id",
    website: "https://www.cardi.co.id",
    location: "Jakarta, Indonesia",
    bio: "Lebih dari 10 tahun membangun 30+ brand dan bisnis di F&B, FMCG, lifestyle, hingga ekosistem otomasi bisnis & MoM berbasis AI. Dilihat, diingat, dipercaya.",
    avatarUrl: "https://www.cardi.co.id/deo-cardi.jpg",
    cardDesign: "black-gold",
    socials: {
      whatsapp: "https://api.whatsapp.com/send/?phone=6281289895646&text=Halo%20Deo%2C%20saya%20dari%20kartu%20NFC%20Cardi.%20Saya%20ingin%20konsultasi%20tentang%20brand%20saya.",
      linkedin: "https://www.linkedin.com/in/deocardi/",
      instagram: "https://www.instagram.com/deo_cardi/",
      github: "https://github.com/cardinusantara",
    },
    metrics: {
      totalTaps: 348,
      contactsSaved: 215,
      momInitiated: 64,
    },
  },
  updateCardProfile: (updates) =>
    set((state) => ({
      cardProfile: { ...state.cardProfile, ...updates },
    })),
  incrementTaps: () =>
    set((state) => ({
      cardProfile: {
        ...state.cardProfile,
        metrics: {
          ...state.cardProfile.metrics,
          totalTaps: state.cardProfile.metrics.totalTaps + 1,
        },
      },
    })),

  // Meetings
  meetings: MOCK_MEETINGS,
  activeRecording: false,
  recordingSeconds: 0,
  setMeetings: (meetings) => set({ meetings }),
  addMeeting: (meeting) =>
    set((state) => ({
      meetings: [meeting, ...state.meetings],
      cardProfile: {
        ...state.cardProfile,
        metrics: {
          ...state.cardProfile.metrics,
          momInitiated: state.cardProfile.metrics.momInitiated + 1,
        },
      },
    })),
  setActiveRecording: (active) => set({ activeRecording: active }),
  setRecordingSeconds: (seconds) =>
    set((state) => ({
      recordingSeconds:
        typeof seconds === "function" ? seconds(state.recordingSeconds) : seconds,
    })),

  // Leads / Contacts
  contacts: INITIAL_CONTACTS,
  leads: INITIAL_CONTACTS,
  addContact: (contact) =>
    set((state) => {
      const nextContacts = [contact, ...state.contacts];
      return {
        contacts: nextContacts,
        leads: nextContacts,
        cardProfile: {
          ...state.cardProfile,
          metrics: {
            ...state.cardProfile.metrics,
            contactsSaved: state.cardProfile.metrics.contactsSaved + 1,
          },
        },
      };
    }),
  addLead: (lead) => get().addContact(lead),
  updateContactStatus: (id, status) =>
    set((state) => {
      const nextContacts = state.contacts.map((c) => (c.id === id ? { ...c, status } : c));
      return {
        contacts: nextContacts,
        leads: nextContacts,
      };
    }),

  // Transactions history
  transactions: INITIAL_TRANSACTIONS,
  coinHistory: INITIAL_TRANSACTIONS,

  // Switcher
  currentProductTab: "card",
  setCurrentProductTab: (tab) => set({ currentProductTab: tab }),
}));
