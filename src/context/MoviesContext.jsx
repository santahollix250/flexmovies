import { createContext, useEffect, useState, useCallback } from "react";
import { supabase } from '../lib/supabase';

export const MoviesContext = createContext({
  movies: [],
  episodes: [],
  loading: true,
  isOnline: true,
  error: null,
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
  clearAllEpisodes: () => Promise.reject(new Error("MoviesContext not initialized"))
});

export function MoviesProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState(null);

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

  // Load from localStorage FIRST (immediate display)
  useEffect(() => {
    try {
      const savedMovies = localStorage.getItem('simba-movies');
      const savedEpisodes = localStorage.getItem('simba-episodes');

      if (savedMovies) {
        const parsedMovies = JSON.parse(savedMovies);
        setMovies(parsedMovies);
      }

      if (savedEpisodes) {
        const parsedEpisodes = JSON.parse(savedEpisodes);
        setEpisodes(parsedEpisodes);
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, []);

  // Fetch from Supabase
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching movies from Supabase...");

      // Fetch movies
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (moviesError) {
        console.error('Movies fetch error:', moviesError);
        setError(moviesError.message);
      } else {
        console.log(`✅ Fetched ${moviesData?.length || 0} movies from Supabase`);

        // Debug: Check first movie data
        if (moviesData && moviesData.length > 0) {
          console.log("🔍 First movie from Supabase:", {
            title: moviesData[0].title,
            download_link: moviesData[0].download_link,
            allFields: Object.keys(moviesData[0])
          });
        }

        const transformedMovies = (moviesData || []).map(movie => ({
          id: movie.id,
          title: movie.title || "Untitled",
          description: movie.description || '',
          poster: movie.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400',
          background: movie.background || movie.poster || '',
          rating: movie.rating || '7.0',
          category: movie.category || 'General',
          type: movie.type || 'movie',
          streamLink: movie.stream_link || '',
          download_link: movie.download_link || '', // ADDED THIS LINE
          nation: movie.nation || '',
          translator: movie.translator || '',
          year: movie.year || new Date().getFullYear(),
          totalSeasons: movie.total_seasons || 1,
          totalEpisodes: movie.total_episodes || 0,
          created_at: movie.created_at || new Date().toISOString(),
          updated_at: movie.updated_at
        }));

        setMovies(transformedMovies);
        localStorage.setItem('simba-movies', JSON.stringify(transformedMovies));
      }

      // Fetch episodes
      try {
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .order('season_number', { ascending: true })
          .order('episode_number', { ascending: true });

        if (!episodesError && episodesData) {
          const transformedEpisodes = (episodesData || []).map(episode => ({
            id: episode.id,
            seriesId: episode.series_id,
            seriesTitle: episode.series_title || "Unknown Series",
            title: episode.title || "Untitled Episode",
            description: episode.description || '',
            seasonNumber: episode.season_number || 1,
            episodeNumber: episode.episode_number || 1,
            duration: episode.duration || '45m',
            streamLink: episode.stream_link || '',
            download_link: episode.download_link || '', // ADDED THIS LINE
            thumbnail: episode.thumbnail || '',
            airDate: episode.air_date,
            created_at: episode.created_at || new Date().toISOString(),
            updated_at: episode.updated_at
          }));

          setEpisodes(transformedEpisodes);
          localStorage.setItem('simba-episodes', JSON.stringify(transformedEpisodes));
        }
      } catch (episodesErr) {
        console.log('Episodes fetch skipped:', episodesErr.message);
      }

    } catch (error) {
      console.error('Main fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add movie
  const addMovie = useCallback(async (movie) => {
    try {
      console.log("📤 Adding movie to Supabase:", {
        title: movie.title,
        download_link: movie.download_link, // Debug log
        allMovieData: movie
      });

      const movieData = {
        title: movie.title || "Untitled",
        description: movie.description || "",
        poster: movie.poster || "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400",
        background: movie.background || movie.poster || "",
        rating: movie.rating || "7.0",
        category: movie.category || "General",
        type: movie.type || "movie",
        stream_link: movie.streamLink || "",
        download_link: movie.download_link || "", // ADDED THIS LINE
        nation: movie.nation || "",
        translator: movie.translator || "",
        year: movie.year || new Date().getFullYear(),
        total_seasons: movie.totalSeasons || 1,
        total_episodes: movie.totalEpisodes || 0,
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
        rating: data.rating,
        category: data.category,
        type: data.type,
        streamLink: data.stream_link,
        download_link: data.download_link || "", // ADDED THIS LINE
        nation: data.nation,
        translator: data.translator,
        year: data.year,
        totalSeasons: data.total_seasons || 1,
        totalEpisodes: data.total_episodes || 0,
        created_at: data.created_at
      };

      const updatedMovies = [newMovie, ...movies];
      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

      console.log("✅ Movie added successfully:", newMovie);
      return newMovie;

    } catch (err) {
      console.error("Error adding movie:", err);

      // Create local movie
      const localMovie = {
        id: `local-${Date.now()}`,
        title: movie.title || "Untitled",
        description: movie.description || "",
        poster: movie.poster || "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400",
        background: movie.background || movie.poster || "",
        rating: movie.rating || "7.0",
        category: movie.category || "General",
        type: movie.type || "movie",
        streamLink: movie.streamLink || "",
        download_link: movie.download_link || "", // ADDED THIS LINE
        nation: movie.nation || "",
        translator: movie.translator || "",
        year: movie.year || new Date().getFullYear(),
        totalSeasons: movie.totalSeasons || 1,
        totalEpisodes: movie.totalEpisodes || 0,
        created_at: new Date().toISOString()
      };

      const updatedMovies = [localMovie, ...movies];
      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

      return localMovie;
    }
  }, [movies]);

  // Update movie
  const updateMovie = useCallback(async (id, updates) => {
    try {
      console.log("📤 Updating movie in Supabase:", {
        id: id,
        title: updates.title,
        download_link: updates.download_link, // Debug log
        allUpdates: updates
      });

      const supabaseUpdates = {
        title: updates.title,
        description: updates.description,
        poster: updates.poster,
        background: updates.background,
        rating: updates.rating,
        category: updates.category,
        type: updates.type,
        stream_link: updates.streamLink,
        download_link: updates.download_link || "", // ADDED THIS LINE
        nation: updates.nation,
        translator: updates.translator,
        year: updates.year,
        total_seasons: updates.totalSeasons,
        total_episodes: updates.totalEpisodes,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('movies')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) throw error;

      const updatedMovies = movies.map(movie =>
        movie.id === id ? { ...movie, ...updates } : movie
      );

      setMovies(updatedMovies);
      localStorage.setItem('simba-movies', JSON.stringify(updatedMovies));

      console.log("✅ Movie updated successfully");

    } catch (err) {
      console.error("Error updating movie:", err);

      const updatedMovies = movies.map(movie =>
        movie.id === id ? { ...movie, ...updates } : movie
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

  // Add episode
  const addEpisode = useCallback(async (episodeData) => {
    try {
      const episodeForSupabase = {
        series_id: episodeData.seriesId,
        series_title: episodeData.seriesTitle || "Unknown Series",
        title: episodeData.title || "Untitled Episode",
        description: episodeData.description || "",
        season_number: parseInt(episodeData.seasonNumber) || 1,
        episode_number: parseInt(episodeData.episodeNumber) || 1,
        duration: episodeData.duration || "45m",
        stream_link: episodeData.streamLink || "",
        download_link: episodeData.download_link || "", // ADDED THIS LINE
        thumbnail: episodeData.thumbnail || "",
        air_date: episodeData.airDate || null,
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
        streamLink: data.stream_link || '',
        download_link: data.download_link || '', // ADDED THIS LINE
        thumbnail: data.thumbnail,
        airDate: data.air_date,
        created_at: data.created_at
      };

      const updatedEpisodes = [...episodes, newEpisode];
      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

      return newEpisode;

    } catch (error) {
      console.error('Failed to add episode:', error);

      const localEpisode = {
        id: `local-${Date.now()}`,
        ...episodeData,
        created_at: new Date().toISOString()
      };

      const updatedEpisodes = [...episodes, localEpisode];
      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

      return localEpisode;
    }
  }, [episodes]);

  // Update episode
  const updateEpisode = useCallback(async (episodeId, updates) => {
    try {
      const supabaseUpdates = {
        title: updates.title,
        description: updates.description,
        season_number: updates.seasonNumber,
        episode_number: updates.episodeNumber,
        duration: updates.duration,
        stream_link: updates.streamLink,
        download_link: updates.download_link || "", // ADDED THIS LINE
        thumbnail: updates.thumbnail,
        air_date: updates.airDate,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('episodes')
        .update(supabaseUpdates)
        .eq('id', episodeId)
        .select()
        .single();

      if (error) throw error;

      const updatedEpisodes = episodes.map(ep =>
        ep.id === episodeId ? { ...ep, ...updates } : ep
      );

      setEpisodes(updatedEpisodes);
      localStorage.setItem('simba-episodes', JSON.stringify(updatedEpisodes));

      return data;

    } catch (error) {
      console.error('Error updating episode:', error);

      const updatedEpisodes = episodes.map(ep =>
        ep.id === episodeId ? { ...ep, ...updates } : ep
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
    fetchAllData();
  }, [fetchAllData]);

  const contextValue = {
    movies,
    episodes,
    loading,
    isOnline,
    error,
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
    clearAllEpisodes
  };

  return (
    <MoviesContext.Provider value={contextValue}>
      {children}
    </MoviesContext.Provider>
  );
}