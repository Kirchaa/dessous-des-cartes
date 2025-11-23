'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/client';
import VideosClient from '../_components/VideosClient';

export default function VideosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.warn('Erreur getSession:', error.message);
        setAllowed(false);
        setChecking(false);
        router.push('/auth/login');
        return;
      }

      if (!data.session) {
        setAllowed(false);
        setChecking(false);
        router.push('/auth/login');
        return;
      }

      setAllowed(true);
      setChecking(false);
    })();

    return () => {
      mounted = false;
    };
  }, [supabase, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Vérification de la connexion…</p>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <VideosClient />;
}
