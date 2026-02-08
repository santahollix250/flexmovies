// src/components/Player.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaPlay,
    FaPause,
    FaVolumeUp,
    FaVolumeMute,
    FaExpand,
    FaCompress,
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
    FaCog,
    FaTimes,
    FaComment,
    FaHeart,
    FaPaperPlane,
    FaTrash,
    FaEdit,
    FaCheck,
    FaUserCircle,
    FaMobileAlt,
    FaDesktop
} from 'react-icons/fa';

// Import Supabase client
import { supabase } from '../lib/supabaseClient';

const Player = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState('auto');
    const [videoQualities, setVideoQualities] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    // Comment section states
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [isTypingComment, setIsTypingComment] = useState(false);

    // Quality options
    const qualityOptions = [
        { label: 'Auto', value: 'auto' },
        { label: '1080p', value: '1080' },
        { label: '720p', value: '720' },
        { label: '480p', value: '480' },
        { label: '360p', value: '360' },
        { label: '240p', value: '240' }
    ];

    // Check if device is mobile
    const checkIsMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

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

    // Generate Mux quality URLs
    const getMuxQualityUrls = (playbackId) => {
        if (!playbackId) return [];

        const qualities = [
            { label: '1080p', value: '1080', url: `https://stream.mux.com/${playbackId}.m3u8` },
            { label: '720p', value: '720', url: `https://stream.mux.com/${playbackId}.m3u8` },
            { label: '480p', value: '480', url: `https://stream.mux.com/${playbackId}.m3u8` },
            { label: '360p', value: '360', url: `https://stream.mux.com/${playbackId}.m3u8` },
            { label: '240p', value: '240', url: `https://stream.mux.com/${playbackId}.m3u8` }
        ];

        return qualities;
    };

    // Comment functions
    const fetchComments = async () => {
        if (!movie?.id) return;

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
            // Fallback to localStorage
            const localComments = localStorage.getItem(`comments_${movie.id}`);
            if (localComments) {
                setComments(JSON.parse(localComments));
            }
        }
    };

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
            const { data, error } = await supabase
                .from('comments')
                .insert([commentData])
                .select();

            if (error) throw error;

            setComments(prev => [data[0], ...prev]);
            setNewComment('');

            // Update localStorage as backup
            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            existingComments.unshift({
                ...commentData,
                id: data[0].id,
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

    const handleLikeComment = async (commentId) => {
        try {
            const comment = comments.find(c => c.id === commentId);
            if (!comment) return;

            const updatedLikes = (comment.likes || 0) + 1;

            const { error } = await supabase
                .from('comments')
                .update({ likes: updatedLikes })
                .eq('id', commentId);

            if (error) throw error;

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
            // Update locally
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
            ));
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.message);
    };

    const handleSaveEdit = async (commentId) => {
        try {
            const { error } = await supabase
                .from('comments')
                .update({ message: editText.trim() })
                .eq('id', commentId);

            if (error) throw error;

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

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            setComments(prev => prev.filter(c => c.id !== commentId));

            // Update localStorage
            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            const updatedComments = existingComments.filter(c => c.id !== commentId);
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(updatedComments));

        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

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

    const updateUserName = (e) => {
        const newName = e.target.value;
        setUserName(newName);

        const userData = JSON.parse(localStorage.getItem('videoCommenter') || '{}');
        userData.name = newName;
        localStorage.setItem('videoCommenter', JSON.stringify(userData));
    };

    // Handle typing state for comment fields
    const handleCommentFocus = () => {
        setIsTypingComment(true);
        setShowControls(true); // Show controls when typing
    };

    const handleCommentBlur = () => {
        setIsTypingComment(false);
    };

    // Mobile-friendly fullscreen function
    const handleFullscreen = () => {
        const element = playerContainerRef.current;
        if (!element) return;

        // For iOS Safari, use video element's webkitEnterFullscreen
        if (isMobile && videoRef.current && videoRef.current.webkitEnterFullscreen) {
            try {
                videoRef.current.webkitEnterFullscreen();
                setIsFullscreen(true);
                // On iOS, show controls permanently in fullscreen
                setShowControls(true);
                return;
            } catch (err) {
                console.error('iOS fullscreen error:', err);
            }
        }

        // For Android Chrome and other mobile browsers
        if (isMobile) {
            try {
                // Try standard fullscreen first
                if (element.requestFullscreen) {
                    element.requestFullscreen().then(() => {
                        setIsFullscreen(true);
                        // Lock orientation on mobile
                        if (screen.orientation && screen.orientation.lock) {
                            screen.orientation.lock('landscape').catch(e => {
                                console.log('Orientation lock not supported:', e);
                            });
                        }
                    }).catch(err => {
                        console.error('Mobile fullscreen error:', err);
                        // Fallback: Toggle a mobile fullscreen class
                        element.classList.toggle('mobile-fullscreen');
                        setIsFullscreen(element.classList.contains('mobile-fullscreen'));
                        setShowControls(true);
                    });
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                    setIsFullscreen(true);
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                    setIsFullscreen(true);
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                    setIsFullscreen(true);
                }
            } catch (err) {
                console.error('Mobile fullscreen fallback error:', err);
                // Ultimate fallback for mobile
                document.documentElement.requestFullscreen().catch(e => {
                    console.log('Document fullscreen failed:', e);
                });
            }
            return;
        }

        // Desktop fullscreen
        if (!document.fullscreenElement) {
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        showControlsWithTimer();
    };

    // Handle missing movie data
    useEffect(() => {
        console.log("🎬 Player Component - Movie Data:", movie);
        console.log("🎬 Original Video URL:", movie?.videoUrl);
        console.log("🎬 Download Link:", movie?.download_link);

        // Check if device is mobile
        setIsMobile(checkIsMobile());
        console.log("📱 Is Mobile Device:", checkIsMobile());

        if (!movie) {
            console.log("❌ No movie data found");
            setError("No movie selected. Please go back and select a movie.");
            setLoading(false);
            return;
        }

        // Initialize user for comments
        const savedUser = localStorage.getItem('videoCommenter');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUserName(userData.name);
            setUserAvatar(userData.avatar);
        } else {
            const randomName = `User${Math.floor(Math.random() * 10000)}`;
            const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}`;
            setUserName(randomName);
            setUserAvatar(randomAvatar);
            localStorage.setItem('videoCommenter', JSON.stringify({
                name: randomName,
                avatar: randomAvatar
            }));
        }

        // Load comments
        fetchComments();

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

                const qualities = getMuxQualityUrls(playbackId);
                setVideoQualities(qualities);

                const muxUrls = [
                    url,
                    getMuxHlsUrl(playbackId),
                    url.replace('.mp4', '.m3u8'),
                    url.replace('.m3u8', '.mp4'),
                ].filter(Boolean);

                console.log("🔄 Testing Mux URLs:", muxUrls);
                setVideoUrl(muxUrls[0]);
            } else {
                setVideoUrl(url);
                setVideoQualities([
                    { label: 'Auto', value: 'auto', url: url },
                    { label: 'Original', value: 'original', url: url }
                ]);
            }
            setLoading(false);
        } else {
            setError("Video URL not found for this movie.");
            setLoading(false);
        }

        // Auto-hide controls after 3 seconds
        resetControlsTimer();

        // Listen for fullscreen change
        const handleFullscreenChange = () => {
            const isFull = !!(document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement);
            setIsFullscreen(isFull);

            if (isFull && playing) {
                // On mobile, keep controls visible longer
                if (isMobile) {
                    setTimeout(() => setShowControls(false), 5000);
                } else {
                    setTimeout(() => setShowControls(false), 1000);
                }
            }

            // Unlock orientation when exiting fullscreen on mobile
            if (!isFull && isMobile && screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        };

        // Handle orientation change on mobile
        const handleOrientationChange = () => {
            if (isMobile) {
                // On mobile, entering landscape usually means fullscreen video
                const isLandscape = Math.abs(window.orientation) === 90;
                if (isLandscape && !isFullscreen) {
                    setIsFullscreen(true);
                    setShowControls(true);
                } else if (!isLandscape && isFullscreen) {
                    setIsFullscreen(false);
                    setShowControls(true);
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        // Add orientation change listener for mobile
        if (isMobile) {
            window.addEventListener('orientationchange', handleOrientationChange);
        }

        // Handle click events for mobile controls
        const handleMobileClick = () => {
            if (isMobile && playing) {
                setShowControls(true);
                resetControlsTimer();
            }
        };

        if (isMobile) {
            document.addEventListener('click', handleMobileClick);
            document.addEventListener('touchstart', handleMobileClick);
        }

        return () => {
            if (controlsTimerRef.current) {
                clearTimeout(controlsTimerRef.current);
            }
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

            if (isMobile) {
                window.removeEventListener('orientationchange', handleOrientationChange);
                document.removeEventListener('click', handleMobileClick);
                document.removeEventListener('touchstart', handleMobileClick);
            }
        };
    }, [movie, retryCount]);

    // Reset controls hide timer
    const resetControlsTimer = () => {
        if (controlsTimerRef.current) {
            clearTimeout(controlsTimerRef.current);
        }

        controlsTimerRef.current = setTimeout(() => {
            if (playing && isFullscreen) {
                // On mobile, hide controls slower
                if (isMobile) {
                    setShowControls(false);
                } else {
                    setShowControls(false);
                }
            }
        }, isMobile ? 4000 : 3000);
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

                    // On mobile, ensure video plays inline
                    if (isMobile) {
                        videoRef.current.setAttribute('playsinline', '');
                        videoRef.current.setAttribute('webkit-playsinline', '');
                    }
                }).catch(err => {
                    console.error("❌ Play error:", err);
                    setError(`Failed to play video: ${err.message}. Try using a different browser or check the video URL.`);

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

        const formats = [
            `https://stream.mux.com/${playbackId}.mp4`,
            `https://stream.mux.com/${playbackId}.m3u8`
        ];

        const nextUrl = formats[retryCount % formats.length];
        console.log(`🔄 Retrying with format ${retryCount + 1}:`, nextUrl);
        setVideoUrl(nextUrl);
        setError(`Trying alternative format (${retryCount + 1}/3)...`);

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

    // Handle quality change
    const handleQualityChange = (quality) => {
        setSelectedQuality(quality);
        setShowSettings(false);

        if (quality === 'auto') {
            const url = movie?.videoUrl || movie?.streamLink || '';
            setVideoUrl(url);
        } else {
            const qualityObj = videoQualities.find(q => q.value === quality);
            if (qualityObj && qualityObj.url) {
                setVideoUrl(qualityObj.url);
            }
        }

        showControlsWithTimer();
    };

    // Fixed: Use download_link from admin form
    const handleDownload = () => {
        if (movie?.download_link) {
            console.log("⬇️ Download link clicked:", movie.download_link);
            window.open(movie.download_link, '_blank');
        } else {
            console.log("⚠️ No download link available");
            alert('Download link not available for this movie.');
        }
    };

    // Handle user interaction
    const handleUserInteraction = () => {
        if (!hasUserInteracted) {
            setHasUserInteracted(true);
            if (videoRef.current) {
                // On mobile, ensure playsinline attributes are set
                if (isMobile) {
                    videoRef.current.setAttribute('playsinline', '');
                    videoRef.current.setAttribute('webkit-playsinline', '');
                }

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

    // Keyboard shortcuts - disabled on mobile
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Disable shortcuts on mobile
            if (isMobile) return;

            // Disable shortcuts when typing in comment field
            if (isTypingComment) {
                // Allow only basic editing shortcuts and Escape to exit edit mode
                if (e.key === 'Escape') {
                    // Escape should work to exit edit mode
                    if (editingComment) {
                        setEditingComment(null);
                        setEditText('');
                        return;
                    }
                    return;
                }
                if (
                    e.key === 'Tab' ||
                    (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a' || e.key === 'z')) ||
                    (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a' || e.key === 'z'))
                ) {
                    return; // Allow these keys for editing
                }
                // Prevent all other player shortcuts when typing
                return;
            }

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
                case 'Escape':
                    break;
                default:
                    return;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [playing, playbackRate, isTypingComment, editingComment, isMobile]);

    // Get video source with fallbacks
    const getVideoSource = () => {
        if (!videoUrl || videoUrl.trim() === '') {
            return {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                type: 'video/mp4',
                isFallback: true
            };
        }

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
                    {isMobile && (
                        <p className="text-blue-400 text-sm mt-1">Mobile mode activated</p>
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
            {/* Top Navigation Bar - Hide in fullscreen */}
            {!isFullscreen && (
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
                            {/* Fixed: Download button shows when download_link exists */}
                            {movie?.download_link && (
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

                            {/* Device indicator */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-600/30 rounded-full text-sm">
                                {isMobile ? (
                                    <>
                                        <FaMobileAlt className="text-blue-400 text-xs" />
                                        <span className="text-blue-300">Mobile</span>
                                    </>
                                ) : (
                                    <>
                                        <FaDesktop className="text-blue-400 text-xs" />
                                        <span className="text-blue-300">Desktop</span>
                                    </>
                                )}
                            </div>

                            {/* Playback Rate Selector - Hide on mobile */}
                            {!isMobile && (
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
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Player Container */}
            <div
                ref={playerContainerRef}
                className={`player-container relative w-full ${isMobile ? 'h-[60vh]' : 'h-screen'} bg-black ${isFullscreen && isMobile ? 'mobile-fullscreen-active' : ''}`}
                onMouseMove={showControlsWithTimer}
                onClick={handleUserInteraction}
                onMouseLeave={() => {
                    if (playing && isFullscreen && !isMobile) {
                        setTimeout(() => setShowControls(false), 1000);
                    }
                }}
                style={isFullscreen && isMobile ? {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999,
                    backgroundColor: '#000'
                } : {}}
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
                            // Auto-hide controls in fullscreen
                            if (isFullscreen) {
                                setTimeout(() => setShowControls(false), isMobile ? 4000 : 3000);
                            }
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
                        webkit-playsinline="true"
                        preload="auto"
                        crossOrigin="anonymous"
                        poster={movie?.poster || muxThumbnail}
                        style={isMobile ? {
                            objectFit: isFullscreen ? 'contain' : 'cover'
                        } : {}}
                    >
                        <source src={videoSource.url} type={videoSource.type} />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Mobile Fullscreen Hint */}
                {isMobile && !isFullscreen && playing && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2">
                            <FaExpand className="text-xs" />
                            <span>Tap to enter fullscreen</span>
                        </div>
                    </div>
                )}

                {/* Central Play/Pause Button Overlay - Only show in fullscreen when controls are hidden */}
                {playing && isFullscreen && !showControls && (
                    <div
                        className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
                        onClick={handlePlayPause}
                    >
                        <button className="opacity-0 hover:opacity-100 transition-opacity duration-300">
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

                            {/* Show Download Button in Initial Overlay */}
                            {movie?.download_link && (
                                <button
                                    onClick={handleDownload}
                                    className="mb-4 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium flex items-center gap-2 mx-auto transition-colors"
                                >
                                    <FaDownload /> Download Movie
                                </button>
                            )}

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

                {/* Settings/Quality Menu - Simplified for mobile */}
                {showSettings && (
                    <div className={`absolute ${isMobile ? 'bottom-20 left-4 right-4' : 'bottom-16 right-4'} bg-gray-900/95 backdrop-blur-lg rounded-lg p-4 z-30 shadow-2xl min-w-[180px] border border-gray-700`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-semibold">Quality</h3>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="space-y-1">
                            {qualityOptions.map((quality) => (
                                <button
                                    key={quality.value}
                                    onClick={() => handleQualityChange(quality.value)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedQuality === quality.value
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{quality.label}</span>
                                        {selectedQuality === quality.value && (
                                            <FaCheckCircle className="text-xs" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {!isMobile && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <div className="text-xs text-gray-400 mb-2">Playback Speed</div>
                                <div className="grid grid-cols-3 gap-1">
                                    {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(rate => (
                                        <button
                                            key={rate}
                                            onClick={() => handlePlaybackRate(rate)}
                                            className={`px-2 py-1 text-xs rounded ${playbackRate === rate
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                                }`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Controls - Show/hide based on fullscreen */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 z-20 ${showControls
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}>
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
                                style={isMobile ? {
                                    height: '6px'
                                } : {}}
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
                                        <FaPause className={`${isMobile ? 'text-2xl' : 'text-3xl'}`} />
                                    ) : (
                                        <FaPlay className={`${isMobile ? 'text-2xl ml-0.5' : 'text-3xl ml-1'}`} />
                                    )}
                                </button>

                                {/* Skip Controls - Hide on mobile */}
                                {!isMobile && (
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
                                )}

                                {/* Volume Controls - Hide on mobile */}
                                {!isMobile && (
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
                                )}

                                {/* Time Display */}
                                <div className="text-lg font-medium ml-4">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Quality Display */}
                                <div className="text-sm text-gray-300">
                                    {qualityOptions.find(q => q.value === selectedQuality)?.label || 'Auto'}
                                </div>

                                {/* Settings Button - Hide on mobile */}
                                {!isMobile && (
                                    <button
                                        onClick={() => setShowSettings(!showSettings)}
                                        className="hover:text-red-500 transition-colors p-2"
                                        title="Settings"
                                    >
                                        <FaCog className="text-2xl" />
                                    </button>
                                )}

                                {/* Fullscreen Button */}
                                <button
                                    onClick={handleFullscreen}
                                    className="hover:text-red-500 transition-colors p-2"
                                    title={`${isFullscreen ? 'Exit' : 'Enter'} Fullscreen ${!isMobile ? '(F)' : ''}`}
                                >
                                    {isFullscreen ? (
                                        <FaCompress className={`${isMobile ? 'text-xl' : 'text-2xl'}`} />
                                    ) : (
                                        <FaExpand className={`${isMobile ? 'text-xl' : 'text-2xl'}`} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Quick Seek Buttons - Hide in fullscreen and on mobile */}
                        {!isFullscreen && !isMobile && (
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
                        )}
                    </div>
                </div>

                {/* Fullscreen overlay message */}
                {isFullscreen && !showControls && playing && (
                    <div className="absolute top-4 left-0 right-0 text-center z-10">
                        <div className="inline-block bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300">
                            {isMobile ? 'Tap screen to show controls' : 'Move mouse or press any key to show controls'}
                        </div>
                    </div>
                )}
            </div>

            {/* Movie Info Section - Hide in fullscreen */}
            {!isFullscreen && (
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

                            {/* Download Button in Info Section */}
                            {movie?.download_link && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
                                    >
                                        <FaDownload className="text-xl" />
                                        <div className="text-left">
                                            <div className="font-bold">Download Movie</div>
                                            <div className="text-sm font-normal opacity-90">Click to download the video file</div>
                                        </div>
                                    </button>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Direct download link provided by the content provider
                                    </p>
                                </div>
                            )}

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

                            {/* Comment Section */}
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
                                                        onFocus={handleCommentFocus}
                                                        onBlur={handleCommentBlur}
                                                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-2"
                                                        placeholder="Your name"
                                                    />
                                                </div>
                                            </div>

                                            <form onSubmit={handleSubmitComment} className="relative">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    onFocus={handleCommentFocus}
                                                    onBlur={handleCommentBlur}
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

                                                                    {/* Comment actions */}
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
                                                                            onFocus={handleCommentFocus}
                                                                            onBlur={handleCommentBlur}
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

                                {/* Download Link Info */}
                                {movie?.download_link && (
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaDownload className="text-green-500" />
                                            <span className="text-green-300 font-medium">Download Available</span>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            This movie has a direct download link provided by the admin.
                                        </p>
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
                                            {isMobile && ' • 📱'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Speed:</span>
                                        <span className="text-white">{playbackRate}x</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Quality:</span>
                                        <span className="text-white">
                                            {qualityOptions.find(q => q.value === selectedQuality)?.label || 'Auto'}
                                        </span>
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
                                        <span className="text-gray-400">Quality:</span>
                                        <span className="text-white">
                                            {qualityOptions.find(q => q.value === selectedQuality)?.label || 'Auto'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Download:</span>
                                        <span className={`font-medium ${movie?.download_link ? 'text-green-400' : 'text-gray-400'}`}>
                                            {movie?.download_link ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Device:</span>
                                        <span className="text-blue-300">
                                            {isMobile ? 'Mobile' : 'Desktop'}
                                        </span>
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