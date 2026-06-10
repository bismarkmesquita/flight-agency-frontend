import { Inter } from 'next/font/google';
import './globals.scss';
import { Providers } from '@/base/providers';
import { Viewport } from 'next';
import { Metadata } from 'next';

const inter = Inter({
  variable: '--inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FlightAgency',
  description: 'Dream bigger. Journey smarter.',
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-BR'>
      <head>
      </head>
      <body className={`${inter.variable} globalColors`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
