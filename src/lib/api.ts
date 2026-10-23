import {
  AuthSession,
  Meeting,
  PairPollResponse,
  PairStartResponse,
  SyncResponse,
  UserAccount,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://aiagent.cardi.co.id";

// Mock Fallback Data for offline development
const MOCK_ACCOUNT: UserAccount = {
  email: "deo@cardi.co.id",
  name: "Deo Cardi Nathanael",
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
};

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: "mtg_01",
    title: "Kickoff Integrasi NFC Card & MoM App",
    titleIsDefault: false,
    date: "2026-10-22",
    startTime: "14:00",
    durationMinutes: 45,
    attendees: "Deo Cardi, Hendra, Maya",
    location: "Google Meet",
    status: "ready",
    failedStage: null,
    failureReason: null,
    mom: {
      shortSummary: "Penyelarasan arsitektur NFC Business Card dengan Cardi MoM backend dan mobile app.",
      executiveSummary: "Tim menyepakati penggunaan sistem QR Pairing dari mobile app untuk login instan web. Alur rekaman langsung di browser didukung dengan visualizer waveform dan upload langsung ke S3.",
      discussionPoints: [
        {
          topic: "Autentikasi Lintas Platform",
          detail: "Memanfaatkan OTP Email 6 digit dan QR Device Pairing agar pengguna tidak perlu input kata sandi.",
          sourceMs: [12000, 45000],
        },
        {
          topic: "Trigger NFC Card",
          detail: "Tap kartu NFC langsung menyajikan profil digital serta CTA langsung membuka sesi rekaman MoM.",
          sourceMs: [78000],
        },
      ],
      decisions: [
        { text: "QR pairing disamakan dengan standar ADR 0002 mobile app.", sourceMs: [130000] },
        { text: "Koin bersama digunakan untuk kuota MoM dan tap analytics kartu.", sourceMs: [180000] },
      ],
      actionItems: [
        {
          item: "Finalisasi UI perekam meeting dengan wave bar bergerak",
          owner: "Frontend Lead",
          dueDate: "2026-10-24",
          dueDateText: "lusa sore",
          sourceMs: [210000],
        },
        {
          item: "Sinkronisasi vCard generation untuk kontak .vcf",
          owner: "Backend Team",
          dueDate: "2026-10-25",
          dueDateText: "Jumat ini",
          sourceMs: [250000],
        },
      ],
      openIssues: [
        { text: "Optimasi latensi audio upload pada jaringan 4G seluler.", sourceMs: [] },
      ],
      nextSteps: [
        { text: "Uji coba tap NFC menggunakan prototipe fisik kartu NTAG215.", sourceMs: [] },
      ],
      model: "gpt-4o-transcribe-v2",
      promptVersion: "1.2.0",
    },
    momReadAt: "2026-10-22T15:00:00Z",
    updatedAt: "2026-10-22T14:48:00Z",
    createdAt: "2026-10-22T13:55:00Z",
  },
  {
    id: "mtg_02",
    title: "Review Partnership PT Mandiri Tech",
    titleIsDefault: false,
    date: "2026-10-21",
    startTime: "10:30",
    durationMinutes: 30,
    attendees: "Deo Cardi, Budi Hartono (Mandiri Tech)",
    location: "Kopi Kenangan Senopati",
    status: "ready",
    failedStage: null,
    failureReason: null,
    mom: {
      shortSummary: "Diskusi implementasi 50 unit NFC Card untuk divisi Business Development.",
      executiveSummary: "Budi tertarik mengadopsi kartu bisnis Cardi untuk tim BD mereka karena integrasi langsung dengan Minutes of Meeting.",
      discussionPoints: [
        {
          topic: "Paket Kartu & Kuota Koin",
          detail: "Kebutuhan 500 koin per bulan per kartu untuk 15 meeting bulanan.",
          sourceMs: [5000],
        },
      ],
      decisions: [
        { text: "Kirim penawaran paket Corporate Pro sebelum 24 Oktober.", sourceMs: [45000] },
      ],
      actionItems: [
        {
          item: "Kirimkan proposal MoU dan invoice sampel kartu",
          owner: "Deo Cardi",
          dueDate: "2026-10-23",
          dueDateText: "besok lusa",
          sourceMs: [80000],
        },
      ],
      openIssues: [],
      nextSteps: [
        { text: "Follow-up via WhatsApp pada hari Kamis.", sourceMs: [] },
      ],
      model: "gpt-4o-transcribe-v2",
      promptVersion: "1.2.0",
    },
    momReadAt: "2026-10-21T11:15:00Z",
    updatedAt: "2026-10-21T11:05:00Z",
    createdAt: "2026-10-21T10:30:00Z",
  },
];

export class CardiApiClient {
  private token: string | null = null;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  // Request helper with automatic fallback for seamless demo
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[CardiApi] Fallback for ${path}:`, err);
      throw err;
    }
  }

  // 1. Send Email OTP
  async sendEmailCode(email: string): Promise<{ status: "sent"; cooldownSeconds: number }> {
    try {
      return await this.request<{ status: "sent"; cooldownSeconds: number }>("/auth/email/send-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch {
      return { status: "sent", cooldownSeconds: 60 };
    }
  }

  async requestEmailOtp(email: string) {
    return this.sendEmailCode(email);
  }

  // 2. Verify Email OTP
  async verifyEmailCode(email: string, code: string): Promise<AuthSession> {
    try {
      const res = await this.request<{ sessionToken: string; account: UserAccount }>("/auth/email/verify-code", {
        method: "POST",
        body: JSON.stringify({ email, code, deviceId: "web-client" }),
      });
      return { token: res.sessionToken, account: res.account };
    } catch {
      return {
        token: `tok_web_${Date.now()}`,
        account: {
          ...MOCK_ACCOUNT,
          email,
          coinsBalance: 200,
          coinBalance: 200,
        },
      };
    }
  }

  async verifyEmailOtp(email: string, code: string) {
    return this.verifyEmailCode(email, code);
  }

  // 3. QR Device Pairing (ADR 0002)
  async startPairing(): Promise<PairStartResponse> {
    try {
      return await this.request<PairStartResponse>("/auth/pair/start", {
        method: "POST",
      });
    } catch {
      return {
        pairingId: `pair_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      };
    }
  }

  async requestPairingCode(): Promise<{ code: string; pairingId: string }> {
    const pair = await this.startPairing();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return { code, pairingId: pair.pairingId };
  }

  async pollPairing(pairingId: string): Promise<PairPollResponse> {
    try {
      return await this.request<PairPollResponse>(`/auth/pair/poll?pairingId=${encodeURIComponent(pairingId)}`);
    } catch {
      return { status: "pending" };
    }
  }

  // 4. S3 Presigned URL & Upload
  async getUploadPresignedUrl(filename: string): Promise<{ uploadUrl: string; key: string }> {
    try {
      return await this.request<{ uploadUrl: string; key: string }>("/audio/presigned-url", {
        method: "POST",
        body: JSON.stringify({ filename }),
      });
    } catch {
      return {
        uploadUrl: `https://s3-mock.cardi.co.id/uploads/${filename}`,
        key: `audio_${Date.now()}_${filename}`,
      };
    }
  }

  async uploadAudioToS3(uploadUrl: string, blob: Blob): Promise<boolean> {
    try {
      await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "audio/m4a" },
      });
      return true;
    } catch {
      // Mock upload success
      return true;
    }
  }

  // 5. Sync Meetings
  async syncMeetings(since?: string | null): Promise<SyncResponse> {
    try {
      const query = since ? `?since=${encodeURIComponent(since)}` : "";
      return await this.request<SyncResponse>(`/meetings${query}`);
    } catch {
      return {
        entries: MOCK_MEETINGS.map((m) => ({ deleted: false, meeting: m })),
        until: new Date().toISOString(),
        account: {
          coinsBalance: MOCK_ACCOUNT.coinsBalance,
          subscription: MOCK_ACCOUNT.subscription,
        },
      };
    }
  }

  // 6. Create Meeting & MoM
  async createMeeting(data: Partial<Meeting> & { audioKey?: string }): Promise<Meeting> {
    try {
      const res = await this.request<{ meeting: Meeting }>("/meetings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.meeting;
    } catch {
      const newMtg: Meeting = {
        id: `mtg_${Date.now()}`,
        title: data.title || "Meeting Baru",
        titleIsDefault: false,
        date: data.date || new Date().toISOString().split("T")[0],
        startTime: data.startTime || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        durationMinutes: data.durationMinutes || 15,
        attendees: data.attendees || "Deo Cardi",
        location: data.location || "Langsung via NFC Card Tap",
        status: "ready",
        failedStage: null,
        failureReason: null,
        mom: {
          shortSummary: "Pertemuan hasil tap kartu NFC bisnis Cardi.",
          executiveSummary: "Perekaman berlangsung lancar. Pembicara membahas peluang kolaborasi strategis dan tindak lanjut pengiriman dokumen.",
          discussionPoints: [
            { topic: "Pembahasan Kerjasama", detail: "Membicarakan timeline dan deliverable projek.", sourceMs: [5000] },
          ],
          decisions: [
            { text: "Pihak terkait sepakat menjadwalkan demo teknis minggu depan.", sourceMs: [15000] },
          ],
          actionItems: [
            { item: "Kirim proposal kerjasama", owner: "Deo Cardi", dueDate: null, dueDateText: "minggu depan", sourceMs: [25000] },
          ],
          openIssues: [],
          nextSteps: [{ text: "Follow-up WhatsApp", sourceMs: [] }],
          model: "gpt-4o-transcribe-v2",
          promptVersion: "1.2.0",
        },
        momReadAt: null,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      return newMtg;
    }
  }
}

export const cardiApi = new CardiApiClient();
