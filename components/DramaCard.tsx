'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Eye, Star, Clock } from 'lucide-react';
import { Drama } from '@/types/drama';
import { useState } from 'react';

interface DramaCardProps {
  drama: Drama;
}

export default function DramaCard({ drama }: DramaCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Helper function to format playCount string
  const formatPlayCount = (count: string): string => {
    return count;
  };

  const handleClick = () => {
    // Save drama data to localStorage for the detail page
    localStorage.setItem(`drama_${drama.bookId}`, JSON.stringify(drama));
    router.push(`/drama/${drama.bookId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article 
      className="group cursor-pointer h-full"
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 150)}
      tabIndex={0}
      role="button"
      aria-label={`Watch ${drama.bookName}, ${drama.chapterCount} episodes, ${formatPlayCount(drama.playCount || '0')} views`}
    >
      <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 bg-white h-full flex flex-col border border-amber-200">
        {/* Cover Image with Loading State */}
        <div className="relative aspect-3/4 overflow-hidden bg-linear-to-br from-amber-200 to-orange-200">
          {drama.coverWap ? (
            <>
              <Image
                src={drama.coverWap}
                alt={drama.bookName}
                fill
                className={`object-cover transition-transform duration-500 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                loading="lazy"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-60"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl text-amber-800">📺</span>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center ${
            isHovered ? 'bg-black/40' : ''
          }`}>
            <div className={`transform transition-all duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}>
              <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 fill-white drop-shadow-lg" />
            </div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {/* Views Badge */}
            <div className="bg-red-600/90 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">{formatPlayCount(drama.playCount || '0')}</span>
            </div>
          </div>

          {/* Episodes Badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            <span>{drama.chapterCount || '0'}</span>
          </div>
        </div>

        {/* Drama Info */}
        <div className="flex-1 flex flex-col p-3 sm:p-4">
          {/* Title */}
          <h3 className="font-bold text-amber-950 text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-red-600 transition-colors leading-tight">
            {drama.bookName}
          </h3>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {drama.tagNames?.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-linear-to-r from-amber-100 to-orange-100 text-amber-800 px-2 py-1 rounded-full font-medium border border-amber-200"
              >
                {tag}
              </span>
            ))}
            {drama.tagNames && drama.tagNames.length > 2 && (
              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                +{drama.tagNames.length - 2}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="mt-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-amber-700">
              <Eye className="w-3 h-3" />
              <span className="font-semibold">{formatPlayCount(drama.playCount || '0')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Border on Hover */}
        <div className={`h-1 bg-linear-to-r from-red-600 to-orange-600 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
      </div>
    </article>
  );
}