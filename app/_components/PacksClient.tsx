'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import PackSelector from './PackSelector';
import VideoCard from './VideoCard';
import ProgressBar from './ProgressBar';
import { Video, Student } from '../_lib/types';
import { filterByPack } from '../_lib/filters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import videosData from '@/data/videos.json';
import studentsData from '@/data/students.json';

// 🔌 Supabase client + notes (statuts)
import { createClient } from '../_lib/supabase/client';
import { listMyNoteStatuses, NoteStatus } from '../_lib/notes';

type Profile = {
  id: string;
  full_name: string | null;
  pack_number: number | null;
  role: 'visitor' | 'student' | 'admin';
};

export default function PacksClient() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const packParam = searchParams.get('pack');

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, NoteStatus>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const students = studentsData as Student[];
  const videos = videosData as Video[];

  // 1) Charger le profil de l'utilisateur connecté (role + pack_number)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        if (mounted) setLoadingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, pack_number, role')
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        console.warn('profiles select error on PacksClient:', error.message);
      }

      if (mounted) {
        setProfile(data as Profile ?? null);
        setLoadingProfile(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) Charger les statuts de notes (pour l'utilisateur connecté)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const map = await listMyNoteStatuses();
      if (!mounted) return;
      setStatuses(map);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 3) Déterminer quel élève est sélectionné
  //    - priorité à ?pack= dans l’URL
  //    - sinon, si role=student et pack_number défini, on auto-sélectionne son pack
  useEffect(() => {
    // si l'URL force un pack (?pack=3)
    if (packParam) {
      const packNumber = parseInt(packParam);
      const student = students.find((s) => s.pack_number === packNumber);
      if (student) {
        setSelectedStudentId(student.id);
        return;
      }
    }

    // sinon, si on a un profil student/admin avec un pack_number
    if (!packParam && profile && profile.pack_number != null) {
      const student = students.find((s) => s.pack_number === profile.pack_number);
      if (student) {
        setSelectedStudentId(student.id);
      }
    }
  }, [packParam, students, profile]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const packVideos = useMemo(() => {
    if (!selectedStudent) return [];
    return filterByPack(videos, selectedStudent.pack_number);
  }, [videos, selectedStudent]);

  const packStats = useMemo(() => {
    if (!selectedStudent) return { todo: 0, inProgress: 0, done: 0, total: 0 };

    const videoIds = packVideos.map((v) => v.video_id);

    let done = 0;
    let inProgress = 0;

    for (const id of videoIds) {
      const st = statuses[id];
      if (st === 'done') done += 1;
      else if (st === 'in_progress') inProgress += 1;
    }

    const total = videoIds.length;
    const todo = total - done - inProgress;

    return {
      todo,
      inProgress,
      done,
      total,
    };
  }, [packVideos, statuses, selectedStudent]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Packs élèves</h1>
          <p className="text-gray-600">
            Gérez les vidéos assignées à chaque élève
          </p>
        </div>

        <div className="mb-8">
          <PackSelector
            students={students}
            selectedStudentId={selectedStudentId}
            onStudentChange={setSelectedStudentId}
          />
          {loadingProfile && (
            <p className="text-xs text-gray-400 mt-1">
              Chargement de ton profil…
            </p>
          )}
        </div>

        {selectedStudent && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {selectedStudent.name} - Pack {selectedStudent.pack_number}
                </CardTitle>
                <CardDescription>
                  Progression dans le pack de vidéos (basée sur tes notes Supabase)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressBar current={packStats.done} total={packStats.total} className="mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{packStats.todo}</div>
                    <div className="text-sm text-gray-600">À faire</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-700">{packStats.inProgress}</div>
                    <div className="text-sm text-yellow-600">En cours</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">{packStats.done}</div>
                    <div className="text-sm text-green-600">Terminées</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Vidéos du pack ({packVideos.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {packVideos.map((video) => (
                  <VideoCard
                    key={video.video_id}
                    video={video}
                    status={statuses[video.video_id] as any} // 'todo' | 'in_progress' | 'done' ou undefined
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {!selectedStudent && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Sélectionnez un élève pour voir son pack de vidéos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
