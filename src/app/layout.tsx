import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clinica Zen - Terapias Holísticas",
  description: "Plataforma de terapias holísticas donde puedes encontrar terapeutas y agendar citas para mejorar tu bienestar",
  keywords: ["terapias holísticas", "bienestar", "salud", "terapia", "medicina alternativa"],
  authors: [{ name: "Clinica Zen Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Clinica Zen",
    description: "Plataforma de terapias holísticas para tu bienestar",
    url: "https://clinica-zen.com",
    siteName: "Clinica Zen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinica Zen",
    description: "Plataforma de terapias holísticas para tu bienestar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}