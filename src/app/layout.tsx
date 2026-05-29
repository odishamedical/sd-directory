import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GlobalHeader from "@/components/GlobalHeader";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Shyam Dash Directory | Local Odisha Businesses",
  description: "Explore authentic handlooms, premium jewelry, healthcare providers, and digital services across Odisha. Claim your business listing D2C.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen text-[#E8F4FF] flex flex-col overflow-x-hidden"
        style={{
          background: "#030B1A",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}
      >
        <AuthProvider>
          <GlobalHeader activeProject="Directory" />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
