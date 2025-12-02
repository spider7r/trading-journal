import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Preloader } from "@/components/ui/Preloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Journal Pro",
  description: "Your automated trading accountability partner",
  icons: {
    icon: "http://zainenterprisespakistan.com/wp-content/uploads/2025/11/trading-journal-icon.png",
    shortcut: "http://zainenterprisespakistan.com/wp-content/uploads/2025/11/trading-journal-icon.png",
    apple: "http://zainenterprisespakistan.com/wp-content/uploads/2025/11/trading-journal-icon.png",
  },
};

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Preloader />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
