// src/pages/VideoPlayerPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress,
    FaHome, FaArrowLeft, FaStar, FaCalendarAlt, FaClock, FaHeart,
    FaShare, FaDownload, FaYoutube, FaVideo, FaExclamationCircle,
    FaFileDownload, FaCloudDownloadAlt, FaExternalLinkAlt, FaInfoCircle,
    FaExclamationTriangle, FaArrowDown
} from 'react-icons/fa';

const VideoPlayerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const controlsTimerRef = useRef(null);
    const playerContainerRef = useRef(null);
    const videoRef = useRef(null);

    const [playing, setPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [error, setError] = useState(null);
    const [buffering, setBuffering] = useState(false);
    const [showDownloadSection, setShowDownloadSection] = useState(true);

    useEffect(() => {
        console.log('📍 Location state:', location.state);
        console.log('📍 Movie data from location:', location.state?.movie);

        if (location.state?.movie) {
            const movieData = location.state.movie;
            console.log('✅ Movie data received:', {
                title: movieData.title,
                videoUrl: movieData.videoUrl,
                downloadLink: movieData.downloadLink,
                download_link: movieData.download_link,
                allFields: Object.keys(movieData)
            });

            setVideoData(movieData);
            setLoading(false);
        } else if (params.id) {
            fetchVideoData(params.id);
        } else {
            navigate('/');
        }

        controlsTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 1000);

        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        const handleKeyPress = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'm':
                    toggleMute();
                    break;
                case 'arrowleft':
                case 'j':
                    handleSeek(-10);
                    break;
                case 'arrowright':
                case 'l':
                    handleSeek(10);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            clearTimeout(controlsTimerRef.current);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [location, params, navigate]);

    const fetchVideoData = async (id) => {
        try {
            const mockData = {
                id: id,
                title: 'Sample Video',
                videoUrl: '',
                description: 'Sample description',
                rating: '8.5',
                year: '2024',
                category: 'Action, Adventure',
                type: 'movie',
                duration: '2h 15m',
                poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
                streamLink: '',
                downloadLink: 'https://example.com/test-download.mp4',
                background: '',
                nation: '',
                translator: ''
            };
            console.log('📝 Setting mock data with downloadLink:', mockData.downloadLink);
            setVideoData(mockData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching video:', error);
            setError('Failed to load video');
        }
    };

    // Get download link
    const getDownloadLink = () => {
        if (!videoData) {
            return '';
        }

        console.log('🔍 Checking download link in videoData:', {
            downloadLink: videoData.downloadLink,
            hasDownloadLink: !!videoData.downloadLink,
            videoData: videoData
        });

        return videoData.downloadLink || videoData.download_link || '';
    };

    const getVideoUrl = () => {
        if (!videoData) return '';
        return videoData.videoUrl || videoData.streamLink || videoData.stream_link || '';
    };

    const isYouTubeUrl = (url) => {
        return url?.includes('youtube.com') || url?.includes('youtu.be');
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';

        let videoId = '';

        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1]?.split('?')[0];
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0`;
        }

        return url;
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setPlaying(true);
            } else {
                videoRef.current.pause();
                setPlaying(false);
            }
        }
        setShowControls(true);
        resetControlsTimer();
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !muted;
            setMuted(!muted);
        }
        setShowControls(true);
        resetControlsTimer();
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume === 0) {
            setMuted(true);
        } else {
            setMuted(false);
        }

        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setShowControls(true);
        resetControlsTimer();
    };

    const handleSeek = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
        setShowControls(true);
        resetControlsTimer();
    };

    const handleSeekTo = (percentage) => {
        if (videoRef.current) {
            const newTime = duration * percentage;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
        setShowControls(true);
        resetControlsTimer();
    };

    const toggleFullscreen = () => {
        const container = playerContainerRef.current;
        if (!fullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
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
        setShowControls(true);
        resetControlsTimer();
    };

    const resetControlsTimer = () => {
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    const handleMouseMove = () => {
        setShowControls(true);
        resetControlsTimer();
    };

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleVideoEnded = () => {
        setPlaying(false);
    };

    const handleVideoError = (e) => {
        console.error('Video error:', e);
        setError('Failed to load video. Please check the URL.');
        setBuffering(false);
    };

    const handleVideoWaiting = () => {
        setBuffering(true);
    };

    const handleVideoPlaying = () => {
        setBuffering(false);
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const renderPlayer = () => {
        const videoUrl = getVideoUrl();

        if (!videoUrl) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-center p-8">
                        <FaExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">No Video URL Provided</h3>
                        <p className="text-gray-400">Please add a video URL in the admin panel</p>
                    </div>
                </div>
            );
        }

        if (isYouTubeUrl(videoUrl)) {
            const embedUrl = getYouTubeEmbedUrl(videoUrl);
            return (
                <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={videoData?.title || 'Video Player'}
                    frameBorder="0"
                    onError={() => setError('Failed to load YouTube video')}
                />
            );
        }

        return (
            <video
                ref={videoRef}
                src={videoUrl}
                className="absolute inset-0 w-full h-full"
                autoPlay
                muted={muted}
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                onWaiting={handleVideoWaiting}
                onPlaying={handleVideoPlaying}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                poster={videoData?.poster}
                playsInline
                onClick={togglePlayPause}
            />
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading video...</p>
                </div>
            </div>
        );
    }

    if (error || !videoData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                    <FaExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
                    <h1 className="text-2xl text-white mb-4">{error || 'Video not found'}</h1>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const videoUrl = getVideoUrl();
    const isYouTube = isYouTubeUrl(videoUrl);
    const downloadLink = getDownloadLink();

    console.log('🎬 Rendering with:', {
        hasVideoData: !!videoData,
        downloadLink: downloadLink,
        hasDownloadLink: !!downloadLink,
        isYouTube: isYouTube,
        videoTitle: videoData.title
    });

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
                >
                    <FaArrowLeft className="text-xl" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <h1 className="text-white text-lg font-semibold truncate max-w-2xl px-4">
                    {videoData.title}
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="text-white hover:text-red-400 transition-colors"
                >
                    <FaHome className="text-xl" />
                </button>
            </div>

            {/* Main Player Container */}
            <div
                id="player-container"
                ref={playerContainerRef}
                className="relative bg-black w-full"
                onMouseMove={handleMouseMove}
            >
                {/* 16:9 Aspect Ratio Container */}
                <div className="relative pt-[56.25%] w-full">
                    {renderPlayer()}

                    {buffering && !isYouTube && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-white text-sm">Buffering...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                            <div className="text-center p-8 max-w-md">
                                <FaExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Unable to play video</h3>
                                <p className="text-gray-300 mb-4">{error}</p>
                                {videoUrl && (
                                    <a
                                        href={videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                                    >
                                        <FaExternalLinkAlt /> Open Video Link
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Simple Center Play/Pause Button */}
                    {!error && !isYouTube && !playing && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={togglePlayPause}
                                className="p-8 bg-black/60 hover:bg-black/80 rounded-full transition-all transform hover:scale-110 backdrop-blur-sm z-10"
                            >
                                <FaPlay className="text-white text-6xl ml-2" />
                            </button>
                        </div>
                    )}

                    {/* Bottom Controls */}
                    {!error && !isYouTube && showControls && (
                        <div
                            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300"
                        >
                            {/* Progress Bar */}
                            <div className="mb-3">
                                <input
                                    type="range"
                                    min={0}
                                    max={duration || 1}
                                    step="any"
                                    value={currentTime}
                                    onChange={(e) => {
                                        const newTime = parseFloat(e.target.value);
                                        handleSeekTo(newTime / duration);
                                    }}
                                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-300 mt-1">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Minimal Control Buttons */}
                            <div className="flex items-center justify-between">
                                {/* Left side */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={togglePlayPause}
                                        className="text-white hover:text-red-400 transition-colors"
                                    >
                                        {playing ? (
                                            <FaPause className="text-lg" />
                                        ) : (
                                            <FaPlay className="text-lg" />
                                        )}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={toggleMute}
                                            className="text-white hover:text-red-400 transition-colors"
                                        >
                                            {muted ? (
                                                <FaVolumeMute className="text-lg" />
                                            ) : (
                                                <FaVolumeUp className="text-lg" />
                                            )}
                                        </button>
                                        <div className="w-20">
                                            <input
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right side */}
                                <div className="flex items-center gap-3">
                                    {/* Download Button in Player */}
                                    {downloadLink && (
                                        <a
                                            href={downloadLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white hover:text-blue-400 transition-colors flex items-center gap-2"
                                            title="Download Video"
                                        >
                                            <FaDownload className="text-lg" />
                                            <span className="text-sm hidden sm:inline">
                                                Download
                                            </span>
                                        </a>
                                    )}

                                    {/* Fullscreen */}
                                    <button
                                        onClick={toggleFullscreen}
                                        className="text-white hover:text-red-400 transition-colors"
                                        title="Fullscreen"
                                    >
                                        {fullscreen ? <FaCompress className="text-lg" /> : <FaExpand className="text-lg" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Download Section Under Video Player */}
            {showDownloadSection && (
                <div className="w-full px-4 mt-4 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-700/30 rounded-xl p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-600/20 rounded-lg">
                                        <FaCloudDownloadAlt className="text-blue-400 text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Download This Video</h3>
                                        <p className="text-gray-400 text-sm">
                                            Available for offline viewing in high quality
                                        </p>
                                    </div>
                                </div>
                                {downloadLink ? (
                                    <a
                                        href={downloadLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center justify-center gap-3 transition-colors group"
                                    >
                                        <FaFileDownload className="text-lg group-hover:animate-bounce" />
                                        <span>Download Now</span>
                                        <FaArrowDown className="text-sm group-hover:translate-y-1 transition-transform" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-600/20 rounded-lg">
                                            <FaExclamationTriangle className="text-red-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-red-300 text-sm font-medium">Download Not Available</p>
                                            <p className="text-gray-500 text-xs">
                                                Add download link in admin panel
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Download Info */}
                            {downloadLink && (
                                <div className="mt-4 pt-4 border-t border-blue-800/30">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-gray-300 text-sm">High Quality</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-gray-300 text-sm">Fast Download</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-gray-300 text-sm">No Ads</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Video Info Panel */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Description */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-white mb-2">{videoData.title}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-gray-300 mb-4">
                                {videoData.rating && (
                                    <span className="flex items-center gap-1">
                                        <FaStar className="text-yellow-500" /> {videoData.rating}
                                    </span>
                                )}
                                {videoData.year && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <FaCalendarAlt /> {videoData.year}
                                        </span>
                                    </>
                                )}
                                {videoData.duration && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <FaClock /> {videoData.duration}
                                        </span>
                                    </>
                                )}
                                <span>•</span>
                                <span className="px-2 py-1 bg-gray-800 rounded text-sm capitalize">
                                    {videoData.type || 'movie'}
                                </span>
                                {isYouTube && (
                                    <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs flex items-center gap-1">
                                        <FaYoutube /> YouTube
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed mb-6">{videoData.description || 'No description available.'}</p>

                        {/* Category Tags */}
                        {videoData.category && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {videoData.category.split(',').map((cat, index) => (
                                    <span key={index} className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors cursor-pointer">
                                        {cat.trim()}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Additional Info */}
                        {(videoData.nation || videoData.translator) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {videoData.nation && (
                                    <div className="bg-gray-900/50 rounded-xl p-4">
                                        <h4 className="text-sm text-gray-400 mb-1">Country</h4>
                                        <p className="text-white font-medium">{videoData.nation}</p>
                                    </div>
                                )}
                                {videoData.translator && (
                                    <div className="bg-gray-900/50 rounded-xl p-4">
                                        <h4 className="text-sm text-gray-400 mb-1">Translator/Network</h4>
                                        <p className="text-white font-medium">{videoData.translator}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions & Info */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="bg-gray-900/50 rounded-xl p-6">
                            <div className="space-y-4">
                                {!isYouTube && (
                                    <button
                                        onClick={togglePlayPause}
                                        className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold flex items-center justify-center gap-3 transition-colors"
                                    >
                                        {playing ? (
                                            <>
                                                <FaPause /> PAUSE
                                            </>
                                        ) : (
                                            <>
                                                <FaPlay /> PLAY NOW
                                            </>
                                        )}
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setIsLiked(!isLiked)}
                                        className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${isLiked ? 'bg-pink-900/30 text-pink-400' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                                    >
                                        <FaHeart /> {isLiked ? 'LIKED' : 'LIKE'}
                                    </button>
                                    <button className="py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center justify-center gap-2 transition-colors">
                                        <FaShare /> SHARE
                                    </button>
                                </div>

                                {/* Download Button (Large) */}
                                {downloadLink ? (
                                    <a
                                        href={downloadLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center justify-center gap-3 transition-colors group"
                                    >
                                        <FaDownload className="group-hover:animate-bounce" /> DOWNLOAD VIDEO
                                    </a>
                                ) : (
                                    <div className="w-full py-3 bg-gray-800 rounded-lg text-gray-400 font-medium flex items-center justify-center gap-3 cursor-not-allowed">
                                        <FaDownload /> DOWNLOAD NOT AVAILABLE
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video Details */}
                        <div className="bg-gray-900/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-gray-400">Type</span>
                                    <span className="text-white capitalize">{videoData.type || 'movie'}</span>
                                </div>
                                {videoData.year && (
                                    <div className="flex justify-between py-2 border-b border-gray-800">
                                        <span className="text-gray-400">Year</span>
                                        <span className="text-white">{videoData.year}</span>
                                    </div>
                                )}
                                {videoData.duration && (
                                    <div className="flex justify-between py-2 border-b border-gray-800">
                                        <span className="text-gray-400">Duration</span>
                                        <span className="text-white">{videoData.duration}</span>
                                    </div>
                                )}
                                {videoData.rating && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-400">Rating</span>
                                        <span className="text-white">{videoData.rating}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerPage;