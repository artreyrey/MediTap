import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediTap | Patient records, one tap away",
  description:
    "An RFID-based patient medical record management and archiving system powered by ESP32, Next.js, and Firebase.",
  openGraph: {
    title: "MediTap | Patient records, one tap away",
    description:
      "An RFID-based patient medical record management and archiving system.",
    type: "website",
    siteName: "MediTap",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7fbfe",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
