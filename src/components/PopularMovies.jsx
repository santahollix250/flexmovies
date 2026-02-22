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

// ===== CINEMATIC LOADING ANIMATION =====
const CinematicLoading = () => {
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [glitchEffect, setGlitchEffect] = useState(false);

  // Film reel animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 12);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 99;
        }
        return prev + 0.5;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 150);
    }, 3000);
    return () => clearInterval(glitchInterval);
  }, []);

  // Cinematic quotes
  const quotes = [
    "Lights. Camera. Action.",
    "Where stories come to life",
    "Experience the magic",
    "Your premiere destination",
    "Cinema at its finest",
    "Unforgettable moments await",
    "The show is about to begin",
    "Prepare for takeoff",
    "Rolling the film",
    "Setting the stage"
  ];

  const currentQuote = quotes[Math.floor(progress / 10) % quotes.length];

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* Film Strip Pattern - Top */}
      <div className="absolute top-0 left-0 w-full h-16 sm:h-20 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, #e50914 30px, #e50914 40px, transparent 40px, transparent 70px)',
            backgroundSize: '70px 100%',
            animation: 'filmSlide 15s linear infinite'
          }}
        />
      </div>

      {/* Film Strip Pattern - Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-16 sm:h-20 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, #e50914 30px, #e50914 40px, transparent 40px, transparent 70px)',
            backgroundSize: '70px 100%',
            animation: 'filmSlide 15s linear infinite reverse'
          }}
        />
      </div>

      {/* Animated Grain Texture */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          animation: 'grain 8s steps(10) infinite'
        }}
      />

      {/* Scanlines Effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 2px'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        {/* Center Container */}
        <div className="max-w-4xl w-full mx-auto text-center">
          {/* Logo with Glitch Effect */}
          <div className="relative mb-8 sm:mb-12">
            {/* Glow Background */}
            <div className="absolute inset-0 bg-red-600/20 rounded-full blur-3xl animate-pulse-slow" />

            {/* Main Logo */}
            <h1
              className={`relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter ${glitchEffect ? 'animate-glitch' : ''
                }`}
            >
              <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                AGASOBANUYE
              </span>
              <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent relative">
                FLEX
                {/* Sparkle Effects */}
                <span className="absolute -top-4 -right-4 text-xs animate-ping">✨</span>
                <span className="absolute -bottom-2 -left-2 text-xs animate-ping delay-300">✨</span>
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xs sm:text-sm text-gray-500 mt-2 tracking-[0.3em] uppercase animate-fade-in">
              {currentQuote}
            </p>
          </div>

          {/* Film Reel Animation */}
          <div className="flex justify-center items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {/* Left Reel */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
              <div className="absolute inset-0 border-2 border-red-600/30 rounded-full animate-spin-slow" />
              <div className="absolute inset-2 border-2 border-red-600/50 rounded-full animate-spin-slower" />
              <div className="absolute inset-4 border-2 border-red-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full animate-ping" />
              </div>
            </div>

            {/* Center Film Strip - Mobile Optimized */}
            <div className="flex gap-1 sm:gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="relative w-6 h-10 sm:w-8 sm:h-12 md:w-10 md:h-16"
                  style={{
                    animation: `filmStrip 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  {/* Film Frame */}
                  <div className="absolute inset-0 bg-gradient-to-b from-red-600/80 to-red-800/80 rounded transform -skew-y-3 shadow-lg">
                    {/* Perforations */}
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-white/30 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/20 rounded-full" />
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-white/30 rounded-full" />

                    {/* Frame Number */}
                    <div className="absolute bottom-0 right-1 text-[4px] sm:text-[6px] text-white/40">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Reel */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
              <div className="absolute inset-0 border-2 border-red-600/30 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-2 border-2 border-red-600/50 rounded-full animate-spin-slower" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-4 border-2 border-red-600 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full animate-ping" />
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="max-w-xs sm:max-w-sm mx-auto">
            {/* Progress Bar */}
            <div className="relative h-0.5 sm:h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-full"
                style={{
                  width: `${progress}%`,
                  transition: 'width 0.3s ease-out',
                  boxShadow: '0 0 20px rgba(229,9,20,0.5)',
                }}
              />

              {/* Progress Glow */}
              <div
                className="absolute inset-0 bg-red-600/20 blur-md"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {/* Progress Info */}
            <div className="flex justify-between items-center mt-2 sm:mt-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[8px] sm:text-xs text-gray-600 tracking-wider">
                  LOADING
                </span>
              </div>
              <span className="text-[8px] sm:text-xs font-mono text-red-500">
                {Math.floor(progress)}%
              </span>
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center gap-1 mt-4 sm:mt-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-600/50 rounded-full"
                  style={{
                    animation: 'loadingDot 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>

            {/* Film Icons */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 text-gray-700">
              <span className="text-xs sm:text-sm animate-bounce" style={{ animationDelay: '0s' }}>🎬</span>
              <span className="text-xs sm:text-sm animate-bounce" style={{ animationDelay: '0.2s' }}>🎥</span>
              <span className="text-xs sm:text-sm animate-bounce" style={{ animationDelay: '0.4s' }}>🍿</span>
              <span className="text-xs sm:text-sm animate-bounce" style={{ animationDelay: '0.6s' }}>🎞️</span>
              <span className="text-xs sm:text-sm animate-bounce" style={{ animationDelay: '0.8s' }}>✨</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center">
          <p className="text-[6px] sm:text-[8px] text-gray-700 tracking-[0.3em] uppercase">
            PREMIUM CINEMATIC EXPERIENCE
          </p>
          <p className="text-[4px] sm:text-[6px] text-gray-800 mt-1">
            © 2024 CINEMAX STUDIOS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes filmSlide {
          0% { background-position: 0 0; }
          100% { background-position: 70px 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        @keyframes filmStrip {
          0%, 100% { transform: skewY(-3deg) translateY(0); }
          50% { transform: skewY(-3deg) translateY(-5px); }
        }
        
        @keyframes loadingDot {
          0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
          30% { transform: scale(1.5); opacity: 1; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
          100% { transform: translate(0); }
        }
        
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-2%, 0); }
          40% { transform: translate(2%, 2%); }
          50% { transform: translate(-1%, 2%); }
          60% { transform: translate(1%, -1%); }
          70% { transform: translate(-2%, 1%); }
          80% { transform: translate(2%, -1%); }
          90% { transform: translate(-1%, -2%); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-spin-slower {
          animation: spin-slower 4s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-glitch {
          animation: glitch 0.3s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

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

  // ===== Get hero content with latest episodes =====
  const heroContent = useMemo(() => {
    // Get all series that have episodes
    const seriesWithEpisodes = movies
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
      .filter(series => series !== null);

    // Get movies with backgrounds
    const moviesWithBackground = movies
      .filter(item => item?.type === "movie" && item?.background)
      .map(movie => ({
        ...movie,
        type: 'movie'
      }));

    // Combine and sort
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
  const isSeriesWithNewEpisode = currentHeroItem?.latestEpisode ? true : false;

  // ===== Get recently updated series =====
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

  // ===== Latest uploads =====
  const latestUploads = useMemo(() => {
    const moviesList = movies
      .filter(movie => movie?.type === "movie")
      .map(movie => ({
        ...movie,
        uploadType: 'movie',
        displayDate: movie?.created_at || movie?.id
      }));

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

    return [...moviesList, ...seriesList]
      .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
      .slice(0, 12);
  }, [movies, episodes]);

  // ===== Handle series click =====
  const handleSeriesClick = useCallback((series, latestEpisode = null) => {
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);

    let targetEpisode = latestEpisode;
    let episodeIndex = 0;

    if (targetEpisode) {
      episodeIndex = sortedEpisodes.findIndex(ep => ep.id === targetEpisode.id);
    } else {
      targetEpisode = sortedEpisodes[0];
    }

    navigate(`/series-player/${series.id}`, {
      state: {
        series: series,
        episode: targetEpisode,
        episodes: sortedEpisodes,
        episodeIndex: episodeIndex
      }
    });
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  // ===== Handle hero play =====
  const handleHeroPlayClick = useCallback(() => {
    if (!currentHeroItem || !currentHeroItem.id) return;

    if (isSeriesWithNewEpisode && currentHeroItem.latestEpisode) {
      handleSeriesClick(currentHeroItem, currentHeroItem.latestEpisode);
    } else {
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

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let filtered = movies.filter(movie => movie?.type === "movie");

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

    if (value) {
      navigate(`?search=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('', { replace: true });
    }

    updateGlobalSearch(value);
  }, [navigate, updateGlobalSearch]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    navigate('', { replace: true });
    clearGlobalSearch();
    setCurrentPage(1);
  }, [navigate, clearGlobalSearch]);

  // Handle movie click
  const handleMovieClick = useCallback((movie) => {
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
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  }, []);

  // Loading state - SHOW CINEMATIC LOADING
  if (loading) {
    return <CinematicLoading />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* HERO SLIDER SECTION */}
      {filteredHeroContent.length > 0 && !globalSearchQuery && (
        <section
          className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] overflow-hidden group"
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
                      <p className="text-gray-400 text-xs">Loading...</p>
                    </div>
                  </div>
                )}
                <img
                  src={item?.background || item?.poster}
                  alt={item?.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>
          ))}

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-3 pb-4 sm:p-6 sm:pb-8 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="max-w-3xl">
              {/* Mobile badges */}
              <div className="flex sm:hidden items-center gap-1 mb-1 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${isSeriesWithNewEpisode
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : currentHeroItem?.type === "series"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gradient-to-r from-red-600 to-orange-600"
                  }`}>
                  {isSeriesWithNewEpisode ? "SERIES" : currentHeroItem?.type === "series" ? "SERIES" : "MOVIE"}
                </span>

                {isSeriesWithNewEpisode && (
                  <>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-600 text-white text-[8px] font-semibold flex items-center gap-0.5 animate-pulse">
                      <FaPlusCircle className="text-[6px]" />
                      NEW
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-purple-600/80 text-white text-[8px] font-semibold">
                      S{currentHeroItem.latestEpisode.seasonNumber}:E{currentHeroItem.latestEpisode.episodeNumber}
                    </span>
                  </>
                )}

                {currentHeroItem?.rating && (
                  <span className="flex items-center gap-0.5 text-[8px] text-yellow-400 bg-yellow-900/20 px-1.5 py-0.5 rounded-lg">
                    <FaStar className="text-[6px]" /> {currentHeroItem.rating}
                  </span>
                )}
              </div>

              {/* Desktop badges */}
              <div className="hidden sm:flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${isSeriesWithNewEpisode
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : currentHeroItem?.type === "series"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gradient-to-r from-red-600 to-orange-600"
                  }`}>
                  {isSeriesWithNewEpisode ? (
                    <><FaTv className="inline mr-1 text-[8px]" /> SERIES</>
                  ) : currentHeroItem?.type === "series" ? (
                    <><FaTv className="inline mr-1 text-[8px]" /> SERIES</>
                  ) : (
                    <><FaPlay className="inline mr-1 text-[8px]" /> MOVIE</>
                  )}
                </span>

                {isSeriesWithNewEpisode && (
                  <>
                    <span className="px-2 py-1 rounded-full bg-green-600 text-white text-[8px] sm:text-xs font-semibold flex items-center gap-1 animate-pulse">
                      <FaPlusCircle className="text-[8px]" />
                      NEW EPISODE
                    </span>
                    <span className="px-2 py-1 rounded-full bg-purple-600/80 text-white text-[8px] sm:text-xs font-semibold">
                      S{currentHeroItem.latestEpisode.seasonNumber}:E{currentHeroItem.latestEpisode.episodeNumber}
                    </span>
                  </>
                )}

                <span className="px-2 py-1 rounded-full bg-black/40 text-[8px] sm:text-xs text-white border border-white/10">
                  4K ULTRA HD
                </span>

                {currentHeroItem?.rating && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-lg">
                    <FaStar className="text-[8px]" /> {currentHeroItem.rating}
                  </span>
                )}

                {currentHeroItem?.year && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-300 bg-gray-800/30 px-2 py-1 rounded-lg">
                    <FaCalendarAlt className="text-[8px]" /> {currentHeroItem.year}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="sm:hidden text-base font-bold text-white mb-1 line-clamp-1">
                {currentHeroItem?.title}
              </h1>
              <h1 className="hidden sm:block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 line-clamp-2">
                {currentHeroItem?.title}
                {isSeriesWithNewEpisode && (
                  <span className="text-lg sm:text-xl ml-2 text-purple-400">
                    - New Episode
                  </span>
                )}
              </h1>

              {/* Episode title */}
              {isSeriesWithNewEpisode && currentHeroItem.latestEpisode && (
                <h2 className="hidden sm:block text-sm sm:text-base text-purple-300 mb-2">
                  Latest: {currentHeroItem.latestEpisode.title}
                </h2>
              )}

              {/* Description */}
              <p className="hidden sm:block text-xs sm:text-sm text-gray-300 mb-3 line-clamp-2 max-w-2xl">
                {isSeriesWithNewEpisode && currentHeroItem.latestEpisode?.description
                  ? currentHeroItem.latestEpisode.description
                  : currentHeroItem?.description || 'Experience this amazing content.'}
              </p>

              {/* Action buttons */}
              <div className="flex sm:hidden gap-2">
                <button
                  onClick={handleHeroPlayClick}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-white text-xs font-semibold flex items-center gap-1 min-w-[70px] justify-center"
                >
                  <FaPlay className="text-[10px]" />
                  <span className="text-[10px]">{isSeriesWithNewEpisode ? 'Latest' : 'Play'}</span>
                </button>
                <button
                  onClick={handleHeroInfoClick}
                  className="px-4 py-2 bg-gray-800/70 rounded-lg text-white text-xs font-semibold flex items-center gap-1 min-w-[70px] justify-center border border-gray-700"
                >
                  <FaInfoCircle className="text-[10px]" />
                  <span className="text-[10px]">Info</span>
                </button>
              </div>

              <div className="hidden sm:flex gap-3">
                <button
                  onClick={handleHeroPlayClick}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-white text-xs sm:text-sm font-semibold flex items-center gap-2 min-w-[90px] sm:min-w-[100px] justify-center shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-300"
                >
                  <FaPlay className="text-xs sm:text-sm" />
                  <span>{isSeriesWithNewEpisode ? 'Watch Latest' : 'Play'}</span>
                </button>
                <button
                  onClick={handleHeroInfoClick}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-gray-800/90 rounded-lg text-white text-xs sm:text-sm font-semibold flex items-center gap-2 min-w-[90px] sm:min-w-[100px] justify-center border border-gray-700 hover:bg-gray-700/90 transition-all duration-300"
                >
                  <FaInfoCircle className="text-xs sm:text-sm" />
                  <span>Info</span>
                </button>
              </div>
            </div>
          </div>

          {/* Type Filter */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex gap-1 sm:gap-2">
            <button
              onClick={() => setHeroContentType("all")}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium ${heroContentType === "all"
                ? 'bg-red-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setHeroContentType("movies")}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium ${heroContentType === "movies"
                ? 'bg-red-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
                }`}
            >
              Movies
            </button>
            <button
              onClick={() => setHeroContentType("series")}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium ${heroContentType === "series"
                ? 'bg-purple-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
                }`}
            >
              Series
            </button>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 z-20">
            {filteredHeroContent.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentHeroSlide(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className="p-1 sm:p-2 -m-1 sm:-m-2 group/dot"
              >
                <span className={`block transition-all duration-300 rounded-full ${index === currentHeroSlide
                  ? 'w-3 sm:w-4 md:w-6 h-0.5 sm:h-1 md:h-1.5 bg-red-600'
                  : 'w-0.5 sm:w-1 md:w-1.5 h-0.5 sm:h-1 md:h-1.5 bg-gray-500 group-hover/dot:bg-gray-300'
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
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-full blur-md opacity-0 group-hover/arrow:opacity-50 transition-opacity duration-300" />
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
              <div className="absolute inset-0 bg-gradient-to-l from-red-600 to-red-700 rounded-full blur-md opacity-0 group-hover/arrow:opacity-50 transition-opacity duration-300" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover/arrow:border-red-500/50 transition-all duration-300 group-hover/arrow:scale-110">
                <FaChevronRight className="text-white text-sm sm:text-base group-hover/arrow:text-red-400 transition-colors duration-300" />
              </div>
            </div>
          </button>

          {/* Slide counter */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-black/40 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[8px] sm:text-xs text-white border border-white/10">
            <span className="text-red-400">{currentHeroSlide + 1}</span>/{filteredHeroContent.length}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gray-800/50 z-20">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
              style={{ width: `${((currentHeroSlide + 1) / filteredHeroContent.length) * 100}%` }}
            />
          </div>
        </section>
      )}

      {/* Recently Updated Series Section */}
      {!globalSearchQuery && recentlyUpdatedSeries.length > 0 && (
        <section className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaPlayCircle className="text-purple-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Recently Updated Series</span>
              <span className="xs:hidden">Updated Series</span>
              <span className="text-[8px] sm:text-xs text-purple-400 ml-1 sm:ml-2 bg-purple-900/30 px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse">
                NEW
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
                className="flex-none w-[100px] relative"
                onClick={() => handleSeriesClick(series, series.latestEpisode)}
              >
                <div className="absolute top-1 left-1 z-10">
                  <span className="px-1 py-0.5 bg-purple-600 text-white text-[6px] rounded-full">
                    S{series.latestEpisode.seasonNumber}:E{series.latestEpisode.episodeNumber}
                  </span>
                </div>
                <MovieCard movie={series} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Uploads Section */}
      {!globalSearchQuery && latestUploads.length > 0 && (
        <section className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaUpload className="text-green-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Latest Updates</span>
              <span className="xs:hidden">Updates</span>
              <span className="text-[8px] sm:text-xs text-green-400 ml-1 sm:ml-2 bg-green-900/30 px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse">
                NEW
              </span>
            </h2>
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
                        New
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
                className="flex-none w-[100px] relative"
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
                    <span className="px-1 py-0.5 bg-purple-600 text-white text-[6px] rounded-full">
                      NEW
                    </span>
                  ) : (
                    <span className="px-1 py-0.5 bg-green-600 text-white text-[6px] rounded-full">
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
        <div className="bg-gray-900/80 rounded-xl border border-gray-800 p-3 sm:p-4">
          <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm ${isSearchFocused ? 'text-red-400' : 'text-gray-400'
                }`} />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search movies..."
                className="w-full pl-8 sm:pl-9 pr-8 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
              />
              {globalSearchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaTimes className="text-xs sm:text-sm" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs sm:text-sm"
            >
              <FaFilter className={showFilters ? 'text-red-400' : ''} />
              Filters
            </button>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500"
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
              {sortOrder === "desc" ? <FaSortAmountDown className="text-xs sm:text-sm" /> : <FaSortAmountUp className="text-xs sm:text-sm" />}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-300 mb-1 sm:mb-2">Categories</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs ${selectedCategory === "all" ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedCategory("featured")}
                      className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs flex items-center gap-1 ${selectedCategory === "featured" ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                      <FaFire className="text-[6px] sm:text-xs" /> Featured
                    </button>
                    {allCategories
                      .filter(cat => cat !== 'all' && cat !== 'featured')
                      .slice(0, 8)
                      .map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs flex items-center gap-1 ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
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
        <div className="container mx-auto px-4 mb-3 sm:mb-4">
          <div className="bg-blue-900/20 rounded-lg border border-blue-800/30 p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaSearch className="text-blue-400 text-xs sm:text-sm" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    Results: <span className="text-blue-400">"{globalSearchQuery}"</span>
                  </h3>
                  <p className="text-[8px] sm:text-xs text-gray-400">
                    Found {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearSearch}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-[8px] sm:text-xs flex items-center gap-1"
              >
                <FaTimes /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Movies Section */}
      {selectedCategory === "all" && featuredMovies.length > 0 && !globalSearchQuery && (
        <section className="container mx-auto px-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaFire className="text-red-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Featured Movies</span>
              <span className="xs:hidden">Featured</span>
              <span className="text-[8px] sm:text-xs text-red-400 ml-1 sm:ml-2 bg-red-900/30 px-1.5 sm:px-2 py-0.5 rounded-full">
                TOP
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
                className="flex-none w-[100px]"
                onClick={() => handleMovieClick(movie)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Movies Section */}
      <section className="container mx-auto px-4 pb-6 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            {globalSearchQuery ? "Results" :
              selectedCategory === "all" ? "All Movies" :
                selectedCategory === "featured" ? "Featured" :
                  `${selectedCategory}`}
          </h2>
          <span className="text-[8px] sm:text-xs text-gray-400 bg-gray-800 px-2 sm:px-3 py-1 rounded-full">
            {filteredMovies.length}
          </span>
        </div>

        {/* Category Chips */}
        {!globalSearchQuery && (
          <div className="flex gap-1 mb-3 sm:mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium whitespace-nowrap ${selectedCategory === "all"
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory("featured")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium flex items-center gap-1 whitespace-nowrap ${selectedCategory === "featured"
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <FaFire className="text-[6px] sm:text-xs" /> Featured
            </button>
            {allCategories
              .filter(cat => cat !== 'all' && cat !== 'featured')
              .slice(0, 8)
              .map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium flex items-center gap-1 whitespace-nowrap ${selectedCategory === category
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
          <div className="text-center py-8 sm:py-12 bg-gray-900/30 rounded-lg">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🎬</div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1">No movies found</h3>
            <p className="text-[8px] sm:text-xs text-gray-400 mb-2 sm:mb-3">
              {globalSearchQuery ? `No matches for "${globalSearchQuery}"` : "No movies available"}
            </p>
            {globalSearchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 rounded-lg text-white text-[8px] sm:text-xs font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2 md:gap-4">
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
              <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg bg-gray-800 disabled:opacity-50 text-white flex items-center justify-center"
                >
                  <FaChevronLeft className="text-[8px] sm:text-xs" />
                </button>
                <span className="text-[8px] sm:text-xs text-white bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg bg-gray-800 disabled:opacity-50 text-white flex items-center justify-center"
                >
                  <FaChevronRight className="text-[8px] sm:text-xs" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Quick View Modal */}
      {showQuickView && quickViewMovie && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80"
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="w-full md:max-w-2xl bg-gray-900 rounded-t-2xl md:rounded-2xl border border-gray-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-32 md:h-56">
              <img
                src={quickViewMovie?.background || quickViewMovie?.poster}
                alt={quickViewMovie?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              <button
                onClick={() => setShowQuickView(false)}
                className="absolute top-2 right-2 w-6 sm:w-7 h-6 sm:h-7 bg-black/50 rounded-full flex items-center justify-center"
              >
                <FaTimes className="text-white text-xs sm:text-sm" />
              </button>

              {/* Quick View Badges */}
              {quickViewMovie.latestEpisode && (
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-600 text-white text-[8px] sm:text-xs rounded-full">
                    Latest
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-600 text-white text-[8px] sm:text-xs rounded-full">
                    S{quickViewMovie.latestEpisode.seasonNumber}:E{quickViewMovie.latestEpisode.episodeNumber}
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4">
              <h2 className="text-sm sm:text-lg font-bold text-white mb-1">{quickViewMovie?.title}</h2>
              {quickViewMovie.latestEpisode && (
                <h3 className="text-[10px] sm:text-sm text-purple-400 mb-1 line-clamp-1">
                  {quickViewMovie.latestEpisode.title}
                </h3>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[8px] sm:text-xs text-gray-400 mb-2">
                {quickViewMovie?.rating && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500 text-[6px] sm:text-xs" /> {quickViewMovie.rating}
                  </span>
                )}
                {quickViewMovie?.year && <span>{quickViewMovie.year}</span>}
                {quickViewMovie.lastUpdated && (
                  <span className="text-green-400">
                    {formatDate(quickViewMovie.lastUpdated)}
                  </span>
                )}
                {quickViewMovie.episodeCount && (
                  <span className="text-purple-400">
                    {quickViewMovie.episodeCount} eps
                  </span>
                )}
              </div>
              <p className="text-[8px] sm:text-xs text-gray-300 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3">
                {quickViewMovie.latestEpisode?.description || quickViewMovie?.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (quickViewMovie.latestEpisode) {
                      handleSeriesClick(quickViewMovie, quickViewMovie.latestEpisode);
                    } else {
                      handleMovieClick(quickViewMovie);
                    }
                    setShowQuickView(false);
                  }}
                  className="flex-1 bg-red-600 py-1.5 sm:py-2 rounded-lg text-white text-[8px] sm:text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <FaPlay className="text-[6px] sm:text-xs" /> {quickViewMovie.latestEpisode ? 'Watch Latest' : 'Watch'}
                </button>
                <button
                  onClick={() => setShowQuickView(false)}
                  className="flex-1 bg-gray-800 py-1.5 sm:py-2 rounded-lg text-white text-[8px] sm:text-xs font-semibold"
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