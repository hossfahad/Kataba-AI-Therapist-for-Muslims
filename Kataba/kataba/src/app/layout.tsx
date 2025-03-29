import "./globals.css";
import { Inter, Roboto } from "next/font/google";
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { HeaderAuth } from "@/components/header-auth";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Kataba AI - Islamic Mental Health Assistant",
  description: "Kataba is an AI mental health assistant that provides support within the frameworks of Islamic guidelines and values. Our AI therapist is designed to offer culturally competent and faith-aligned support for Muslims seeking mental wellness.",
  keywords: "mental health, Islamic therapy, Muslim therapy, AI therapy, faith based counseling, Muslim mental health, Islamic counseling, halal therapy",
  authors: [{ name: "Fahad Hossain" }],
  creator: "Fahad Hossain",
  openGraph: {
    title: "Kataba AI - Islamic Mental Health Assistant",
    description: "Kataba is an AI mental health assistant that provides support within the frameworks of Islamic guidelines and values.",
    url: "https://kataba.org",
    siteName: "Kataba AI",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body
          className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-teal-50 to-white min-h-screen flex flex-col`}
        >
          <header className="w-full py-4 px-4 md:px-6 border-b chat-header bg-white/50 backdrop-blur-sm z-10 animate-fade-in sticky top-0">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <a href="/" className="flex items-center">
                  <img
                    src="/kataba-logo-square.png"
                    alt="Kataba AI"
                    className="h-8 w-8"
                  />
                  <h1 className="text-lg font-semibold ml-2">Kataba AI</h1>
                </a>
              </div>
              <HeaderAuth />
            </div>
          </header>
          <div className="flex-1">
            {children}
          </div>
          <footer className="w-full py-4 px-6 border-t">
            <div className="max-w-screen-xl mx-auto text-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} Kataba AI. All rights reserved.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
