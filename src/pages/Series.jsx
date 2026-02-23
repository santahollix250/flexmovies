import React, { useState, useMemo, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoviesContext } from "../context/MoviesContext";
import {
  FaSearch, FaStar, FaPlay, FaHeart,
  FaBookmark, FaCalendarAlt,
  FaList, FaTv, FaUsers, FaFire, FaChevronRight,
  FaGlobe, FaTimes,
  FaRegHeart, FaRegBookmark,
  FaChevronLeft, FaChevronUp, FaChevronDown,
  FaBars, FaTh, FaFilter,
  FaEllipsisV, FaShare, FaDownload, FaInfoCircle,
  FaClock, FaLayerGroup, FaPlayCircle
} from "react-icons/fa";

export default function Series() {
  const navigate = useNavigate();
  const { movies, episodes = [], getEpisodesBySeries } = useContext(MoviesContext);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(6);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [showSeriesDetails, setShowSeriesDetails] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);

  // Slideshow state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const slideshowTimerRef = useRef(null);

  const tabsContainerRef = useRef(null);
  const slideshowRef = useRef(null);

  // ========== SERIES DATA FUNCTIONS ==========

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

  // Helper function to get seasons
  const getSeasons = (episodesArray) => {
    const seasons = new Set();
    episodesArray.forEach(ep => {
      seasons.add(parseInt(ep.seasonNumber) || 1);
    });
    return Array.from(seasons).sort((a, b) => a - b);
  };

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

  // Get the latest 5 seasons for slideshow
  const latestSeasons = useMemo(() => {
    if (!allSeries.length) return [];

    const seriesWithSeasons = allSeries.map(series => {
      const seriesEpisodes = getEpisodesForSeries(series.id);
      const seasons = getSeasons(seriesEpisodes);
      const latestSeason = Math.max(...seasons, 0);
      const latestEpisodes = seriesEpisodes.filter(ep =>
        (parseInt(ep.seasonNumber) || 1) === latestSeason
      );

      return {
        ...series,
        latestSeason,
        episodeCount: latestEpisodes.length,
        seasonPoster: latestEpisodes[0]?.thumbnail || series.poster || series.background
      };
    });

    return seriesWithSeasons
      .filter(s => s.latestSeason > 0)
      .sort((a, b) => b.latestSeason - a.latestSeason)
      .slice(0, 5);
  }, [allSeries, getEpisodesForSeries]);

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
  }, [allSeries, sortBy, getEpisodesForSeries, calculatePopularity]);

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
  }, [sortedSeries, category, query, activeTab, calculatePopularity]);

  // Featured series
  const featuredSeries = useMemo(() => {
    return [...allSeries]
      .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
      .slice(0, 3);
  }, [allSeries]);

  // ========== EPISODE PLAYBACK FUNCTIONS ==========

  // Handle play episode - Navigate to SeriesPlayer
  const handlePlayEpisode = (series, episode) => {
    // Get all episodes for the series
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);

    // Find the index of the current episode
    const episodeIndex = sortedEpisodes.findIndex(ep => ep.id === episode.id);

    // Navigate to the SeriesPlayer with all the data
    navigate(`/series-player/${series.id}`, {
      state: {
        series: series,
        episode: episode,
        episodes: sortedEpisodes,
        episodeIndex: episodeIndex
      }
    });
  };

  // Handle play first episode
  const handlePlayFirstEpisode = (series) => {
    const episodes = getEpisodesForSeries(series.id);
    if (episodes.length > 0) {
      const firstEpisode = sortEpisodes(episodes)[0];
      const episodeIndex = 0;

      navigate(`/series-player/${series.id}`, {
        state: {
          series: series,
          episode: firstEpisode,
          episodes: sortEpisodes(episodes),
          episodeIndex: episodeIndex
        }
      });
    }
  };

  // Handle play latest season
  const handlePlayLatestSeason = (series) => {
    const episodes = getEpisodesForSeries(series.id);
    if (episodes.length > 0) {
      const seasons = getSeasons(episodes);
      const latestSeason = Math.max(...seasons);
      const seasonEpisodes = episodes.filter(ep =>
        (parseInt(ep.seasonNumber) || 1) === latestSeason
      );
      if (seasonEpisodes.length > 0) {
        const firstEpisodeOfLatestSeason = seasonEpisodes[0];
        const sortedEpisodes = sortEpisodes(episodes);
        const episodeIndex = sortedEpisodes.findIndex(ep => ep.id === firstEpisodeOfLatestSeason.id);

        navigate(`/series-player/${series.id}`, {
          state: {
            series: series,
            episode: firstEpisodeOfLatestSeason,
            episodes: sortedEpisodes,
            episodeIndex: episodeIndex
          }
        });
      }
    }
  };

  // ========== SLIDESHOW FUNCTIONS ==========

  const nextSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev === latestSeasons.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev === 0 ? latestSeasons.length - 1 : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  const handleSlideshowMouseEnter = () => setAutoPlay(false);
  const handleSlideshowMouseLeave = () => setAutoPlay(true);

  // Slideshow auto-play effect
  useEffect(() => {
    if (!autoPlay || latestSeasons.length === 0) return;

    slideshowTimerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    };
  }, [autoPlay, latestSeasons.length]);

  // ========== UI FUNCTIONS ==========

  // Check orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Touch drag for tabs
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (tabsContainerRef.current?.offsetLeft || 0));
    setScrollLeft(tabsContainerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - (tabsContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Toggle favorite/watchlist
  const toggleFavorite = (seriesId) => {
    setFavorites(prev =>
      prev.includes(seriesId) ? prev.filter(id => id !== seriesId) : [...prev, seriesId]
    );
  };

  const toggleWatchlist = (seriesId) => {
    setWatchlist(prev =>
      prev.includes(seriesId) ? prev.filter(id => id !== seriesId) : [...prev, seriesId]
    );
  };

  // Get rating stars
  const getRatingStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const normalizedRating = Math.min(numRating / 2, 5);
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-xs ${i < fullStars ? 'text-yellow-500' : hasHalfStar && i === fullStars ? 'text-yellow-500' : 'text-gray-700'}`}
          />
        ))}
        <span className="ml-1 text-xs font-medium text-gray-300">
          {normalizedRating.toFixed(1)}
        </span>
      </div>
    );
  };

  // ========== RENDER ==========

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 pt-14 md:pt-20 pb-0">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 md:w-80 h-40 md:h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 md:w-80 h-40 md:h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Simple Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-16 left-4 z-40 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-medium shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all md:top-20 md:left-6 md:px-4 md:py-2.5"
      >
        <FaChevronLeft size={12} className="md:text-sm" />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Mobile Menu Button */}
      <div className="fixed top-16 right-4 z-40 md:hidden">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg"
        >
          <FaBars className="text-white text-lg" />
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/95 z-50 md:hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Menu</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 bg-gray-800 rounded-full"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-gray-800 rounded-xl text-white"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                  <option value="episodes">Most Episodes</option>
                </select>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">View Mode</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setViewMode("grid");
                      setShowMobileMenu(false);
                    }}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${viewMode === "grid" ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    <FaTh /> Grid
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("list");
                      setShowMobileMenu(false);
                    }}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${viewMode === "list" ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    <FaList /> List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile Search Bar */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search series..."
              className="w-full pl-9 pr-3 py-2.5 bg-gray-900/70 backdrop-blur-xl border border-gray-800/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex-1 px-4 py-2.5 bg-gray-900/70 backdrop-blur-xl rounded-xl text-white flex items-center justify-center gap-2 text-sm"
          >
            <FaFilter /> Filters
          </button>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-gray-900/70 backdrop-blur-xl rounded-xl text-white text-sm"
          >
            <option value="all">All Genres</option>
            {categories.filter(c => c !== "all").map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/95 z-50 md:hidden">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 bg-gray-800 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-2xl p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Category</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 8).map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setShowMobileFilters(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-sm ${category === cat ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-2xl p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Filters</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["trending", "new", "popular", "rated"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                          setShowMobileFilters(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-sm capitalize ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Latest Seasons Slideshow */}
        {latestSeasons.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaFire className="text-orange-500" />
              Latest Seasons
            </h2>

            <div
              ref={slideshowRef}
              className="relative rounded-xl md:rounded-2xl overflow-hidden group"
              onMouseEnter={handleSlideshowMouseEnter}
              onMouseLeave={handleSlideshowMouseLeave}
            >
              {/* Slides */}
              <div className="relative h-48 sm:h-64 md:h-96">
                {latestSeasons.map((series, index) => (
                  <div
                    key={`${series.id}-s${series.latestSeason}`}
                    className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    <img
                      src={series.seasonPoster || series.poster}
                      alt={`${series.title} Season ${series.latestSeason}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    {/* Slide Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold">
                          NEW SEASON
                        </span>
                        <span className="text-xs md:text-sm text-gray-300">
                          Season {series.latestSeason}
                        </span>
                      </div>

                      <h3 className="text-lg md:text-3xl font-bold text-white mb-2">
                        {series.title}
                      </h3>

                      <div className="flex items-center gap-4 mb-3">
                        {getRatingStars(series.rating)}
                        <span className="text-xs md:text-sm text-gray-400">
                          {series.episodeCount} Episodes
                        </span>
                      </div>

                      <button
                        onClick={() => handlePlayLatestSeason(series)}
                        className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm md:text-base font-medium text-white flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all"
                      >
                        <FaPlay size={12} /> Watch Latest Season
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-2 md:p-3 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaChevronLeft size={16} className="md:text-xl" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-2 md:p-3 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaChevronRight size={16} className="md:text-xl" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 md:gap-2">
                {latestSeasons.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all ${index === currentSlideIndex
                      ? 'w-4 md:w-6 h-1.5 md:h-2 bg-purple-600 rounded-full'
                      : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-gray-400 rounded-full hover:bg-white'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-6 mb-6 md:mb-12">
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-800/50">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-purple-600/20 rounded-lg md:rounded-xl">
                <FaTv className="text-purple-400 text-sm md:text-xl" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold text-white">{allSeries.length}</div>
                <div className="text-[10px] md:text-sm text-gray-400">Series</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-800/50">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-blue-600/20 rounded-lg md:rounded-xl">
                <FaPlay className="text-blue-400 text-sm md:text-xl" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold text-white">
                  {allSeries.reduce((total, s) => total + getEpisodesForSeries(s.id).length, 0)}
                </div>
                <div className="text-[10px] md:text-sm text-gray-400">Episodes</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-800/50">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-pink-600/20 rounded-lg md:rounded-xl">
                <FaUsers className="text-pink-400 text-sm md:text-xl" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold text-white">{categories.length - 1}</div>
                <div className="text-[10px] md:text-sm text-gray-400">Genres</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-800/50">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-emerald-600/20 rounded-lg md:rounded-xl">
                <FaFire className="text-emerald-400 text-sm md:text-xl" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold text-white">{allSeries.filter(s => calculatePopularity(s) > 100).length}</div>
                <div className="text-[10px] md:text-sm text-gray-400">Trending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Search and Filter - Hidden on Mobile */}
        <div className="hidden md:block mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
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
        </div>

        {/* Quick Filter Tabs - Mobile Horizontal Scroll */}
        <div className="mb-4 md:mb-6">
          <div
            ref={tabsContainerRef}
            className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 scrollbar-hide touch-pan-x"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {["all", "trending", "new", "action", "drama", "comedy", "sci-fi", "fantasy", "thriller", "horror", "romance", "documentary"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full whitespace-nowrap text-xs md:text-sm transition-all flex-shrink-0 ${activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg'
                  : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Series Grid/List */}
        <div className="mb-0 md:mb-0">
          {/* Header - Hidden on Mobile */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {activeTab === "all" ? "All Series" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + " Series"}
              <span className="text-gray-500 ml-2">({filteredSeries.length})</span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-white'}`}
              >
                <FaTh size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-white'}`}
              >
                <FaList size={20} />
              </button>
            </div>
          </div>

          {/* Grid View - Mobile Optimized */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
              {filteredSeries.slice(0, visible).map((series) => {
                const seriesEpisodes = getEpisodesForSeries(series.id);
                const isFavorite = favorites.includes(series.id);
                const inWatchlist = watchlist.includes(series.id);

                return (
                  <div
                    key={series.id}
                    className="group relative bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02]"
                    onClick={() => {
                      setSelectedSeries(series);
                      setShowSeriesDetails(true);
                    }}
                  >
                    {/* Series Image */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={series.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"}
                        alt={series.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                      {/* Mobile Action Buttons - Hidden initially */}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(series.id);
                          }}
                          className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${isFavorite
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-black/40 text-white hover:bg-red-500/20 hover:text-red-400'}`}
                        >
                          <FaHeart size={12} className={isFavorite ? "fill-current" : ""} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(series.id);
                          }}
                          className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${inWatchlist
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-black/40 text-white hover:bg-blue-500/20 hover:text-blue-400'}`}
                        >
                          <FaBookmark size={12} className={inWatchlist ? "fill-current" : ""} />
                        </button>
                      </div>

                      {/* Episode Count Badge */}
                      <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2">
                        <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] md:text-xs font-medium text-white">
                          {seriesEpisodes.length} EP
                        </span>
                      </div>

                      {/* Play Button Overlay - Mobile */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 md:hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayFirstEpisode(series);
                          }}
                          className="w-8 h-8 bg-purple-600/90 rounded-full flex items-center justify-center"
                        >
                          <FaPlay size={12} className="text-white ml-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Series Info */}
                    <div className="p-2 md:p-3">
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-white line-clamp-1 mb-1">
                        {series.title}
                      </h3>

                      <div className="flex items-center justify-between mb-1">
                        {getRatingStars(series.rating)}
                        <span className="text-[10px] text-gray-500">{series.year || 'N/A'}</span>
                      </div>

                      {/* Mobile Action Buttons */}
                      <div className="flex items-center justify-between mt-2 md:hidden">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(series.id);
                            }}
                            className={`p-1 rounded ${isFavorite ? 'text-red-400' : 'text-gray-500'}`}
                          >
                            <FaHeart size={12} className={isFavorite ? "fill-current" : ""} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(series.id);
                            }}
                            className={`p-1 rounded ${inWatchlist ? 'text-blue-400' : 'text-gray-500'}`}
                          >
                            <FaBookmark size={12} className={inWatchlist ? "fill-current" : ""} />
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayFirstEpisode(series);
                          }}
                          className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-[10px] font-medium text-white flex items-center gap-1"
                        >
                          <FaPlay size={8} /> Play
                        </button>
                      </div>

                      {/* Desktop Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayFirstEpisode(series);
                        }}
                        className="hidden md:flex mt-3 w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xs font-medium text-white items-center justify-center gap-2 transition-all"
                      >
                        <FaPlay size={10} /> Watch Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View - Mobile Optimized */
            <div className="space-y-2 md:space-y-3">
              {filteredSeries.slice(0, visible).map((series) => {
                const seriesEpisodes = getEpisodesForSeries(series.id);
                const isFavorite = favorites.includes(series.id);

                return (
                  <div
                    key={series.id}
                    className="group bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-2 md:p-4 hover:bg-gray-900/70 transition-all border border-gray-800/50 hover:border-purple-500/30"
                    onClick={() => {
                      setSelectedSeries(series);
                      setShowSeriesDetails(true);
                    }}
                  >
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="relative w-12 h-16 md:w-20 md:h-24 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={series.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"}
                          alt={series.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="text-sm md:text-base font-bold text-white mb-0.5 line-clamp-1">{series.title}</h3>
                            <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400 flex-wrap">
                              <span>{series.year || 'N/A'}</span>
                              <span>•</span>
                              <span>{seriesEpisodes.length} EP</span>
                              <span>•</span>
                              <span>{series.nation || 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2">
                            {getRatingStars(series.rating)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(series.id);
                              }}
                              className={`p-1 md:p-1.5 ${isFavorite ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}
                            >
                              <FaHeart size={10} className="md:text-sm" />
                            </button>
                          </div>
                        </div>

                        {series.category && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {series.category.split(',').slice(0, 2).map((cat, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-gray-800/50 rounded text-[8px] md:text-xs text-gray-400">
                                {cat.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayFirstEpisode(series);
                          }}
                          className="mt-2 md:mt-3 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-[10px] md:text-xs font-medium text-white flex items-center gap-1 w-fit"
                        >
                          <FaPlay size={8} /> Watch Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {visible < filteredSeries.length && (
            <div className="text-center mt-4 md:mt-8">
              <button
                onClick={() => setVisible(v => v + (viewMode === "grid" ? 6 : 5))}
                className="px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 rounded-lg md:rounded-xl text-sm md:text-base font-medium text-white border border-gray-700/50 transition-all hover:scale-105"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Series Details Modal - Mobile Optimized */}
      {showSeriesDetails && selectedSeries && (
        <div className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl md:rounded-3xl max-w-6xl w-full border border-gray-800/50 my-2 md:my-8">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowSeriesDetails(false);
                  setSelectedSeries(null);
                }}
                className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 md:p-3 bg-black/50 backdrop-blur-sm rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={16} className="md:text-xl" />
              </button>

              {/* Modal Content */}
              <div className="p-3 md:p-8">
                {/* Header with Background Image */}
                <div className="relative h-32 sm:h-48 md:h-64 -mx-3 -mt-3 md:-mx-8 md:-mt-8 mb-4 md:mb-8 rounded-t-xl md:rounded-t-3xl overflow-hidden">
                  <img
                    src={selectedSeries.background || selectedSeries.poster}
                    alt={selectedSeries.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

                  {/* Series Title Overlay */}
                  <div className="absolute bottom-2 left-3 right-3 md:bottom-8 md:left-8">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2 line-clamp-2">
                      {selectedSeries.title}
                    </h2>
                    <div className="flex items-center flex-wrap gap-2 md:gap-4">
                      {getRatingStars(selectedSeries.rating)}
                      <span className="text-xs md:text-base text-gray-300">{selectedSeries.year}</span>
                      <span className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">
                        {selectedSeries.nation || 'International'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
                  <button
                    onClick={() => handlePlayFirstEpisode(selectedSeries)}
                    className="flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg md:rounded-xl text-sm md:text-base font-semibold text-white flex items-center justify-center gap-2"
                  >
                    <FaPlay size={12} className="md:text-base" /> Watch
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedSeries.id)}
                    className={`p-2 md:p-3 rounded-lg md:rounded-xl ${favorites.includes(selectedSeries.id)
                      ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                      : 'bg-gray-800/50 text-gray-300 hover:text-red-400'}`}
                  >
                    <FaHeart size={14} className="md:text-xl" />
                  </button>
                  <button
                    onClick={() => toggleWatchlist(selectedSeries.id)}
                    className={`p-2 md:p-3 rounded-lg md:rounded-xl ${watchlist.includes(selectedSeries.id)
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                      : 'bg-gray-800/50 text-gray-300 hover:text-blue-400'}`}
                  >
                    <FaBookmark size={14} className="md:text-xl" />
                  </button>
                </div>

                {/* Description */}
                {selectedSeries.description && (
                  <div className="mb-4 md:mb-8">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-2">Synopsis</h3>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed line-clamp-3 md:line-clamp-none">
                      {selectedSeries.description}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
                  <div className="bg-gray-800/30 rounded-lg md:rounded-xl p-2 md:p-4">
                    <div className="text-[10px] md:text-sm text-gray-400">Seasons</div>
                    <div className="text-base md:text-2xl font-bold text-white">
                      {getSeasons(getEpisodesForSeries(selectedSeries.id)).length}
                    </div>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg md:rounded-xl p-2 md:p-4">
                    <div className="text-[10px] md:text-sm text-gray-400">Episodes</div>
                    <div className="text-base md:text-2xl font-bold text-white">
                      {getEpisodesForSeries(selectedSeries.id).length}
                    </div>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg md:rounded-xl p-2 md:p-4">
                    <div className="text-[10px] md:text-sm text-gray-400">Status</div>
                    <div className="text-xs md:text-lg font-bold text-emerald-400">Available</div>
                  </div>
                </div>

                {/* Genres */}
                {selectedSeries.category && (
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-8">
                    {selectedSeries.category.split(',').map((cat, i) => (
                      <span key={i} className="px-2 md:px-4 py-1 md:py-2 bg-gray-800/50 rounded-lg md:rounded-xl text-[10px] md:text-sm text-gray-300">
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Episodes Section */}
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-xl font-bold text-white">Episodes</h3>
                    <select
                      value={1}
                      onChange={(e) => { }}
                      className="px-2 md:px-4 py-1.5 md:py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg md:rounded-xl text-xs md:text-sm text-white"
                    >
                      {getSeasons(getEpisodesForSeries(selectedSeries.id)).map(season => (
                        <option key={season} value={season}>S{season}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto pr-1">
                    {sortEpisodes(getEpisodesForSeries(selectedSeries.id))
                      .filter(ep => (parseInt(ep.seasonNumber) || 1) === 1)
                      .map(episode => (
                        <div
                          key={episode.id}
                          className="flex items-center justify-between p-2 md:p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg md:rounded-xl transition-colors cursor-pointer group"
                          onClick={() => {
                            handlePlayEpisode(selectedSeries, episode);
                            setShowSeriesDetails(false);
                          }}
                        >
                          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] md:text-xs font-bold">{episode.episodeNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs md:text-sm font-medium text-white group-hover:text-purple-300 transition-colors truncate">
                                {episode.title}
                              </h4>
                              {episode.duration && (
                                <p className="text-[10px] text-gray-500">{episode.duration}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayEpisode(selectedSeries, episode);
                              setShowSeriesDetails(false);
                            }}
                            className="p-1.5 md:p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg text-purple-400 flex-shrink-0"
                          >
                            <FaPlay size={10} className="md:text-sm" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}