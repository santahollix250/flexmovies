import { FaPlay, FaStar, FaGlobe, FaDownload, FaLanguage, FaExclamationTriangle, FaBug } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Get stream URL
  const streamUrl = movie.streamLink || movie.videoUrl || null;

  // Safe stream URL
  const safeStreamUrl = streamUrl?.startsWith('http')
    ? streamUrl
    : streamUrl
      ? `https://${streamUrl}`
      : null;

  // Get download link - Updated to match your database field name
  const getDownloadUrl = () => {
    console.log("🎬 MovieCard - Checking download link for:", movie.title);

    // Check fields in order of priority
    const possibleFields = [
      'download_link',  // Your database field from Admin form
      'downloadLink',   // Alternative camelCase
      'downloadlink',   // Alternative lowercase
      'downloadUrl',
      'download_url',
      'downloadurl'
    ];

    for (const field of possibleFields) {
      const value = movie[field];

      if (value && typeof value === 'string' && value.trim() !== '') {
        console.log(`✅ Found download in field "${field}":`, value);

        // Ensure URL has proper protocol
        if (value.startsWith('http://') || value.startsWith('https://')) {
          return value;
        } else if (value.includes('://')) {
          return value;
        } else {
          // Add https:// if no protocol
          return `https://${value}`;
        }
      }
    }

    console.log('❌ No download link found for:', movie.title);
    console.log('📊 Available fields:', Object.keys(movie));
    console.log('🔍 Checking specific field "download_link":', movie.download_link);

    return null;
  };

  const safeDownloadUrl = getDownloadUrl();

  // Year
  const movieYear = movie.year || movie.release_date?.split('-')[0] || '';

  // Rating
  const rating = movie.rating || (movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A');

  // Handle Watch Now
  const handleWatchNow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (safeStreamUrl) {
      // Pass ALL movie data to player
      const movieDataForPlayer = {
        ...movie,
        videoUrl: safeStreamUrl,
        downloadLink: safeDownloadUrl || '', // Pass download link to player
        streamLink: safeStreamUrl
      };

      console.log("🚀 Navigating to player with data:", {
        title: movieDataForPlayer.title,
        hasDownload: !!safeDownloadUrl,
        downloadLink: safeDownloadUrl
      });

      navigate('/player', {
        state: {
          movie: movieDataForPlayer
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
      console.log("⬇️ Downloading from:", safeDownloadUrl);
      window.open(safeDownloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert("Download link not available for this movie.");
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-black transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border border-gray-800 hover:border-red-500/50 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWatchNow}
    >
      {/* Movie Poster Image */}
      <div className="relative h-64 md:h-72 overflow-hidden">
        <img
          src={movie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop"}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Type Badge */}
          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${movie.type === 'series' ? 'bg-purple-600' : 'bg-red-600'}`}>
            {movie.type === 'series' ? 'SERIES' : 'MOVIE'}
          </span>

          {/* Rating Badge */}
          {rating && rating !== 'N/A' && (
            <span className="px-2 py-1 rounded-lg bg-yellow-600/90 text-xs font-bold flex items-center gap-1">
              <FaStar className="text-xs" /> {rating}
            </span>
          )}
        </div>

        {/* Play Button Overlay - Only on hover */}
        {isHovered && safeStreamUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
            <button
              onClick={handleWatchNow}
              className="p-5 bg-gradient-to-r from-red-600 to-red-700 rounded-full transform scale-110 shadow-2xl shadow-red-900/70 hover:scale-125 transition-transform duration-300"
              title="Watch Now"
            >
              <FaPlay className="text-white text-2xl ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Info Bar - REMOVED THE DOWNLOAD BADGE FROM HERE */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-3">
            {/* Country Badge */}
            {movie.nation && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/90 rounded-lg text-xs text-white">
                <FaGlobe className="text-xs" /> {movie.nation}
              </div>
            )}

            {/* Translator Badge */}
            {movie.translator && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-600/90 rounded-lg text-xs text-white">
                <FaLanguage className="text-xs" /> {movie.translator}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-3">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{movie.title}</h3>

        {/* Year and Category */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          {movieYear && <span>{movieYear}</span>}
          {movie.category && (
            <>
              <span>•</span>
              <span className="line-clamp-1">{movie.category.split(',')[0]}</span>
            </>
          )}
        </div>

        {/* Download Button - Only shows at the bottom */}
        {safeDownloadUrl ? (
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white text-sm font-semibold shadow-lg hover:shadow-green-900/50 transition-all hover:scale-[1.02]"
            title="Download Movie"
          >
            <FaDownload />
            <span>Download</span>
          </button>
        ) : (
          <div className="w-full px-4 py-2 bg-gray-800/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <FaExclamationTriangle className="text-yellow-500" />
              <span>No download available</span>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-600 mt-1">
                Check console for debug info
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}