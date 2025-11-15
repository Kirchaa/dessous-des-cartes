'use client';
import { useEffect } from 'react';
import { createClient } from '../_lib/supabase/client';


export default function LogoutPage() {
  const supabase = createClient();
  useEffect(() => {
    supabase.auth.signOut().finally(() => {
      window.location.href = '/';
    });
  }, []);
  return <div className="p-6">Déconnexion…</div>;
}
