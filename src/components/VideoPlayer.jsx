// components/VideoPlayer.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ videoData, type, onClose, fullPage = false }) => {
    const [playing, setPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const playerRef = useRef(null);
    const controlsTimeout = useRef(null);

    useEffect(() => {
        resetControlsTimer();
        return () => {
            if (controlsTimeout.current) {
                clearTimeout(controlsTimeout.current);
            }
        };
    }, []);

    const resetControlsTimer = () => {
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    const handleMouseMove = () => {
        setShowControls(true);
        resetControlsTimer();
    };

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    const handlePlaybackRate = (rate) => {
        setPlaybackRate(rate);
    };

    const handleProgress = (state) => {
        setPlayed(state.played);
    };

    const handleSeek = (value) => {
        setPlayed(parseFloat(value));
        if (playerRef.current) {
            playerRef.current.seekTo(parseFloat(value));
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

    if (!videoData) return null;

    return (
        <div
            className={`fixed inset-0 bg-black ${fullPage ? '' : 'bg-opacity-90'} z-50 flex flex-col`}
            onMouseMove={handleMouseMove}
            onClick={handleMouseMove}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Video container */}
            <div className="flex-grow relative">
                <ReactPlayer
                    ref={playerRef}
                    url={videoData.videoUrl}
                    playing={playing}
                    volume={volume}
                    playbackRate={playbackRate}
                    width="100%"
                    height="100%"
                    onProgress={handleProgress}
                    onDuration={setDuration}
                    onEnded={() => setPlaying(false)}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload',
                            },
                        },
                    }}
                />

                {/* Video overlay with controls */}
                {showControls && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 transition-opacity duration-300">
                        {/* Video info */}
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-white">{videoData.title}</h2>
                            <div className="flex items-center gap-4 text-gray-300 mt-2">
                                <span>{videoData.year}</span>
                                <span>•</span>
                                <span>{videoData.rating}</span>
                                <span>•</span>
                                <span>{type === 'movie' ? 'Movie' : 'Series'}</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={played}
                                onChange={(e) => handleSeek(e.target.value)}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                            />
                            <div className="flex justify-between text-sm text-gray-400 mt-1">
                                <span>{formatTime(played * duration)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePlayPause}
                                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-all"
                                >
                                    {playing ? (
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>

                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                    </svg>
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

                                <div className="flex items-center gap-2">
                                    <span className="text-white">Speed:</span>
                                    <select
                                        value={playbackRate}
                                        onChange={(e) => handlePlaybackRate(parseFloat(e.target.value))}
                                        className="bg-gray-800 text-white rounded px-2 py-1"
                                    >
                                        <option value={0.5}>0.5x</option>
                                        <option value={0.75}>0.75x</option>
                                        <option value={1}>Normal</option>
                                        <option value={1.25}>1.25x</option>
                                        <option value={1.5}>1.5x</option>
                                        <option value={2}>2x</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="text-white hover:text-red-400 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                                    </svg>
                                </button>
                                <button className="text-white hover:text-red-400 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;