import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/SessionProvider";
import { auth } from "@/auth";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import OfflineBanner from "@/components/layout/OfflineBanner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Myday",
  description: "Your personal routine command center",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Myday",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="antialiased text-textPrimary bg-customBg h-full min-h-screen">
        <AuthProvider>
          <OfflineBanner />
          {session ? (
            <div className="flex min-h-screen">
              {/* Desktop Left Sidebar */}
              <Sidebar user={session.user} />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col md:pl-64 pb-20 md:pb-0">
                <Header user={session.user} />
                <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
                  {children}
                </main>
              </div>

              {/* Mobile/PWA Bottom Nav */}
              <BottomNav />
            </div>
          ) : (
            <div className="min-h-screen flex items-center justify-center p-4">
              {children}
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
