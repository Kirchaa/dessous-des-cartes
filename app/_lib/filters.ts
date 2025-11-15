import { Video } from './types';

export function search(videos: Video[], query: string): Video[] {
  if (!query.trim()) return videos;

  const lowerQuery = query.toLowerCase();
  return videos.filter((video) =>
    video.title.toLowerCase().includes(lowerQuery)
  );
}

export function filterByPack(videos: Video[], packNumber: number | null): Video[] {
  if (packNumber === null) return videos;
  return videos.filter((video) => video.pack_number === packNumber);
}

export function filterByDuration(
  videos: Video[],
  minSec: number | null,
  maxSec: number | null
): Video[] {
  return videos.filter((video) => {
    if (minSec !== null && video.duration_s < minSec) return false;
    if (maxSec !== null && video.duration_s > maxSec) return false;
    return true;
  });
}

export function filterByDate(
  videos: Video[],
  from?: string,
  to?: string
): Video[] {
  return videos.filter((video) => {
    if (from && video.published_at < from) return false;
    if (to && video.published_at > to) return false;
    return true;
  });
}

export function sortBy(
  videos: Video[],
  key: 'date' | 'duration' | 'title',
  order: 'asc' | 'desc' = 'desc'
): Video[] {
  const sorted = [...videos].sort((a, b) => {
    let comparison = 0;

    switch (key) {
      case 'date':
        comparison = a.published_at.localeCompare(b.published_at);
        break;
      case 'duration':
        comparison = a.duration_s - b.duration_s;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function paginate(
  videos: Video[],
  page: number,
  perPage: number
): Video[] {
  const start = (page - 1) * perPage;
  return videos.slice(start, start + perPage);
}

export function getTotalPages(totalVideos: number, perPage: number): number {
  return Math.ceil(totalVideos / perPage);
}
