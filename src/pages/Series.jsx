import { useState, useMemo, useEffect } from "react";
import { useContext } from "react";
import { MoviesContext } from "../context/MoviesContext";
import { FaFilter, FaSearch, FaTv, FaCalendarAlt, FaStar, FaGlobe, FaPlay, FaList, FaClock, FaChevronRight, FaExclamationTriangle } from "react-icons/fa";

export default function Series() {
  const { movies, episodes = [], getEpisodesBySeries } = useContext(MoviesContext);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(12);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [playingEpisode, setPlayingEpisode] = useState(null);
  const [showSeriesDetails, setShowSeriesDetails] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

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

    /* Custom scrollbar for modals */
    .modal-scroll::-webkit-scrollbar {
      width: 10px;
    }

    .modal-scroll::-webkit-scrollbar-track {
      background: rgba(17, 24, 39, 0.8);
      border-radius: 8px;
    }

    .modal-scroll::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #7c3aed, #8b5cf6);
      border-radius: 8px;
      border: 2px solid rgba(17, 24, 39, 0.8);
    }

    /* Custom scrollbar animations */
    @keyframes scrollbarGlow {
      0%, 100% {
        box-shadow: 0 0 5px #7c3aed;
      }
      50% {
        box-shadow: 0 0 15px #7c3aed, 0 0 20px #8b5cf6;
      }
    }

    ::-webkit-scrollbar-thumb:active {
      animation: scrollbarGlow 1.5s infinite;
    }
  `;

  // Filter only series from movies
  const allSeries = useMemo(() => {
    return movies.filter(m => m.type === "series");
  }, [movies]);

  // Get episodes for a specific series
  const getEpisodesForSeries = useMemo(() => (seriesId) => {
    if (typeof getEpisodesBySeries === 'function') {
      return getEpisodesBySeries(seriesId);
    }
    // Fallback: filter episodes array directly
    return episodes.filter(ep =>
      ep.seriesId === seriesId ||
      ep.movieId === seriesId ||
      ep.series_id === seriesId ||
      (ep.series && ep.series.id === seriesId)
    );
  }, [episodes, getEpisodesBySeries]);

  // get unique categories for series only
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

  // filter series
  const filteredSeries = useMemo(() => {
    return allSeries
      .filter((s) => {
        if (category === "all") return true;
        if (!s.category) return false;
        return s.category.split(',').map(cat => cat.trim()).includes(category);
      })
      .filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));
  }, [allSeries, category, query]);

  // Sort episodes by season and episode number
  const sortEpisodes = (episodes) => {
    if (!episodes || !Array.isArray(episodes)) return [];
    return [...episodes].sort((a, b) => {
      const seasonA = parseInt(a.seasonNumber) || 1;
      const seasonB = parseInt(b.seasonNumber) || 1;
      const episodeA = parseInt(a.episodeNumber) || 1;
      const episodeB = parseInt(b.episodeNumber) || 1;

      if (seasonA !== seasonB) return seasonA - seasonB;
      return episodeA - episodeB;
    });
  };

  // Get latest episodes for preview
  const getLatestEpisodes = (episodes, limit = 3) => {
    const sorted = sortEpisodes(episodes);
    if (sorted.length <= limit) return sorted;
    return sorted.slice(-limit).reverse();
  };

  const handleSeriesClick = async (series) => {
    setLoadingEpisodes(true);
    setSelectedSeries(series);
    setShowSeriesDetails(true);
    setLoadingEpisodes(false);
  };

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

  return (
    <>
      {/* Add custom scrollbar styles */}
      <style>{scrollbarStyles}</style>

      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                TV Series Collection
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Browse through our collection of TV series with uploaded episodes
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="bg-gradient-to-r from-purple-900/30 to-purple-700/20 backdrop-blur-sm rounded-xl p-4 border border-purple-800/30">
                <div className="text-2xl font-bold text-white">{allSeries.length}</div>
                <div className="text-sm text-purple-300">Total Series</div>
              </div>
              <div className="bg-gradient-to-r from-blue-900/30 to-blue-700/20 backdrop-blur-sm rounded-xl p-4 border border-blue-800/30">
                <div className="text-2xl font-bold text-white">{totalUploadedEpisodes}</div>
                <div className="text-sm text-blue-300">Total Episodes</div>
              </div>
              <div className="bg-gradient-to-r from-pink-900/30 to-pink-700/20 backdrop-blur-sm rounded-xl p-4 border border-pink-800/30">
                <div className="text-2xl font-bold text-white">{categories.length - 1}</div>
                <div className="text-sm text-pink-300">Categories</div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search series by title, description, or category..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-purple-600/30 text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
                {query && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span className="text-sm text-gray-400">
                      {filteredSeries.length} results
                    </span>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <FaFilter className="text-purple-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-purple-600/30 text-white focus:outline-none focus:border-purple-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                All Categories
              </button>
              {categories
                .filter(c => c !== "all")
                .slice(0, 8)
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${category === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              {categories.length > 9 && (
                <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-800 text-gray-300">
                  +{categories.length - 9} more
                </button>
              )}
            </div>
          </div>

          {/* Search Results Indicator */}
          {query && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl border border-blue-800/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaSearch className="text-blue-400" />
                    Search Results for: "{query}"
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Found {filteredSeries.length} series{filteredSeries.length !== 1 ? 's' : ''}
                    {category !== "all" && ` in ${category}`}
                  </p>
                </div>
                <button
                  onClick={() => setQuery("")}
                  className="mt-3 md:mt-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
                >
                  ✕ Clear Search
                </button>
              </div>
            </div>
          )}

          {/* Series Grid */}
          {filteredSeries.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredSeries.slice(0, visible).map((series) => {
                  const seriesEpisodes = getEpisodesForSeries(series.id);
                  const latestEpisodes = getLatestEpisodes(seriesEpisodes, 3);
                  const hasEpisodes = seriesEpisodes.length > 0;

                  return (
                    <div
                      key={series.id}
                      className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-lg rounded-2xl border border-gray-800/50 overflow-hidden hover:border-purple-600/50 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
                      onClick={() => handleSeriesClick(series)}
                    >
                      {/* Series Poster */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={series.poster}
                          alt={series.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                        {/* Series Badges */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-lg bg-purple-600 text-xs font-bold">
                              <FaTv className="inline mr-1" /> Series
                            </span>
                            {series.rating && (
                              <span className="px-2 py-1 rounded-lg bg-yellow-600 text-xs font-bold">
                                <FaStar className="inline mr-1" /> {series.rating}
                              </span>
                            )}
                            {hasEpisodes && (
                              <span className="px-2 py-1 rounded-lg bg-green-600 text-xs font-bold">
                                {seriesEpisodes.length} Ep
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Play Button Overlay */}
                        {hasEpisodes && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transform group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-purple-600/50">
                              <FaPlay className="text-white text-2xl ml-1" />
                            </div>
                          </div>
                        )}

                        {/* Series Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{series.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
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
                            <span className={hasEpisodes ? "text-green-400" : "text-yellow-400"}>
                              {hasEpisodes ? `${seriesEpisodes.length} Uploaded` : "No Episodes"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Series Details */}
                      <div className="p-4">
                        {/* Category */}
                        {series.category && (
                          <div className="mb-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                              {series.category.split(',')[0]}
                            </span>
                          </div>
                        )}

                        {/* Description */}
                        {series.description && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{series.description}</p>
                        )}

                        {/* Episode Preview */}
                        {hasEpisodes ? (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1">
                                <FaList /> Latest Episodes
                              </h4>
                              <span className="text-xs text-gray-500">
                                {seriesEpisodes.length} Total
                              </span>
                            </div>
                            <div className="space-y-2">
                              {latestEpisodes.map((episode) => (
                                <div
                                  key={episode.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayEpisode(series, episode);
                                  }}
                                  className="p-2 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-all cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-xs text-purple-300 font-medium">
                                        S{episode.seasonNumber}E{episode.episodeNumber}
                                      </div>
                                      <div className="text-sm text-white line-clamp-1">
                                        {episode.title}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {episode.duration && (
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                          <FaClock /> {episode.duration}
                                        </span>
                                      )}
                                      <FaChevronRight className="text-gray-400 text-xs" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 p-3 bg-gray-800/20 rounded-lg border border-dashed border-gray-700">
                            <p className="text-sm text-gray-400 text-center flex items-center justify-center gap-2">
                              <FaExclamationTriangle />
                              No episodes uploaded yet
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeriesClick(series);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all"
                          >
                            <FaList /> {hasEpisodes ? 'View All Episodes' : 'Add Episodes'}
                          </button>

                          {hasEpisodes && latestEpisodes[0] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayEpisode(series, latestEpisodes[0]);
                              }}
                              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white transition-all"
                              title="Play Latest Episode"
                            >
                              <FaPlay />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Footer Stats */}
                      <div className="p-3 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-black/50">
                        <div className="flex justify-between items-center">
                          <div className="text-left">
                            <div className="text-xs text-gray-400">Rating</div>
                            <div className="text-sm font-bold text-white flex items-center gap-1">
                              <FaStar className="text-yellow-500 text-xs" />
                              {series.rating || "N/A"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Status</div>
                            <div className={`text-sm font-medium ${hasEpisodes ? 'text-green-400' : 'text-yellow-400'}`}>
                              {hasEpisodes ? 'Ready' : 'Setup Needed'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {visible < filteredSeries.length && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setVisible((v) => v + 12)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-white transition-all transform hover:scale-105"
                  >
                    Load More Series
                  </button>
                  <p className="text-gray-400 text-sm mt-2">
                    Showing {Math.min(visible, filteredSeries.length)} of {filteredSeries.length} series
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">No Series Found</h3>
              <p className="text-gray-500 mb-4">
                {query
                  ? `No series match "${query}". Try a different search term.`
                  : "No series available in this category."}
              </p>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  ✕ Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Series Details Modal */}
        {showSeriesDetails && selectedSeries && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-600/30 modal-scroll">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedSeries.title}</h2>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {selectedSeries.rating && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-600/20 text-yellow-400">
                          ⭐ {selectedSeries.rating}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-600/20 text-purple-400">
                        📺 TV Series
                      </span>
                      {selectedSeries.category && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700/50 text-gray-300">
                          {selectedSeries.category.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSeriesDetails(false);
                      setSelectedSeries(null);
                    }}
                    className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Series Info */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-1">
                    <img
                      src={selectedSeries.poster}
                      alt={selectedSeries.title}
                      className="w-full h-auto rounded-xl shadow-2xl"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400';
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-300 mb-2">Description</h3>
                      <p className="text-gray-400">{selectedSeries.description || "No description available."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {selectedSeries.nation && (
                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">Nation</h4>
                          <p className="text-white">{selectedSeries.nation}</p>
                        </div>
                      )}
                      {selectedSeries.translator && (
                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">Translator</h4>
                          <p className="text-white">{selectedSeries.translator}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm text-gray-500 mb-1">Seasons</h4>
                        <p className="text-white">{selectedSeries.totalSeasons || 1}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500 mb-1">Uploaded Episodes</h4>
                        <p className="text-white">{getEpisodesForSeries(selectedSeries.id).length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Episodes Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Uploaded Episodes</h3>
                    <div className="text-sm text-gray-400">
                      {getEpisodesForSeries(selectedSeries.id).length} episodes
                    </div>
                  </div>

                  {loadingEpisodes ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-gray-400 mt-4">Loading episodes...</p>
                    </div>
                  ) : getEpisodesForSeries(selectedSeries.id).length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 modal-scroll">
                      {sortEpisodes(getEpisodesForSeries(selectedSeries.id)).map((episode) => (
                        <div
                          key={episode.id}
                          className="bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-4 transition-all cursor-pointer border border-gray-700/50"
                          onClick={() => handlePlayEpisode(selectedSeries, episode)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 rounded bg-purple-600/30 text-purple-300 text-xs font-bold">
                                  S{episode.seasonNumber}E{episode.episodeNumber}
                                </span>
                                <h4 className="text-lg font-semibold text-white">{episode.title}</h4>
                              </div>
                              {episode.description && (
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{episode.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {episode.duration && (
                                  <span className="flex items-center gap-1">
                                    <FaClock /> {episode.duration}
                                  </span>
                                )}
                                {episode.airDate && (
                                  <span>📅 {episode.airDate}</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayEpisode(selectedSeries, episode);
                              }}
                              className="ml-4 p-3 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 rounded-lg text-white transition-all"
                              title="Play Episode"
                            >
                              <FaPlay />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                      <div className="text-4xl mb-3">🎬</div>
                      <h4 className="text-lg font-bold text-gray-300 mb-2">No Episodes Yet</h4>
                      <p className="text-gray-400">Add episodes using the admin panel</p>
                      <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-purple-300">
                          Go to Admin → Select this series → Click "Manage Episodes"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Modal */}
        {playingEpisode && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
            <div className="bg-black rounded-xl max-w-4xl w-full border border-purple-600/30">
              <div className="p-4 flex justify-between items-center border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">
                  {playingEpisode.series.title} - S{playingEpisode.episode.seasonNumber}E{playingEpisode.episode.episodeNumber}
                </h3>
                <button
                  onClick={() => setPlayingEpisode(null)}
                  className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  {playingEpisode.episode.streamLink || playingEpisode.episode.videoUrl ? (
                    <div className="text-center">
                      <div className="text-6xl mb-4">▶️</div>
                      <p className="text-white text-lg mb-2">{playingEpisode.episode.title}</p>
                      <button
                        onClick={() => window.open(playingEpisode.episode.videoUrl || playingEpisode.episode.streamLink, '_blank')}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium text-white transition-all"
                      >
                        Play Now
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-white text-lg">No stream link available</p>
                      <p className="text-gray-400">Add stream link in admin panel</p>
                    </div>
                  )}
                </div>
                <div className="text-white">
                  <p className="text-gray-400">{playingEpisode.episode.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    {playingEpisode.episode.duration && (
                      <span>Duration: {playingEpisode.episode.duration}</span>
                    )}
                    {playingEpisode.episode.airDate && (
                      <span>Air Date: {playingEpisode.episode.airDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}