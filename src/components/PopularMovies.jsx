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
  FaChevronDown
} from "react-icons/fa";

export default function Movies() {
  const { movies = [], loading = false } = useContext(MoviesContext);
  const location = useLocation();
  const navigate = useNavigate();

  // 1.2 Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';

  // Hero Slider State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Get movies with background images for hero slider (5 movies)
  const heroMovies = useMemo(() => {
    return movies
      .filter(movie => movie.background && movie.type === "movie")
      .slice(0, 5);
  }, [movies]);

  // 1.2 Update search query when URL changes and sync with URL
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
    if (!isAutoPlaying || heroMovies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroMovies.length]);

  const nextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroMovies.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
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

  // Filter and sort movies
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

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // 1.3 Clear search function
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
  `;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading movies...</p>
        </div>
      </div>
    );
  }

  const currentHeroMovie = heroMovies[currentHeroSlide] || {};

  return (
    <>
      {/* Add custom scrollbar styles */}
      <style>{scrollbarStyles}</style>

      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        {/* HERO SLIDER SECTION - Shows 5 movies with backgrounds */}
        {heroMovies.length > 0 && (
          <section className="relative h-[70vh] md:h-[80vh] overflow-hidden pt-28">
            {/* Background Images */}
            {heroMovies.map((movie, index) => (
              <div
                key={movie.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentHeroSlide ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <img
                  src={movie.background || movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
            ))}

            {/* Hero Content */}
            <div className="relative h-full container mx-auto px-4 md:px-6 flex items-end pb-20">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {currentHeroMovie.title}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  {currentHeroMovie.rating && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <FaStar /> {currentHeroMovie.rating}
                    </span>
                  )}
                  {currentHeroMovie.year && (
                    <span className="text-gray-300">
                      {currentHeroMovie.year}
                    </span>
                  )}
                  {currentHeroMovie.category && (
                    <span className="text-gray-300">
                      {currentHeroMovie.category.split(',')[0]}
                    </span>
                  )}
                  {currentHeroMovie.nation && (
                    <span className="text-gray-300">
                      {currentHeroMovie.nation}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-lg mb-8 line-clamp-3">
                  {currentHeroMovie.description || 'Watch this amazing movie now!'}
                </p>
                <div className="flex gap-4">
                  <button className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors">
                    <FaPlay /> Watch Now
                  </button>
                  <button className="px-8 py-3 bg-gray-800/70 hover:bg-gray-800 rounded-lg text-white font-semibold backdrop-blur-sm flex items-center gap-2">
                    <FaInfoCircle /> More Info
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {heroMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentHeroSlide(index);
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 10000);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentHeroSlide
                    ? 'bg-red-600 w-8'
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
                {/* 1.3 Clear search button */}
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
                {/* 1.4 Search result indicator */}
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

        {/* 1.4 Enhanced Search Result Indicator */}
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
                {/* 1.3 Clear search button in results section */}
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
              {/* 1.4 Enhanced search result indicator */}
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
              {/* 1.3 Clear search button in empty state */}
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