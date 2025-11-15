export interface Video {
  pack_number: number;
  rank_in_pack: number;
  video_id: string;
  title: string;
  url: string;
  published_at: string;
  duration_iso: string;
  duration_s: number;
}

export interface Student {
  id: string;
  name: string;
  pack_number: number;
}

export type VideoStatus = 'todo' | 'in_progress' | 'done';

export interface VideoNote {
  content: string;
  updatedAt: string;
}
