import { FaPlay, FaStar, FaGlobe, FaLanguage, FaFilm, FaTv, FaCalendarAlt, FaClock, FaHeart, FaBookmark, FaShare, FaDownload, FaInfoCircle, FaYoutube, FaVideo, FaLink, FaExternalLinkAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie, onPlay }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();

  // Get stream URL - prioritize different sources
  const streamUrl = movie.streamLink || movie.videoUrl || null;

  // Detect video source type
  const getVideoSourceType = (url) => {
    if (!url) return 'unknown';

    const urlLower = url.toLowerCase();

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    } else if (urlLower.includes('vimeo.com')) {
      return 'vimeo';
    } else if (urlLower.includes('dailymotion.com')) {
      return 'dailymotion';
    } else if (urlLower.includes('twitch.tv')) {
      return 'twitch';
    } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
      return 'facebook';
    } else if (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.ogg') ||
      urlLower.includes('.m3u8') || urlLower.includes('.mpd')) {
      return 'file';
    } else {
      return 'unknown';
    }
  };

  // Safe stream URL (add https if missing)
  const safeStreamUrl = streamUrl?.startsWith('http')
    ? streamUrl
    : streamUrl
      ? `https://${streamUrl}`
      : null;

  const videoType = getVideoSourceType(safeStreamUrl);

  // Platform icons and colors
  const platformConfig = {
    youtube: { icon: <FaYoutube />, color: 'bg-red-600', textColor: 'text-red-400' },
    vimeo: { icon: <FaVideo />, color: 'bg-blue-600', textColor: 'text-blue-400' },
    dailymotion: { icon: <FaVideo />, color: 'bg-blue-800', textColor: 'text-blue-300' },
    twitch: { icon: <FaVideo />, color: 'bg-purple-600', textColor: 'text-purple-400' },
    facebook: { icon: <FaVideo />, color: 'bg-blue-700', textColor: 'text-blue-400' },
    file: { icon: <FaVideo />, color: 'bg-green-600', textColor: 'text-green-400' },
    unknown: { icon: <FaLink />, color: 'bg-gray-600', textColor: 'text-gray-400' }
  };

  const platformInfo = platformConfig[videoType] || platformConfig.unknown;

  // Safe download link with https
  const downloadUrl = movie.downloadLink || movie.download_link;
  const safeDownloadUrl = downloadUrl?.startsWith('http')
    ? downloadUrl
    : downloadUrl
      ? `https://${downloadUrl}`
      : null;

  // Format category display
  const categoryDisplay = movie.category?.split(',').map(cat => cat.trim()).join(' • ') ||
    movie.genre?.split(',').slice(0, 3).join(' • ') || 'No Category';

  // Year from various sources
  const movieYear = movie.year || movie.release_date?.split('-')[0] || new Date().getFullYear();

  // Duration from various sources
  const duration = movie.duration || movie.runtime || '2h 15m';

  // Rating from various sources
  const rating = movie.rating || (movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A');

  // Handle Watch Now
  const handleWatchNow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onPlay) {
      // Use parent's video player (modal)
      const videoData = {
        id: movie.id,
        title: movie.title,
        description: movie.description || movie.overview || "No description available.",
        videoUrl: safeStreamUrl || `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        thumbnail: movie.poster || movie.poster_path || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=300&fit=crop",
        duration: duration,
        year: movieYear,
        rating: rating,
        type: movie.type || 'movie',
        genre: movie.genre || movie.category || 'Action',
        cast: movie.cast || ['Unknown Cast'],
        director: movie.director || 'Unknown Director',
        streamUrl: safeStreamUrl
      };
      onPlay(videoData);
    } else if (safeStreamUrl) {
      // Prepare video data for navigation
      const videoData = {
        id: movie.id,
        title: movie.title,
        description: movie.description || movie.overview || "No description available.",
        videoUrl: safeStreamUrl,
        thumbnail: movie.poster || movie.poster_path || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=300&fit=crop",
        duration: duration,
        year: movieYear,
        rating: rating,
        type: movie.type || 'movie',
        genre: movie.genre || movie.category || 'Action',
        cast: movie.cast || ['Unknown Cast'],
        director: movie.director || 'Unknown Director',
        streamUrl: safeStreamUrl
      };

      // Navigate to video player page with movie data
      navigate('/player', {
        state: {
          movie: videoData
        }
      });
    } else {
      alert("Stream link not available for this movie.");
    }
  };

  // Handle download
  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (safeDownloadUrl) {
      const link = document.createElement('a');
      link.href = safeDownloadUrl;
      const fileName = `${movie.title.replace(/\s+/g, '_')}.mp4`;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Download link not available for this movie.");
    }
  };

  // Check if download is available
  const hasDownload = !!safeDownloadUrl;

  // Check if stream is available - only check if it's a valid URL
  const hasStream = !!safeStreamUrl && (
    safeStreamUrl.startsWith('http://') ||
    safeStreamUrl.startsWith('https://')
  );

  // Open in new tab
  const handleOpenInNewTab = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (safeStreamUrl) {
      window.open(safeStreamUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Toggle favorite
  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    const favorites = JSON.parse(localStorage.getItem('movie_favorites') || '[]');
    if (!isFavorite) {
      favorites.push(movie.id);
    } else {
      const index = favorites.indexOf(movie.id);
      if (index > -1) favorites.splice(index, 1);
    }
    localStorage.setItem('movie_favorites', JSON.stringify(favorites));
  };

  // Toggle bookmark
  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    const bookmarks = JSON.parse(localStorage.getItem('movie_bookmarks') || '[]');
    if (!isBookmarked) {
      bookmarks.push(movie.id);
    } else {
      const index = bookmarks.indexOf(movie.id);
      if (index > -1) bookmarks.splice(index, 1);
    }
    localStorage.setItem('movie_bookmarks', JSON.stringify(bookmarks));
  };

  // Check initial favorite/bookmark status
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('movie_favorites') || '[]');
    const bookmarks = JSON.parse(localStorage.getItem('movie_bookmarks') || '[]');
    setIsFavorite(favorites.includes(movie.id));
    setIsBookmarked(bookmarks.includes(movie.id));
  }, [movie.id]);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-red-900/30 border border-gray-800 hover:border-red-500/50 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWatchNow}
    >
      {/* Movie Poster Image */}
      <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
        <img
          src={movie.poster || movie.poster_path || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop"}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-wrap gap-2">
            {/* Type Badge */}
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${movie.type === 'series' ? 'bg-purple-600' : 'bg-red-600'}`}>
              {movie.type === 'series' ? (
                <span className="flex items-center gap-1">
                  <FaTv className="text-xs" /> Series
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <FaFilm className="text-xs" /> Movie
                </span>
              )}
            </span>

            {/* Video Source Badge (only if has stream) */}
            {hasStream && videoType !== 'unknown' && (
              <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${platformInfo.color}`}>
                {platformInfo.icon}
                {videoType === 'youtube' ? 'YT' :
                  videoType === 'vimeo' ? 'VM' :
                    videoType === 'dailymotion' ? 'DM' :
                      videoType === 'twitch' ? 'TW' :
                        videoType === 'facebook' ? 'FB' :
                          videoType === 'file' ? 'VID' : 'EXT'}
              </span>
            )}

            {/* Rating Badge */}
            {rating && rating !== 'N/A' && (
              <span className="px-2 py-1 rounded-lg bg-yellow-600 text-xs font-bold flex items-center gap-1">
                <FaStar className="text-xs" /> {rating}
              </span>
            )}

            {/* Download Available Badge */}
            {hasDownload && (
              <span className="px-2 py-1 rounded-lg bg-green-600 text-xs font-bold flex items-center gap-1">
                <FaDownload className="text-xs" /> Download
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${isFavorite ? 'bg-red-500/20 text-red-400' : 'bg-black/30 text-white hover:bg-red-500/20 hover:text-red-400'}`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FaHeart className={`text-sm ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
            </button>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${isBookmarked ? 'bg-blue-500/20 text-blue-400' : 'bg-black/30 text-white hover:bg-blue-500/20 hover:text-blue-400'}`}
              title={isBookmarked ? "Remove from watchlist" : "Add to watchlist"}
            >
              <FaBookmark className={`text-sm ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleWatchNow}
            disabled={!hasStream}
            className={`p-4 rounded-full transform transition-all duration-300 shadow-2xl ${hasStream
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-110 hover:shadow-red-600/70 cursor-pointer group-hover:scale-110'
              : 'bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed'}`}
            title={hasStream ? `Watch on ${videoType === 'youtube' ? 'YouTube' : videoType}` : "No Stream Link Available"}
          >
            <FaPlay className="text-white text-2xl ml-1" />
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{movie.title}</h3>

          {/* Metadata Row 1 */}
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
            <span className="flex items-center gap-1">
              <FaCalendarAlt /> {movieYear}
            </span>
            <span className="text-gray-500">•</span>
            <span className="flex items-center gap-1">
              <FaClock /> {duration}
            </span>
            {/* Show download indicator */}
            {hasDownload && (
              <>
                <span className="text-gray-500">•</span>
                <span className="flex items-center gap-1 text-green-400">
                  <FaDownload className="text-xs" /> DL
                </span>
              </>
            )}
          </div>

          {/* Metadata Row 2 - Category */}
          <p className="text-sm text-gray-400 line-clamp-1">{categoryDisplay}</p>

          {/* Video Source Info */}
          {hasStream && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs ${platformInfo.textColor} bg-black/50 flex items-center gap-1`}>
                {platformInfo.icon}
                <span className="capitalize">
                  {videoType === 'youtube' ? 'YouTube' :
                    videoType === 'vimeo' ? 'Vimeo' :
                      videoType === 'dailymotion' ? 'Dailymotion' :
                        videoType === 'twitch' ? 'Twitch' :
                          videoType === 'facebook' ? 'Facebook' :
                            videoType === 'file' ? 'Direct Video' : 'External'}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Info Section (Shows on hover) */}
      <div className={`p-4 transition-all duration-500 overflow-hidden ${isHovered ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
        {/* Description */}
        {(movie.description || movie.overview) && (
          <p className="text-sm text-gray-300 mb-4 line-clamp-3">
            {movie.description || movie.overview}
          </p>
        )}

        {/* Additional Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Nation */}
          {movie.nation && (
            <div className="flex items-center gap-2 p-2 bg-blue-900/20 rounded-lg">
              <FaGlobe className="text-blue-400" />
              <div>
                <div className="text-xs text-gray-400">Country</div>
                <div className="text-sm font-medium text-blue-300">{movie.nation}</div>
              </div>
            </div>
          )}

          {/* Translator */}
          {movie.translator && (
            <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded-lg">
              <FaLanguage className="text-green-400" />
              <div>
                <div className="text-xs text-gray-400">Translator</div>
                <div className="text-sm font-medium text-green-300">{movie.translator}</div>
              </div>
            </div>
          )}

          {/* Director */}
          {movie.director && (
            <div className="flex items-center gap-2 p-2 bg-purple-900/20 rounded-lg">
              <FaFilm className="text-purple-400" />
              <div>
                <div className="text-xs text-gray-400">Director</div>
                <div className="text-sm font-medium text-purple-300">{movie.director}</div>
              </div>
            </div>
          )}

          {/* Cast */}
          {movie.cast && (
            <div className="flex items-center gap-2 p-2 bg-orange-900/20 rounded-lg">
              <FaInfoCircle className="text-orange-400" />
              <div>
                <div className="text-xs text-gray-400">Cast</div>
                <div className="text-sm font-medium text-orange-300 line-clamp-1">
                  {Array.isArray(movie.cast) ? movie.cast.slice(0, 2).join(', ') : movie.cast}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Watch Now Button */}
          <button
            onClick={handleWatchNow}
            disabled={!hasStream}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${hasStream
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-lg hover:shadow-red-600/30 cursor-pointer'
              : 'bg-gray-800 text-gray-400 cursor-not-allowed'}`}
          >
            <FaPlay />
            {hasStream ? "Watch Now" : "No Link"}
          </button>

          {/* External Link Button (for YouTube/other platforms) */}
          {hasStream && videoType !== 'file' && (
            <button
              onClick={handleOpenInNewTab}
              className={`p-2 rounded-lg transition-all duration-300 ${platformInfo.color} hover:opacity-90 text-white flex items-center justify-center`}
              title={`Open in ${videoType === 'youtube' ? 'YouTube' : videoType}`}
            >
              <FaExternalLinkAlt className="text-sm" />
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const shareData = {
                title: movie.title,
                text: `Watch "${movie.title}" on our streaming platform!`,
                url: window.location.origin + `/watch/${movie.type || 'movie'}/${movie.id}`,
              };

              if (navigator.share && navigator.canShare(shareData)) {
                navigator.share(shareData);
              } else {
                navigator.clipboard.writeText(shareData.url);
                alert("Link copied to clipboard!");
              }
            }}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Share"
          >
            <FaShare className="text-gray-300" />
          </button>

          {/* Download Button */}
          {hasDownload && (
            <button
              onClick={handleDownload}
              disabled={!hasDownload}
              className={`p-2 rounded-lg transition-all duration-300 ${hasDownload
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-lg hover:shadow-green-600/30 cursor-pointer'
                : 'bg-gray-800 text-gray-400 cursor-not-allowed'}`}
              title={hasDownload ? "Download Movie" : "No download available"}
            >
              <FaDownload className="text-sm" />
            </button>
          )}
        </div>

        {/* Video Source Info */}
        {hasStream && (
          <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${platformInfo.color}`}>
                  {platformInfo.icon}
                </div>
                <div>
                  <div className="text-xs text-gray-400">Video Source</div>
                  <div className={`text-sm font-medium ${platformInfo.textColor}`}>
                    {videoType === 'youtube' ? 'YouTube Video' :
                      videoType === 'vimeo' ? 'Vimeo Video' :
                        videoType === 'dailymotion' ? 'Dailymotion Video' :
                          videoType === 'twitch' ? 'Twitch Stream' :
                            videoType === 'facebook' ? 'Facebook Video' :
                              videoType === 'file' ? 'Direct Video File' : 'External Video'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleOpenInNewTab}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <FaExternalLinkAlt /> Open
              </button>
            </div>
          </div>
        )}

        {/* Download Info */}
        {hasDownload && (
          <div className="mt-4 p-3 bg-green-900/10 border border-green-800/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-300 text-sm">
              <FaDownload className="text-xs" />
              <span>Click download button to save movie</span>
            </div>
          </div>
        )}

        {/* No Stream Warning */}
        {!hasStream && (
          <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-800/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-300 text-sm">
              <FaInfoCircle className="text-xs" />
              <span>Streaming not available for this content</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Info Footer (Always visible) */}
      <div className="p-3 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Type Icon */}
            <div className={`p-2 rounded-lg ${movie.type === 'series' ? 'bg-purple-600/20' : 'bg-red-600/20'}`}>
              {movie.type === 'series' ? (
                <FaTv className="text-sm text-purple-400" />
              ) : (
                <FaFilm className="text-sm text-red-400" />
              )}
            </div>

            {/* Rating */}
            <div className="text-left">
              <div className="text-xs text-gray-400">Rating</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                <FaStar className="text-yellow-500 text-xs" />
                {rating}
              </div>
            </div>

            {/* Download Indicator */}
            {hasDownload && (
              <div className="text-left">
                <div className="text-xs text-gray-400">Download</div>
                <div className="text-sm font-bold text-green-400 flex items-center gap-1">
                  <FaDownload className="text-xs" />
                  Ready
                </div>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="text-right">
            <div className="text-xs text-gray-400">
              {movie.type === 'series' ? 'Seasons' : 'Category'}
            </div>
            <div className="text-sm font-medium text-gray-300 line-clamp-1 max-w-[120px]">
              {movie.seasons || movie.category?.split(',')[0]?.trim() || movie.genre?.split(',')[0]?.trim() || 'General'}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-purple-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

      {/* Status Indicators */}
      {movie.status && (
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-bold rounded-lg ${movie.status === 'new' ? 'bg-green-600' : movie.status === 'popular' ? 'bg-orange-600' : 'bg-blue-600'}`}>
            {movie.status.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}