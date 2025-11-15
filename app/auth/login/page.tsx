'use client';

import { useState } from 'react';
import { createClient } from '@/app/_lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Un lien magique t’a été envoyé. Clique dessus dans ta boîte mail pour te connecter.');
    }

    setLoading(false);
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border border-slate-200">
          <CardHeader className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-1">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl">
              Connexion à la plateforme
            </CardTitle>
            <CardDescription>
              Entre ton adresse email pour recevoir un lien magique de connexion à la plateforme de fiches du <span className="font-semibold">Dessous des Cartes</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Adresse email
                </label>
                <Input
                  type="email"
                  placeholder="prenom.nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">
                  Utilise ton adresse mail.Tu recevras un lien valable en quelques minutes.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? 'Envoi du lien...' : 'Recevoir le lien de connexion'}
              </Button>

              {message && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mt-1">
                  {message}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-1">
                  {error}
                </div>
              )}
            </form>

            <div className="mt-6 text-xs text-slate-500 text-center">
              Si tu n’as pas reçu le mail, pense à vérifier le dossier <span className="font-medium">Spam / Courrier indésirable</span>.
            </div>

            <div className="mt-4 text-center text-xs text-slate-400">
              <Link href="/" className="hover:underline">
                ← Retour à l’accueil
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
