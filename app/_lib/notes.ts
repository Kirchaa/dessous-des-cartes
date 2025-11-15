'use client';

import { createClient } from './supabase/client';

export type NoteStatus = 'todo' | 'in_progress' | 'done';
export type NoteVisibility = 'class' | 'private';

export type Note = {
  id: string;
  author_id: string;
  video_id: string;
  content_md: string;
  status: NoteStatus;
  visibility: NoteVisibility;
  updated_at: string;
};

// 🔹 Récupérer la note de l'utilisateur connecté pour une vidéo
export async function getMyNote(videoId: string): Promise<Note | null> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('getMyNote getUser error:', userError.message);
    return null;
  }
  if (!user) return null;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('author_id', user.id)
    .eq('video_id', videoId)
    .maybeSingle();

  if (error) {
    console.warn('getMyNote select error (peut être 0 ligne):', error.message);
    return null;
  }

  return (data as Note) ?? null;
}

// 🔹 Insérer / mettre à jour la note de l'utilisateur pour une vidéo
export async function upsertMyNote(
  videoId: string,
  content_md: string,
  status: NoteStatus,
  visibility: NoteVisibility = 'class'
): Promise<Note | null> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('upsertMyNote getUser error:', userError.message);
    return null;
  }
  if (!user) {
    console.warn('upsertMyNote: no auth user');
    return null;
  }

  const base = {
    author_id: user.id,
    video_id: videoId,
    content_md,
    status,
    visibility,
    updated_at: new Date().toISOString(),
  };

  // 1) Vérifier s'il existe déjà une note pour (author_id, video_id)
  const { data: existing, error: existingError } = await supabase
    .from('notes')
    .select('id')
    .eq('author_id', user.id)
    .eq('video_id', videoId)
    .maybeSingle();

  if (existingError) {
    console.warn('upsertMyNote existing select error (peut être 0 ligne):', existingError.message);
  }

  // 2) Si elle existe -> UPDATE
  if (existing && (existing as any).id) {
    const existingId = (existing as any).id as string;
    const { data, error } = await supabase
      .from('notes')
      .update(base)
      .eq('id', existingId)
      .select()
      .single();

    if (error) {
      console.error('upsertMyNote update error:', error.message);
      return null;
    }

    return data as Note;
  }

  // 3) Sinon -> INSERT
  const { data, error } = await supabase
    .from('notes')
    .insert(base)
    .select()
    .single();

  if (error) {
    console.error('upsertMyNote insert error:', error.message);
    return null;
  }

  return data as Note;
}

// 🔹 Liste toutes les notes "visibles classe" (pour /library)
export async function listClassNotes(limit = 200) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('id, video_id, content_md, status, updated_at')
    .eq('visibility', 'class')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('listClassNotes error:', error.message);
    return [];
  }

  return data as Note[];
}

/**
 * 🔹 Retourne un map { video_id: status } pour l'utilisateur connecté.
 * Optionnellement filtré sur une liste de videoIds.
 */
export async function listMyNoteStatuses(videoIds?: string[]) {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('listMyNoteStatuses getUser error:', userError.message);
    return {} as Record<string, NoteStatus>;
  }

  if (!user) return {} as Record<string, NoteStatus>;

  let query = supabase
    .from('notes')
    .select('video_id, status')
    .eq('author_id', user.id);

  if (videoIds && videoIds.length > 0) {
    query = query.in('video_id', videoIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error('listMyNoteStatuses select error:', error.message);
    return {} as Record<string, NoteStatus>;
  }

  const map: Record<string, NoteStatus> = {};
  for (const row of data ?? []) {
    map[(row as any).video_id] = (row as any).status as NoteStatus;
  }
  return map;
}
