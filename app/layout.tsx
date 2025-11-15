import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navigation from './_components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Le Dessous des Cartes - Fichage de vidéos',
  description: 'Plateforme de fichage des vidéos YouTube pour l\'analyse géopolitique',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
