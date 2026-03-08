// components/SimpleVideoModal.jsx - Updated for YouTube and multiple platforms
import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { FaTimes, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaStar, FaCalendarAlt, FaFilm, FaTv, FaClock, FaYoutube, FaVideo, FaLink, FaExternalLinkAlt } from 'react-icons/fa';

const SimpleVideoModal = ({
    isOpen,
    onClose,
    videoUrl,
    title,
    description,
    year,
    rating,
    type,
    genre,
    duration,
    poster
}) => {
    const [playing, setPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const playerRef = useRef(null);

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
        } else if (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.ogg') || urlLower.includes('.m3u8')) {
            return 'file';
        } else if (urlLower.includes('.mpd')) {
            return 'dash';
        } else if (urlLower.includes('.m3u8')) {
            return 'hls';
        } else {
            return 'unknown';
        }
    };

    const videoType = getVideoSourceType(videoUrl);

    // Platform icons
    const platformIcons = {
        youtube: <FaYoutube className="text-red-500" />,
        vimeo: <FaVideo className="text-blue-400" />,
        dailymotion: <FaVideo className="text-blue-600" />,
        twitch: <FaVideo className="text-purple-600" />,
        facebook: <FaVideo className="text-blue-700" />,
        file: <FaVideo className="text-green-500" />,
        dash: <FaVideo className="text-orange-500" />,
        hls: <FaVideo className="text-purple-500" />,
        unknown: <FaLink className="text-gray-500" />
    };

    useEffect(() => {
        // Reset play state when modal opens
        if (isOpen) {
            setPlaying(true);
            setPlayerReady(false);
        }
    }, [isOpen]);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle player ready
    const handlePlayerReady = () => {
        setPlayerReady(true);
    };

    // Handle player error
    const handlePlayerError = (error) => {
        console.error('Player error:', error);
        // You can show an error message to the user here
    };

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const handleFullscreen = () => {
        const elem = document.documentElement;
        if (!fullscreen) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
            setFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setFullscreen(false);
        }
    };

    const handleOpenInNewTab = () => {
        if (videoUrl) {
            window.open(videoUrl, '_blank', 'noopener,noreferrer');
        }
    };

    if (!isOpen || !videoUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-3 bg-black/70 rounded-full hover:bg-black/90 transition-all hover:scale-110"
            >
                <FaTimes className="text-white text-xl" />
            </button>

            {/* Video Container */}
            <div className="relative w-full max-w-6xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                {/* Video Header */}
                <div className="p-6 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl md:text-3xl font-bold text-white line-clamp-1">{title || 'Movie'}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-300">
                                        {platformIcons[videoType]}
                                        <span className="capitalize">{videoType}</span>
                                    </span>
                                    <button
                                        onClick={handleOpenInNewTab}
                                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                                        title="Open in new tab"
                                    >
                                        <FaExternalLinkAlt className="text-gray-400 text-sm" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-gray-300">
                                {year && (
                                    <span className="flex items-center gap-1 text-sm">
                                        <FaCalendarAlt /> {year}
                                    </span>
                                )}
                                {rating && (
                                    <span className="flex items-center gap-1 text-sm">
                                        <FaStar className="text-yellow-400" /> {rating}
                                    </span>
                                )}
                                {duration && (
                                    <span className="flex items-center gap-1 text-sm">
                                        <FaClock /> {duration}
                                    </span>
                                )}
                                {type && (
                                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${type === 'series' ? 'bg-purple-600' : 'bg-red-600'}`}>
                                        {type === 'series' ? <FaTv /> : <FaFilm />}
                                        {type === 'series' ? 'Series' : 'Movie'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleFullscreen}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center gap-2"
                            >
                                {fullscreen ? <FaCompress /> : <FaExpand />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Player */}
                <div className="relative bg-black min-h-[400px]">
                    {!playerReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-300">Loading player...</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    Playing from {videoType === 'youtube' ? 'YouTube' : videoType}
                                </p>
                            </div>
                        </div>
                    )}

                    <ReactPlayer
                        ref={playerRef}
                        url={videoUrl}
                        playing={playing}
                        volume={volume}
                        muted={muted}
                        width="100%"
                        height="100%"
                        controls={false}
                        onReady={handlePlayerReady}
                        onError={handlePlayerError}
                        onEnded={() => setPlaying(false)}
                        config={{
                            youtube: {
                                playerVars: {
                                    controls: 0,
                                    modestbranding: 1,
                                    rel: 0,
                                    showinfo: 0,
                                    fs: 1,
                                    iv_load_policy: 3,
                                    disablekb: 0,
                                    playsinline: 1
                                }
                            },
                            vimeo: {
                                playerOptions: {
                                    byline: false,
                                    portrait: false,
                                    title: false,
                                    transparent: false
                                }
                            },
                            facebook: {
                                appId: 'your-facebook-app-id' // Optional: Add your Facebook app ID
                            },
                            file: {
                                attributes: {
                                    controlsList: 'nodownload',
                                },
                                forceVideo: true,
                            },
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            minHeight: '400px'
                        }}
                    />

                    {/* Custom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePlayPause}
                                    className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-all hover:scale-110"
                                >
                                    {playing ? (
                                        <FaPause className="text-white text-lg" />
                                    ) : (
                                        <FaPlay className="text-white text-lg ml-0.5" />
                                    )}
                                </button>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setMuted(!muted)}
                                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                                    >
                                        {muted ? (
                                            <FaVolumeMute className="text-white text-lg" />
                                        ) : (
                                            <FaVolumeUp className="text-white text-lg" />
                                        )}
                                    </button>
                                    <div className="flex items-center gap-2 w-32">
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                        />
                                        <span className="text-white text-sm min-w-[40px]">
                                            {Math.round(volume * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleFullscreen}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center gap-2"
                                >
                                    {fullscreen ? <FaCompress /> : <FaExpand />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Video Source Info */}
                        <div className="mt-4 pt-3 border-t border-gray-800/50">
                            <div className="flex items-center justify-between text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <span>Source:</span>
                                    <span className={`px-2 py-1 rounded ${videoType === 'youtube' ? 'bg-red-600/20 text-red-300' :
                                        videoType === 'vimeo' ? 'bg-blue-600/20 text-blue-300' :
                                            videoType === 'file' ? 'bg-green-600/20 text-green-300' :
                                                'bg-gray-700 text-gray-300'}`}>
                                        {videoType.toUpperCase()}
                                    </span>
                                </div>
                                <button
                                    onClick={handleOpenInNewTab}
                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                    <FaExternalLinkAlt /> Open original
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                {(description || genre) && (
                    <div className="p-6 bg-gray-900 border-t border-gray-800">
                        {description && (
                            <>
                                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                                <p className="text-gray-300 mb-4">{description}</p>
                            </>
                        )}
                        {genre && (
                            <div className="flex flex-wrap gap-2">
                                {genre.split(',').map((cat, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                                        {cat.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleVideoModal;