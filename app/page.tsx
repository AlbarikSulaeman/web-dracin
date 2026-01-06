'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import DramaGrid from '@/components/DramaGrid';
import SearchBar from '@/components/SearchBar';
import { Drama } from '@/types/drama';
import axios from 'axios';
import { TrendingUp, Clock, Sparkles, Loader2, RefreshCw } from 'lucide-react';

const API_BASE = 'https://dramabox.sansekai.my.id/api/dramabox';

export default function Home() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending' | 'latest' | 'all'>('foryou');
  const [searchResults, setSearchResults] = useState<Drama[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabIcons = {
    foryou: Sparkles,
    trending: TrendingUp,
    latest: Clock,
    all: RefreshCw
  };

  const fetchDramas = useCallback(async (tab: string, pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (pageNum === 1 && !isRefresh) setLoading(true);
      if (isRefresh) setRefreshing(true);
      setError(null);

      if (tab === 'all') {
        let newDramas = new Map<string, Drama>();
        const endpoints = ['foryou', 'trending', 'latest', 'populersearch', 'randomdrama'];
        
        await Promise.allSettled(
          endpoints.map(async (endpoint) => {
            try {
              const response = await axios.get(`${API_BASE}/${endpoint}`, {
                timeout: 10000
              });
              const dramasData = response.data.data || response.data || [];
              
              if (Array.isArray(dramasData)) {
                dramasData.forEach((drama: Drama) => {
                  if (drama.bookId) {
                    newDramas.set(drama.bookId, drama);
                  }
                });
              }
            } catch (err) {
              console.error(`Error loading ${endpoint}:`, err);
            }
          })
        );
        
        const uniqueDramas = Array.from(newDramas.values());
        setDramas(uniqueDramas);
      } else {
        const endpoint = `${API_BASE}/${tab}?page=${pageNum}`;
        const response = await axios.get(endpoint, { timeout: 10000 });
        let newDramas = response.data.data || response.data;
        
        if (!newDramas || newDramas.length === 0) {
          setHasMore(false);
          return;
        }
        
        if (!Array.isArray(newDramas)) {
          newDramas = [newDramas];
        }

        if (pageNum === 1) {
          setDramas(newDramas);
        } else {
          setDramas(prev => {
            const existingIds = new Set(prev.map(d => d.bookId));
            const filteredNew = newDramas.filter((d: Drama) => !existingIds.has(d.bookId));
            return [...prev, ...filteredNew];
          });
        }

        if (newDramas.length < 9) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching dramas:', error);
      setError('Failed to load dramas. Please check your connection.');
      if (pageNum === 1) setDramas([]);
      setHasMore(false);
    } finally {
      if (pageNum === 1 && !isRefresh) setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchDramas(activeTab, 1);
  }, [activeTab, fetchDramas]);

  const handleRefresh = () => {
    setPage(1);
    fetchDramas(activeTab, 1, true);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDramas(activeTab, nextPage);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
        timeout: 10000
      });
      setSearchResults(response.data.data || response.data);
    } catch (error) {
      console.error('Error searching dramas:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setError(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-amber-50 to-orange-50">
      <Header />
      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
      
      {!isSearching && (
        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      <div className="container mx-auto px-3 sm:px-4 py-6 max-w-7xl">
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {!isSearching && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  {(() => {
                    const Icon = tabIcons[activeTab];
                    return Icon ? <Icon className="w-4 h-4 text-red-600" /> : null;
                  })()}
                  <h2 className="text-lg font-bold text-amber-950 capitalize">
                    {activeTab.replace(/([A-Z])/g, ' $1').trim()}
                  </h2>
                </div>
                <span className="text-xs sm:text-sm text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  {dramas.length} dramas
                </span>
              </>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="touch-target flex items-center gap-2 px-3 py-2 text-sm bg-white hover:bg-amber-50 text-amber-800 rounded-lg border border-amber-200 transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg animate-slideIn">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center">
                !
              </div>
              <p className="text-red-800 flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {isSearching && searchResults.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-amber-950">
              Search Results ({searchResults.length})
            </h2>
            <button
              onClick={handleClearSearch}
              className="text-sm text-amber-700 hover:text-red-600 font-semibold touch-target"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Drama Grid */}
        <DramaGrid 
          dramas={isSearching ? searchResults : dramas} 
          loading={loading && !refreshing}
        />

        {/* Load More Button */}
        {!isSearching && hasMore && dramas.length > 0 && !loading && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
              aria-label="Load more dramas"
            >
              Load More Dramas
            </button>
          </div>
        )}

        {/* End of Results */}
        {!isSearching && !hasMore && dramas.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-amber-700">
              <div className="h-px w-12 bg-amber-300"></div>
              <span className="text-sm font-semibold">You've reached the end</span>
              <div className="h-px w-12 bg-amber-300"></div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}