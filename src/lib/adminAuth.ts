export const ADMIN_EMAILS = [
  "cardinusantara@gmail.com",
  "dimasaldi428@gmail.com",
] as const;

export const ADMIN_EMAIL = ADMIN_EMAILS[0];

export function isAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized);
}

export interface AdminAuthResult {
  authorized: boolean;
  status: 200 | 401 | 403;
  error?: string;
  email?: string;
}

export function verifyAdminRequest(req: Request): AdminAuthResult {
  const authHeader = req.headers.get("authorization");
  const adminEmailHeader = req.headers.get("x-admin-email");

  if (!authHeader || !authHeader.trim()) {
    return {
      authorized: false,
      status: 401,
      error: "Akses ditolak: Autentikasi diperlukan. Header Authorization tidak ditemukan.",
    };
  }

  const trimmedHeader = authHeader.trim();
  if (!/^Bearer(\s+|$)/i.test(trimmedHeader)) {
    return {
      authorized: false,
      status: 401,
      error: "Akses ditolak: Skema autentikasi harus Bearer.",
    };
  }

  let token = trimmedHeader.replace(/^Bearer(\s+|$)/i, "").trim();
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }

  const lowerToken = token.toLowerCase();
  const invalidOpaqueTokens = new Set([
    "null",
    "undefined",
    "[object object]",
    "false",
    "true",
    "none",
    "0",
    "nan",
    "void 0",
    "nil",
    "[]",
    "{}",
    '""',
    "''",
  ]);
  if (!token || invalidOpaqueTokens.has(lowerToken)) {
    return {
      authorized: false,
      status: 401,
      error: "Akses ditolak: Token autentikasi tidak valid.",
    };
  }

  let email: string | null = null;
  const isJwtCandidate = token.includes(".");

  if (isJwtCandidate) {
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
        const parsed = JSON.parse(jsonPayload);
        if (parsed && typeof parsed === "object") {
          const rawExp = parsed.exp;
          if (rawExp !== undefined) {
            let expNum =
              typeof rawExp === "number"
                ? rawExp
                : typeof rawExp === "string" && rawExp.trim()
                ? Number(rawExp.trim())
                : NaN;

            if (
              Number.isNaN(expNum) ||
              !Number.isFinite(expNum) ||
              typeof rawExp === "boolean" ||
              rawExp === null
            ) {
              return {
                authorized: false,
                status: 401,
                error: "Akses ditolak: Format klaim masa berlaku (exp) pada token tidak valid.",
              };
            }

            if (expNum > 1e11) {
              expNum = Math.floor(expNum / 1000);
            }

            const currentTime = Math.floor(Date.now() / 1000);
            if (expNum < currentTime) {
              return {
                authorized: false,
                status: 401,
                error: "Akses ditolak: Token autentikasi telah kedaluwarsa.",
              };
            }
          }
        }
        if (parsed && typeof parsed.email === "string" && parsed.email.trim()) {
          email = parsed.email.trim();
        } else {
          return {
            authorized: false,
            status: 403,
            error: "Akses ditolak: Token autentikasi tidak memuat klaim email yang sah.",
          };
        }
      }
    } catch {
      return {
        authorized: false,
        status: 401,
        error: "Akses ditolak: Format token JWT tidak valid.",
      };
    }
  }

  if (email && adminEmailHeader && adminEmailHeader.trim().toLowerCase() !== email.toLowerCase()) {
    return {
      authorized: false,
      status: 403,
      error: "Akses ditolak: Ketidakcocokan identitas autentikasi.",
    };
  }

  if (!email && adminEmailHeader) {
    email = adminEmailHeader.trim();
  }

  if (!email) {
    return {
      authorized: false,
      status: 403,
      error: "Akses ditolak: Identitas pengguna tidak ditemukan.",
    };
  }

  if (!isAdminEmail(email)) {
    return {
      authorized: false,
      status: 403,
      error: "Akses ditolak: Hanya akun admin terdaftar yang berwenang.",
    };
  }

  return {
    authorized: true,
    status: 200,
    email,
  };
}
