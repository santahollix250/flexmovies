import { FaPlay, FaStar, FaLanguage, FaTv, FaHeart, FaRegHeart, FaCalendarAlt, FaClock } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie }) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Get stream URL from admin form fields
  const streamUrl = movie?.streamLink || movie?.videoUrl || movie?.video_url || null;
  const safeStreamUrl = streamUrl?.startsWith('http') ? streamUrl : streamUrl ? `https://${streamUrl}` : null;
  const rating = movie?.rating || (movie?.vote_average ? movie.vote_average.toFixed(1) : null);
  const translator = movie?.translator || '';
  const year = movie?.year || movie?.release_date?.split('-')[0] || '';

  // Format uploaded time
  const formatUploadedTime = (dateString) => {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));

      if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)}w ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (e) {
      return null;
    }
  };

  const uploadedTime = formatUploadedTime(movie?.created_at || movie?.uploaded_at || movie?.timestamp);

  // Handle Watch Now
  const handleWatchNow = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!safeStreamUrl) {
      alert("⚠️ Stream not available");
      return;
    }

    const movieId = movie?.id || movie?._id || Date.now().toString();

    navigate(`/player/${movieId}`, {
      state: {
        movie: {
          id: movieId,
          title: movie?.title || 'Untitled',
          videoUrl: safeStreamUrl,
          poster: movie?.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
          translator: translator,
          ...movie
        }
      }
    });
  };

  // Toggle like
  const toggleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  // Fallback image
  const posterUrl = imageError
    ? "https://via.placeholder.com/300x450?text=No+Poster"
    : (movie?.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop");

  return (
    <div
      className="group relative rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 overflow-hidden cursor-pointer w-[110px] xs:w-[120px] sm:w-[150px] md:w-[170px] lg:w-[190px] xl:w-[210px] transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl hover:shadow-red-900/10 sm:hover:shadow-red-900/20 hover:border-red-500/30 sm:hover:border-red-500/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWatchNow}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {/* Movie Poster */}
        <img
          src={posterUrl}
          alt={movie?.title}
          className="w-full h-full object-cover transition-transform duration-500 sm:duration-700 group-hover:scale-105 sm:group-hover:scale-110"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 sm:from-black/80 via-transparent to-transparent pointer-events-none"></div>

        {/* Top Badges - Responsive sizing */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 right-1 sm:right-2 flex flex-wrap gap-0.5 sm:gap-1 z-10">
          {/* Translator Badge */}
          {translator && (
            <div className="px-1 sm:px-2 py-0.5 sm:py-1 bg-green-600/90 rounded-full text-[7px] xs:text-[8px] sm:text-[10px] text-white font-medium flex items-center gap-0.5 sm:gap-1 shadow-md sm:shadow-lg">
              <FaLanguage className="text-[6px] xs:text-[7px] sm:text-[10px]" />
              <span className="max-w-[35px] xs:max-w-[40px] sm:max-w-[50px] truncate">{translator}</span>
            </div>
          )}

          {/* Rating Badge */}
          {rating && (
            <div className="px-1 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full text-[7px] xs:text-[8px] sm:text-[10px] text-white font-medium flex items-center gap-0.5 sm:gap-1 shadow-md sm:shadow-lg">
              <FaStar className="text-[6px] xs:text-[7px] sm:text-[10px]" />
              <span>{rating}</span>
            </div>
          )}

          {/* Type Badge */}
          <div className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-[7px] xs:text-[8px] sm:text-[10px] text-white font-medium flex items-center gap-0.5 sm:gap-1 shadow-md sm:shadow-lg ${movie?.type === 'series' ? 'bg-purple-600' : 'bg-red-600'
            }`}>
            {movie?.type === 'series' ? <FaTv className="text-[6px] xs:text-[7px] sm:text-[10px]" /> : <FaPlay className="text-[6px] xs:text-[7px] sm:text-[10px]" />}
            <span className="hidden xs:inline">{movie?.type === 'series' ? 'Series' : 'Movie'}</span>
          </div>
        </div>

        {/* Year Badge */}
        {year && (
          <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 px-1 sm:px-2 py-0.5 sm:py-1 bg-black/70 rounded-full text-[7px] xs:text-[8px] sm:text-[10px] text-white flex items-center gap-0.5 sm:gap-1 z-10">
            <FaCalendarAlt className="text-[6px] xs:text-[7px] sm:text-[10px] text-gray-400" />
            <span>{year}</span>
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={toggleLike}
          className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 bg-black/70 rounded-full flex items-center justify-center border border-gray-700 hover:border-red-500 transition-all duration-300 z-10"
        >
          {liked ? (
            <FaHeart className="text-red-500 text-[10px] xs:text-xs sm:text-sm" />
          ) : (
            <FaRegHeart className="text-white text-[10px] xs:text-xs sm:text-sm hover:text-red-400 transition-colors" />
          )}
        </button>

        {/* Play Overlay on Hover */}
        {isHovered && safeStreamUrl && (
          <div className="absolute inset-0 bg-black/50 sm:bg-black/60 flex items-center justify-center z-20 backdrop-blur-[1px] sm:backdrop-blur-none">
            <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md sm:shadow-lg transform hover:scale-105 sm:hover:scale-110 transition-transform">
              <FaPlay className="text-white text-[10px] xs:text-xs sm:text-sm ml-0.5" />
            </div>
          </div>
        )}

        {/* Unavailable Overlay */}
        {isHovered && !safeStreamUrl && (
          <div className="absolute inset-0 bg-black/70 sm:bg-black/80 flex items-center justify-center z-20">
            <div className="text-center">
              <span className="text-white text-[8px] xs:text-[9px] sm:text-xs font-medium bg-yellow-600/80 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 sm:py-1.5 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Title Section - With category AND uploaded time */}
      <div className="p-1.5 xs:p-2 sm:p-3">
        <h3 className="text-white text-[10px] xs:text-xs sm:text-sm font-semibold line-clamp-1 text-center group-hover:text-red-400 transition-colors duration-300">
          {movie?.title || 'Untitled'}
        </h3>

        {/* Category and Upload Time Row */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5 xs:mt-1">
          {movie?.category && (
            <p className="text-[7px] xs:text-[8px] sm:text-[10px] text-gray-400 line-clamp-1">
              {movie.category.split(',')[0].trim()}
            </p>
          )}

          {/* Uploaded time next to category */}
          {uploadedTime && (
            <>
              {movie?.category && <span className="text-[7px] xs:text-[8px] sm:text-[10px] text-gray-600">•</span>}
              <div className="flex items-center gap-0.5 text-[7px] xs:text-[8px] sm:text-[10px] text-purple-400">
                <FaClock className="text-[6px] xs:text-[7px] sm:text-[8px]" />
                <span>{uploadedTime}</span>
              </div>
            </>
          )}
        </div>

        {/* If no category, show just upload time centered */}
        {!movie?.category && uploadedTime && (
          <div className="flex items-center justify-center gap-0.5 mt-0.5 xs:mt-1 text-[7px] xs:text-[8px] sm:text-[10px] text-purple-400">
            <FaClock className="text-[6px] xs:text-[7px] sm:text-[8px]" />
            <span>{uploadedTime}</span>
          </div>
        )}
      </div>

      {/* Touch-friendly hover effect for mobile */}
      <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500/0 via-red-500/0 to-red-500/0 group-active:from-red-500/10 group-active:via-red-500/5 group-active:to-red-500/10 sm:group-hover:from-red-500/5 sm:group-hover:via-red-500/10 sm:group-hover:to-red-500/5 opacity-0 group-active:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}