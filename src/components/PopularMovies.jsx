import { useContext, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MoviesContext } from "../context/MoviesContext";
import MovieCard from "../components/MovieCard";
import HeroSlider from "../components/HeroSlider";
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
  FaPlayCircle,
  FaLanguage,
  FaSkull,
  FaLaugh,
  FaHeart as FaHeartIcon,
  FaRobot,
  FaDragon,
  FaMask,
  FaGlobe,
  FaBabyCarriage,
  FaGhost,
  FaSpaceShuttle,
  FaBrain,
  FaTree,
  FaMusic,
  FaFootballBall,
  FaGavel
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// ===== PROFESSIONAL NETFLIX-STYLE SPLASH SCREEN =====
const CinematicLoading = () => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Text animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setShowText(true), 300);
    const timer2 = setTimeout(() => setShowSubtext(true), 800);
    const timer3 = setTimeout(() => setAnimationComplete(true), 1500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-red-950/30" />

      {/* Subtle animated grain texture */}
      <div
        className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          animation: 'grain 8s steps(10) infinite'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        {/* Logo Animation Container */}
        <div className="text-center">
          {/* Animated Red Bar - Netflix Style */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 mb-8 mx-auto"
            style={{ maxWidth: "300px" }}
          />

          {/* Main Text Animation */}
          <div className="relative">
            {/* Background Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute inset-0 bg-red-600 blur-3xl"
            />

            {/* CINEVA Text */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
              className="overflow-hidden"
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
                  CINEVA
                </span>
              </h1>
            </motion.div>

            {/* FILMS Text */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
              className="overflow-hidden mt-2"
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight">
                <span className="text-white">
                  FILMS
                </span>
              </h1>
            </motion.div>
          </div>

          {/* Animated Red Bar - Bottom */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
            className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 mt-8 mx-auto"
            style={{ maxWidth: "300px" }}
          />

          {/* Subtext with fade in */}
          <AnimatePresence>
            {showSubtext && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8"
              >
                <p className="text-gray-400 text-sm sm:text-base tracking-wider">
                  Premium Entertainment Experience
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  <p className="text-gray-500 text-xs tracking-[0.2em] uppercase">
                    STREAMING NOW
                  </p>
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 max-w-xs mx-auto"
          >
            <div className="relative h-0.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-red-600 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-gray-600">LOADING</span>
              <motion.span
                className="text-[10px] text-red-500 font-mono"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {Math.floor(progress)}%
              </motion.span>
            </div>
          </motion.div>

          {/* Pulsing Dot Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center gap-1 mt-4"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-red-500/50 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-2%, 0); }
          40% { transform: translate(2%, 2%); }
          50% { transform: translate(-1%, 2%); }
          60% { transform: translate(2%, -1%); }
          70% { transform: translate(-2%, 1%); }
          80% { transform: translate(2%, -1%); }
          90% { transform: translate(-1%, -2%); }
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
    clearGlobalSearch
  } = useContext(MoviesContext);

  const location = useLocation();
  const navigate = useNavigate();

  // Refs for touch handling and navigation
  const isNavigating = useRef(false);
  const touchStartTime = useRef(0);
  const touchStartX = useRef(0);

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';

  // If there's a global search query, redirect to search page
  useEffect(() => {
    if (globalSearchQuery && location.pathname === '/movies') {
      navigate(`/search?search=${encodeURIComponent(globalSearchQuery)}`);
    }
  }, [globalSearchQuery, location.pathname, navigate]);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [likedMovies, setLikedMovies] = useState([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewMovie, setQuickViewMovie] = useState(null);
  const itemsPerPage = 24;

  // Helper functions
  const getEpisodesForSeries = useCallback((seriesId) => {
    return episodes.filter(ep => ep.seriesId === seriesId);
  }, [episodes]);

  const sortEpisodes = useCallback((episodesArray) => {
    if (!episodesArray || !Array.isArray(episodesArray)) return [];
    return [...episodesArray].sort((a, b) => {
      const seasonA = parseInt(a.seasonNumber) || parseInt(a.season_number) || 1;
      const seasonB = parseInt(b.seasonNumber) || parseInt(b.season_number) || 1;
      const episodeA = parseInt(a.episodeNumber) || parseInt(a.episode_number) || 1;
      const episodeB = parseInt(b.episodeNumber) || parseInt(b.episode_number) || 1;
      if (seasonA !== seasonB) return seasonA - seasonB;
      return episodeA - episodeB;
    });
  }, []);

  const getMovieParts = useCallback((movie) => {
    if (!movie) return [];
    if (movie.parts && Array.isArray(movie.parts)) {
      return movie.parts;
    }
    if (movie.download) {
      try {
        const parsed = typeof movie.download === 'string'
          ? JSON.parse(movie.download)
          : movie.download;
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (parsed && parsed.parts && Array.isArray(parsed.parts)) {
          return parsed.parts;
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
    return [];
  }, []);

  // IMPROVED: Optimized image URL for better mobile display
  const getOptimizedImageUrl = useCallback((url, isBackground = true, forMobile = false) => {
    if (!url) return null;

    // For mobile, we want to ensure the image is properly sized
    if (window.innerWidth <= 768 || forMobile) {
      // For hero background on mobile, use a size that covers the viewport well
      if (isBackground) {
        if (url.includes('tmdb.org') || url.includes('themoviedb')) {
          // Use original quality but with proper sizing for mobile
          return url.replace(/w[0-9]+/, 'original');
        }
        if (url.includes('cloudinary.com')) {
          return url.includes('?')
            ? `${url}&q_auto:best&c_fill&g_auto&w=${window.innerWidth}&h=${window.innerHeight * 0.8}`
            : `${url}?q_auto:best&c_fill&g_auto&w=${window.innerWidth}&h=${window.innerHeight * 0.8}`;
        }
      }

      // For regular images on mobile
      if (url.includes('tmdb.org') || url.includes('themoviedb')) {
        return url.replace(/w[0-9]+/, 'w780');
      }
      if (url.includes('cloudinary.com')) {
        return url.includes('?') ? `${url}&q_auto:good&c_fill&w=400` : `${url}?q_auto:good&c_fill&w=400`;
      }
    }

    // Desktop optimization
    if (isBackground && window.innerWidth > 1024) {
      if (url.includes('tmdb.org') || url.includes('themoviedb')) {
        return url.replace(/w[0-9]+/, 'original');
      }
      if (url.includes('cloudinary.com')) {
        return url.includes('?') ? `${url}&q_auto:best&c_fill&g_auto` : `${url}?q_auto:best&c_fill&g_auto`;
      }
    }

    return url;
  }, []);

  // Get hero content with latest episodes for HeroSlider
  const heroContent = useMemo(() => {
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
          id: series.id,
          title: series.title,
          description: series.description,
          background: series.background || series.poster,
          poster: series.poster,
          type: 'series',
          rating: series.rating,
          year: series.year,
          translator: series.translator,
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

    const moviesWithBackground = movies
      .filter(item => item?.type === "movie")
      .map(movie => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        background: movie.background || movie.poster,
        poster: movie.poster,
        type: 'movie',
        rating: movie.rating,
        year: movie.year,
        translator: movie.translator,
        videoUrl: movie.videoUrl,
        download: movie.download
      }));

    const allContent = [...moviesWithBackground, ...seriesWithEpisodes]
      .sort((a, b) => {
        const dateA = a?.lastUpdated || a?.created_at || a?.id || 0;
        const dateB = b?.lastUpdated || b?.created_at || b?.id || 0;
        return new Date(dateB) - new Date(dateA);
      });

    return allContent.slice(0, 8);
  }, [movies, episodes]);

  // Get recently updated series
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
      .slice(0, 12);
  }, [movies, episodes]);

  // Latest uploads
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
      .slice(0, 16);
  }, [movies, episodes]);

  // ===== DYNAMIC CATEGORY EXTRACTION =====
  const dynamicCategories = useMemo(() => {
    const categoryMap = new Map();

    movies.forEach(movie => {
      if (movie?.type === "movie" && movie?.category) {
        const categories = movie.category.split(',').map(cat => cat.trim().toLowerCase());
        categories.forEach(cat => {
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, {
              id: cat,
              name: cat.charAt(0).toUpperCase() + cat.slice(1),
              count: 0,
              movies: []
            });
          }
          categoryMap.get(cat).count++;
          categoryMap.get(cat).movies.push(movie);
        });
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [movies]);

  // Category icons mapping
  const getCategoryIconAndColor = (categoryName) => {
    const categoryLower = categoryName.toLowerCase();

    const iconMap = {
      action: { icon: <FaBolt className="text-orange-500" />, color: "from-orange-600 to-red-600", bgColor: "bg-orange-900/20", borderColor: "border-orange-500/30" },
      horror: { icon: <FaSkull className="text-red-500" />, color: "from-red-600 to-pink-600", bgColor: "bg-red-900/20", borderColor: "border-red-500/30" },
      comedy: { icon: <FaLaugh className="text-green-500" />, color: "from-green-600 to-teal-600", bgColor: "bg-green-900/20", borderColor: "border-green-500/30" },
      drama: { icon: <FaTheaterMasks className="text-purple-500" />, color: "from-purple-600 to-pink-600", bgColor: "bg-purple-900/20", borderColor: "border-purple-500/30" },
      romance: { icon: <FaHeartIcon className="text-pink-500" />, color: "from-pink-600 to-rose-600", bgColor: "bg-pink-900/20", borderColor: "border-pink-500/30" },
      scifi: { icon: <FaRocket className="text-cyan-500" />, color: "from-cyan-600 to-blue-600", bgColor: "bg-cyan-900/20", borderColor: "border-cyan-500/30" },
      fantasy: { icon: <FaMagic className="text-indigo-500" />, color: "from-indigo-600 to-purple-600", bgColor: "bg-indigo-900/20", borderColor: "border-indigo-500/30" },
      thriller: { icon: <FaMask className="text-yellow-500" />, color: "from-yellow-600 to-orange-600", bgColor: "bg-yellow-900/20", borderColor: "border-yellow-500/30" },
      cartoon: { icon: <FaBabyCarriage className="text-yellow-400" />, color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-900/20", borderColor: "border-yellow-500/30" },
      animation: { icon: <FaBabyCarriage className="text-blue-400" />, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-900/20", borderColor: "border-blue-500/30" },
      adventure: { icon: <FaGlobe className="text-green-400" />, color: "from-green-500 to-emerald-500", bgColor: "bg-green-900/20", borderColor: "border-green-500/30" },
      mystery: { icon: <FaGhost className="text-purple-400" />, color: "from-purple-500 to-indigo-500", bgColor: "bg-purple-900/20", borderColor: "border-purple-500/30" },
      crime: { icon: <FaGavel className="text-red-400" />, color: "from-red-500 to-orange-500", bgColor: "bg-red-900/20", borderColor: "border-red-500/30" },
      documentary: { icon: <FaCamera className="text-cyan-400" />, color: "from-cyan-500 to-teal-500", bgColor: "bg-cyan-900/20", borderColor: "border-cyan-500/30" },
      music: { icon: <FaMusic className="text-pink-400" />, color: "from-pink-500 to-rose-500", bgColor: "bg-pink-900/20", borderColor: "border-pink-500/30" },
      sport: { icon: <FaFootballBall className="text-green-400" />, color: "from-green-500 to-lime-500", bgColor: "bg-green-900/20", borderColor: "border-green-500/30" },
      science: { icon: <FaBrain className="text-blue-400" />, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-900/20", borderColor: "border-blue-500/30" },
      space: { icon: <FaSpaceShuttle className="text-cyan-400" />, color: "from-cyan-500 to-blue-500", bgColor: "bg-cyan-900/20", borderColor: "border-cyan-500/30" },
      nature: { icon: <FaTree className="text-green-400" />, color: "from-green-500 to-emerald-500", bgColor: "bg-green-900/20", borderColor: "border-green-500/30" }
    };

    const defaultStyle = { icon: <FaFilm className="text-gray-400" />, color: "from-gray-600 to-gray-500", bgColor: "bg-gray-900/20", borderColor: "border-gray-500/30" };

    return iconMap[categoryLower] || defaultStyle;
  };

  // Get movies by category
  const getMoviesByCategory = useCallback((categoryName) => {
    return movies
      .filter(movie => movie?.type === "movie" &&
        movie?.category?.toLowerCase().split(',').map(c => c.trim()).includes(categoryName.toLowerCase()))
      .sort((a, b) => (parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0))
      .slice(0, 12);
  }, [movies]);

  // FIXED: Handle movie click with navigation guard
  const handleMovieClick = useCallback((movie) => {
    if (!movie || !movie.id || isNavigating.current) return;

    isNavigating.current = true;

    const parts = getMovieParts(movie);
    const movieToPlay = {
      ...movie,
      parts: parts,
      hasParts: parts.length > 0,
      videoUrl: movie.videoUrl || (parts.length > 0 ? parts[0]?.videoUrl : null),
      streamLink: movie.streamLink || (parts.length > 0 ? parts[0]?.streamLink || parts[0]?.videoUrl : null),
      download_link: movie.download_link || movie.download,
      download: movie.download
    };

    navigate(`/player/${movie.id}`, {
      state: { movie: movieToPlay }
    });

    // Reset navigation flag after a delay
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, [navigate, getMovieParts]);

  // FIXED: Handle series click (first episode)
  const handleSeriesClick = useCallback((series) => {
    if (!series || !series.id || isNavigating.current) return;

    isNavigating.current = true;

    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const targetEpisode = sortedEpisodes.length > 0 ? sortedEpisodes[0] : null;

    if (targetEpisode) {
      navigate(`/series-player/${series.id}`, {
        state: {
          series: series,
          episode: targetEpisode,
          episodes: sortedEpisodes,
          episodeIndex: 0
        }
      });
    } else {
      alert('No episodes available for this series yet.');
      isNavigating.current = false;
    }

    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  // FIXED: Handle series click with specific episode
  const handleSeriesClickWithEpisode = useCallback((series, episode) => {
    if (!series || !series.id || !episode || isNavigating.current) return;

    isNavigating.current = true;

    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const episodeIndex = sortedEpisodes.findIndex(ep => ep && ep.id === episode.id);

    navigate(`/series-player/${series.id}`, {
      state: {
        series: series,
        episode: episode,
        episodes: sortedEpisodes,
        episodeIndex: episodeIndex >= 0 ? episodeIndex : 0
      }
    });

    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  // FIXED: Handle updated series click
  const handleUpdatedSeriesClick = useCallback((series) => {
    if (!series || !series.id || isNavigating.current) return;

    isNavigating.current = true;

    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const latestEpisode = sortedEpisodes.length > 0 ? sortedEpisodes[sortedEpisodes.length - 1] : null;

    if (latestEpisode) {
      const episodeIndex = sortedEpisodes.findIndex(ep => ep && ep.id === latestEpisode.id);
      navigate(`/series-player/${series.id}`, {
        state: {
          series: series,
          episode: latestEpisode,
          episodes: sortedEpisodes,
          episodeIndex: episodeIndex
        }
      });
    } else {
      alert('No episodes available for this series yet.');
      isNavigating.current = false;
    }

    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  // FIXED: Handle hero play click with proper event handling for mobile
  const handleHeroPlayClick = useCallback((item, event) => {
    // CRITICAL: Prevent event propagation to avoid triggering parent click handlers
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // Prevent multiple clicks
    if (isNavigating.current) return;

    if (!item || !item.id) {
      console.warn('No valid hero item found', item);
      return;
    }

    console.log('Playing hero item:', item.title || item.id); // Debug log

    // Determine if it's a series with new episode or regular movie/series
    const isSeriesWithNew = item?.latestEpisode ? true : false;
    const isSeries = item?.type === "series";

    // Small delay to ensure all state is stable
    setTimeout(() => {
      if (isSeriesWithNew && item.latestEpisode) {
        handleSeriesClickWithEpisode(item, item.latestEpisode);
      } else if (isSeries) {
        handleSeriesClick(item);
      } else {
        handleMovieClick(item);
      }

      // Reset navigation flag after navigation attempt
      setTimeout(() => {
        isNavigating.current = false;
      }, 500);
    }, 50);
  }, [handleSeriesClickWithEpisode, handleSeriesClick, handleMovieClick]);

  // FIXED: Handle hero info click with proper event handling for mobile
  const handleHeroInfoClick = useCallback((item, event) => {
    // CRITICAL: Prevent event propagation to avoid triggering parent click handlers
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!item) {
      console.warn('No valid hero item found for info');
      return;
    }

    console.log('Info for hero item:', item.title || item.id); // Debug log

    setQuickViewMovie(item);
    setShowQuickView(true);
  }, []);

  // Get all categories for filter
  const allCategories = useMemo(() => {
    const categories = new Set(['all', 'featured']);
    movies.forEach(movie => {
      if (movie?.category) {
        movie.category.split(',').map(cat => cat.trim()).forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories);
  }, [movies]);

  const getCategoryIcon = (category) => {
    const style = getCategoryIconAndColor(category);
    return style.icon;
  };

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let filtered = movies.filter(movie => movie?.type === "movie");

    if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "featured") {
      filtered = filtered.filter(movie =>
        movie?.category?.toLowerCase().split(',').map(c => c.trim()).includes(selectedCategory.toLowerCase())
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
  }, [movies, selectedCategory, sortBy, sortOrder]);

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
  }, [selectedCategory, sortBy, sortOrder]);

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

  // Cleanup navigation flag on unmount
  useEffect(() => {
    return () => {
      isNavigating.current = false;
    };
  }, []);

  // Loading state
  if (loading) {
    return <CinematicLoading />;
  }

  // Don't show movies page content if there's a search query
  if (globalSearchQuery) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20">
      {/* Hero Slider Section - INTEGRATED HeroSlider Component with fixed handlers */}
      {heroContent.length > 0 && (
        <HeroSlider
          items={heroContent}
          onPlay={handleHeroPlayClick}
          onInfo={handleHeroInfoClick}
        />
      )}

      {/* Recently Updated Series Section */}
      {recentlyUpdatedSeries.length > 0 && (
        <section className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaPlayCircle className="text-purple-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Recently Updated Series</span>
              <span className="xs:hidden">Updated Series</span>
            </h2>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {recentlyUpdatedSeries.length}
            </span>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {recentlyUpdatedSeries.map(series => (
              <div
                key={series?.id}
                className="cursor-pointer group relative transform transition-transform duration-300 hover:scale-105"
              >
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                    <FaPlusCircle className="text-[10px]" />
                    S{series.latestEpisode.seasonNumber}:E{series.latestEpisode.episodeNumber}
                  </span>
                </div>
                <MovieCard movie={series} onSeriesClick={handleUpdatedSeriesClick} />
              </div>
            ))}
          </div>

          <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
            {recentlyUpdatedSeries.map(series => (
              <div
                key={series?.id}
                className="flex-none w-[130px] sm:w-[150px] relative transform transition-transform duration-300 active:scale-95"
              >
                <div className="absolute top-1 left-1 z-10">
                  <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[10px] rounded-full shadow-lg">
                    S{series.latestEpisode.seasonNumber}:E{series.latestEpisode.episodeNumber}
                  </span>
                </div>
                <MovieCard movie={series} onSeriesClick={handleUpdatedSeriesClick} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Uploads Section */}
      {latestUploads.length > 0 && (
        <section className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaUpload className="text-green-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Latest Updates</span>
              <span className="xs:hidden">Updates</span>
            </h2>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {latestUploads.length}
            </span>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {latestUploads.map(item => (
              <div
                key={item?.id}
                className="cursor-pointer group relative transform transition-transform duration-300 hover:scale-105"
              >
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  {item.uploadType === 'series' && item.latestEpisode ? (
                    <>
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                        <FaTv className="text-[10px]" />
                        New
                      </span>
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        S{item.latestEpisode.seasonNumber}:E{item.latestEpisode.episodeNumber}
                      </span>
                    </>
                  ) : (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                      <FaUpload className="text-[10px]" />
                      New
                    </span>
                  )}
                </div>
                <MovieCard
                  movie={item}
                  onSeriesClick={item.uploadType === 'series' ? handleUpdatedSeriesClick : undefined}
                />
              </div>
            ))}
          </div>

          <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
            {latestUploads.map(item => (
              <div
                key={item?.id}
                className="flex-none w-[130px] sm:w-[150px] relative transform transition-transform duration-300 active:scale-95"
              >
                <div className="absolute top-1 left-1 z-10">
                  {item.uploadType === 'series' ? (
                    <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[10px] rounded-full shadow-lg">
                      NEW
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] rounded-full shadow-lg">
                      NEW
                    </span>
                  )}
                </div>
                <MovieCard
                  movie={item}
                  onSeriesClick={item.uploadType === 'series' ? handleUpdatedSeriesClick : undefined}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Category Sections */}
      {dynamicCategories.map((category) => {
        const categoryMovies = getMoviesByCategory(category.id);
        if (categoryMovies.length === 0) return null;
        const { icon, color, bgColor, borderColor } = getCategoryIconAndColor(category.id);

        return (
          <section key={category.id} className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center border ${borderColor}`}>
                  {icon}
                </div>
                <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                  {category.name}
                </h2>
                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full ml-2">
                  {categoryMovies.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                View All <FaChevronRight className="text-[8px]" />
              </button>
            </div>

            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
              {categoryMovies.slice(0, 12).map(movie => (
                <div
                  key={movie?.id}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md`} />
                    <MovieCard movie={movie} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
              {categoryMovies.slice(0, 8).map(movie => (
                <div
                  key={movie?.id}
                  className="flex-none w-[130px] sm:w-[150px] transform transition-transform duration-300 active:scale-95"
                  onClick={() => handleMovieClick(movie)}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Featured Movies Section */}
      {selectedCategory === "all" && featuredMovies.length > 0 && (
        <section className="container mx-auto px-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaFire className="text-purple-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Featured Movies</span>
              <span className="xs:hidden">Featured</span>
            </h2>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {featuredMovies.slice(0, 12).map(movie => (
              <div
                key={movie?.id}
                className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
                onClick={() => handleMovieClick(movie)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
            {featuredMovies.slice(0, 8).map(movie => (
              <div
                key={movie?.id}
                className="flex-none w-[130px] sm:w-[150px] transform transition-transform duration-300 active:scale-95"
                onClick={() => handleMovieClick(movie)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gray-900/80 rounded-xl border border-gray-800 p-3 sm:p-4">
          <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs sm:text-sm"
            >
              <FaFilter className={showFilters ? 'text-purple-400' : ''} />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="year">Year</option>
              <option value="title">Title</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
            >
              {sortOrder === "desc" ? <FaSortAmountDown className="text-xs sm:text-sm" /> : <FaSortAmountUp className="text-xs sm:text-sm" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-300 mb-1 sm:mb-2">Categories</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs ${selectedCategory === "all" ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedCategory("featured")}
                      className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs flex items-center gap-1 ${selectedCategory === "featured" ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    >
                      <FaFire className="text-[6px] sm:text-xs" /> Featured
                    </button>
                    {dynamicCategories.map(cat => {
                      const { icon: catIcon } = getCategoryIconAndColor(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs flex items-center gap-1 ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                        >
                          {catIcon}
                          <span className="capitalize">{cat.name}</span>
                          <span className="ml-auto text-[10px] text-gray-500">{cat.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Movies Section */}
      <section className="container mx-auto px-4 pb-8 sm:pb-12">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <FaFilm className="text-white text-sm" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              All Movies
            </h2>
          </div>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 sm:px-3 py-1 rounded-full">
            {filteredMovies.length}
          </span>
        </div>

        <div className="flex gap-1.5 mb-4 sm:mb-5 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === "all"
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory("featured")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 whitespace-nowrap transition-all duration-300 ${selectedCategory === "featured"
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            <FaFire className="text-xs" /> Featured
          </button>
          {dynamicCategories.slice(0, 12).map(category => {
            const { icon: catIcon, color } = getCategoryIconAndColor(category.id);
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 whitespace-nowrap transition-all duration-300 ${selectedCategory === category.id
                  ? `bg-gradient-to-r ${color} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                {catIcon}
                <span className="capitalize">{category.name}</span>
              </button>
            );
          })}
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gray-900/30 rounded-xl">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎬</div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">No movies found</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              Try different category or filter
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {paginatedMovies.map(movie => (
                <div
                  key={movie?.id}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
                  onClick={() => handleMovieClick(movie)}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-gray-800 disabled:opacity-50 text-white flex items-center justify-center hover:bg-gray-700 transition-all duration-300"
                >
                  <FaChevronLeft className="text-xs sm:text-sm" />
                </button>
                <span className="text-xs sm:text-sm text-white bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-gray-800 disabled:opacity-50 text-white flex items-center justify-center hover:bg-gray-700 transition-all duration-300"
                >
                  <FaChevronRight className="text-xs sm:text-sm" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Quick View Modal */}
      {showQuickView && quickViewMovie && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="w-full md:max-w-2xl bg-gray-900 rounded-t-2xl md:rounded-2xl border border-gray-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-32 md:h-56">
              <img
                src={getOptimizedImageUrl(quickViewMovie?.background || quickViewMovie?.poster, true, window.innerWidth <= 768)}
                alt={quickViewMovie?.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  if (e.target.src !== quickViewMovie?.poster && quickViewMovie?.poster) {
                    e.target.src = quickViewMovie.poster;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              <button
                onClick={() => setShowQuickView(false)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300"
              >
                <FaTimes className="text-white text-xs sm:text-sm" />
              </button>

              {quickViewMovie.latestEpisode && (
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                    Latest
                  </span>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    S{quickViewMovie.latestEpisode.seasonNumber}:E{quickViewMovie.latestEpisode.episodeNumber}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-5">
              <h2 className="text-base sm:text-xl font-bold text-white mb-1">{quickViewMovie?.title}</h2>

              {quickViewMovie?.translator && (
                <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-lg mb-2 inline-block">
                  <FaLanguage className="text-xs" />
                  <span>Translator: {quickViewMovie.translator}</span>
                </div>
              )}

              {quickViewMovie.latestEpisode && (
                <h3 className="text-sm text-purple-400 mb-1 line-clamp-1">
                  {quickViewMovie.latestEpisode.title}
                </h3>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-400 mb-3">
                {quickViewMovie?.rating && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500 text-xs" /> {quickViewMovie.rating}
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
              <p className="text-xs text-gray-300 mb-3 line-clamp-2 sm:line-clamp-3">
                {quickViewMovie.latestEpisode?.description || quickViewMovie?.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (quickViewMovie.latestEpisode) {
                      handleSeriesClickWithEpisode(quickViewMovie, quickViewMovie.latestEpisode);
                    } else if (quickViewMovie.type === "series") {
                      handleUpdatedSeriesClick(quickViewMovie);
                    } else {
                      handleMovieClick(quickViewMovie);
                    }
                    setShowQuickView(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-1 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 active:scale-95"
                >
                  <FaPlay className="text-xs" /> {quickViewMovie.latestEpisode ? 'Watch Latest' : 'Watch'}
                </button>
                <button
                  onClick={() => setShowQuickView(false)}
                  className="flex-1 bg-gray-800 py-2 rounded-lg text-white text-sm font-semibold hover:bg-gray-700 transition-all duration-300"
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