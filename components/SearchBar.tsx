'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

const API_BASE = 'https://dramabox.sansekai.my.id/api/dramabox';

export default function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // Load popular searches
    loadPopularSearches();
  }, []);

  const loadPopularSearches = async () => {
    try {
      const response = await axios.get(`${API_BASE}/populersearch`);
      const data = response.data.data || response.data || [];
      if (Array.isArray(data)) {
        setPopularSearches(data.slice(0, 5).map((item: any) => item.query || item));
      }
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  };

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const response = await axios.get(`${API_BASE}/searchsuggestion?query=${encodeURIComponent(searchQuery)}`);
      const suggestionsData = response.data.data || response.data || [];
      if (Array.isArray(suggestionsData)) {
        setSuggestions(suggestionsData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      saveToRecentSearches(query);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onClear();
    setShowSuggestions(false);
  };

  const saveToRecentSearches = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    saveToRecentSearches(suggestion);
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    onSearch(search);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return (
    <div className="relative bg-linear-to-r from-amber-100 to-orange-100 border-b-2 border-red-600 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-700" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search dramas, actors, or tags..."
                className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 rounded-xl bg-white text-amber-950 placeholder-amber-400 border-2 border-amber-200 focus:border-red-600 focus:outline-none transition-colors text-sm sm:text-base shadow-sm"
                aria-label="Search dramas"
              />
              
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors touch-target"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <button
              type="submit"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-target flex items-center gap-2"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-amber-200 overflow-hidden z-50 animate-fadeIn">
              {/* Loading State */}
              {loadingSuggestions && (
                <div className="p-4 text-center">
                  <Loader2 className="w-6 h-6 text-red-600 animate-spin mx-auto" />
                </div>
              )}

              {/* Suggestions */}
              {!loadingSuggestions && suggestions.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-3 text-left hover:bg-amber-50 rounded-lg flex items-center gap-3 touch-target group"
                    >
                      <Search className="w-4 h-4 text-amber-400 group-hover:text-red-600" />
                      <span className="text-amber-800 group-hover:text-red-600">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {!loadingSuggestions && recentSearches.length > 0 && (
                <div className="p-2 border-t border-amber-100">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      Recent Searches
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-amber-500 hover:text-red-600 font-semibold touch-target"
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full px-3 py-3 text-left hover:bg-amber-50 rounded-lg flex items-center gap-3 touch-target group"
                    >
                      <Clock className="w-4 h-4 text-amber-400 group-hover:text-red-600" />
                      <span className="text-amber-800 group-hover:text-red-600">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              {!loadingSuggestions && popularSearches.length > 0 && query.length === 0 && (
                <div className="p-2 border-t border-amber-100">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" />
                    Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-2 p-3">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full text-sm font-medium transition-colors touch-target"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!loadingSuggestions && suggestions.length === 0 && query.length > 0 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                  <p className="text-amber-700 font-semibold">No suggestions found</p>
                  <p className="text-sm text-amber-500 mt-1">Try different keywords</p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}