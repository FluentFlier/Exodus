import type { Metadata } from 'next';
import { Manrope, Newsreader } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Exodus — Grant Intelligence Infrastructure',
  description: 'AI-powered grant intelligence platform with 3 specialized agents. Semantic matching, real-time collaboration, and compliance checking for research proposals.',
  keywords: ['grant writing', 'research funding', 'AI assistant', 'academic collaboration', 'NSF grants', 'proposal compliance'],
  authors: [{ name: 'Exodus' }],
  openGraph: {
    title: 'Exodus — Grant Intelligence Infrastructure',
    description: 'Write winning grants with AI agents and real-time collaboration',
    type: 'website',
    siteName: 'Exodus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exodus — Grant Intelligence Infrastructure',
    description: 'Write winning grants with AI agents and real-time collaboration',
  },
};

import { InsforgeProvider } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${newsreader.variable}`}>
      <body className="bg-paper text-ink font-sans antialiased" suppressHydrationWarning>
        <InsforgeProvider>
          {children}
        </InsforgeProvider>
      </body>
    </html>
  );
}
