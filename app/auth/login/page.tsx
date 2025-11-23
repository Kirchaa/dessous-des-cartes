'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { createClient } from '@/app/_lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClient();
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`, // 👈 exact
      },
    })
    

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Vérifie ton email pour le lien de connexion.')
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Connexion à la plateforme</CardTitle>
          <CardDescription>
            Entre ton adresse email pour recevoir un lien magique de connexion à la plateforme de
            fiches du <span className="font-semibold text-gray-800">Dessous des Cartes</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Adresse email</label>
              <Input
                type="email"
                placeholder="prenom.nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" >
                {'Recevoir le lien de connexion'}
            </Button>

            {message && (
              <p className="text-xs text-gray-600 text-center leading-snug">{message}</p>
            )}

            <p className="text-xs text-gray-400 text-center">
              Si tu n&apos;as pas reçu le mail, pense à vérifier le dossier{' '}
              <span className="font-medium">Spam / Courrier indésirable</span>.
            </p>

            <p className="text-xs text-gray-500 text-center mt-2">
              <Link href="/" className="underline">
                ← Retour à l&apos;accueil
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
