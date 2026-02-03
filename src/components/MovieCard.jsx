import { FaPlay, FaStar, FaGlobe, FaLanguage, FaClock, FaEye, FaTv } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  // Get stream URL from admin form fields
  const streamUrl = movie?.streamLink || movie?.videoUrl || movie?.video_url || null;

  // Safe stream URL
  const safeStreamUrl = streamUrl?.startsWith('http')
    ? streamUrl
    : streamUrl
      ? `https://${streamUrl}`
      : null;

  // Movie year from admin form
  const movieYear = movie?.year || movie?.release_date?.split('-')[0] || '';

  // Rating from admin form
  const rating = movie?.rating || (movie?.vote_average ? movie.vote_average.toFixed(1) : 'N/A');

  // Duration from admin form
  const duration = movie?.duration || movie?.runtime || '';

  // Handle Watch Now
  const handleWatchNow = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isNavigating) return;

    if (!safeStreamUrl) {
      alert("⚠️ Stream link not available for this movie.");
      return;
    }

    setIsNavigating(true);

    // Prepare movie data from admin form
    const movieDataForPlayer = {
      id: movie?.id || movie?._id || Date.now().toString(),
      title: movie?.title || 'Untitled Movie',
      videoUrl: safeStreamUrl,
      poster: movie?.poster || movie?.poster_path || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
      description: movie?.description || movie?.overview || 'No description available',
      year: movieYear,
      rating: rating,
      duration: duration,
      category: movie?.category || movie?.genres || '',
      nation: movie?.nation || movie?.country || '',
      translator: movie?.translator || '',
      type: movie?.type || 'movie',
      // Keep all original admin form data
      ...movie
    };

    navigate('/player', {
      state: {
        movie: movieDataForPlayer,
        autoPlay: true
      }
    });
  };

  // Handle card click
  const handleCardClick = (e) => {
    handleWatchNow(e);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-red-900/20 border border-gray-800/50 hover:border-red-500/40 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Movie Poster */}
      <div className="relative h-72 overflow-hidden">
        {/* Image */}
        <img
          src={movie?.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop"}
          alt={movie?.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop";
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          {/* Type Badge */}
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${movie?.type === 'series' ? 'bg-purple-600/90' : 'bg-red-600/90'} backdrop-blur-sm shadow-lg flex items-center gap-1.5`}>
            {movie?.type === 'series' ? <FaTv className="text-xs" /> : <FaPlay className="text-xs" />}
            {movie?.type === 'series' ? 'SERIES' : 'MOVIE'}
          </span>

          {/* Rating Badge */}
          {rating && rating !== 'N/A' && (
            <span className="px-3 py-1.5 rounded-full bg-yellow-600/90 text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
              <FaStar className="text-xs" /> {rating}
            </span>
          )}
        </div>

        {/* Duration Badge */}
        {duration && (
          <div className="absolute top-16 left-4 px-3 py-1.5 bg-black/70 rounded-full text-xs text-white flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
            <FaClock className="text-xs" /> {duration}
          </div>
        )}

        {/* Play Button Overlay */}
        {isHovered && safeStreamUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40 flex items-center justify-center transition-all duration-300 z-20">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-red-600/30 rounded-full scale-125"></div>
              <div className="relative p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-2xl shadow-red-900/50 hover:shadow-red-900/70 transition-all duration-300 hover:scale-110 group/play">
                <div className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-pulse"></div>
                <FaPlay className="text-white text-2xl ml-1 transition-transform group-hover/play:scale-110" />
              </div>
            </div>
          </div>
        )}

        {/* No Stream Warning */}
        {isHovered && !safeStreamUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 z-20">
            <div className="text-center p-6">
              <div className="p-4 bg-gradient-to-br from-gray-900 to-black rounded-full mb-4 mx-auto w-20 h-20 flex items-center justify-center border border-gray-700/50">
                <div className="w-12 h-12 rounded-full bg-yellow-600/20 flex items-center justify-center border border-yellow-600/30">
                  <div className="w-2 h-8 bg-yellow-500 rounded-full mr-1"></div>
                  <div className="w-2 h-8 bg-yellow-500 rounded-full ml-1"></div>
                </div>
              </div>
              <p className="text-white font-semibold text-lg mb-2">Stream Unavailable</p>
              <p className="text-gray-300 text-sm">Coming Soon</p>
            </div>
          </div>
        )}

        {/* Bottom Info Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Country Badge */}
            {movie?.nation && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 rounded-full text-xs text-white backdrop-blur-sm shadow-lg">
                <FaGlobe className="text-xs" /> {movie.nation}
              </div>
            )}

            {/* Translator Badge */}
            {movie?.translator && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/90 rounded-full text-xs text-white backdrop-blur-sm shadow-lg">
                <FaLanguage className="text-xs" /> {movie.translator}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-5 bg-gradient-to-b from-gray-900/80 to-gray-950">
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-red-400 transition-colors duration-300">
          {movie?.title || 'Untitled'}
        </h3>

        {/* Year and Category */}
        <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
          {movieYear && (
            <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs border border-gray-700/50">
              {movieYear}
            </span>
          )}
          {movie?.category && (
            <div className="flex-1 min-w-0">
              <span className="text-gray-300 text-sm line-clamp-1 truncate">
                {movie.category.split(',').map(genre => genre.trim()).slice(0, 2).join(' • ')}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/50 group-hover:border-red-500/30 transition-all duration-300">
          {safeStreamUrl ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleWatchNow(e);
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white text-sm font-semibold shadow-lg hover:shadow-red-900/30 transition-all duration-300 group-hover:scale-[1.02] active:scale-95 relative overflow-hidden"
              title="Watch Now"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

              <FaPlay className="relative z-10 transition-transform duration-300 group-hover:scale-125" />
              <span className="relative z-10">Watch Now</span>
            </button>
          ) : (
            <div className="w-full px-4 py-3.5 text-center cursor-not-allowed">
              <div className="flex items-center justify-center gap-2.5 text-gray-400 text-sm">
                <div className="w-2 h-8 bg-gray-600 rounded-full animate-pulse"></div>
                <span>Not Available</span>
                <div className="w-2 h-8 bg-gray-600 rounded-full animate-pulse animation-delay-300"></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white transition-colors duration-300">
            <FaEye className="text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
            <span>Click to Watch</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs ${movie?.type === 'series' ? 'bg-purple-600/20 text-purple-300' : 'bg-red-600/20 text-red-300'} border ${movie?.type === 'series' ? 'border-purple-600/30' : 'border-red-600/30'}`}>
              {movie?.type === 'series' ? 'Series' : 'Movie'}
            </span>

            {rating && rating !== 'N/A' && (
              <div className="flex items-center gap-1.5 text-gray-300">
                <FaStar className="text-yellow-500/80" />
                <span>{rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Loading Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 to-gray-950/95 flex items-center justify-center z-50 rounded-2xl backdrop-blur-sm">
          <div className="text-center p-6">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-full h-full border-4 border-red-600/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-medium mt-4 text-lg">Opening Player</p>
            <p className="text-gray-400 text-sm mt-2 animate-pulse max-w-[200px] truncate">{movie?.title}</p>
          </div>
        </div>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/0 via-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:via-red-500/10 group-hover:to-red-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/30 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/30 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}