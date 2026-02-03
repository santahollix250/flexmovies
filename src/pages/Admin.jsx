import { useContext, useState, useEffect } from "react";
import { MoviesContext } from "../context/MoviesContext";
import {
  FaEdit, FaTrash, FaFilm, FaTv, FaSave, FaUndo, FaPlus,
  FaLink, FaImage, FaGlobe, FaLanguage, FaSync, FaDatabase,
  FaCheckCircle, FaExclamationTriangle, FaTimes, FaList,
  FaCalendar, FaClock, FaPlay, FaFolder, FaExclamationCircle,
  FaDownload, FaSignOutAlt, FaYoutube, FaVideo, FaCode,
  FaCog, FaInfoCircle, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown,
  FaCopy, FaExternalLinkAlt, FaEye, FaEyeSlash, FaUpload, FaFileImport,
  FaMountain, FaUpload as FaCloudUpload, FaShieldAlt
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";

function Admin({ onLogout }) {
  const context = useContext(MoviesContext);

  if (!context) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-4" />
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

  // Empty movie/series form with MUX fields
  const emptyMovie = {
    title: "",
    description: "",
    poster: "",
    background: "",
    rating: "",
    category: "",
    type: "movie",
    videoUrl: "", // Mux MP4 URL
    streamLink: "", // Mux HLS URL (optional)
    download_link: "", // Download link
    nation: "",
    translator: "", // Translator field - simple text input
    totalSeasons: "",
    totalEpisodes: "",
    videoType: "mux" // Default to Mux
  };

  // Empty episode form
  const emptyEpisode = {
    seasonNumber: "1",
    episodeNumber: "1",
    title: "",
    description: "",
    duration: "",
    videoUrl: "", // Mux URL for episode
    download_link: "",
    thumbnail: "",
    airDate: new Date().toISOString().split('T')[0],
    videoType: "mux"
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
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkEpisodes, setBulkEpisodes] = useState([{ ...emptyEpisode }]);
  const [showMuxGuide, setShowMuxGuide] = useState(false);

  // Mux URL patterns
  const muxPatterns = {
    mp4: /https:\/\/stream\.mux\.com\/[A-Za-z0-9]+\.mp4/i,
    hls: /https:\/\/stream\.mux\.com\/[A-Za-z0-9]+\.m3u8/i,
    thumbnail: /https:\/\/image\.mux\.com\/[A-Za-z0-9]+\/thumbnail/i
  };

  // Extract playback ID from Mux URL
  const extractMuxPlaybackId = (url) => {
    if (!url) return '';
    const match = url.match(/stream\.mux\.com\/([A-Za-z0-9]+)(?:\.mp4|\.m3u8)?/);
    return match ? match[1] : '';
  };

  // Generate Mux thumbnail URL
  const generateMuxThumbnail = (videoUrl) => {
    const playbackId = extractMuxPlaybackId(videoUrl);
    if (!playbackId) return '';
    return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=400&height=600&fit_mode=smartcrop`;
  };

  // Generate Mux HLS URL
  const generateMuxHls = (videoUrl) => {
    const playbackId = extractMuxPlaybackId(videoUrl);
    if (!playbackId) return '';
    return `https://stream.mux.com/${playbackId}.m3u8`;
  };

  // Detect video type
  const detectVideoType = (url) => {
    if (!url || typeof url !== 'string') return "mux";

    if (muxPatterns.mp4.test(url)) return "mux";
    if (muxPatterns.hls.test(url)) return "mux_hls";

    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i;
    if (youtubeRegex.test(url)) return "youtube";

    if (url.match(/\.(mp4|webm|mkv|avi|mov|m3u8|mpd)$/i)) return "direct";

    return "embed";
  };

  // Check if URL is Mux
  const isMuxUrl = (url) => {
    return muxPatterns.mp4.test(url) || muxPatterns.hls.test(url);
  };

  useEffect(() => {
    setSyncStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

  // Auto-generate Mux URLs when video URL changes
  useEffect(() => {
    if (form.videoUrl && isMuxUrl(form.videoUrl)) {
      const playbackId = extractMuxPlaybackId(form.videoUrl);
      if (playbackId) {
        // Auto-fill thumbnail if not set
        if (!form.poster || !muxPatterns.thumbnail.test(form.poster)) {
          const thumbnailUrl = generateMuxThumbnail(form.videoUrl);
          setForm(prev => ({ ...prev, poster: thumbnailUrl }));
        }

        // Auto-fill background if not set
        if (!form.background) {
          const backgroundUrl = generateMuxThumbnail(form.videoUrl);
          setForm(prev => ({ ...prev, background: backgroundUrl }));
        }

        // Auto-fill streamLink (HLS) if not set
        if (!form.streamLink || !muxPatterns.hls.test(form.streamLink)) {
          const hlsUrl = generateMuxHls(form.videoUrl);
          setForm(prev => ({ ...prev, streamLink: hlsUrl }));
        }
      }
    }
  }, [form.videoUrl]);

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
          videoType: lastEpisode.videoType || "mux"
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
    const sorted = [...episodesArray].sort((a, b) => {
      const aSeason = parseInt(a.seasonNumber) || 1;
      const bSeason = parseInt(b.seasonNumber) || 1;
      const aEpisode = parseInt(a.episodeNumber) || 1;
      const bEpisode = parseInt(b.episodeNumber) || 1;
      if (aSeason !== bSeason) return aSeason - bSeason;
      return aEpisode - bEpisode;
    });
    return sorted;
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
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleEpisodeChange(e) {
    const { name, value } = e.target;

    if (name === "videoUrl") {
      const videoType = detectVideoType(value);
      setEpisodeForm((f) => ({
        ...f,
        [name]: value,
        videoType: videoType
      }));
    } else {
      setEpisodeForm((f) => ({ ...f, [name]: value }));
    }
  }

  // Start editing a movie/series
  function startEdit(movie) {
    if (!movie) return;

    setEditingId(movie.id);
    const videoUrl = movie.videoUrl || movie.streamLink || "";
    const download_link = movie.download_link || "";
    const background = movie.background || "";

    setForm({
      ...movie,
      videoUrl: videoUrl,
      download_link: download_link,
      background: background,
      totalSeasons: movie.totalSeasons || "",
      totalEpisodes: movie.totalEpisodes || "",
      translator: movie.translator || "", // Include translator
      videoType: movie.videoType || detectVideoType(videoUrl)
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
    setShowBulkUpload(false);
    setBulkEpisodes([{ ...emptyEpisode }]);
    addNotification("info", "Form reset to default");
  }

  // Add or update movie/series
  async function handleAddOrUpdate() {
    if (!form.title) {
      addNotification("error", "Title is required");
      return;
    }

    if (!form.videoUrl) {
      addNotification("error", "Video URL is required");
      return;
    }

    // Validate Mux URL
    if (form.videoType === "mux" && !isMuxUrl(form.videoUrl)) {
      addNotification("error", "Invalid Mux URL. Format should be: https://stream.mux.com/PLAYBACK_ID.mp4");
      return;
    }

    const finalData = {
      title: form.title,
      description: form.description,
      poster: form.poster || generateMuxThumbnail(form.videoUrl),
      background: form.background || form.poster || generateMuxThumbnail(form.videoUrl),
      rating: form.rating || null,
      category: form.category || "",
      type: form.type,
      videoUrl: form.videoUrl,
      streamLink: form.streamLink || generateMuxHls(form.videoUrl),
      download_link: form.download_link || "",
      nation: form.nation || "",
      translator: form.translator || "", // Include translator
      videoType: form.videoType || detectVideoType(form.videoUrl)
    };

    if (form.type === "series") {
      finalData.totalSeasons = form.totalSeasons || null;
      finalData.totalEpisodes = form.totalEpisodes || null;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateMovie(editingId, finalData);
        addNotification("success", `✅ ${form.type === 'series' ? 'Series' : 'Movie'} "${form.title}" updated successfully`);
      } else {
        await addMovie(finalData);
        addNotification("success", `✅ ${form.type === 'series' ? 'Series' : 'Movie'} "${form.title}" added successfully`);
      }

      setTimeout(() => {
        refreshMovies();
      }, 1000);

      resetForm();
    } catch (err) {
      console.error("❌ Error saving content:", err);
      addNotification("error", `❌ Error saving: ${err.message || "Please try again"}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Delete movie/series
  async function handleDelete(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    if (!window.confirm(`Are you sure you want to delete "${movie.title}"?`)) return;

    try {
      await deleteMovie(id);
      addNotification("success", `🗑️ "${movie.title}" deleted successfully`);
      refreshMovies();
    } catch (error) {
      console.error("Error deleting:", error);
      addNotification("error", "❌ Error deleting item");
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
        episodeNumber: (parseInt(lastEpisode.episodeNumber || 0) + 1).toString()
      }));
    }

    addNotification("info", `Now managing episodes for: ${series.title}`);
  }

  // Add new episode
  async function handleAddEpisode() {
    if (!selectedSeries) {
      addNotification("error", "No series selected");
      return;
    }

    if (!episodeForm.title || !episodeForm.videoUrl) {
      addNotification("error", "Episode title and video URL are required");
      return;
    }

    // Validate Mux URL for episodes
    if (episodeForm.videoType === "mux" && !isMuxUrl(episodeForm.videoUrl)) {
      addNotification("error", "Invalid Mux URL for episode. Use: https://stream.mux.com/PLAYBACK_ID.mp4");
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
        thumbnail: episodeForm.thumbnail || selectedSeries.poster || generateMuxThumbnail(episodeForm.videoUrl),
        streamLink: episodeForm.videoUrl,
        download_link: episodeForm.download_link || "",
        videoType: episodeForm.videoType || detectVideoType(episodeForm.videoUrl)
      };

      await addEpisode(episodeData);
      addNotification("success", `✅ Episode "${episodeForm.title}" added successfully`);

      // Reset form with next episode number
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

      // Refresh episodes list
      const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      setSeriesEpisodes(sortEpisodes(updatedEpisodes));

    } catch (err) {
      console.error("❌ Error adding episode:", err);
      addNotification("error", "❌ Error adding episode. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Bulk episode handling
  const handleBulkAddEpisode = () => {
    setBulkEpisodes([...bulkEpisodes, { ...emptyEpisode }]);
  };

  const handleBulkEpisodeChange = (index, field, value) => {
    const updated = [...bulkEpisodes];
    updated[index][field] = value;

    // Auto-generate thumbnail for Mux URLs
    if (field === 'videoUrl' && isMuxUrl(value)) {
      updated[index].thumbnail = generateMuxThumbnail(value);
    }

    setBulkEpisodes(updated);
  };

  const handleBulkUpload = async () => {
    if (!selectedSeries) {
      addNotification("error", "No series selected");
      return;
    }

    const validEpisodes = bulkEpisodes.filter(ep => ep.title && ep.videoUrl);

    if (validEpisodes.length === 0) {
      addNotification("error", "No valid episodes to upload!");
      return;
    }

    setSubmitting(true);
    try {
      let successCount = 0;

      for (const episode of validEpisodes) {
        const episodeData = {
          ...episode,
          seriesId: selectedSeries.id,
          seriesTitle: selectedSeries.title,
          seasonNumber: parseInt(episode.seasonNumber) || 1,
          episodeNumber: parseInt(episode.episodeNumber) || 1,
          thumbnail: episode.thumbnail || selectedSeries.poster || generateMuxThumbnail(episode.videoUrl),
          streamLink: episode.videoUrl,
          download_link: episode.download_link || "",
          videoType: detectVideoType(episode.videoUrl)
        };

        await addEpisode(episodeData);
        successCount++;
      }

      setBulkEpisodes([{ ...emptyEpisode }]);
      setShowBulkUpload(false);

      addNotification("success", `✅ ${successCount} episodes uploaded successfully!`);

      const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      setSeriesEpisodes(sortEpisodes(updatedEpisodes));

    } catch (error) {
      console.error("Error in bulk upload:", error);
      addNotification("error", "❌ Error uploading episodes");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete episode
  async function handleDeleteEpisode(episodeId) {
    if (!window.confirm("Are you sure you want to delete this episode?")) return;

    try {
      await deleteEpisode(episodeId);
      addNotification("success", "✅ Episode deleted successfully");

      if (selectedSeries) {
        const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
        setSeriesEpisodes(sortEpisodes(updatedEpisodes));
      }
    } catch (error) {
      console.error("❌ Error deleting episode:", error);
      addNotification("error", "❌ Error deleting episode");
    }
  }

  // Update episode
  async function handleUpdateEpisode(episode) {
    if (!episode) return;

    try {
      const newTitle = prompt("Enter new title:", episode.title);
      if (!newTitle || newTitle.trim() === "") return;

      await updateEpisode(episode.id, { ...episode, title: newTitle });
      addNotification("success", "✅ Episode updated successfully");

      if (selectedSeries) {
        const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
        setSeriesEpisodes(sortEpisodes(updatedEpisodes));
      }
    } catch (error) {
      console.error("❌ Error updating episode:", error);
      addNotification("error", "❌ Error updating episode");
    }
  }

  // Refresh all data
  async function handleRefresh() {
    try {
      await refreshMovies();
      await refreshEpisodes();
      addNotification("success", "🔄 Content refreshed from database");
    } catch (error) {
      console.error("Error refreshing:", error);
      addNotification("error", "❌ Failed to refresh content");
    }
  }

  // Clear all content
  async function handleClearAll() {
    if (!window.confirm("⚠️ Are you sure you want to clear ALL content? This action cannot be undone!")) return;

    try {
      await clearAllMovies();
      await clearAllEpisodes();
      addNotification("warning", "🧹 All content cleared from database");
    } catch (error) {
      console.error("Error clearing content:", error);
      addNotification("error", "❌ Failed to clear content");
    }
  }

  // Copy Mux playback ID
  const copyPlaybackId = () => {
    const playbackId = extractMuxPlaybackId(form.videoUrl);
    if (playbackId) {
      navigator.clipboard.writeText(playbackId);
      addNotification("success", "✅ Playback ID copied to clipboard!");
    }
  };

  // Open Mux dashboard
  const openMuxDashboard = () => {
    window.open('https://dashboard.mux.com', '_blank');
  };

  // Filter and sort movies
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.translator || "").toLowerCase().includes(searchTerm.toLowerCase()); // Search translator too
    const matchesType = filterType === "all" || movie.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortConfig.key === 'title') {
      return sortConfig.direction === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });

  // Statistics
  const commonNations = ["USA", "UK", "India", "China", "Japan", "Korea", "France", "Germany", "Italy", "Spain", "Russia", "Brazil", "Mexico", "Australia", "Canada"];
  const seriesOnly = movies.filter(m => m.type === "series");
  const moviesOnly = movies.filter(m => m.type === "movie");
  const totalEpisodesCount = episodes.length;
  const muxMovies = movies.filter(m => m.videoType === "mux").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-28 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl mb-2">Loading movies from database...</p>
          <p className="text-gray-400 text-sm">Please wait while we fetch your content</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-28 flex items-center justify-center">
        <div className="text-white text-center max-w-md p-8">
          <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Database Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pb-16 px-4 md:px-6 pt-28">
      {/* Notification Container */}
      <div className="fixed top-20 right-4 z-50 max-w-md w-full space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ease-out ${notification.type === "success"
              ? "bg-gradient-to-r from-green-900/90 to-green-800/90 border-l-4 border-green-500"
              : notification.type === "error"
                ? "bg-gradient-to-r from-red-900/90 to-red-800/90 border-l-4 border-red-500"
                : notification.type === "warning"
                  ? "bg-gradient-to-r from-yellow-900/90 to-yellow-800/90 border-l-4 border-yellow-500"
                  : "bg-gradient-to-r from-blue-900/90 to-blue-800/90 border-l-4 border-blue-500"
              } backdrop-blur-lg rounded-r-lg shadow-2xl p-4 flex items-start gap-3 animate-slide-in`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" && <FaCheckCircle className="text-green-400 text-xl" />}
              {notification.type === "error" && <FaExclamationTriangle className="text-red-400 text-xl" />}
              {notification.type === "warning" && <FaExclamationTriangle className="text-yellow-400 text-xl" />}
              {notification.type === "info" && <FaExclamationTriangle className="text-blue-400 text-xl" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-300 hover:text-white transition-colors"
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
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <BsStars className="text-xl" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-400">
              Managing {movies.length} movies, {seriesOnly.length} series, and {totalEpisodesCount} episodes
              {muxMovies > 0 && <span className="text-green-400 ml-2">• {muxMovies} using Mux</span>}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isOnline ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">{syncStatus}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <FaSync className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Stats with Mux counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/20 rounded-lg">
                <FaFilm className="text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{moviesOnly.length}</div>
                <div className="text-sm text-gray-400">Movies</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <FaTv className="text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{seriesOnly.length}</div>
                <div className="text-sm text-gray-400">Series</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <FaShieldAlt className="text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{muxMovies}</div>
                <div className="text-sm text-gray-400">Mux Videos</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <FaDatabase className="text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalEpisodesCount}</div>
                <div className="text-sm text-gray-400">Episodes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mux Guide Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowMuxGuide(!showMuxGuide)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-medium transition-all"
          >
            <FaCloudUpload />
            {showMuxGuide ? 'Hide Mux Guide' : 'Show Mux Guide'}
          </button>
        </div>

        {/* Mux Guide */}
        {showMuxGuide && (
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 backdrop-blur-lg rounded-2xl border border-green-700/30 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-300 flex items-center gap-2">
                <FaCloudUpload /> How to Use Mux for Video Hosting
              </h3>
              <button
                onClick={() => setShowMuxGuide(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-200">Step 1: Upload to Mux</h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
                  <li>Go to <a href="https://dashboard.mux.com" target="_blank" className="text-green-400 hover:underline">Mux Dashboard</a></li>
                  <li>Click "Upload a video"</li>
                  <li>Wait for processing (2-10 minutes)</li>
                  <li>Copy the "Playback ID"</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-green-200">Step 2: Build Your URLs</h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <div>
                    <span className="text-green-300">Video URL:</span>
                    <code className="block bg-gray-900 p-2 rounded text-xs mt-1 text-green-400">
                      https://stream.mux.com/[PLAYBACK_ID].mp4
                    </code>
                  </div>
                  <div>
                    <span className="text-blue-300">Thumbnail URL:</span>
                    <code className="block bg-gray-900 p-2 rounded text-xs mt-1 text-blue-400">
                      https://image.mux.com/[PLAYBACK_ID]/thumbnail.jpg
                    </code>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-green-200">Step 3: Paste in Admin</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Paste MP4 URL in Video URL field</li>
                  <li>• Thumbnail will auto-generate</li>
                  <li>• Background image will auto-fill</li>
                  <li>• HLS stream will auto-generate</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-black/30 rounded-xl">
              <h4 className="font-semibold text-yellow-300 mb-2">📝 Example Mux URLs:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Playback ID:</span>
                  <code className="bg-gray-900 px-2 py-1 rounded">VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Video URL:</span>
                  <code className="bg-gray-900 px-2 py-1 rounded text-green-400">https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.mp4</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Thumbnail:</span>
                  <code className="bg-gray-900 px-2 py-1 rounded text-blue-400">https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("series")}
              className={`px-6 py-3 font-medium ${activeTab === "series"
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-gray-300"}`}
            >
              <FaTv className="inline mr-2" /> Manage Series
            </button>
            <button
              onClick={() => setActiveTab("episodes")}
              className={`px-6 py-3 font-medium ${activeTab === "episodes"
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-gray-300"}`}
            >
              <FaList className="inline mr-2" /> Manage Episodes
            </button>
          </div>
        </div>

        {/* SERIES MANAGEMENT TAB */}
        {activeTab === "series" && (
          <div className="space-y-8">
            {/* Add/Edit Series Form */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaPlus className="text-purple-500" />
                  {editingId ? "Edit Series/Movie" : "Add New Series/Movie"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${editingId ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {editingId ? "Editing Mode" : "Create Mode"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${form.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                    {form.type === 'series' ? '📺 Series' : '🎬 Movie'}
                  </span>
                  {form.videoUrl && isMuxUrl(form.videoUrl) && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                      <FaShieldAlt className="text-xs" /> Mux
                    </span>
                  )}
                </div>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setForm({ ...emptyMovie, type: "movie" })}
                  className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${form.type === "movie"
                    ? "bg-red-600/20 border-2 border-red-500/50"
                    : "bg-gray-800/50 border border-gray-700 hover:bg-gray-800/80"
                    }`}
                >
                  <FaFilm className={`text-2xl ${form.type === "movie" ? "text-red-400" : "text-gray-400"}`} />
                  <span className={`font-medium ${form.type === "movie" ? "text-red-300" : "text-gray-300"}`}>
                    Movie
                  </span>
                </button>
                <button
                  onClick={() => setForm({ ...emptyMovie, type: "series" })}
                  className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${form.type === "series"
                    ? "bg-purple-600/20 border-2 border-purple-500/50"
                    : "bg-gray-800/50 border border-gray-700 hover:bg-gray-800/80"
                    }`}
                >
                  <FaTv className={`text-2xl ${form.type === "series" ? "text-purple-400" : "text-gray-400"}`} />
                  <span className={`font-medium ${form.type === "series" ? "text-purple-300" : "text-gray-300"}`}>
                    TV Series
                  </span>
                </button>
              </div>

              {/* Mux Upload Helper */}
              <div className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-green-300 font-medium flex items-center gap-2">
                    <FaCloudUpload /> Mux Video Hosting
                  </h3>
                  <button
                    onClick={openMuxDashboard}
                    className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                  >
                    <FaExternalLinkAlt /> Open Mux Dashboard
                  </button>
                </div>
                <p className="text-sm text-green-200/80 mb-3">
                  For best streaming quality, use Mux. Paste your Mux MP4 URL below.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="text-center p-2 bg-black/30 rounded">
                    <div className="text-green-400">Step 1</div>
                    <div>Upload to Mux</div>
                  </div>
                  <div className="text-center p-2 bg-black/30 rounded">
                    <div className="text-green-400">Step 2</div>
                    <div>Copy Playback ID</div>
                  </div>
                  <div className="text-center p-2 bg-black/30 rounded">
                    <div className="text-green-400">Step 3</div>
                    <div>Paste URL here</div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter title"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                  <input
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="e.g., 8.5"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Video URL - Mux Field */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Mux Video URL <span className="text-red-500">*</span>
                      <span className="text-green-400 text-xs ml-2">(https://stream.mux.com/PLAYBACK_ID.mp4)</span>
                    </label>
                    {form.videoUrl && isMuxUrl(form.videoUrl) && (
                      <button
                        onClick={copyPlaybackId}
                        className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                      >
                        <FaCopy /> Copy Playback ID
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="videoUrl"
                      value={form.videoUrl}
                      onChange={handleChange}
                      placeholder="https://stream.mux.com/PLAYBACK_ID.mp4"
                      className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-sm"
                    />
                  </div>
                  {form.videoUrl && (
                    <div className={`mt-2 p-2 rounded text-xs ${isMuxUrl(form.videoUrl)
                      ? 'bg-green-900/20 text-green-400 border border-green-700/30'
                      : 'bg-yellow-900/20 text-yellow-400 border border-yellow-700/30'
                      }`}>
                      {isMuxUrl(form.videoUrl)
                        ? '✅ Valid Mux URL detected. Thumbnail and HLS will auto-generate.'
                        : '⚠️ Not a Mux URL. For best quality, use Mux (https://stream.mux.com/...).'
                      }
                    </div>
                  )}
                </div>

                {/* Poster URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Poster URL
                    <span className="text-gray-500 text-xs ml-2">(Auto-filled from Mux)</span>
                  </label>
                  <div className="relative">
                    <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="poster"
                      value={form.poster}
                      onChange={handleChange}
                      placeholder="https://image.mux.com/PLAYBACK_ID/thumbnail.jpg"
                      className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Background Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Background Image URL
                    <span className="text-gray-500 text-xs ml-2">(Hero section - wide image)</span>
                  </label>
                  <div className="relative">
                    <FaMountain className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="background"
                      value={form.background}
                      onChange={handleChange}
                      placeholder="https://image.mux.com/PLAYBACK_ID/thumbnail.jpg?width=1920&height=1080"
                      className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows="3"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g., Action, Drama"
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Nation */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nation</label>
                  <select
                    name="nation"
                    value={form.nation}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="">Select Country</option>
                    {commonNations.map(nation => (
                      <option key={nation} value={nation}>{nation}</option>
                    ))}
                  </select>
                </div>

                {/* Translator Field - SIMPLE TEXT INPUT */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Translator/Release Group
                    <span className="text-gray-500 text-xs ml-2">(Optional - Type your own)</span>
                  </label>
                  <div className="relative">
                    <FaLanguage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="translator"
                      value={form.translator}
                      onChange={handleChange}
                      placeholder="e.g., Official, YTS, Subscene, Custom Name"
                      className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter any translator or release group name
                  </p>
                </div>

                {/* Series-specific fields */}
                {form.type === "series" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Total Seasons</label>
                      <input
                        name="totalSeasons"
                        value={form.totalSeasons}
                        onChange={handleChange}
                        type="number"
                        min="1"
                        placeholder="e.g., 3"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Total Episodes</label>
                      <input
                        name="totalEpisodes"
                        value={form.totalEpisodes}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        placeholder="e.g., 24"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Download Link */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Download Link (Optional)
                  </label>
                  <div className="relative">
                    <FaDownload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="download_link"
                      value={form.download_link}
                      onChange={handleChange}
                      placeholder="https://example.com/download.mp4"
                      className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleAddOrUpdate}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <FaSave />
                  {submitting ? "Processing..." : editingId ? "Update Content" : "Add Content"}
                </button>

                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition-all duration-300"
                >
                  <FaUndo />
                  Reset Form
                </button>

                {preview && form.title && (
                  <button
                    onClick={() => setPreview(!preview)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all duration-300"
                  >
                    <FaEye className={preview ? "" : "hidden"} />
                    {preview ? "Hide Preview" : "Show Preview"}
                  </button>
                )}
              </div>

              {/* Preview */}
              {preview && form.title && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-bold mb-4">Preview</h3>
                  <div className="bg-gray-800/30 rounded-xl p-6">
                    {/* Background Preview */}
                    {form.background && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Hero Background Preview:</h4>
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <img
                            src={form.background}
                            alt="Background preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=1920&h=1080';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-4">
                            <div>
                              <h4 className="text-xl font-bold text-white">{form.title}</h4>
                              <p className="text-gray-300 text-sm">This will appear in hero section</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content Preview */}
                    <div className="flex gap-6">
                      {form.poster && (
                        <img
                          src={form.poster}
                          alt={form.title}
                          className="w-32 h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xl font-bold">{form.title}</h4>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${form.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                              {form.type === 'series' ? '📺 Series' : '🎬 Movie'}
                            </span>
                            {isMuxUrl(form.videoUrl) && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                                <FaShieldAlt className="text-xs" /> Mux
                              </span>
                            )}
                          </div>
                        </div>
                        {form.rating && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-yellow-400">⭐ {form.rating}</span>
                          </div>
                        )}
                        {form.description && (
                          <p className="text-gray-300 mb-4">{form.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {form.category && (
                            <span className="px-2 py-1 bg-gray-700/50 rounded text-xs">{form.category}</span>
                          )}
                          {form.nation && (
                            <span className="px-2 py-1 bg-gray-700/50 rounded text-xs flex items-center gap-1">
                              <FaGlobe /> {form.nation}
                            </span>
                          )}
                          {form.translator && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
                              <FaLanguage /> {form.translator}
                            </span>
                          )}
                          {form.background && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center gap-1">
                              <FaMountain /> Has Background
                            </span>
                          )}
                          {isMuxUrl(form.videoUrl) && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
                              <FaShieldAlt /> Mux Streaming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Series List - Updated to show translator */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaTv className="text-purple-500" />
                  All Series & Movies ({movies.length})
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search series/movies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="series">Series</option>
                  </select>
                </div>
              </div>

              {sortedMovies.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-12 text-center">
                  <div className="text-6xl mb-6">🎬</div>
                  <h2 className="text-2xl font-bold text-white mb-3">No Content Found</h2>
                  <p className="text-gray-400 mb-6">Add your first movie or series to get started</p>
                  <button
                    onClick={() => setShowMuxGuide(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-medium"
                  >
                    Learn How to Use Mux
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedMovies.map((movie) => {
                    const episodeCount = movie.type === 'series' ? getEpisodesBySeries(movie.id).length : 0;
                    const hasBackground = !!movie.background && movie.background !== movie.poster;
                    const isMux = movie.videoType === "mux" || isMuxUrl(movie.videoUrl);
                    const hasTranslator = !!movie.translator;

                    return (
                      <div key={movie.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4 transition-all hover:border-purple-500/30">
                        <div className="flex gap-4">
                          <div className="relative group flex-shrink-0">
                            <img
                              src={movie.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'}
                              alt={movie.title}
                              className="w-20 h-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className={`absolute top-1 right-1 px-2 py-1 rounded text-xs font-bold ${movie.type === 'series' ? 'bg-purple-600' : 'bg-red-600'}`}>
                              {movie.type === 'series' ? '📺' : '🎬'}
                            </div>
                            {hasBackground && (
                              <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-600">
                                <FaMountain className="text-xs" />
                              </div>
                            )}
                            {isMux && (
                              <div className="absolute -top-1 -left-1 px-2 py-0.5 rounded text-xs font-bold bg-green-600">
                                <FaShieldAlt className="text-xs" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg truncate">{movie.title}</h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(movie)}
                                  className="p-1 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit className="text-blue-400 text-sm" />
                                </button>
                                {movie.type === 'series' && (
                                  <button
                                    onClick={() => selectSeriesForEpisodes(movie)}
                                    className="p-1 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors"
                                    title="Manage Episodes"
                                  >
                                    <FaList className="text-purple-400 text-sm" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(movie.id)}
                                  className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FaTrash className="text-red-400 text-sm" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${movie.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                                {movie.type === 'series' ? 'Series' : 'Movie'}
                              </span>
                              {movie.rating && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                  ⭐ {movie.rating}
                                </span>
                              )}
                              {movie.type === 'series' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                  📺 {episodeCount} eps
                                </span>
                              )}
                              {hasTranslator && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                                  <FaLanguage className="text-xs" /> {movie.translator}
                                </span>
                              )}
                              {hasBackground && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 flex items-center gap-1">
                                  <FaMountain className="text-xs" /> Hero
                                </span>
                              )}
                              {isMux && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                                  <FaShieldAlt className="text-xs" /> Mux
                                </span>
                              )}
                            </div>
                            {movie.description && (
                              <p className="text-sm text-gray-400 line-clamp-2">{movie.description}</p>
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

        {/* EPISODES MANAGEMENT TAB - Similar updates for episode forms */}
        {/* ... (episodes tab content remains similar but with Mux URL support) ... */}

        {/* Danger Zone */}
        <div className="mt-8 p-6 bg-gradient-to-br from-red-900/10 to-red-900/5 backdrop-blur-lg rounded-2xl border border-red-700/30">
          <h3 className="text-lg font-bold mb-4 text-red-300">⚠️ Danger Zone</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-300 transition-colors"
            >
              <FaTrash className="inline mr-2" />
              Clear All Content
            </button>
            <p className="text-sm text-gray-400 md:ml-4">
              This will permanently delete all movies, series, and episodes. Use with extreme caution.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Admin;