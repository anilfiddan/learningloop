import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/language-context";
import dynamic from "next/dynamic";

const ServiceWorkerRegister = dynamic(() => import("@/components/pwa/sw-register").then(m => ({ default: m.ServiceWorkerRegister })), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/pwa/install-prompt").then(m => ({ default: m.InstallPrompt })), { ssr: false });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LearningLoop - NLP Destekli Telaffuz Asistani",
  description: "Konusma ve telaffuz zorluklarini yapay zeka ile analiz edin, kisisellestirilmis pratiklerle ilerlemenizi takip edin. Terapistinizin yaninda guclu bir destek araci.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LearningLoop",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          {children}
          <InstallPrompt />
        </LanguageProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
