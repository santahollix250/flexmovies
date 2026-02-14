import React, { useState, useMemo, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoviesContext } from "../context/MoviesContext";
import {
  FaSearch, FaStar, FaPlay, FaHeart,
  FaBookmark, FaCalendarAlt,
  FaList, FaTv, FaUsers, FaFire, FaChevronRight,
  FaGlobe, FaTimes,
  FaRegHeart, FaRegBookmark, FaExpand, FaPause,
  FaVolumeMute, FaVolumeUp, FaForward, FaBackward,
  FaChevronLeft, FaChevronUp, FaChevronDown, FaSpinner,
  FaExclamationTriangle, FaBars, FaTh, FaFilter,
  FaEllipsisV, FaShare, FaDownload, FaInfoCircle,
  FaClock, FaLayerGroup, FaPlayCircle
} from "react-icons/fa";

export default function Series() {
  const navigate = useNavigate();
  const { movies, episodes = [], getEpisodesBySeries } = useContext(MoviesContext);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(6); // Reduced for mobile
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

  // Player state
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showEpisodeList, setShowEpisodeList] = useState(true);

  // Video player controls
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [isVimeoVideo, setIsVimeoVideo] = useState(false);
  const [isDailyMotionVideo, setIsDailyMotionVideo] = useState(false);

  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const filterPanelRef = useRef(null);

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

  // Cleanup function for video
  const cleanupVideo = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      } catch (e) {
        console.log("Cleanup error:", e);
      }
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

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

  // Detect video platform
  const detectVideoPlatform = (url) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com')) {
      return 'youtube';
    } else if (url.includes('vimeo.com') || url.includes('player.vimeo.com')) {
      return 'vimeo';
    } else if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
      return 'dailymotion';
    } else {
      return 'direct';
    }
  };

  // Get embed URLs
  const getYouTubeEmbedUrl = (url) => {
    let videoId = '';
    const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
    if (watchMatch) videoId = watchMatch[1];
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) videoId = shortMatch[1];
    const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
    if (embedMatch) videoId = embedMatch[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1`;
    }
    return url;
  };

  const getVimeoEmbedUrl = (url) => {
    let videoId = '';
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) videoId = match[1];
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0&controls=1`;
    }
    return url;
  };

  const getDailyMotionEmbedUrl = (url) => {
    let videoId = '';
    const match = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (match) videoId = match[1];
    if (videoId) {
      return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&queue-autoplay-next=0&queue-enable=0&sharing-enable=0&ui-logo=0&ui-start-screen-info=0&controls=1`;
    }
    return url;
  };

  // Handle series click
  const handleSeriesClick = async (series) => {
    setLoadingEpisodes(true);
    setSelectedSeries(series);
    setShowSeriesDetails(true);
    setSelectedSeason(1);
    setTimeout(() => setLoadingEpisodes(false), 500);
  };

  // Handle play episode
  const handlePlayEpisode = (series, episode) => {
    cleanupVideo();

    const videoUrl = episode.videoUrl || episode.streamLink || '';
    const platform = detectVideoPlatform(videoUrl);

    setIsYouTubeVideo(platform === 'youtube');
    setIsVimeoVideo(platform === 'vimeo');
    setIsDailyMotionVideo(platform === 'dailymotion');

    setCurrentSeries(series);
    setCurrentEpisode({
      ...episode,
      embedUrl: platform === 'youtube' ? getYouTubeEmbedUrl(videoUrl) :
        platform === 'vimeo' ? getVimeoEmbedUrl(videoUrl) :
          platform === 'dailymotion' ? getDailyMotionEmbedUrl(videoUrl) :
            videoUrl
    });

    setSelectedSeason(parseInt(episode.seasonNumber) || 1);
    setShowPlayer(true);
    setShowSeriesDetails(false);
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setVideoError(false);
    setVideoLoading(true);
    setErrorMessage("");

    abortControllerRef.current = new AbortController();
  };

  // Handle play first episode
  const handlePlayFirstEpisode = (series) => {
    const episodes = getEpisodesForSeries(series.id);
    if (episodes.length > 0) {
      const firstEpisode = sortEpisodes(episodes)[0];
      handlePlayEpisode(series, firstEpisode);
    }
  };

  // Close player
  const handleClosePlayer = () => {
    cleanupVideo();
    setShowPlayer(false);
    setCurrentSeries(null);
    setCurrentEpisode(null);
    setIsYouTubeVideo(false);
    setIsVimeoVideo(false);
    setIsDailyMotionVideo(false);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
  };

  // Video player controls
  const handlePlayPause = () => {
    if (!videoRef.current || videoError || isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
            setVideoError(false);
          })
          .catch(err => {
            console.log("Play prevented:", err);
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              setVideoError(true);
              setErrorMessage("Unable to play video. Please try again.");
            }
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || videoError || isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) return;
    try {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 0;
      setCurrentTime(current);
      setProgress(total > 0 ? current / total : 0);
      setDuration(total);
    } catch (e) {
      console.log("Time update error:", e);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current && !isYouTubeVideo && !isVimeoVideo && !isDailyMotionVideo) {
      videoRef.current.volume = newVolume;
    }
    setMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    if (!videoRef.current || isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  const handleSeek = (e) => {
    if (isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) return;

    const seekTo = parseFloat(e.target.value);
    setProgress(seekTo);
    if (videoRef.current && !isNaN(videoRef.current.duration)) {
      const newTime = seekTo * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleForward = (seconds = 10) => {
    if (!videoRef.current || isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) return;
    videoRef.current.currentTime += seconds;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleRewind = (seconds = 10) => {
    if (!videoRef.current || isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
    setCurrentTime(videoRef.current.currentTime);
  };

  const handlePlaybackRate = (rate) => {
    if (!videoRef.current || isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleFullscreen = () => {
    const element = playerContainerRef.current;
    if (!element) return;

    try {
      if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (e) {
      console.log("Fullscreen error:", e);
    }
  };

  const handleVideoError = (e) => {
    console.error("Video error:", e);
    setVideoError(true);
    setVideoLoading(false);
    setPlaying(false);

    if (videoRef.current && videoRef.current.error) {
      const error = videoRef.current.error;
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          setErrorMessage("Video playback was aborted.");
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          setErrorMessage("Network error occurred while loading video.");
          break;
        case MediaError.MEDIA_ERR_DECODE:
          setErrorMessage("Video format not supported or file is corrupted.");
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          setErrorMessage("Video source not supported.");
          break;
        default:
          setErrorMessage("Failed to load video.");
      }
    } else {
      setErrorMessage("Failed to load video. The source might be unavailable.");
    }
  };

  const handleVideoLoaded = () => {
    console.log("Video loaded successfully");
    setVideoError(false);
    setVideoLoading(false);
    if (videoRef.current && !isYouTubeVideo && !isVimeoVideo && !isDailyMotionVideo) {
      try {
        setDuration(videoRef.current.duration);
      } catch (e) {
        console.log("Duration error:", e);
      }
    }
  };

  const handleVideoWaiting = () => setVideoLoading(true);
  const handleVideoCanPlay = () => setVideoLoading(false);
  const handleIframeLoad = () => {
    setVideoLoading(false);
    setPlaying(true);
  };

  const handleIframeError = () => {
    setVideoError(true);
    setVideoLoading(false);
    setErrorMessage("Failed to load embedded video. The source might be unavailable.");
  };

  const handleRetryVideo = () => {
    setVideoError(false);
    setVideoLoading(true);
    setErrorMessage("");

    if (isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
      setTimeout(() => setVideoLoading(false), 1000);
    } else if (videoRef.current) {
      try {
        videoRef.current.load();
        setTimeout(() => {
          if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setPlaying(true);
                  setVideoLoading(false);
                })
                .catch(err => {
                  console.log("Retry play error:", err);
                  setVideoError(true);
                  setVideoLoading(false);
                  setErrorMessage("Unable to play video. Please try again.");
                });
            }
          }
        }, 500);
      } catch (e) {
        console.log("Retry error:", e);
        setVideoError(true);
        setVideoLoading(false);
      }
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    try {
      const date = new Date(seconds * 1000);
      const hh = date.getUTCHours();
      const mm = date.getUTCMinutes().toString().padStart(2, '0');
      const ss = date.getUTCSeconds().toString().padStart(2, '0');
      if (hh > 0) return `${hh}:${mm}:${ss}`;
      return `${mm}:${ss}`;
    } catch (e) {
      return '0:00';
    }
  };

  // Auto-hide controls
  useEffect(() => {
    if (!showPlayer) return;

    const resetControlsTimer = () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = setTimeout(() => {
        if (playing) setShowControls(false);
      }, 3000);
    };

    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [playing, showPlayer]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupVideo();
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

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

  // Featured series
  const featuredSeries = useMemo(() => {
    return [...allSeries]
      .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
      .slice(0, 3);
  }, [allSeries]);

  // Get episodes for current series
  const currentSeriesEpisodes = useMemo(() => {
    if (!currentSeries) return [];
    return getEpisodesForSeries(currentSeries.id);
  }, [currentSeries, getEpisodesForSeries]);

  const sortedCurrentEpisodes = useMemo(() =>
    sortEpisodes(currentSeriesEpisodes),
    [currentSeriesEpisodes]
  );

  const currentSeasons = useMemo(() => {
    if (!sortedCurrentEpisodes.length) return [1];
    return getSeasons(sortedCurrentEpisodes);
  }, [sortedCurrentEpisodes]);

  const seasonEpisodes = useMemo(() => {
    return sortedCurrentEpisodes.filter(ep =>
      (parseInt(ep.seasonNumber) || 1) === selectedSeason
    );
  }, [sortedCurrentEpisodes, selectedSeason]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 pt-14 md:pt-20">
      {/* Animated Background - Optimized for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 md:w-80 h-40 md:h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 md:w-80 h-40 md:h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

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

      {/* Main Content - Hide when player is open */}
      {!showPlayer && (
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

          {/* Featured Banner - Mobile Optimized */}
          <div className="mb-6 md:mb-12">
            <div className="relative h-48 sm:h-64 md:h-96 rounded-xl md:rounded-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
              <img
                src={featuredSeries[0]?.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600"}
                alt="Featured"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 z-20 flex items-center p-4 md:p-12">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-[10px] md:text-xs font-semibold">
                      TRENDING NOW
                    </span>
                    <span className="text-gray-300 text-xs">• {featuredSeries[0]?.year || "2024"}</span>
                  </div>
                  <h1 className="text-lg sm:text-2xl md:text-5xl font-bold text-white mb-2 leading-tight line-clamp-2">
                    {featuredSeries[0]?.title || "Premium Series Collection"}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-lg text-gray-300 mb-3 line-clamp-2 hidden sm:block">
                    {featuredSeries[0]?.description || "Immerse yourself in our curated collection."}
                  </p>
                  <div className="flex items-center gap-2 md:gap-4">
                    <button
                      onClick={() => featuredSeries[0] && handlePlayFirstEpisode(featuredSeries[0])}
                      className="px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg md:rounded-xl font-semibold text-white text-xs md:text-base flex items-center gap-1 md:gap-2"
                    >
                      <FaPlay size={10} className="md:text-base" /> Watch Now
                    </button>
                    <button className="px-3 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg md:rounded-xl text-white text-xs md:text-base flex items-center gap-1 md:gap-2">
                      <FaRegHeart size={10} className="md:text-base" /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Series Grid/List */}
          <div className="mb-8 md:mb-12">
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
                      onClick={() => handleSeriesClick(series)}
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
                      onClick={() => handleSeriesClick(series)}
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
      )}

      {/* Series Details Modal - Mobile Optimized */}
      {showSeriesDetails && selectedSeries && !showPlayer && (
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
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                      className="px-2 md:px-4 py-1.5 md:py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg md:rounded-xl text-xs md:text-sm text-white"
                    >
                      {getSeasons(getEpisodesForSeries(selectedSeries.id)).map(season => (
                        <option key={season} value={season}>S{season}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto pr-1">
                    {sortEpisodes(getEpisodesForSeries(selectedSeries.id))
                      .filter(ep => (parseInt(ep.seasonNumber) || 1) === selectedSeason)
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

      {/* Video Player Modal - Mobile Optimized */}
      {showPlayer && currentSeries && currentEpisode && (
        <div
          ref={playerContainerRef}
          className="fixed inset-0 bg-black z-50 flex flex-col"
        >
          {/* Player Header - Mobile Optimized */}
          <div className="bg-gradient-to-b from-black via-black/90 to-transparent p-2 md:p-4 z-10">
            <div className="flex items-center justify-between">
              <button
                onClick={handleClosePlayer}
                className="flex items-center gap-1 md:gap-2 text-white hover:text-purple-400 transition-colors"
              >
                <FaChevronLeft size={14} className="md:text-base" />
                <span className="text-xs md:text-sm">Back</span>
              </button>
              <div className="text-center flex-1 px-2">
                <h2 className="text-xs md:text-lg font-bold text-white truncate">{currentSeries.title}</h2>
                <p className="text-[10px] md:text-xs text-gray-400 truncate">
                  S{currentEpisode.seasonNumber} • E{currentEpisode.episodeNumber}
                </p>
              </div>
              <button
                onClick={() => setShowEpisodeList(!showEpisodeList)}
                className="p-1.5 md:p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-white"
              >
                <FaList size={14} className="md:text-base" />
              </button>
            </div>
          </div>

          {/* Main Player Area - Mobile Optimized */}
          <div className={`flex-1 flex ${isLandscape ? 'flex-row' : 'flex-col'}`}>
            {/* Video Player */}
            <div className={`${showEpisodeList ? (isLandscape ? 'w-3/4' : 'h-1/2') : 'w-full h-full'} relative bg-black`}>
              {videoError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-4">
                  <FaExclamationTriangle className="text-red-500 text-3xl md:text-5xl mb-4" />
                  <h3 className="text-base md:text-xl text-white font-bold mb-2 text-center">Video Error</h3>
                  <p className="text-xs md:text-sm text-gray-400 mb-4 text-center max-w-md">
                    {errorMessage || "Unable to load this video."}
                  </p>
                  <button
                    onClick={handleRetryVideo}
                    className="px-4 md:px-6 py-2 md:py-3 bg-red-600 hover:bg-red-700 rounded-lg text-xs md:text-sm text-white"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Embed Videos */}
                  {(isYouTubeVideo || isVimeoVideo || isDailyMotionVideo) && (
                    <iframe
                      ref={iframeRef}
                      src={currentEpisode.embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={currentEpisode.title}
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                    />
                  )}

                  {/* Direct Video */}
                  {!isYouTubeVideo && !isVimeoVideo && !isDailyMotionVideo && (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      src={currentEpisode.embedUrl || currentEpisode.videoUrl || currentEpisode.streamLink}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleVideoLoaded}
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onError={handleVideoError}
                      onWaiting={handleVideoWaiting}
                      onCanPlay={handleVideoCanPlay}
                      playsInline
                      preload="metadata"
                      muted={muted}
                      crossOrigin="anonymous"
                    >
                      <source src={currentEpisode.embedUrl || currentEpisode.videoUrl || currentEpisode.streamLink} type="video/mp4" />
                    </video>
                  )}

                  {/* Loading Overlay */}
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <FaSpinner className="text-2xl md:text-4xl text-purple-600 animate-spin mx-auto mb-4" />
                        <p className="text-xs md:text-sm text-white">Loading...</p>
                      </div>
                    </div>
                  )}

                  {/* Video Controls - Mobile Optimized */}
                  {!isYouTubeVideo && !isVimeoVideo && !isDailyMotionVideo && (
                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 md:p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                      onTouchStart={() => setShowControls(true)}
                    >
                      {/* Progress Bar */}
                      <div className="mb-2 md:mb-4">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.001"
                          value={progress}
                          onChange={handleSeek}
                          className="w-full h-1 md:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] md:text-xs text-gray-300 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Control Buttons - Mobile Optimized */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-4">
                          <button
                            onClick={handlePlayPause}
                            className="text-white hover:text-purple-400 p-1 md:p-2"
                          >
                            {playing ? <FaPause size={16} className="md:text-2xl" /> : <FaPlay size={16} className="md:text-2xl" />}
                          </button>
                          <button
                            onClick={() => handleRewind(10)}
                            className="text-white hover:text-purple-400 p-1 md:p-2"
                          >
                            <FaBackward size={14} className="md:text-xl" />
                          </button>
                          <button
                            onClick={() => handleForward(10)}
                            className="text-white hover:text-purple-400 p-1 md:p-2"
                          >
                            <FaForward size={14} className="md:text-xl" />
                          </button>
                          <button
                            onClick={handleToggleMute}
                            className="text-white hover:text-purple-400 p-1 md:p-2 hidden sm:block"
                          >
                            {muted ? <FaVolumeMute size={14} className="md:text-xl" /> : <FaVolumeUp size={14} className="md:text-xl" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                          <select
                            value={playbackRate}
                            onChange={(e) => handlePlaybackRate(parseFloat(e.target.value))}
                            className="px-1.5 md:px-3 py-1 bg-gray-800/70 rounded text-xs text-white border border-gray-700"
                          >
                            <option value="1">1x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                          </select>
                          <button
                            onClick={handleFullscreen}
                            className="text-white hover:text-purple-400 p-1 md:p-2"
                          >
                            {isFullscreen ? <FaCompress size={14} className="md:text-xl" /> : <FaExpand size={14} className="md:text-xl" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Big Play Button */}
                  {!isYouTubeVideo && !isVimeoVideo && !isDailyMotionVideo && !playing && !videoLoading && !videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <button
                        onClick={handlePlayPause}
                        className="w-12 h-12 md:w-20 md:h-20 bg-purple-600/90 hover:bg-purple-700 rounded-full flex items-center justify-center"
                      >
                        <FaPlay size={20} className="md:text-4xl text-white ml-1" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Episode List Sidebar - Mobile Optimized */}
            {showEpisodeList && (
              <div className={`${isLandscape ? 'w-1/4' : 'h-1/2'} bg-gray-900/95 backdrop-blur-sm border-t md:border-l border-gray-800 overflow-y-auto`}>
                <div className="p-2 md:p-4">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <h3 className="text-sm md:text-lg font-bold text-white">Episodes</h3>
                    <button
                      onClick={() => setShowEpisodeList(false)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <FaTimes size={12} className="md:text-base" />
                    </button>
                  </div>

                  {/* Season Selector */}
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                    className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs md:text-sm text-white mb-2 md:mb-4"
                  >
                    {currentSeasons.map(season => (
                      <option key={season} value={season}>Season {season}</option>
                    ))}
                  </select>

                  {/* Episode List */}
                  <div className="space-y-1 md:space-y-2">
                    {seasonEpisodes.map((episode) => (
                      <div
                        key={episode.id}
                        onClick={() => {
                          cleanupVideo();
                          const videoUrl = episode.videoUrl || episode.streamLink || '';
                          const platform = detectVideoPlatform(videoUrl);
                          setIsYouTubeVideo(platform === 'youtube');
                          setIsVimeoVideo(platform === 'vimeo');
                          setIsDailyMotionVideo(platform === 'dailymotion');
                          setCurrentEpisode({
                            ...episode,
                            embedUrl: platform === 'youtube' ? getYouTubeEmbedUrl(videoUrl) :
                              platform === 'vimeo' ? getVimeoEmbedUrl(videoUrl) :
                                platform === 'dailymotion' ? getDailyMotionEmbedUrl(videoUrl) :
                                  videoUrl
                          });
                          setVideoError(false);
                          setVideoLoading(true);
                        }}
                        className={`p-2 md:p-3 rounded-lg cursor-pointer transition-colors ${currentEpisode.id === episode.id
                          ? 'bg-purple-600/20 border border-purple-500/30'
                          : 'bg-gray-800/30 hover:bg-gray-800/50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] md:text-xs font-bold">{episode.episodeNumber}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] md:text-xs font-medium text-white truncate">
                              {episode.title}
                            </h4>
                          </div>
                          {currentEpisode.id === episode.id && (
                            <FaPlay size={8} className="text-purple-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}