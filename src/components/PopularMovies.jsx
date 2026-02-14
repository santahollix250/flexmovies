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
  FaClock
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
  const [heroContentType, setHeroContentType] = useState("all");
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [showMobileHeroMenu, setShowMobileHeroMenu] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
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
  const itemsPerPage = 24;

  // Get hero content
  const heroContent = useMemo(() => {
    const allContent = [...movies];
    const contentWithBackgrounds = allContent
      .filter(item => item?.background && (item?.type === "movie" || item?.type === "series"))
      .sort((a, b) => {
        const dateA = a?.uploadedDate || a?.id || 0;
        const dateB = b?.uploadedDate || b?.id || 0;
        return dateB - dateA;
      });
    return contentWithBackgrounds.slice(0, 8);
  }, [movies]);

  // Filter hero content
  const filteredHeroContent = useMemo(() => {
    if (heroContentType === "all") return heroContent;
    if (heroContentType === "movies") return heroContent.filter(item => item?.type === "movie");
    return heroContent.filter(item => item?.type === "series");
  }, [heroContent, heroContentType]);

  const currentHeroItem = filteredHeroContent[currentHeroSlide] || {};

  // Handle hero play
  const handleHeroPlayClick = () => {
    if (!currentHeroItem || !currentHeroItem.id) return;
    navigate(`/player/${currentHeroItem.id}`, {
      state: { movie: currentHeroItem }
    });
  };

  // Handle hero info
  const handleHeroInfoClick = () => {
    if (!currentHeroItem) return;
    setQuickViewMovie(currentHeroItem);
    setShowQuickView(true);
    setIsAutoPlaying(false);
  };

  // Update search query from URL
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
    setCurrentPage(1);
  }, [urlSearchQuery]);

  // Update URL when search changes
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

  // Auto slide
  useEffect(() => {
    if (!isAutoPlaying || filteredHeroContent.length === 0 || isHoveringHero) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % filteredHeroContent.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredHeroContent.length, isHoveringHero]);

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

    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie?.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [movies, searchQuery, selectedCategory, sortBy, sortOrder]);

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

  // Latest series - UPDATED to show 10 series for 5 columns
  const latestSeries = useMemo(() => {
    return movies
      .filter(item => item?.type === "series")
      .sort((a, b) => (b?.id || 0) - (a?.id || 0))
      .slice(0, 10); // Showing 10 series for 2 rows of 5 columns
  }, [movies]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    navigate('', { replace: true });
  };

  // Toggle like
  const toggleLike = (movieId, e) => {
    e?.stopPropagation();
    setLikedMovies(prev =>
      prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
    );
  };

  // Handle quick view
  const handleQuickView = (movie, e) => {
    e?.stopPropagation();
    setQuickViewMovie(movie);
    setShowQuickView(true);
  };

  // Handle movie click
  const handleMovieClick = (movie) => {
    navigate(`/player/${movie?.id}`, { state: { movie } });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-white mt-4">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* HERO SLIDER SECTION */}
      {filteredHeroContent.length > 0 && (
        <section
          className="relative h-[70vh] md:h-[85vh] overflow-hidden"
          onMouseEnter={() => setIsHoveringHero(true)}
          onMouseLeave={() => setIsHoveringHero(false)}
        >
          {/* Background Images */}
          {filteredHeroContent.map((item, index) => (
            <div
              key={item?.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <img
                src={item?.background || item?.poster}
                alt={item?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </div>
          ))}

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-16 z-20 bg-gradient-to-t from-black via-black/50 to-transparent">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${currentHeroItem?.type === "series"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : "bg-gradient-to-r from-red-600 to-orange-600"
                  }`}>
                  {currentHeroItem?.type === "series" ? <FaTv className="inline mr-1" /> : <FaPlay className="inline mr-1" />}
                  {currentHeroItem?.type === "series" ? 'SERIES' : 'MOVIE'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {currentHeroItem?.title}
              </h1>

              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                {currentHeroItem?.rating && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-lg">
                    <FaStar /> {currentHeroItem.rating}
                  </span>
                )}
                {currentHeroItem?.year && (
                  <span className="flex items-center gap-1 text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded-lg">
                    <FaCalendarAlt /> {currentHeroItem.year}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-300 mb-4 line-clamp-2 max-w-2xl">
                {currentHeroItem?.description || 'Experience this amazing content.'}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleHeroPlayClick}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-white text-sm font-semibold flex items-center gap-2"
                >
                  <FaPlay /> Play
                </button>
                <button
                  onClick={handleHeroInfoClick}
                  className="px-4 py-2 bg-gray-800/70 rounded-lg text-white text-sm font-semibold flex items-center gap-2"
                >
                  <FaInfoCircle /> Info
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
            {filteredHeroContent.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentHeroSlide(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className={`transition-all duration-300 ${index === currentHeroSlide ? 'w-6 h-1.5' : 'w-1.5 h-1.5'
                  }`}
              >
                <span className={`block w-full h-full rounded-full ${index === currentHeroSlide ? 'bg-red-600' : 'bg-gray-600'
                  }`} />
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevHeroSlide}
            className="hidden sm:block absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 rounded-full text-white z-20"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextHeroSlide}
            className="hidden sm:block absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 rounded-full text-white z-20"
          >
            <FaChevronRight />
          </button>
        </section>
      )}

      {/* Latest Series Section - UPDATED TO 5 COLUMNS */}
      {latestSeries.length > 0 && heroContentType !== "series" && !searchQuery && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaTv className="text-purple-500" />
              Latest Series
              <span className="text-xs text-purple-400 ml-2 bg-purple-900/30 px-2 py-0.5 rounded-full">
                NEW
              </span>
            </h2>
          </div>

          {/* Desktop Grid - 5 COLUMNS */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {latestSeries.slice(0, 10).map(series => (
              <div
                key={series?.id}
                className="cursor-pointer"
                onClick={() => handleMovieClick(series)}
              >
                <MovieCard movie={series} />
              </div>
            ))}
          </div>

          {/* Mobile Scroll */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
            {latestSeries.slice(0, 8).map(series => (
              <div
                key={series?.id}
                className="flex-none w-[120px]"
                onClick={() => handleMovieClick(series)}
              >
                <MovieCard movie={series} />
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search movies..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
              {searchQuery && (
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
      {searchQuery && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-blue-900/20 rounded-lg border border-blue-800/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaSearch className="text-blue-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Results for: <span className="text-blue-400">"{searchQuery}"</span>
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

      {/* Featured Movies Section - 6 COLUMNS */}
      {selectedCategory === "all" && featuredMovies.length > 0 && !searchQuery && (
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

          {/* Desktop Grid - 6 COLUMNS */}
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

          {/* Mobile Scroll */}
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
            {searchQuery ? "Search Results" :
              selectedCategory === "all" ? "All Movies" :
                selectedCategory === "featured" ? "Featured Movies" :
                  `${selectedCategory} Movies`}
          </h2>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
            {filteredMovies.length}
          </span>
        </div>

        {/* Category Chips */}
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

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 rounded-lg">
            <div className="text-4xl mb-2">🎬</div>
            <h3 className="text-base font-bold text-white mb-1">No movies found</h3>
            <p className="text-xs text-gray-400 mb-3">
              {searchQuery ? `No matches for "${searchQuery}"` : "No movies available"}
            </p>
            {searchQuery && (
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
            {/* Movie Grid - USING MovieCard */}
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
            </div>
            <div className="p-4">
              <h2 className="text-lg font-bold text-white mb-1">{quickViewMovie?.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                {quickViewMovie?.rating && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" /> {quickViewMovie.rating}
                  </span>
                )}
                {quickViewMovie?.year && <span>{quickViewMovie.year}</span>}
              </div>
              <p className="text-xs text-gray-300 mb-3 line-clamp-3">
                {quickViewMovie?.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleMovieClick(quickViewMovie);
                    setShowQuickView(false);
                  }}
                  className="flex-1 bg-red-600 py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <FaPlay /> Watch Now
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