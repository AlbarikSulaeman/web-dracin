// components/DramaModal.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Play, Eye } from 'lucide-react';
import { Drama, Episode } from '@/types/drama';
import axios from 'axios';

interface DramaModalProps {
  drama: Drama;
  onClose: () => void;
}

const API_BASE = 'https://dramabox.sansekai.my.id/api/dramabox';

export default function DramaModal({ drama, onClose }: DramaModalProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/allepisode?bookId=${drama.bookId}`
        );
        setEpisodes(response.data.data || response.data);
        if (response.data.data?.length > 0 || response.data?.length > 0) {
          setSelectedEpisode((response.data.data || response.data)[0]);
        }
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [drama.bookId]);

  const getVideoUrl = () => {
    if (!selectedEpisode?.cdnList?.[0]?.videoPathList?.[0]?.videoPath) {
      return null;
    }
    return selectedEpisode.cdnList[0].videoPathList[0].videoPath;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-amber-800 to-red-600 text-white p-4 flex items-center justify-between z-10">
          <h2 className="text-lg md:text-2xl font-bold truncate">{drama.bookName}</h2>
          <button
            onClick={onClose}
            className="shrink-0 hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Drama Info */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6">
            <div className="shrink-0 w-32 md:w-40">
              {drama.coverWap ? (
                <Image
                  src={drama.coverWap}
                  alt={drama.bookName}
                  width={160}
                  height={220}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-3/4 bg-linear-to-br from-amber-300 to-amber-600 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white text-4xl">📺</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm text-amber-700 mb-2 font-semibold">
                {drama.chapterCount} Episodes
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {drama.tagNames?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-4 text-amber-800 font-semibold">
                <Eye className="w-4 h-4" />
                {drama.playCount}
              </div>
              <p className="text-sm text-amber-950 leading-relaxed">
                {drama.introduction}
              </p>
            </div>
          </div>

          {/* Video Player */}
          {selectedEpisode && getVideoUrl() && (
            <div className="mb-6">
              <h3 className="font-bold text-amber-950 mb-3">
                {selectedEpisode.chapterName}
              </h3>
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  key={getVideoUrl()}
                  className="w-full h-full"
                  controls
                  autoPlay
                >
                  <source src={getVideoUrl() || ''} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Episodes List */}
          <div>
            <h3 className="font-bold text-amber-950 mb-3 text-lg">Episodes</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {episodes.map((episode) => (
                  <button
                    key={episode.chapterId}
                    onClick={() => setSelectedEpisode(episode)}
                    className={`p-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      selectedEpisode?.chapterId === episode.chapterId
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    <Play className="w-3 h-3" />
                    {episode.chapterIndex + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}