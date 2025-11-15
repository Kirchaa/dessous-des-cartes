'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, Users, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/app/_lib/supabase/client';

export default function Navigation() {
  const pathname = usePathname();
  const supabase = createClient();

  const links = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/videos', label: 'Vidéos', icon: Video },
    { href: '/packs', label: 'Packs', icon: Users },
    { href: '/library', label: 'Bibliothèque', icon: Library },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DC</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg hidden sm:inline">
              Le Dessous des Cartes
            </span>
          </Link>

          {/* Links + Logout */}
          <div className="flex items-center space-x-1">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* 🔥 Logout button */}
            <Button
              variant="outline"
              className="ml-2"
              onClick={handleLogout}
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
