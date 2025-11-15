'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, BookOpen, Users, Library } from 'lucide-react';
import ProgressBar from './_components/ProgressBar';
import { listStatuses } from './_lib/storage';
import videosRaw from '@/data/videos.json';

type VideoItem = {
  pack_number: number | string;
  rank_in_pack: number | string;
  video_id: string;
  title: string;
  url: string;
  published_at: string;
  duration_iso: string;
  duration_s: number | string;
};

// 🔧 Normalisation (au cas où ton JSON vient d’un CSV)
const videosData: VideoItem[] = (videosRaw as VideoItem[]).map(v => ({
  ...v,
  pack_number: typeof v.pack_number === 'string' ? parseInt(v.pack_number, 10) : v.pack_number,
  rank_in_pack: typeof v.rank_in_pack === 'string' ? parseInt(v.rank_in_pack, 10) : v.rank_in_pack,
  duration_s: typeof v.duration_s === 'string' ? parseInt(v.duration_s, 10) : v.duration_s,
}));

export default function Home() {
  const [stats, setStats] = useState({
    total: 0,
    done: 0,
    inProgress: 0,
    todo: 0,
  });

  // 🧮 ids présents dans le dataset courant (évite de compter des clés orphelines du localStorage)
  const currentIds = useMemo(() => new Set(videosData.map(v => v.video_id)), []);

  // 📊 calcule les stats globales en se basant uniquement sur videosData
  const computeStats = () => {
    const statuses = listStatuses(); // Record<videoId, 'todo'|'in_progress'|'done'>
    const total = videosData.length;
    let done = 0;
    let inProgress = 0;

    for (const id of currentIds) {
      const s = statuses[id];
      if (s === 'done') done++;
      else if (s === 'in_progress') inProgress++;
    }
    const todo = total - done - inProgress;
    return { total, done, inProgress, todo };
  };

  useEffect(() => {
    setStats(computeStats()); // premier calcul à l’affichage

    // 🔁 se met à jour si le localStorage change (ex: autre onglet modifie une fiche)
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      // on ne recalcule que si une clé liée aux statuts est modifiée
      if (e.key.startsWith('status:') || e.key === 'notes' || e.key.startsWith('notes:')) {
        setStats(computeStats());
      }
    };
    window.addEventListener('storage', onStorage);

    // ✅ possibilité de forcer un refresh manuel
    const onVisibility = () => {
      if (document.visibilityState === 'visible') setStats(computeStats());
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percent =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const cards = [
    {
      title: 'Catalogue vidéos',
      description: 'Parcourir et rechercher toutes les vidéos',
      icon: Video,
      href: '/videos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Packs élèves',
      description: 'Gérer les packs par élève',
      icon: Users,
      href: '/packs',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Bibliothèque',
      description: 'Consulter vos fiches terminées',
      icon: Library,
      href: '/library',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Le Dessous des Cartes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plateforme de fichage des vidéos YouTube pour l&apos;analyse géopolitique
          </p>
        </div>

        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Progression globale
              </CardTitle>
              <CardDescription>
                Suivez votre avancement dans le fichage des vidéos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <ProgressBar current={stats.done} total={stats.total} className="flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-700">{stats.todo}</div>
                  <div className="text-sm text-gray-600">À faire</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-700">{stats.inProgress}</div>
                  <div className="text-sm text-yellow-600">En cours</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.done}</div>
                  <div className="text-sm text-green-600">Terminées</div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Total vidéos: {stats.total} — Comptage basé sur le dataset courant (ignore les anciennes clés du navigateur).
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-4`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
