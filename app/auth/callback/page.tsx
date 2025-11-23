'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/client';
import { Loader2 } from 'lucide-react';

// ✅ On crée le client UNE seule fois au niveau du module
const supabase = createClient();

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Connexion en cours...');
  const hasRun = useRef(false); // évite le double appel en mode Strict

  useEffect(() => {
    // ⚠️ En dev, React exécute les effets 2 fois → on bloque le 2e passage
    if (hasRun.current) return;
    hasRun.current = true;

    async function handleMagicLink() {
      const url = new URL(window.location.href);
      const error = url.searchParams.get('error');
      const code = url.searchParams.get('code');

      // Si Supabase a déjà mis ?error=... dans l’URL
      if (error) {
        setStatus("Lien de connexion invalide ou expiré.");
        // On renvoie simplement vers la page de login
        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
        return;
      }

      if (!code) {
        setStatus("Lien de connexion invalide ou expiré.");
        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
        return;
      }

      try {
        // ✅ Appel unique, avec l’URL complète
        const { error: exError } =
          await supabase.auth.exchangeCodeForSession(window.location.href);

        if (exError) {
          console.error('exchangeCodeForSession error:', exError);
          setStatus("Erreur lors de la connexion.");
          setTimeout(() => {
            router.replace('/auth/login');
          }, 2000);
          return;
        }

        setStatus('Connexion réussie ✅');
        // on laisse 500ms puis on renvoie vers l’accueil
        setTimeout(() => {
          router.replace('/');
          router.refresh();
        }, 500);
      } catch (e) {
        console.error('Auth callback exception:', e);
        setStatus("Impossible de contacter le serveur d'authentification.");
        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
      }
    }

    handleMagicLink();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-xl px-8 py-6 shadow-sm flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <div className="text-sm text-gray-700">{status}</div>
      </div>
    </div>
  );
}
