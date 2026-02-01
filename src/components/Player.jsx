// src/components/Player.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaPlay,
    FaPause,
    FaVolumeUp,
    FaVolumeMute,
    FaExpand,
    FaArrowLeft,
    FaDownload,
    FaHome,
    FaStar,
    FaGlobe,
    FaLanguage,
    FaCheckCircle,
    FaExclamationTriangle,
    FaRedoAlt,
    FaForward,
    FaBackward,
    FaUndo,
    FaRedo
} from 'react-icons/fa';

const Player = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const controlsTimerRef = useRef(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    // Get movie data from navigation state
    const { movie } = location.state || {};
    const [videoUrl, setVideoUrl] = useState(movie?.videoUrl || '');
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMuxVideo, setIsMuxVideo] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);

    // Check if URL is Mux
    const checkIsMuxUrl = (url) => {
        if (!url) return false;
        return url.includes('stream.mux.com');
    };

    // Extract playback ID from Mux URL
    const extractPlaybackId = (url) => {
        if (!url) return null;
        const match = url.match(/stream\.mux\.com\/([A-Za-z0-9]+)(?:\.mp4|\.m3u8)?/);
        return match ? match[1] : null;
    };

    // Generate Mux thumbnail URL
    const getMuxThumbnailUrl = (playbackId) => {
        if (!playbackId) return '';
        return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1280&height=720&fit_mode=smartcrop`;
    };

    // Generate alternative Mux URL (HLS)
    const getMuxHlsUrl = (playbackId) => {
        if (!playbackId) return '';
        return `https://stream.mux.com/${playbackId}.m3u8`;
    };

    // Handle missing movie data
    useEffect(() => {
        console.log("🎬 Player Component - Movie Data:", movie);
        console.log("🎬 Original Video URL:", movie?.videoUrl);

        if (!movie) {
            console.log("❌ No movie data found");
            setError("No movie selected. Please go back and select a movie.");
            setLoading(false);
            return;
        }

        // Check if it's a Mux URL
        const url = movie?.videoUrl || movie?.streamLink || '';
        const isMux = checkIsMuxUrl(url);
        setIsMuxVideo(isMux);

        if (url) {
            console.log("📹 Setting video URL:", url);
            console.log("🎯 Is Mux URL:", isMux);

            if (isMux) {
                const playbackId = extractPlaybackId(url);
                console.log("🔑 Mux Playback ID:", playbackId);

                // Try multiple Mux formats
                const muxUrls = [
                    url, // Original URL
                    getMuxHlsUrl(playbackId), // HLS version
                    url.replace('.mp4', '.m3u8'), // Convert MP4 to HLS
                    url.replace('.m3u8', '.mp4'), // Convert HLS to MP4
                ].filter(Boolean);

                console.log("🔄 Testing Mux URLs:", muxUrls);

                // Try the first URL first
                setVideoUrl(muxUrls[0]);
            } else {
                setVideoUrl(url);
            }
            setLoading(false);
        } else {
            setError("Video URL not found for this movie.");
            setLoading(false);
        }

        // Auto-hide controls after 3 seconds
        resetControlsTimer();

        return () => {
            if (controlsTimerRef.current) {
                clearTimeout(controlsTimerRef.current);
            }
        };
    }, [movie, retryCount]);

    // Reset controls hide timer
    const resetControlsTimer = () => {
        if (controlsTimerRef.current) {
            clearTimeout(controlsTimerRef.current);
        }

        controlsTimerRef.current = setTimeout(() => {
            if (playing) {
                setShowControls(false);
            }
        }, 3000);
    };

    // Show controls and reset timer
    const showControlsWithTimer = () => {
        setShowControls(true);
        resetControlsTimer();
    };

    // Event handlers
    const handlePlayPause = () => {
        if (!hasUserInteracted) {
            setHasUserInteracted(true);
        }

        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().then(() => {
                    setPlaying(true);
                    console.log("▶️ Video started playing");
                }).catch(err => {
                    console.error("❌ Play error:", err);
                    setError(`Failed to play video: ${err.message}. Try using a different browser or check the video URL.`);

                    // Try alternative Mux format
                    if (isMuxVideo && retryCount < 3) {
                        handleRetryWithAlternative();
                    }
                });
            } else {
                videoRef.current.pause();
                setPlaying(false);
            }
        }
        showControlsWithTimer();
    };

    const handleForward = (seconds = 10) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handleRewind = (seconds = 10) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handleSkipForward = () => {
        handleForward(30);
    };

    const handleSkipBackward = () => {
        handleRewind(15);
    };

    const handleJumpToPercentage = (percentage) => {
        if (videoRef.current && duration > 0) {
            const newTime = (percentage / 100) * duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
        showControlsWithTimer();
    };

    const handlePlaybackRate = (rate) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
        showControlsWithTimer();
    };

    const handleRetryWithAlternative = () => {
        if (!isMuxVideo) return;

        const playbackId = extractPlaybackId(videoUrl);
        if (!playbackId) return;

        setRetryCount(prev => prev + 1);

        // Cycle through different Mux formats
        const formats = [
            `https://stream.mux.com/${playbackId}.mp4`,
            `https://stream.mux.com/${playbackId}.m3u8`
        ];

        const nextUrl = formats[retryCount % formats.length];
        console.log(`🔄 Retrying with format ${retryCount + 1}:`, nextUrl);
        setVideoUrl(nextUrl);
        setError(`Trying alternative format (${retryCount + 1}/3)...`);

        // Reset video element
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(console.error);
            }
        }, 500);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setMuted(newVolume === 0);
        showControlsWithTimer();
    };

    const handleToggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setMuted(videoRef.current.muted);
        }
        showControlsWithTimer();
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const totalDuration = videoRef.current.duration || 0;
            setCurrentTime(currentTime);
            setProgress(totalDuration > 0 ? currentTime / totalDuration : 0);
            setDuration(totalDuration);
        }
    };

    const handleSeek = (e) => {
        const seekTo = parseFloat(e.target.value);
        setProgress(seekTo);
        if (videoRef.current && !isNaN(videoRef.current.duration)) {
            const newTime = seekTo * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
        showControlsWithTimer();
    };

    const handleFullscreen = () => {
        const element = document.querySelector('.player-container');
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    };

    const handleDownload = () => {
        if (movie?.downloadLink) {
            window.open(movie.downloadLink, '_blank');
        } else {
            alert('Download link not available for this movie.');
        }
    };

    // Handle user interaction
    const handleUserInteraction = () => {
        if (!hasUserInteracted) {
            setHasUserInteracted(true);
            if (videoRef.current) {
                videoRef.current.play().then(() => {
                    setPlaying(true);
                }).catch(err => {
                    console.error("Auto-play error:", err);
                    setError("Click the play button to start watching.");
                });
            }
        }
        showControlsWithTimer();
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';

        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes().toString().padStart(2, '0');
        const ss = date.getUTCSeconds().toString().padStart(2, '0');

        if (hh > 0) {
            return `${hh}:${mm}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!videoRef.current) return;

            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'f':
                    e.preventDefault();
                    handleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    handleToggleMute();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleForward(5);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handleRewind(5);
                    break;
                case 'l':
                    e.preventDefault();
                    handleForward(10);
                    break;
                case 'j':
                    e.preventDefault();
                    handleRewind(10);
                    break;
                case '>':
                case '.':
                    e.preventDefault();
                    handleForward();
                    break;
                case '<':
                case ',':
                    e.preventDefault();
                    handleRewind();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    const percentage = parseInt(e.key) * 10;
                    handleJumpToPercentage(percentage);
                    break;
                case ']':
                    e.preventDefault();
                    handlePlaybackRate(Math.min(playbackRate + 0.25, 4));
                    break;
                case '[':
                    e.preventDefault();
                    handlePlaybackRate(Math.max(playbackRate - 0.25, 0.25));
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [playing, playbackRate]);

    // Get video source with fallbacks
    const getVideoSource = () => {
        if (!videoUrl || videoUrl.trim() === '') {
            return {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                type: 'video/mp4',
                isFallback: true
            };
        }

        // Determine MIME type based on URL extension
        let type = 'video/mp4';
        if (videoUrl.includes('.m3u8')) type = 'application/x-mpegURL';
        if (videoUrl.includes('.webm')) type = 'video/webm';

        return {
            url: videoUrl,
            type: type,
            isFallback: false
        };
    };

    const videoSource = getVideoSource();
    const playbackId = extractPlaybackId(videoUrl);
    const muxThumbnail = playbackId ? getMuxThumbnailUrl(playbackId) : '';

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading player...</p>
                    {isMuxVideo && (
                        <p className="text-gray-400 text-sm mt-2">Initializing Mux stream...</p>
                    )}
                </div>
            </div>
        );
    }

    // Error state
    if (error || !movie) {
        const errorTitle = error ? 'Video Playback Error' : 'Movie Not Found';
        const errorMessage = error || "Please select a movie to watch.";

        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center p-8 max-w-lg">
                    <div className="text-red-500 text-6xl mb-4">!</div>
                    <h1 className="text-3xl text-white font-bold mb-4">{errorTitle}</h1>
                    <p className="text-gray-400 mb-6">{errorMessage}</p>

                    {isMuxVideo && (
                        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FaExclamationTriangle className="text-yellow-400" />
                                <span className="text-yellow-300 font-semibold">Mux Video Issue</span>
                            </div>
                            <div className="text-sm text-yellow-200/80 space-y-2">
                                <p>Mux videos may fail to load due to:</p>
                                <ul className="list-disc pl-5 text-left">
                                    <li>Browser restrictions</li>
                                    <li>Network/CORS issues</li>
                                    <li>Video encoding not complete</li>
                                </ul>
                                {retryCount < 3 && (
                                    <button
                                        onClick={handleRetryWithAlternative}
                                        className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-medium flex items-center gap-2 mx-auto"
                                    >
                                        <FaRedoAlt /> Try Alternative Format
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 justify-center"
                        >
                            <FaArrowLeft /> Go Back
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 justify-center"
                        >
                            <FaHome /> Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top Navigation Bar */}
            <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
                    >
                        <FaArrowLeft className="text-xl" />
                        <span className="font-semibold">Back to Movies</span>
                    </button>

                    <div className="flex items-center gap-4">
                        {movie.downloadLink && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                title="Download Movie"
                            >
                                <FaDownload /> Download
                            </button>
                        )}

                        {isMuxVideo && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-600/30 rounded-full text-sm">
                                <FaCheckCircle className="text-green-400 text-xs" />
                                <span className="text-green-300">Mux Streaming</span>
                            </div>
                        )}

                        {retryCount > 0 && (
                            <div className="px-3 py-1.5 bg-yellow-600/20 border border-yellow-600/30 rounded-full text-sm">
                                <span className="text-yellow-300">Format {retryCount + 1}</span>
                            </div>
                        )}

                        {/* Playback Rate Selector */}
                        <div className="relative group">
                            <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-1">
                                {playbackRate}x
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                                <div className="text-xs text-gray-400 mb-1">Playback Speed</div>
                                <div className="grid grid-cols-2 gap-1 min-w-[100px]">
                                    {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(rate => (
                                        <button
                                            key={rate}
                                            onClick={() => handlePlaybackRate(rate)}
                                            className={`px-2 py-1 text-sm rounded ${playbackRate === rate ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Player Container */}
            <div
                className="player-container relative w-full h-screen bg-black"
                onMouseMove={showControlsWithTimer}
                onClick={handleUserInteraction}
                onMouseLeave={() => {
                    if (playing) {
                        setTimeout(() => setShowControls(false), 1000);
                    }
                }}
            >
                {/* HTML5 Video Player */}
                <div className="absolute inset-0">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain bg-black"
                        src={videoSource.url}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={() => {
                            console.log("✅ Video metadata loaded");
                            setVideoLoaded(true);
                            if (videoRef.current) {
                                setDuration(videoRef.current.duration);
                            }
                        }}
                        onLoadedData={() => {
                            console.log("✅ Video data loaded");
                            setVideoLoaded(true);
                        }}
                        onCanPlay={() => {
                            console.log("✅ Video can play");
                            setVideoLoaded(true);
                        }}
                        onPlay={() => {
                            console.log("▶️ Video playing");
                            setPlaying(true);
                            setError('');
                        }}
                        onPause={() => {
                            console.log("⏸️ Video paused");
                            setPlaying(false);
                        }}
                        onError={(e) => {
                            console.error("❌ Video error event:", e);
                            console.error("Video element error:", videoRef.current?.error);
                            console.error("Video network state:", videoRef.current?.networkState);
                            console.error("Video ready state:", videoRef.current?.readyState);

                            let errorMsg = "Failed to load video. ";
                            const error = videoRef.current?.error;

                            if (error) {
                                switch (error.code) {
                                    case MediaError.MEDIA_ERR_ABORTED:
                                        errorMsg += "Playback was aborted.";
                                        break;
                                    case MediaError.MEDIA_ERR_NETWORK:
                                        errorMsg += "Network error occurred.";
                                        break;
                                    case MediaError.MEDIA_ERR_DECODE:
                                        errorMsg += "Video decoding failed.";
                                        break;
                                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                        errorMsg += "Video format not supported.";
                                        break;
                                    default:
                                        errorMsg += "Unknown error occurred.";
                                }
                            }

                            setError(errorMsg);

                            // Auto-retry for Mux videos
                            if (isMuxVideo && retryCount < 3) {
                                setTimeout(() => {
                                    handleRetryWithAlternative();
                                }, 1000);
                            }
                        }}
                        onWaiting={() => {
                            console.log("⏳ Video waiting for data");
                        }}
                        onStalled={() => {
                            console.log("⚠️ Video stalled");
                        }}
                        playsInline
                        preload="auto"
                        crossOrigin="anonymous"
                        poster={movie?.poster || muxThumbnail}
                    >
                        <source src={videoSource.url} type={videoSource.type} />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Central Play/Pause Button Overlay */}
                {playing && (
                    <div
                        className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
                        onClick={handlePlayPause}
                    >
                        <button className={`opacity-0 hover:opacity-100 transition-opacity duration-300 ${!showControls && 'opacity-0'}`}>
                            <div className="p-8 bg-black/50 rounded-full backdrop-blur-sm">
                                {playing ? (
                                    <FaPause className="text-5xl text-white" />
                                ) : (
                                    <FaPlay className="text-5xl text-white ml-2" />
                                )}
                            </div>
                        </button>
                    </div>
                )}

                {/* Initial Play Button Overlay */}
                {!playing && !hasUserInteracted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                        <button
                            onClick={handlePlayPause}
                            className="p-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full hover:scale-110 transition-all duration-300 transform mb-6 group"
                        >
                            <FaPlay className="text-5xl text-white ml-2 group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-3">{movie.title}</h2>
                            <p className="text-gray-300 text-lg mb-6 max-w-2xl">
                                Click the play button to start watching
                            </p>

                            {isMuxVideo && !videoLoaded && (
                                <div className="mb-4 p-3 bg-green-600/10 border border-green-600/30 rounded-lg max-w-md mx-auto">
                                    <p className="text-green-400 text-sm">
                                        {retryCount > 0
                                            ? `Trying format ${retryCount + 1}...`
                                            : 'Loading Mux stream...'}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-3">
                                {movie.year && (
                                    <span className="px-3 py-1 bg-red-600 rounded-full">
                                        {movie.year}
                                    </span>
                                )}
                                {movie.rating && (
                                    <span className="px-3 py-1 bg-yellow-600 rounded-full flex items-center gap-1">
                                        <FaStar /> {movie.rating}
                                    </span>
                                )}
                                {movie.duration && (
                                    <span className="px-3 py-1 bg-gray-700 rounded-full">
                                        {movie.duration}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Skip Buttons Overlay */}
                {playing && showControls && (
                    <div className="absolute inset-0 flex items-center justify-between px-8 z-10 pointer-events-none">
                        <button
                            onClick={handleSkipBackward}
                            className="pointer-events-auto p-4 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-all transform hover:scale-110 group"
                            title="Skip Back 15s (←)"
                        >
                            <div className="flex items-center gap-1">
                                <FaUndo className="text-2xl text-white" />
                                <span className="text-white font-bold text-lg">15</span>
                            </div>
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                -15 seconds
                            </div>
                        </button>

                        <button
                            onClick={handleSkipForward}
                            className="pointer-events-auto p-4 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-all transform hover:scale-110 group"
                            title="Skip Forward 30s (→)"
                        >
                            <div className="flex items-center gap-1">
                                <span className="text-white font-bold text-lg">30</span>
                                <FaRedo className="text-2xl text-white" />
                            </div>
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                +30 seconds
                            </div>
                        </button>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 z-10 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="max-w-7xl mx-auto">
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={progress}
                                onChange={handleSeek}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 hover:[&::-webkit-slider-thumb]:scale-125"
                            />
                            <div className="flex justify-between text-sm text-gray-300 mt-2">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Main Play/Pause Button */}
                                <button
                                    onClick={handlePlayPause}
                                    className="hover:text-red-500 transition-colors p-2"
                                    title={playing ? 'Pause (Space)' : 'Play (Space)'}
                                >
                                    {playing ? (
                                        <FaPause className="text-3xl" />
                                    ) : (
                                        <FaPlay className="text-3xl ml-1" />
                                    )}
                                </button>

                                {/* Skip Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRewind(10)}
                                        className="hover:text-red-500 transition-colors p-2"
                                        title="Rewind 10s (←)"
                                    >
                                        <FaBackward className="text-2xl" />
                                    </button>
                                    <button
                                        onClick={() => handleForward(10)}
                                        className="hover:text-red-500 transition-colors p-2"
                                        title="Forward 10s (→)"
                                    >
                                        <FaForward className="text-2xl" />
                                    </button>
                                </div>

                                {/* Volume Controls */}
                                <div className="flex items-center gap-3 ml-2">
                                    <button
                                        onClick={handleToggleMute}
                                        className="hover:text-red-500 transition-colors p-2"
                                        title={muted ? 'Unmute (M)' : 'Mute (M)'}
                                    >
                                        {muted || volume === 0 ? (
                                            <FaVolumeMute className="text-2xl" />
                                        ) : (
                                            <FaVolumeUp className="text-2xl" />
                                        )}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 hover:[&::-webkit-slider-thumb]:scale-125"
                                    />
                                </div>

                                {/* Time Display */}
                                <div className="text-lg font-medium ml-4">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Playback Rate Display */}
                                <div className="text-sm text-gray-300">
                                    {playbackRate}x
                                </div>

                                {/* Fullscreen Button */}
                                <button
                                    onClick={handleFullscreen}
                                    className="hover:text-red-500 transition-colors p-2"
                                    title="Fullscreen (F)"
                                >
                                    <FaExpand className="text-2xl" />
                                </button>
                            </div>
                        </div>

                        {/* Quick Seek Buttons */}
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-sm text-gray-400">Jump to:</span>
                            {[10, 25, 50, 75, 90].map(percent => (
                                <button
                                    key={percent}
                                    onClick={() => handleJumpToPercentage(percent)}
                                    className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded"
                                    title={`Jump to ${percent}%`}
                                >
                                    {percent}%
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Keyboard Shortcuts Helper */}
                {showControls && (
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-sm z-10">
                        <div className="text-gray-400 mb-2 text-xs">Keyboard Shortcuts</div>
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-gray-900 rounded text-xs">Space</kbd>
                                <span className="text-gray-300">Play/Pause</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-gray-900 rounded text-xs">← →</kbd>
                                <span className="text-gray-300">Seek 5s</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-gray-900 rounded text-xs">J L</kbd>
                                <span className="text-gray-300">Seek 10s</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-gray-900 rounded text-xs">F</kbd>
                                <span className="text-gray-300">Fullscreen</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-gray-900 rounded text-xs">M</kbd>
                                <span className="text-gray-300">Mute</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Movie Info Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

                        <div className="flex flex-wrap gap-3 mb-6">
                            {movie.year && (
                                <span className="px-4 py-2 bg-red-600 rounded-full text-sm font-semibold">
                                    {movie.year}
                                </span>
                            )}
                            {movie.rating && (
                                <span className="px-4 py-2 bg-yellow-600 rounded-full text-sm font-semibold flex items-center gap-2">
                                    <FaStar /> {movie.rating}
                                </span>
                            )}
                            {movie.duration && (
                                <span className="px-4 py-2 bg-gray-800 rounded-full text-sm">
                                    {movie.duration}
                                </span>
                            )}
                            {movie.category && (
                                <span className="px-4 py-2 bg-gray-800 rounded-full text-sm">
                                    {movie.category.split(',')[0]}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed">
                            {movie.description || 'No description available.'}
                        </p>

                        {/* Mux Info Box */}
                        {isMuxVideo && (
                            <div className="mt-6 p-5 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-600/20 rounded-lg">
                                        <FaCheckCircle className="text-green-400 text-xl" />
                                    </div>
                                    <div>
                                        <h4 className="text-green-300 font-semibold text-lg">Professional Mux Streaming</h4>
                                        <p className="text-green-200/80 text-sm">
                                            {videoLoaded ? 'Stream ready' : 'Loading stream...'} •
                                            {retryCount > 0 && ` Format ${retryCount + 1}`}
                                        </p>
                                    </div>
                                </div>
                                {playbackId && (
                                    <div className="mt-4 p-3 bg-black/30 rounded-lg">
                                        <div className="text-xs text-gray-400 mb-1">Mux Playback ID:</div>
                                        <code className="text-sm text-green-300 font-mono">{playbackId}</code>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Movie Details */}
                        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                            <h3 className="text-xl font-bold mb-4 pb-3 border-b border-gray-800">Movie Details</h3>

                            {movie.nation && (
                                <div className="mb-3">
                                    <span className="text-gray-400 text-sm">Country:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <FaGlobe className="text-blue-500" />
                                        <span className="text-white">{movie.nation}</span>
                                    </div>
                                </div>
                            )}

                            {movie.translator && (
                                <div className="mb-3">
                                    <span className="text-gray-400 text-sm">Translator:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <FaLanguage className="text-green-500" />
                                        <span className="text-white">{movie.translator}</span>
                                    </div>
                                </div>
                            )}

                            {movie.type && (
                                <div className="mb-3">
                                    <span className="text-gray-400 text-sm">Type:</span>
                                    <div className="mt-1">
                                        <span className={`px-3 py-1 rounded-full text-sm ${movie.type === 'series' ? 'bg-purple-600' : 'bg-red-600'}`}>
                                            {movie.type === 'series' ? 'TV Series' : 'Movie'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Streaming Info */}
                        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                            <h3 className="text-xl font-bold mb-4">Streaming Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${playing ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-gray-300">
                                        {playing ? 'Playing' : 'Paused'} • {isMuxVideo ? 'Mux' : 'Direct'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Speed:</span>
                                    <span className="text-white">{playbackRate}x</span>
                                </div>

                                {isMuxVideo && (
                                    <div className="space-y-2">
                                        <div className="p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                                            <p className="text-green-300 text-sm">
                                                ✓ Professional streaming with adaptive quality
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleRetryWithAlternative}
                                            disabled={retryCount >= 3}
                                            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                                        >
                                            <FaRedoAlt />
                                            {retryCount >= 3 ? 'All formats tried' : 'Try Different Format'}
                                        </button>
                                    </div>
                                )}

                                {videoSource.isFallback && (
                                    <div className="p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                                        <p className="text-yellow-400 text-sm">
                                            Using sample video. Add your Mux video URL in admin panel.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Technical Info */}
                        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                            <h3 className="text-xl font-bold mb-4">Technical Info</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`font-medium ${videoLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {videoLoaded ? 'Loaded' : 'Loading...'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Duration:</span>
                                    <span className="text-white">{formatTime(duration)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Current Time:</span>
                                    <span className="text-white">{formatTime(currentTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Provider:</span>
                                    <span className="text-white">
                                        {isMuxVideo ? 'Mux' : 'Direct'}
                                        {retryCount > 0 && ` (Format ${retryCount + 1})`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">URL Type:</span>
                                    <span className="text-white">{videoSource.type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;