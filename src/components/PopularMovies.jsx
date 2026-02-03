import { useContext, useMemo, useState, useEffect } from "react";
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
  FaTv
} from "react-icons/fa";

export default function Movies() {
  const { movies = [], loading = false } = useContext(MoviesContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';

  // Hero Slider State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [heroContentType, setHeroContentType] = useState("all"); // "all", "movies", "series"

  // Filter State
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Get latest movies AND series for hero slider (mixed content)
  const heroContent = useMemo(() => {
    const allContent = [...movies]; // Get all movies and series

    // Filter content with backgrounds
    const contentWithBackgrounds = allContent
      .filter(item => item.background && (item.type === "movie" || item.type === "series"))
      .sort((a, b) => {
        // Sort by latest upload (assuming there's an uploadedDate or id field)
        const dateA = a.uploadedDate || a.id || 0;
        const dateB = b.uploadedDate || b.id || 0;
        return dateB - dateA;
      });

    // Take latest 8 items for hero slider
    return contentWithBackgrounds.slice(0, 8);
  }, [movies]);

  // Filter hero content based on selected type
  const filteredHeroContent = useMemo(() => {
    if (heroContentType === "all") {
      return heroContent;
    } else if (heroContentType === "movies") {
      return heroContent.filter(item => item.type === "movie");
    } else {
      return heroContent.filter(item => item.type === "series");
    }
  }, [heroContent, heroContentType]);

  const currentHeroItem = filteredHeroContent[currentHeroSlide] || {};

  // Update search query when URL changes and sync with URL
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
    setCurrentPage(1);
  }, [urlSearchQuery]);

  // Update URL when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        navigate(`?search=${encodeURIComponent(searchQuery)}`, { replace: true });
      } else if (location.search) {
        navigate('', { replace: true });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, navigate, location.search]);

  // Auto slide for hero
  useEffect(() => {
    if (!isAutoPlaying || filteredHeroContent.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % filteredHeroContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredHeroContent.length]);

  const nextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % filteredHeroContent.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + filteredHeroContent.length) % filteredHeroContent.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Get unique categories from movies
  const allCategories = useMemo(() => {
    const categories = new Set(['all', 'featured']);
    movies.forEach(movie => {
      if (movie.category) {
        const cats = movie.category.split(',').map(cat => cat.trim());
        cats.forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories);
  }, [movies]);

  // Filter and sort movies (for main grid)
  const filteredMovies = useMemo(() => {
    let filtered = movies.filter(movie => movie.type === "movie");

    // Search
    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (movie.category && movie.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "featured") {
      filtered = filtered.filter(movie =>
        movie.category && movie.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Featured filter
    if (selectedCategory === "featured") {
      filtered = filtered.filter(movie => movie.background);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        case "newest":
          return (b.id || 0) - (a.id || 0);
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "popular":
        default:
          const ratingDiff = (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (b.id || 0) - (a.id || 0);
      }
    });

    return filtered;
  }, [movies, searchQuery, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMovies, currentPage, itemsPerPage]);

  // Featured movies (for featured section)
  const featuredMovies = useMemo(() => {
    return movies
      .filter(movie => movie.type === "movie" && movie.background)
      .slice(0, 10);
  }, [movies]);

  // Latest series (for a separate section)
  const latestSeries = useMemo(() => {
    return movies
      .filter(item => item.type === "series")
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 12);
  }, [movies]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Clear search function
  const handleClearSearch = () => {
    setSearchQuery("");
    navigate('', { replace: true });
  };

  // Custom scrollbar styles
  const scrollbarStyles = `
      /* Custom scrollbar for the entire page */
      ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(31, 41, 55, 0.5);
        border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #dc2626, #7c3aed, #2563eb);
        border-radius: 10px;
        border: 2px solid rgba(17, 24, 39, 0.8);
        transition: all 0.3s ease;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #ef4444, #8b5cf6, #3b82f6);
        transform: scale(1.05);
      }

      ::-webkit-scrollbar-corner {
        background: rgba(17, 24, 39, 0.8);
      }

      /* For Firefox */
      * {
        scrollbar-width: thin;
        scrollbar-color: #dc2626 rgba(31, 41, 55, 0.5);
      }

      /* For dropdowns and other scrollable containers */
      .scrollable-container::-webkit-scrollbar {
        width: 8px;
      }

      .scrollable-container::-webkit-scrollbar-track {
        background: rgba(31, 41, 55, 0.3);
        border-radius: 4px;
      }

      .scrollable-container::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #dc2626, #7c3aed);
        border-radius: 4px;
      }

      /* Smooth scrolling for the whole page */
      html {
        scroll-behavior: smooth;
      }

      /* Scrollbar for code blocks or specific areas */
      pre::-webkit-scrollbar {
        height: 8px;
      }

      pre::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, #dc2626, #7c3aed);
      }

      /* Custom scrollbar animations */
      @keyframes scrollbarGlow {
        0%, 100% {
          box-shadow: 0 0 5px #dc2626;
        }
        50% {
          box-shadow: 0 0 15px #7c3aed, 0 0 20px #2563eb;
        }
      }

      ::-webkit-scrollbar-thumb:active {
        animation: scrollbarGlow 1.5s infinite;
      }

      /* Loading Animation Styles */
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }

      @keyframes pulse-glow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }

      @keyframes rotate3d {
        0% { transform: rotateY(0deg) rotateX(0deg); }
        100% { transform: rotateY(360deg) rotateX(360deg); }
      }

      @keyframes particle-float {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        50% { transform: translate(var(--tx, 20px), var(--ty, -20px)) scale(1.2); opacity: 1; }
      }

      .animate-float {
        animation: float 3s ease-in-out infinite;
      }

      .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }

      .animate-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        background-size: 1000px 100%;
        animation: shimmer 2s infinite;
      }

      .animate-rotate3d {
        animation: rotate3d 20s linear infinite;
      }
    `;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-28 overflow-hidden">
        <style>{scrollbarStyles}</style>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#8b5cf6' : '#3b82f6',
                animation: `particle-float ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                '--tx': `${(Math.random() - 0.5) * 40}px`,
                '--ty': `${(Math.random() - 0.5) * 40}px`
              }}
            />
          ))}

          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-red-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
          {/* Main Logo Container */}
          <div className="relative mb-12">
            {/* Outer Glow Ring */}
            <div className="absolute -inset-8 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>

            {/* Rotating 3D Ring */}
            <div className="absolute -inset-6 border-4 border-transparent border-t-red-500 border-r-purple-500 border-b-blue-500 border-l-pink-500 rounded-full animate-rotate3d"></div>

            {/* Middle Ring */}
            <div className="absolute -inset-4 border-2 border-red-400/30 rounded-full animate-spin"></div>

            {/* Logo Image Container */}
            <div className="relative">
              {/* Logo Shimmer Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer rounded-3xl"></div>

              {/* Your Logo - Replace with your actual logo */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-gray-800/50 shadow-2xl animate-float">
                {/* If you have a logo image, replace this div with an img tag */}
                {/* <img src="/your-logo.png" alt="Logo" className="w-40 h-40 object-contain" /> */}

                {/* Placeholder Logo Design */}
                <div className="text-center">
                  <div className="mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                      CINEMA
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">HUB</h2>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-pink-500"></div>
              </div>

              {/* Floating Icons Around Logo */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-500/30 animate-float">
                <FaFilm className="text-red-400 text-lg" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-500/30 animate-float" style={{ animationDelay: '0.5s' }}>
                <FaTv className="text-purple-400 text-lg" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-500/30 animate-float" style={{ animationDelay: '1s' }}>
                <FaStar className="text-blue-400 text-lg" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-pink-500/30 animate-float" style={{ animationDelay: '1.5s' }}>
                <FaPlay className="text-pink-400 text-lg" />
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="text-center max-w-2xl">
            {/* Animated Text */}
            <div className="relative mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Loading Your Cinema Universe
                </span>
              </h2>

              {/* Glitch Effect Text */}
              <div className="h-6 overflow-hidden">
                <div className="animate-slide-up">
                  <p className="text-gray-300">Fetching latest movies...</p>
                  <p className="text-gray-300">Loading TV series...</p>
                  <p className="text-gray-300">Preparing trailers...</p>
                  <p className="text-gray-300">Optimizing streams...</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-8">
              <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-full animate-progress"
                  style={{
                    animation: 'progress 2s ease-in-out infinite'
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0%</span>
                <span className="animate-pulse">Loading...</span>
                <span>100%</span>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
                <div className="text-2xl font-bold text-red-400 animate-pulse">∞</div>
                <div className="text-sm text-gray-400">Movies</div>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
                <div className="text-2xl font-bold text-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }}>∞</div>
                <div className="text-sm text-gray-400">Series</div>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
                <div className="text-2xl font-bold text-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}>∞</div>
                <div className="text-sm text-gray-400">Episodes</div>
              </div>
            </div>

            {/* Loading Message */}
            <p className="text-gray-500 text-sm italic">
              "Good things come to those who wait... especially when it's entertainment!"
            </p>
          </div>

          {/* Additional Styles for Loading Animation */}
          <style>{`
              @keyframes slide-up {
                0%, 25% { transform: translateY(0); }
                26%, 50% { transform: translateY(-25%); }
                51%, 75% { transform: translateY(-50%); }
                76%, 100% { transform: translateY(-75%); }
              }

              @keyframes progress {
                0% { width: 0%; opacity: 0.5; }
                50% { width: 70%; opacity: 1; }
                100% { width: 100%; opacity: 0.5; }
              }

              .animate-slide-up {
                animation: slide-up 8s infinite;
              }

              .animate-progress {
                animation: progress 2s ease-in-out infinite;
              }
            `}</style>
        </div>

        {/* Bottom Wave Animation */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              className="fill-gradient-to-r from-red-500/20 to-blue-500/20 animate-pulse"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              className="fill-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"
              style={{ animationDelay: '0.5s' }}
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-gradient-to-r from-blue-500/20 to-cyan-500/20 animate-pulse"
              style={{ animationDelay: '1s' }}
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>

      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        {/* HERO SLIDER SECTION - Shows latest movies AND series */}
        {filteredHeroContent.length > 0 && (
          <section className="relative h-[70vh] md:h-[80vh] overflow-hidden pt-28">
            {/* Background Images */}
            {filteredHeroContent.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentHeroSlide ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <img
                  src={item.background || item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
            ))}

            {/* Hero Content */}
            <div className="relative h-full container mx-auto px-4 md:px-6 flex items-end pb-20">
              <div className="max-w-3xl">
                {/* Content Type Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${currentHeroItem.type === "series"
                    ? "bg-purple-600 text-white"
                    : "bg-red-600 text-white"
                    }`}>
                    {currentHeroItem.type === "series" ? (
                      <>
                        <FaTv /> SERIES
                      </>
                    ) : (
                      <>
                        <FaFilm /> MOVIE
                      </>
                    )}
                  </span>
                  <span className="text-sm text-yellow-400 px-2 py-1 bg-yellow-900/30 rounded-lg">
                    🆕 LATEST UPLOAD
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {currentHeroItem.title}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  {currentHeroItem.rating && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <FaStar /> {currentHeroItem.rating}
                    </span>
                  )}
                  {currentHeroItem.year && (
                    <span className="text-gray-300">
                      {currentHeroItem.year}
                    </span>
                  )}
                  {currentHeroItem.category && (
                    <span className="text-gray-300">
                      {currentHeroItem.category.split(',')[0]}
                    </span>
                  )}
                  {currentHeroItem.nation && (
                    <span className="text-gray-300">
                      {currentHeroItem.nation}
                    </span>
                  )}
                  {currentHeroItem.type === "series" && currentHeroItem.seasons && (
                    <span className="text-blue-400">
                      {currentHeroItem.seasons} Season{currentHeroItem.seasons !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-lg mb-8 line-clamp-3">
                  {currentHeroItem.description || `Watch this amazing ${currentHeroItem.type === "series" ? 'series' : 'movie'} now!`}
                </p>
                <div className="flex gap-4">
                  <button className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors">
                    <FaPlay /> {currentHeroItem.type === "series" ? "Watch Episode 1" : "Watch Now"}
                  </button>
                  <button className="px-8 py-3 bg-gray-800/70 hover:bg-gray-800 rounded-lg text-white font-semibold backdrop-blur-sm flex items-center gap-2">
                    <FaInfoCircle /> More Info
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Content Type Selector */}
            <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex gap-2 bg-black/60 backdrop-blur-lg rounded-full p-1 border border-gray-800">
                <button
                  onClick={() => {
                    setHeroContentType("all");
                    setCurrentHeroSlide(0);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${heroContentType === "all"
                    ? "bg-gradient-to-r from-red-600 to-purple-600 text-white"
                    : "text-gray-300 hover:text-white"
                    }`}
                >
                  <span className="text-xs">🎬</span> All Latest
                </button>
                <button
                  onClick={() => {
                    setHeroContentType("movies");
                    setCurrentHeroSlide(0);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${heroContentType === "movies"
                    ? "bg-red-600 text-white"
                    : "text-gray-300 hover:text-white"
                    }`}
                >
                  <FaFilm /> Movies
                </button>
                <button
                  onClick={() => {
                    setHeroContentType("series");
                    setCurrentHeroSlide(0);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${heroContentType === "series"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white"
                    }`}
                >
                  <FaTv /> Series
                </button>
              </div>
            </div>

            {/* Hero Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {filteredHeroContent.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentHeroSlide(index);
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 10000);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentHeroSlide
                    ? heroContentType === "movies"
                      ? 'bg-red-600 w-8'
                      : heroContentType === "series"
                        ? 'bg-purple-600 w-8'
                        : 'bg-gradient-to-r from-red-600 to-purple-600 w-8'
                    : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                />
              ))}
            </div>

            {/* Hero Arrows */}
            <button
              onClick={prevHeroSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <button
              onClick={nextHeroSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <FaChevronRight className="text-xl" />
            </button>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <FaChevronDown className="text-white text-2xl" />
            </div>
          </section>
        )}

        {/* Latest Series Section (if not in hero) */}
        {latestSeries.length > 0 && heroContentType !== "series" && !searchQuery && (
          <section className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaTv className="text-purple-500" />
                Latest Series
                <span className="text-sm text-purple-400 ml-2 bg-purple-900/30 px-2 py-1 rounded">
                  NEW
                </span>
              </h2>
              <button
                onClick={() => setHeroContentType("series")}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                View all in hero <FaChevronRight className="text-xs" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {latestSeries.slice(0, 6).map(series => (
                <div key={series.id} className="group relative">
                  <MovieCard movie={series} />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                      Series
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filter Bar */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies by title, description, or category..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
                {searchQuery && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 hidden md:inline">
                        {filteredMovies.length} results
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Button (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                <FaFilter />
                Filters
              </button>

              {/* Sort Select (Desktop) */}
              <div className="hidden md:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="popular">🔥 Popular</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="newest">🆕 Newest First</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                </select>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                    >
                      <option value="popular">Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                      <option value="az">A → Z</option>
                      <option value="za">Z → A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="featured">🔥 Featured</option>
                      {allCategories
                        .filter(cat => cat !== 'all' && cat !== 'featured')
                        .map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Search Result Indicator */}
        {searchQuery && (
          <div className="container mx-auto px-4 md:px-6 mb-6">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl border border-blue-800/30 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaSearch className="text-blue-400" />
                    Search Results for: "{searchQuery}"
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Found {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
                    {selectedCategory !== "all" && ` in ${selectedCategory}`}
                  </p>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="mt-3 md:mt-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
                >
                  <FaTimes /> Clear Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Movies Section */}
        {selectedCategory === "all" && featuredMovies.length > 0 && !searchQuery && (
          <section className="container mx-auto px-4 md:px-6 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaFire className="text-red-500" />
                Featured Movies
              </h2>
              <span className="text-sm text-gray-400">
                {featuredMovies.length} movies
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featuredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Main Movies Grid */}
        <section className="container mx-auto px-4 md:px-6 pb-16">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {searchQuery ? "Search Results" :
                  selectedCategory === "all" ? "All Movies" :
                    selectedCategory === "featured" ? "Featured Movies" :
                      `${selectedCategory} Movies`}
              </h2>
              <p className="text-gray-400">
                {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "all" && !searchQuery && ` in ${selectedCategory}`}
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-sm transition-all ${selectedCategory === "all"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory("featured")}
                className={`px-3 py-1 rounded-full text-sm transition-all flex items-center gap-1 ${selectedCategory === "featured"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                <FaFire className="text-xs" /> Featured
              </button>
              {allCategories
                .filter(cat => cat !== 'all' && cat !== 'featured')
                .slice(0, 6)
                .map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-all capitalize ${selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    {category}
                  </button>
                ))}
            </div>
          </div>

          {/* Movies Grid */}
          {filteredMovies.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchQuery
                  ? `No movies match "${searchQuery}". Try a different search term.`
                  : "No movies available in this category."}
              </p>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <FaTimes /> Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {paginatedMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-gray-400 text-sm">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMovies.length)} of {filteredMovies.length} movies
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronLeft className="text-white" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronRight className="text-white" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}