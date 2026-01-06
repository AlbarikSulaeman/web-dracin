// components/DramaGrid.tsx
'use client';

import DramaCard from './DramaCard';
import { Drama } from '@/types/drama';

interface DramaGridProps {
  dramas: Drama[];
  loading: boolean;
}

export default function DramaGrid({ dramas, loading }: DramaGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mb-4"></div>
          <p className="text-amber-800 font-semibold">Loading dramas...</p>
        </div>
      </div>
    );
  }

  if (dramas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-xl font-semibold text-amber-900 mb-2">No dramas found</p>
          <p className="text-amber-700">Try adjusting your search or browse other categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {dramas.map((drama) => (
        <div key={drama.bookId}>
          <DramaCard drama={drama} />
        </div>
      ))}
    </div>
  );
}