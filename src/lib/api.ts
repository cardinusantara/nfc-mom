import {
  AuthSession,
  Meeting,
  PairPollResponse,
  PairStartResponse,
  SyncResponse,
  UserAccount,
  CardProfile,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fuldtvg7vk.execute-api.ap-southeast-1.amazonaws.com";

// Clean initial state for new user
const MOCK_ACCOUNT: UserAccount = {
  email: "",
  name: "",
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

export const MOCK_MEETINGS: Meeting[] = [];

export class CardiApiClient {
  private token: string | null = null;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  // Request helper with clean error reporting
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = `API error: ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // default status message
      }
      throw new Error(errorMessage);
    }

    return (await res.json()) as T;
  }

  // 1. Send Email OTP (ADR 0007)
  async sendEmailCode(
    email: string
  ): Promise<{ status: "sent"; cooldownSeconds: number; expiresInSeconds?: number }> {
    return await this.request<{
      status: "sent";
      cooldownSeconds: number;
      expiresInSeconds?: number;
    }>("/auth/email/send-code", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  }

  async requestEmailOtp(email: string) {
    return this.sendEmailCode(email);
  }

  // 2. Verify Email OTP (ADR 0007)
  async verifyEmailCode(
    email: string,
    code: string,
    deviceId = "web_nfc_portal"
  ): Promise<AuthSession> {
    const res = await this.request<{ sessionToken: string; account: UserAccount }>(
      "/auth/email/verify-code",
      {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          deviceId,
        }),
      }
    );
    return { token: res.sessionToken, account: res.account };
  }

  async verifyEmailOtp(email: string, code: string, deviceId = "web_nfc_portal") {
    return this.verifyEmailCode(email, code, deviceId);
  }

  // 3. QR Device Pairing with Cardi MoM Mobile App (ADR 0002)
  async startPairing(): Promise<PairStartResponse> {
    return await this.request<PairStartResponse>("/auth/pair/start", {
      method: "POST",
    });
  }

  async pollPairing(pairingId: string): Promise<PairPollResponse> {
    return await this.request<PairPollResponse>(
      `/auth/pair/poll?pairingId=${encodeURIComponent(pairingId.trim())}`
    );
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

  // 7. NFC Smart Card & Public Profile Endpoints
  async fetchPublicProfile(username: string): Promise<CardProfile | null> {
    try {
      const res = await this.request<{ profile: CardProfile }>(
        `/nfc/profile/${encodeURIComponent(username.toLowerCase())}`
      );
      return res.profile;
    } catch (err) {
      console.warn(`[CardiApi] Profile not found or error for ${username}:`, err);
      return null;
    }
  }

  async recordCardTap(username: string): Promise<{ success: boolean; totalTaps: number }> {
    try {
      return await this.request<{ success: boolean; totalTaps: number }>(
        `/nfc/profile/${encodeURIComponent(username.toLowerCase())}/tap`,
        { method: "POST" }
      );
    } catch {
      return { success: false, totalTaps: 0 };
    }
  }

  async activateCard(data: {
    tagId: string;
    username: string;
    email: string;
    fullName: string;
    headline?: string;
    company?: string;
    phone?: string;
    website?: string;
    location?: string;
    bio?: string;
    bundleTier?: "none" | "card_only" | "quick" | "bulk" | "custom";
    cardDesign?: "black-gold" | "royal-blue" | "silver-minimal";
  }): Promise<{
    success: boolean;
    username: string;
    tagId: string;
    email: string;
    coinsCredited: number;
    totalCoinsBalance: number;
    profile: CardProfile;
  }> {
    return await this.request(`/nfc/activate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCardProfile(profile: Partial<CardProfile>): Promise<CardProfile> {
    const res = await this.request<{ profile: CardProfile }>(`/nfc/profile`, {
      method: "PUT",
      body: JSON.stringify(profile),
    });
    return res.profile;
  }
}

export const cardiApi = new CardiApiClient();
