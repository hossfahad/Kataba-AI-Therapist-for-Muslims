import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fontsource/inter/300.css"; // thin
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Kataba - Voice Chatbot Therapist",
  description: "A voice-enabled AI therapy assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-pink-50 to-white min-h-screen flex flex-col`}
      >
        <header className="w-full py-4 px-6 border-b chat-header bg-white/50 backdrop-blur-sm z-10 animate-fade-in">
          <div className="container max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/">
                <h1 className="text-xl font-sans font-light text-gray-800 hover:text-pink-500 transition-colors duration-300 cursor-pointer">Kataba</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-sm text-gray-700 hover:text-pink-500 transition-colors duration-300">About</a>
              <a href="#how-it-works" className="text-sm text-gray-700 hover:text-pink-500 transition-colors duration-300">How it Works</a>
              <a href="#" className="text-sm text-gray-700 hover:text-pink-500 transition-colors duration-300">FAQ</a>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow">
          {children}
        </main>
        
        <footer className="w-full py-6 px-6 bg-white/50 backdrop-blur-sm chat-header mt-auto">
          <div className="container max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-sans font-light text-gray-800 mb-3">Kataba</h3>
                <p className="text-xs text-gray-600 max-w-xs">An AI-powered voice chatbot designed to provide therapeutic conversations and support.</p>
              </div>
              <div>
                <h3 className="text-sm font-sans font-light text-gray-800 mb-3">Links</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-xs text-gray-600 hover:text-pink-500 transition-colors duration-300">Privacy Policy</a></li>
                  <li><a href="#" className="text-xs text-gray-600 hover:text-pink-500 transition-colors duration-300">Terms of Service</a></li>
                  <li><a href="#" className="text-xs text-gray-600 hover:text-pink-500 transition-colors duration-300">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-sans font-light text-gray-800 mb-3">Connect</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t chat-header">
              <p className="text-xs text-center text-gray-500">&copy; {new Date().getFullYear()} Kataba. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
