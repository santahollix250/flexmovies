import { useContext, useState, useEffect } from "react";
import { MoviesContext } from "../context/MoviesContext";
import {
  FaEdit, FaTrash, FaFilm, FaTv, FaSave, FaUndo, FaPlus,
  FaLink, FaImage, FaGlobe, FaLanguage, FaSync, FaDatabase,
  FaCheckCircle, FaExclamationTriangle, FaTimes, FaList,
  FaCalendar, FaClock, FaPlay, FaFolder, FaExclamationCircle,
  FaDownload, FaSignOutAlt, FaYoutube, FaVideo
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

  const empty = {
    title: "",
    description: "",
    poster: "",
    background: "",
    rating: "",
    category: "",
    type: "movie",
    streamLink: "",
    videoUrl: "",
    downloadLink: "",
    nation: "",
    translator: "",
    totalSeasons: "",
    totalEpisodes: "",
    videoType: "direct"
  };

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Online");
  const [notifications, setNotifications] = useState([]);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesEpisodes, setSeriesEpisodes] = useState([]);
  const [episodeForm, setEpisodeForm] = useState({
    seasonNumber: "1",
    episodeNumber: "1",
    title: "",
    description: "",
    duration: "",
    streamLink: "",
    videoUrl: "",
    downloadLink: "",
    thumbnail: "",
    airDate: "",
    videoType: "direct"
  });

  // Detect video type from URL
  const detectVideoType = (url) => {
    if (!url || typeof url !== 'string') return "direct";

    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i;
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/i;
    const dailymotionRegex = /dailymotion\.com\/video\/([a-zA-Z0-9]+)/i;
    const twitchRegex = /twitch\.tv\/(?:videos\/)?(\d+)/i;
    const facebookRegex = /facebook\.com\/(?:watch\/)?\?v=(\d+)/i;

    if (youtubeRegex.test(url)) return "youtube";
    if (vimeoRegex.test(url)) return "vimeo";
    if (dailymotionRegex.test(url)) return "dailymotion";
    if (twitchRegex.test(url)) return "twitch";
    if (facebookRegex.test(url)) return "facebook";
    if (url.match(/\.(mp4|webm|mkv|avi|mov)$/i)) return "direct";
    if (url.match(/\.m3u8$/i)) return "hls";
    if (url.match(/\.mpd$/i)) return "dash";

    return "direct";
  };

  useEffect(() => {
    setSyncStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

  useEffect(() => {
    if (selectedSeries && typeof getEpisodesBySeries === 'function') {
      const loadedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      setSeriesEpisodes(loadedEpisodes);

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
    }
  }, [selectedSeries, getEpisodesBySeries]);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_auth_expiry');
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    }
  };

  function addNotification(type, message) {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    return id;
  }

  function removeNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "videoUrl" || name === "streamLink") {
      const videoType = detectVideoType(value);
      setForm((f) => ({
        ...f,
        [name]: value,
        videoType: videoType
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleEpisodeChange(e) {
    const { name, value } = e.target;

    if (name === "videoUrl" || name === "streamLink") {
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

  function startEdit(movie) {
    if (!movie) return;

    setEditingId(movie.id);
    const streamLink = movie.streamLink || movie.stream_link || "";
    setForm({
      ...movie,
      streamLink: streamLink,
      videoUrl: movie.videoUrl || streamLink,
      downloadLink: movie.downloadLink || movie.download_link || "",
      totalSeasons: movie.totalSeasons || "",
      totalEpisodes: movie.totalEpisodes || "",
      videoType: movie.videoType || detectVideoType(streamLink)
    });
    setPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Editing: ${movie.title}`);
  }

  function resetForm() {
    setEditingId(null);
    setForm(empty);
    setPreview(false);
    setShowEpisodes(false);
    setSelectedSeries(null);
    setSeriesEpisodes([]);
    setEpisodeForm({
      seasonNumber: "1",
      episodeNumber: "1",
      title: "",
      description: "",
      duration: "",
      streamLink: "",
      videoUrl: "",
      downloadLink: "",
      thumbnail: "",
      airDate: "",
      videoType: "direct"
    });
    addNotification("info", "Form reset to default");
  }

  async function handleAddOrUpdate() {
    if (!form.title || !form.poster) {
      addNotification("error", "Title and Poster are required");
      return;
    }

    // Use videoUrl if provided, otherwise use streamLink (backward compatibility)
    const finalData = {
      ...form,
      streamLink: form.videoUrl || form.streamLink,
      videoUrl: form.videoUrl || form.streamLink
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateMovie(editingId, finalData);
        addNotification("success", `✅ ${form.type === 'series' ? 'Series' : 'Movie'} "${form.title}" updated successfully`);
      } else {
        await addMovie(finalData);
        addNotification("success", `✅ ${form.type === 'series' ? 'Series' : 'Movie'} "${form.title}" added successfully`);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving content:", err);
      addNotification("error", "❌ Error saving. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    if (!window.confirm(`Are you sure you want to delete "${movie.title}"?`)) return;

    try {
      await deleteMovie(id);
      addNotification("success", `🗑️ "${movie.title}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting:", error);
      addNotification("error", "❌ Error deleting item");
    }
  }

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

  async function handleManageEpisodes(series) {
    if (!series) return;

    setSelectedSeries(series);
    setShowEpisodes(true);
    const streamLink = series.streamLink || series.stream_link || "";
    setForm({
      ...series,
      streamLink: streamLink,
      videoUrl: series.videoUrl || streamLink,
      downloadLink: series.downloadLink || series.download_link || "",
      totalSeasons: series.totalSeasons || "",
      totalEpisodes: series.totalEpisodes || "",
      videoType: series.videoType || detectVideoType(streamLink)
    });
    setEditingId(series.id);

    const loadedEpisodes = getEpisodesBySeries(series.id) || [];
    setSeriesEpisodes(loadedEpisodes);

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
        videoType: lastEpisode.videoType || "direct"
      }));
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Managing episodes for: ${series.title}`);
  }

  async function handleAddEpisode() {
    if (!selectedSeries) {
      addNotification("error", "No series selected");
      return;
    }

    if (!episodeForm.title || !episodeForm.videoUrl) {
      addNotification("error", "Episode title and video URL are required");
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
        thumbnail: episodeForm.thumbnail || selectedSeries.poster || "",
        streamLink: episodeForm.videoUrl || episodeForm.streamLink,
        videoUrl: episodeForm.videoUrl || episodeForm.streamLink
      };

      await addEpisode(episodeData);
      addNotification("success", `✅ Episode "${episodeForm.title}" added successfully`);

      setEpisodeForm(prev => ({
        ...prev,
        episodeNumber: (parseInt(prev.episodeNumber || 1) + 1).toString(),
        title: "",
        description: "",
        duration: "",
        streamLink: "",
        videoUrl: "",
        downloadLink: "",
        thumbnail: "",
        airDate: "",
        videoType: "direct"
      }));

      const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      setSeriesEpisodes(updatedEpisodes);

    } catch (err) {
      console.error("❌ Error adding episode:", err);
      addNotification("error", "❌ Error adding episode. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEpisode(episodeId) {
    if (!window.confirm("Are you sure you want to delete this episode?")) return;

    try {
      await deleteEpisode(episodeId);
      addNotification("success", "✅ Episode deleted successfully");

      if (selectedSeries) {
        const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
        setSeriesEpisodes(updatedEpisodes);
      }
    } catch (error) {
      console.error("❌ Error deleting episode:", error);
      addNotification("error", "❌ Error deleting episode");
    }
  }

  async function handleUpdateEpisode(episode) {
    if (!episode) return;

    try {
      const newTitle = prompt("Enter new title:", episode.title);
      if (!newTitle || newTitle.trim() === "") return;

      await updateEpisode(episode.id, { ...episode, title: newTitle });
      addNotification("success", "✅ Episode updated successfully");

      if (selectedSeries) {
        const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
        setSeriesEpisodes(updatedEpisodes);
      }
    } catch (error) {
      console.error("❌ Error updating episode:", error);
      addNotification("error", "❌ Error updating episode");
    }
  }

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
          <p className="text-sm text-gray-500 mb-6">
            Check your Supabase connection and table structure.
          </p>
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

  const commonNations = ["USA", "UK", "India", "China", "Japan", "Korea", "France", "Germany", "Italy", "Spain", "Russia", "Brazil", "Mexico", "Australia", "Canada"];
  const seriesOnly = movies.filter(m => m.type === "series");
  const moviesOnly = movies.filter(m => m.type === "movie");
  const totalEpisodesCount = episodes.length;

  // Add CSS animation
  const slideInAnimation = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pb-16 px-4 md:px-6 pt-28">
      {/* Add CSS animation */}
      <style>{slideInAnimation}</style>

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
              {notification.type === "success" && (
                <FaCheckCircle className="text-green-400 text-xl" />
              )}
              {notification.type === "error" && (
                <FaExclamationTriangle className="text-red-400 text-xl" />
              )}
              {notification.type === "warning" && (
                <FaExclamationTriangle className="text-yellow-400 text-xl" />
              )}
              {notification.type === "info" && (
                <FaExclamationTriangle className="text-blue-400 text-xl" />
              )}
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
        {/* Header with Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <BsStars className="text-xl" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Content Manager
              </h1>
            </div>
            <p className="text-gray-400">
              Managing {movies.length} movies, {seriesOnly.length} series, and {totalEpisodesCount} episodes
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isOnline ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
              }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
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
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center gap-2"
            >
              <FaTrash />
              Clear All
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 hover:bg-red-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
              title="Logout from admin panel"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Overview */}
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
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <FaDatabase className="text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {isOnline ? 'Connected' : 'Offline'}
                </div>
                <div className="text-sm text-gray-400">Database</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <FaFolder className="text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalEpisodesCount}</div>
                <div className="text-sm text-gray-400">Episodes</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Form Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaPlus className="text-purple-500" />
                  {showEpisodes ? "Manage Episodes" : editingId ? "Edit Content" : "Add New Content"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${editingId ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                    {editingId ? "Editing Mode" : "Create Mode"}
                  </span>
                  {form.type === "series" && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      📺 Series
                    </span>
                  )}
                </div>
              </div>

              {showEpisodes && selectedSeries ? (
                <div className="space-y-6">
                  {/* Episode Form */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Season Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="seasonNumber"
                        value={episodeForm.seasonNumber}
                        onChange={handleEpisodeChange}
                        type="number"
                        min="1"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Episode Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="episodeNumber"
                        value={episodeForm.episodeNumber}
                        onChange={handleEpisodeChange}
                        type="number"
                        min="1"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Episode Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="title"
                        value={episodeForm.title}
                        onChange={handleEpisodeChange}
                        placeholder="Enter episode title"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>

                    {/* Episode Video URL Field */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <FaVideo className="inline mr-2" /> Video URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="videoUrl"
                        value={episodeForm.videoUrl}
                        onChange={handleEpisodeChange}
                        type="url"
                        placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supports: YouTube, Vimeo, Dailymotion, Twitch, Facebook, MP4, WebM, HLS, DASH
                      </p>
                      {episodeForm.videoUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${episodeForm.videoType === 'youtube' ? 'bg-red-600/20 text-red-400' :
                            episodeForm.videoType === 'vimeo' ? 'bg-blue-600/20 text-blue-400' :
                              'bg-gray-700/50 text-gray-400'
                            }`}>
                            {episodeForm.videoType === 'youtube' && <FaYoutube className="inline mr-1" />}
                            {episodeForm.videoType.charAt(0).toUpperCase() + episodeForm.videoType.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Download Link
                      </label>
                      <div className="relative">
                        <FaDownload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          name="downloadLink"
                          value={episodeForm.downloadLink}
                          onChange={handleEpisodeChange}
                          placeholder="https://example.com/download.mp4"
                          className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAddEpisode}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <FaSave />
                      {submitting ? "Adding..." : "Add Episode"}
                    </button>
                    <button
                      onClick={() => setShowEpisodes(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition-all duration-300"
                    >
                      <FaUndo />
                      Back to Series
                    </button>
                  </div>

                  {/* Episodes List */}
                  <div className="mt-8">
                    <h3 className="text-lg font-bold mb-4">Episodes ({seriesEpisodes.length})</h3>
                    <div className="space-y-3">
                      {seriesEpisodes.map((episode) => (
                        <div key={episode.id} className="bg-gray-800/30 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold">
                                S{episode.seasonNumber || 1}E{episode.episodeNumber || 1}: {episode.title}
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                {episode.description && <p className="mb-1">{episode.description}</p>}
                                <div className="flex gap-4 mt-2">
                                  {episode.duration && (
                                    <span className="flex items-center gap-1">
                                      <FaClock className="text-xs" /> {episode.duration}
                                    </span>
                                  )}
                                  {episode.airDate && (
                                    <span className="flex items-center gap-1">
                                      <FaCalendar className="text-xs" /> {episode.airDate}
                                    </span>
                                  )}
                                  {episode.videoType && episode.videoType !== 'direct' && (
                                    <span className={`px-2 py-0.5 rounded text-xs ${episode.videoType === 'youtube' ? 'bg-red-600/20 text-red-400' :
                                      episode.videoType === 'vimeo' ? 'bg-blue-600/20 text-blue-400' :
                                        'bg-gray-700/50 text-gray-400'
                                      }`}>
                                      {episode.videoType === 'youtube' && <FaYoutube className="inline mr-1" />}
                                      {episode.videoType}
                                    </span>
                                  )}
                                  {episode.downloadLink && (
                                    <span className="flex items-center gap-1 text-blue-400">
                                      <FaDownload className="text-xs" /> Download Available
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateEpisode(episode)}
                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FaEdit className="text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteEpisode(episode.id)}
                                className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FaTrash className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Content Type Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setForm({ ...empty, type: "movie" })}
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
                      onClick={() => setForm({ ...empty, type: "series" })}
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

                  {/* Form Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter movie/series title"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        required
                      />
                    </div>

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

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Poster URL <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          name="poster"
                          value={form.poster}
                          onChange={handleChange}
                          placeholder="https://example.com/poster.jpg"
                          className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Background URL</label>
                      <div className="relative">
                        <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          name="background"
                          value={form.background}
                          onChange={handleChange}
                          placeholder="https://example.com/background.jpg"
                          className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                    </div>

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

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <input
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="e.g., Action, Drama, Comedy"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>

                    {/* Main Video URL Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <FaVideo className="inline mr-2" /> Video URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="videoUrl"
                        value={form.videoUrl}
                        onChange={handleChange}
                        type="url"
                        placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supports: YouTube, Vimeo, Dailymotion, Twitch, Facebook, MP4, WebM, HLS, DASH
                      </p>
                      {form.videoUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${form.videoType === 'youtube' ? 'bg-red-600/20 text-red-400' :
                            form.videoType === 'vimeo' ? 'bg-blue-600/20 text-blue-400' :
                              'bg-gray-700/50 text-gray-400'
                            }`}>
                            {form.videoType === 'youtube' && <FaYoutube className="inline mr-1" />}
                            {form.videoType.charAt(0).toUpperCase() + form.videoType.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Download Link Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Download Link</label>
                      <div className="relative">
                        <FaDownload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          name="downloadLink"
                          value={form.downloadLink}
                          onChange={handleChange}
                          placeholder="https://example.com/download.mp4"
                          className="w-full pl-10 p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                    </div>

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

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Translator</label>
                      <input
                        name="translator"
                        value={form.translator}
                        onChange={handleChange}
                        placeholder="e.g., Netflix, HBO, Prime"
                        className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
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
                  </div>

                  <div className="flex flex-wrap gap-3">
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

                    {preview && (
                      <button
                        onClick={() => setPreview(!preview)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all duration-300"
                      >
                        <FaPlay />
                        {preview ? "Hide Preview" : "Show Preview"}
                      </button>
                    )}
                  </div>

                  {/* Preview */}
                  {preview && form.title && (
                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <h3 className="text-lg font-bold mb-4">Preview</h3>
                      <div className="bg-gray-800/30 rounded-xl p-6">
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
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${form.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {form.type === 'series' ? '📺 Series' : '🎬 Movie'}
                              </span>
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
                                <span className="px-2 py-1 bg-gray-700/50 rounded text-xs">
                                  {form.category}
                                </span>
                              )}
                              {form.nation && (
                                <span className="px-2 py-1 bg-gray-700/50 rounded text-xs flex items-center gap-1">
                                  <FaGlobe /> {form.nation}
                                </span>
                              )}
                              {form.translator && (
                                <span className="px-2 py-1 bg-gray-700/50 rounded text-xs flex items-center gap-1">
                                  <FaLanguage /> {form.translator}
                                </span>
                              )}
                              {form.videoUrl && (
                                <span className={`px-2 py-1 ${form.videoType === 'youtube' ? 'bg-red-700/50' :
                                  form.videoType === 'vimeo' ? 'bg-blue-700/50' :
                                    'bg-green-700/50'
                                  } rounded text-xs flex items-center gap-1`}>
                                  {form.videoType === 'youtube' && <FaYoutube />}
                                  {form.videoType === 'vimeo' && <FaVideo />}
                                  {form.videoType.charAt(0).toUpperCase() + form.videoType.slice(1)}
                                </span>
                              )}
                              {form.downloadLink && (
                                <span className="px-2 py-1 bg-blue-700/50 rounded text-xs flex items-center gap-1">
                                  <FaDownload /> Download Available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Library */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaFilm className="text-red-500" />
                  Content Library ({movies.length} items)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...empty, type: "movie" })}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center gap-2"
                  >
                    <FaFilm /> Add Movie
                  </button>
                  <button
                    onClick={() => setForm({ ...empty, type: "series" })}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center gap-2"
                  >
                    <FaTv /> Add Series
                  </button>
                </div>
              </div>

              {movies.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-12 text-center">
                  <div className="text-6xl mb-6">🎬</div>
                  <h2 className="text-2xl font-bold text-white mb-3">No Movies Found</h2>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Your database is empty. Add your first movie or series to get started.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => setForm({ ...empty, type: "movie" })}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center gap-2"
                    >
                      <FaFilm /> Add First Movie
                    </button>
                    <button
                      onClick={() => setForm({ ...empty, type: "series" })}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center gap-2"
                    >
                      <FaTv /> Add First Series
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2"
                    >
                      <FaSync /> Refresh Database
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {movies.map((m) => {
                    const seriesEpisodesCount = m.type === 'series' ? (getEpisodesBySeries(m.id) || []).length : 0;

                    return (
                      <div key={m.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4 transition-all hover:border-purple-500/30">
                        <div className="flex gap-4">
                          <div className="relative group flex-shrink-0">
                            <img
                              src={m.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'}
                              alt={m.title}
                              className="w-24 h-32 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400';
                              }}
                            />
                            <div className={`absolute top-1 right-1 px-2 py-1 rounded text-xs font-bold ${m.type === 'series' ? 'bg-purple-600' : 'bg-red-600'
                              }`}>
                              {m.type === 'series' ? '📺' : '🎬'}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-lg truncate">{m.title}</h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.type === 'series' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {m.type === 'series' ? '📺 Series' : '🎬 Movie'}
                                  </span>
                                  {m.rating && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                      ⭐ {m.rating}
                                    </span>
                                  )}
                                  {m.type === 'series' && seriesEpisodesCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                      📺 {seriesEpisodesCount} eps
                                    </span>
                                  )}
                                  {m.videoType && m.videoType !== 'direct' && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.videoType === 'youtube' ? 'bg-red-500/20 text-red-400' :
                                      m.videoType === 'vimeo' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-green-500/20 text-green-400'
                                      }`}>
                                      {m.videoType === 'youtube' && <FaYoutube className="inline mr-1" />}
                                      {m.videoType}
                                    </span>
                                  )}
                                  {(m.downloadLink || m.download_link) && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                      <FaDownload className="inline mr-1" /> Download
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(m)}
                                  className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit className="text-blue-400" />
                                </button>
                                {m.type === 'series' && (
                                  <button
                                    onClick={() => handleManageEpisodes(m)}
                                    className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors"
                                    title="Manage Episodes"
                                  >
                                    <FaList className="text-purple-400" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(m.id)}
                                  className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FaTrash className="text-red-400" />
                                </button>
                              </div>
                            </div>
                            {m.description && (
                              <p className="text-sm text-gray-400 line-clamp-2">{m.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {m.category && (
                                <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs">
                                  {typeof m.category === 'string' ? m.category.split(',')[0] : ''}
                                </span>
                              )}
                              {m.nation && (
                                <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs flex items-center gap-1">
                                  <FaGlobe className="text-xs" /> {m.nation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Stats Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Database Status */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-bold mb-4">Database Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Connection</span>
                    <span className={`flex items-center gap-2 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {isOnline ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Movies</span>
                    <span className="text-white font-medium">{moviesOnly.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Series</span>
                    <span className="text-white font-medium">{seriesOnly.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Episodes</span>
                    <span className="text-white font-medium">{totalEpisodesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Content</span>
                    <span className="text-white font-medium">{movies.length}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-bold mb-4">⚡ Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setForm({ ...empty, type: "movie" })}
                    className="w-full flex items-center gap-3 p-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-left"
                  >
                    <FaFilm className="text-red-400" />
                    <div>
                      <div className="font-medium">Add Movie</div>
                      <div className="text-xs text-gray-400">Create a new movie</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setForm({ ...empty, type: "series" })}
                    className="w-full flex items-center gap-3 p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors text-left"
                  >
                    <FaTv className="text-purple-400" />
                    <div>
                      <div className="font-medium">Add Series</div>
                      <div className="text-xs text-gray-400">Create a new TV series</div>
                    </div>
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="w-full flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors text-left"
                  >
                    <FaSync className="text-blue-400" />
                    <div>
                      <div className="font-medium">Refresh Data</div>
                      <div className="text-xs text-gray-400">Sync with database</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-gradient-to-br from-red-900/10 to-red-900/5 backdrop-blur-lg rounded-2xl border border-red-700/30 p-6">
                <h3 className="text-lg font-bold mb-4 text-red-300">⚠️ Danger Zone</h3>
                <p className="text-sm text-gray-400 mb-4">
                  These actions are irreversible. Use with caution.
                </p>
                <button
                  onClick={handleClearAll}
                  className="w-full flex items-center justify-center gap-3 p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors text-red-300"
                >
                  <FaTrash />
                  Clear All Content
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Admin;