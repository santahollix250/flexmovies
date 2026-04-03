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
  FaClock, FaLayerGroup, FaPlayCircle, FaCheckCircle, FaCloudDownloadAlt,
  FaTrashAlt, FaFileDownload, FaArrowUp
} from "react-icons/fa";

export default function Series() {
  // ========== ALL HOOKS ==========
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Download and watch tracking states
  const [downloadedEpisodes, setDownloadedEpisodes] = useState({});
  const [watchedEpisodes, setWatchedEpisodes] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});
  const [showDownloadOptions, setShowDownloadOptions] = useState(null);
  const [showDownloadManager, setShowDownloadManager] = useState(false);

  // Slideshow state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Refs
  const slideshowTimerRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const slideshowRef = useRef(null);
  const searchInputRef = useRef(null);
  const mainContentRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);

  // Context
  const navigate = useNavigate();
  const { movies, episodes = [], getEpisodesBySeries } = useContext(MoviesContext);

  // ========== HELPER FUNCTIONS ==========
  const getEpisodesForSeries = (seriesId) => {
    if (!seriesId) return [];
    if (typeof getEpisodesBySeries === 'function') {
      return getEpisodesBySeries(seriesId);
    }
    return episodes.filter(ep =>
      ep.seriesId === seriesId ||
      ep.movieId === seriesId ||
      ep.series_id === seriesId ||
      (ep.series && ep.series.id === seriesId)
    );
  };

  const getSeasons = (episodesArray) => {
    if (!episodesArray || !Array.isArray(episodesArray)) return [];
    const seasons = new Set();
    episodesArray.forEach(ep => {
      seasons.add(parseInt(ep.seasonNumber) || 1);
    });
    return Array.from(seasons).sort((a, b) => a - b);
  };

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

  const markAsWatched = (episodeId, progress = 100) => {
    setWatchedEpisodes(prev => ({
      ...prev,
      [episodeId]: {
        watched: true,
        progress: progress,
        lastWatched: new Date().toISOString()
      }
    }));
  };

  const removeDownload = (episodeId) => {
    setDownloadedEpisodes(prev => {
      const newState = { ...prev };
      delete newState[episodeId];
      return newState;
    });
    setDownloadProgress(prev => {
      const newState = { ...prev };
      delete newState[episodeId];
      return newState;
    });
  };

  const getSeasonDownloadSize = (seasonNumber) => {
    if (!selectedSeries) return '0 MB';
    const seasonEpisodes = sortEpisodes(getEpisodesForSeries(selectedSeries.id))
      .filter(ep => (parseInt(ep.seasonNumber) || 1) === seasonNumber);
    let totalSize = 0;
    seasonEpisodes.forEach(ep => {
      const download = downloadedEpisodes[ep.id];
      if (download) {
        const sizeStr = download.size || '0';
        const sizeNum = parseFloat(sizeStr.replace('~', '').replace(' GB', '').replace(' MB', ''));
        if (sizeStr.includes('GB')) {
          totalSize += sizeNum * 1024;
        } else {
          totalSize += sizeNum;
        }
      }
    });
    if (totalSize > 1024) {
      return `${(totalSize / 1024).toFixed(1)} GB`;
    }
    return `${totalSize.toFixed(0)} MB`;
  };

  // ========== useMemo ==========
  const allSeries = useMemo(() => {
    return Array.isArray(movies) ? movies.filter(m => m && m.type === "series") : [];
  }, [movies]);

  const categories = useMemo(() => {
    const set = new Set();
    if (Array.isArray(allSeries)) {
      allSeries.forEach((s) => {
        if (s && s.category) {
          const cats = s.category.split(',').map(cat => cat.trim());
          cats.forEach(cat => set.add(cat));
        }
      });
    }
    return ["all", ...Array.from(set)].sort();
  }, [allSeries]);

  const calculatePopularity = (series) => {
    if (!series) return 0;
    const episodeCount = getEpisodesForSeries(series.id).length;
    const rating = parseFloat(series.rating) || 5;
    return episodeCount * 10 + rating * 20;
  };

  // Get latest seasons for slideshow
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
  }, [allSeries]);

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
  }, [allSeries, sortBy]);

  const filteredSeries = useMemo(() => {
    let filtered = sortedSeries.filter((s) => {
      if (!s) return false;
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

  // ========== useEffect for infinite scroll ==========
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress percentage
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(scrollPercent);

      // Show/hide scroll to top button
      setShowScrollTop(scrollTop > 300);

      // Auto load more content when near bottom
      if (loadMoreTriggerRef.current && visible < filteredSeries.length) {
        const triggerElement = loadMoreTriggerRef.current;
        const triggerPosition = triggerElement.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // When the trigger element comes into view (with some offset)
        if (triggerPosition <= windowHeight + 100) {
          loadMoreContent();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible, filteredSeries.length]);

  // Auto load more content function with animation
  const loadMoreContent = () => {
    if (visible < filteredSeries.length) {
      // Add loading animation class
      if (loadMoreTriggerRef.current) {
        loadMoreTriggerRef.current.classList.add('animate-pulse');
      }

      // Load more items
      setTimeout(() => {
        setVisible(prev => {
          const increment = viewMode === "grid" ? 6 : 5;
          const newVisible = Math.min(prev + increment, filteredSeries.length);
          return newVisible;
        });

        // Remove animation class
        setTimeout(() => {
          if (loadMoreTriggerRef.current) {
            loadMoreTriggerRef.current.classList.remove('animate-pulse');
          }
        }, 500);
      }, 300);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ========== useEffect ==========
  useEffect(() => {
    const savedWatched = localStorage.getItem('watchedEpisodes');
    const savedDownloaded = localStorage.getItem('downloadedEpisodes');
    if (savedWatched) setWatchedEpisodes(JSON.parse(savedWatched));
    if (savedDownloaded) setDownloadedEpisodes(JSON.parse(savedDownloaded));
  }, []);

  useEffect(() => {
    localStorage.setItem('watchedEpisodes', JSON.stringify(watchedEpisodes));
  }, [watchedEpisodes]);

  useEffect(() => {
    localStorage.setItem('downloadedEpisodes', JSON.stringify(downloadedEpisodes));
  }, [downloadedEpisodes]);

  // Slideshow auto-play
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

  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  useEffect(() => {
    if (selectedSeries) {
      const seasons = getSeasons(getEpisodesForSeries(selectedSeries.id));
      if (seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      }
    }
  }, [selectedSeries]);

  // ========== EVENT HANDLERS ==========
  const handleDownloadWithQuality = (episode, quality) => {
    if (!episode) return;
    setDownloadProgress(prev => ({ ...prev, [episode.id]: 0 }));
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const currentProgress = prev[episode.id] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setDownloadedEpisodes(prevDownloaded => ({
            ...prevDownloaded,
            [episode.id]: {
              downloaded: true,
              quality: quality,
              downloadedAt: new Date().toISOString(),
              size: quality === '4K' ? '~4.5 GB' : quality === '1080p' ? '~1.8 GB' : quality === '720p' ? '~800 MB' : '~350 MB',
              title: episode.title,
              episodeNumber: episode.episodeNumber,
              seasonNumber: episode.seasonNumber || selectedSeason
            }
          }));
          alert(`✅ Downloaded: ${episode.title} (${quality})`);
          return { ...prev, [episode.id]: 100 };
        }
        return { ...prev, [episode.id]: currentProgress + 10 };
      });
    }, 300);
    setShowDownloadOptions(null);
  };

  const handlePlayEpisode = (series, episode) => {
    if (!series || !episode) return;
    markAsWatched(episode.id, 100);
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const episodeIndex = sortedEpisodes.findIndex(ep => ep.id === episode.id);
    navigate(`/series-player/${series.id}`, {
      state: {
        series: series,
        episode: episode,
        episodes: sortedEpisodes,
        episodeIndex: episodeIndex
      }
    });
  };

  const handlePlayFirstEpisode = (series) => {
    if (!series) return;
    const episodes = getEpisodesForSeries(series.id);
    if (episodes.length > 0) {
      const firstEpisode = sortEpisodes(episodes)[0];
      markAsWatched(firstEpisode.id, 100);
      navigate(`/series-player/${series.id}`, {
        state: {
          series: series,
          episode: firstEpisode,
          episodes: sortEpisodes(episodes),
          episodeIndex: 0
        }
      });
    }
  };

  const handlePlayLatestSeason = (series) => {
    if (!series) return;
    const episodes = getEpisodesForSeries(series.id);
    if (episodes.length > 0) {
      const seasons = getSeasons(episodes);
      const latestSeason = Math.max(...seasons);
      const seasonEpisodes = episodes.filter(ep =>
        (parseInt(ep.seasonNumber) || 1) === latestSeason
      );
      if (seasonEpisodes.length > 0) {
        const firstEpisodeOfLatestSeason = seasonEpisodes[0];
        markAsWatched(firstEpisodeOfLatestSeason.id, 100);
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
            className={`text-[10px] sm:text-xs ${i < fullStars ? 'text-yellow-500' : (hasHalfStar && i === fullStars) ? 'text-yellow-500' : 'text-gray-700'}`}
          />
        ))}
        <span className="ml-1 text-[10px] sm:text-xs font-medium text-gray-300">
          {normalizedRating.toFixed(1)}
        </span>
      </div>
    );
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 pt-0 pb-0">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 md:w-80 h-40 md:h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 md:w-80 h-40 md:h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-800/30">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Scroll to Top Button with Animation */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white shadow-lg hover:scale-110 transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
      >
        <FaArrowUp size={20} />
      </button>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-950 via-gray-950 to-transparent pt-2 pb-2 px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              Series
            </h1>
          </div>
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 bg-gray-800 rounded-full text-white"
          >
            <FaSearch size={16} />
          </button>
        </div>

        {showMobileSearch && (
          <div className="mt-3 animate-slideDown">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search series..."
                className="w-full pl-9 pr-9 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <FaTimes size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-fadeIn">
              Series
            </h1>
            <p className="text-gray-400 mt-2 animate-slideUp">Discover and watch your favorite series</p>
          </div>
          <button
            onClick={() => setShowDownloadManager(true)}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-white flex items-center gap-2 transition-all border border-gray-700/50 hover:scale-105"
          >
            <FaDownload className="text-green-400" />
            Downloads
            {Object.keys(downloadedEpisodes).length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-green-600/20 text-green-400 rounded-full text-xs">
                {Object.keys(downloadedEpisodes).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Download Manager Modal */}
      {showDownloadManager && (
        <div className="fixed inset-0 bg-black/98 z-50 flex items-start justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl max-w-2xl w-full border border-gray-800/50 my-8 animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaDownload className="text-green-400" />
                  Downloads
                  <span className="text-sm text-gray-400 ml-2">({Object.keys(downloadedEpisodes).length})</span>
                </h3>
                <button
                  onClick={() => setShowDownloadManager(false)}
                  className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-all hover:scale-110"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {Object.keys(downloadedEpisodes).length === 0 ? (
                <div className="text-center py-12 animate-fadeIn">
                  <FaCloudDownloadAlt className="text-5xl text-gray-600 mx-auto mb-3 animate-bounce" />
                  <p className="text-gray-400">No downloads yet</p>
                  <p className="text-sm text-gray-600 mt-1">Download episodes to watch offline</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(downloadedEpisodes).map(([epId, info]) => {
                    let seriesTitle = "Unknown";
                    let series = allSeries.find(s => {
                      const eps = getEpisodesForSeries(s.id);
                      return eps.some(ep => ep.id === epId);
                    });
                    if (series) seriesTitle = series.title;

                    return (
                      <div key={epId} className="bg-gray-800/30 rounded-xl p-4 flex items-center gap-4 animate-slideIn">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaCheckCircle className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{info.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>{seriesTitle}</span>
                            <span>•</span>
                            <span>S{info.seasonNumber}E{info.episodeNumber}</span>
                            <span>•</span>
                            <span className="text-green-400">{info.quality}</span>
                            <span>•</span>
                            <span>{info.size}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDownload(epId)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 transition-all hover:scale-110"
                          title="Remove download"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Latest Seasons Slideshow - RESPONSIVE FOR ALL DEVICES */}
        {latestSeasons.length > 0 && (
          <div className="mb-4 sm:mb-6 md:mb-12 animate-fadeIn">
            <h2 className="text-base sm:text-lg md:text-2xl font-bold text-white mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-2">
              <FaFire className="text-orange-500 text-sm sm:text-base md:text-xl animate-pulse" />
              Latest Seasons
            </h2>

            <div
              ref={slideshowRef}
              className="relative rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden group"
              onMouseEnter={handleSlideshowMouseEnter}
              onMouseLeave={handleSlideshowMouseLeave}
            >
              <div className="relative h-40 sm:h-56 md:h-80 lg:h-96">
                {latestSeasons.map((series, index) => (
                  <div
                    key={`${series.id}-s${series.latestSeason}`}
                    className={`absolute inset-0 transition-all duration-700 transform ${index === currentSlideIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105 pointer-events-none'
                      }`}
                  >
                    <img
                      src={series.seasonPoster || series.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"}
                      alt={`${series.title} Season ${series.latestSeason}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                    {/* Mobile optimized content */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8 animate-slideUp">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-[8px] sm:text-xs font-bold animate-pulse">
                          NEW
                        </span>
                        <span className="text-[8px] sm:text-xs md:text-sm text-gray-300">
                          Season {series.latestSeason}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-base md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 line-clamp-1">
                        {series.title}
                      </h3>

                      <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
                        {getRatingStars(series.rating)}
                      </div>

                      <button
                        onClick={() => handlePlayLatestSeason(series)}
                        className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md sm:rounded-lg text-[8px] sm:text-xs md:text-sm font-medium text-white flex items-center gap-1 sm:gap-2 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105"
                      >
                        <FaPlay size={8} className="sm:text-xs md:text-sm" /> Watch Latest Season
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows - Hidden on mobile, visible on tablet/desktop */}
              <button
                onClick={prevSlide}
                className="hidden sm:block absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 md:p-3 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <FaChevronLeft size={12} className="sm:text-sm md:text-base lg:text-xl" />
              </button>

              <button
                onClick={nextSlide}
                className="hidden sm:block absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 md:p-3 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <FaChevronRight size={12} className="sm:text-sm md:text-base lg:text-xl" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-1.5 md:gap-2">
                {latestSeasons.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 ${index === currentSlideIndex
                        ? 'w-4 sm:w-5 md:w-6 h-1 sm:h-1.5 md:h-2 bg-purple-600 rounded-full'
                        : 'w-1 sm:w-1.5 md:w-2 h-1 sm:h-1.5 md:h-2 bg-gray-400 rounded-full hover:bg-white hover:scale-110'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Search/Filter */}
        <div className="md:hidden mb-4 animate-fadeIn">
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm transition-all focus:border-purple-500"
            >
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
              <option value="episodes">Most Episodes</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm transition-all focus:border-purple-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "all" ? "All" : cat}</option>
              ))}
            </select>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-gray-500">
            {filteredSeries.length} series found
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:block mb-8 animate-slideUp">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search series, genres, or actors..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              >
                <option value="all">All Genres</option>
                {categories.filter(c => c !== "all").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="episodes">Most Episodes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filter Tabs - Desktop Only */}
        <div className="hidden md:block mb-6">
          <div
            ref={tabsContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {["all", "trending", "new", "action", "drama", "comedy", "sci-fi", "fantasy", "thriller", "horror", "romance", "documentary"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all flex-shrink-0 transform hover:scale-105 ${activeTab === tab
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Series Grid/List */}
        <div className="mb-0">
          {/* Desktop Title */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white animate-fadeIn">
              {activeTab === "all" ? "All Series" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + " Series"}
              <span className="text-gray-500 ml-2">({filteredSeries.length})</span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${viewMode === "grid" ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-white'
                  }`}
              >
                <FaTh size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${viewMode === "list" ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-white'
                  }`}
              >
                <FaList size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Grid */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {filteredSeries.slice(0, visible).map((series, index) => {
                const seriesEpisodes = getEpisodesForSeries(series.id);

                return (
                  <div
                    key={series.id}
                    className="bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:border-purple-500/50 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handlePlayFirstEpisode(series)}
                  >
                    <div className="relative aspect-[2/3]">
                      <img
                        src={series.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"}
                        alt={series.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                      {/* Episode count badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                          {seriesEpisodes.length} EP
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <h3 className="text-xs font-bold text-white line-clamp-1">
                        {series.title}
                      </h3>
                      <div className="mt-1">
                        {getRatingStars(series.rating)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Grid/List */}
          <div className="hidden md:block">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSeries.slice(0, visible).map((series, index) => {
                  const seriesEpisodes = getEpisodesForSeries(series.id);
                  const isFavorite = favorites.includes(series.id);
                  const inWatchlist = watchlist.includes(series.id);
                  const downloadedCount = Object.keys(downloadedEpisodes).filter(epId =>
                    seriesEpisodes.some(ep => ep.id === epId
                    )).length;

                  return (
                    <div
                      key={series.id}
                      className="group relative bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 cursor-pointer animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => handlePlayFirstEpisode(series)}
                    >
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <img
                          src={series.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"}
                          alt={series.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                        <div className="absolute bottom-2 left-2">
                          <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white">
                            {seriesEpisodes.length} Episodes
                          </span>
                        </div>

                        {downloadedCount > 0 && (
                          <div className="absolute bottom-2 right-2">
                            <span className="px-2 py-1 bg-green-600/90 backdrop-blur-sm rounded text-xs font-medium text-white flex items-center gap-1 animate-pulse">
                              <FaDownload size={10} />
                              {downloadedCount}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <FaPlay size={16} className="text-white ml-1" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white line-clamp-1 mb-2">
                          {series.title}
                        </h3>

                        <div className="flex items-center justify-between">
                          {getRatingStars(series.rating)}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(series.id);
                              }}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${isFavorite ? 'text-red-400 bg-red-600/20' : 'text-gray-500 hover:text-red-400 hover:bg-red-600/20'
                                }`}
                            >
                              <FaHeart size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWatchlist(series.id);
                              }}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${inWatchlist ? 'text-blue-400 bg-blue-600/20' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-600/20'
                                }`}
                            >
                              <FaBookmark size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSeries.slice(0, visible).map((series, index) => {
                  const seriesEpisodes = getEpisodesForSeries(series.id);
                  const isFavorite = favorites.includes(series.id);
                  const downloadedCount = Object.keys(downloadedEpisodes).filter(epId =>
                    seriesEpisodes.some(ep => ep.id === epId
                    )).length;

                  return (
                    <div
                      key={series.id}
                      className="group bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-4 hover:bg-gray-900/70 transition-all border border-gray-800/50 hover:border-purple-500/30 cursor-pointer animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => handlePlayFirstEpisode(series)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={series.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"}
                            alt={series.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {downloadedCount > 0 && (
                            <div className="absolute bottom-1 right-1 bg-green-600 rounded px-1 py-0.5">
                              <span className="text-[8px] text-white flex items-center gap-0.5">
                                <FaDownload size={6} /> {downloadedCount}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-1">{series.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>{series.year || 'N/A'}</span>
                                <span>•</span>
                                <span>{seriesEpisodes.length} Episodes</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getRatingStars(series.rating)}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(series.id);
                                }}
                                className={`p-2 transition-all hover:scale-110 ${isFavorite ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
                                  }`}
                              >
                                <FaHeart size={16} />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayFirstEpisode(series);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-medium text-white flex items-center gap-2 w-fit transition-all hover:scale-105"
                          >
                            <FaPlay size={10} /> Watch Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Auto Load More Trigger - This triggers loading when scrolled into view */}
          {visible < filteredSeries.length && (
            <div
              ref={loadMoreTriggerRef}
              className="text-center mt-6 md:mt-8 py-4 transition-all duration-300"
            >
              <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-800 to-black rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white border border-gray-700/50">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                Loading more series...
              </div>
            </div>
          )}

          {/* End of content message */}
          {visible >= filteredSeries.length && filteredSeries.length > 0 && (
            <div className="text-center mt-8 md:mt-12 py-8 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/30 rounded-full">
                <FaCheckCircle className="text-green-400 text-sm" />
                <span className="text-gray-400 text-sm">You've reached the end! 🎉</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}