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

  // Reject raw email addresses passed directly as Bearer tokens
  if (token.includes("@")) {
    return {
      authorized: false,
      status: 401,
      error: "Akses ditolak: Token autentikasi tidak valid.",
    };
  }

  let email: string | null = null;
  const isDottedToken = token.includes(".");

  if (isDottedToken) {
    const parts = token.split(".");

    const tryParseJson = (segment: string): Record<string, any> | null => {
      if (!segment || typeof segment !== "string") return null;
      let clean = segment.trim();
      if (clean.includes("%")) {
        try {
          clean = decodeURIComponent(clean);
        } catch {
          // Keep raw if decoding fails
        }
      }

      // 1. Try native Node base64url decoding
      try {
        const jsonPayload = Buffer.from(clean, "base64url").toString("utf-8");
        const parsed = JSON.parse(jsonPayload);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}

      // 2. Try standard base64 with URL replacement and calculated padding
      try {
        let b64 = clean.replace(/-/g, "+").replace(/_/g, "/");
        const padLen = (4 - (b64.length % 4)) % 4;
        b64 += "=".repeat(padLen);
        const jsonPayload = Buffer.from(b64, "base64").toString("utf-8");
        const parsed = JSON.parse(jsonPayload);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}

      // 3. Try parsing as direct raw JSON
      try {
        const parsed = JSON.parse(clean);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}

      return null;
    };

    const validateClaims = (
      parsed: Record<string, any>
    ): { errorStatus?: 401; errorMessage?: string; email?: string } => {
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
            errorStatus: 401,
            errorMessage:
              "Akses ditolak: Format klaim masa berlaku (exp) pada token tidak valid.",
          };
        }

        if (expNum > 1e11) {
          expNum = Math.floor(expNum / 1000);
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (expNum < currentTime) {
          return {
            errorStatus: 401,
            errorMessage: "Akses ditolak: Token autentikasi telah kedaluwarsa.",
          };
        }
      }

      if (typeof parsed.email === "string" && parsed.email.trim()) {
        return { email: parsed.email.trim() };
      }

      return {};
    };

    if (parts.length >= 3) {
      // Check if parts[0] represents an explicit JWT JOSE header
      const headerCandidate = tryParseJson(parts[0]);
      const isExplicitJwtHeader =
        Boolean(headerCandidate && (headerCandidate.alg || headerCandidate.typ)) ||
        parts[0].trim().toLowerCase() === "header";

      if (isExplicitJwtHeader) {
        // Standard JWT: payload is expected in parts[1]
        const parsed = tryParseJson(parts[1]);
        if (!parsed) {
          return {
            authorized: false,
            status: 401,
            error: "Akses ditolak: Format token JWT tidak valid.",
          };
        }

        const claimResult = validateClaims(parsed);
        if (claimResult.errorStatus) {
          return {
            authorized: false,
            status: claimResult.errorStatus,
            error: claimResult.errorMessage,
          };
        }

        if (claimResult.email) {
          email = claimResult.email;
        } else {
          return {
            authorized: false,
            status: 403,
            error:
              "Akses ditolak: Token autentikasi tidak memuat klaim email yang sah.",
          };
        }
      } else {
        // Multi-segment token without explicit JWT header.
        // Check all segments to see if any segment contains JSON claims.
        let jsonPayload: Record<string, any> | null = null;
        for (const p of parts) {
          const candidate = tryParseJson(p);
          if (
            candidate &&
            (candidate.email ||
              candidate.exp !== undefined ||
              candidate.sub ||
              candidate.accountId)
          ) {
            jsonPayload = candidate;
            break;
          }
        }

        if (jsonPayload) {
          const claimResult = validateClaims(jsonPayload);
          if (claimResult.errorStatus) {
            return {
              authorized: false,
              status: claimResult.errorStatus,
              error: claimResult.errorMessage,
            };
          }
          if (claimResult.email) {
            email = claimResult.email;
          }
        }
        // If neither segment is JSON, it is an opaque multi-part session token.
        // Email will be resolved from x-admin-email header below.
      }
    } else if (parts.length === 2) {
      // 2-part signed session token (payload.signature or session_id.signature)
      const part0 = parts[0].trim();
      const part1 = parts[1].trim();

      if (
        !part0 ||
        !part1 ||
        invalidOpaqueTokens.has(part0.toLowerCase()) ||
        invalidOpaqueTokens.has(part1.toLowerCase())
      ) {
        return {
          authorized: false,
          status: 401,
          error: "Akses ditolak: Token autentikasi tidak valid.",
        };
      }

      // Check if part 0 or part 1 contains an embedded base64url JSON payload
      const jsonPayload = tryParseJson(part0) || tryParseJson(part1);
      if (jsonPayload) {
        const claimResult = validateClaims(jsonPayload);
        if (claimResult.errorStatus) {
          return {
            authorized: false,
            status: claimResult.errorStatus,
            error: claimResult.errorMessage,
          };
        }
        if (claimResult.email) {
          email = claimResult.email;
        }
      }
      // If neither part is JSON, it is an opaque signed session token.
      // Email will be resolved from x-admin-email header below.
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
