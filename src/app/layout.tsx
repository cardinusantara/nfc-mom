import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeSynchronizer from "@/components/ThemeSynchronizer";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cardi: NFC Smart Business Card & AI MoM Assistant",
  description:
    "Ekosistem kartu nama bisnis pintar NFC terintegrasi langsung dengan perekam notula rapat otomatis Cardi MoM AI (Play Store & App Store), kontak vCard, dan jadwal kalender.",
  icons: {
    icon: [
      { url: "/favicon-mom-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-mom-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-mom-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon-mom.ico",
    apple: "/apple-touch-icon-mom.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFD] text-[#0A1633] dark:bg-[#070B14] dark:text-white transition-colors duration-200">
        <ThemeSynchronizer />
        {children}
      </body>
    </html>
  );
}
