'use client';

import Link from 'next/link';
import { Video, VideoStatus } from '../_lib/types';
import { fmtDuration, fmtDate } from '../_lib/format';
import { Badge } from '@/components/ui/badge';

interface VideoCardProps {
  video: Video;
  status?: VideoStatus | null;
}

export default function VideoCard({ video, status }: VideoCardProps) {
  const statusConfig = {
    todo: { label: 'À faire', color: 'bg-gray-200 text-gray-700' },
    in_progress: { label: 'En cours', color: 'bg-yellow-200 text-yellow-800' },
    done: { label: 'Terminé', color: 'bg-green-200 text-green-800' },
  };
  
  const statusInfo = status ? statusConfig[status] : null;

  return (
    <Link href={`/videos/${video.video_id}`}>
      <div className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 bg-white">
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <img
            src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {fmtDuration(video.duration_s)}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className="text-xs">
              Pack {video.pack_number}
            </Badge>
            {statusInfo && (
              <span className={`text-xs px-2 py-1 rounded ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Publié le {fmtDate(video.published_at)}
          </div>
        </div>
      </div>
    </Link>
  );
}
