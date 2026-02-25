import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { DataStoreProvider } from "@/lib/data-store";
import AuthGate from "@/components/auth-gate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClubSync - Club Activity Management System",
  description:
    "Modern club activity management system for educational institutions. Manage clubs, events, members, budgets and attendance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          <DataStoreProvider>
            <AuthProvider>
              <AuthGate>{children}</AuthGate>
            </AuthProvider>
          </DataStoreProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

