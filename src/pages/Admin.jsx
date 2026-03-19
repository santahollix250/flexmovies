import { useContext, useState, useEffect } from "react";
import { MoviesContext } from "../context/MoviesContext";
import { supabase } from '../lib/supabase';
import {
  FaEdit, FaTrash, FaFilm, FaTv, FaSave, FaUndo, FaPlus,
  FaLink, FaImage, FaGlobe, FaLanguage, FaSync, FaDatabase,
  FaCheckCircle, FaExclamationTriangle, FaTimes, FaList,
  FaDownload, FaSignOutAlt, FaVideo, FaCode,
  FaSearch, FaUpload,
  FaMountain, FaYoutube, FaPlayCircle,
  FaServer, FaCopy, FaFileVideo, FaCalendar, FaStar,
  FaClosedCaptioning, FaMicrophone, FaUser, FaTag,
  FaArrowLeft, FaLayerGroup, FaPlusCircle, FaCloudUploadAlt
} from "react-icons/fa";

function Admin({ onLogout }) {
  const context = useContext(MoviesContext);

  if (!context) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
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

  // Supported video platforms
  const VIDEO_PLATFORMS = {
    VIMEO: 'vimeo',
    YOUTUBE: 'youtube',
    DIRECT: 'direct'
  };

  // Platform configurations
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
    [VIDEO_PLATFORMS.DIRECT]: {
      name: 'Direct Video',
      color: '#10b981',
      icon: FaFileVideo,
      description: 'Direct video file URL',
      placeholder: 'https://your-cdn.com/video.mp4 or .m3u8',
      embedPattern: null
    }
  };

  // Empty movie/series form - UPDATED with translator and nation fields
  const emptyMovie = {
    title: "",
    description: "",
    poster: "",
    background: "",
    category: "",
    type: "movie",
    videoUrl: "",
    streamLink: "",
    download_link: "",
    nation: "",           // Country field
    translator: "",       // Translator field
    totalSeasons: "",
    totalEpisodes: "",
    videoType: VIDEO_PLATFORMS.VIMEO,
    videoId: "",
    embedCode: "",
    duration: "",
    quality: "HD",
    videoFile: null,
    year: "",
    director: "",
    imdbRating: "",
    status: "completed",
    views: "0",
    download: "",
    parts: []
  };

  // Empty part form
  const emptyPart = {
    partNumber: 1,
    title: "",
    videoUrl: "",
    download_link: "",
    duration: "",
    videoType: VIDEO_PLATFORMS.VIMEO,
    videoId: "",
    embedCode: "",
    streamLink: ""
  };

  // Empty episode form
  const emptyEpisode = {
    id: null,
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");

  // Image upload states
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [posterPreview, setPosterPreview] = useState("");
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [posterProgress, setPosterProgress] = useState(0);
  const [backgroundProgress, setBackgroundProgress] = useState(0);
  const [imageUploadMethod, setImageUploadMethod] = useState({
    poster: 'link',
    background: 'link'
  });

  // Parts management states
  const [selectedMovieForParts, setSelectedMovieForParts] = useState(null);
  const [movieParts, setMovieParts] = useState([]);
  const [partForm, setPartForm] = useState(emptyPart);
  const [editingPart, setEditingPart] = useState(null);
  const [showPartForm, setShowPartForm] = useState(false);

  // Episode editing states
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);

  // Store the series video URL for reference only (not forced)
  const [seriesVideoUrl, setSeriesVideoUrl] = useState("");

  useEffect(() => {
    setSyncStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

  // Extract video ID based on platform
  const extractVideoId = (url, platform) => {
    if (!url || typeof url !== 'string') return '';

    if (platform === VIDEO_PLATFORMS.VIMEO && /^\d{5,}$/.test(url.trim())) {
      return url.trim();
    }
    if (platform === VIDEO_PLATFORMS.YOUTUBE && /^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

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

      case VIDEO_PLATFORMS.DIRECT:
        return url;
    }

    return '';
  };

  // Generate embed URL
  const generateEmbedUrl = (videoId, platform) => {
    if (!videoId) return '';

    switch (platform) {
      case VIDEO_PLATFORMS.VIMEO:
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=1&byline=1&portrait=1&controls=1`;
      case VIDEO_PLATFORMS.YOUTUBE:
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      default:
        return '';
    }
  };

  // Detect platform from URL
  const detectPlatform = (url) => {
    if (!url || typeof url !== 'string') return VIDEO_PLATFORMS.VIMEO;

    if (/vimeo\.com/.test(url) || /^\d{5,}$/.test(url.trim())) {
      return VIDEO_PLATFORMS.VIMEO;
    }

    if (/youtube\.com/.test(url) || /youtu\.be/.test(url)) {
      return VIDEO_PLATFORMS.YOUTUBE;
    }

    if (/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url)) {
      return VIDEO_PLATFORMS.DIRECT;
    }

    return VIDEO_PLATFORMS.VIMEO;
  };

  // Validate video URL
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

      case VIDEO_PLATFORMS.DIRECT:
        if (!/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url)) {
          return { valid: false, message: 'Invalid video file URL' };
        }
        return { valid: true, id: url };

      default:
        return { valid: false, message: 'Unknown platform' };
    }
  };

  // Handle image upload to Supabase
  const handleImageUpload = async (file, type) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      addNotification("error", "Invalid image type. Please upload JPEG, PNG, WebP, or GIF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addNotification("error", "Image too large (max 5MB)");
      return;
    }

    if (!isOnline) {
      addNotification("error", "You are offline. Cannot upload images.");
      return;
    }

    if (type === 'poster') {
      setUploadingPoster(true);
      setPosterProgress(0);
    } else {
      setUploadingBackground(true);
      setBackgroundProgress(0);
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'poster') {
        setPosterPreview(previewUrl);
      } else {
        setBackgroundPreview(previewUrl);
      }

      const bucket = type === 'poster' ? 'posters' : 'backgrounds';
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const progressInterval = setInterval(() => {
        if (type === 'poster') {
          setPosterProgress(prev => Math.min(prev + 10, 90));
        } else {
          setBackgroundProgress(prev => Math.min(prev + 10, 90));
        }
      }, 200);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (type === 'poster') {
        setForm(prev => ({ ...prev, poster: publicUrl }));
        setUploadingPoster(false);
        setPosterProgress(100);
        setImageUploadMethod(prev => ({ ...prev, poster: 'upload' }));
        addNotification("success", `Poster uploaded successfully`);
      } else {
        setForm(prev => ({ ...prev, background: publicUrl }));
        setUploadingBackground(false);
        setBackgroundProgress(100);
        setImageUploadMethod(prev => ({ ...prev, background: 'upload' }));
        addNotification("success", `Background uploaded successfully`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      addNotification("error", `Failed to upload: ${error.message}`);

      if (type === 'poster') {
        if (posterPreview) URL.revokeObjectURL(posterPreview);
        setPosterPreview('');
        setUploadingPoster(false);
        setPosterProgress(0);
      } else {
        if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
        setBackgroundPreview('');
        setUploadingBackground(false);
        setBackgroundProgress(0);
      }
    }
  };

  // Handle file upload for video
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

      if (showPartForm) {
        setPartForm(prev => ({
          ...prev,
          videoType: VIDEO_PLATFORMS.DIRECT,
          videoFile: file,
          videoUrl: previewUrl
        }));
      } else if (showEpisodeForm || editingEpisode) {
        setEpisodeForm(prev => ({
          ...prev,
          videoType: VIDEO_PLATFORMS.DIRECT,
          videoFile: file,
          videoUrl: previewUrl
        }));
      } else {
        setForm(prev => ({
          ...prev,
          videoType: VIDEO_PLATFORMS.DIRECT,
          videoFile: file,
          videoUrl: previewUrl
        }));
      }

      setTimeout(() => {
        clearInterval(simulateUpload);
        setUploadProgress(100);
        setUploadingFile(false);
        addNotification("success", `Video uploaded`);
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

      // Store series video URL for reference only
      if (selectedSeries.videoUrl) {
        setSeriesVideoUrl(selectedSeries.videoUrl);
      }

      if (loadedEpisodes.length > 0) {
        const lastEpisode = loadedEpisodes.reduce((prev, current) => {
          const prevNum = parseInt(prev.episodeNumber || 0);
          const currNum = parseInt(current.episodeNumber || 0);
          return prevNum > currNum ? prev : current;
        });

        // Set next episode number but don't force video URL
        setEpisodeForm(prev => ({
          ...emptyEpisode,
          seasonNumber: (lastEpisode.seasonNumber || 1).toString(),
          episodeNumber: (parseInt(lastEpisode.episodeNumber || 0) + 1).toString(),
        }));
      } else {
        // First episode - completely empty form
        setEpisodeForm(emptyEpisode);
      }
    }
  }, [selectedSeries, getEpisodesBySeries]);

  // Load parts when movie is selected for parts management
  useEffect(() => {
    if (selectedMovieForParts) {
      try {
        let parts = [];
        if (selectedMovieForParts.download) {
          try {
            const parsed = JSON.parse(selectedMovieForParts.download);
            if (Array.isArray(parsed)) {
              parts = parsed;
            } else if (parsed && parsed.parts) {
              parts = parsed.parts;
            }
          } catch (e) {
            parts = [];
          }
        }
        setMovieParts(parts.sort((a, b) => a.partNumber - b.partNumber));

        setPartForm({
          ...emptyPart,
          partNumber: parts.length + 1,
          videoType: selectedMovieForParts.videoType || VIDEO_PLATFORMS.VIMEO
        });
      } catch (e) {
        setMovieParts([]);
      }
    }
  }, [selectedMovieForParts]);

  // Auto-hide notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [posterPreview, backgroundPreview, videoPreviewUrl]);

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
      } else if (name === 'posterFile') {
        const file = files[0];
        handleImageUpload(file, 'poster');
      } else if (name === 'backgroundFile') {
        const file = files[0];
        handleImageUpload(file, 'background');
      }
    } else if (name === "videoUrl") {
      const detectedPlatform = detectPlatform(value);

      if (showPartForm) {
        setPartForm((f) => ({
          ...f,
          [name]: value,
          videoType: detectedPlatform
        }));
      } else if (showEpisodeForm || editingEpisode) {
        setEpisodeForm((f) => ({
          ...f,
          [name]: value,
          videoType: detectedPlatform
        }));
      } else {
        setForm((f) => ({
          ...f,
          [name]: value,
          videoType: detectedPlatform
        }));
      }
    } else {
      if (showPartForm) {
        setPartForm((f) => ({ ...f, [name]: value }));
      } else if (showEpisodeForm || editingEpisode) {
        setEpisodeForm((f) => ({ ...f, [name]: value }));
      } else {
        setForm((f) => ({ ...f, [name]: value }));
      }
    }
  }

  function handleEpisodeChange(e) {
    const { name, value } = e.target;
    setEpisodeForm((f) => ({ ...f, [name]: value }));
  }

  function handlePartChange(e) {
    const { name, value } = e.target;
    setPartForm((f) => ({ ...f, [name]: value }));
  }

  // Toggle image upload method
  function toggleImageMethod(type) {
    setImageUploadMethod(prev => ({
      ...prev,
      [type]: prev[type] === 'link' ? 'upload' : 'link'
    }));

    if (type === 'poster') {
      setForm(prev => ({ ...prev, poster: '' }));
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview);
        setPosterPreview('');
      }
    } else {
      setForm(prev => ({ ...prev, background: '' }));
      if (backgroundPreview) {
        URL.revokeObjectURL(backgroundPreview);
        setBackgroundPreview('');
      }
    }
  }

  // Start editing movie/series - UPDATED to load translator and nation
  function startEdit(movie) {
    if (!movie) return;

    let parts = [];
    if (movie.download) {
      try {
        const parsed = JSON.parse(movie.download);
        if (Array.isArray(parsed)) {
          parts = parsed;
        } else if (parsed && parsed.parts) {
          parts = parsed.parts;
        }
      } catch (e) {
        // Not JSON, keep as is
      }
    }

    setEditingId(movie.id);
    setForm({
      ...emptyMovie,
      ...movie,
      parts: parts
    });

    if (movie.type === 'series') {
      setSeriesVideoUrl(movie.videoUrl || "");
    }

    setPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Editing: ${movie.title}`);
  }

  // Start editing episode
  function startEditEpisode(episode) {
    if (!episode) return;

    setEditingEpisode(episode);
    setEpisodeForm({
      id: episode.id,
      seasonNumber: episode.seasonNumber?.toString() || "1",
      episodeNumber: episode.episodeNumber?.toString() || "1",
      title: episode.title || "",
      description: episode.description || "",
      duration: episode.duration || "",
      videoUrl: episode.videoUrl || "",
      download_link: episode.download_link || "",
      thumbnail: episode.thumbnail || "",
      airDate: episode.airDate || new Date().toISOString().split('T')[0],
      videoType: episode.videoType || VIDEO_PLATFORMS.VIMEO,
      videoId: episode.videoId || "",
      embedCode: episode.embedCode || "",
      videoFile: null
    });
    setShowEpisodeForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Editing episode: ${episode.title}`);
  }

  // Cancel episode editing
  function cancelEpisodeEdit() {
    setEditingEpisode(null);
    setEpisodeForm(emptyEpisode);
    setShowEpisodeForm(false);
  }

  // Reset all forms
  function resetForm() {
    setEditingId(null);
    setForm(emptyMovie);
    setEpisodeForm(emptyEpisode);
    setPartForm(emptyPart);
    setPreview(false);
    setSelectedSeries(null);
    setSeriesEpisodes([]);
    setActiveTab("series");
    setVideoPreviewUrl("");
    setEditingEpisode(null);
    setShowEpisodeForm(false);
    setSelectedMovieForParts(null);
    setMovieParts([]);
    setEditingPart(null);
    setShowPartForm(false);
    setSeriesVideoUrl("");

    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
      setPosterPreview('');
    }
    if (backgroundPreview) {
      URL.revokeObjectURL(backgroundPreview);
      setBackgroundPreview('');
    }

    setImageUploadMethod({ poster: 'link', background: 'link' });

    addNotification("info", "Form reset");
  }

  // Add or update movie/series - UPDATED to include translator and nation
  async function handleAddOrUpdate() {
    if (!form.title) {
      addNotification("error", "Title is required");
      return;
    }

    if (!form.videoUrl && !form.videoFile && movieParts.length === 0) {
      addNotification("error", "Video URL, file, or parts are required");
      return;
    }

    if (form.videoUrl) {
      const validation = validateVideoUrl(form.videoUrl, form.videoType);
      if (!validation.valid && form.videoType !== VIDEO_PLATFORMS.DIRECT) {
        addNotification("error", validation.message);
        return;
      }
    }

    // Prepare final data - ensure translator and nation are included
    const finalData = {
      title: form.title,
      description: form.description,
      poster: form.poster || "",
      background: form.background || form.poster || "",
      category: form.category || "",
      type: form.type,
      videoUrl: form.videoUrl || "",
      streamLink: form.streamLink || "",
      download_link: form.download_link || "",
      nation: form.nation || "",           // Country field
      translator: form.translator || "",   // Translator field
      videoType: form.videoType,
      videoId: form.videoId || "",
      embedCode: form.embedCode || "",
      duration: form.duration || "",
      quality: form.quality || "HD",
      year: form.year || "",
      director: form.director || "",
      imdbRating: form.imdbRating || null,
      status: form.status || "completed",
      views: parseInt(form.views) || 0,
      download: form.download || ""
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
    setShowEpisodeForm(false);
    setEditingEpisode(null);

    // Store series video URL for reference only
    setSeriesVideoUrl(series.videoUrl || "");

    // Reset episode form to empty
    setEpisodeForm(emptyEpisode);

    const loadedEpisodes = getEpisodesBySeries(series.id) || [];
    setSeriesEpisodes(sortEpisodes(loadedEpisodes));

    addNotification("info", `Managing episodes for: ${series.title}`);
  }

  // Select movie for parts management
  function selectMovieForParts(movie) {
    setSelectedMovieForParts(movie);
    setActiveTab("parts");
    setShowPartForm(false);
    setEditingPart(null);

    let parts = [];
    if (movie.download) {
      try {
        const parsed = JSON.parse(movie.download);
        if (Array.isArray(parsed)) {
          parts = parsed;
        } else if (parsed && parsed.parts) {
          parts = parsed.parts;
        }
      } catch (e) {
        parts = [];
      }
    }
    setMovieParts(parts);

    setPartForm({
      ...emptyPart,
      partNumber: parts.length + 1,
      videoType: movie.videoType || VIDEO_PLATFORMS.VIMEO
    });

    addNotification("info", `Managing parts for: ${movie.title}`);
  }

  // Go back to series list in episodes tab
  function backToSeriesList() {
    setSelectedSeries(null);
    setSeriesEpisodes([]);
    setShowEpisodeForm(false);
    setEditingEpisode(null);
    setEpisodeForm(emptyEpisode);
    setSeriesVideoUrl("");
  }

  // Go back to movie list
  function backToMovieList() {
    setSelectedMovieForParts(null);
    setMovieParts([]);
    setShowPartForm(false);
    setEditingPart(null);
    setPartForm(emptyPart);
    setActiveTab("series");
  }

  // Start editing part
  function startEditPart(part) {
    if (!part) return;

    let streamLink = part.streamLink || '';
    if (!streamLink && part.videoId) {
      streamLink = generateEmbedUrl(part.videoId, part.videoType);
    }

    setEditingPart(part);
    setPartForm({
      partNumber: part.partNumber,
      title: part.title,
      videoUrl: part.videoUrl,
      download_link: part.download_link || "",
      duration: part.duration || "",
      videoType: part.videoType,
      videoId: part.videoId || "",
      embedCode: part.embedCode || "",
      streamLink: streamLink
    });
    setShowPartForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Editing part ${part.partNumber}: ${part.title}`);
  }

  // Cancel part editing
  function cancelPartEdit() {
    setEditingPart(null);
    setPartForm({
      ...emptyPart,
      partNumber: movieParts.length + 1
    });
    setShowPartForm(false);
  }

  // Add or update part
  async function handleAddOrUpdatePart() {
    if (!selectedMovieForParts) {
      addNotification("error", "No movie selected");
      return;
    }

    if (!partForm.title || !partForm.videoUrl) {
      addNotification("error", "Part title and video are required");
      return;
    }

    setSubmitting(true);
    try {
      let videoId = '';
      let streamLink = '';
      let embedCode = partForm.embedCode || '';

      if (partForm.videoType === VIDEO_PLATFORMS.DIRECT) {
        videoId = partForm.videoUrl;
        streamLink = partForm.videoUrl;
      } else {
        const validation = validateVideoUrl(partForm.videoUrl, partForm.videoType);
        if (!validation.valid) {
          addNotification("error", validation.message);
          setSubmitting(false);
          return;
        }
        videoId = validation.id || '';
        streamLink = generateEmbedUrl(videoId, partForm.videoType);
      }

      const partData = {
        partNumber: parseInt(partForm.partNumber) || (movieParts.length + 1),
        title: partForm.title,
        videoUrl: partForm.videoUrl,
        videoType: partForm.videoType,
        videoId: videoId,
        streamLink: streamLink,
        download_link: partForm.download_link || "",
        duration: partForm.duration || "",
        embedCode: embedCode
      };

      let updatedParts;

      if (editingPart) {
        updatedParts = movieParts.map(p =>
          p.partNumber === editingPart.partNumber ? { ...p, ...partData } : p
        );
        addNotification("success", `Part ${partData.partNumber} updated`);
      } else {
        updatedParts = [...movieParts, partData];
        addNotification("success", `Part ${partData.partNumber} added`);
      }

      updatedParts.sort((a, b) => a.partNumber - b.partNumber);

      updatedParts = updatedParts.map(part => {
        if (!part.streamLink && part.videoId && part.videoType !== VIDEO_PLATFORMS.DIRECT) {
          return {
            ...part,
            streamLink: generateEmbedUrl(part.videoId, part.videoType)
          };
        }
        return part;
      });

      const movieUpdate = {
        download: JSON.stringify(updatedParts)
      };

      await updateMovie(selectedMovieForParts.id, movieUpdate);
      setMovieParts(updatedParts);

      setPartForm({
        ...emptyPart,
        partNumber: updatedParts.length + 1
      });

      setEditingPart(null);
      setShowPartForm(false);
      refreshMovies();

    } catch (err) {
      console.error("Error managing parts:", err);
      addNotification("error", editingPart ? "Error updating part" : "Error adding part");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete part
  async function handleDeletePart(partNumber, partTitle) {
    if (!window.confirm(`Delete part ${partNumber} - "${partTitle}"?`)) return;

    try {
      const updatedParts = movieParts.filter(p => p.partNumber !== partNumber);
      const renumberedParts = updatedParts.map((p, index) => ({
        ...p,
        partNumber: index + 1
      }));

      const movieUpdate = {
        download: JSON.stringify(renumberedParts)
      };

      await updateMovie(selectedMovieForParts.id, movieUpdate);
      setMovieParts(renumberedParts);

      setPartForm({
        ...emptyPart,
        partNumber: renumberedParts.length + 1
      });

      addNotification("success", `Part ${partNumber} deleted`);
      refreshMovies();

    } catch (error) {
      addNotification("error", "Error deleting part");
    }
  }

  // Add or update episode
  async function handleAddOrUpdateEpisode() {
    if (!selectedSeries) {
      addNotification("error", "No series selected");
      return;
    }

    if (!episodeForm.title) {
      addNotification("error", "Episode title is required");
      return;
    }

    if (!episodeForm.videoUrl && !episodeForm.videoFile) {
      addNotification("error", "Video URL is required");
      return;
    }

    if (episodeForm.videoUrl) {
      const validation = validateVideoUrl(episodeForm.videoUrl, episodeForm.videoType);
      if (!validation.valid && episodeForm.videoType !== VIDEO_PLATFORMS.DIRECT) {
        addNotification("error", validation.message);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Generate videoId and embedCode if needed
      let videoId = episodeForm.videoId || '';
      let embedCode = episodeForm.embedCode || '';

      if (episodeForm.videoUrl && !videoId) {
        if (episodeForm.videoType !== VIDEO_PLATFORMS.DIRECT) {
          videoId = extractVideoId(episodeForm.videoUrl, episodeForm.videoType);
        } else {
          videoId = episodeForm.videoUrl;
        }
      }

      const episodeData = {
        seriesId: selectedSeries.id,
        seriesTitle: selectedSeries.title,
        seasonNumber: parseInt(episodeForm.seasonNumber) || 1,
        episodeNumber: parseInt(episodeForm.episodeNumber) || 1,
        title: episodeForm.title,
        description: episodeForm.description || "",
        duration: episodeForm.duration || "",
        videoUrl: episodeForm.videoUrl || "",
        download_link: episodeForm.download_link || "",
        thumbnail: episodeForm.thumbnail || selectedSeries.poster || "",
        airDate: episodeForm.airDate || new Date().toISOString().split('T')[0],
        videoType: episodeForm.videoType || VIDEO_PLATFORMS.VIMEO,
        videoId: videoId,
        embedCode: embedCode
      };

      if (editingEpisode) {
        await updateEpisode(editingEpisode.id, episodeData);
        addNotification("success", `Episode "${episodeForm.title}" updated`);
      } else {
        await addEpisode(episodeData);
        addNotification("success", `Episode "${episodeForm.title}" added`);
      }

      // Reset form for next episode but keep season number
      setEpisodeForm({
        ...emptyEpisode,
        seasonNumber: episodeForm.seasonNumber, // Keep same season
        episodeNumber: (parseInt(episodeForm.episodeNumber || 1) + 1).toString() // Increment episode
      });

      // Refresh episodes list
      const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      setSeriesEpisodes(sortEpisodes(updatedEpisodes));

      setEditingEpisode(null);
      setShowEpisodeForm(false);

    } catch (err) {
      console.error("Error managing episode:", err);
      addNotification("error", editingEpisode ? "Error updating episode" : "Error adding episode");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete episode
  async function handleDeleteEpisode(episodeId, episodeTitle) {
    if (!window.confirm(`Delete episode "${episodeTitle}"?`)) return;

    try {
      await deleteEpisode(episodeId);
      addNotification("success", `Episode "${episodeTitle}" deleted`);

      if (selectedSeries) {
        const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
        setSeriesEpisodes(sortEpisodes(updatedEpisodes));
      }
    } catch (error) {
      addNotification("error", "Error deleting episode");
    }
  }

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

  // Get parts count for a movie
  const getPartsCount = (movie) => {
    if (!movie.download) return 0;
    try {
      const parsed = JSON.parse(movie.download);
      if (Array.isArray(parsed)) return parsed.length;
      if (parsed && parsed.parts) return parsed.parts.length;
    } catch (e) {
      return 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 flex items-center justify-center px-4">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl mb-2">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 flex items-center justify-center px-4">
        <div className="text-white text-center max-w-md p-8">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Database Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshMovies}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium w-full md:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pb-8 px-3 sm:px-4 md:px-6 pt-20 sm:pt-24">
      {/* Notifications */}
      <div className="fixed top-16 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto z-50 max-w-sm w-full mx-auto sm:mx-0 space-y-2 sm:space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ease-out text-sm sm:text-base ${notification.type === "success"
              ? "bg-green-900/90 border-l-4 border-green-500"
              : notification.type === "error"
                ? "bg-red-900/90 border-l-4 border-red-500"
                : "bg-blue-900/90 border-l-4 border-blue-500"
              } backdrop-blur-lg rounded-r-lg shadow-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" && <FaCheckCircle className="text-green-400 text-lg sm:text-xl" />}
              {notification.type === "error" && <FaExclamationTriangle className="text-red-400 text-lg sm:text-xl" />}
              {notification.type === "info" && <FaExclamationTriangle className="text-blue-400 text-lg sm:text-xl" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white break-words">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-300 hover:text-white ml-1"
            >
              <FaTimes className="text-sm sm:text-base" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 bg-clip-text text-transparent">
              Video Admin Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                refreshMovies();
                refreshEpisodes();
                addNotification("success", "Content refreshed!");
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm"
            >
              <FaSync className="text-xs sm:text-sm" />
              <span className="hidden xs:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm"
            >
              <FaSignOutAlt className="text-xs sm:text-sm" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <div className="flex border-b border-gray-700 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveTab("series")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === "series"
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <FaTv className="inline mr-1 sm:mr-2 text-xs sm:text-sm" /> Manage Content
            </button>
            <button
              onClick={() => setActiveTab("episodes")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === "episodes"
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <FaList className="inline mr-1 sm:mr-2 text-xs sm:text-sm" /> Manage Episodes
            </button>
            <button
              onClick={() => setActiveTab("parts")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === "parts"
                ? "text-green-400 border-b-2 border-green-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <FaLayerGroup className="inline mr-1 sm:mr-2 text-xs sm:text-sm" /> Manage Movie Parts
            </button>
          </div>
        </div>

        {/* CONTENT MANAGEMENT TAB - UPDATED with translator and nation fields */}
        {activeTab === "series" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FaPlus className="text-blue-500 text-sm sm:text-base" />
                  {editingId ? "Edit Content" : "Add New Content"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${editingId ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                    {editingId ? "Editing" : "Creating"}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${form.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {form.type === 'series' ? 'Series' : 'Movie'}
                  </span>
                </div>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <button
                  onClick={() => setForm({ ...emptyMovie, type: "movie" })}
                  className={`p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center gap-1 sm:gap-2 ${form.type === "movie"
                    ? "bg-red-600/20 border-2 border-red-500/50"
                    : "bg-gray-800/50 border border-gray-700"
                    }`}
                >
                  <FaFilm className={`text-xl sm:text-2xl ${form.type === "movie" ? "text-red-400" : "text-gray-400"}`} />
                  <span className={`text-xs sm:text-sm font-medium ${form.type === "movie" ? "text-red-300" : "text-gray-300"}`}>
                    Movie
                  </span>
                </button>
                <button
                  onClick={() => setForm({ ...emptyMovie, type: "series" })}
                  className={`p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center gap-1 sm:gap-2 ${form.type === "series"
                    ? "bg-purple-600/20 border-2 border-purple-500/50"
                    : "bg-gray-800/50 border border-gray-700"
                    }`}
                >
                  <FaTv className={`text-xl sm:text-2xl ${form.type === "series" ? "text-purple-400" : "text-gray-400"}`} />
                  <span className={`text-xs sm:text-sm font-medium ${form.type === "series" ? "text-purple-300" : "text-gray-300"}`}>
                    Series
                  </span>
                </button>
              </div>

              {/* Platform Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">Video Platform:</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(platformConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = form.videoType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, videoType: key, videoUrl: '' }))}
                        className={`p-2 sm:p-3 rounded-xl flex items-center gap-2 sm:gap-3 ${isActive
                          ? 'border-2'
                          : 'border border-gray-700'
                          }`}
                        style={{
                          backgroundColor: isActive ? `${config.color}10` : 'rgb(31 41 55 / 0.5)',
                          borderColor: isActive ? config.color : ''
                        }}
                      >
                        <Icon className={`text-lg sm:text-xl flex-shrink-0 ${isActive ? '' : 'text-gray-400'}`}
                          style={isActive ? { color: config.color } : {}} />
                        <span className={`text-xs sm:text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {config.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Video Input */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-900/30 rounded-xl">
                <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3"
                  style={{ color: platformConfig[form.videoType]?.color }}>
                  {platformConfig[form.videoType]?.name} Settings
                </h3>

                {form.videoType === VIDEO_PLATFORMS.DIRECT ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 text-center">
                          <input
                            type="file"
                            name="videoFile"
                            id="videoFile"
                            accept="video/*"
                            onChange={handleChange}
                            className="hidden"
                          />
                          <label htmlFor="videoFile" className="cursor-pointer block">
                            <FaUpload className="text-2xl sm:text-3xl text-gray-400 mx-auto mb-2 sm:mb-3" />
                            <div className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">Upload video</div>
                            <div className="text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-4">MP4, WebM, etc (max 500MB)</div>
                            {uploadingFile ? (
                              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                                <div
                                  className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            ) : (
                              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs sm:text-sm">
                                Choose File
                              </div>
                            )}
                          </label>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-gray-900 text-gray-400">OR</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Video URL
                          </label>
                          <input
                            name="videoUrl"
                            value={form.videoUrl}
                            onChange={handleChange}
                            placeholder="https://cdn.com/video.mp4"
                            className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      {platformConfig[form.videoType]?.name} URL *
                    </label>
                    <input
                      name="videoUrl"
                      value={form.videoUrl}
                      onChange={handleChange}
                      placeholder={platformConfig[form.videoType]?.placeholder}
                      className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Basic Fields - UPDATED with translator and nation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Title *
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter title"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {/* POSTER UPLOAD */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 sm:mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">
                      Poster Image
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleImageMethod('poster')}
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 flex items-center gap-1 self-start"
                    >
                      {imageUploadMethod.poster === 'link' ? (
                        <>
                          <FaUpload className="text-[8px] sm:text-xs" /> Switch to Upload
                        </>
                      ) : (
                        <>
                          <FaLink className="text-[8px] sm:text-xs" /> Switch to Link
                        </>
                      )}
                    </button>
                  </div>

                  {imageUploadMethod.poster === 'link' ? (
                    <div className="relative">
                      <FaImage className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                      <input
                        name="poster"
                        value={form.poster}
                        onChange={handleChange}
                        placeholder="Image URL"
                        className="w-full pl-7 sm:pl-10 p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-3 text-center">
                        <input
                          type="file"
                          name="posterFile"
                          id="posterFile"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                        <label htmlFor="posterFile" className="cursor-pointer block">
                          <FaCloudUploadAlt className="text-xl sm:text-2xl text-gray-400 mx-auto mb-1" />
                          <div className="text-[10px] sm:text-xs text-gray-300 mb-1">Click to upload</div>
                          <div className="text-[8px] sm:text-[10px] text-gray-400">Max 5MB</div>

                          {uploadingPoster && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-700 rounded-full h-1">
                                <div
                                  className="bg-blue-600 h-1 rounded-full"
                                  style={{ width: `${posterProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {(posterPreview || form.poster) && (
                        <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-gray-800/50 rounded-lg">
                          <img
                            src={posterPreview || form.poster}
                            alt="Preview"
                            className="w-8 h-10 sm:w-12 sm:h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs text-gray-400 truncate">Poster ready</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* BACKGROUND UPLOAD */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 sm:mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">
                      Background
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleImageMethod('background')}
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 flex items-center gap-1 self-start"
                    >
                      {imageUploadMethod.background === 'link' ? (
                        <>
                          <FaUpload className="text-[8px] sm:text-xs" /> Switch to Upload
                        </>
                      ) : (
                        <>
                          <FaLink className="text-[8px] sm:text-xs" /> Switch to Link
                        </>
                      )}
                    </button>
                  </div>

                  {imageUploadMethod.background === 'link' ? (
                    <div className="relative">
                      <FaMountain className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                      <input
                        name="background"
                        value={form.background}
                        onChange={handleChange}
                        placeholder="Image URL"
                        className="w-full pl-7 sm:pl-10 p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-3 text-center">
                        <input
                          type="file"
                          name="backgroundFile"
                          id="backgroundFile"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                        <label htmlFor="backgroundFile" className="cursor-pointer block">
                          <FaCloudUploadAlt className="text-xl sm:text-2xl text-gray-400 mx-auto mb-1" />
                          <div className="text-[10px] sm:text-xs text-gray-300 mb-1">Click to upload</div>
                          <div className="text-[8px] sm:text-[10px] text-gray-400">Max 5MB</div>

                          {uploadingBackground && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-700 rounded-full h-1">
                                <div
                                  className="bg-blue-600 h-1 rounded-full"
                                  style={{ width: `${backgroundProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {(backgroundPreview || form.background) && (
                        <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-gray-800/50 rounded-lg">
                          <img
                            src={backgroundPreview || form.background}
                            alt="Preview"
                            className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs text-gray-400 truncate">Background ready</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaCalendar className="text-xs" /> Year
                  </label>
                  <input
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="e.g., 2024"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaTag /> Category
                  </label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g., Action"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {/* Translator Field - NEW */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaLanguage className="text-green-400" /> Translator
                  </label>
                  <input
                    name="translator"
                    value={form.translator}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {/* Nation/Country Field - NEW */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaGlobe className="text-blue-400" /> Country / Nation
                  </label>
                  <input
                    name="nation"
                    value={form.nation}
                    onChange={handleChange}
                    placeholder="e.g., USA, UK, Japan"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows="2"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {/* Download Link Field */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaDownload className="text-green-400" /> Download Link (Optional)
                  </label>
                  <input
                    name="download_link"
                    value={form.download_link}
                    onChange={handleChange}
                    placeholder="https://example.com/download/movie.mp4"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleAddOrUpdate}
                  disabled={submitting || uploadingFile || uploadingPoster || uploadingBackground}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <FaSave className="text-xs sm:text-sm" />
                  {submitting ? "Processing..." : editingId ? "Update" : "Add"}
                </button>

                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <FaUndo className="text-xs sm:text-sm" />
                  Reset
                </button>
              </div>
            </div>

            {/* Content List - UPDATED to show translator and nation badges */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FaTv className="text-blue-500 text-sm sm:text-base" />
                  All Content ({movies.length})
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-7 sm:pl-10 pr-3 sm:pr-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white text-xs sm:text-sm"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white text-xs sm:text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="series">Series</option>
                  </select>
                </div>
              </div>

              {sortedMovies.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-8 sm:p-12 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">No Content Found</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Add your first item to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {sortedMovies.map((movie) => {
                    const episodeCount = movie.type === 'series' ? getEpisodesBySeries(movie.id).length : 0;
                    const partsCount = movie.type === 'movie' ? getPartsCount(movie) : 0;
                    const platform = platformConfig[movie.videoType] || platformConfig[VIDEO_PLATFORMS.VIMEO];

                    return (
                      <div key={movie.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-3 sm:p-4">
                        <div className="flex gap-2 sm:gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={movie.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'}
                              alt={movie.title}
                              className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1 mb-1 sm:mb-2">
                              <h3 className="font-bold text-xs sm:text-sm truncate">{movie.title}</h3>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => startEdit(movie)}
                                  className="p-1 bg-blue-600/20 hover:bg-blue-600/30 rounded"
                                  title="Edit"
                                >
                                  <FaEdit className="text-blue-400 text-[10px] sm:text-xs" />
                                </button>
                                {movie.type === 'series' && (
                                  <button
                                    onClick={() => selectSeriesForEpisodes(movie)}
                                    className="p-1 bg-purple-600/20 hover:bg-purple-600/30 rounded"
                                    title="Manage Episodes"
                                  >
                                    <FaList className="text-purple-400 text-[10px] sm:text-xs" />
                                  </button>
                                )}
                                {movie.type === 'movie' && (
                                  <button
                                    onClick={() => selectMovieForParts(movie)}
                                    className="p-1 bg-green-600/20 hover:bg-green-600/30 rounded"
                                    title="Manage Parts"
                                  >
                                    <FaLayerGroup className="text-green-400 text-[10px] sm:text-xs" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(movie.id)}
                                  className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded"
                                  title="Delete"
                                >
                                  <FaTrash className="text-red-400 text-[10px] sm:text-xs" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mb-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] ${movie.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {movie.type === 'series' ? 'Series' : 'Movie'}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px]"
                                style={{
                                  backgroundColor: `${platform.color}20`,
                                  color: platform.color
                                }}
                              >
                                {platform.name}
                              </span>
                              {/* Translator Badge */}
                              {movie.translator && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-green-600/20 text-green-400 flex items-center gap-0.5">
                                  <FaLanguage className="text-[6px] sm:text-[8px]" /> {movie.translator}
                                </span>
                              )}
                              {/* Nation Badge */}
                              {movie.nation && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-blue-600/20 text-blue-400 flex items-center gap-0.5">
                                  <FaGlobe className="text-[6px] sm:text-[8px]" /> {movie.nation}
                                </span>
                              )}
                              {movie.type === 'series' && episodeCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-blue-500/20 text-blue-400">
                                  {episodeCount} eps
                                </span>
                              )}
                              {movie.type === 'movie' && partsCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-green-500/20 text-green-400">
                                  {partsCount} {partsCount === 1 ? 'part' : 'parts'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-300 truncate">{movie.description}</p>
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
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 sm:p-6">
              {/* Back button if series selected */}
              {selectedSeries && (
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={backToSeriesList}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <FaArrowLeft className="text-xs" /> Back to Series
                  </button>
                  <div className="text-center sm:text-right">
                    <h3 className="text-sm sm:text-lg font-bold text-purple-400 truncate max-w-[200px] sm:max-w-none">{selectedSeries.title}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">Managing episodes</p>
                  </div>
                </div>
              )}

              {!selectedSeries ? (
                <div className="text-center py-8 sm:py-12">
                  <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">Select a Series</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Choose a series to manage episodes</p>
                  {seriesOnly.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">No series available. Add a series first.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {seriesOnly.map(series => (
                        <button
                          key={series.id}
                          onClick={() => selectSeriesForEpisodes(series)}
                          className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <FaTv className="text-xs" />
                          <span className="truncate max-w-[150px]">{series.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Episode Form */}
                  {(showEpisodeForm || editingEpisode) && (
                    <div className="mb-4 sm:mb-6 p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4">
                        {editingEpisode ? "Edit Episode" : "Add New Episode"}
                      </h3>

                      {/* Platform Selection for Episode */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-300 mb-2">Video Platform:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(platformConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            const isActive = episodeForm.videoType === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setEpisodeForm(prev => ({ ...prev, videoType: key, videoUrl: '' }))}
                                className={`p-2 rounded-xl flex items-center gap-2 ${isActive
                                  ? 'border-2'
                                  : 'border border-gray-700'
                                  }`}
                                style={{
                                  backgroundColor: isActive ? `${config.color}10` : 'rgb(31 41 55 / 0.5)',
                                  borderColor: isActive ? config.color : ''
                                }}
                              >
                                <Icon className={`text-base sm:text-lg flex-shrink-0 ${isActive ? '' : 'text-gray-400'}`}
                                  style={isActive ? { color: config.color } : {}} />
                                <span className={`text-[10px] sm:text-xs font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                  {config.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Season</label>
                          <input
                            name="seasonNumber"
                            value={episodeForm.seasonNumber}
                            onChange={handleEpisodeChange}
                            type="number"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Episode</label>
                          <input
                            name="episodeNumber"
                            value={episodeForm.episodeNumber}
                            onChange={handleEpisodeChange}
                            type="number"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Title *</label>
                          <input
                            name="title"
                            value={episodeForm.title}
                            onChange={handleEpisodeChange}
                            placeholder="Episode title"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        {/* Video URL Field */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Video URL * {episodeForm.videoType === VIDEO_PLATFORMS.DIRECT ? '(Direct URL)' : ''}
                          </label>
                          <input
                            name="videoUrl"
                            value={episodeForm.videoUrl}
                            onChange={handleEpisodeChange}
                            placeholder={platformConfig[episodeForm.videoType]?.placeholder}
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                          {seriesVideoUrl && !editingEpisode && (
                            <p className="text-[10px] text-gray-500 mt-1">
                              Series video URL: {seriesVideoUrl} (you can use this or enter a different one)
                            </p>
                          )}
                        </div>

                        {/* File Upload for Direct Videos */}
                        {episodeForm.videoType === VIDEO_PLATFORMS.DIRECT && (
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-300 mb-1">Or Upload Video File</label>
                            <div className="border-2 border-dashed border-gray-700 rounded-xl p-3 text-center">
                              <input
                                type="file"
                                name="videoFile"
                                id="episodeVideoFile"
                                accept="video/*"
                                onChange={handleChange}
                                className="hidden"
                              />
                              <label htmlFor="episodeVideoFile" className="cursor-pointer block">
                                <FaUpload className="text-xl text-gray-400 mx-auto mb-1" />
                                <div className="text-[10px] text-gray-300">Click to upload video</div>
                                {uploadingFile && (
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-700 rounded-full h-1">
                                      <div
                                        className="bg-blue-600 h-1 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <FaDownload className="text-[10px]" /> Download Link (Optional)
                          </label>
                          <input
                            name="download_link"
                            value={episodeForm.download_link}
                            onChange={handleEpisodeChange}
                            placeholder="https://example.com/download/episode.mp4"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Duration</label>
                          <input
                            name="duration"
                            value={episodeForm.duration}
                            onChange={handleEpisodeChange}
                            placeholder="e.g., 45:30"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Air Date</label>
                          <input
                            name="airDate"
                            value={episodeForm.airDate}
                            onChange={handleEpisodeChange}
                            type="date"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={episodeForm.description}
                            onChange={handleEpisodeChange}
                            placeholder="Episode description"
                            rows="2"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Thumbnail URL (Optional)
                          </label>
                          <input
                            name="thumbnail"
                            value={episodeForm.thumbnail}
                            onChange={handleEpisodeChange}
                            placeholder="https://example.com/thumbnail.jpg"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 mt-2">
                          <button
                            onClick={handleAddOrUpdateEpisode}
                            disabled={submitting}
                            className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold disabled:opacity-50 text-xs sm:text-sm"
                          >
                            {submitting ? 'Processing...' : (editingEpisode ? 'Update Episode' : 'Add Episode')}
                          </button>
                          <button
                            onClick={cancelEpisodeEdit}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Episode Button */}
                  {!editingEpisode && !showEpisodeForm && (
                    <div className="mb-4">
                      <button
                        onClick={() => {
                          setEpisodeForm({
                            ...emptyEpisode,
                            seasonNumber: seriesEpisodes.length > 0
                              ? seriesEpisodes[seriesEpisodes.length - 1].seasonNumber?.toString() || "1"
                              : "1",
                            episodeNumber: seriesEpisodes.length > 0
                              ? (parseInt(seriesEpisodes[seriesEpisodes.length - 1].episodeNumber || 0) + 1).toString()
                              : "1"
                          });
                          setShowEpisodeForm(true);
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        <FaPlus className="text-xs" /> Add New Episode
                      </button>
                    </div>
                  )}

                  {/* Episodes List */}
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold mb-3">Episodes ({seriesEpisodes.length})</h3>
                    {seriesEpisodes.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-400">
                        No episodes yet. Click "Add New Episode" to create one.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sortEpisodes(seriesEpisodes).map((episode, index) => {
                          const platform = platformConfig[episode.videoType] || platformConfig[VIDEO_PLATFORMS.VIMEO];
                          return (
                            <div key={episode.id || index} className="bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full text-[10px] sm:text-xs">
                                      S{episode.seasonNumber}E{episode.episodeNumber}
                                    </span>
                                    <h4 className="font-medium text-xs sm:text-sm">{episode.title}</h4>
                                    <span
                                      className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px]"
                                      style={{
                                        backgroundColor: `${platform.color}20`,
                                        color: platform.color
                                      }}
                                    >
                                      {platform.name}
                                    </span>
                                    {episode.download_link && (
                                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[8px] sm:text-[10px] flex items-center gap-0.5">
                                        <FaDownload className="text-[6px] sm:text-[8px]" /> DL
                                      </span>
                                    )}
                                  </div>
                                  {episode.description && (
                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate max-w-full sm:max-w-md">
                                      {episode.description}
                                    </p>
                                  )}
                                  {episode.videoUrl && (
                                    <p className="text-[8px] sm:text-[10px] text-gray-500 truncate max-w-full">
                                      URL: {episode.videoUrl}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1 self-end sm:self-center">
                                  <button
                                    onClick={() => startEditEpisode(episode)}
                                    className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 rounded"
                                    title="Edit episode"
                                  >
                                    <FaEdit className="text-blue-400 text-xs" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEpisode(episode.id, episode.title)}
                                    className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded"
                                    title="Delete episode"
                                  >
                                    <FaTrash className="text-red-400 text-xs" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* PARTS MANAGEMENT TAB */}
        {activeTab === "parts" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 sm:p-6">
              {/* Back button if movie selected */}
              {selectedMovieForParts && (
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={backToMovieList}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <FaArrowLeft className="text-xs" /> Back to Movies
                  </button>
                  <div className="text-center sm:text-right">
                    <h3 className="text-sm sm:text-lg font-bold text-green-400 truncate max-w-[200px] sm:max-w-none">{selectedMovieForParts.title}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">Managing parts</p>
                  </div>
                </div>
              )}

              {!selectedMovieForParts ? (
                <div className="text-center py-8 sm:py-12">
                  <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">Select a Movie</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Choose a movie to manage its parts</p>
                  {moviesOnly.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">No movies available. Add a movie first.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {moviesOnly.map(movie => {
                        const partsCount = getPartsCount(movie);
                        return (
                          <button
                            key={movie.id}
                            onClick={() => selectMovieForParts(movie)}
                            className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                          >
                            <FaFilm className="text-xs" />
                            <span className="truncate max-w-[150px]">{movie.title}</span>
                            {partsCount > 0 && (
                              <span className="ml-1 px-1.5 py-0.5 bg-green-600/20 text-green-400 rounded-full text-[8px] sm:text-[10px]">
                                {partsCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Part Form */}
                  {(showPartForm || editingPart) && (
                    <div className="mb-4 sm:mb-6 p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4">
                        {editingPart ? `Edit Part ${editingPart.partNumber}` : "Add New Part"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Part Number</label>
                          <input
                            name="partNumber"
                            value={partForm.partNumber}
                            onChange={handlePartChange}
                            type="number"
                            min="1"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Part Title *</label>
                          <input
                            name="title"
                            value={partForm.title}
                            onChange={handlePartChange}
                            placeholder="e.g., Part 1: The Beginning"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        {/* Platform Selection for Part */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-2">Video Platform:</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(platformConfig).map(([key, config]) => {
                              const Icon = config.icon;
                              const isActive = partForm.videoType === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setPartForm(prev => ({ ...prev, videoType: key, videoUrl: '' }))}
                                  className={`p-2 rounded-xl flex items-center gap-2 ${isActive
                                    ? 'border-2'
                                    : 'border border-gray-700'
                                    }`}
                                  style={{
                                    backgroundColor: isActive ? `${config.color}10` : 'rgb(31 41 55 / 0.5)',
                                    borderColor: isActive ? config.color : ''
                                  }}
                                >
                                  <Icon className={`text-base sm:text-lg flex-shrink-0 ${isActive ? '' : 'text-gray-400'}`}
                                    style={isActive ? { color: config.color } : {}} />
                                  <span className={`text-[10px] sm:text-xs font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                    {config.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Video URL *
                          </label>
                          <input
                            name="videoUrl"
                            value={partForm.videoUrl}
                            onChange={handlePartChange}
                            placeholder={platformConfig[partForm.videoType]?.placeholder}
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <FaDownload className="text-[10px]" /> Download Link (Optional)
                          </label>
                          <input
                            name="download_link"
                            value={partForm.download_link}
                            onChange={handlePartChange}
                            placeholder="https://example.com/download/part1.mp4"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Duration</label>
                          <input
                            name="duration"
                            value={partForm.duration}
                            onChange={handlePartChange}
                            placeholder="e.g., 2:15:30"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleAddOrUpdatePart}
                            disabled={submitting}
                            className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50 text-xs sm:text-sm"
                          >
                            {submitting ? 'Processing...' : (editingPart ? 'Update Part' : 'Add Part')}
                          </button>
                          <button
                            onClick={cancelPartEdit}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Part Button */}
                  {!editingPart && !showPartForm && (
                    <div className="mb-4">
                      <button
                        onClick={() => {
                          setPartForm({
                            ...emptyPart,
                            partNumber: movieParts.length + 1
                          });
                          setShowPartForm(true);
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        <FaPlusCircle className="text-xs" /> Add New Part
                      </button>
                    </div>
                  )}

                  {/* Parts List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm sm:text-lg font-bold">Parts ({movieParts.length})</h3>
                    </div>

                    {movieParts.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-400">
                        <FaLayerGroup className="text-2xl sm:text-4xl mx-auto mb-2 opacity-30" />
                        <p>No parts yet. Click "Add New Part" to create one.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {movieParts.map((part) => {
                          const platform = platformConfig[part.videoType] || platformConfig[VIDEO_PLATFORMS.VIMEO];
                          return (
                            <div key={part.partNumber} className="bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-green-600/20 text-green-400 rounded-full text-[10px] sm:text-xs font-bold">
                                      Part {part.partNumber}
                                    </span>
                                    <h4 className="font-medium text-xs sm:text-sm">{part.title}</h4>
                                    <span
                                      className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px]"
                                      style={{
                                        backgroundColor: `${platform.color}20`,
                                        color: platform.color
                                      }}
                                    >
                                      {platform.name}
                                    </span>
                                  </div>
                                  {part.duration && (
                                    <p className="text-[10px] sm:text-xs text-gray-400">Duration: {part.duration}</p>
                                  )}
                                </div>
                                <div className="flex gap-1 self-end sm:self-center">
                                  <button
                                    onClick={() => startEditPart(part)}
                                    className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 rounded"
                                    title="Edit part"
                                  >
                                    <FaEdit className="text-blue-400 text-xs" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePart(part.partNumber, part.title)}
                                    className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded"
                                    title="Delete part"
                                  >
                                    <FaTrash className="text-red-400 text-xs" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Admin;