'use client'

import { useState, useEffect, useMemo } from 'react'
import VideoCard from '../_components/VideoCard'
import VideoFilters from '../_components/VideoFilters'
import { Video as VideoType } from '../_lib/types'
import { search, filterByPack, filterByDuration, sortBy, paginate, getTotalPages } from '../_lib/filters'
import { listStatuses } from '../_lib/storage'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import videosData from '@/data/videos.json'

export default function VideosClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPack, setSelectedPack] = useState<number | null>(null)
  const [minDuration, setMinDuration] = useState<number | null>(null)
  const [maxDuration, setMaxDuration] = useState<number | null>(null)
  const [sortByField, setSortByField] = useState<'date' | 'duration' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const perPage = 50

  useEffect(() => {
    setStatuses(listStatuses())
  }, [])

  const videos = videosData as VideoType[]

  const availablePacks = useMemo(() => {
    const packs = new Set(videos.map((v) => v.pack_number))
    return Array.from(packs).sort((a, b) => a - b)
  }, [videos])

  const filteredVideos = useMemo(() => {
    let result = videos
    result = search(result, searchQuery)
    result = filterByPack(result, selectedPack)
    result = filterByDuration(result, minDuration, maxDuration)
    result = sortBy(result, sortByField, sortOrder)
    return result
  }, [videos, searchQuery, selectedPack, minDuration, maxDuration, sortByField, sortOrder])

  const paginatedVideos = useMemo(() => {
    return paginate(filteredVideos, currentPage, perPage)
  }, [filteredVideos, currentPage, perPage])

  const totalPages = getTotalPages(filteredVideos.length, perPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedPack, minDuration, maxDuration])

  const handleDurationChange = (min: number | null, max: number | null) => {
    setMinDuration(min)
    setMaxDuration(max)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalogue des vidéos</h1>
          <p className="text-gray-600">
            {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''} trouvée{filteredVideos.length > 1 ? 's' : ''}
          </p>
        </div>

        <VideoFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPack={selectedPack}
          onPackChange={setSelectedPack}
          sortBy={sortByField}
          onSortChange={setSortByField}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          availablePacks={availablePacks}
          minDuration={minDuration}
          maxDuration={maxDuration}
          onDurationChange={handleDurationChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedVideos.map((video) => (
            <VideoCard
              key={video.video_id}
              video={video}
              status={statuses[video.video_id] as any}
            />
          ))}
        </div>

        {paginatedVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune vidéo trouvée avec ces critères.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
