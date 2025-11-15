'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface VideoFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPack: number | null;
  onPackChange: (pack: number | null) => void;
  sortBy: 'date' | 'duration' | 'title';
  onSortChange: (sort: 'date' | 'duration' | 'title') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  availablePacks: number[];
  minDuration: number | null;
  maxDuration: number | null;
  onDurationChange: (min: number | null, max: number | null) => void;
}

export default function VideoFilters({
  searchQuery,
  onSearchChange,
  selectedPack,
  onPackChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  availablePacks,
  minDuration,
  maxDuration,
  onDurationChange,
}: VideoFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher par titre..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={selectedPack?.toString() || 'all'}
          onValueChange={(value) => onPackChange(value === 'all' ? null : parseInt(value))}
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
          value={`${minDuration || 0}-${maxDuration || 2000}`}
          onValueChange={(value) => {
            const [min, max] = value.split('-').map(Number);
            onDurationChange(
              min === 0 ? null : min,
              max === 2000 ? null : max
            );
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Durée" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-2000">Toutes durées</SelectItem>
            <SelectItem value="0-600">Moins de 10 min</SelectItem>
            <SelectItem value="600-900">10-15 min</SelectItem>
            <SelectItem value="900-2000">Plus de 15 min</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as any)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Par date</SelectItem>
              <SelectItem value="duration">Par durée</SelectItem>
              <SelectItem value="title">Par titre</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(value) => onSortOrderChange(value as any)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">↓</SelectItem>
              <SelectItem value="asc">↑</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
