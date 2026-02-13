import { useState, useMemo } from "react";
import { useContext } from "react";
import { MoviesContext } from "../context/MoviesContext";
import {
  FaSearch, FaFilter, FaStar, FaPlay, FaHeart,
  FaBookmark, FaShareAlt, FaCalendarAlt, FaClock,
  FaList, FaTv, FaUsers, FaFire, FaCrown, FaChevronRight,
  FaGlobe, FaEye, FaChevronDown, FaTimes, FaCheck,
  FaRegHeart, FaRegBookmark, FaExpand, FaVolumeUp,
  FaClosedCaptioning, FaDownload, FaRandom
} from "react-icons/fa";
import { GiPopcorn } from "react-icons/gi";

export default function Series() {
  const { movies, episodes = [], getEpisodesBySeries } = useContext(MoviesContext);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(12);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [playingEpisode, setPlayingEpisode] = useState(null);
  const [showSeriesDetails, setShowSeriesDetails] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Filter only series from movies
  const allSeries = useMemo(() => {
    return movies.filter(m => m.type === "series");
  }, [movies]);

  // Get episodes for a specific series
  const getEpisodesForSeries = useMemo(() => (seriesId) => {
    if (typeof getEpisodesBySeries === 'function') {
      return getEpisodesBySeries(seriesId);
    }
    return episodes.filter(ep =>
      ep.seriesId === seriesId ||
      ep.movieId === seriesId ||
      ep.series_id === seriesId ||
      (ep.series && ep.series.id === seriesId)
    );
  }, [episodes, getEpisodesBySeries]);

  // Get unique categories
  const categories = useMemo(() => {
    const set = new Set();
    allSeries.forEach((s) => {
      if (s.category) {
        const cats = s.category.split(',').map(cat => cat.trim());
        cats.forEach(cat => set.add(cat));
      }
    });
    return ["all", ...Array.from(set)].sort();
  }, [allSeries]);

  // Calculate popularity
  const calculatePopularity = (series) => {
    const episodeCount = getEpisodesForSeries(series.id).length;
    const rating = parseFloat(series.rating) || 5;
    return episodeCount * 10 + rating * 20;
  };

  // Sort series
  const sortedSeries = useMemo(() => {
    const series = [...allSeries];
    switch (sortBy) {
      case "popular":
        return series.sort((a, b) => calculatePopularity(b) - calculatePopularity(a));
      case "rating":
        return series.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
      case "newest":
        return series.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      case "episodes":
        return series.sort((a, b) => getEpisodesForSeries(b.id).length - getEpisodesForSeries(a.id).length);
      case "title":
        return series.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return series;
    }
  }, [allSeries, sortBy, getEpisodesForSeries]);

  // Filter series
  const filteredSeries = useMemo(() => {
    let filtered = sortedSeries.filter((s) => {
      if (category === "all") return true;
      if (!s.category) return false;
      return s.category.split(',').map(cat => cat.trim()).includes(category);
    });

    if (query) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(query.toLowerCase()) ||
        (s.category || "").toLowerCase().includes(query.toLowerCase())
      );
    }

    if (activeTab === "trending") {
      filtered = filtered.filter(s => calculatePopularity(s) > 100);
    } else if (activeTab === "new") {
      filtered = filtered.filter(s => {
        const date = new Date(s.created_at || 0);
        const now = new Date();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays < 30;
      });
    }

    return filtered;
  }, [sortedSeries, category, query, activeTab]);

  // Sort episodes
  const sortEpisodes = (episodesArray) => {
    if (!episodesArray || !Array.isArray(episodesArray)) return [];
    return [...episodesArray].sort((a, b) => {
      const seasonA = parseInt(a.seasonNumber) || 1;
      const seasonB = parseInt(b.seasonNumber) || 1;
      const episodeA = parseInt(a.episodeNumber) || 1;
      const episodeB = parseInt(b.episodeNumber) || 1;
      if (seasonA !== seasonB) return seasonA - seasonB;
      return episodeA - episodeB;
    });
  };

  // Get seasons
  const getSeasons = (episodesArray) => {
    const seasons = new Set();
    episodesArray.forEach(ep => {
      seasons.add(parseInt(ep.seasonNumber) || 1);
    });
    return Array.from(seasons).sort((a, b) => a - b);
  };

  // Handle series click
  const handleSeriesClick = async (series) => {
    setLoadingEpisodes(true);
    setSelectedSeries(series);
    setShowSeriesDetails(true);
    setTimeout(() => setLoadingEpisodes(false), 500);
  };

  // Toggle favorite
  const toggleFavorite = (seriesId) => {
    setFavorites(prev =>
      prev.includes(seriesId)
        ? prev.filter(id => id !== seriesId)
        : [...prev, seriesId]
    );
  };

  // Toggle watchlist
  const toggleWatchlist = (seriesId) => {
    setWatchlist(prev =>
      prev.includes(seriesId)
        ? prev.filter(id => id !== seriesId)
        : [...prev, seriesId]
    );
  };

  // Get rating stars
  const getRatingStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const normalizedRating = Math.min(numRating / 2, 5);
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-sm ${i < fullStars ? 'text-yellow-500' : hasHalfStar && i === fullStars ? 'text-yellow-500' : 'text-gray-700'}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-300">
          {normalizedRating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Featured series (highest rated)
  const featuredSeries = useMemo(() => {
    return [...allSeries]
      .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
      .slice(0, 3);
  }, [allSeries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Featured Banner */}
        <div className="mb-12">
          <div className="relative h-96 rounded-3xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-10"></div>
            <img
              src={featuredSeries[0]?.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600"}
              alt="Featured"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 z-20 flex items-center p-12">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-semibold">
                    TRENDING NOW
                  </span>
                  <span className="text-gray-300 text-sm">• {featuredSeries[0]?.year || "2024"}</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                  {featuredSeries[0]?.title || "Premium Series Collection"}
                </h1>
                <p className="text-gray-300 text-lg mb-6 line-clamp-2">
                  {featuredSeries[0]?.description || "Immerse yourself in our curated collection of premium television series."}
                </p>
                <div className="flex items-center gap-4">
                  <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105">
                    <FaPlay /> Watch Now
                  </button>
                  <button className="px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl font-medium text-white flex items-center gap-2 transition-all">
                    <FaRegHeart /> Add to Favorites
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <FaTv className="text-purple-400 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{allSeries.length}</div>
                <div className="text-sm text-gray-400">Total Series</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <FaPlay className="text-blue-400 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {allSeries.reduce((total, s) => total + getEpisodesForSeries(s.id).length, 0)}
                </div>
                <div className="text-sm text-gray-400">Episodes</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-600/20 rounded-xl">
                <FaUsers className="text-pink-400 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{categories.length - 1}</div>
                <div className="text-sm text-gray-400">Genres</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600/20 rounded-xl">
                <FaFire className="text-emerald-400 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{allSeries.filter(s => calculatePopularity(s) > 100).length}</div>
                <div className="text-sm text-gray-400">Trending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search series, genres, or actors..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Genres</option>
                {categories.filter(c => c !== "all").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="episodes">Most Episodes</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {["all", "trending", "new", "action", "drama", "comedy", "sci-fi", "fantasy"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Series Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {activeTab === "all" ? "All Series" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + " Series"}
              <span className="text-gray-500 ml-2">({filteredSeries.length})</span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSeries.slice(0, visible).map((series) => {
                const seriesEpisodes = getEpisodesForSeries(series.id);
                const isFavorite = favorites.includes(series.id);
                const inWatchlist = watchlist.includes(series.id);

                return (
                  <div
                    key={series.id}
                    className="group relative bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02]"
                  >
                    {/* Series Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={series.poster}
                        alt={series.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                      {/* Overlay Buttons */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(series.id);
                          }}
                          className={`p-2 rounded-full backdrop-blur-sm transition-all ${isFavorite
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-black/40 text-white hover:bg-red-500/20 hover:text-red-400'}`}
                        >
                          <FaHeart className={isFavorite ? "fill-current" : ""} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(series.id);
                          }}
                          className={`p-2 rounded-full backdrop-blur-sm transition-all ${inWatchlist
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-black/40 text-white hover:bg-blue-500/20 hover:text-blue-400'}`}
                        >
                          <FaBookmark className={inWatchlist ? "fill-current" : ""} />
                        </button>
                      </div>

                      {/* Episode Count Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                          {seriesEpisodes.length} Episodes
                        </span>
                      </div>
                    </div>

                    {/* Series Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{series.title}</h3>
                        {getRatingStars(series.rating)}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                        {series.year && (
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt /> {series.year}
                          </span>
                        )}
                        {series.nation && (
                          <span className="flex items-center gap-1">
                            <FaGlobe /> {series.nation}
                          </span>
                        )}
                      </div>

                      {series.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{series.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSeriesClick(series)}
                          className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-xl text-sm font-medium text-white transition-colors"
                        >
                          View Details
                        </button>
                        {seriesEpisodes.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const episodes = getEpisodesForSeries(series.id);
                              const latest = [...episodes].sort((a, b) =>
                                new Date(b.created_at || 0) - new Date(a.created_at || 0)
                              )[0];
                              if (latest) {
                                setPlayingEpisode({ series, episode: latest });
                              }
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all"
                          >
                            <FaPlay size={12} /> Play
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredSeries.slice(0, visible).map((series) => {
                const seriesEpisodes = getEpisodesForSeries(series.id);
                const isFavorite = favorites.includes(series.id);

                return (
                  <div
                    key={series.id}
                    className="group bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-4 hover:bg-gray-900/70 transition-all cursor-pointer border border-gray-800/50 hover:border-purple-500/30"
                    onClick={() => handleSeriesClick(series)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-32 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={series.poster}
                          alt={series.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{series.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              <span>{series.year}</span>
                              <span>•</span>
                              <span>{seriesEpisodes.length} Episodes</span>
                              <span>•</span>
                              <span>{series.nation}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getRatingStars(series.rating)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(series.id);
                              }}
                              className={`p-2 ${isFavorite ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}
                            >
                              <FaHeart className={isFavorite ? "fill-current" : ""} />
                            </button>
                          </div>
                        </div>

                        {series.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{series.description}</p>
                        )}

                        <div className="flex items-center gap-2">
                          {series.category && series.category.split(',').slice(0, 2).map((cat, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-300">
                              {cat.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {visible < filteredSeries.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisible(v => v + 12)}
                className="px-8 py-3 bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 rounded-xl font-medium text-white border border-gray-700/50 transition-all hover:scale-105"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Series Details Modal */}
      {showSeriesDetails && selectedSeries && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-800/50">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowSeriesDetails(false);
                  setSelectedSeries(null);
                }}
                className="absolute top-4 right-4 z-10 p-3 bg-black/50 backdrop-blur-sm rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto max-h-[90vh]">
                {/* Header */}
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                  <div className="lg:w-1/3">
                    <div className="relative rounded-2xl overflow-hidden">
                      <img
                        src={selectedSeries.poster}
                        alt={selectedSeries.title}
                        className="w-full h-auto rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                  </div>

                  <div className="lg:w-2/3">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-2">{selectedSeries.title}</h2>
                        <div className="flex items-center gap-4 mb-4">
                          {getRatingStars(selectedSeries.rating)}
                          <span className="text-gray-400">{selectedSeries.year}</span>
                          <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                            {selectedSeries.nation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-6">
                      <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-white flex items-center gap-2">
                        <FaPlay /> Watch Now
                      </button>
                      <button
                        onClick={() => toggleFavorite(selectedSeries.id)}
                        className={`p-3 rounded-xl ${favorites.includes(selectedSeries.id)
                          ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                          : 'bg-gray-800/50 text-gray-300 hover:text-red-400'}`}
                      >
                        <FaHeart className={favorites.includes(selectedSeries.id) ? "fill-current" : ""} />
                      </button>
                      <button
                        onClick={() => toggleWatchlist(selectedSeries.id)}
                        className={`p-3 rounded-xl ${watchlist.includes(selectedSeries.id)
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                          : 'bg-gray-800/50 text-gray-300 hover:text-blue-400'}`}
                      >
                        <FaBookmark className={watchlist.includes(selectedSeries.id) ? "fill-current" : ""} />
                      </button>
                    </div>

                    {/* Description */}
                    {selectedSeries.description && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Synopsis</h3>
                        <p className="text-gray-400 leading-relaxed">{selectedSeries.description}</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-800/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400">Seasons</div>
                        <div className="text-2xl font-bold text-white">
                          {getSeasons(getEpisodesForSeries(selectedSeries.id)).length}
                        </div>
                      </div>
                      <div className="bg-gray-800/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400">Episodes</div>
                        <div className="text-2xl font-bold text-white">
                          {getEpisodesForSeries(selectedSeries.id).length}
                        </div>
                      </div>
                      <div className="bg-gray-800/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400">Status</div>
                        <div className="text-lg font-bold text-emerald-400">Available</div>
                      </div>
                    </div>

                    {/* Genres */}
                    {selectedSeries.category && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSeries.category.split(',').map((cat, i) => (
                          <span key={i} className="px-4 py-2 bg-gray-800/50 rounded-xl text-gray-300">
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Episodes */}
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Episodes</h3>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                      className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white"
                    >
                      {getSeasons(getEpisodesForSeries(selectedSeries.id)).map(season => (
                        <option key={season} value={season}>Season {season}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {sortEpisodes(getEpisodesForSeries(selectedSeries.id))
                      .filter(ep => (parseInt(ep.seasonNumber) || 1) === selectedSeason)
                      .map(episode => (
                        <div
                          key={episode.id}
                          className="flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-colors cursor-pointer group"
                          onClick={() => setPlayingEpisode({ series: selectedSeries, episode })}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold">{episode.episodeNumber}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                                {episode.title}
                              </h4>
                              {episode.description && (
                                <p className="text-sm text-gray-500 line-clamp-1">{episode.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {episode.duration && (
                              <span className="text-sm text-gray-500">{episode.duration}</span>
                            )}
                            <FaChevronRight className="text-gray-500 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Modal */}
      {playingEpisode && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-4xl w-full border border-gray-800/50">
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{playingEpisode.series.title}</h3>
                  <p className="text-gray-400">
                    Season {playingEpisode.episode.seasonNumber} • Episode {playingEpisode.episode.episodeNumber}
                  </p>
                </div>
                <button
                  onClick={() => setPlayingEpisode(null)}
                  className="p-3 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="aspect-video bg-black rounded-2xl mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-50">▶️</div>
                  <p className="text-xl font-bold text-white mb-2">{playingEpisode.episode.title}</p>
                  <button
                    onClick={() => window.open(playingEpisode.episode.videoUrl || playingEpisode.episode.streamLink, '_blank')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-white transition-all transform hover:scale-105"
                  >
                    Watch on External Player
                  </button>
                </div>
              </div>

              {playingEpisode.episode.description && (
                <div className="bg-gray-800/30 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3">Episode Description</h4>
                  <p className="text-gray-400">{playingEpisode.episode.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}