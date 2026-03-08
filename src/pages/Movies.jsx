import { useContext, useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MoviesContext } from "../context/MoviesContext";
import MovieCard from "../components/MovieCard";
import SimpleVideoModal from "../components/SimpleVideoModal";
import {
  FaPlay,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaFilm,
  FaTv,
  FaStar,
  FaFire
} from "react-icons/fa";

export default function Movies() {
  const { movies, loading } = useContext(MoviesContext);
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
  const [query, setQuery] = useState(urlSearchQuery);
  const [filterType, setFilterType] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  // Update query when URL changes
  useEffect(() => {
    setQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  // Update URL when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        navigate(`?search=${encodeURIComponent(query)}`, { replace: true });
      } else if (location.search) {
        navigate('', { replace: true });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, navigate, location.search]);

  // Get latest content for hero slider (mix of movies and series)
  const heroContent = useMemo(() => {
    const allContent = [...movies];

    // Filter content with valid data
    const contentWithBackgrounds = allContent
      .filter(item => item.poster && (item.type === "movie" || item.type === "series"))
      .sort((a, b) => {
        // Sort by latest (assuming created_at or id)
        const dateA = a.created_at || a.id || 0;
        const dateB = b.created_at || b.id || 0;
        return dateB > dateA ? 1 : -1;
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

  // Handle hero play button click - Navigate to player page
  const handleHeroPlayClick = () => {
    if (!currentHeroItem || !currentHeroItem.id) {
      console.error("No hero item selected");
      return;
    }

    // Process the movie data for the player
    const processedMovie = {
      ...currentHeroItem,
      videoUrl: currentHeroItem.videoUrl || currentHeroItem.streamLink || '',
      download_link: currentHeroItem.download_link || currentHeroItem.download || '',
      streamLink: currentHeroItem.streamLink || currentHeroItem.videoUrl || ''
    };

    // Navigate to player page with complete movie data
    navigate(`/player/${currentHeroItem.id}`, {
      state: {
        movie: processedMovie
      }
    });
  };

  // Handle hero info button click
  const handleHeroInfoClick = () => {
    if (!currentHeroItem) return;

    // You can implement a modal or navigate to details page
    // For now, open the simple modal with movie details
    handlePlayVideo(currentHeroItem);
  };

  // Handle video play from grid
  const handlePlayVideo = (movie) => {
    const streamUrl = movie.streamLink ||
      movie.videoUrl ||
      `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;

    setSelectedVideo({
      url: streamUrl,
      title: movie.title,
      description: movie.description || movie.overview || "No description available.",
      year: movie.year || movie.release_date?.split("-")[0] || "2024",
      rating: movie.rating || (movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"),
      type: movie.type || "movie",
      genre: movie.category || movie.genre || "General",
      duration: movie.duration || "2h",
      poster: movie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=300&fit=crop"
    });
    setModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  // Filter movies based on search query and type
  const filtered = useMemo(() => {
    let filtered = movies.filter((m) => {
      if (filterType === "movie" && m.type !== "movie") return false;
      if (filterType === "series" && m.type !== "series") return false;
      return m.title.toLowerCase().includes(query.toLowerCase());
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (new Date(b.created_at || 0) - new Date(a.created_at || 0));
        case "oldest":
          return (new Date(a.created_at || 0) - new Date(b.created_at || 0));
        case "title":
          return a.title.localeCompare(b.title);
        case "rating":
          return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [movies, query, filterType, sortBy]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalMovies = movies.filter(m => m.type === "movie").length;
    const totalSeries = movies.filter(m => m.type === "series").length;
    const totalActive = movies.filter(m => m.status === "active" || !m.status).length;
    const totalWithVideo = movies.filter(m => m.streamLink || m.videoUrl).length;

    return {
      movies: totalMovies,
      series: totalSeries,
      active: totalActive,
      withVideo: totalWithVideo
    };
  }, [movies]);

  // Clear search
  const handleClearSearch = () => {
    setQuery("");
    navigate('', { replace: true });
  };

  if (loading) {
    return (
      <main className="bg-black min-h-screen pt-28 px-6 text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Loading movies...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="bg-black min-h-screen text-white">
        {/* HERO SLIDER SECTION */}
        {filteredHeroContent.length > 0 && (
          <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
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
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=900&fit=crop";
                  }}
                />
                {/* Gradient overlays for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-black to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-black to-transparent" />
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
                    🆕 LATEST
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {currentHeroItem.title}
                </h1>

                <div className="flex items-center gap-4 mb-6 flex-wrap">
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
                  {currentHeroItem.type === "series" && currentHeroItem.totalSeasons && (
                    <span className="text-blue-400">
                      {currentHeroItem.totalSeasons} Season{currentHeroItem.totalSeasons !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <p className="text-gray-300 text-lg mb-8 line-clamp-3">
                  {currentHeroItem.description || `Watch this amazing ${currentHeroItem.type === "series" ? 'series' : 'movie'} now!`}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={handleHeroPlayClick}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FaPlay /> {currentHeroItem.type === "series" ? "Watch Episode 1" : "Watch Now"}
                  </button>
                  <button
                    onClick={handleHeroInfoClick}
                    className="px-8 py-3 bg-gray-800/70 hover:bg-gray-800 rounded-lg text-white font-semibold backdrop-blur-sm flex items-center gap-2 transition-colors"
                  >
                    <FaInfoCircle /> More Info
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Navigation Dots */}
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

        {/* Main Content Container */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">All Content</h1>
                <p className="text-gray-400">{filtered.length} items found</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-4 py-2 rounded-lg transition-all ${filterType === "all" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType("movie")}
                    className={`px-4 py-2 rounded-lg transition-all ${filterType === "movie" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                  >
                    Movies
                  </button>
                  <button
                    onClick={() => setFilterType("series")}
                    className={`px-4 py-2 rounded-lg transition-all ${filterType === "series" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                  >
                    Series
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 md:w-64">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies and series..."
                    className="w-full p-3 pl-10 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                  <svg
                    className="w-5 h-5 text-gray-500 absolute left-3 top-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {query && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-gray-400">Sort by:</span>
              <select
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">A-Z</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            {/* Search Result Info */}
            {query && (
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mb-4">
                <p className="text-blue-400">
                  Found {filtered.length} results for "{query}"
                </p>
              </div>
            )}
          </div>

          {/* Movies Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-24 h-24 text-gray-700 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-semibold mb-2">No content found</h3>
              <p className="text-gray-400 mb-6">Try changing your search or filter criteria</p>
              <button
                onClick={() => { setQuery(""); setFilterType("all"); }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filtered.map((movie) => (
                <div
                  key={movie.id}
                  className="cursor-pointer transform transition-transform hover:scale-[1.02]"
                  onClick={() => handlePlayVideo(movie)}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          )}

          {/* Stats Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl border border-red-800/30">
                <div className="text-3xl font-bold text-red-500 mb-2">{stats.movies}</div>
                <div className="text-gray-400">Movies</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl border border-purple-800/30">
                <div className="text-3xl font-bold text-purple-500 mb-2">{stats.series}</div>
                <div className="text-gray-400">TV Series</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl border border-blue-800/30">
                <div className="text-3xl font-bold text-blue-500 mb-2">{stats.active}</div>
                <div className="text-gray-400">Active</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl border border-green-800/30">
                <div className="text-3xl font-bold text-green-500 mb-2">{stats.withVideo}</div>
                <div className="text-gray-400">With Video</div>
              </div>
            </div>

            {/* Source Info */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Showing {filtered.length} of {movies.length} items from all sources
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Video Modal */}
      <SimpleVideoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        videoUrl={selectedVideo?.url}
        title={selectedVideo?.title}
        description={selectedVideo?.description}
        year={selectedVideo?.year}
        rating={selectedVideo?.rating}
        type={selectedVideo?.type}
        genre={selectedVideo?.genre}
        duration={selectedVideo?.duration}
        poster={selectedVideo?.poster}
      />
    </>
  );
}