import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand,
    FaCompress, FaTimes, FaDownload, FaExternalLinkAlt,
    FaStepBackward, FaStepForward, FaRedo, FaHome,
    FaYoutube, FaVideo, FaFilm, FaTv, FaStar,
    FaCalendarAlt, FaClock, FaGlobe, FaLanguage,
    FaChevronLeft, FaList, FaCog, FaCheck, FaSpinner,
    FaInfoCircle, FaShare, FaHeart, FaBookmark
} from "react-icons/fa";

export default function PlayerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeout = useRef(null);

    const movie = location.state?.movie;

    // Debug: Check what movie data we're receiving
    console.log("🎬 PlayerPage - Received movie data:", {
        title: movie?.title,
        videoUrl: movie?.videoUrl,
        downloadLink: movie?.downloadLink,
        download_link: movie?.download_link,
        allFields: movie ? Object.keys(movie) : []
    });

    // Player states
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Detect video type with detailed detection
    const detectVideoType = (url) => {
        if (!url) return { type: 'unknown', platform: 'Unknown', icon: FaVideo, color: 'gray' };

        const urlStr = url.toLowerCase();

        // YouTube
        if (urlStr.includes('youtube.com') || urlStr.includes('youtu.be')) {
            const isShort = urlStr.includes('youtu.be');
            const isEmbed = urlStr.includes('/embed/');
            return {
                type: 'youtube',
                platform: 'YouTube',
                icon: FaYoutube,
                color: 'red',
                isEmbed,
                isShort
            };
        }
        // Vimeo
        else if (urlStr.includes('vimeo.com')) {
            const isEmbed = urlStr.includes('/video/');
            return {
                type: 'vimeo',
                platform: 'Vimeo',
                icon: FaVideo,
                color: 'blue',
                isEmbed
            };
        }
        // Dailymotion
        else if (urlStr.includes('dailymotion.com')) {
            return {
                type: 'dailymotion',
                platform: 'Dailymotion',
                icon: FaVideo,
                color: 'blue'
            };
        }
        // HLS Stream
        else if (urlStr.includes('.m3u8')) {
            return {
                type: 'hls',
                platform: 'HLS Stream',
                icon: FaVideo,
                color: 'purple'
            };
        }
        // DASH Stream
        else if (urlStr.includes('.mpd')) {
            return {
                type: 'dash',
                platform: 'DASH Stream',
                icon: FaVideo,
                color: 'purple'
            };
        }
        // Direct video files
        else if (urlStr.match(/\.(mp4|webm|mkv|avi|mov|flv|wmv|3gp|ogg)$/)) {
            return {
                type: 'direct',
                platform: 'Direct Video',
                icon: FaVideo,
                color: 'green'
            };
        }
        // Embed link
        else if (urlStr.includes('/embed/')) {
            return {
                type: 'embed',
                platform: 'Embedded Video',
                icon: FaVideo,
                color: 'blue'
            };
        }
        // External stream
        else {
            return {
                type: 'external',
                platform: 'External Stream',
                icon: FaExternalLinkAlt,
                color: 'orange'
            };
        }
    };

    const videoInfo = detectVideoType(movie?.videoUrl);

    // FIXED: Check for both downloadLink and download_link fields
    const hasDownload = !!(movie?.downloadLink || movie?.download_link);
    const PlatformIcon = videoInfo.icon;

    // Extract YouTube ID with better regex
    const getYouTubeId = (url) => {
        if (!url) return null;

        // Handle various YouTube URL formats
        const patterns = [
            /youtube\.com\/embed\/([^?&#]+)/,
            /youtube\.com\/watch\?v=([^&]+)/,
            /youtu\.be\/([^?]+)/,
            /youtube\.com\/v\/([^?]+)/,
            /youtube\.com\/.*[?&]v=([^&]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    };

    const youtubeId = getYouTubeId(movie?.videoUrl);

    // Generate YouTube embed URL with enhanced parameters
    const getYouTubeEmbedUrl = () => {
        if (!youtubeId) return null;

        const params = new URLSearchParams({
            autoplay: '1',
            rel: '0',
            modestbranding: '1',
            playsinline: '1',
            showinfo: '0',
            controls: '1',
            fs: '1',
            enablejsapi: '1',
            origin: window.location.origin,
            mute: isMuted ? '1' : '0',
            loop: '0',
            iv_load_policy: '3',
            disablekb: '0',
            cc_load_policy: '0',
            color: 'red',
            theme: 'dark'
        });

        return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
    };

    // Get appropriate video source
    const getVideoSource = () => {
        if (!movie?.videoUrl) return null;

        switch (videoInfo.type) {
            case 'youtube':
                return getYouTubeEmbedUrl();
            case 'vimeo':
                const vimeoId = movie.videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
                return vimeoId ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&color=00adef` : null;
            case 'dailymotion':
                const dmId = movie.videoUrl.match(/dailymotion\.com\/(?:video|embed\/video)\/([^_]+)/)?.[1];
                return dmId ? `https://www.dailymotion.com/embed/video/${dmId}?autoplay=1&queue-autoplay-next=0&queue-enable=0&sharing-enable=0&ui-logo=0` : null;
            default:
                return movie.videoUrl;
        }
    };

    const videoSource = getVideoSource();

    // Control visibility timeout
    const resetControlsTimeout = () => {
        setShowControls(true);
        clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    // Player controls
    const togglePlay = () => {
        if (videoInfo.type === 'youtube') {
            // YouTube iframe API would be needed here
            setIsPlaying(!isPlaying);
        } else if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
        resetControlsTimeout();
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
        }
    };

    const handleTimeChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    const toggleFullscreen = () => {
        const element = containerRef.current;

        if (!isFullscreen) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const skipBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
    };

    const skipForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
        }
    };

    const changePlaybackRate = (rate) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    // FIXED: Handle download from either downloadLink or download_link
    const handleDownload = () => {
        const downloadUrl = movie?.downloadLink || movie?.download_link;
        if (downloadUrl) {
            console.log("⬇️ Downloading from:", downloadUrl);
            window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        } else {
            alert("No download link available for this movie.");
        }
    };

    const handleExternalOpen = () => {
        if (movie?.videoUrl) {
            window.open(movie.videoUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // Save to localStorage
        const favorites = JSON.parse(localStorage.getItem('movie_favorites') || '[]');
        if (!isFavorite) {
            favorites.push(movie?.id);
        } else {
            const index = favorites.indexOf(movie?.id);
            if (index > -1) favorites.splice(index, 1);
        }
        localStorage.setItem('movie_favorites', JSON.stringify(favorites));
    };

    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        // Save to localStorage
        const bookmarks = JSON.parse(localStorage.getItem('movie_bookmarks') || '[]');
        if (!isBookmarked) {
            bookmarks.push(movie?.id);
        } else {
            const index = bookmarks.indexOf(movie?.id);
            if (index > -1) bookmarks.splice(index, 1);
        }
        localStorage.setItem('movie_bookmarks', JSON.stringify(bookmarks));
    };

    const shareMovie = () => {
        const shareData = {
            title: `Watch "${movie?.title}" on FlexMovies`,
            text: `Watch "${movie?.title}" (${movie?.year}) - Rating: ${movie?.rating || 'N/A'}`,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare(shareData)) {
            navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(shareData.url);
            alert('Link copied to clipboard!');
        }
    };

    // Initialize
    useEffect(() => {
        // Check favorite/bookmark status
        const favorites = JSON.parse(localStorage.getItem('movie_favorites') || '[]');
        const bookmarks = JSON.parse(localStorage.getItem('movie_bookmarks') || '[]');
        setIsFavorite(favorites.includes(movie?.id));
        setIsBookmarked(bookmarks.includes(movie?.id));

        // Set controls timeout
        resetControlsTimeout();

        // Handle fullscreen change
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        // Handle mouse movement for controls
        const handleMouseMove = () => {
            resetControlsTimeout();
        };

        const handleKeyDown = (e) => {
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skipBackward();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skipForward();
                    break;
                case 'Escape':
                    if (isFullscreen) {
                        toggleFullscreen();
                    }
                    break;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            clearTimeout(controlsTimeout.current);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying]);

    // Handle loading state for non-YouTube videos
    useEffect(() => {
        if (videoRef.current && videoInfo.type !== 'youtube') {
            const video = videoRef.current;

            const handleLoaded = () => {
                setIsLoading(false);
                setDuration(video.duration);
            };

            const handleError = () => {
                setIsLoading(false);
                setVideoError(true);
            };

            const handleTimeUpdate = () => {
                setCurrentTime(video.currentTime);
            };

            video.addEventListener('loadeddata', handleLoaded);
            video.addEventListener('error', handleError);
            video.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                video.removeEventListener('loadeddata', handleLoaded);
                video.removeEventListener('error', handleError);
                video.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [videoInfo.type]);

    // If no movie data, show error
    if (!movie) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <h1 className="text-2xl font-bold text-white mb-2">No Video Selected</h1>
                    <p className="text-gray-400 mb-6">Please go back and select a movie to watch</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Main Player Container */}
            <div
                ref={containerRef}
                className={`relative bg-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
                onClick={resetControlsTimeout}
            >
                {/* Top Bar */}
                <div className={`absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between">
                        {/* Back Button & Title */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FaChevronLeft className="text-xl" />
                            </button>
                            <div>
                                <h1 className="text-lg font-bold line-clamp-1">{movie.title}</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt /> {movie.year}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaStar className="text-yellow-400" /> {movie.rating || 'N/A'}
                                    </span>
                                    {movie.duration && (
                                        <span className="flex items-center gap-1">
                                            <FaClock /> {movie.duration}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Platform Badge */}
                            <div className={`px-3 py-1.5 rounded-lg bg-${videoInfo.color}-600/20 text-${videoInfo.color}-300 flex items-center gap-2`}>
                                <PlatformIcon />
                                <span className="text-sm font-medium">{videoInfo.platform}</span>
                            </div>

                            {/* Favorite */}
                            <button
                                onClick={toggleFavorite}
                                className={`p-2.5 rounded-lg ${isFavorite ? 'bg-red-600/20 text-red-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <FaHeart className={isFavorite ? 'fill-current' : ''} />
                            </button>

                            {/* Bookmark */}
                            <button
                                onClick={toggleBookmark}
                                className={`p-2.5 rounded-lg ${isBookmarked ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                                title={isBookmarked ? "Remove from watchlist" : "Add to watchlist"}
                            >
                                <FaBookmark className={isBookmarked ? 'fill-current' : ''} />
                            </button>

                            {/* Share */}
                            <button
                                onClick={shareMovie}
                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"
                                title="Share"
                            >
                                <FaShare />
                            </button>

                            {/* Download - FIXED: Check both downloadLink and download_link */}
                            {hasDownload && (
                                <button
                                    onClick={handleDownload}
                                    className="p-2.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg flex items-center gap-2"
                                    title="Download"
                                >
                                    <FaDownload />
                                    <span className="text-sm">Download</span>
                                </button>
                            )}

                            {/* Info */}
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className={`p-2.5 rounded-lg ${showInfo ? 'bg-purple-600/20 text-purple-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                                title="Show info"
                            >
                                <FaInfoCircle />
                            </button>

                            {/* External Open */}
                            {videoInfo.type === 'youtube' && (
                                <button
                                    onClick={handleExternalOpen}
                                    className="p-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg"
                                    title="Open on YouTube"
                                >
                                    <FaExternalLinkAlt />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Video Container */}
                <div className="relative w-full h-screen">
                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                            <div className="text-center">
                                <FaSpinner className="animate-spin text-4xl text-red-500 mx-auto mb-4" />
                                <p className="text-gray-300">Loading {videoInfo.platform} player...</p>
                            </div>
                        </div>
                    )}

                    {/* Error Overlay */}
                    {videoError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                            <div className="text-center p-6 bg-gray-900/90 rounded-xl">
                                <div className="text-4xl mb-4">⚠️</div>
                                <h2 className="text-xl font-bold mb-2">Video Error</h2>
                                <p className="text-gray-300 mb-4">Failed to load video from {videoInfo.platform}</p>
                                <button
                                    onClick={handleExternalOpen}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                                >
                                    Open in {videoInfo.platform}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* YouTube Embed or Video Element */}
                    {videoInfo.type === 'youtube' && videoSource ? (
                        <div className="relative w-full h-full bg-black">
                            <iframe
                                src={videoSource}
                                className="absolute top-0 left-0 w-full h-full"
                                title={`${movie.title} - YouTube`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                onLoad={() => setIsLoading(false)}
                                onError={() => setVideoError(true)}
                            />

                            {/* YouTube Overlay Branding */}
                            <div className="absolute top-4 right-4 z-10">
                                <div className="flex items-center gap-2 px-3 py-2 bg-red-600/90 rounded-lg">
                                    <FaYoutube className="text-xl" />
                                    <span className="font-bold">YouTube</span>
                                </div>
                            </div>
                        </div>
                    ) : videoInfo.type !== 'youtube' ? (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain bg-black"
                            src={videoSource}
                            autoPlay
                            controls={false}
                            onLoadedData={() => setIsLoading(false)}
                            onError={() => setVideoError(true)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    ) : null}

                    {/* Play/Pause Overlay for non-YouTube videos */}
                    {videoInfo.type !== 'youtube' && !isLoading && !videoError && (
                        <div
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                            onClick={togglePlay}
                        >
                            <button className={`p-6 rounded-full ${isPlaying ? 'bg-black/50' : 'bg-red-600/90'} transition-all hover:scale-110`}>
                                {isPlaying ? (
                                    <FaPause className="text-3xl" />
                                ) : (
                                    <FaPlay className="text-3xl ml-1" />
                                )}
                            </button>
                        </div>
                    )}

                    {/* Bottom Controls */}
                    <div className={`absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleTimeChange}
                                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                            />
                            <div className="flex justify-between text-sm text-gray-400 mt-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Play/Pause */}
                                <button
                                    onClick={togglePlay}
                                    className="p-2.5 hover:bg-white/10 rounded-full"
                                >
                                    {isPlaying ? (
                                        <FaPause className="text-xl" />
                                    ) : (
                                        <FaPlay className="text-xl ml-0.5" />
                                    )}
                                </button>

                                {/* Skip Backward */}
                                <button
                                    onClick={skipBackward}
                                    className="p-2.5 hover:bg-white/10 rounded-full"
                                    title="Skip 10s back"
                                >
                                    <FaStepBackward />
                                </button>

                                {/* Skip Forward */}
                                <button
                                    onClick={skipForward}
                                    className="p-2.5 hover:bg-white/10 rounded-full"
                                    title="Skip 10s forward"
                                >
                                    <FaStepForward />
                                </button>

                                {/* Volume */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleMute}
                                        className="p-2 hover:bg-white/10 rounded-full"
                                    >
                                        {isMuted || volume === 0 ? (
                                            <FaVolumeMute className="text-xl" />
                                        ) : (
                                            <FaVolumeUp className="text-xl" />
                                        )}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                    />
                                </div>

                                {/* Playback Rate */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSettings(!showSettings)}
                                        className="p-2.5 hover:bg-white/10 rounded-full flex items-center gap-2"
                                    >
                                        <FaCog />
                                        <span className="text-sm">{playbackRate}x</span>
                                    </button>

                                    {showSettings && (
                                        <div className="absolute bottom-full mb-2 left-0 bg-gray-900/95 backdrop-blur-lg rounded-lg p-2 min-w-[120px] border border-gray-700">
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                                <button
                                                    key={rate}
                                                    onClick={() => {
                                                        changePlaybackRate(rate);
                                                        setShowSettings(false);
                                                    }}
                                                    className={`w-full px-3 py-2 text-left rounded hover:bg-white/10 ${playbackRate === rate ? 'text-red-400' : 'text-gray-300'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{rate}x</span>
                                                        {playbackRate === rate && <FaCheck className="text-sm" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Platform Info */}
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <PlatformIcon className={`text-${videoInfo.color}-400`} />
                                    <span>Streaming via {videoInfo.platform}</span>
                                </div>

                                {/* Fullscreen */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2.5 hover:bg-white/10 rounded-full"
                                >
                                    {isFullscreen ? (
                                        <FaCompress className="text-xl" />
                                    ) : (
                                        <FaExpand className="text-xl" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Panel */}
                    {showInfo && (
                        <div className="absolute top-20 right-4 z-30 w-80 bg-gray-900/95 backdrop-blur-lg rounded-xl p-4 border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold">Movie Details</h3>
                                <button
                                    onClick={() => setShowInfo(false)}
                                    className="p-1 hover:bg-white/10 rounded"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-400">Title</div>
                                    <div className="font-medium">{movie.title}</div>
                                </div>

                                {movie.description && (
                                    <div>
                                        <div className="text-xs text-gray-400">Description</div>
                                        <div className="text-sm text-gray-300 line-clamp-4">{movie.description}</div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    {movie.genre && (
                                        <div>
                                            <div className="text-xs text-gray-400">Genre</div>
                                            <div className="font-medium">{movie.genre}</div>
                                        </div>
                                    )}

                                    {movie.nation && (
                                        <div>
                                            <div className="text-xs text-gray-400">Country</div>
                                            <div className="font-medium flex items-center gap-1">
                                                <FaGlobe className="text-xs" /> {movie.nation}
                                            </div>
                                        </div>
                                    )}

                                    {movie.translator && (
                                        <div>
                                            <div className="text-xs text-gray-400">Translator</div>
                                            <div className="font-medium flex items-center gap-1">
                                                <FaLanguage className="text-xs" /> {movie.translator}
                                            </div>
                                        </div>
                                    )}

                                    {movie.director && (
                                        <div>
                                            <div className="text-xs text-gray-400">Director</div>
                                            <div className="font-medium">{movie.director}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Download Info Section */}
                                <div className="pt-3 border-t border-gray-800">
                                    <div className="text-xs text-gray-400 mb-1">Download Status</div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaDownload className={`${hasDownload ? 'text-green-400' : 'text-gray-400'}`} />
                                            <span className={`font-medium ${hasDownload ? 'text-green-300' : 'text-gray-300'}`}>
                                                {hasDownload ? 'Download Available' : 'No Download Available'}
                                            </span>
                                        </div>
                                        {hasDownload && (
                                            <button
                                                onClick={handleDownload}
                                                className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                                            >
                                                Download <FaExternalLinkAlt className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-800">
                                    <div className="text-xs text-gray-400">Video Source</div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <PlatformIcon className={`text-${videoInfo.color}-400`} />
                                            <span className="font-medium">{videoInfo.platform}</span>
                                        </div>
                                        {videoInfo.type === 'youtube' && (
                                            <a
                                                href={movie.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                                            >
                                                Open <FaExternalLinkAlt className="text-xs" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Keyboard Shortcuts Help */}
                {showControls && (
                    <div className="absolute bottom-20 left-4 z-20 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300">
                        <div className="font-medium mb-1">Keyboard Shortcuts</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>Space/K: Play/Pause</div>
                            <div>F: Fullscreen</div>
                            <div>M: Mute</div>
                            <div>← →: Skip 10s</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Related Movies/Back to Home for non-fullscreen */}
            {!isFullscreen && (
                <div className="p-6 bg-gray-900/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">More Like This</h2>
                            <button
                                onClick={() => navigate('/')}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
                            >
                                <FaHome /> Back to Home
                            </button>
                        </div>

                        <div className="text-center py-8 text-gray-400">
                            <FaList className="text-4xl mx-auto mb-3 opacity-50" />
                            <p>Related movies will appear here</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}