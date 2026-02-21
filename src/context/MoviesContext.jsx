import { createContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from '../lib/supabase';

// Supported video platforms - ADDED DAILYMOTION
const VIDEO_PLATFORMS = {
  VIMEO: 'vimeo',
  YOUTUBE: 'youtube',
  MUX: 'mux',
  DIRECT: 'direct',
  EMBED: 'embed',
  DAILYMOTION: 'dailymotion' // ADDED
};

// Helper functions for all platforms - UPDATED FOR DAILYMOTION
const extractVideoId = (url, platform) => {
  if (!url || typeof url !== 'string') return '';

  // If it's just an ID (no URL)
  if (platform === VIDEO_PLATFORMS.VIMEO && /^\d{5,}$/.test(url.trim())) {
    return url.trim();
  }
  if (platform === VIDEO_PLATFORMS.YOUTUBE && /^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }
  if (platform === VIDEO_PLATFORMS.MUX && /^[a-zA-Z0-9]+$/.test(url.trim())) {
    return url.trim();
  }
  if (platform === VIDEO_PLATFORMS.DAILYMOTION && /^[a-zA-Z0-9]+$/.test(url.trim())) { // ADDED
    return url.trim();
  }

  // Extract from URL patterns
  let match;

  switch (platform) {
    case VIDEO_PLATFORMS.VIMEO:
      // https://vimeo.com/123456789
      match = url.match(/vimeo\.com\/(\d+)/);
      if (match) return match[1];
      // https://player.vimeo.com/video/123456789
      match = url.match(/player\.vimeo\.com\/video\/(\d+)/);
      if (match) return match[1];
      // https://vimeo.com/channels/xxx/123456789
      match = url.match(/vimeo\.com\/channels\/[^\/]+\/(\d+)/);
      if (match) return match[1];
      break;

    case VIDEO_PLATFORMS.YOUTUBE:
      // https://youtube.com/watch?v=VIDEO_ID
      // https://youtu.be/VIDEO_ID
      // https://youtube.com/embed/VIDEO_ID
      match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
      break;

    case VIDEO_PLATFORMS.MUX:
      // https://stream.mux.com/VIDEO_ID.m3u8
      // https://mux.com/VIDEO_ID
      match = url.match(/(?:stream\.)?mux\.com\/([a-zA-Z0-9]+)/);
      if (match) return match[1];
      break;

    case VIDEO_PLATFORMS.DAILYMOTION: // ADDED
      // Remove query parameters and fragments
      const cleanUrl = url.split('?')[0].split('#')[0];
      const patterns = [
        /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
        /dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/,
        /dai\.ly\/([a-zA-Z0-9]+)/,
        /dailymotion\.com\/(?:swf|embed)\/video\/([a-zA-Z0-9]+)/,
        /\/\/www\.dailymotion\.com\/video\/([a-zA-Z0-9]+)_/
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match) return match[1];
      }
      break;
  }

  return '';
};

const generateEmbedUrl = (videoId, platform, quality = '1080') => {
  if (!videoId) return '';

  switch (platform) {
    case VIDEO_PLATFORMS.VIMEO:
      const params = new URLSearchParams({
        title: 0,
        byline: 0,
        portrait: 0,
        badge: 0,
        autopause: 0,
        quality: quality === 'auto' ? '1080p' : `${quality}p`
      });
      return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;

    case VIDEO_PLATFORMS.YOUTUBE:
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;

    case VIDEO_PLATFORMS.MUX:
      return `https://stream.mux.com/${videoId}.m3u8`;

    case VIDEO_PLATFORMS.DAILYMOTION: // ADDED
      return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&queue-autoplay-next=0&queue-enable=0&sharing-enable=0&ui-logo=0&ui-start-screen-info=0`;

    case VIDEO_PLATFORMS.DIRECT:
      return videoId; // Direct URLs are already embeddable

    case VIDEO_PLATFORMS.EMBED:
      return videoId; // Embed code is already complete

    default:
      return '';
  }
};

const detectPlatform = (url) => {
  if (!url || typeof url !== 'string') return VIDEO_PLATFORMS.VIMEO;

  // Check for Vimeo
  if (/vimeo\.com/.test(url) || /^\d{5,}$/.test(url.trim())) {
    return VIDEO_PLATFORMS.VIMEO;
  }

  // Check for YouTube
  if (/youtube\.com/.test(url) || /youtu\.be/.test(url)) {
    return VIDEO_PLATFORMS.YOUTUBE;
  }

  // Check for Mux
  if (/mux\.com/.test(url) || /^[a-zA-Z0-9]+$/.test(url.trim())) {
    return VIDEO_PLATFORMS.MUX;
  }

  // Check for DailyMotion - ADDED
  if (/dailymotion\.com/.test(url) || /dai\.ly/.test(url) || /^[a-zA-Z0-9]+$/.test(url.trim())) {
    return VIDEO_PLATFORMS.DAILYMOTION;
  }

  // Check for direct video files
  if (/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url)) {
    return VIDEO_PLATFORMS.DIRECT;
  }

  // Check for embed code
  if (url.includes('<iframe') || url.includes('embed')) {
    return VIDEO_PLATFORMS.EMBED;
  }

  // Default to Vimeo
  return VIDEO_PLATFORMS.VIMEO;
};

const processVideoUrl = (videoUrl, videoType) => {
  if (!videoUrl) return { id: '', embedUrl: '', type: videoType || VIDEO_PLATFORMS.VIMEO };

  const detectedType = videoType || detectPlatform(videoUrl);
  const videoId = extractVideoId(videoUrl, detectedType);
  const embedUrl = generateEmbedUrl(videoId, detectedType);

  return {
    id: videoId,
    embedUrl: embedUrl,
    type: detectedType
  };
};

// Search helper function
const searchInContent = (items, searchQuery, filters = {}) => {
  if (!items || items.length === 0) return [];

  return items.filter(item => {
    // Text search
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesTitle = item.title?.toLowerCase().includes(query);
      const matchesDescription = item.description?.toLowerCase().includes(query);
      const matchesDirector = item.director?.toLowerCase().includes(query);
      const matchesCategory = item.category?.toLowerCase().includes(query);
      const matchesNation = item.nation?.toLowerCase().includes(query);
      const matchesTranslator = item.translator?.toLowerCase().includes(query);

      if (!(matchesTitle || matchesDescription || matchesDirector || matchesCategory || matchesNation || matchesTranslator)) {
        return false;
      }
    }

    // Genre/Category filter
    if (filters.genre && filters.genre !== '') {
      if (item.category?.toLowerCase() !== filters.genre.toLowerCase()) {
        return false;
      }
    }

    // Year filter
    if (filters.year && filters.year !== '') {
      const itemYear = parseInt(item.year);
      const filterYear = parseInt(filters.year);
      if (itemYear !== filterYear) {
        return false;
      }
    }

    // Rating filter
    if (filters.rating && filters.rating !== '') {
      const minRating = parseFloat(filters.rating);
      const itemRating = parseFloat(item.rating || item.imdbRating || 0);
      if (itemRating < minRating) {
        return false;
      }
    }

    // Country/Nation filter
    if (filters.country && filters.country !== '') {
      if (item.nation?.toLowerCase() !== filters.country.toLowerCase()) {
        return false;
      }
    }

    // Language filter (if available in your data)
    if (filters.language && filters.language !== '') {
      // Assuming you have a language field, if not, skip this filter
      if (item.language && item.language.toLowerCase() !== filters.language.toLowerCase()) {
        return false;
      }
    }

    // Type filter (movie/series/all)
    if (filters.type && filters.type !== 'all') {
      if (item.type !== filters.type) {
        return false;
      }
    }

    return true;
  });
};

// Sort helper function
const sortResults = (items, sortBy) => {
  const sorted = [...items];

  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'rating':
      return sorted.sort((a, b) => (b.rating || b.imdbRating || 0) - (a.rating || a.imdbRating || 0));
    case 'trending':
      // You can implement your trending algorithm here
      return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    case 'az':
      return sorted.sort((a, b) => a.title?.localeCompare(b.title));
    case 'za':
      return sorted.sort((a, b) => b.title?.localeCompare(a.title));
    default:
      return sorted;
  }
};

export const MoviesContext = createContext({
  movies: [],
  episodes: [],
  loading: true,
  loadingProgress: 0,
  isOnline: true,
  error: null,
  // Global search state
  globalSearchQuery: '',
  globalSearchResults: [],
  globalSearchFilters: {},
  updateGlobalSearch: () => { },
  clearGlobalSearch: () => { },
  // Search related
  searchResults: [],
  searchEpisodes: [],
  searchMovies: () => { },
  searchAll: () => { },
  getSuggestions: () => [],
  clearSearch: () => { },
  recentSearches: [],
  saveRecentSearch: () => { },
  // Original CRUD operations
  addMovie: () => Promise.reject(new Error("MoviesContext not initialized")),
  updateMovie: () => Promise.reject(new Error("MoviesContext not initialized")),
  deleteMovie: () => Promise.reject(new Error("MoviesContext not initialized")),
  addEpisode: () => Promise.reject(new Error("MoviesContext not initialized")),
  updateEpisode: () => Promise.reject(new Error("MoviesContext not initialized")),
  deleteEpisode: () => Promise.reject(new Error("MoviesContext not initialized")),
  getEpisodesBySeries: () => [],
  getEpisodeById: () => null,
  getSeriesWithEpisodes: () => [],
  refreshMovies: () => { },
  refreshEpisodes: () => { },
  clearAllMovies: () => Promise.reject(new Error("MoviesContext not initialized")),
  clearAllEpisodes: () => Promise.reject(new Error("MoviesContext not initialized")),
  VIDEO_PLATFORMS: VIDEO_PLATFORMS
});

export function MoviesProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState(null);

  // Search related state
  const [searchResults, setSearchResults] = useState([]);
  const [searchEpisodes, setSearchEpisodes] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // GLOBAL SEARCH STATE - Single source of truth for all search inputs
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [globalSearchFilters, setGlobalSearchFilters] = useState({});

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 10));
      }
    } catch (err) {
      console.error('Error loading recent searches:', err);
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchData) => {
    setRecentSearches(prev => {
      const newSearches = [searchData, ...prev.filter(s =>
        s.query !== searchData.query ||
        JSON.stringify(s.filters) !== JSON.stringify(searchData.filters)
      )].slice(0, 10);

      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  // Update loading progress
  const updateProgress = useCallback((progress) => {
    setLoadingProgress(Math.min(progress, 100));
  }, []);

  // Load from localStorage FIRST (immediate display)
  useEffect(() => {
    try {
      updateProgress(10);
      const savedMovies = localStorage.getItem('simba-movies');
      const savedEpisodes = localStorage.getItem('simba-episodes');

      if (savedMovies) {
        const parsedMovies = JSON.parse(savedMovies);
        setMovies(parsedMovies);
        updateProgress(30);
      }

      if (savedEpisodes) {
        const parsedEpisodes = JSON.parse(savedEpisodes);
        setEpisodes(parsedEpisodes);
        updateProgress(50);
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, [updateProgress]);

  // Fetch from Supabase
  const fetchAllData = useCallback(async () => {
    if (!isOnline) {
      setLoading(false);
      updateProgress(100);
      return;
    }

    setLoading(true);
    setError(null);
    updateProgress(60);

    try {
      console.log("🔄 Fetching movies from Supabase...");

      // Fetch movies
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      updateProgress(75);

      if (moviesError) {
        console.error('Movies fetch error:', moviesError);
        setError(moviesError.message);
      } else {
        console.log(`✅ Fetched ${moviesData?.length || 0} movies from Supabase`);

        // Transform movies data with multi-platform support
        const transformedMovies = (moviesData || []).map(movie => {
          const videoInfo = processVideoUrl(movie.video_url, movie.video_type);

          return {
            id: movie.id,
            title: movie.title || "Untitled",
            description: movie.description || '',
            poster: movie.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400',
            background: movie.background || movie.poster || '',
            rating: movie.rating || '7.0',
            category: movie.category || 'General',
            type: movie.type || 'movie',
            videoUrl: movie.video_url || movie.stream_link || '',
            streamLink: videoInfo.embedUrl || movie.stream_link || '',
            download_link: movie.download_link || '',
            download: movie.download || '',
            nation: movie.nation || '',
            translator: movie.translator || '',
            year: movie.year || new Date().getFullYear(),
            totalSeasons: movie.total_seasons || 1,
            totalEpisodes: movie.total_episodes || 0,
            videoType: videoInfo.type,
            videoId: videoInfo.id,
            duration: movie.duration || '',
            quality: movie.quality || 'HD',
            director: movie.director || '',
            imdbRating: movie.imdb_rating || null,
            status: movie.status || 'completed',
            views: movie.views || 0,
            embedCode: movie.embed_code || '',
            created_at: movie.created_at || new Date().toISOString(),
            updated_at: movie.updated_at
          };
        });

        setMovies(transformedMovies);
        localStorage.setItem('simba-movies', JSON.stringify(transformedMovies));
        updateProgress(85);
      }

      // Fetch episodes
      try {
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .order('season_number', { ascending: true })
          .order('episode_number', { ascending: true });

        updateProgress(95);

        if (!episodesError && episodesData) {
          const transformedEpisodes = (episodesData || []).map(episode => {
            const videoInfo = processVideoUrl(episode.video_url, episode.video_type);

            return {
              id: episode.id,
              seriesId: episode.series_id,
              seriesTitle: episode.series_title || "Unknown Series",
              title: episode.title || "Untitled Episode",
              description: episode.description || '',
              seasonNumber: episode.season_number || 1,
              episodeNumber: episode.episode_number || 1,
              duration: episode.duration || '45m',
              videoUrl: episode.video_url || episode.stream_link || '',
              streamLink: videoInfo.embedUrl || episode.stream_link || '',
              download_link: episode.download_link || '',
              thumbnail: episode.thumbnail || '',
              airDate: episode.air_date,
              videoType: videoInfo.type,
              videoId: videoInfo.id,
              embedCode: episode.embed_code || '',
              created_at: episode.created_at || new Date().toISOString(),
              updated_at: episode.updated_at
            };
          });

          setEpisodes(transformedEpisodes);
          localStorage.setItem('simba-episodes', JSON.stringify(transformedEpisodes));
        }
      } catch (episodesErr) {
        console.log('Episodes fetch skipped:', episodesErr.message);
      }

      updateProgress(100);

    } catch (error) {
      console.error('Main fetch error:', error);
      setError(error.message);
      updateProgress(100);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [isOnline, updateProgress]);

  // SEARCH FUNCTIONS

  // UPDATE GLOBAL SEARCH - Single source of truth
  const updateGlobalSearch = useCallback((query, filters = {}) => {
    setGlobalSearchQuery(query);
    setGlobalSearchFilters(filters);

    if (query.trim() || Object.keys(filters).length > 0) {
      // Search in movies
      const movieResults = searchInContent(movies, query, filters);
      const sortedMovies = sortResults(movieResults, filters.sortBy || 'popular');

      // Search in episodes
      const episodeResults = searchInContent(episodes, query, filters);
      const sortedEpisodes = sortResults(episodeResults, filters.sortBy || 'popular');

      setGlobalSearchResults(sortedMovies);
      setSearchResults(sortedMovies);
      setSearchEpisodes(sortedEpisodes);

      // Save to recent searches if there's a query
      if (query.trim()) {
        saveRecentSearch({
          query: query.trim(),
          filters,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      setGlobalSearchResults([]);
      setSearchResults([]);
      setSearchEpisodes([]);
    }
  }, [movies, episodes, saveRecentSearch]);

  // Clear global search
  const clearGlobalSearch = useCallback(() => {
    setGlobalSearchQuery('');
    setGlobalSearchResults([]);
    setGlobalSearchFilters({});
    setSearchResults([]);
    setSearchEpisodes([]);
  }, []);

  // Search movies only
  const searchMovies = useCallback((query, filters = {}) => {
    const results = searchInContent(movies, query, filters);
    const sorted = sortResults(results, filters.sortBy || 'popular');
    setSearchResults(sorted);
    return sorted;
  }, [movies]);

  // Search episodes only
  const searchEpisodesOnly = useCallback((query, filters = {}) => {
    const results = searchInContent(episodes, query, filters);
    const sorted = sortResults(results, filters.sortBy || 'popular');
    setSearchEpisodes(sorted);
    return sorted;
  }, [episodes]);

  // Search all content (movies and episodes)
  const searchAll = useCallback((searchData) => {
    const { query, ...filters } = searchData;

    // Search movies
    const movieResults = searchInContent(movies, query, filters);
    const sortedMovies = sortResults(movieResults, filters.sortBy || 'popular');

    // Search episodes
    const episodeResults = searchInContent(episodes, query, filters);
    const sortedEpisodes = sortResults(episodeResults, filters.sortBy || 'popular');

    setSearchResults(sortedMovies);
    setSearchEpisodes(sortedEpisodes);

    // Save to recent searches
    saveRecentSearch({
      query,
      filters,
      timestamp: new Date().toISOString()
    });

    return {
      movies: sortedMovies,
      episodes: sortedEpisodes
    };
  }, [movies, episodes, saveRecentSearch]);

  // Get search suggestions (for autocomplete)
  const getSuggestions = useCallback((query, limit = 5) => {
    if (!query || query.trim().length < 2) return [];

    const searchTerm = query.toLowerCase().trim();
    const suggestions = [];

    // Add movie title suggestions
    movies.forEach(movie => {
      if (movie.title?.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          type: 'movie',
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          year: movie.year,
          category: movie.category
        });
      }
    });

    // Add series/episode suggestions
    episodes.forEach(episode => {
      if (episode.title?.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          type: 'episode',
          id: episode.id,
          seriesId: episode.seriesId,
          seriesTitle: episode.seriesTitle,
          title: episode.title,
          thumbnail: episode.thumbnail,
          seasonNumber: episode.seasonNumber,
          episodeNumber: episode.episodeNumber
        });
      }
    });

    // Add category suggestions
    const categories = new Set();
    movies.forEach(movie => {
      if (movie.category?.toLowerCase().includes(searchTerm)) {
        categories.add(movie.category);
      }
    });

    categories.forEach(category => {
      suggestions.push({
        type: 'category',
        title: category,
        query: category
      });
    });

    return suggestions.slice(0, limit);
  }, [movies, episodes]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchEpisodes([]);
    setGlobalSearchResults([]);
    setGlobalSearchQuery('');
  }, []);

  // Add movie with multi-platform support
  const addMovie = useCallback(async (movie) => {
    try {
      console.log("📤 Adding movie to Supabase:", {
        title: movie.title,
        videoUrl: movie.videoUrl,
        videoType: movie.videoType,
        allMovieData: movie
      });

      const videoInfo = processVideoUrl(movie.videoUrl, movie.videoType);

      const movieData = {
        title: movie.title || "Untitled",
        description: movie.description || "",
        poster: movie.poster || "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400",
        background: movie.background || movie.poster || "",
        category: movie.category || "General",
        type: movie.type || "movie",
        video_url: movie.videoUrl || "",
        stream_link: videoInfo.embedUrl || movie.streamLink || "",
        download_link: movie.download_link || "",
        download: movie.download || "",
        nation: movie.nation || "",
        translator: movie.translator || "",
        year: movie.year || new Date().getFullYear(),
        total_seasons: movie.totalSeasons || 1,
        total_episodes: movie.totalEpisodes || 0,
        video_type: videoInfo.type,
        video_id: videoInfo.id || null,
        embed_url: videoInfo.embedUrl || null,
        embed_code: movie.embedCode || null,
        duration: movie.duration || null,
        quality: movie.quality || 'HD',
        director: movie.director || null,
        imdb_rating: movie.imdbRating || null,
        status: movie.status || 'completed',
        views: movie.views || 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('movies')
        .insert([movieData])
        .select()
        .single();

      if (error) throw error;

      const newMovie = {
        id: data.id,
        title: data.title,
        description: data.description,
        poster: data.poster,
        background: data.background,
        category: data.category,
        type: data.type,
        videoUrl: data.video_url || '',
        streamLink: data.embed_url || data.stream_link || '',
        download_link: data.download_link || "",
        download: data.download || "",
        nation: data.nation,
        translator: data.translator,
        year: data.year,
        totalSeasons: data.total_seasons || 1,
        totalEpisodes: data.total_episodes || 0,
        videoType: data.video_type || 'direct',
        videoId: data.video_id || '',
        duration: data.duration || '',
        quality: data.quality || 'HD',
        director: data.director || '',
        imdbRating: data.imdb_rating || null,
        status: data.status || 'completed',
        views: data.views || 0,
        embedCode: data.embed_code || '',
        created_at: data.created_at
      };

      const updatedMovies = [newMovie, ...movies];
      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

      console.log("✅ Movie added successfully:", newMovie);
      return newMovie;

    } catch (err) {
      console.error("Error adding movie:", err);

      const videoInfo = processVideoUrl(movie.videoUrl, movie.videoType);

      // Create local movie
      const localMovie = {
        id: `local-${Date.now()}`,
        title: movie.title || "Untitled",
        description: movie.description || "",
        poster: movie.poster || "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400",
        background: movie.background || movie.poster || "",
        category: movie.category || "General",
        type: movie.type || "movie",
        videoUrl: movie.videoUrl || "",
        streamLink: videoInfo.embedUrl || movie.streamLink || "",
        download_link: movie.download_link || "",
        download: movie.download || "",
        nation: movie.nation || "",
        translator: movie.translator || "",
        year: movie.year || new Date().getFullYear(),
        totalSeasons: movie.totalSeasons || 1,
        totalEpisodes: movie.totalEpisodes || 0,
        videoType: videoInfo.type,
        videoId: videoInfo.id,
        duration: movie.duration || '',
        quality: movie.quality || 'HD',
        director: movie.director || '',
        imdbRating: movie.imdbRating || null,
        status: movie.status || 'completed',
        views: movie.views || 0,
        embedCode: movie.embedCode || '',
        created_at: new Date().toISOString()
      };

      const updatedMovies = [localMovie, ...movies];
      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

      return localMovie;
    }
  }, [movies]);

  // Update movie with multi-platform support
  const updateMovie = useCallback(async (id, updates) => {
    try {
      console.log("📤 Updating movie in Supabase:", {
        id: id,
        title: updates.title,
        videoUrl: updates.videoUrl,
        videoType: updates.videoType,
        allUpdates: updates
      });

      const videoInfo = processVideoUrl(updates.videoUrl, updates.videoType);

      const supabaseUpdates = {
        title: updates.title,
        description: updates.description,
        poster: updates.poster,
        background: updates.background,
        category: updates.category,
        type: updates.type,
        video_url: updates.videoUrl || '',
        stream_link: videoInfo.embedUrl || updates.streamLink || '',
        download_link: updates.download_link || "",
        download: updates.download || "",
        nation: updates.nation,
        translator: updates.translator,
        year: updates.year,
        total_seasons: updates.totalSeasons,
        total_episodes: updates.totalEpisodes,
        video_type: videoInfo.type,
        video_id: videoInfo.id || null,
        embed_url: videoInfo.embedUrl || null,
        embed_code: updates.embedCode || null,
        duration: updates.duration || null,
        quality: updates.quality || 'HD',
        director: updates.director || null,
        imdb_rating: updates.imdbRating || null,
        status: updates.status || 'completed',
        views: updates.views || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('movies')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) throw error;

      const updatedMovieData = {
        ...updates,
        videoType: videoInfo.type,
        videoId: videoInfo.id,
        streamLink: videoInfo.embedUrl || updates.streamLink || ''
      };

      const updatedMovies = movies.map(movie =>
        movie.id === id ? { ...movie, ...updatedMovieData } : movie
      );

      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

      console.log("✅ Movie updated successfully");

    } catch (err) {
      console.error("Error updating movie:", err);

      const videoInfo = processVideoUrl(updates.videoUrl, updates.videoType);

      const updatedMovieData = {
        ...updates,
        videoType: videoInfo.type,
        videoId: videoInfo.id,
        streamLink: videoInfo.embedUrl || updates.streamLink || ''
      };

      const updatedMovies = movies.map(movie =>
        movie.id === id ? { ...movie, ...updatedMovieData } : movie
      );

      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

      throw err;
    }
  }, [movies]);

  // Delete movie
  const deleteMovie = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedMovies = movies.filter(movie => movie.id !== id);
      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

    } catch (err) {
      console.error("Error deleting movie:", err);

      const updatedMovies = movies.filter(movie => movie.id !== id);
      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

      throw err;
    }
  }, [movies]);

  // Get episodes for series
  const getEpisodesBySeries = useCallback((seriesId) => {
    if (!seriesId) return [];
    return episodes.filter(ep => ep.seriesId === seriesId);
  }, [episodes]);

  // Add episode with multi-platform support
  const addEpisode = useCallback(async (episodeData) => {
    try {
      const videoInfo = processVideoUrl(episodeData.videoUrl, episodeData.videoType);

      const episodeForSupabase = {
        series_id: episodeData.seriesId,
        series_title: episodeData.seriesTitle || "Unknown Series",
        title: episodeData.title || "Untitled Episode",
        description: episodeData.description || "",
        season_number: parseInt(episodeData.seasonNumber) || 1,
        episode_number: parseInt(episodeData.episodeNumber) || 1,
        duration: episodeData.duration || "45m",
        video_url: episodeData.videoUrl || "",
        stream_link: videoInfo.embedUrl || episodeData.streamLink || "",
        download_link: episodeData.download_link || "",
        thumbnail: episodeData.thumbnail || "",
        air_date: episodeData.airDate || null,
        video_type: videoInfo.type,
        video_id: videoInfo.id || null,
        embed_code: episodeData.embedCode || null,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('episodes')
        .insert([episodeForSupabase])
        .select()
        .single();

      if (error) throw error;

      const newEpisode = {
        id: data.id,
        seriesId: data.series_id,
        seriesTitle: data.series_title,
        title: data.title,
        description: data.description,
        seasonNumber: data.season_number || 1,
        episodeNumber: data.episode_number || 1,
        duration: data.duration,
        videoUrl: data.video_url || '',
        streamLink: data.stream_link || '',
        download_link: data.download_link || '',
        thumbnail: data.thumbnail,
        airDate: data.air_date,
        videoType: data.video_type || 'direct',
        videoId: data.video_id || '',
        embedCode: data.embed_code || '',
        created_at: data.created_at
      };

      const updatedEpisodes = [...episodes, newEpisode];
      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

      return newEpisode;

    } catch (error) {
      console.error('Failed to add episode:', error);

      const videoInfo = processVideoUrl(episodeData.videoUrl, episodeData.videoType);

      const localEpisode = {
        id: `local-${Date.now()}`,
        ...episodeData,
        videoType: videoInfo.type,
        videoId: videoInfo.id,
        streamLink: videoInfo.embedUrl || episodeData.streamLink || '',
        created_at: new Date().toISOString()
      };

      const updatedEpisodes = [...episodes, localEpisode];
      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

      return localEpisode;
    }
  }, [episodes]);

  // Update episode with multi-platform support
  const updateEpisode = useCallback(async (episodeId, updates) => {
    try {
      const videoInfo = processVideoUrl(updates.videoUrl, updates.videoType);

      const supabaseUpdates = {
        title: updates.title,
        description: updates.description,
        season_number: updates.seasonNumber,
        episode_number: updates.episodeNumber,
        duration: updates.duration,
        video_url: updates.videoUrl || '',
        stream_link: videoInfo.embedUrl || updates.streamLink || '',
        download_link: updates.download_link || "",
        thumbnail: updates.thumbnail,
        air_date: updates.airDate,
        video_type: videoInfo.type,
        video_id: videoInfo.id || null,
        embed_code: updates.embedCode || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('episodes')
        .update(supabaseUpdates)
        .eq('id', episodeId)
        .select()
        .single();

      if (error) throw error;

      const updatedEpisodeData = {
        ...updates,
        videoType: videoInfo.type,
        videoId: videoInfo.id,
        streamLink: videoInfo.embedUrl || updates.streamLink || ''
      };

      const updatedEpisodes = episodes.map(ep =>
        ep.id === episodeId ? { ...ep, ...updatedEpisodeData } : ep
      );

      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

      return data;

    } catch (error) {
      console.error('Error updating episode:', error);

      const videoInfo = processVideoUrl(updates.videoUrl, updates.videoType);

      const updatedEpisodeData = {
        ...updates,
        videoType: videoInfo.type,
        videoId: videoInfo.id,
        streamLink: videoInfo.embedUrl || updates.streamLink || ''
      };

      const updatedEpisodes = episodes.map(ep =>
        ep.id === episodeId ? { ...ep, ...updatedEpisodeData } : ep
      );

      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

      throw error;
    }
  }, [episodes]);

  // Delete episode
  const deleteEpisode = useCallback(async (episodeId) => {
    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId);

      if (error) throw error;

      const updatedEpisodes = episodes.filter(ep => ep.id !== episodeId);
      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

    } catch (error) {
      console.error('Error deleting episode:', error);

      const updatedEpisodes = episodes.filter(ep => ep.id !== episodeId);
      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

      throw error;
    }
  }, [episodes]);

  // Get episode by ID
  const getEpisodeById = useCallback((episodeId) => {
    return episodes.find(ep => ep.id === episodeId);
  }, [episodes]);

  // Get series with episodes
  const getSeriesWithEpisodes = useCallback(() => {
    const seriesMap = {};

    episodes.forEach(episode => {
      if (!seriesMap[episode.seriesId]) {
        seriesMap[episode.seriesId] = {
          id: episode.seriesId,
          title: episode.seriesTitle,
          episodes: [],
          seasons: new Set()
        };
      }
      seriesMap[episode.seriesId].episodes.push(episode);
      seriesMap[episode.seriesId].seasons.add(episode.seasonNumber);
    });

    Object.values(seriesMap).forEach(series => {
      series.seasons = Array.from(series.seasons).sort((a, b) => a - b);
      series.episodes.sort((a, b) => {
        if (a.seasonNumber !== b.seasonNumber) {
          return a.seasonNumber - b.seasonNumber;
        }
        return a.episodeNumber - b.episodeNumber;
      });
    });

    return Object.values(seriesMap);
  }, [episodes]);

  // Clear all movies
  const clearAllMovies = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .neq('id', 0);

      if (error) throw error;

      setMovies([]);
      localStorage.removeItem('simba-movies');

    } catch (err) {
      console.error('Clear movies error:', err);
      throw err;
    }
  }, []);

  // Clear all episodes
  const clearAllEpisodes = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .neq('id', 0);

      if (error) {
        if (!error.message.includes('does not exist')) {
          throw error;
        }
      }

      setEpisodes([]);
      localStorage.removeItem('simba-episodes');

    } catch (err) {
      console.error('Clear episodes error:', err);
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      updateProgress(5);
      await fetchAllData();
    };
    init();
  }, [fetchAllData, updateProgress]);

  const contextValue = {
    movies,
    episodes,
    loading,
    loadingProgress,
    isOnline,
    error,
    // Global search state - SINGLE SOURCE OF TRUTH
    globalSearchQuery,
    globalSearchResults,
    globalSearchFilters,
    updateGlobalSearch,
    clearGlobalSearch,
    // Search related
    searchResults,
    searchEpisodes,
    searchMovies,
    searchAll,
    getSuggestions,
    clearSearch,
    recentSearches,
    saveRecentSearch,
    // Original CRUD operations
    addMovie,
    updateMovie,
    deleteMovie,
    addEpisode,
    updateEpisode,
    deleteEpisode,
    getEpisodesBySeries,
    getEpisodeById,
    getSeriesWithEpisodes,
    refreshMovies: fetchAllData,
    refreshEpisodes: fetchAllData,
    clearAllMovies,
    clearAllEpisodes,
    VIDEO_PLATFORMS // Export the platforms for use in other components
  };

  return (
    <MoviesContext.Provider value={contextValue}>
      {children}
    </MoviesContext.Provider>
  );
}