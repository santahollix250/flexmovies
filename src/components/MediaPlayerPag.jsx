// pages/VideoPlayerPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaStepBackward, FaStepForward, FaHome, FaArrowLeft } from 'react-icons/fa';

const VideoPlayerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const playerRef = useRef(null);

    const [playing, setPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        // Get video data from location state or params
        if (location.state?.movie) {
            setVideoData(location.state.movie);
            setLoading(false);
        } else if (params.id) {
            // Fetch video data based on ID
            fetchVideoData(params.id, params.type);
        } else {
            // No video data, redirect home
            navigate('/');
        }

        // Auto-hide controls
        const timer = setTimeout(() => {
            setShowControls(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [location, params, navigate]);

    const fetchVideoData = async (id, type) => {
        try {
            // Mock data - replace with actual API call
            const mockData = {
                id: id,
                title: `Sample ${type === 'series' ? 'Series' : 'Movie'} Title`,
                streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=300&fit=crop',
                description: `This is a sample ${type} description.`,
                rating: 'PG-13',
                year: '2024',
                category: type === 'series' ? 'Drama, Action' : 'Action, Adventure',
                type: type || 'movie'
            };
            setVideoData(mockData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching video:', error);
            navigate('/');
        }
    };

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume === 0) {
            setMuted(true);
        } else {
            setMuted(false);
        }
    };

    const handleSeekChange = (e) => {
        const value = parseFloat(e.target.value);
        setPlayed(value);
        if (playerRef.current) {
            playerRef.current.seekTo(value);
        }
    };

    const handleProgress = (state) => {
        setPlayed(state.played);
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

    const formatTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds();

        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
        }
        return `${mm}:${ss.toString().padStart(2, '0')}`;
    };

    const handleBack10 = () => {
        if (playerRef.current) {
            playerRef.current.seekTo(played - 0.1);
        }
    };

    const handleForward10 = () => {
        if (playerRef.current) {
            playerRef.current.seekTo(played + 0.1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading video player...</p>
                </div>
            </div>
        );
    }

    if (!videoData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl text-white mb-4">Video not found</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-black relative"
            onMouseMove={() => {
                setShowControls(true);
                const timer = setTimeout(() => setShowControls(false), 3000);
                return () => clearTimeout(timer);
            }}
        >
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
            >
                <FaArrowLeft className="text-white text-xl" />
            </button>

            {/* Home Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-16 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
            >
                <FaHome className="text-white text-xl" />
            </button>

            {/* Video Player Container */}
            <div className="relative pt-16">
                <ReactPlayer
                    ref={playerRef}
                    url={videoData.streamUrl}
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    width="100%"
                    height="calc(100vh - 64px)"
                    onProgress={handleProgress}
                    onDuration={setDuration}
                    onEnded={() => {
                        setPlaying(false);
                        // Optional: Play next video
                    }}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload',
                                disablePictureInPicture: true,
                            },
                        },
                    }}
                />

                {/* Video Overlay Controls */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>

                    {/* Video Info */}
                    <div className="absolute top-20 left-8 right-8">
                        <h1 className="text-3xl font-bold text-white mb-2">{videoData.title}</h1>
                        <div className="flex items-center gap-4 text-gray-300">
                            <span>{videoData.year}</span>
                            <span>•</span>
                            <span>{videoData.rating}</span>
                            <span>•</span>
                            <span className="capitalize">{videoData.type}</span>
                        </div>
                    </div>

                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={handleBack10}
                                className="p-4 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                            >
                                <FaStepBackward className="text-white text-2xl" />
                            </button>

                            <button
                                onClick={handlePlayPause}
                                className="p-6 bg-red-600 hover:bg-red-700 rounded-full transition-all"
                            >
                                {playing ? (
                                    <FaPause className="text-white text-3xl" />
                                ) : (
                                    <FaPlay className="text-white text-3xl ml-1" />
                                )}
                            </button>

                            <button
                                onClick={handleForward10}
                                className="p-4 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                            >
                                <FaStepForward className="text-white text-2xl" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-8 left-8 right-8">
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={played}
                                onChange={handleSeekChange}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                            />
                            <div className="flex justify-between text-sm text-gray-300 mt-1">
                                <span>{formatTime(played * duration)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePlayPause}
                                    className="flex items-center gap-2 text-white hover:text-red-400"
                                >
                                    {playing ? (
                                        <>
                                            <FaPause /> Pause
                                        </>
                                    ) : (
                                        <>
                                            <FaPlay /> Play
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => setMuted(!muted)}>
                                        {muted ? (
                                            <FaVolumeMute className="text-white hover:text-red-400" />
                                        ) : (
                                            <FaVolumeUp className="text-white hover:text-red-400" />
                                        )}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleFullscreen}
                                    className="text-white hover:text-red-400"
                                >
                                    {fullscreen ? <FaCompress /> : <FaExpand />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Info Panel */}
            <div className="p-8 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Description */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-4">About This {videoData.type === 'series' ? 'Series' : 'Movie'}</h2>
                        <p className="text-gray-300 mb-6">{videoData.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {videoData.category?.split(',').map((cat, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                                    {cat.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Info */}
                    <div className="space-y-4">
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Type:</span>
                                    <span className="text-white capitalize">{videoData.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Year:</span>
                                    <span className="text-white">{videoData.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Rating:</span>
                                    <span className="text-white">{videoData.rating}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handlePlayPause}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
                            >
                                {playing ? 'PAUSE' : 'PLAY'}
                            </button>
                            <button
                                onClick={handleFullscreen}
                                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                            >
                                {fullscreen ? <FaCompress /> : <FaExpand />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerPage;