'use client';

import { useState } from 'react';
import { createClient } from '@/app/_lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ProfileRow = {
  id: string;
  full_name: string | null;
  pack_number: number | null;
  role: 'visitor' | 'student' | 'admin';
};

export default function AdminClient({ initialProfiles }: { initialProfiles: ProfileRow[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [savingId, setSavingId] = useState<string | null>(null);
  const supabase = createClient();

  const handleChange = (
    id: string,
    field: 'role' | 'pack_number' | 'full_name',
    value: string
  ) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]:
                field === 'pack_number'
                  ? (value ? Number(value) : null)
                  : value,
            }
          : p
      )
    );
  };

  const handleSave = async (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;

    setSavingId(id);

    const { error } = await supabase
      .from('profiles')
      .update({
        role: profile.role,
        pack_number: profile.pack_number,
        full_name: profile.full_name,
      })
      .eq('id', id);

    if (error) {
      console.error('Erreur update profile', error);
      alert("Erreur lors de l'enregistrement");
    }

    setSavingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Administration des élèves</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-3 text-xs font-semibold text-gray-500">
              <span>Nom</span>
              <span>ID utilisateur</span>
              <span>Rôle</span>
              <span>Pack</span>
              <span>Actions</span>
            </div>

            <div className="space-y-2">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-5 gap-3 items-center rounded-lg border bg-white px-3 py-2 text-sm"
                >
                  <Input
                    value={p.full_name ?? ''}
                    placeholder="Nom (optionnel)"
                    onChange={(e) => handleChange(p.id, 'full_name', e.target.value)}
                    className="h-8"
                  />

                  <span className="truncate text-xs text-gray-500">{p.id}</span>

                  <Select
                    value={p.role}
                    onValueChange={(val) => handleChange(p.id, 'role', val)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor">Visiteur</SelectItem>
                      <SelectItem value="student">Étudiant</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min={1}
                    max={18}
                    value={p.pack_number ?? ''}
                    placeholder="-"
                    onChange={(e) => handleChange(p.id, 'pack_number', e.target.value)}
                    className="h-8 w-20"
                  />

                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleSave(p.id)}
                    disabled={savingId === p.id}
                  >
                    {savingId === p.id ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </div>
              ))}

              {profiles.length === 0 && (
                <p className="text-sm text-gray-500">
                  Aucun profil pour le moment. Les profils sont créés à la première connexion.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
