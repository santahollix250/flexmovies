import { useState, useMemo } from "react";
import { useContext } from "react";
import { MoviesContext } from "../context/MoviesContext";
import {
  FaFilter, FaSearch, FaTv, FaCalendarAlt, FaStar, FaGlobe, FaPlay,
  FaList, FaClock, FaChevronRight, FaExclamationTriangle,
  FaEye, FaHeart, FaShareAlt, FaBookmark, FaFire, FaCrown,
  FaCheckCircle, FaUsers, FaTags, FaRegStar, FaStarHalfAlt,
  FaCaretRight, FaExpand, FaClosedCaptioning, FaLanguage
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
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

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

  // Get unique categories for series only
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

  // Calculate series popularity based on episodes and rating
  const calculatePopularity = (series) => {
    const episodeCount = getEpisodesForSeries(series.id).length;
    const rating = parseFloat(series.rating) || 5;
    return episodeCount * 10 + rating * 20;
  };

  // Sort series based on selected option
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
    return sortedSeries
      .filter((s) => {
        if (category === "all") return true;
        if (!s.category) return false;
        return s.category.split(',').map(cat => cat.trim()).includes(category);
      })
      .filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(query.toLowerCase()) ||
        (s.category || "").toLowerCase().includes(query.toLowerCase())
      );
  }, [sortedSeries, category, query]);

  // Sort episodes by season and episode number
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

  // Get latest episodes for preview
  const getLatestEpisodes = (episodesArray, limit = 3) => {
    const sorted = sortEpisodes(episodesArray);
    if (sorted.length <= limit) return sorted;
    return sorted.slice(-limit).reverse();
  };

  // Handle series click
  const handleSeriesClick = async (series) => {
    setLoadingEpisodes(true);
    setSelectedSeries(series);
    setShowSeriesDetails(true);
    setLoadingEpisodes(false);
  };

  // Handle play episode
  const handlePlayEpisode = (series, episode) => {
    setPlayingEpisode({ series, episode });
    if (episode.streamLink || episode.videoUrl) {
      const videoUrl = episode.videoUrl || episode.streamLink;
      window.open(videoUrl, '_blank');
    }
  };

  // Calculate total episodes count for stats
  const totalUploadedEpisodes = useMemo(() => {
    return allSeries.reduce((total, series) => {
      const seriesEpisodes = getEpisodesForSeries(series.id);
      return total + seriesEpisodes.length;
    }, 0);
  }, [allSeries, getEpisodesForSeries]);

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

  // Calculate average rating
  const getRatingStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating / 2);
    const hasHalfStar = numRating % 2 >= 1;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400 text-sm" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-yellow-400 text-sm" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-600 text-sm" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-300">{rating || "N/A"}</span>
      </div>
    );
  };

  // Get series status badge
  const getStatusBadge = (series, episodeCount) => {
    if (episodeCount === 0) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">No Episodes</span>;
    } else if (episodeCount < 5) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">Few Episodes</span>;
    } else if (episodeCount >= 5 && episodeCount < 20) {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">Good Collection</span>;
    } else {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Complete</span>;
    }
  };

  // Popular categories
  const popularCategories = ["Action", "Drama", "Comedy", "Thriller", "Romance", "Sci-Fi", "Fantasy", "Horror"];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pt-24 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GiPopcorn className="text-5xl text-purple-500" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Series Hub
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Dive into our premium collection of TV series. Stream the latest episodes in stunning quality.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/30 backdrop-blur-lg rounded-2xl p-5 border border-purple-700/30 transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  {allSeries.length} <FaTv className="text-purple-400" />
                </div>
                <div className="text-sm text-purple-300 mt-1">Premium Series</div>
              </div>
              <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 backdrop-blur-lg rounded-2xl p-5 border border-blue-700/30 transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  {totalUploadedEpisodes} <FaPlay className="text-blue-400" />
                </div>
                <div className="text-sm text-blue-300 mt-1">Total Episodes</div>
              </div>
              <div className="bg-gradient-to-r from-pink-900/40 to-pink-800/30 backdrop-blur-lg rounded-2xl p-5 border border-pink-700/30 transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  {categories.length - 1} <FaTags className="text-pink-400" />
                </div>
                <div className="text-sm text-pink-300 mt-1">Genres</div>
              </div>
              <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/30 backdrop-blur-lg rounded-2xl p-5 border border-emerald-700/30 transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  <FaUsers className="text-emerald-400" /> 24/7
                </div>
                <div className="text-sm text-emerald-300 mt-1">Streaming Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Search and Controls */}
        <div className="mb-10">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative">
              <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search series by title, genre, or description..."
                className="w-full pl-16 pr-6 py-4 rounded-2xl bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-lg shadow-2xl"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Category Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <FaFilter className="text-purple-400 text-xl" />
                <h3 className="text-lg font-semibold text-white">Browse by Genre</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setCategory("all")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 ${category === "all"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-gray-800/60 text-gray-300 hover:bg-gray-800/80 backdrop-blur-sm"
                    }`}
                >
                  All Genres
                </button>
                {popularCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 ${category === cat
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-800/60 text-gray-300 hover:bg-gray-800/80 backdrop-blur-sm"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-5 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-white focus:outline-none focus:border-purple-500 backdrop-blur-sm"
                >
                  <option value="all">More Genres...</option>
                  {categories
                    .filter(c => c !== "all" && !popularCategories.includes(c))
                    .map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Sort and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <FaCrown className="text-yellow-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-white focus:outline-none focus:border-purple-500 backdrop-blur-sm"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="episodes">Most Episodes</option>
                  <option value="title">A to Z</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg ${viewMode === "grid"
                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                    : "bg-gray-800/60 text-gray-400 hover:text-white"}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg ${viewMode === "list"
                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                    : "bg-gray-800/60 text-gray-400 hover:text-white"}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {query && (
          <div className="mb-8 p-5 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-lg rounded-2xl border border-purple-700/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaSearch className="text-purple-400" />
                  Search Results for: <span className="text-purple-300">"{query}"</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Found {filteredSeries.length} series{filteredSeries.length !== 1 ? 's' : ''}
                  {category !== "all" && ` in ${category}`}
                </p>
              </div>
              <button
                onClick={() => setQuery("")}
                className="mt-3 md:mt-0 px-5 py-2 bg-gray-800/60 hover:bg-gray-800/80 rounded-xl text-white font-medium flex items-center gap-2 transition-colors backdrop-blur-sm"
              >
                ✕ Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Series Grid/List */}
        {filteredSeries.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSeries.slice(0, visible).map((series) => {
                  const seriesEpisodes = getEpisodesForSeries(series.id);
                  const latestEpisodes = getLatestEpisodes(seriesEpisodes, 2);
                  const hasEpisodes = seriesEpisodes.length > 0;
                  const isFavorite = favorites.includes(series.id);
                  const inWatchlist = watchlist.includes(series.id);

                  return (
                    <div
                      key={series.id}
                      className="group relative bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-lg rounded-2xl border border-gray-800/50 overflow-hidden hover:border-purple-600/50 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-900/30 cursor-pointer"
                      onClick={() => handleSeriesClick(series)}
                    >
                      {/* Series Poster */}
                      <div className="relative h-72 overflow-hidden">
                        <img
                          src={series.poster}
                          alt={series.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                        {/* Overlay Badges */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          <div className="flex flex-wrap gap-2">
                            {series.rating && parseFloat(series.rating) >= 8.5 && (
                              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-xs font-bold flex items-center gap-1">
                                <FaCrown className="text-xs" /> Top Rated
                              </span>
                            )}
                            {hasEpisodes && seriesEpisodes.length > 20 && (
                              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-xs font-bold">
                                <FaFire className="inline mr-1" /> Popular
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(series.id);
                              }}
                              className={`p-2 rounded-full backdrop-blur-sm ${isFavorite
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-black/40 text-gray-300 hover:text-red-400'}`}
                            >
                              <FaHeart className={isFavorite ? "fill-current" : ""} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWatchlist(series.id);
                              }}
                              className={`p-2 rounded-full backdrop-blur-sm ${inWatchlist
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-black/40 text-gray-300 hover:text-blue-400'}`}
                            >
                              <FaBookmark className={inWatchlist ? "fill-current" : ""} />
                            </button>
                          </div>
                        </div>

                        {/* Play Button Overlay */}
                        {hasEpisodes && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transform group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-purple-600/50 animate-pulse-slow">
                              <FaPlay className="text-white text-2xl ml-1" />
                            </div>
                          </div>
                        )}

                        {/* Series Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold text-white line-clamp-1">{series.title}</h3>
                            {getStatusBadge(series, seriesEpisodes.length)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                            {series.year && (
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt /> {series.year}
                              </span>
                            )}
                            <span className="text-gray-500">•</span>
                            <span className="text-purple-300">
                              {series.totalSeasons || 1} Season{(series.totalSeasons || 1) > 1 ? 's' : ''}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className={hasEpisodes ? "text-emerald-400" : "text-red-400"}>
                              {hasEpisodes ? `${seriesEpisodes.length} Episodes` : "Coming Soon"}
                            </span>
                          </div>
                          {getRatingStars(series.rating)}
                        </div>
                      </div>

                      {/* Series Details */}
                      <div className="p-5">
                        {/* Category */}
                        {series.category && (
                          <div className="mb-4">
                            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800/60 text-gray-300 backdrop-blur-sm">
                              {series.category.split(',')[0]}
                            </span>
                          </div>
                        )}

                        {/* Description */}
                        {series.description && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{series.description}</p>
                        )}

                        {/* Episode Preview */}
                        {hasEpisodes && (
                          <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <FaList className="text-purple-400" /> Latest Episodes
                              </h4>
                              <span className="text-xs text-gray-500">
                                {seriesEpisodes.length} Total
                              </span>
                            </div>
                            <div className="space-y-2.5">
                              {latestEpisodes.map((episode) => (
                                <div
                                  key={episode.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayEpisode(series, episode);
                                  }}
                                  className="p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all cursor-pointer group/episode border border-gray-700/30"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-xs font-medium text-purple-300 mb-1">
                                        S{episode.seasonNumber}E{episode.episodeNumber}
                                      </div>
                                      <div className="text-sm text-white line-clamp-1 font-medium">
                                        {episode.title}
                                      </div>
                                    </div>
                                    <FaCaretRight className="text-gray-400 text-lg group-hover/episode:text-purple-400 transition-colors" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeriesClick(series);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-700/80 to-purple-900/80 hover:from-purple-600 hover:to-purple-800 text-white transition-all backdrop-blur-sm"
                          >
                            <FaEye />
                            View Details
                          </button>
                          {hasEpisodes && latestEpisodes[0] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayEpisode(series, latestEpisodes[0]);
                              }}
                              className="px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white transition-all"
                              title="Play Latest Episode"
                            >
                              <FaPlay />
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
              <div className="space-y-4">
                {filteredSeries.slice(0, visible).map((series) => {
                  const seriesEpisodes = getEpisodesForSeries(series.id);
                  const hasEpisodes = seriesEpisodes.length > 0;
                  const isFavorite = favorites.includes(series.id);

                  return (
                    <div
                      key={series.id}
                      className="group flex flex-col md:flex-row gap-4 p-4 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-lg rounded-2xl border border-gray-800/50 hover:border-purple-600/50 transition-all duration-300 cursor-pointer"
                      onClick={() => handleSeriesClick(series)}
                    >
                      {/* Poster */}
                      <div className="relative w-full md:w-48 h-64 md:h-auto rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={series.poster}
                          alt={series.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        {hasEpisodes && (
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(series.id);
                              }}
                              className={`p-2 rounded-full backdrop-blur-sm ${isFavorite
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-black/40 text-gray-300'}`}
                            >
                              <FaHeart className={isFavorite ? "fill-current" : ""} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">{series.title}</h3>
                            <div className="flex items-center gap-4 flex-wrap mb-3">
                              {getRatingStars(series.rating)}
                              <span className="text-sm text-gray-400">
                                {seriesEpisodes.length} Episodes
                              </span>
                              {series.nation && (
                                <span className="flex items-center gap-1 text-sm text-gray-400">
                                  <FaGlobe /> {series.nation}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeriesClick(series);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all"
                            >
                              Details
                            </button>
                            {hasEpisodes && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const latestEpisode = getLatestEpisodes(seriesEpisodes, 1)[0];
                                  handlePlayEpisode(series, latestEpisode);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-white font-medium transition-all"
                              >
                                <FaPlay className="inline mr-2" /> Play
                              </button>
                            )}
                          </div>
                        </div>

                        {series.description && (
                          <p className="text-gray-400 mb-4 line-clamp-2">{series.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {series.category && series.category.split(',').slice(0, 3).map((cat, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/60 text-gray-300">
                              {cat.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More Button */}
            {visible < filteredSeries.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisible((v) => v + 12)}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 rounded-2xl font-bold text-white transition-all transform hover:scale-105 shadow-xl shadow-purple-900/30"
                >
                  Load More Series
                </button>
                <p className="text-gray-400 text-sm mt-3">
                  Showing {Math.min(visible, filteredSeries.length)} of {filteredSeries.length} premium series
                </p>
              </div>
            )}
          </>
        ) : (
          /* No Results */
          <div className="text-center py-20 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-lg rounded-2xl border border-gray-800/50">
            <div className="text-8xl mb-6">📺</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No Series Found</h3>
            <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
              {query
                ? `No series match "${query}". Try a different search term.`
                : "No series available in this category."}
            </p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl text-white font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                ✕ Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Series Details Modal */}
      {showSeriesDetails && selectedSeries && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-purple-700/30 modal-scroll">
            <div className="relative">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={selectedSeries.background || selectedSeries.poster}
                  alt={selectedSeries.title}
                  className="w-full h-64 object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-gray-900"></div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowSeriesDetails(false);
                  setSelectedSeries(null);
                }}
                className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
              >
                ✕
              </button>

              <div className="relative p-8">
                {/* Series Header */}
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                  <div className="lg:w-1/3">
                    <div className="relative group">
                      <img
                        src={selectedSeries.poster}
                        alt={selectedSeries.title}
                        className="w-full h-auto rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <button
                        onClick={() => {
                          const episodes = getEpisodesForSeries(selectedSeries.id);
                          if (episodes.length > 0) {
                            handlePlayEpisode(selectedSeries, getLatestEpisodes(episodes, 1)[0]);
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl">
                          <FaPlay className="text-white text-3xl ml-1" />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="lg:w-2/3">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-2">{selectedSeries.title}</h2>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            {getRatingStars(selectedSeries.rating)}
                            <span className="text-gray-400">({selectedSeries.rating || "N/A"})</span>
                          </div>
                          {selectedSeries.year && (
                            <span className="text-gray-300">{selectedSeries.year}</span>
                          )}
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-600/20 text-purple-400">
                            TV Series
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => toggleFavorite(selectedSeries.id)}
                          className={`p-3 rounded-full ${favorites.includes(selectedSeries.id)
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-800/50 text-gray-300 hover:text-red-400'}`}
                        >
                          <FaHeart className={favorites.includes(selectedSeries.id) ? "fill-current" : ""} />
                        </button>
                        <button
                          onClick={() => toggleWatchlist(selectedSeries.id)}
                          className={`p-3 rounded-full ${watchlist.includes(selectedSeries.id)
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-gray-800/50 text-gray-300 hover:text-blue-400'}`}
                        >
                          <FaBookmark className={watchlist.includes(selectedSeries.id) ? "fill-current" : ""} />
                        </button>
                        <button className="p-3 rounded-full bg-gray-800/50 text-gray-300 hover:text-white">
                          <FaShareAlt />
                        </button>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-800/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Seasons</div>
                        <div className="text-xl font-bold text-white">{selectedSeries.totalSeasons || 1}</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Episodes</div>
                        <div className="text-xl font-bold text-white">{getEpisodesForSeries(selectedSeries.id).length}</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Nation</div>
                        <div className="text-xl font-bold text-white">{selectedSeries.nation || "International"}</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Status</div>
                        <div className="text-xl font-bold text-emerald-400">
                          {getEpisodesForSeries(selectedSeries.id).length > 0 ? 'Available' : 'Coming Soon'}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedSeries.description && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-white mb-3">Synopsis</h3>
                        <p className="text-gray-300 leading-relaxed">{selectedSeries.description}</p>
                      </div>
                    )}

                    {/* Categories */}
                    {selectedSeries.category && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSeries.category.split(',').map((cat, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/30">
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Episodes Section */}
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FaList className="text-purple-400" /> Episodes
                    </h3>
                    <div className="text-sm text-gray-400">
                      {getEpisodesForSeries(selectedSeries.id).length} episodes available
                    </div>
                  </div>

                  {loadingEpisodes ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-gray-400 mt-4">Loading episodes...</p>
                    </div>
                  ) : getEpisodesForSeries(selectedSeries.id).length > 0 ? (
                    <div className="space-y-3">
                      {sortEpisodes(getEpisodesForSeries(selectedSeries.id)).map((episode) => (
                        <div
                          key={episode.id}
                          className="group bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-4 transition-all border border-gray-700/30 hover:border-purple-600/30 cursor-pointer"
                          onClick={() => handlePlayEpisode(selectedSeries, episode)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-bold">
                                  S{episode.seasonNumber}E{episode.episodeNumber}
                                </span>
                                <h4 className="text-lg font-semibold text-white">{episode.title}</h4>
                                {episode.duration && (
                                  <span className="text-sm text-gray-400 flex items-center gap-1">
                                    <FaClock /> {episode.duration}
                                  </span>
                                )}
                              </div>
                              {episode.description && (
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{episode.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayEpisode(selectedSeries, episode);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all flex items-center gap-2"
                              >
                                <FaPlay /> Play
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaExclamationTriangle className="text-4xl text-gray-500 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-gray-300 mb-2">No Episodes Available</h4>
                      <p className="text-gray-400">Episodes will be added soon</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Modal */}
      {playingEpisode && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-5xl w-full border border-purple-700/30">
            <div className="p-6 flex justify-between items-center border-b border-gray-800/50">
              <div>
                <h3 className="text-2xl font-bold text-white">{playingEpisode.series.title}</h3>
                <p className="text-gray-400">
                  S{playingEpisode.episode.seasonNumber}E{playingEpisode.episode.episodeNumber} • {playingEpisode.episode.title}
                </p>
              </div>
              <button
                onClick={() => setPlayingEpisode(null)}
                className="text-gray-400 hover:text-white p-3 rounded-full hover:bg-gray-800/50 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6 flex items-center justify-center relative">
                {playingEpisode.episode.streamLink || playingEpisode.episode.videoUrl ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20"></div>
                    <div className="relative text-center">
                      <div className="text-8xl mb-6 opacity-50">▶️</div>
                      <p className="text-2xl font-bold text-white mb-4">{playingEpisode.episode.title}</p>
                      <button
                        onClick={() => window.open(playingEpisode.episode.videoUrl || playingEpisode.episode.streamLink, '_blank')}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-white transition-all transform hover:scale-105 text-lg flex items-center gap-3 mx-auto"
                      >
                        <FaPlay /> Watch Now
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-8xl mb-6">🎬</div>
                    <p className="text-2xl font-bold text-white">No stream link available</p>
                    <p className="text-gray-400 mt-2">Please check back later</p>
                  </div>
                )}
              </div>
              {playingEpisode.episode.description && (
                <div className="bg-gray-800/30 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3">Episode Description</h4>
                  <p className="text-gray-300">{playingEpisode.episode.description}</p>
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                    {playingEpisode.episode.duration && (
                      <span className="flex items-center gap-2">
                        <FaClock /> {playingEpisode.episode.duration}
                      </span>
                    )}
                    {playingEpisode.episode.airDate && (
                      <span className="flex items-center gap-2">
                        <FaCalendarAlt /> {playingEpisode.episode.airDate}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}