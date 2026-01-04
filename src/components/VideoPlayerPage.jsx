// components/MovieCard.jsx - SIMPLIFIED WORKING VERSION
import { FaPlay, FaStar, FaCalendarAlt, FaClock, FaHeart, FaBookmark } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function MovieCard({ movie, onPlay }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Get movie data
    const title = movie.title;
    const year = movie.year || movie.release_date?.split("-")[0] || "2024";
    const rating = movie.rating || (movie.vote_average ? movie.vote_average.toFixed(1) : "N/A");
    const duration = movie.duration || "2h";
    const type = movie.type || "movie";
    const poster = movie.poster || movie.poster_path || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop";

    const handlePlayClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onPlay) {
            onPlay();
        }
    };

    return (
        <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Poster */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900">
                <img
                    src={poster}
                    alt={title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Play Button */}
                    <button
                        onClick={handlePlayClick}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all"
                    >
                        <FaPlay className="text-white text-xl ml-1" />
                    </button>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${type === 'series' ? 'bg-purple-600' : 'bg-red-600'}`}>
                            {type === 'series' ? 'SERIES' : 'MOVIE'}
                        </span>
                        <span className="px-2 py-1 bg-yellow-600 text-xs rounded flex items-center gap-1">
                            <FaStar className="text-xs" /> {rating}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="font-semibold text-white mb-1 line-clamp-1">{title}</h3>
                <div className="flex items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1 mr-3">
                        <FaCalendarAlt /> {year}
                    </span>
                    <span className="flex items-center gap-1">
                        <FaClock /> {duration}
                    </span>
                </div>
            </div>

            {/* Quick Actions on Hover */}
            {isHovered && (
                <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 p-2">
                    <button
                        onClick={handlePlayClick}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm text-white"
                    >
                        Play Now
                    </button>
                </div>
            )}
        </div>
    );
}