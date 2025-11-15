'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Video } from '../_lib/types';
import { fmtDate, fmtDuration } from '../_lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Library as LibraryIcon, Search, FileText } from 'lucide-react';
import videosData from '@/data/videos.json';

// ✅ nouveau : on lit les notes dans Supabase
import { listClassNotes, Note } from '../_lib/notes';

type LibraryItem = {
  video: Video;
  note: Note;
  updatedAt: string;
};

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [sortByField, setSortByField] = useState<'date' | 'duration' | 'title'>('date');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const videos = videosData as Video[];

  // packs disponibles (comme avant)
  const availablePacks = useMemo(() => {
    const packs = new Set(videos.map((v) => v.pack_number));
    return Array.from(packs).sort((a, b) => a - b);
  }, [videos]);

  // 🔄 charger les notes partagées (visibility='class') depuis Supabase
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await listClassNotes(500);
      if (!mounted) return;
      setNotes(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 🔗 joindre notes + vidéos + filtres + tri
  const items: LibraryItem[] = useMemo(() => {
    // index vidéo par id pour aller vite
    const byId = new Map(videos.map((v) => [v.video_id, v]));

    let result: LibraryItem[] = notes
      .map((note) => {
        const video = byId.get(note.video_id);
        if (!video) return null;
        return {
          video,
          note,
          updatedAt: note.updated_at || new Date().toISOString(),
        };
      })
      .filter((x): x is LibraryItem => x !== null);

    // recherche par titre
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.video.title.toLowerCase().includes(q)
      );
    }

    // filtre par pack
    if (selectedPack !== null) {
      result = result.filter((item) => item.video.pack_number === selectedPack);
    }

    // tri
    if (sortByField === 'date') {
      result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else if (sortByField === 'duration') {
      result.sort((a, b) => b.video.duration_s - a.video.duration_s);
    } else if (sortByField === 'title') {
      result.sort((a, b) => a.video.title.localeCompare(b.video.title));
    }

    return result;
  }, [videos, notes, searchQuery, selectedPack, sortByField]);

  const getNotePreview = (note: Note) => {
    const content = note.content_md || '';
    if (!content.trim()) return 'Aucune note';

    const lines = content.split('\n').filter((line: string) => line.trim());
    const preview = lines.slice(0, 3).join(' ');
    return preview.length > 150 ? preview.substring(0, 150) + '...' : preview;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <LibraryIcon className="h-8 w-8" />
              Bibliothèque de fiches
            </h1>
            <p className="text-gray-600 text-sm">
              Chargement des fiches de la classe…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <LibraryIcon className="h-8 w-8" />
            Bibliothèque de fiches
          </h1>
          <p className="text-gray-600">
            {items.length} fiche{items.length > 1 ? 's' : ''} partagée
            {items.length > 1 ? 's' : ''} avec la classe
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher par titre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedPack?.toString() || 'all'}
              onValueChange={(value) =>
                setSelectedPack(value === 'all' ? null : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les packs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les packs</SelectItem>
                {availablePacks.map((pack) => (
                  <SelectItem key={pack} value={pack.toString()}>
                    Pack {pack}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortByField}
              onValueChange={(value) => setSortByField(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Dernière modification</SelectItem>
                <SelectItem value="duration">Par durée</SelectItem>
                <SelectItem value="title">Par titre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {items.map(({ video, note, updatedAt }) => (
              <Link key={note.id} href={`/videos/${video.video_id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 hover:text-blue-600 transition-colors">
                          {video.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline">Pack {video.pack_number}</Badge>
                          <span>{fmtDuration(video.duration_s)}</span>
                          <span>Dernière mise à jour le {fmtDate(updatedAt)}</span>
                          <span className="text-green-600">
                            {note.status === 'done'
                              ? 'Terminé'
                              : note.status === 'in_progress'
                              ? 'En cours'
                              : 'À faire'}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="ml-4">
                        <img
                          src={`https://img.youtube.com/vi/${video.video_id}/default.jpg`}
                          alt={video.title}
                          className="w-32 h-24 object-cover rounded"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">
                        {getNotePreview(note)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <LibraryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {searchQuery || selectedPack
                ? 'Aucune fiche trouvée avec ces critères'
                : "Il n'y a pas encore de fiche partagée avec la classe"}
            </p>
            <p className="text-gray-400 text-sm">
              Les fiches apparaîtront ici dès qu&apos;un étudiant enregistre ses notes en mode
              &quot;classe&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
