import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress,
    FaArrowLeft, FaDownload, FaHome, FaStar, FaForward, FaBackward,
    FaVideo
} from 'react-icons/fa';

const Player = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const controlsTimerRef = useRef(null);

    // Get movie data
    const { movie } = location.state || {};
    const [videoUrl, setVideoUrl] = useState('');
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [videoType, setVideoType] = useState('direct');
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile] = useState(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    const [isVimeoVideo, setIsVimeoVideo] = useState(false);

    // Detect video type
    const detectVideoType = (url) => {
        if (!url || typeof url !== 'string') return 'direct';

        // Check if it's a Vimeo URL
        if (url.includes('vimeo.com') || url.includes('player.vimeo.com') || /^\d+$/.test(url.trim())) {
            return 'vimeo';
        }

        // Check if it's a direct video file
        if (url.match(/\.(mp4|webm|mkv|avi|mov|m3u8)$/i)) {
            return 'direct';
        }

        // Check for Mux
        if (url.includes('mux.com') || url.includes('.mpd')) {
            return 'mux';
        }

        return 'direct';
    };

    // Extract Vimeo ID
    const extractVimeoId = (url) => {
        if (!url || typeof url !== 'string') return '';
        if (/^\d+$/.test(url.trim())) return url.trim();

        const patterns = [
            /vimeo\.com\/(\d+)/,
            /player\.vimeo\.com\/video\/(\d+)/,
            /vimeo\.com\/channels\/[^\/]+\/(\d+)/,
            /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return '';
    };

    // Play/Pause for HTML5 videos only
    const handlePlayPause = useCallback((e) => {
        e?.stopPropagation();

        // Don't try to control Vimeo videos
        if (isVimeoVideo) return;

        if (!videoRef.current) return;

        const video = videoRef.current;

        if (video.paused || video.ended) {
            video.play()
                .then(() => {
                    setPlaying(true);
                })
                .catch(err => {
                    console.error("Play error:", err);
                    // Try with muted
                    video.muted = true;
                    setMuted(true);
                    video.play().then(() => setPlaying(true));
                });
        } else {
            video.pause();
            setPlaying(false);
        }

        showControlsWithTimer();
    }, [isVimeoVideo]);

    const handleTimeUpdate = () => {
        if (videoRef.current && !isVimeoVideo) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration || 0;
            setCurrentTime(current);
            setProgress(total > 0 ? current / total : 0);
            setDuration(total);
        }
    };

    const handleVolumeChange = (e) => {
        e?.stopPropagation();
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current && !isVimeoVideo) {
            videoRef.current.volume = newVolume;
        }
        setMuted(newVolume === 0);
        showControlsWithTimer();
    };

    const handleToggleMute = (e) => {
        e?.stopPropagation();
        if (videoRef.current && !isVimeoVideo) {
            videoRef.current.muted = !videoRef.current.muted;
            setMuted(videoRef.current.muted);
        } else {
            setMuted(!muted);
        }
        showControlsWithTimer();
    };

    const handleSeek = (e) => {
        e?.stopPropagation();
        const seekTo = parseFloat(e.target.value);
        setProgress(seekTo);

        if (videoRef.current && !isVimeoVideo && !isNaN(videoRef.current.duration)) {
            const newTime = seekTo * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
        showControlsWithTimer();
    };

    const handleForward = (e, seconds = 10) => {
        e?.stopPropagation();
        if (videoRef.current && !isVimeoVideo) {
            videoRef.current.currentTime += seconds;
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handleRewind = (e, seconds = 10) => {
        e?.stopPropagation();
        if (videoRef.current && !isVimeoVideo) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handlePlaybackRate = (rate, e) => {
        e?.stopPropagation();
        if (videoRef.current && !isVimeoVideo) {
            videoRef.current.playbackRate = rate;
        }
        setPlaybackRate(rate);
        showControlsWithTimer();
    };

    const handleDownload = (e) => {
        e?.stopPropagation();
        if (movie?.download_link) {
            window.open(movie.download_link, '_blank');
        } else {
            alert('Download link not available for this movie.');
        }
        showControlsWithTimer();
    };

    const handleFullscreen = (e) => {
        e?.stopPropagation();
        const element = playerContainerRef.current;
        if (!element) return;

        if (!document.fullscreenElement) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            setIsFullscreen(false);
        }
        showControlsWithTimer();
    };

    const handleGoHome = (e) => {
        e?.stopPropagation();
        navigate('/');
    };

    // Auto-hide controls timer
    const resetControlsTimer = () => {
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = setTimeout(() => {
            if (playing && isFullscreen) setShowControls(false);
        }, 3000);
    };

    const showControlsWithTimer = () => {
        setShowControls(true);
        resetControlsTimer();
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes().toString().padStart(2, '0');
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh > 0) return `${hh}:${mm}:${ss}`;
        return `${mm}:${ss}`;
    };

    // Initialize video
    useEffect(() => {
        if (!movie) {
            setError("No movie selected");
            return;
        }

        const url = movie?.videoUrl || movie?.streamLink || '';
        setLoading(true);

        const initializeVideo = () => {
            const detectedType = detectVideoType(url);
            setVideoType(detectedType);

            if (detectedType === 'vimeo') {
                setIsVimeoVideo(true);
                const vimeoId = extractVimeoId(url);
                if (vimeoId) {
                    // Use Vimeo embed with THEIR controls
                    const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
                    setVideoUrl(embedUrl);
                    console.log("🎬 Using Vimeo embedded player with Vimeo controls");
                } else {
                    setError("Invalid Vimeo URL");
                }
            } else {
                setIsVimeoVideo(false);
                // Direct video file - use OUR controls
                setVideoUrl(url);
                console.log("🎬 Using custom HTML5 player with our controls");
            }
            setLoading(false);
        };

        initializeVideo();

        // Fullscreen change listener
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [movie]);

    // Render video player
    const renderVideoPlayer = () => {
        if (isVimeoVideo) {
            // Vimeo embed - THEY handle controls
            return (
                <div className="relative w-full h-full">
                    <iframe
                        src={videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={movie.title}
                        onLoad={() => {
                            console.log("✅ Vimeo iframe loaded");
                            setVideoLoaded(true);
                            setPlaying(true); // Vimeo auto-plays
                        }}
                    />
                </div>
            );
        } else {
            // HTML5 video - WE handle controls
            return (
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain bg-black"
                    src={videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => {
                        console.log("✅ HTML5 video loaded");
                        setVideoLoaded(true);
                        if (videoRef.current) {
                            setDuration(videoRef.current.duration);
                            // Try auto-play for HTML5 videos
                            const playPromise = videoRef.current.play();
                            if (playPromise !== undefined) {
                                playPromise
                                    .then(() => {
                                        setPlaying(true);
                                    })
                                    .catch(err => {
                                        console.log("Auto-play failed - waiting for user click");
                                        setPlaying(false);
                                    });
                            }
                        }
                    }}
                    onPlay={() => {
                        console.log("▶️ HTML5 video playing");
                        setPlaying(true);
                        setError('');
                    }}
                    onPause={() => {
                        console.log("⏸️ HTML5 video paused");
                        setPlaying(false);
                    }}
                    onError={(e) => {
                        console.error("❌ Video error:", e);
                        setError("Failed to load video");
                    }}
                    playsInline
                    preload="auto"
                    muted={muted}
                >
                    Your browser does not support the video tag.
                </video>
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading player...</p>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center p-8 max-w-lg">
                    <div className="text-red-500 text-6xl mb-4">!</div>
                    <h1 className="text-3xl text-white font-bold mb-4">Error</h1>
                    <p className="text-gray-400 mb-6">{error || "No movie selected"}</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors">
                            Go Back
                        </button>
                        <button onClick={handleGoHome}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2">
                            <FaHome /> Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top Navigation */}
            {!isFullscreen && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent z-10">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white hover:text-red-500">
                            <FaArrowLeft /> Back
                        </button>

                        <div className="flex-1 text-center px-4">
                            <h1 className="text-xl font-bold truncate max-w-2xl mx-auto">{movie.title}</h1>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <FaVideo className={`${isVimeoVideo ? 'text-blue-400' : 'text-green-400'} text-xs`} />
                                <span className={`text-sm ${isVimeoVideo ? 'text-blue-300' : 'text-green-300'}`}>
                                    {isVimeoVideo ? 'Vimeo Player' : 'Custom Player'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {movie?.download_link && (
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                                >
                                    <FaDownload /> Download
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Player Container */}
            <div
                ref={playerContainerRef}
                className={`relative w-full ${isMobile ? 'h-[60vh]' : 'h-screen'} bg-black`}
                onMouseMove={showControlsWithTimer}
                onClick={(e) => {
                    // Only toggle play/pause for HTML5 videos
                    if (!isVimeoVideo && !e.target.closest('button')) {
                        handlePlayPause(e);
                    }
                    showControlsWithTimer();
                }}
                style={isFullscreen ? {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999
                } : {}}
            >
                {/* Video Player */}
                {renderVideoPlayer()}

                {/* Play Button Overlay - Only for HTML5 videos when paused */}
                {!isVimeoVideo && videoLoaded && !playing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                        <button
                            onClick={handlePlayPause}
                            className="p-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:scale-110 transition-transform"
                        >
                            <FaPlay className="text-5xl text-white ml-2" />
                        </button>
                    </div>
                )}

                {/* Bottom Controls - Only show for HTML5 videos */}
                {!isVimeoVideo && (
                    <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="max-w-7xl mx-auto">
                            {/* Progress Bar */}
                            <div className="mb-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.001"
                                    value={progress}
                                    onChange={handleSeek}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                                />
                                <div className="flex justify-between text-sm text-gray-300 mt-2">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Play/Pause Button */}
                                    <button
                                        onClick={handlePlayPause}
                                        className="hover:text-blue-500 transition-colors p-2"
                                    >
                                        {playing ? (
                                            <FaPause className={`${isMobile ? 'text-2xl' : 'text-3xl'}`} />
                                        ) : (
                                            <FaPlay className={`${isMobile ? 'text-2xl ml-0.5' : 'text-3xl ml-1'}`} />
                                        )}
                                    </button>

                                    {!isMobile && (
                                        <>
                                            <button
                                                onClick={(e) => handleRewind(e, 10)}
                                                className="hover:text-blue-500 transition-colors p-2"
                                            >
                                                <FaBackward className="text-2xl" />
                                            </button>
                                            <button
                                                onClick={(e) => handleForward(e, 10)}
                                                className="hover:text-blue-500 transition-colors p-2"
                                            >
                                                <FaForward className="text-2xl" />
                                            </button>
                                        </>
                                    )}

                                    {!isMobile && (
                                        <div className="flex items-center gap-3 ml-2">
                                            <button
                                                onClick={handleToggleMute}
                                                className="hover:text-blue-500 transition-colors p-2"
                                            >
                                                {muted ? <FaVolumeMute className="text-2xl" /> : <FaVolumeUp className="text-2xl" />}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Playback Rate */}
                                    {!isMobile && (
                                        <div className="relative group">
                                            <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                                                {playbackRate}x
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                                <div className="text-xs text-gray-400 mb-1">Speed</div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                                        <button
                                                            key={rate}
                                                            onClick={(e) => handlePlaybackRate(rate, e)}
                                                            className={`px-2 py-1 text-sm rounded ${playbackRate === rate ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                        >
                                                            {rate}x
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fullscreen */}
                                    <button
                                        onClick={handleFullscreen}
                                        className="hover:text-blue-500 transition-colors p-2"
                                    >
                                        {isFullscreen ? (
                                            <FaCompress className={`${isMobile ? 'text-xl' : 'text-2xl'}`} />
                                        ) : (
                                            <FaExpand className={`${isMobile ? 'text-xl' : 'text-2xl'}`} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vimeo Info - Only show for Vimeo videos */}
                {isVimeoVideo && showControls && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-500/30 z-30">
                        <div className="flex items-center gap-2">
                            <FaVideo className="text-blue-400" />
                            <span className="text-white text-sm">Using Vimeo Player Controls</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Movie Info */}
            {!isFullscreen && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {movie.year && <span className="px-4 py-2 bg-red-600 rounded-full">{movie.year}</span>}
                                {movie.rating && <span className="px-4 py-2 bg-yellow-600 rounded-full flex items-center gap-2"><FaStar /> {movie.rating}</span>}
                                <span className={`px-4 py-2 ${isVimeoVideo ? 'bg-blue-600' : 'bg-green-600'} rounded-full`}>
                                    {isVimeoVideo ? 'Vimeo Video' : 'Direct Video'}
                                </span>
                            </div>
                            <p className="text-gray-300 mb-6">{movie.description || 'No description'}</p>

                            {/* Player Status Card */}
                            <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FaVideo className={`${isVimeoVideo ? 'text-blue-400' : 'text-green-400'}`} />
                                    <div>
                                        <h4 className="text-white font-medium">Player Information</h4>
                                        <p className="text-gray-300 text-sm">
                                            {isVimeoVideo
                                                ? 'This video is hosted on Vimeo and uses Vimeo\'s player controls.'
                                                : 'This video uses our custom player controls.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Player;