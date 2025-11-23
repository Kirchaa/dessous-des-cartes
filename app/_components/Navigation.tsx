'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Video, Users, Library, LogIn, LogOut } from 'lucide-react';
import { createClient } from '@/app/_lib/supabase/client';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  // 🔐 Vérifie la session côté client
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        console.warn('Erreur getSession (nav):', error.message);
        setLoggedIn(false);
      } else {
        setLoggedIn(!!data.session);
      }
      setCheckingAuth(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setLoggedIn(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erreur signOut:', e);
    } finally {
      router.push('/'); // retour à l’accueil
      router.refresh(); // force refresh pour les pages server
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + titre */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DC</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg hidden sm:inline">
              Le Dessous des Cartes
            </span>
          </Link>

          {/* Liens principaux */}
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
          </div>

          {/* Zone auth à droite */}
          <div className="flex items-center">
            {checkingAuth ? (
              <span className="text-xs text-gray-400">…</span>
            ) : loggedIn ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Se déconnecter</span>
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Se connecter</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
