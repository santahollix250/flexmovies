import { useContext, useMemo, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MoviesContext } from "../context/MoviesContext";
import MovieCard from "../components/MovieCard";
import {
  FaSearch,
  FaFilter,
  FaFire,
  FaStar,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaInfoCircle,
  FaChevronDown,
  FaFilm,
  FaTv,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarAlt,
  FaRegClock,
  FaRegHeart,
  FaHeart,
  FaTh,
  FaList,
  FaRocket,
  FaCrown,
  FaMedal,
  FaVideo,
  FaCamera,
  FaTheaterMasks,
  FaBolt,
  FaGem,
  FaMagic,
  FaBars,
  FaEye,
  FaClock,
  FaSpinner,
  FaUpload,
  FaPlusCircle,
  FaPlayCircle
} from "react-icons/fa";

export default function Movies() {
  const {
    movies = [],
    episodes = [],
    loading = false,
    globalSearchQuery,
    globalSearchResults,
    updateGlobalSearch,
    clearGlobalSearch
  } = useContext(MoviesContext);

  const location = useLocation();
  const navigate = useNavigate();

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';

  // Hero Slider State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [heroContentType, setHeroContentType] = useState("all");
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [showMobileHeroMenu, setShowMobileHeroMenu] = useState(false);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [likedMovies, setLikedMovies] = useState([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewMovie, setQuickViewMovie] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const itemsPerPage = 24;

  // Sync URL with global search
  useEffect(() => {
    if (urlSearchQuery !== globalSearchQuery) {
      updateGlobalSearch(urlSearchQuery);
    }
  }, [urlSearchQuery, globalSearchQuery, updateGlobalSearch]);

  // ===== Helper function to get episodes for a series =====
  const getEpisodesForSeries = useCallback((seriesId) => {
    return episodes.filter(ep => ep.seriesId === seriesId);
  }, [episodes]);

  // ===== Helper function to sort episodes =====
  const sortEpisodes = useCallback((episodesArray) => {
    if (!episodesArray || !Array.isArray(episodesArray)) return [];
    return [...episodesArray].sort((a, b) => {
      const seasonA = parseInt(a.seasonNumber) || 1;
      const seasonB = parseInt(b.seasonNumber) || 1;
      const episodeA = parseInt(a.episodeNumber) || 1;
      const episodeB = parseInt(b.episodeNumber) || 1;
      if (seasonA !== seasonB) return seasonA - seasonB;
      return episodeA - episodeB;
    });
  }, []);

  // ===== UPDATED: Get hero content with latest episodes =====
  const heroContent = useMemo(() => {
    // Get all series that have episodes
    const seriesWithEpisodes = movies
      .filter(item => item?.type === "series")
      .map(series => {
        // Get episodes for this series
        const seriesEpisodes = episodes.filter(ep => ep.seriesId === series.id);

        if (seriesEpisodes.length === 0) return null;

        // Get the latest episode based on creation date
        const latestEpisode = seriesEpisodes.sort((a, b) => {
          const dateA = a?.created_at || a?.id || 0;
          const dateB = b?.created_at || b?.id || 0;
          return new Date(dateB) - new Date(dateA);
        })[0];

        // Return series with latest episode info
        return {
          ...series,
          latestEpisode: {
            id: latestEpisode.id,
            title: latestEpisode.title,
            seasonNumber: latestEpisode.seasonNumber,
            episodeNumber: latestEpisode.episodeNumber,
            description: latestEpisode.description || series.description,
            videoUrl: latestEpisode.videoUrl,
            duration: latestEpisode.duration,
            created_at: latestEpisode.created_at
          },
          hasNewEpisode: true,
          episodeCount: seriesEpisodes.length,
          lastUpdated: latestEpisode.created_at
        };
      })
      .filter(series => series !== null); // Remove series without episodes

    // Get movies with backgrounds
    const moviesWithBackground = movies
      .filter(item => item?.type === "movie" && item?.background)
      .map(movie => ({
        ...movie,
        type: 'movie'
      }));

    // Combine and sort by latest activity (new movies or new episodes)
    const allContent = [...moviesWithBackground, ...seriesWithEpisodes]
      .sort((a, b) => {
        const dateA = a?.lastUpdated || a?.created_at || a?.id || 0;
        const dateB = b?.lastUpdated || b?.created_at || b?.id || 0;
        return new Date(dateB) - new Date(dateA);
      });

    return allContent.slice(0, 8);
  }, [movies, episodes]);

  // Filter hero content by type
  const filteredHeroContent = useMemo(() => {
    if (heroContentType === "all") return heroContent;
    if (heroContentType === "movies") return heroContent.filter(item => item?.type === "movie");
    if (heroContentType === "series") return heroContent.filter(item => item?.type === "series" || item?.latestEpisode);
    return heroContent;
  }, [heroContent, heroContentType]);

  const currentHeroItem = filteredHeroContent[currentHeroSlide] || {};

  // Check if current item is a series with new episode
  const isSeriesWithNewEpisode = currentHeroItem?.latestEpisode ? true : false;

  // ===== NEW: Get recently updated series (with new episodes) =====
  const recentlyUpdatedSeries = useMemo(() => {
    return movies
      .filter(item => item?.type === "series")
      .map(series => {
        const seriesEpisodes = episodes.filter(ep => ep.seriesId === series.id);
        if (seriesEpisodes.length === 0) return null;

        const latestEpisode = seriesEpisodes.sort((a, b) => {
          const dateA = a?.created_at || a?.id || 0;
          const dateB = b?.created_at || b?.id || 0;
          return new Date(dateB) - new Date(dateA);
        })[0];

        return {
          ...series,
          latestEpisode,
          episodeCount: seriesEpisodes.length,
          lastUpdated: latestEpisode.created_at
        };
      })
      .filter(series => series !== null)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 8);
  }, [movies, episodes]);

  // ===== NEW: Latest uploads (movies and series with new episodes) =====
  const latestUploads = useMemo(() => {
    // Get movies
    const moviesList = movies
      .filter(movie => movie?.type === "movie")
      .map(movie => ({
        ...movie,
        uploadType: 'movie',
        displayDate: movie?.created_at || movie?.id
      }));

    // Get series with recent episodes
    const seriesList = movies
      .filter(item => item?.type === "series")
      .map(series => {
        const seriesEpisodes = episodes.filter(ep => ep.seriesId === series.id);
        if (seriesEpisodes.length === 0) return null;

        const latestEpisode = seriesEpisodes.sort((a, b) => {
          const dateA = a?.created_at || a?.id || 0;
          const dateB = b?.created_at || b?.id || 0;
          return new Date(dateB) - new Date(dateA);
        })[0];

        return {
          ...series,
          uploadType: 'series',
          latestEpisode,
          displayDate: latestEpisode.created_at || series.created_at || series.id
        };
      })
      .filter(series => series !== null);

    // Combine and sort
    return [...moviesList, ...seriesList]
      .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
      .slice(0, 12);
  }, [movies, episodes]);

  // ===== UPDATED: Handle series click from cards =====
  const handleSeriesClick = useCallback((series, latestEpisode = null) => {
    // Get all episodes for this series
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);

    // Determine which episode to play (latest or first)
    let targetEpisode = latestEpisode;
    let episodeIndex = 0;

    if (targetEpisode) {
      episodeIndex = sortedEpisodes.findIndex(ep => ep.id === targetEpisode.id);
    } else {
      targetEpisode = sortedEpisodes[0];
    }

    // Navigate to series player
    navigate(`/series-player/${series.id}`, {
      state: {
        series: series,
        episode: targetEpisode,
        episodes: sortedEpisodes,
        episodeIndex: episodeIndex
      }
    });
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  // ===== UPDATED: Handle hero play =====
  const handleHeroPlayClick = useCallback(() => {
    if (!currentHeroItem || !currentHeroItem.id) return;

    // If it's a series with latest episode, navigate to series player
    if (isSeriesWithNewEpisode && currentHeroItem.latestEpisode) {
      handleSeriesClick(currentHeroItem, currentHeroItem.latestEpisode);
    } else {
      // Regular movie - navigate to player
      navigate(`/player/${currentHeroItem.id}`, {
        state: { movie: currentHeroItem }
      });
    }
  }, [currentHeroItem, isSeriesWithNewEpisode, navigate, handleSeriesClick]);

  // Handle hero info
  const handleHeroInfoClick = useCallback(() => {
    if (!currentHeroItem) return;
    setQuickViewMovie(currentHeroItem);
    setShowQuickView(true);
    setIsAutoPlaying(false);
  }, [currentHeroItem]);

  // Auto slide
  useEffect(() => {
    if (!isAutoPlaying || filteredHeroContent.length === 0 || isHoveringHero) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % filteredHeroContent.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredHeroContent.length, isHoveringHero]);

  const nextHeroSlide = useCallback(() => {
    setCurrentHeroSlide((prev) => (prev + 1) % filteredHeroContent.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [filteredHeroContent.length]);

  const prevHeroSlide = useCallback(() => {
    setCurrentHeroSlide((prev) => (prev - 1 + filteredHeroContent.length) % filteredHeroContent.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [filteredHeroContent.length]);

  // Get categories
  const allCategories = useMemo(() => {
    const categories = new Set(['all', 'featured']);
    movies.forEach(movie => {
      if (movie?.category) {
        movie.category.split(',').map(cat => cat.trim()).forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories);
  }, [movies]);

  // Category icons
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    const icons = {
      action: <FaBolt className="text-orange-400" />,
      drama: <FaTheaterMasks className="text-purple-400" />,
      comedy: <FaFilm className="text-green-400" />,
      scifi: <FaRocket className="text-blue-400" />,
      fantasy: <FaMagic className="text-pink-400" />,
      romance: <FaHeart className="text-red-400" />,
      thriller: <FaBolt className="text-yellow-400" />,
      horror: <FaFilm className="text-gray-400" />,
      documentary: <FaCamera className="text-cyan-400" />,
      featured: <FaCrown className="text-yellow-500" />,
      popular: <FaFire className="text-orange-500" />,
      topRated: <FaMedal className="text-yellow-500" />
    };
    return icons[categoryLower] || <FaVideo className="text-blue-400" />;
  };

  // Filter and sort movies - USING GLOBAL SEARCH
  const filteredMovies = useMemo(() => {
    let filtered = movies.filter(movie => movie?.type === "movie");

    // Use global search query if available
    if (globalSearchQuery) {
      filtered = filtered.filter(movie =>
        movie?.title?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        movie?.description?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        movie?.category?.toLowerCase().includes(globalSearchQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "featured") {
      filtered = filtered.filter(movie =>
        movie?.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedCategory === "featured") {
      filtered = filtered.filter(movie => movie?.background || (movie?.rating && parseFloat(movie.rating) >= 8));
    }

    filtered.sort((a, b) => {
      const order = sortOrder === "desc" ? -1 : 1;
      switch (sortBy) {
        case "rating":
          return ((parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0)) * order;
        case "year":
          return ((parseInt(b?.year) || 0) - (parseInt(a?.year) || 0)) * order;
        case "title":
          return (a?.title || '').localeCompare(b?.title || '') * (sortOrder === "desc" ? 1 : -1);
        default:
          const ratingDiff = ((parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0)) * order;
          return ratingDiff !== 0 ? ratingDiff : ((b?.id || 0) - (a?.id || 0)) * order;
      }
    });

    return filtered;
  }, [movies, globalSearchQuery, selectedCategory, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMovies, currentPage]);

  // Featured movies
  const featuredMovies = useMemo(() => {
    return movies
      .filter(movie => movie?.type === "movie" && (movie?.background || (movie?.rating && parseFloat(movie.rating) >= 8.5)))
      .sort((a, b) => (parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0))
      .slice(0, 12);
  }, [movies]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearchQuery, selectedCategory, sortBy, sortOrder]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;

    // Update URL
    if (value) {
      navigate(`?search=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('', { replace: true });
    }

    // Update global search
    updateGlobalSearch(value);
  }, [navigate, updateGlobalSearch]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    navigate('', { replace: true });
    clearGlobalSearch();
    setCurrentPage(1);
  }, [navigate, clearGlobalSearch]);

  // Toggle like
  const toggleLike = useCallback((movieId, e) => {
    e?.stopPropagation();
    setLikedMovies(prev =>
      prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
    );
  }, []);

  // Handle quick view
  const handleQuickView = useCallback((movie, e) => {
    e?.stopPropagation();
    setQuickViewMovie(movie);
    setShowQuickView(true);
  }, []);

  // Handle movie click - UPDATED for series
  const handleMovieClick = useCallback((movie) => {
    // If it's a series, navigate to series player with first episode
    if (movie?.type === "series") {
      handleSeriesClick(movie);
    } else {
      navigate(`/player/${movie?.id}`, { state: { movie } });
    }
  }, [navigate, handleSeriesClick]);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 animate-pulse">
              MOVIE<span className="text-white">FLIX</span>
            </div>
            <div className="mt-4 flex justify-center">
              <FaSpinner className="text-red-600 text-2xl animate-spin" />
            </div>
            <p className="text-gray-400 text-sm mt-3 animate-pulse">
              Loading amazing content...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* HERO SLIDER SECTION */}
      {filteredHeroContent.length > 0 && !globalSearchQuery && (
        <section
          className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] overflow-hidden group"
          onMouseEnter={() => setIsHoveringHero(true)}
          onMouseLeave={() => setIsHoveringHero(false)}
        >
          {/* Background Images */}
          {filteredHeroContent.map((item, index) => (
            <div
              key={item?.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <div className="relative w-full h-full">
                {imageLoading && index === currentHeroSlide && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <FaSpinner className="text-red-600 text-3xl animate-spin mb-2" />
                      <p className="text-gray-400 text-xs">Loading image...</p>
                    </div>
                  </div>
                )}
                <img
                  src={item?.background || item?.poster}
                  alt={item?.title}
                  className="w-full h-full object-cover md:object-cover object-center"
                  style={{
                    objectFit: window.innerWidth <= 640 ? 'contain' : 'cover',
                    backgroundColor: '#000000',
                  }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent md:via-black/70" />
              <div className="absolute inset-0 bg-black/10 md:bg-black/20" />
            </div>
          ))}

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 sm:p-6 sm:pb-12 z-20 bg-gradient-to-t from-black via-black/80 to-transparent md:via-black/90">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* Type badge */}
                <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${isSeriesWithNewEpisode
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : currentHeroItem?.type === "series"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gradient-to-r from-red-600 to-orange-600"
                  }`}>
                  {isSeriesWithNewEpisode ? (
                    <>
                      <FaTv className="inline mr-1 text-[8px] sm:text-xs" />
                      SERIES
                    </>
                  ) : currentHeroItem?.type === "series" ? (
                    <>
                      <FaTv className="inline mr-1 text-[8px] sm:text-xs" />
                      SERIES
                    </>
                  ) : (
                    <>
                      <FaPlay className="inline mr-1 text-[8px] sm:text-xs" />
                      MOVIE
                    </>
                  )}
                </span>

                {/* New Episode Badge */}
                {isSeriesWithNewEpisode && (
                  <span className="px-2 py-1 rounded-full bg-green-600 text-white text-[8px] sm:text-xs font-semibold flex items-center gap-1 animate-pulse">
                    <FaPlusCircle className="text-[8px]" />
                    NEW EPISODE
                  </span>
                )}

                {/* Episode info badge */}
                {isSeriesWithNewEpisode && (
                  <span className="px-2 py-1 rounded-full bg-purple-600/80 text-white text-[8px] sm:text-xs font-semibold">
                    S{currentHeroItem.latestEpisode.seasonNumber}:E{currentHeroItem.latestEpisode.episodeNumber}
                  </span>
                )}

                <span className="px-2 py-1 rounded-full bg-black/40 text-[8px] sm:text-xs text-white border border-white/10">
                  {window.innerWidth <= 640 ? 'HD' : '4K ULTRA HD'}
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 line-clamp-2">
                {currentHeroItem?.title}
                {isSeriesWithNewEpisode && (
                  <span className="text-lg sm:text-xl ml-2 text-purple-400">
                    - New Episode
                  </span>
                )}
              </h1>

              {/* Episode title for series */}
              {isSeriesWithNewEpisode && currentHeroItem.latestEpisode && (
                <h2 className="text-sm sm:text-lg text-purple-300 mb-2">
                  Latest: {currentHeroItem.latestEpisode.title}
                </h2>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {currentHeroItem?.rating && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-lg">
                    <FaStar className="text-[8px] sm:text-xs" /> {currentHeroItem.rating}
                  </span>
                )}
                {currentHeroItem?.year && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-300 bg-gray-800/30 px-2 py-1 rounded-lg">
                    <FaCalendarAlt className="text-[8px] sm:text-xs" /> {currentHeroItem.year}
                  </span>
                )}
                {isSeriesWithNewEpisode && currentHeroItem.episodeCount && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-purple-300 bg-purple-900/20 px-2 py-1 rounded-lg">
                    <FaTv className="text-[8px] sm:text-xs" /> {currentHeroItem.episodeCount} Episodes
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-300 bg-gray-800/30 px-2 py-1 rounded-lg">
                  <FaClock className="text-[8px] sm:text-xs" />
                  {isSeriesWithNewEpisode ? (currentHeroItem.latestEpisode?.duration || '45m') : (window.innerWidth <= 640 ? '2h' : '2h 15m')}
                </span>
                {currentHeroItem.lastUpdated && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-lg">
                    <FaUpload className="text-[8px]" /> Updated {formatDate(currentHeroItem.lastUpdated)}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-300 mb-4 line-clamp-2 max-w-2xl">
                {isSeriesWithNewEpisode && currentHeroItem.latestEpisode?.description
                  ? currentHeroItem.latestEpisode.description
                  : currentHeroItem?.description?.length > 100 && window.innerWidth <= 640
                    ? currentHeroItem?.description.substring(0, 60) + '...'
                    : currentHeroItem?.description || 'Experience this amazing content.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleHeroPlayClick}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-white text-xs sm:text-sm font-semibold flex items-center gap-2 min-w-[90px] sm:min-w-[100px] justify-center shadow-none sm:shadow-lg sm:shadow-red-600/30 hover:from-red-700 hover:to-red-800 transition-all duration-300"
                >
                  <FaPlay className="text-xs sm:text-sm" />
                  <span>{isSeriesWithNewEpisode ? 'Watch Latest' : 'Play'}</span>
                </button>
                <button
                  onClick={handleHeroInfoClick}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-gray-800/70 sm:bg-gray-800/90 rounded-lg text-white text-xs sm:text-sm font-semibold flex items-center gap-2 min-w-[90px] sm:min-w-[100px] justify-center border border-gray-700 hover:bg-gray-700/90 transition-all duration-300"
                >
                  <FaInfoCircle className="text-xs sm:text-sm" />
                  <span>Info</span>
                </button>
              </div>
            </div>
          </div>

          {/* Type Filter for Hero */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <button
              onClick={() => setHeroContentType("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${heroContentType === "all"
                ? 'bg-red-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setHeroContentType("movies")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${heroContentType === "movies"
                ? 'bg-red-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
                }`}
            >
              Movies
            </button>
            <button
              onClick={() => setHeroContentType("series")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${heroContentType === "series"
                ? 'bg-purple-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
                }`}
            >
              Series
            </button>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {filteredHeroContent.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentHeroSlide(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className="p-2 -m-2 group/dot"
              >
                <span className={`block transition-all duration-300 rounded-full ${index === currentHeroSlide
                  ? 'w-4 sm:w-6 h-1 sm:h-1.5 bg-red-600'
                  : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-gray-500 group-hover/dot:bg-gray-300'
                  }`} />
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevHeroSlide}
            className="hidden sm:block absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 group/arrow"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-full blur-md opacity-0 group-hover/arrow:opacity-50 transition-opacity duration-300 hidden md:block"></div>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover/arrow:border-red-500/50 transition-all duration-300 group-hover/arrow:scale-110">
                <FaChevronLeft className="text-white text-sm sm:text-base group-hover/arrow:text-red-400 transition-colors duration-300" />
              </div>
            </div>
          </button>

          <button
            onClick={nextHeroSlide}
            className="hidden sm:block absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 group/arrow"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-l from-red-600 to-red-700 rounded-full blur-md opacity-0 group-hover/arrow:opacity-50 transition-opacity duration-300 hidden md:block"></div>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover/arrow:border-red-500/50 transition-all duration-300 group-hover/arrow:scale-110">
                <FaChevronRight className="text-white text-sm sm:text-base group-hover/arrow:text-red-400 transition-colors duration-300" />
              </div>
            </div>
          </button>

          {/* Slide counter */}
          <div className="absolute top-4 right-4 z-20 bg-black/40 px-2 py-1 rounded-full text-[8px] text-white border border-white/10">
            <span className="text-red-400">{currentHeroSlide + 1}</span>/{filteredHeroContent.length}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gray-800/50 z-20">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
              style={{ width: `${((currentHeroSlide + 1) / filteredHeroContent.length) * 100}%` }}
            ></div>
          </div>
        </section>
      )}

      {/* ===== Recently Updated Series Section ===== */}
      {!globalSearchQuery && recentlyUpdatedSeries.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaPlayCircle className="text-purple-500" />
              Recently Updated Series
              <span className="text-xs text-purple-400 ml-2 bg-purple-900/30 px-2 py-0.5 rounded-full animate-pulse">
                NEW EPISODES
              </span>
            </h2>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recentlyUpdatedSeries.map(series => (
              <div
                key={series?.id}
                className="cursor-pointer group relative"
                onClick={() => handleSeriesClick(series, series.latestEpisode)}
              >
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                    <FaPlusCircle className="text-[8px]" />
                    S{series.latestEpisode.seasonNumber}:E{series.latestEpisode.episodeNumber}
                  </span>
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    New
                  </span>
                </div>
                <MovieCard movie={series} />
                <div className="absolute bottom-2 right-2 bg-black/70 text-[8px] text-gray-300 px-1 py-0.5 rounded">
                  {formatDate(series.lastUpdated)}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
            {recentlyUpdatedSeries.slice(0, 6).map(series => (
              <div
                key={series?.id}
                className="flex-none w-[120px] relative"
                onClick={() => handleSeriesClick(series, series.latestEpisode)}
              >
                <div className="absolute top-1 left-1 z-10">
                  <span className="px-1 py-0.5 bg-purple-600 text-white text-[8px] rounded-full">
                    S{series.latestEpisode.seasonNumber}:E{series.latestEpisode.episodeNumber}
                  </span>
                </div>
                <MovieCard movie={series} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Latest Uploads Section (includes movies and series with new episodes) ===== */}
      {!globalSearchQuery && latestUploads.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaUpload className="text-green-500" />
              Latest Updates
              <span className="text-xs text-green-400 ml-2 bg-green-900/30 px-2 py-0.5 rounded-full animate-pulse">
                NEW
              </span>
            </h2>
            <div className="text-xs text-gray-400">
              Recently added or updated
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {latestUploads.map(item => (
              <div
                key={item?.id}
                className="cursor-pointer group relative"
                onClick={() => {
                  if (item.uploadType === 'series') {
                    handleSeriesClick(item, item.latestEpisode);
                  } else {
                    handleMovieClick(item);
                  }
                }}
              >
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  {item.uploadType === 'series' && item.latestEpisode ? (
                    <>
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                        <FaTv className="text-[8px]" />
                        New Ep
                      </span>
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        S{item.latestEpisode.seasonNumber}:E{item.latestEpisode.episodeNumber}
                      </span>
                    </>
                  ) : (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                      <FaUpload className="text-[8px]" />
                      New
                    </span>
                  )}
                </div>
                <MovieCard movie={item} />
                <div className="absolute bottom-2 right-2 bg-black/70 text-[8px] text-gray-300 px-1 py-0.5 rounded">
                  {formatDate(item.displayDate)}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
            {latestUploads.slice(0, 8).map(item => (
              <div
                key={item?.id}
                className="flex-none w-[120px] relative"
                onClick={() => {
                  if (item.uploadType === 'series') {
                    handleSeriesClick(item, item.latestEpisode);
                  } else {
                    handleMovieClick(item);
                  }
                }}
              >
                <div className="absolute top-1 left-1 z-10">
                  {item.uploadType === 'series' ? (
                    <span className="px-1 py-0.5 bg-purple-600 text-white text-[8px] rounded-full">
                      NEW EP
                    </span>
                  ) : (
                    <span className="px-1 py-0.5 bg-green-600 text-white text-[8px] rounded-full">
                      NEW
                    </span>
                  )}
                </div>
                <MovieCard movie={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search and Filter Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gray-900/80 rounded-xl border border-gray-800 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${isSearchFocused ? 'text-red-400' : 'text-gray-400'
                }`} />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search movies..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
              {globalSearchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm"
            >
              <FaFilter className={showFilters ? 'text-red-400' : ''} />
              Filters
            </button>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="year">Year</option>
              <option value="title">Title</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
            >
              {sortOrder === "desc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Categories</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${selectedCategory === "all" ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedCategory("featured")}
                      className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-1 ${selectedCategory === "featured" ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                      <FaFire /> Featured
                    </button>
                    {allCategories
                      .filter(cat => cat !== 'all' && cat !== 'featured')
                      .slice(0, 8)
                      .map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-1 ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                            }`}
                        >
                          {getCategoryIcon(category)}
                          <span className="capitalize">{category}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Indicator */}
      {globalSearchQuery && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-blue-900/20 rounded-lg border border-blue-800/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaSearch className="text-blue-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Results for: <span className="text-blue-400">"{globalSearchQuery}"</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Found {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearSearch}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-xs flex items-center gap-1"
              >
                <FaTimes /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Movies Section */}
      {selectedCategory === "all" && featuredMovies.length > 0 && !globalSearchQuery && (
        <section className="container mx-auto px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaFire className="text-red-500" />
              Featured Movies
              <span className="text-xs text-red-400 ml-2 bg-red-900/30 px-2 py-0.5 rounded-full">
                TOP PICKS
              </span>
            </h2>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredMovies.slice(0, 12).map(movie => (
              <div
                key={movie?.id}
                className="cursor-pointer"
                onClick={() => handleMovieClick(movie)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
            {featuredMovies.slice(0, 8).map(movie => (
              <div
                key={movie?.id}
                className="flex-none w-[120px]"
                onClick={() => handleMovieClick(movie)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Movies Section */}
      <section className="container mx-auto px-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {globalSearchQuery ? "Search Results" :
              selectedCategory === "all" ? "All Movies" :
                selectedCategory === "featured" ? "Featured Movies" :
                  `${selectedCategory} Movies`}
          </h2>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
            {filteredMovies.length}
          </span>
        </div>

        {/* Category Chips - HIDE DURING SEARCH */}
        {!globalSearchQuery && (
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selectedCategory === "all"
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory("featured")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ${selectedCategory === "featured"
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <FaFire /> Featured
            </button>
            {allCategories
              .filter(cat => cat !== 'all' && cat !== 'featured')
              .slice(0, 8)
              .map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  {getCategoryIcon(category)}
                  <span className="capitalize">{category}</span>
                </button>
              ))}
          </div>
        )}

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 rounded-lg">
            <div className="text-4xl mb-2">🎬</div>
            <h3 className="text-base font-bold text-white mb-1">No movies found</h3>
            <p className="text-xs text-gray-400 mb-3">
              {globalSearchQuery ? `No matches for "${globalSearchQuery}"` : "No movies available"}
            </p>
            {globalSearchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-red-600 rounded-lg text-white text-xs font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {paginatedMovies.map(movie => (
                <div
                  key={movie?.id}
                  className="cursor-pointer"
                  onClick={() => handleMovieClick(movie)}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg bg-gray-800 disabled:opacity-50 text-white flex items-center justify-center"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                <span className="text-xs text-white bg-gray-800 px-3 py-1.5 rounded-lg">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg bg-gray-800 disabled:opacity-50 text-white flex items-center justify-center"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Quick View Modal - UPDATED for series navigation */}
      {showQuickView && quickViewMovie && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80"
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="w-full md:max-w-2xl bg-gray-900 rounded-t-2xl md:rounded-2xl border border-gray-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-40 md:h-56">
              <img
                src={quickViewMovie?.background || quickViewMovie?.poster}
                alt={quickViewMovie?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              <button
                onClick={() => setShowQuickView(false)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
              >
                <FaTimes className="text-white text-xs" />
              </button>

              {/* Quick View Badges */}
              {quickViewMovie.latestEpisode && (
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                    Latest Episode
                  </span>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    S{quickViewMovie.latestEpisode.seasonNumber}:E{quickViewMovie.latestEpisode.episodeNumber}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-bold text-white mb-1">{quickViewMovie?.title}</h2>
              {quickViewMovie.latestEpisode && (
                <h3 className="text-sm text-purple-400 mb-2">
                  Latest: {quickViewMovie.latestEpisode.title}
                </h3>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                {quickViewMovie?.rating && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" /> {quickViewMovie.rating}
                  </span>
                )}
                {quickViewMovie?.year && <span>{quickViewMovie.year}</span>}
                {quickViewMovie.lastUpdated && (
                  <span className="text-green-400">
                    Updated: {formatDate(quickViewMovie.lastUpdated)}
                  </span>
                )}
                {quickViewMovie.episodeCount && (
                  <span className="text-purple-400">
                    {quickViewMovie.episodeCount} Episodes
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mb-3 line-clamp-3">
                {quickViewMovie.latestEpisode?.description || quickViewMovie?.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (quickViewMovie.latestEpisode) {
                      // Series with latest episode
                      handleSeriesClick(quickViewMovie, quickViewMovie.latestEpisode);
                    } else {
                      // Regular movie
                      handleMovieClick(quickViewMovie);
                    }
                    setShowQuickView(false);
                  }}
                  className="flex-1 bg-red-600 py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <FaPlay /> {quickViewMovie.latestEpisode ? 'Watch Latest Episode' : 'Watch Now'}
                </button>
                <button
                  onClick={() => setShowQuickView(false)}
                  className="flex-1 bg-gray-800 py-2 rounded-lg text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}