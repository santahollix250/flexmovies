import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress,
    FaArrowLeft, FaDownload, FaHome, FaStar, FaForward, FaBackward,
    FaVideo, FaComment, FaHeart, FaPaperPlane, FaTrash, FaEdit, FaCheck, FaTimes
} from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

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
    const [isDailyMotionVideo, setIsDailyMotionVideo] = useState(false);
    const [dailyMotionId, setDailyMotionId] = useState('');

    // Comments state
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [userAvatar, setUserAvatar] = useState('');

    // Comments functions
    useEffect(() => {
        // Initialize user from localStorage
        const savedUser = localStorage.getItem('videoCommenter');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUserName(userData.name);
            setUserAvatar(userData.avatar);
        } else {
            // Generate random user
            const randomName = `User${Math.floor(Math.random() * 10000)}`;
            const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}`;
            setUserName(randomName);
            setUserAvatar(randomAvatar);
            localStorage.setItem('videoCommenter', JSON.stringify({
                name: randomName,
                avatar: randomAvatar
            }));
        }

        // Load comments if movie exists
        if (movie?.id) {
            fetchComments();
        }
    }, [movie]);

    // Fetch comments from Supabase
    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('movie_id', movie.id.toString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            // Fallback to localStorage if Supabase fails
            const localComments = localStorage.getItem(`comments_${movie.id}`);
            if (localComments) {
                setComments(JSON.parse(localComments));
            }
        }
    };

    // Submit new comment
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !userName.trim()) return;

        setIsSubmitting(true);
        const commentData = {
            movie_id: movie.id.toString(),
            user_name: userName,
            user_avatar: userAvatar,
            message: newComment.trim(),
            device_info: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                screen: `${window.screen.width}x${window.screen.height}`,
                timestamp: new Date().toISOString()
            },
            likes: 0
        };

        try {
            // Try Supabase first
            const { data, error } = await supabase
                .from('comments')
                .insert([commentData])
                .select();

            if (error) throw error;

            // Update local state
            setComments(prev => [data[0], ...prev]);
            setNewComment('');

            // Also save to localStorage as backup
            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            existingComments.unshift({
                ...commentData,
                id: Date.now(),
                created_at: new Date().toISOString()
            });
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(existingComments));

        } catch (error) {
            console.error('Error submitting comment:', error);

            // Fallback to localStorage
            const fallbackComment = {
                ...commentData,
                id: Date.now(),
                created_at: new Date().toISOString()
            };

            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            existingComments.unshift(fallbackComment);
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(existingComments));

            setComments(existingComments);
            setNewComment('');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Like a comment
    const handleLikeComment = async (commentId) => {
        try {
            const comment = comments.find(c => c.id === commentId);
            if (!comment) return;

            const updatedLikes = (comment.likes || 0) + 1;

            // Try Supabase update
            const { error } = await supabase
                .from('comments')
                .update({ likes: updatedLikes })
                .eq('id', commentId);

            if (error) throw error;

            // Update local state
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, likes: updatedLikes } : c
            ));

            // Update localStorage
            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            const updatedComments = existingComments.map(c =>
                c.id === commentId ? { ...c, likes: updatedLikes } : c
            );
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(updatedComments));

        } catch (error) {
            console.error('Error liking comment:', error);
            // Just update locally
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
            ));
        }
    };

    // Edit comment
    const handleEditComment = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.message);
    };

    // Save edited comment
    const handleSaveEdit = async (commentId) => {
        try {
            const { error } = await supabase
                .from('comments')
                .update({ message: editText.trim() })
                .eq('id', commentId);

            if (error) throw error;

            // Update local state
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, message: editText.trim() } : c
            ));

            // Update localStorage
            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            const updatedComments = existingComments.map(c =>
                c.id === commentId ? { ...c, message: editText.trim() } : c
            );
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(updatedComments));

            setEditingComment(null);
            setEditText('');
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            // Update local state
            setComments(prev => prev.filter(c => c.id !== commentId));

            // Update localStorage
            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            const updatedComments = existingComments.filter(c => c.id !== commentId);
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(updatedComments));

        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // Format timestamp
    const formatTimeAgo = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    // Update userName
    const updateUserName = (e) => {
        const newName = e.target.value;
        setUserName(newName);

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('videoCommenter') || '{}');
        userData.name = newName;
        localStorage.setItem('videoCommenter', JSON.stringify(userData));
    };

    // Detect video type
    const detectVideoType = (url) => {
        if (!url || typeof url !== 'string') return 'direct';

        // Check if it's a DailyMotion URL
        if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
            return 'dailymotion';
        }

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

    // Extract DailyMotion ID
    const extractDailyMotionId = (url) => {
        if (!url || typeof url !== 'string') return '';

        // Remove query parameters and fragments
        const cleanUrl = url.split('?')[0].split('#')[0];

        // Patterns for different DailyMotion URL formats
        const patterns = [
            /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
            /dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/,
            /dai\.ly\/([a-zA-Z0-9]+)/,
            /dailymotion\.com\/(?:swf|embed)\/video\/([a-zA-Z0-9]+)/,
            /\/\/www\.dailymotion\.com\/video\/([a-zA-Z0-9]+)_/
        ];

        for (const pattern of patterns) {
            const match = cleanUrl.match(pattern);
            if (match) return match[1];
        }

        // Try to extract from shortcode format
        if (/^[a-zA-Z0-9]+$/.test(url.trim())) {
            return url.trim();
        }

        return '';
    };

    // Play/Pause - Different behavior based on video type
    const handlePlayPause = useCallback((e) => {
        e?.stopPropagation();

        if (isVimeoVideo) {
            // Don't handle play/pause for Vimeo - let Vimeo controls handle it
            return;
        } else if (isDailyMotionVideo) {
            // Don't handle play/pause for DailyMotion - let DailyMotion controls handle it
            return;
        } else {
            // Handle HTML5 videos
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
        }

        showControlsWithTimer();
    }, [isVimeoVideo, isDailyMotionVideo]);

    // Other control functions - only for HTML5 videos
    const handleTimeUpdate = () => {
        if (videoRef.current && !isVimeoVideo && !isDailyMotionVideo) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration || 0;
            setCurrentTime(current);
            setProgress(total > 0 ? current / total : 0);
            setDuration(total);
        }
    };

    const handleVolumeChange = (e) => {
        e?.stopPropagation();
        if (isVimeoVideo || isDailyMotionVideo) {
            // Don't handle volume for embedded videos
            return;
        }
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setMuted(newVolume === 0);
        showControlsWithTimer();
    };

    const handleToggleMute = (e) => {
        e?.stopPropagation();
        if (isVimeoVideo || isDailyMotionVideo) {
            // Don't handle mute for embedded videos
            return;
        }
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setMuted(videoRef.current.muted);
        }
        showControlsWithTimer();
    };

    const handleSeek = (e) => {
        e?.stopPropagation();
        if (isVimeoVideo || isDailyMotionVideo) {
            // Don't handle seek for embedded videos
            return;
        }
        const seekTo = parseFloat(e.target.value);
        setProgress(seekTo);

        if (videoRef.current && !isNaN(videoRef.current.duration)) {
            const newTime = seekTo * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
        showControlsWithTimer();
    };

    const handleForward = (e, seconds = 10) => {
        e?.stopPropagation();
        if (isVimeoVideo || isDailyMotionVideo) {
            // Don't handle forward for embedded videos
            return;
        }
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handleRewind = (e, seconds = 10) => {
        e?.stopPropagation();
        if (isVimeoVideo || isDailyMotionVideo) {
            // Don't handle rewind for embedded videos
            return;
        }
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handlePlaybackRate = (rate, e) => {
        e?.stopPropagation();
        if (isVimeoVideo || isDailyMotionVideo) {
            // Don't handle playback rate for embedded videos
            return;
        }
        if (videoRef.current) {
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

            if (detectedType === 'dailymotion') {
                setIsDailyMotionVideo(true);
                setIsVimeoVideo(false);
                const dailymotionId = extractDailyMotionId(url);
                if (dailymotionId) {
                    setDailyMotionId(dailymotionId);
                    // DailyMotion embed WITH DailyMotion controls
                    const embedUrl = `https://www.dailymotion.com/embed/video/${dailymotionId}?autoplay=1&queue-autoplay-next=0&queue-enable=0&sharing-enable=0&ui-logo=0&ui-start-screen-info=0&controls=true`;
                    setVideoUrl(embedUrl);
                    console.log("🎬 Using DailyMotion embedded player WITH DailyMotion controls");
                } else {
                    setError("Invalid DailyMotion URL");
                }
            } else if (detectedType === 'vimeo') {
                setIsVimeoVideo(true);
                setIsDailyMotionVideo(false);
                const vimeoId = extractVimeoId(url);
                if (vimeoId) {
                    // Vimeo embed WITH Vimeo controls (controls=true)
                    const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=true`;
                    setVideoUrl(embedUrl);
                    console.log("🎬 Using Vimeo embedded player WITH Vimeo controls");
                } else {
                    setError("Invalid Vimeo URL");
                }
            } else {
                setIsVimeoVideo(false);
                setIsDailyMotionVideo(false);
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
        if (isDailyMotionVideo && dailyMotionId) {
            // DailyMotion embed - THEY handle controls
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
                            console.log("✅ DailyMotion iframe loaded WITH controls");
                            setVideoLoaded(true);
                            setPlaying(true);
                        }}
                    />
                </div>
            );
        } else if (isVimeoVideo) {
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
                            console.log("✅ Vimeo iframe loaded WITH controls");
                            setVideoLoaded(true);
                            setPlaying(true);
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

    // Render Comments Section - THIS WAS MISSING!
    const renderCommentsSection = () => (
        <div className="mt-8 bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                    <FaComment className="text-red-500" />
                    Comments ({comments.length})
                </h3>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                    {showComments ? 'Hide' : 'Show'} Comments
                </button>
            </div>

            {showComments && (
                <>
                    {/* Comment Form */}
                    <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={userAvatar}
                                alt={userName}
                                className="w-10 h-10 rounded-full border-2 border-red-600"
                                onError={(e) => {
                                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;
                                }}
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={updateUserName}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-2"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        <form onSubmit={handleSubmitComment} className="relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white resize-none"
                                placeholder="Share your thoughts about this movie..."
                                rows="3"
                                maxLength="500"
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-sm text-gray-400">
                                    {newComment.length}/500 characters
                                </span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane /> Post Comment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {comments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FaComment className="text-4xl mx-auto mb-3 opacity-50" />
                                <p>No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={comment.user_avatar}
                                            alt={comment.user_name}
                                            className="w-10 h-10 rounded-full border-2 border-red-600/50"
                                            onError={(e) => {
                                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_name}`;
                                            }}
                                        />

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <span className="font-bold text-white">
                                                        {comment.user_name}
                                                    </span>
                                                    <span className="text-xs text-gray-400 ml-2">
                                                        {formatTimeAgo(comment.created_at)}
                                                        {comment.device_info?.platform && (
                                                            <span className="ml-2">
                                                                • {comment.device_info.platform}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Comment actions - only for current user's comments */}
                                                {comment.user_name === userName && (
                                                    <div className="flex items-center gap-2">
                                                        {editingComment === comment.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveEdit(comment.id)}
                                                                    className="p-1 text-green-500 hover:text-green-400"
                                                                    title="Save"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingComment(null)}
                                                                    className="p-1 text-red-500 hover:text-red-400"
                                                                    title="Cancel"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditComment(comment)}
                                                                    className="p-1 text-blue-400 hover:text-blue-300"
                                                                    title="Edit"
                                                                >
                                                                    <FaEdit size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="p-1 text-red-500 hover:text-red-400"
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {editingComment === comment.id ? (
                                                <div className="mb-3">
                                                    <textarea
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                                        rows="2"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-gray-200 mb-3 whitespace-pre-wrap">
                                                    {comment.message}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleLikeComment(comment.id)}
                                                    className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <FaHeart className={comment.likes > 0 ? 'text-red-500' : ''} />
                                                    <span>{comment.likes || 0}</span>
                                                </button>

                                                {/* Device info icon */}
                                                {comment.device_info?.platform && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        {comment.device_info.platform.includes('Win') && '💻'}
                                                        {comment.device_info.platform.includes('Mac') && '🍎'}
                                                        {comment.device_info.platform.includes('Linux') && '🐧'}
                                                        {comment.device_info.platform.includes('iPhone') && '📱'}
                                                        {comment.device_info.platform.includes('Android') && '📱'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comments Statistics */}
                    {comments.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-800">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                                    <div className="text-2xl font-bold text-red-500">{comments.length}</div>
                                    <div className="text-sm text-gray-400">Total Comments</div>
                                </div>
                                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-500">
                                        {comments.reduce((sum, c) => sum + (c.likes || 0), 0)}
                                    </div>
                                    <div className="text-sm text-gray-400">Total Likes</div>
                                </div>
                                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                                    <div className="text-2xl font-bold text-green-500">
                                        {new Set(comments.map(c => c.user_name)).size}
                                    </div>
                                    <div className="text-sm text-gray-400">Unique Users</div>
                                </div>
                                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-500">
                                        {comments.filter(c => c.device_info?.platform?.includes('Mobile')).length}
                                    </div>
                                    <div className="text-sm text-gray-400">Mobile Users</div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    // Only show custom controls for HTML5 videos, not for Vimeo/DailyMotion
    const shouldShowCustomControls = !isVimeoVideo && !isDailyMotionVideo;

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

    // Get player type badge color and icon
    const getPlayerTypeInfo = () => {
        if (isDailyMotionVideo) {
            return {
                color: 'text-purple-400',
                bgColor: 'bg-purple-600',
                label: 'DailyMotion Player',
                text: 'text-purple-300',
                controls: 'Native DailyMotion Controls'
            };
        } else if (isVimeoVideo) {
            return {
                color: 'text-blue-400',
                bgColor: 'bg-blue-600',
                label: 'Vimeo Player',
                text: 'text-blue-300',
                controls: 'Native Vimeo Controls'
            };
        } else {
            return {
                color: 'text-green-400',
                bgColor: 'bg-green-600',
                label: 'Custom Player',
                text: 'text-green-300',
                controls: 'Custom Controls'
            };
        }
    };

    const playerType = getPlayerTypeInfo();

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
                                <FaVideo className={playerType.color} />
                                <span className={`text-sm ${playerType.text}`}>
                                    {playerType.label} - {playerType.controls}
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
                onMouseMove={shouldShowCustomControls ? showControlsWithTimer : undefined}
                onClick={(e) => {
                    // Only toggle play/pause for HTML5 videos
                    if (shouldShowCustomControls && !e.target.closest('button')) {
                        handlePlayPause(e);
                    }
                    if (shouldShowCustomControls) {
                        showControlsWithTimer();
                    }
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
                {shouldShowCustomControls && videoLoaded && !playing && (
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
                {shouldShowCustomControls && (
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

                {/* Platform Info - Show for embedded videos */}
                {!shouldShowCustomControls && showControls && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-500/30 z-30">
                        <div className="flex items-center gap-2">
                            <FaVideo className={playerType.color} />
                            <span className="text-white text-sm">
                                {isDailyMotionVideo ? 'Using DailyMotion Player with Native Controls' : 'Using Vimeo Player with Native Controls'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Movie Info and Comments Section */}
            {!isFullscreen && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {movie.year && <span className="px-4 py-2 bg-red-600 rounded-full">{movie.year}</span>}
                                {movie.rating && <span className="px-4 py-2 bg-yellow-600 rounded-full flex items-center gap-2"><FaStar /> {movie.rating}</span>}
                                <span className={`px-4 py-2 ${playerType.bgColor} rounded-full`}>
                                    {playerType.label}
                                </span>
                                <span className="px-4 py-2 bg-gray-700 rounded-full">
                                    {playerType.controls}
                                </span>
                            </div>
                            <p className="text-gray-300 mb-6">{movie.description || 'No description'}</p>

                            {/* Player Status Card */}
                            <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FaVideo className={playerType.color} />
                                    <div>
                                        <h4 className="text-white font-medium">Player Information</h4>
                                        <p className="text-gray-300 text-sm">
                                            {isDailyMotionVideo
                                                ? 'This video is hosted on DailyMotion and uses DailyMotion\'s native player controls.'
                                                : isVimeoVideo
                                                    ? 'This video is hosted on Vimeo and uses Vimeo\'s native player controls.'
                                                    : 'This video uses our custom player controls with play, pause, volume, and seek functionality.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {renderCommentsSection()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Player;