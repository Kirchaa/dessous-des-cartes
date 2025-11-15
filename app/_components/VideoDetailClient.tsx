'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video } from '../_lib/types';
import { fmtDuration, fmtDateLong } from '../_lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NoteEditor from './NoteEditor';
import { ArrowLeft, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import videosData from '@/data/videos.json';

// ✅ supabase + notes
import { createClient } from '../_lib/supabase/client';
import { getMyNote, upsertMyNote, NoteStatus } from '../_lib/notes';

interface Props {
  videoId: string;
}

export default function VideoDetailClient({ videoId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  // Auth / rôle
  const [canEdit, setCanEdit] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Vidéo & note
  const [video, setVideo] = useState<Video | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [status, setVideoStatus] = useState<NoteStatus>('todo');
  const [showToast, setShowToast] = useState(false);
  const [loadingNote, setLoadingNote] = useState(true);

  // 🔐 1) Rôle : visitor / student / admin
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess, error: sessError } = await supabase.auth.getSession();
      if (sessError) console.warn('getSession error:', sessError.message);
  
      const uid = sess.session?.user?.id ?? null;
      if (mounted) setCurrentUserId(uid);
  
      if (!uid) {
        if (mounted) {
          setCanEdit(false);
          setCurrentRole(null);
          setAuthChecked(true);
        }
        return;
      }
  
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('id, role, pack_number')
        .eq('id', uid)
        .maybeSingle();
  
      if (error) {
        console.warn('profiles select error:', error.message);
      }
  
      if (mounted) {
        const r = (prof as any)?.role ?? null;
        setCurrentRole(r);
        setCanEdit(r === 'student' || r === 'admin'); // <== logique finale
        setAuthChecked(true);
        console.log('DEBUG profile:', { uid, profile: prof });
      }
    })();
  
    return () => {
      mounted = false;
    };
  }, []);

  // 🎬 2) Charger la vidéo
  useEffect(() => {
    const videos = videosData as Video[];
    const foundVideo = videos.find((v) => v.video_id === videoId);
    setVideo(foundVideo || null);
  }, [videoId]);

  // 📝 3) Charger la note depuis Supabase
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingNote(true);
      const note = await getMyNote(videoId);
      if (!mounted) return;
      if (note) {
        setNoteContent(note.content_md || '');
        setVideoStatus(note.status);
      } else {
        setNoteContent('');
        setVideoStatus('todo');
      }
      setLoadingNote(false);
    })();
    return () => {
      mounted = false;
    };
  }, [videoId]);

  // 💾 4) Sauvegarder le contenu (appelé par NoteEditor)
  const handleSaveNote = async (content: string) => {
    setNoteContent(content);
    if (!canEdit) return; // sécurité front (RLS protège quand même derrière)
    await upsertMyNote(videoId, content, status, 'class');
  };

  // 🎯 5) Changer le statut depuis le panneau de droite
  const handleStatusChange = async (newStatus: string) => {
    const casted = newStatus as NoteStatus;
    setVideoStatus(casted);
    if (!canEdit) return;
    await upsertMyNote(videoId, noteContent, casted, 'class');
  };

  const handleMarkComplete = async () => {
    await handleStatusChange('done');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Vidéo non trouvée</p>
          <Button onClick={() => router.push('/videos')} className="mt-4">
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    todo: { label: 'À faire', labelShort: 'À faire', color: 'bg-gray-200 text-gray-700' },
    in_progress: { label: 'En cours', labelShort: 'En cours', color: 'bg-yellow-200 text-yellow-800' },
    done: { label: 'Terminé', labelShort: 'Terminé', color: 'bg-green-200 text-green-800' },
  } as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/videos')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au catalogue
        </Button>

        {showToast && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top">
            <CheckCircle className="h-5 w-5" />
            Vidéo marquée comme terminée
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne vidéo + fiche */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{video.title}</CardTitle>
                    <CardDescription className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline">Pack {video.pack_number}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fmtDuration(video.duration_s)}
                      </span>
                      <span>{fmtDateLong(video.published_at)}</span>
                    </CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${statusConfig[status].color}`}>
                    {statusConfig[status].labelShort}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.video_id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Pack</p>
                    <p className="text-lg font-semibold">Pack {video.pack_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rang dans le pack</p>
                    <p className="text-lg font-semibold">#{video.rank_in_pack}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="text-lg font-semibold">{fmtDuration(video.duration_s)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de publication</p>
                    <p className="text-lg font-semibold">{fmtDateLong(video.published_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🔽 ICI : Fiche de travail avec ton bloc canEdit 
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">Debug rôle utilisateur</CardTitle>
                <CardDescription className="text-xs">
                  user_id = {currentUserId || 'aucun'} — rôle = {currentRole || 'inconnu'}
                </CardDescription>
              </CardHeader>
            </Card>
            */}
            <Card>
              <CardHeader>
                <CardTitle>Fiche de travail</CardTitle>
              </CardHeader>
              <CardContent>
                {(!authChecked || loadingNote) && (
                  <div className="text-sm text-gray-400">Chargement de ta fiche…</div>
                )}

                {authChecked && !loadingNote && (
                  canEdit ? (
                    <NoteEditor
                      videoId={videoId}
                      initialContent={noteContent}
                      onSave={handleSaveNote}
                    />
                  ) : (
                    <div className="text-sm text-gray-500">
                      Rôle : visiteur — lecture seule. Demande à l’admin de t’attribuer un pack pour éditer.
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite : statut, liens */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statut</CardTitle>
                <CardDescription>Gérez l&apos;avancement de votre fiche</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">État actuel</label>
                  <Select
                    value={status}
                    onValueChange={handleStatusChange}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">À faire</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="done">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status !== 'done' && canEdit && (
                  <Button onClick={handleMarkComplete} className="w-full" variant="default">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme terminé
                  </Button>
                )}

                {status === 'done' && (
                  <div className="p-4 bg-green-50 text-green-800 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Cette fiche est terminée</span>
                  </div>
                )}

                {!canEdit && (
                  <p className="text-xs text-gray-400">
                    Statut en lecture seule pour les visiteurs.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Liens utiles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Voir sur YouTube →
                </a>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/packs?pack=${video.pack_number}`)}
                  className="w-full"
                  size="sm"
                >
                  Voir tout le Pack {video.pack_number}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
