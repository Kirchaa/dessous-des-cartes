'use client';

import { VideoStatus, VideoNote } from './types';

const NOTES_PREFIX = 'notes:';
const STATUS_PREFIX = 'status:';
const NOTES_UPDATED_PREFIX = 'notes_updated_at:';

export function getNote(videoId: string): VideoNote | null {
  if (typeof window === 'undefined') return null;

  const content = localStorage.getItem(`${NOTES_PREFIX}${videoId}`);
  const updatedAt = localStorage.getItem(`${NOTES_UPDATED_PREFIX}${videoId}`);

  if (!content) return null;

  return {
    content,
    updatedAt: updatedAt || new Date().toISOString(),
  };
}

export function setNote(videoId: string, content: string): void {
  if (typeof window === 'undefined') return;

  const now = new Date().toISOString();
  localStorage.setItem(`${NOTES_PREFIX}${videoId}`, content);
  localStorage.setItem(`${NOTES_UPDATED_PREFIX}${videoId}`, now);
}

export function getStatus(videoId: string): VideoStatus | null {
  if (typeof window === 'undefined') return null;

  const status = localStorage.getItem(`${STATUS_PREFIX}${videoId}`);
  return status as VideoStatus | null;
}

export function setStatus(videoId: string, status: VideoStatus): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(`${STATUS_PREFIX}${videoId}`, status);
}

export function listStatuses(): Record<string, VideoStatus> {
  if (typeof window === 'undefined') return {};

  const statuses: Record<string, VideoStatus> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STATUS_PREFIX)) {
      const videoId = key.replace(STATUS_PREFIX, '');
      const status = localStorage.getItem(key);
      if (status) {
        statuses[videoId] = status as VideoStatus;
      }
    }
  }

  return statuses;
}

export function getAllNotes(): Record<string, VideoNote> {
  if (typeof window === 'undefined') return {};

  const notes: Record<string, VideoNote> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(NOTES_PREFIX)) {
      const videoId = key.replace(NOTES_PREFIX, '');
      const note = getNote(videoId);
      if (note) {
        notes[videoId] = note;
      }
    }
  }

  return notes;
}
