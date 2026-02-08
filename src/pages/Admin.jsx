import { useContext, useState, useEffect } from "react";
import { MoviesContext } from "../context/MoviesContext";
import {
  FaEdit, FaTrash, FaFilm, FaTv, FaSave, FaUndo, FaPlus,
  FaLink, FaImage, FaGlobe, FaLanguage, FaSync, FaDatabase,
  FaCheckCircle, FaExclamationTriangle, FaTimes, FaList,
  FaDownload, FaSignOutAlt, FaVideo, FaCode,
  FaSearch, FaUpload,
  FaMountain, FaYoutube, FaPlayCircle, // Added FaPlayCircle for DailyMotion
  FaServer, FaCopy, FaFileVideo, FaCalendar, FaStar,
  FaClosedCaptioning, FaMicrophone, FaUser, FaTag
} from "react-icons/fa";

function Admin({ onLogout }) {
  const context = useContext(MoviesContext);

  if (!context) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Movies Context Not Available</h1>
          <p className="text-gray-400">Make sure MoviesProvider is wrapping your app</p>
        </div>
      </div>
    );
  }

  const {
    movies = [],
    episodes = [],
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    addEpisode,
    updateEpisode,
    deleteEpisode,
    getEpisodesBySeries = () => [],
    refreshMovies,
    refreshEpisodes,
    clearAllMovies,
    clearAllEpisodes,
    isOnline
  } = context;

  // Supported video platforms - ADDED DAILYMOTION
  const VIDEO_PLATFORMS = {
    VIMEO: 'vimeo',
    YOUTUBE: 'youtube',
    MUX: 'mux',
    DIRECT: 'direct',
    EMBED: 'embed',
    DAILYMOTION: 'dailymotion' // ADDED DAILYMOTION
  };

  // Platform configurations - ADDED DAILYMOTION CONFIG
  const platformConfig = {
    [VIDEO_PLATFORMS.VIMEO]: {
      name: 'Vimeo',
      color: '#1ab7ea',
      icon: FaVideo,
      description: 'Professional video hosting',
      placeholder: 'https://vimeo.com/123456789 or just 123456789',
      embedPattern: 'https://player.vimeo.com/video/{id}'
    },
    [VIDEO_PLATFORMS.YOUTUBE]: {
      name: 'YouTube',
      color: '#FF0000',
      icon: FaYoutube,
      description: 'Free video hosting',
      placeholder: 'https://youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID',
      embedPattern: 'https://www.youtube.com/embed/{id}'
    },
    [VIDEO_PLATFORMS.MUX]: {
      name: 'Mux',
      color: '#5a67d8',
      icon: FaServer,
      description: 'Streaming API',
      placeholder: 'mux.com/playback-id or playback ID',
      embedPattern: 'https://stream.mux.com/{id}.m3u8'
    },
    [VIDEO_PLATFORMS.DIRECT]: {
      name: 'Direct Video',
      color: '#10b981',
      icon: FaFileVideo,
      description: 'Direct video file URL',
      placeholder: 'https://your-cdn.com/video.mp4 or .m3u8',
      embedPattern: null
    },
    [VIDEO_PLATFORMS.EMBED]: {
      name: 'Embed Code',
      color: '#f59e0b',
      icon: FaCode,
      description: 'Custom embed iframe',
      placeholder: 'Paste embed iframe code',
      embedPattern: null
    },
    [VIDEO_PLATFORMS.DAILYMOTION]: { // ADDED DAILYMOTION CONFIG
      name: 'DailyMotion',
      color: '#0066DC',
      icon: FaPlayCircle,
      description: 'Video sharing platform',
      placeholder: 'https://dailymotion.com/video/x8j1z1a or https://dai.ly/x8j1z1a',
      embedPattern: 'https://www.dailymotion.com/embed/video/{id}'
    }
  };

  // Empty movie/series form - SIMPLIFIED
  const emptyMovie = {
    title: "",
    description: "",
    poster: "",
    background: "", // Added background field
    category: "",
    type: "movie",
    videoUrl: "",
    streamLink: "",
    download_link: "",
    nation: "",
    translator: "", // Added translator field
    totalSeasons: "",
    totalEpisodes: "",
    videoType: VIDEO_PLATFORMS.VIMEO,
    videoId: "",
    embedCode: "",
    duration: "",
    quality: "HD",
    videoFile: null,
    // Kept only essential fields
    year: "",
    director: "",
    imdbRating: "",
    status: "completed",
    views: "0",
    // Added download field
    download: "" // NEW: Download link field
  };

  // Empty episode form
  const emptyEpisode = {
    seasonNumber: "1",
    episodeNumber: "1",
    title: "",
    description: "",
    duration: "",
    videoUrl: "",
    download_link: "",
    thumbnail: "",
    airDate: new Date().toISOString().split('T')[0],
    videoType: VIDEO_PLATFORMS.VIMEO,
    videoId: "",
    embedCode: "",
    videoFile: null
  };

  // States
  const [form, setForm] = useState(emptyMovie);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Online");
  const [notifications, setNotifications] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesEpisodes, setSeriesEpisodes] = useState([]);
  const [episodeForm, setEpisodeForm] = useState(emptyEpisode);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("series");
  const [showVideoGuide, setShowVideoGuide] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");

  useEffect(() => {
    setSyncStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

  // Extract video ID based on platform - UPDATED FOR DAILYMOTION
  const extractVideoId = (url, platform) => {
    if (!url || typeof url !== 'string') return '';

    // If it's just an ID
    if (platform === VIDEO_PLATFORMS.VIMEO && /^\d{5,}$/.test(url.trim())) {
      return url.trim();
    }
    if (platform === VIDEO_PLATFORMS.YOUTUBE && /^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }
    if (platform === VIDEO_PLATFORMS.MUX && /^[a-zA-Z0-9]+$/.test(url.trim())) {
      return url.trim();
    }
    if (platform === VIDEO_PLATFORMS.DAILYMOTION && /^[a-zA-Z0-9]+$/.test(url.trim())) { // ADDED DAILYMOTION ID CHECK
      return url.trim();
    }

    // Extract from URL patterns
    let match;

    switch (platform) {
      case VIDEO_PLATFORMS.VIMEO:
        match = url.match(/vimeo\.com\/(\d+)/);
        if (match) return match[1];
        match = url.match(/player\.vimeo\.com\/video\/(\d+)/);
        if (match) return match[1];
        break;

      case VIDEO_PLATFORMS.YOUTUBE:
        match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (match) return match[1];
        break;

      case VIDEO_PLATFORMS.MUX:
        match = url.match(/(?:stream\.)?mux\.com\/([a-zA-Z0-9]+)/);
        if (match) return match[1];
        break;

      case VIDEO_PLATFORMS.DAILYMOTION: // ADDED DAILYMOTION PATTERNS
        // Remove query parameters and fragments
        const cleanUrl = url.split('?')[0].split('#')[0];
        const patterns = [
          /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
          /dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/,
          /dai\.ly\/([a-zA-Z0-9]+)/,
          /dailymotion\.com\/(?:swf|embed)\/video\/([a-zA-Z0-9]+)/,
          /\/\/www\.dailymotion\.com\/video\/([a-zA-Z0-9]+)_/
        ];

        for (const pattern of patterns) {
          const match = cleanUrl.match(pattern);
          if (match) return match[1];
        }
        break;
    }

    return '';
  };

  // Generate embed URL - UPDATED FOR DAILYMOTION
  const generateEmbedUrl = (videoId, platform) => {
    if (!videoId) return '';

    switch (platform) {
      case VIDEO_PLATFORMS.VIMEO:
        return `https://player.vimeo.com/video/${videoId}`;
      case VIDEO_PLATFORMS.YOUTUBE:
        return `https://www.youtube.com/embed/${videoId}`;
      case VIDEO_PLATFORMS.MUX:
        return `https://stream.mux.com/${videoId}.m3u8`;
      case VIDEO_PLATFORMS.DAILYMOTION: // ADDED DAILYMOTION
        return `https://www.dailymotion.com/embed/video/${videoId}`;
      default:
        return '';
    }
  };

  // Detect platform from URL - UPDATED FOR DAILYMOTION
  const detectPlatform = (url) => {
    if (!url || typeof url !== 'string') return VIDEO_PLATFORMS.VIMEO;

    if (/vimeo\.com/.test(url) || /^\d{5,}$/.test(url.trim())) {
      return VIDEO_PLATFORMS.VIMEO;
    }

    if (/youtube\.com/.test(url) || /youtu\.be/.test(url)) {
      return VIDEO_PLATFORMS.YOUTUBE;
    }

    if (/mux\.com/.test(url) || /^[a-zA-Z0-9]+$/.test(url.trim())) {
      return VIDEO_PLATFORMS.MUX;
    }

    if (/dailymotion\.com/.test(url) || /dai\.ly/.test(url) || /^[a-zA-Z0-9]+$/.test(url.trim())) { // ADDED DAILYMOTION DETECTION
      return VIDEO_PLATFORMS.DAILYMOTION;
    }

    if (/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url)) {
      return VIDEO_PLATFORMS.DIRECT;
    }

    if (url.includes('<iframe') || url.includes('embed')) {
      return VIDEO_PLATFORMS.EMBED;
    }

    return VIDEO_PLATFORMS.VIMEO;
  };

  // Validate video URL - UPDATED FOR DAILYMOTION
  const validateVideoUrl = (url, platform) => {
    if (!url) return { valid: false, message: 'URL is required' };

    switch (platform) {
      case VIDEO_PLATFORMS.VIMEO:
        const vimeoId = extractVideoId(url, platform);
        if (!vimeoId) return { valid: false, message: 'Invalid Vimeo URL' };
        return { valid: true, id: vimeoId };

      case VIDEO_PLATFORMS.YOUTUBE:
        const youtubeId = extractVideoId(url, platform);
        if (!youtubeId) return { valid: false, message: 'Invalid YouTube URL' };
        return { valid: true, id: youtubeId };

      case VIDEO_PLATFORMS.MUX:
        const muxId = extractVideoId(url, platform);
        if (!muxId) return { valid: false, message: 'Invalid Mux URL' };
        return { valid: true, id: muxId };

      case VIDEO_PLATFORMS.DAILYMOTION: // ADDED DAILYMOTION VALIDATION
        const dailymotionId = extractVideoId(url, platform);
        if (!dailymotionId) return { valid: false, message: 'Invalid DailyMotion URL' };
        return { valid: true, id: dailymotionId };

      case VIDEO_PLATFORMS.DIRECT:
        if (!/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url)) {
          return { valid: false, message: 'Invalid video file URL' };
        }
        return { valid: true, id: url };

      case VIDEO_PLATFORMS.EMBED:
        return { valid: true, id: url };

      default:
        return { valid: false, message: 'Unknown platform' };
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      addNotification("error", "Invalid file type");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      addNotification("error", "File too large (max 500MB)");
      return;
    }

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      const simulateUpload = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(simulateUpload);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);

      setForm(prev => ({
        ...prev,
        videoType: VIDEO_PLATFORMS.DIRECT,
        videoFile: file,
        videoUrl: previewUrl
      }));

      setTimeout(() => {
        clearInterval(simulateUpload);
        setUploadProgress(100);
        setUploadingFile(false);
        addNotification("success", `Video "${file.name}" uploaded`);
      }, 2000);

    } catch (error) {
      addNotification("error", "Failed to upload video");
      setUploadingFile(false);
    }
  };

  // Load episodes when series is selected
  useEffect(() => {
    if (selectedSeries && typeof getEpisodesBySeries === 'function') {
      const loadedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      const sortedEpisodes = sortEpisodes(loadedEpisodes);
      setSeriesEpisodes(sortedEpisodes);

      if (loadedEpisodes.length > 0) {
        const lastEpisode = loadedEpisodes.reduce((prev, current) => {
          const prevNum = parseInt(prev.episodeNumber || 0);
          const currNum = parseInt(current.episodeNumber || 0);
          return prevNum > currNum ? prev : current;
        });
        setEpisodeForm(prev => ({
          ...prev,
          seasonNumber: (lastEpisode.seasonNumber || 1).toString(),
          episodeNumber: (parseInt(lastEpisode.episodeNumber || 0) + 1).toString(),
          videoType: lastEpisode.videoType || VIDEO_PLATFORMS.VIMEO
        }));
      }
    }
  }, [selectedSeries, getEpisodesBySeries]);

  // Auto-hide notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Sort episodes
  const sortEpisodes = (episodesArray) => {
    if (!episodesArray || !Array.isArray(episodesArray)) return [];
    return [...episodesArray].sort((a, b) => {
      const aSeason = parseInt(a.seasonNumber) || 1;
      const bSeason = parseInt(b.seasonNumber) || 1;
      const aEpisode = parseInt(a.episodeNumber) || 1;
      const bEpisode = parseInt(b.episodeNumber) || 1;
      if (aSeason !== bSeason) return aSeason - bSeason;
      return aEpisode - bEpisode;
    });
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_auth_expiry');
      if (onLogout) onLogout();
    }
  };

  // Notification system
  function addNotification(type, message) {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    return id;
  }

  function removeNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  // Form handlers
  function handleChange(e) {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      if (name === 'videoFile') {
        const file = files[0];
        handleFileUpload(file);
      }
    } else if (name === "videoUrl") {
      const detectedPlatform = detectPlatform(value);
      setForm((f) => ({
        ...f,
        [name]: value,
        videoType: detectedPlatform
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleEpisodeChange(e) {
    const { name, value } = e.target;
    setEpisodeForm((f) => ({ ...f, [name]: value }));
  }

  // Start editing
  function startEdit(movie) {
    if (!movie) return;

    setEditingId(movie.id);
    setForm({
      ...emptyMovie,
      ...movie
    });

    setPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Editing: ${movie.title}`);
  }

  // Reset all forms
  function resetForm() {
    setEditingId(null);
    setForm(emptyMovie);
    setEpisodeForm(emptyEpisode);
    setPreview(false);
    setSelectedSeries(null);
    setSeriesEpisodes([]);
    setActiveTab("series");
    setVideoPreviewUrl("");
    addNotification("info", "Form reset");
  }

  // Add or update movie/series
  async function handleAddOrUpdate() {
    if (!form.title) {
      addNotification("error", "Title is required");
      return;
    }

    if (!form.videoUrl && !form.videoFile && !form.embedCode) {
      addNotification("error", "Video URL, file, or embed code is required");
      return;
    }

    const validation = validateVideoUrl(form.videoUrl, form.videoType);
    if (!validation.valid && form.videoType !== VIDEO_PLATFORMS.EMBED) {
      addNotification("error", validation.message);
      return;
    }

    const finalData = {
      title: form.title,
      description: form.description,
      poster: form.poster || "",
      background: form.background || form.poster || "",
      category: form.category || "",
      type: form.type,
      videoUrl: form.videoUrl,
      streamLink: form.streamLink || (validation.valid ? generateEmbedUrl(validation.id, form.videoType) : ""),
      download_link: form.download_link || "",
      nation: form.nation || "",
      translator: form.translator || "",
      videoType: form.videoType,
      videoId: validation.id || "",
      embedCode: form.embedCode || "",
      duration: form.duration || "",
      quality: form.quality || "HD",
      // Kept only essential fields
      year: form.year || "",
      director: form.director || "",
      imdbRating: form.imdbRating || null,
      status: form.status || "completed",
      views: parseInt(form.views) || 0,
      // Added download field
      download: form.download || "" // NEW: Download link field
    };

    if (form.type === "series") {
      finalData.totalSeasons = form.totalSeasons || null;
      finalData.totalEpisodes = form.totalEpisodes || null;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateMovie(editingId, finalData);
        addNotification("success", `${form.type === 'series' ? 'Series' : 'Movie'} updated`);
      } else {
        await addMovie(finalData);
        addNotification("success", `${form.type === 'series' ? 'Series' : 'Movie'} added`);
      }

      refreshMovies();
      resetForm();
    } catch (err) {
      addNotification("error", `Error saving: ${err.message || "Please try again"}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Delete movie/series
  async function handleDelete(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    if (!window.confirm(`Delete "${movie.title}"?`)) return;

    try {
      await deleteMovie(id);
      addNotification("success", `"${movie.title}" deleted`);
      refreshMovies();
    } catch (error) {
      addNotification("error", "Error deleting item");
    }
  }

  // Select series for episode management
  function selectSeriesForEpisodes(series) {
    setSelectedSeries(series);
    setActiveTab("episodes");

    const loadedEpisodes = getEpisodesBySeries(series.id) || [];
    setSeriesEpisodes(sortEpisodes(loadedEpisodes));

    if (loadedEpisodes.length > 0) {
      const lastEpisode = loadedEpisodes.reduce((prev, current) => {
        const prevNum = parseInt(prev.episodeNumber || 0);
        const currNum = parseInt(current.episodeNumber || 0);
        return prevNum > currNum ? prev : current;
      });
      setEpisodeForm(prev => ({
        ...prev,
        seasonNumber: (lastEpisode.seasonNumber || 1).toString(),
        episodeNumber: (parseInt(lastEpisode.episodeNumber || 0) + 1).toString(),
        videoType: lastEpisode.videoType || VIDEO_PLATFORMS.VIMEO
      }));
    }

    addNotification("info", `Managing episodes for: ${series.title}`);
  }

  // Add new episode
  async function handleAddEpisode() {
    if (!selectedSeries) {
      addNotification("error", "No series selected");
      return;
    }

    if (!episodeForm.title || !episodeForm.videoUrl) {
      addNotification("error", "Episode title and video are required");
      return;
    }

    setSubmitting(true);
    try {
      const episodeData = {
        ...episodeForm,
        seriesId: selectedSeries.id,
        seriesTitle: selectedSeries.title,
        seasonNumber: parseInt(episodeForm.seasonNumber) || 1,
        episodeNumber: parseInt(episodeForm.episodeNumber) || 1,
        thumbnail: episodeForm.thumbnail || selectedSeries.poster || ""
      };

      await addEpisode(episodeData);
      addNotification("success", `Episode "${episodeForm.title}" added`);

      setEpisodeForm(prev => ({
        ...prev,
        episodeNumber: (parseInt(prev.episodeNumber || 1) + 1).toString(),
        title: "",
        description: "",
        videoUrl: "",
        download_link: "",
        duration: "",
        thumbnail: "",
        airDate: new Date().toISOString().split('T')[0]
      }));

      const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      setSeriesEpisodes(sortEpisodes(updatedEpisodes));

    } catch (err) {
      addNotification("error", "Error adding episode");
    } finally {
      setSubmitting(false);
    }
  }

  // Platform statistics
  const getPlatformStats = () => {
    const stats = {};
    Object.values(VIDEO_PLATFORMS).forEach(platform => {
      stats[platform] = movies.filter(m => m.videoType === platform).length;
    });
    return stats;
  };

  const platformStats = getPlatformStats();

  // Filter movies
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || movie.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  // Statistics
  const seriesOnly = movies.filter(m => m.type === "series");
  const moviesOnly = movies.filter(m => m.type === "movie");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-28 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl mb-2">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-28 flex items-center justify-center">
        <div className="text-white text-center max-w-md p-8">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Database Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshMovies}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pb-16 px-4 md:px-6 pt-28">
      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 max-w-md w-full space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ease-out ${notification.type === "success"
              ? "bg-green-900/90 border-l-4 border-green-500"
              : notification.type === "error"
                ? "bg-red-900/90 border-l-4 border-red-500"
                : "bg-blue-900/90 border-l-4 border-blue-500"
              } backdrop-blur-lg rounded-r-lg shadow-2xl p-4 flex items-start gap-3`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" && <FaCheckCircle className="text-green-400 text-xl" />}
              {notification.type === "error" && <FaExclamationTriangle className="text-red-400 text-xl" />}
              {notification.type === "info" && <FaExclamationTriangle className="text-blue-400 text-xl" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-300 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg">
                <FaVideo className="text-xl" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 bg-clip-text text-transparent">
                Video Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-400">
              Managing {movies.length} items across {Object.values(VIDEO_PLATFORMS).length} platforms
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isOnline ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">{syncStatus}</span>
            </div>

            <button
              onClick={() => {
                refreshMovies();
                refreshEpisodes();
                addNotification("success", "Content refreshed!");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2"
            >
              <FaSync />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center gap-2"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Platform Stats - UPDATED TO INCLUDE DAILYMOTION */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(platformConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div
                key={key}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50"
                style={{ borderLeftColor: config.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Icon className="text-xl" style={{ color: config.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{platformStats[key] || 0}</div>
                    <div className="text-sm text-gray-400">{config.name}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Guide Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowVideoGuide(!showVideoGuide)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-lg text-white font-medium"
          >
            <FaUpload />
            {showVideoGuide ? 'Hide Guide' : 'Show Video Guide'}
          </button>
        </div>

        {/* Video Guide - UPDATED TO INCLUDE DAILYMOTION */}
        {showVideoGuide && (
          <div className="bg-gradient-to-br from-blue-900/20 to-teal-900/10 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                <FaVideo /> Video Platforms Guide
              </h3>
              <button
                onClick={() => setShowVideoGuide(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(platformConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div
                    key={key}
                    className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon style={{ color: config.color }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{config.name}</h4>
                        <p className="text-xs text-gray-400">{config.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-300">URL Format:</label>
                        <code className="block text-xs bg-black/50 p-2 rounded mt-1 text-gray-300">
                          {config.placeholder}
                        </code>
                      </div>
                      {config.embedPattern && (
                        <div>
                          <label className="text-xs text-gray-300">Embed Pattern:</label>
                          <code className="block text-xs bg-black/50 p-2 rounded mt-1 text-gray-300">
                            {config.embedPattern}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("series")}
              className={`px-6 py-3 font-medium ${activeTab === "series"
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"}`}
            >
              <FaTv className="inline mr-2" /> Manage Content
            </button>
            <button
              onClick={() => setActiveTab("episodes")}
              className={`px-6 py-3 font-medium ${activeTab === "episodes"
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"}`}
            >
              <FaList className="inline mr-2" /> Manage Episodes
            </button>
          </div>
        </div>

        {/* CONTENT MANAGEMENT TAB */}
        {activeTab === "series" && (
          <div className="space-y-8">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaPlus className="text-blue-500" />
                  {editingId ? "Edit Content" : "Add New Content"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${editingId ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {editingId ? "Editing" : "Creating"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${form.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                    {form.type === 'series' ? 'Series' : 'Movie'}
                  </span>
                </div>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setForm({ ...emptyMovie, type: "movie" })}
                  className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 ${form.type === "movie"
                    ? "bg-red-600/20 border-2 border-red-500/50"
                    : "bg-gray-800/50 border border-gray-700"}`}
                >
                  <FaFilm className={`text-2xl ${form.type === "movie" ? "text-red-400" : "text-gray-400"}`} />
                  <span className={`font-medium ${form.type === "movie" ? "text-red-300" : "text-gray-300"}`}>
                    Movie
                  </span>
                </button>
                <button
                  onClick={() => setForm({ ...emptyMovie, type: "series" })}
                  className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 ${form.type === "series"
                    ? "bg-purple-600/20 border-2 border-purple-500/50"
                    : "bg-gray-800/50 border border-gray-700"}`}
                >
                  <FaTv className={`text-2xl ${form.type === "series" ? "text-purple-400" : "text-gray-400"}`} />
                  <span className={`font-medium ${form.type === "series" ? "text-purple-300" : "text-gray-300"}`}>
                    Series
                  </span>
                </button>
              </div>

              {/* Platform Selection - UPDATED FOR DAILYMOTION */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Video Platform:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(platformConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = form.videoType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, videoType: key, videoUrl: '' }))}
                        className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 ${isActive
                          ? 'border-2'
                          : 'border border-gray-700'}`}
                        style={{
                          backgroundColor: isActive ? `${config.color}10` : 'rgb(31 41 55 / 0.5)',
                          borderColor: isActive ? config.color : ''
                        }}
                      >
                        <Icon className={`text-xl ${isActive ? '' : 'text-gray-400'}`}
                          style={isActive ? { color: config.color } : {}} />
                        <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {config.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Video Input */}
              <div className="mb-6 p-4 bg-gray-900/30 rounded-xl">
                <h3 className="text-lg font-medium mb-3"
                  style={{ color: platformConfig[form.videoType]?.color }}>
                  {platformConfig[form.videoType]?.name} Settings
                </h3>

                {form.videoType === VIDEO_PLATFORMS.EMBED ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Embed Code *
                    </label>
                    <textarea
                      name="embedCode"
                      value={form.embedCode}
                      onChange={handleChange}
                      placeholder="Paste embed iframe code"
                      rows="3"
                      className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl font-mono text-sm"
                    />
                  </div>
                ) : form.videoType === VIDEO_PLATFORMS.DIRECT ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload or Enter URL
                      </label>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center">
                          <input
                            type="file"
                            name="videoFile"
                            id="videoFile"
                            accept="video/*"
                            onChange={handleChange}
                            className="hidden"
                          />
                          <label htmlFor="videoFile" className="cursor-pointer block">
                            <FaUpload className="text-3xl text-gray-400 mx-auto mb-3" />
                            <div className="text-sm text-gray-300 mb-2">Upload video</div>
                            <div className="text-xs text-gray-400 mb-4">MP4, WebM, etc (max 500MB)</div>
                            {uploadingFile ? (
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            ) : (
                              <div className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                                Choose File
                              </div>
                            )}
                          </label>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900 text-gray-400">OR</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Video URL
                          </label>
                          <input
                            name="videoUrl"
                            value={form.videoUrl}
                            onChange={handleChange}
                            placeholder="https://cdn.com/video.mp4"
                            className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {platformConfig[form.videoType]?.name} URL *
                    </label>
                    <input
                      name="videoUrl"
                      value={form.videoUrl}
                      onChange={handleChange}
                      placeholder={platformConfig[form.videoType]?.placeholder}
                      className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl font-mono text-sm"
                    />
                    <div className="mt-2 text-xs text-gray-400">
                      {form.videoType === VIDEO_PLATFORMS.DAILYMOTION && (
                        <>
                          <p>Examples:</p>
                          <ul className="list-disc list-inside ml-2">
                            <li>https://www.dailymotion.com/video/x8j1z1a</li>
                            <li>https://dai.ly/x8j1z1a</li>
                            <li>x8j1z1a (video ID only)</li>
                            <li>https://www.dailymotion.com/embed/video/x8j1z1a</li>
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Fields */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter title"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Poster URL
                    <span className="text-xs text-gray-400 ml-2">(Recommended: 300x450)</span>
                  </label>
                  <div className="relative">
                    <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="poster"
                      value={form.poster}
                      onChange={handleChange}
                      placeholder="https://example.com/poster.jpg"
                      className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Background Image URL
                    <span className="text-xs text-gray-400 ml-2">(Recommended: 1920x1080)</span>
                  </label>
                  <div className="relative">
                    <FaMountain className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="background"
                      value={form.background}
                      onChange={handleChange}
                      placeholder="https://example.com/background.jpg"
                      className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaCalendar /> Year
                  </label>
                  <input
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="e.g., 2024"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                  />
                </div>


                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows="3"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Extended Information */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g., Action"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nation</label>
                  <select
                    name="nation"
                    value={form.nation}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                  >
                    <option value="">Select Country</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="India">India</option>
                    <option value="Japan">Japan</option>
                    <option value="Korea">Korea</option>
                    <option value="China">China</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="International">International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaUser /> Translator
                  </label>
                  <input
                    name="translator"
                    value={form.translator}
                    onChange={handleChange}
                    placeholder="Translator name or team"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaStar /> IMDb Rating
                  </label>
                  <input
                    name="imdbRating"
                    value={form.imdbRating}
                    onChange={handleChange}
                    placeholder="e.g., 8.7"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                  />
                </div>



                {/* NEW: Download Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaDownload /> Download Link
                  </label>
                  <input
                    name="download"
                    value={form.download}
                    onChange={handleChange}
                    placeholder="https://example.com/download/video.mp4"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                  />
                </div>



                {form.type === "series" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Total Seasons</label>
                      <input
                        name="totalSeasons"
                        value={form.totalSeasons}
                        onChange={handleChange}
                        type="number"
                        placeholder="e.g., 3"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Total Episodes</label>
                      <input
                        name="totalEpisodes"
                        value={form.totalEpisodes}
                        onChange={handleChange}
                        type="number"
                        placeholder="e.g., 24"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleAddOrUpdate}
                  disabled={submitting || uploadingFile}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50"
                >
                  <FaSave />
                  {submitting ? "Processing..." : editingId ? "Update" : "Add"}
                </button>

                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold"
                >
                  <FaUndo />
                  Reset
                </button>
              </div>
            </div>

            {/* Content List */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaTv className="text-blue-500" />
                  All Content ({movies.length})
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="series">Series</option>
                  </select>
                </div>
              </div>

              {sortedMovies.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-12 text-center">
                  <h2 className="text-2xl font-bold text-white mb-3">No Content Found</h2>
                  <p className="text-gray-400 mb-6">Add your first item to get started</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedMovies.map((movie) => {
                    const episodeCount = movie.type === 'series' ? getEpisodesBySeries(movie.id).length : 0;
                    const platform = platformConfig[movie.videoType] || platformConfig[VIDEO_PLATFORMS.VIMEO];

                    return (
                      <div key={movie.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4">
                        <div className="flex gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={movie.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'}
                              alt={movie.title}
                              className="w-20 h-24 object-cover rounded-xl"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg truncate">{movie.title}</h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(movie)}
                                  className="p-1 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg"
                                >
                                  <FaEdit className="text-blue-400 text-sm" />
                                </button>
                                {movie.type === 'series' && (
                                  <button
                                    onClick={() => selectSeriesForEpisodes(movie)}
                                    className="p-1 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg"
                                  >
                                    <FaList className="text-purple-400 text-sm" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(movie.id)}
                                  className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded-lg"
                                >
                                  <FaTrash className="text-red-400 text-sm" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${movie.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                                {movie.type === 'series' ? 'Series' : 'Movie'}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={{
                                  backgroundColor: `${platform.color}20`,
                                  color: platform.color
                                }}
                              >
                                {platform.name}
                              </span>
                              {movie.type === 'series' && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                                  {episodeCount} eps
                                </span>
                              )}
                              {movie.year && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-600/20 text-gray-400">
                                  {movie.year}
                                </span>
                              )}
                              {movie.download && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
                                  <FaDownload className="text-xs" /> Download
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 truncate">{movie.description}</p>
                            {movie.translator && (
                              <p className="text-xs text-gray-400 mt-1">
                                Translator: {movie.translator}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EPISODES TAB */}
        {activeTab === "episodes" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
              {!selectedSeries ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-bold mb-3">Select a Series</h3>
                  <p className="text-gray-400 mb-6">Choose a series to manage episodes</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {seriesOnly.map(series => (
                      <button
                        key={series.id}
                        onClick={() => selectSeriesForEpisodes(series)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
                      >
                        <FaTv />
                        {series.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4">Add Episode to: {selectedSeries.title}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
                        <input
                          name="seasonNumber"
                          value={episodeForm.seasonNumber}
                          onChange={handleEpisodeChange}
                          type="number"
                          className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Episode</label>
                        <input
                          name="episodeNumber"
                          value={episodeForm.episodeNumber}
                          onChange={handleEpisodeChange}
                          type="number"
                          className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input
                          name="title"
                          value={episodeForm.title}
                          onChange={handleEpisodeChange}
                          placeholder="Episode title"
                          className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Video URL *
                        </label>
                        <input
                          name="videoUrl"
                          value={episodeForm.videoUrl}
                          onChange={handleEpisodeChange}
                          placeholder="Enter video URL"
                          className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                        />
                      </div>
                      {/* Episode Download Field */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <FaDownload /> Episode Download Link
                        </label>
                        <input
                          name="download_link"
                          value={episodeForm.download_link}
                          onChange={handleEpisodeChange}
                          placeholder="https://example.com/download/episode.mp4"
                          className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          onClick={handleAddEpisode}
                          disabled={submitting}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold disabled:opacity-50"
                        >
                          {submitting ? 'Adding...' : 'Add Episode'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4">Episodes ({seriesEpisodes.length})</h3>
                    {seriesEpisodes.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No episodes yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortEpisodes(seriesEpisodes).map((episode, index) => (
                          <div key={episode.id || index} className="bg-gray-800/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                                    S{episode.seasonNumber}E{episode.episodeNumber}
                                  </span>
                                  <h4 className="font-medium">{episode.title}</h4>
                                  {episode.download_link && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
                                      <FaDownload className="text-xs" />
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => deleteEpisode(episode.id)}
                                  className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded-lg"
                                >
                                  <FaTrash className="text-red-400 text-sm" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-8 p-6 bg-gradient-to-br from-red-900/10 to-red-900/5 backdrop-blur-lg rounded-2xl border border-red-700/30">
          <h3 className="text-lg font-bold mb-4 text-red-300">Danger Zone</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => {
                if (window.confirm("Clear ALL content?")) {
                  clearAllMovies();
                  clearAllEpisodes();
                  addNotification("success", "All content cleared");
                }
              }}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-300"
            >
              <FaTrash className="inline mr-2" />
              Clear All Content
            </button>
            <p className="text-sm text-gray-400 md:ml-4">
              This will delete all movies, series, and episodes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Admin;