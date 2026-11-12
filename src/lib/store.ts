import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AppLocale,
  AppTheme,
  CalendarEvent,
  CardProfile,
  CoinTransaction,
  ContactLead,
  Meeting,
  PairedDevice,
  UserAccount,
} from "./types";

interface AppState {
  // Auth & Account
  account: UserAccount;
  sessionToken: string | null;
  setSession: (token: string, account: UserAccount) => void;
  loginWithGoogle: (profile: { name: string; email: string; avatarUrl?: string }, token: string) => void;
  logout: () => void;
  resetAllData: () => void;
  setPairedApp: (device: PairedDevice | null) => void;
  updateCoinBalance: (coins: number) => void;
  deductCoins: (amount: number, reason: string) => boolean;
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
  updateContactStatus: (id: string, status: "hot" | "warm" | "cold") => void;

  // Calendar & Scheduling
  calendarEvents: CalendarEvent[];
  isGoogleCalendarConnected: boolean;
  setGoogleCalendarConnected: (connected: boolean) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  deleteCalendarEvent: (id: string) => void;
  syncMomToCalendar: () => number;

  // Transactions
  transactions: CoinTransaction[];
  coinHistory: CoinTransaction[]; // alias for convenience

  // Active Tab Filter
  currentProductTab: "card" | "mom" | "calendar" | "wallet";
  setCurrentProductTab: (tab: "card" | "mom" | "calendar" | "wallet") => void;

  // Theme & Locale
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  toggleLocale: () => void;
}

const CLEAN_ACCOUNT: UserAccount = {
  email: "",
  name: "",
  avatarUrl: "",
  coinsBalance: 0,
  coinBalance: 0,
  freemiumGranted: false,
  subscription: {
    status: "none",
    tier: null,
    currentPeriodEnd: null,
  },
  pairedApp: null,
};

const CLEAN_CARD_PROFILE: CardProfile = {
  username: "",
  fullName: "",
  headline: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  location: "",
  bio: "",
  avatarUrl: "",
  cardDesign: "black-gold",
  socials: {},
  metrics: {
    totalTaps: 0,
    contactsSaved: 0,
    momInitiated: 0,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth & Account State (Clean Zero - Default Logged Out)
      account: CLEAN_ACCOUNT,
      sessionToken: null,
      setSession: (token, account) => {
        const usernameClean = account.email
          ? account.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
          : "";
        const defaultName = account.email
          ? account.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "";
        const existingProfile = get().cardProfile;
        const isSameUser = existingProfile.email === account.email && existingProfile.email !== "";

        const updatedCardProfile: CardProfile = isSameUser
          ? {
              ...existingProfile,
              fullName: account.name || existingProfile.fullName || defaultName,
              email: account.email || existingProfile.email,
              avatarUrl: account.avatarUrl || existingProfile.avatarUrl || "",
            }
          : {
              ...CLEAN_CARD_PROFILE,
              fullName: account.name || defaultName,
              email: account.email,
              username: usernameClean,
              avatarUrl: account.avatarUrl || "",
              headline: "Pengguna Ekosistem Cardi",
              company: "Cardi Network",
              location: "Indonesia",
              website: "https://cardi.co.id",
            };

        set({
          sessionToken: token,
          account: {
            ...account,
            name: account.name || defaultName,
            coinBalance: account.coinsBalance ?? account.coinBalance ?? 0,
          },
          cardProfile: updatedCardProfile,
        });
      },

      loginWithGoogle: (profile, token) => {
        const cleanAccount: UserAccount = {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl || "",
          coinsBalance: 0,
          coinBalance: 0,
          freemiumGranted: false,
          subscription: {
            status: "none",
            tier: null,
            currentPeriodEnd: null,
          },
          pairedApp: null,
        };
        get().setSession(token, cleanAccount);
      },

      logout: () => {
        set({
          sessionToken: null,
          account: CLEAN_ACCOUNT,
          cardProfile: CLEAN_CARD_PROFILE,
          meetings: [],
          contacts: [],
          leads: [],
          calendarEvents: [],
          transactions: [],
          coinHistory: [],
        });
      },

      resetAllData: () => {
        set({
          account: CLEAN_ACCOUNT,
          sessionToken: null,
          cardProfile: CLEAN_CARD_PROFILE,
          meetings: [],
          contacts: [],
          leads: [],
          transactions: [],
          coinHistory: [],
          activeRecording: false,
          recordingSeconds: 0,
          calendarEvents: [],
        });
      },

      setPairedApp: (device) =>
        set((state) => ({
          account: { ...state.account, pairedApp: device },
        })),

      updateCoinBalance: (coins) =>
        set((state) => ({
          account: { ...state.account, coinsBalance: coins, coinBalance: coins },
        })),

      deductCoins: (amount, reason) => {
        const currentBalance = get().account.coinBalance ?? get().account.coinsBalance ?? 0;
        if (currentBalance < amount) return false;

        const newBalance = currentBalance - amount;
        const newTx: CoinTransaction = {
          id: `tx_${Date.now()}`,
          type: "usage",
          amount: -amount,
          service: "mom_transcribe",
          description: reason,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedTransactions = [newTx, ...state.transactions];
          return {
            account: {
              ...state.account,
              coinsBalance: newBalance,
              coinBalance: newBalance,
            },
            transactions: updatedTransactions,
            coinHistory: updatedTransactions,
          };
        });
        return true;
      },

      addCoins: (amount, reason = "Top-up Saldo Koin") => {
        const currentBalance = get().account.coinBalance ?? get().account.coinsBalance ?? 0;
        const newBalance = currentBalance + amount;
        const newTx: CoinTransaction = {
          id: `tx_${Date.now()}`,
          type: "topup",
          amount,
          service: "topup_pack",
          description: reason,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedTransactions = [newTx, ...state.transactions];
          return {
            account: {
              ...state.account,
              coinsBalance: newBalance,
              coinBalance: newBalance,
            },
            transactions: updatedTransactions,
            coinHistory: updatedTransactions,
          };
        });
      },

      // NFC Card Profile (Clean Zero)
      cardProfile: CLEAN_CARD_PROFILE,
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

      // Meetings (Clean Zero)
      meetings: [],
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

      // Leads / Contacts (Clean Zero)
      contacts: [],
      leads: [],
      addContact: (contact) =>
        set((state) => {
          const updated = [contact, ...state.contacts];
          return {
            contacts: updated,
            leads: updated,
            cardProfile: {
              ...state.cardProfile,
              metrics: {
                ...state.cardProfile.metrics,
                contactsSaved: state.cardProfile.metrics.contactsSaved + 1,
              },
            },
          };
        }),
      updateContactStatus: (id, status) =>
        set((state) => {
          const updated = state.contacts.map((c) => (c.id === id ? { ...c, status } : c));
          return { contacts: updated, leads: updated };
        }),

      // Calendar & Scheduling (Clean Zero)
      calendarEvents: [],
      isGoogleCalendarConnected: false,
      setGoogleCalendarConnected: (connected) => set({ isGoogleCalendarConnected: connected }),
      addCalendarEvent: (event) =>
        set((state) => ({ calendarEvents: [event, ...state.calendarEvents] })),
      deleteCalendarEvent: (id) =>
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
        })),
      syncMomToCalendar: () => {
        const meetings = get().meetings;
        let syncedCount = 0;
        const newEvents: CalendarEvent[] = [];

        meetings.forEach((m) => {
          if (m.mom?.actionItems && m.mom.actionItems.length > 0) {
            m.mom.actionItems.forEach((ai, idx) => {
              const eventDate = ai.dueDate || new Date(Date.now() + (idx + 1) * 86400000).toISOString().split("T")[0];
              newEvents.push({
                id: `ev_mom_${m.id}_${idx}`,
                title: `[Tindak Lanjut] ${ai.item}`,
                date: eventDate,
                time: "09:00 - 10:00",
                attendees: `${ai.owner || "PIC"} & Tim`,
                location: "Google Meet / Ruang Rapat",
                status: "upcoming",
                source: "MoM Action Item",
                momId: m.id,
                notes: `Dibuat otomatis dari notula AI: ${m.title}`,
                googleCalendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                  `[Action Item] ${ai.item}`
                )}&dates=${eventDate.replace(/-/g, "")}T020000Z/${eventDate.replace(/-/g, "")}T030000Z&details=${encodeURIComponent(
                  `Tindak lanjut dari notula rapat: ${m.title}\nPIC: ${ai.owner}`
                )}`,
              });
              syncedCount++;
            });
          }
        });

        if (newEvents.length > 0) {
          set((state) => ({
            calendarEvents: [...newEvents, ...state.calendarEvents],
          }));
        }
        return syncedCount;
      },

      // Transactions history (Clean Zero)
      transactions: [],
      coinHistory: [],

      // Switcher
      currentProductTab: "card",
      setCurrentProductTab: (tab) => set({ currentProductTab: tab }),

      // Theme & Localization (Dark / Light, ID / EN) - Default: Light Mode
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      locale: "id",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set((s) => ({ locale: s.locale === "id" ? "en" : "id" })),
    }),
    {
      name: "cardi_nfc_storage_v3",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
