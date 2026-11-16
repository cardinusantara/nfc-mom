/**
 * Cardi MoM Mobile Hand-off and Direct S3 Upload Utility
 * Bypasses Next.js server for audio payloads and coordinates deep-link navigation.
 * Rule: Zero em dash characters in this file.
 */

import { STORE_URLS } from "./device";

export interface LaunchMobileHandOffOptions {
  meetingId: string;
  title?: string;
  onAppNotInstalled: () => void;
  source?: string;
}

export interface LaunchMobileRecordingOptions {
  title?: string;
  onAppNotInstalled: () => void;
  source?: string;
}

function launchDeepLinkWithProbe(deepLinkUri: string, onAppNotInstalled: () => void): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const startTime = Date.now();
  let hasNavigatedAway = false;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      hasNavigatedAway = true;
    }
  };

  const handleBlur = () => {
    hasNavigatedAway = true;
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleBlur);

  // Trigger custom URL scheme navigation
  window.location.href = deepLinkUri;

  // Fallback probe timer: 2000ms
  setTimeout(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleBlur);

    const elapsed = Date.now() - startTime;
    // If window remained visible and focused, mobile app is not installed
    const stillFocused = typeof document.hasFocus === "function" ? document.hasFocus() : true;
    if (!hasNavigatedAway && elapsed < 2600 && stillFocused) {
      onAppNotInstalled();
    }
  }, 2000);
}

export function launchMobileHandOff(options: LaunchMobileHandOffOptions): void {
  const { meetingId, title, onAppNotInstalled, source = "web" } = options;
  const titleParam = title ? `&title=${encodeURIComponent(title)}` : "";
  const uri = `${STORE_URLS.scheme}meeting/${encodeURIComponent(meetingId)}?source=${encodeURIComponent(source)}${titleParam}`;
  launchDeepLinkWithProbe(uri, onAppNotInstalled);
}

export function launchMobileRecording(options: LaunchMobileRecordingOptions): void {
  const { title = "Rapat Baru", onAppNotInstalled, source = "web" } = options;
  const uri = `${STORE_URLS.scheme}recording/new?title=${encodeURIComponent(title)}&source=${encodeURIComponent(source)}`;
  launchDeepLinkWithProbe(uri, onAppNotInstalled);
}

export async function uploadAudioDirectToS3(
  uploadUrl: string,
  audioBlob: Blob,
  contentType = "audio/webm"
): Promise<void> {
  console.log(
    `[DirectS3Upload] Uploading ${audioBlob.size} bytes directly to Amazon S3 (${contentType}). Zero bytes through Next.js server.`
  );

  // If using simulated upload in local development or test mode:
  if (uploadUrl.includes("simulated=true")) {
    console.log("[DirectS3Upload] Simulated direct S3 upload completed (0 bytes through Next.js server).");
    return;
  }

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: audioBlob,
  });

  if (!res.ok) {
    throw new Error(`Direct S3 upload failed with HTTP status ${res.status}`);
  }

  console.log(
    `[DirectS3Upload] Direct S3 upload completed successfully (status: ${res.status}). 0 bytes through Next.js server.`
  );
}
