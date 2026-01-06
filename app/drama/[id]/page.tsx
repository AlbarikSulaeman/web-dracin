'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Play, Eye, Loader, Heart, Share2, Download, Clock, Star, Calendar } from 'lucide-react';
import { Drama, Episode } from '@/types/drama';
import axios from 'axios';

const API_BASE = 'https://dramabox.sansekai.my.id/api/dramabox';

export default function DramaPage() {
  const params = useParams();
  const router = useRouter();
  const dramaId = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [drama, setDrama] = useState<Drama | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>('HD');
  const [showEpisodeGrid, setShowEpisodeGrid] = useState(true);
  const [lastWatched, setLastWatched] = useState<number | null>(null);

  // Helper function to format playCount string
  const formatPlayCount = (count: string): string => {
    return count;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load drama from localStorage immediately
        const storedDrama = localStorage.getItem(`drama_${dramaId}`);
        const lastWatchedEp = localStorage.getItem(`last_watched_${dramaId}`);
        
        if (storedDrama) {
          const dramadata = JSON.parse(storedDrama);
          setDrama(dramadata);
        }

        if (lastWatchedEp) {
          setLastWatched(parseInt(lastWatchedEp));
        }

        // Load favorite status
        const fav = localStorage.getItem(`favorite_${dramaId}`);
        setFavorite(fav === 'true');

        // Load episodes
        const response = await axios.get(
          `${API_BASE}/allepisode?bookId=${dramaId}`
        );
        const episodesData = response.data.data || response.data;
        setEpisodes(episodesData);
        
        // Set selected episode (last watched or first)
        if (lastWatchedEp && episodesData[parseInt(lastWatchedEp) - 1]) {
          setSelectedEpisode(episodesData[parseInt(lastWatchedEp) - 1]);
        } else if (episodesData.length > 0) {
          setSelectedEpisode(episodesData[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dramaId]);

  useEffect(() => {
    // Save last watched episode
    if (selectedEpisode) {
      localStorage.setItem(`last_watched_${dramaId}`, selectedEpisode.chapterIndex.toString());
    }
  }, [selectedEpisode, dramaId]);

  const handleVideoLoad = () => {
    setVideoLoading(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleVideoLoaded = () => {
    setVideoLoading(false);
  };

  const handleVideoError = () => {
    setVideoLoading(false);
    alert('Failed to load video. Please try another episode.');
  };

  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode);
    setVideoLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavorite = () => {
    const newFav = !favorite;
    setFavorite(newFav);
    localStorage.setItem(`favorite_${dramaId}`, newFav.toString());
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: drama?.bookName,
          text: `Watch ${drama?.bookName} on CiciDraci`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleNextEpisode = () => {
    if (!selectedEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.chapterId === selectedEpisode.chapterId);
    if (currentIndex < episodes.length - 1) {
      handleEpisodeSelect(episodes[currentIndex + 1]);
    }
  };

  const handlePrevEpisode = () => {
    if (!selectedEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.chapterId === selectedEpisode.chapterId);
    if (currentIndex > 0) {
      handleEpisodeSelect(episodes[currentIndex - 1]);
    }
  };

  const getVideoUrl = () => {
    if (!selectedEpisode?.cdnList?.[0]?.videoPathList?.[0]?.videoPath) {
      return null;
    }
    return selectedEpisode.cdnList[0].videoPathList[0].videoPath;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-amber-800 font-semibold mt-4">Loading drama...</p>
          <p className="text-sm text-amber-600 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-screen bg-linear-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-linear-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📺</span>
          </div>
          <p className="text-2xl font-bold text-amber-900 mb-4">Drama not found</p>
          <p className="text-amber-700 mb-8">The drama you're looking for might have been removed or doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 touch-target"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 to-orange-50">
      {/* Sticky Header */}
      <div className="wood-gradient-dark sticky top-0 z-50 shadow-lg backdrop-blur-md bg-linear-to-r from-[#3e2723]/95 to-[#5d4037]/95">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-amber-50 hover:text-white transition-colors touch-target p-2 rounded-lg hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            <h1 className="text-lg font-bold text-amber-50 truncate max-w-[50vw] text-center">
              {drama.bookName}
            </h1>
            
            <div className="flex items-center gap-2">
              
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors touch-target"
                aria-label="Share drama"
              >
                <Share2 className="w-5 h-5 text-amber-50" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 max-w-7xl">
        {/* Drama Info Section */}
        <div className="glass-effect rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-white/20 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Cover Image */}
            <div className="lg:col-span-3">
              <div className="relative group">
                <div className="relative aspect-2/3 rounded-xl overflow-hidden shadow-2xl">
                  {drama.coverWap ? (
                    <Image
                      src={drama.coverWap}
                      alt={drama.bookName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 400px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-amber-300 to-amber-600 flex items-center justify-center">
                      <span className="text-7xl">📺</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent rounded-xl"></div>
              </div>
            </div>

            {/* Drama Details */}
            <div className="lg:col-span-9">
              <div className="space-y-4">
                {/* Title & Basic Info */}
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-950 mb-2 leading-tight">
                    {drama.bookName}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 text-amber-800 font-semibold">
                      <Play className="w-5 h-5" />
                      <span>{drama.chapterCount || '0'} Episodes</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-800 font-semibold">
                      <Eye className="w-5 h-5" />
                      <span>{formatPlayCount(drama.playCount || '0')} Views</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {drama.tagNames?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white rounded-full text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Synopsis */}
                <div className="bg-linear-to-br from-amber-50 to-orange-50 p-4 sm:p-6 rounded-xl border-l-4 border-red-600 shadow-sm">
                  <h3 className="font-bold text-amber-950 mb-3 text-lg">Synopsis</h3>
                  <p className="text-amber-900 leading-relaxed text-balance">
                    {drama.introduction || 'No synopsis available for this drama.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        {selectedEpisode && getVideoUrl() && (
          <div className="bg-white/95 rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-amber-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-amber-950">
                  {selectedEpisode.chapterName}
                </h2>
                <p className="text-amber-700 mt-1">
                  Episode {selectedEpisode.chapterIndex + 1} of {episodes.length}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevEpisode}
                  disabled={selectedEpisode.chapterIndex === 0}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed text-amber-800 rounded-lg font-semibold transition-colors touch-target flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Prev
                </button>
                <button
                  onClick={handleNextEpisode}
                  disabled={selectedEpisode.chapterIndex === episodes.length - 1}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors touch-target flex items-center gap-2"
                >
                  Next
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className=" bg-black rounded-lg">
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                  <div className="text-center">
                    <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                    <p className="text-white font-semibold">Loading video...</p>
                  </div>
                </div>
              )}
              
              {/* <video
                key={getVideoUrl()}
                className="w-full h-full"
                controls
                autoPlay
              >
                <source src={getVideoUrl() || ''} type="video/mp4" />
                Your browser does not support the video tag.
              </video> */}
              <video
                ref={videoRef}
                key={getVideoUrl()}
                className="w-full h-full"
                controls
                autoPlay
                playsInline
                preload="auto"
                onLoadStart={handleVideoLoad}
                onLoadedData={handleVideoLoaded}
                onError={handleVideoError}
                poster={drama.coverWap}
              >
                <source src={getVideoUrl() || ''} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* Episodes Section */}
        <div className="bg-white/95 rounded-2xl shadow-xl p-4 sm:p-6 border border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-950">
                Episodes ({episodes.length})
              </h2>
              <p className="text-amber-700 mt-1">Select an episode to watch</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEpisodeGrid(!showEpisodeGrid)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-semibold transition-colors touch-target"
              >
                {showEpisodeGrid ? 'List View' : 'Grid View'}
              </button>
            </div>
          </div>

          {episodes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-800 text-lg font-semibold">No episodes available yet</p>
              <p className="text-amber-600 mt-2">Check back later for new episodes</p>
            </div>
          ) : showEpisodeGrid ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {episodes.map((episode) => (
                <button
                  key={episode.chapterId}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`relative p-3 sm:p-4 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-20 touch-target ${
                    selectedEpisode?.chapterId === episode.chapterId
                      ? 'bg-linear-to-br from-red-600 to-red-700 text-white shadow-xl scale-105 ring-2 ring-red-400'
                      : 'bg-linear-to-br from-amber-100 to-orange-100 text-amber-900 hover:from-amber-200 hover:to-orange-200 hover:shadow-lg'
                  }`}
                  aria-label={`Episode ${episode.chapterIndex + 1}: ${episode.chapterName}`}
                >
                  <div className={`flex items-center gap-1.5 ${
                    selectedEpisode?.chapterId === episode.chapterId ? 'text-white' : 'text-red-600'
                  }`}>
                    <Play className="w-4 h-4" />
                    <span className="text-lg font-bold">{episode.chapterIndex + 1}</span>
                  </div>
                  {lastWatched === episode.chapterIndex + 1 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                  )}
                  <span className="text-xs truncate max-w-full text-center mt-1">
                    {episode.chapterName}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {episodes.map((episode) => (
                <button
                  key={episode.chapterId}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`w-full p-4 rounded-xl transition-all duration-300 flex items-center gap-4 text-left touch-target ${
                    selectedEpisode?.chapterId === episode.chapterId
                      ? 'bg-linear-to-r from-red-600 to-red-700 text-white shadow-lg'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                  }`}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                    selectedEpisode?.chapterId === episode.chapterId
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-200 text-amber-800'
                  }`}>
                    <Play className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold">Episode {episode.chapterIndex + 1}</span>
                      {lastWatched === episode.chapterIndex + 1 && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Watched</span>
                      )}
                    </div>
                    <p className="text-sm">{episode.chapterName}</p>
                  </div>
                  <Clock className={`w-5 h-5 ${
                    selectedEpisode?.chapterId === episode.chapterId ? 'text-white' : 'text-amber-600'
                  }`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}