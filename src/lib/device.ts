/**
 * Cardi MoM Device and Platform Detection Utility
 * Detects operating system, mobile form factor, and defines official app store URLs.
 * Rule: Zero em dash characters in this file.
 */

export type OperatingSystem = "android" | "ios" | "macos" | "windows" | "linux" | "unknown";

export interface DeviceInfo {
  os: OperatingSystem;
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  isMac: boolean;
  isWindows: boolean;
}

export const STORE_URLS = {
  googlePlay:
    "https://play.google.com/store/apps/details?id=com.cardinusantara.cardiagentaimom&pcampaignid=web_share",
  appStore: "https://apps.apple.com/us/app/cardi-mom/id6809435140",
  directApk: "https://cardi.co.id/download/cardi-mom.apk",
  downloadLanding: "https://cardi.co.id/download",
  scheme: "cardiagentaimom://",
} as const;

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      os: "unknown",
      isMobile: false,
      isAndroid: false,
      isIOS: false,
      isDesktop: true,
      isMac: false,
      isWindows: false,
    };
  }

  const ua = navigator.userAgent || "";
  const platform = (navigator as unknown as { userAgentData?: { platform?: string }; platform?: string }).platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // iOS detection (including iPadOS on Safari)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && maxTouchPoints > 1);

  // Android detection
  const isAndroid = /Android/i.test(ua);

  // Mobile detection
  const isMobile = isIOS || isAndroid || /Mobi|Tablet/i.test(ua);

  // Desktop OS detection
  const isWindows = /Win/i.test(platform) || /Windows/i.test(ua);
  const isMac = !isIOS && (/Mac/i.test(platform) || /Macintosh/i.test(ua));
  const isLinux = !isAndroid && (/Linux/i.test(platform) || /Linux/i.test(ua));

  let os: OperatingSystem = "unknown";
  if (isAndroid) {
    os = "android";
  } else if (isIOS) {
    os = "ios";
  } else if (isWindows) {
    os = "windows";
  } else if (isMac) {
    os = "macos";
  } else if (isLinux) {
    os = "linux";
  }

  return {
    os,
    isMobile,
    isAndroid,
    isIOS,
    isDesktop: !isMobile,
    isMac,
    isWindows,
  };
}
