import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress,
    FaArrowLeft, FaDownload, FaHome, FaStar, FaForward, FaBackward,
    FaVideo, FaComment, FaHeart, FaPaperPlane, FaTrash, FaEdit, FaCheck, FaTimes,
    FaSpinner, FaExclamationTriangle, FaCloudDownloadAlt, FaFileDownload,
    FaChevronDown, FaChevronUp, FaLink, FaHdd, FaFilm, FaTv, FaFire, FaClock,
    FaCalendarAlt, FaPlayCircle, FaChevronRight, FaChevronLeft
} from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { MoviesContext } from '../context/MoviesContext';

const Player = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { movies, episodes } = useContext(MoviesContext);

    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const youtubeContainerRef = useRef(null);
    const controlsTimerRef = useRef(null);

    // YouTube specific states
    const [youTubePlayer, setYouTubePlayer] = useState(null);
    const [youTubeApiReady, setYouTubeApiReady] = useState(false);

    // Get movie data from location state or find from context using ID
    const [movie, setMovie] = useState(location.state?.movie || null);
    const [videoUrl, setVideoUrl] = useState('');
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [videoType, setVideoType] = useState('direct');
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile] = useState(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    const [isVimeoVideo, setIsVimeoVideo] = useState(false);
    const [isDailyMotionVideo, setIsDailyMotionVideo] = useState(false);
    const [dailyMotionId, setDailyMotionId] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [useEmbed, setUseEmbed] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [youtubeId, setYoutubeId] = useState('');

    // Comments state
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [userAvatar, setUserAvatar] = useState('');

    // Related movies state
    const [relatedMovies, setRelatedMovies] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const scrollContainerRef = useRef(null);

    // Try to find movie from context if not in state
    useEffect(() => {
        if (!movie && id && movies.length > 0) {
            const foundMovie = movies.find(m => m.id === id || m.id === parseInt(id));
            if (foundMovie) {
                setMovie(foundMovie);
                setError('');
            } else {
                setError("Movie not found");
            }
        } else if (!movie && !id) {
            setError("No movie selected");
        }
    }, [movie, id, movies]);

    // ===== RELATED MOVIES FUNCTIONALITY =====
    useEffect(() => {
        if (movie && movies.length > 0) {
            findRelatedMovies();
        }
    }, [movie, movies]);

    // Mobile scroll handlers for related movies
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const findRelatedMovies = () => {
        setRelatedLoading(true);

        if (!movie || !movies || movies.length === 0) {
            setRelatedLoading(false);
            return;
        }

        // Get current movie categories
        const currentCategories = movie.category ?
            movie.category.split(',').map(cat => cat.trim().toLowerCase()) : [];

        // Get current movie year
        const currentYear = movie.year ? parseInt(movie.year) : null;

        // Get current movie ID (for excluding)
        const currentMovieId = movie.id;

        // Score each movie for relevance
        const scoredMovies = movies
            .filter(m => m.id !== currentMovieId && m.type === "movie") // Exclude current movie and only movies
            .map(otherMovie => {
                let score = 0;

                // Get other movie categories
                const otherCategories = otherMovie.category ?
                    otherMovie.category.split(',').map(cat => cat.trim().toLowerCase()) : [];

                // Score 1: Category matches (highest weight)
                const commonCategories = currentCategories.filter(cat =>
                    otherCategories.includes(cat)
                );
                score += commonCategories.length * 10;

                // Score 2: Same year (medium weight)
                const otherYear = otherMovie.year ? parseInt(otherMovie.year) : null;
                if (currentYear && otherYear && Math.abs(currentYear - otherYear) <= 2) {
                    score += 5;
                }

                // Score 3: Has high rating (bonus)
                if (otherMovie.rating && parseFloat(otherMovie.rating) >= 8) {
                    score += 3;
                }

                // Score 4: Has background image (featured content)
                if (otherMovie.background) {
                    score += 2;
                }

                return {
                    movie: otherMovie,
                    score
                };
            })
            .filter(item => item.score > 0) // Only keep relevant movies
            .sort((a, b) => b.score - a.score) // Sort by score descending
            .slice(0, 8) // Take top 8 only (enough for display)
            .map(item => item.movie); // Extract just the movie objects

        // If we don't have enough related movies by scoring, add some popular ones
        if (scoredMovies.length < 6) {
            const popularMovies = movies
                .filter(m =>
                    m.id !== currentMovieId &&
                    m.type === "movie" &&
                    !scoredMovies.some(sm => sm.id === m.id) && // Not already in scored list
                    (m.background || (m.rating && parseFloat(m.rating) >= 7.5)) // Popular criteria
                )
                .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
                .slice(0, 6 - scoredMovies.length);

            setRelatedMovies([...scoredMovies, ...popularMovies]);
        } else {
            setRelatedMovies(scoredMovies);
        }

        setRelatedLoading(false);
    };

    const handleRelatedMovieClick = (relatedMovie) => {
        // Save current progress/state if needed
        // Navigate to the new movie player
        navigate(`/player/${relatedMovie.id}`, {
            state: { movie: relatedMovie },
            replace: false // Allow going back to previous movie
        });
    };

    // Format helper for movie metadata
    const formatMovieMeta = (movie) => {
        const parts = [];
        if (movie.year) parts.push(movie.year);
        if (movie.rating) parts.push(`★ ${movie.rating}`);
        if (movie.duration) parts.push(movie.duration);
        return parts.join(' • ');
    };

    // Get category icon
    const getCategoryIcon = (category) => {
        const categoryLower = category?.toLowerCase() || '';
        if (categoryLower.includes('action')) return <FaFire className="text-orange-400" />;
        if (categoryLower.includes('comedy')) return <FaFilm className="text-green-400" />;
        if (categoryLower.includes('drama')) return <FaTv className="text-purple-400" />;
        if (categoryLower.includes('sci-fi') || categoryLower.includes('scifi')) return <FaPlayCircle className="text-blue-400" />;
        if (categoryLower.includes('horror')) return <FaVideo className="text-red-400" />;
        if (categoryLower.includes('romance')) return <FaHeart className="text-pink-400" />;
        return <FaFilm className="text-gray-400" />;
    };

    // Comments functions
    useEffect(() => {
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

        if (movie?.id) {
            fetchComments();
        }
    }, [movie]);

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

            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            existingComments.unshift({
                ...commentData,
                id: Date.now(),
                created_at: new Date().toISOString()
            });
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(existingComments));

        } catch (error) {
            console.error('Error submitting comment:', error);
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

            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            const updatedComments = existingComments.map(c =>
                c.id === commentId ? { ...c, likes: updatedLikes } : c
            );
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(updatedComments));

        } catch (error) {
            console.error('Error liking comment:', error);
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

    // Improved video type detection
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

        // Check for YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com')) {
            return 'youtube';
        }

        // Check if it's a direct video file - expanded formats
        if (url.match(/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|ogg|ogv|wmv|flv|m4v|3gp|ts)$/i)) {
            return 'direct';
        }

        // Check if it's a streaming URL (like from a CDN)
        if (url.includes('/stream/') || url.includes('/video/') || url.includes('/watch/')) {
            return 'direct';
        }

        // Check for Mux
        if (url.includes('mux.com') || url.includes('.mpd')) {
            return 'mux';
        }

        // Check if it's an embed code or iframe
        if (url.includes('<iframe') || url.includes('embed')) {
            return 'embed';
        }

        return 'direct';
    };

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

    const extractDailyMotionId = (url) => {
        if (!url || typeof url !== 'string') return '';

        const cleanUrl = url.split('?')[0].split('#')[0];

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

        if (/^[a-zA-Z0-9]+$/.test(url.trim())) {
            return url.trim();
        }

        return '';
    };

    const extractYouTubeId = (url) => {
        if (!url || typeof url !== 'string') return '';

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /^[a-zA-Z0-9_-]{11}$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1] || match[0];
        }

        return '';
    };

    // Load YouTube IFrame API
    useEffect(() => {
        if (videoType !== 'youtube') return;

        // Load YouTube API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                setYouTubeApiReady(true);
            };
        } else {
            setYouTubeApiReady(true);
        }

        return () => {
            window.onYouTubeIframeAPIReady = null;
        };
    }, [videoType]);

    // Function to inject CSS into YouTube iframe to hide all branding and recommended videos
    const hideYouTubeBranding = (iframe) => {
        try {
            // Wait for iframe to load
            setTimeout(() => {
                if (!iframe || !iframe.contentDocument) return;

                const style = document.createElement('style');
                style.textContent = `
                    /* Hide YouTube logo and all branding */
                    .ytp-watermark, .ytp-youtube-button, .ytp-title, .ytp-title-link,
                    .ytp-chrome-top, .ytp-chrome-bottom, .ytp-gradient-top, .ytp-gradient-bottom,
                    .ytp-pause-overlay, .ytp-endscreen-content, .ytp-share-panel, 
                    .ytp-watch-later-button, .ytp-iv-video-content, .ytp-iv-overlay,
                    .html5-endscreen, .ytp-endscreen-previous, .ytp-chrome-top-buttons,
                    .ytp-cards-button, .ytp-chapter-title, .ytp-paid-content-overlay,
                    .ytp-ce-element, .ytp-spinner, .ytp-spinner-container,
                    .ytp-popup, .ytp-tooltip, .ytp-tooltip-text,
                    .ytp-upnext, .ytp-upnext-top, .ytp-upnext-bottom,
                    .ytp-videowall-still, .ytp-videowall-still-info,
                    .ytp-videowall-still-image, .ytp-videowall-still-info-content,
                    .ytp-cued-thumbnail-overlay, .ytp-cued-thumbnail-overlay-image {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                        width: 0 !important;
                        height: 0 !important;
                    }
                    
                    /* Specifically hide the recommended videos overlay when paused */
                    .ytp-pause-overlay, .ytp-endscreen-content, .html5-endscreen,
                    .ytp-upnext, .ytp-videowall-still, .ytp-ce-element {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                    }
                    
                    /* Make sure the video fills the entire player */
                    .html5-video-player, .video-stream, .html5-main-video {
                        width: 100% !important;
                        height: 100% !important;
                    }
                    
                    /* Remove any background */
                    .html5-video-player {
                        background: black !important;
                    }
                    
                    /* Hide any text that might appear */
                    .ytp-text, .ytp-button, .ytp-title-text {
                        display: none !important;
                    }
                    
                    /* Force video to cover full area */
                    .video-stream.html5-main-video {
                        object-fit: cover !important;
                    }

                    /* Hide the YouTube logo that appears on pause */
                    .ytp-chrome-top, .ytp-gradient-top {
                        display: none !important;
                    }
                `;

                iframe.contentDocument.head.appendChild(style);

                // Also try to inject into shadow DOM if present
                const videoPlayer = iframe.contentDocument.querySelector('.html5-video-player');
                if (videoPlayer && videoPlayer.shadowRoot) {
                    const shadowStyle = document.createElement('style');
                    shadowStyle.textContent = style.textContent;
                    videoPlayer.shadowRoot.appendChild(shadowStyle);
                }

                // Remove any overlay elements that might appear dynamically
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach(() => {
                        const pauseOverlay = iframe.contentDocument.querySelector('.ytp-pause-overlay');
                        if (pauseOverlay) pauseOverlay.style.display = 'none';

                        const endscreen = iframe.contentDocument.querySelector('.html5-endscreen');
                        if (endscreen) endscreen.style.display = 'none';

                        const upnext = iframe.contentDocument.querySelector('.ytp-upnext');
                        if (upnext) upnext.style.display = 'none';
                    });
                });

                observer.observe(iframe.contentDocument.body, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });

            }, 500);
        } catch (error) {
            console.log('Could not inject CSS into YouTube iframe:', error);
        }
    };

    // Initialize YouTube player
    useEffect(() => {
        if (!youTubeApiReady || videoType !== 'youtube' || !youtubeId || !youtubeContainerRef.current) return;

        // Create YouTube player
        const player = new window.YT.Player(youtubeContainerRef.current, {
            videoId: youtubeId,
            height: '100%',
            width: '100%',
            playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                fs: 0,
                disablekb: 1,
                cc_load_policy: 0,
                color: 'white',
                playsinline: 1,
                origin: window.location.origin,
                widget_referrer: window.location.origin,
                enablejsapi: 1,
                loop: 1,
                mute: muted ? 1 : 0,
                playlist: youtubeId,
                hl: 'en',
                autohide: 1,
                theme: 'dark',
                vq: 'hd1080'
            },
            events: {
                onReady: (event) => {
                    console.log("✅ YouTube player ready");
                    setYouTubePlayer(event.target);
                    setVideoLoaded(true);
                    setPlaying(true);
                    setDuration(event.target.getDuration());

                    // Set initial volume
                    event.target.setVolume(volume * 100);

                    // Start progress tracking
                    startYouTubeProgressTracking(event.target);

                    // Hide YouTube branding and recommended videos
                    const iframe = event.target.getIframe();
                    if (iframe) {
                        hideYouTubeBranding(iframe);

                        // Also try to hide by setting attributes
                        iframe.setAttribute('style', 'border: none; margin: 0; padding: 0;');
                        iframe.setAttribute('allowfullscreen', 'false');
                        iframe.setAttribute('allow', 'autoplay; encrypted-media');
                    }
                },
                onStateChange: (event) => {
                    setPlaying(event.data === window.YT.PlayerState.PLAYING);

                    if (event.data === window.YT.PlayerState.PLAYING) {
                        setDuration(event.target.getDuration());
                    }

                    // When paused, immediately hide any overlays
                    if (event.data === window.YT.PlayerState.PAUSED) {
                        const iframe = event.target.getIframe();
                        if (iframe) {
                            setTimeout(() => hideYouTubeBranding(iframe), 50);
                        }
                    }

                    // Handle ended - restart video instead of showing end screen
                    if (event.data === window.YT.PlayerState.ENDED) {
                        event.target.playVideo();
                        setProgress(0);
                        setCurrentTime(0);

                        // Re-hide branding when video restarts
                        const iframe = event.target.getIframe();
                        if (iframe) {
                            setTimeout(() => hideYouTubeBranding(iframe), 500);
                        }
                    }
                },
                onError: (event) => {
                    console.error("❌ YouTube error:", event);
                    setError("Failed to load YouTube video. Please try again.");
                    setVideoLoaded(false);
                }
            }
        });

        return () => {
            if (player && player.destroy) {
                player.destroy();
            }
        };
    }, [youTubeApiReady, videoType, youtubeId, muted]);

    // Track YouTube progress
    const startYouTubeProgressTracking = (player) => {
        const interval = setInterval(() => {
            if (player && player.getCurrentTime && player.getDuration) {
                const current = player.getCurrentTime();
                const total = player.getDuration();
                if (total > 0) {
                    setCurrentTime(current);
                    setProgress(current / total);
                }
            }
        }, 500);

        return () => clearInterval(interval);
    };

    const handlePlayPause = useCallback((e) => {
        e?.stopPropagation();

        if (isVimeoVideo || isDailyMotionVideo || useEmbed) {
            return;
        }

        // YouTube player
        if (videoType === 'youtube' && youTubePlayer) {
            if (playing) {
                youTubePlayer.pauseVideo();
            } else {
                youTubePlayer.playVideo();

                // Re-hide branding when playing
                setTimeout(() => {
                    const iframe = youTubePlayer.getIframe();
                    if (iframe) hideYouTubeBranding(iframe);
                }, 100);
            }
            setPlaying(!playing);
        }
        // HTML5 player
        else {
            if (!videoRef.current) return;

            const video = videoRef.current;

            if (video.paused || video.ended) {
                video.play()
                    .then(() => {
                        setPlaying(true);
                    })
                    .catch(err => {
                        console.error("Play error:", err);
                        video.muted = true;
                        setMuted(true);
                        video.play().then(() => setPlaying(true)).catch(e => {
                            setError("Unable to play video. Please try again or use the external link.");
                        });
                    });
            } else {
                video.pause();
                setPlaying(false);
            }
        }

        showControlsWithTimer();
    }, [isVimeoVideo, isDailyMotionVideo, videoType, useEmbed, youTubePlayer, playing]);

    const handleTimeUpdate = () => {
        if (videoRef.current && !isVimeoVideo && !isDailyMotionVideo && videoType !== 'youtube' && !useEmbed) {
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

        // YouTube volume control
        if (videoType === 'youtube' && youTubePlayer) {
            youTubePlayer.setVolume(newVolume * 100);
        }
        // HTML5 volume control
        else if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }

        setMuted(newVolume === 0);
        showControlsWithTimer();
    };

    const handleToggleMute = (e) => {
        e?.stopPropagation();

        // YouTube mute toggle
        if (videoType === 'youtube' && youTubePlayer) {
            if (muted) {
                youTubePlayer.unMute();
                youTubePlayer.setVolume(volume * 100);
            } else {
                youTubePlayer.mute();
            }
        }
        // HTML5 mute toggle
        else if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
        }

        setMuted(!muted);
        showControlsWithTimer();
    };

    const handleSeek = (e) => {
        e?.stopPropagation();
        const seekTo = parseFloat(e.target.value);
        setProgress(seekTo);

        // YouTube seek
        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = seekTo * youTubePlayer.getDuration();
            youTubePlayer.seekTo(newTime, true);
            setCurrentTime(newTime);
        }
        // HTML5 seek
        else if (videoRef.current && !isNaN(videoRef.current.duration)) {
            const newTime = seekTo * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
        showControlsWithTimer();
    };

    const handleForward = (e, seconds = 10) => {
        e?.stopPropagation();

        // YouTube forward
        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = Math.min(youTubePlayer.getCurrentTime() + seconds, youTubePlayer.getDuration());
            youTubePlayer.seekTo(newTime, true);
            setCurrentTime(newTime);
        }
        // HTML5 forward
        else if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handleRewind = (e, seconds = 10) => {
        e?.stopPropagation();

        // YouTube rewind
        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = Math.max(0, youTubePlayer.getCurrentTime() - seconds);
            youTubePlayer.seekTo(newTime, true);
            setCurrentTime(newTime);
        }
        // HTML5 rewind
        else if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handlePlaybackRate = (rate, e) => {
        e?.stopPropagation();

        // YouTube playback rate
        if (videoType === 'youtube' && youTubePlayer) {
            youTubePlayer.setPlaybackRate(rate);
        }
        // HTML5 playback rate
        else if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }

        setPlaybackRate(rate);
        showControlsWithTimer();
    };

    // UPDATED: Enhanced download handler with quality options and progress simulation
    const handleDownload = async (e, quality = 'original') => {
        e?.stopPropagation();

        // Check for download link in priority order:
        // 1. download field (from admin form)
        // 2. download_link field
        // 3. videoUrl as fallback
        // 4. streamLink as last resort
        const downloadUrl = movie?.download || movie?.download_link || movie?.videoUrl || movie?.streamLink;

        if (downloadUrl) {
            setDownloading(true);
            setShowDownloadOptions(false);

            // Simulate download preparation (for better UX)
            setTimeout(() => {
                // Create an invisible anchor element to trigger download
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = ''; // Let the browser determine filename or use URL
                link.target = '_blank'; // Open in new tab for cross-origin URLs
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setDownloading(false);

                // Show success message (optional)
                const fileName = downloadUrl.split('/').pop() || movie.title;
                alert(`Download started: ${fileName}`);

                showControlsWithTimer();
            }, 1000);
        } else {
            alert('Download link not available for this movie.');
        }
    };

    // Copy download link to clipboard
    const handleCopyLink = (e) => {
        e?.stopPropagation();
        const downloadUrl = movie?.download || movie?.download_link || movie?.videoUrl || movie?.streamLink;

        if (downloadUrl) {
            navigator.clipboard.writeText(downloadUrl).then(() => {
                alert('Download link copied to clipboard!');
            }).catch(() => {
                alert('Failed to copy link');
            });
        }
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

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError('');
        setLoading(true);
        setVideoLoaded(false);
        if (movie) {
            initializeVideo();
        }
    };

    const handleUseEmbed = () => {
        setUseEmbed(true);
        setError('');
        setLoading(false);
    };

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

    const initializeVideo = () => {
        if (!movie) return;

        const url = movie?.videoUrl || movie?.streamLink || '';

        if (!url) {
            setError("No video URL available for this movie");
            setLoading(false);
            return;
        }

        const detectedType = detectVideoType(url);
        setVideoType(detectedType);

        if (detectedType === 'dailymotion') {
            setIsDailyMotionVideo(true);
            setIsVimeoVideo(false);
            const dailymotionId = extractDailyMotionId(url);
            if (dailymotionId) {
                setDailyMotionId(dailymotionId);
                // Clean DailyMotion embed - no logo, no branding
                const embedUrl = `https://www.dailymotion.com/embed/video/${dailymotionId}?autoplay=1&queue-autoplay-next=0&queue-enable=0&sharing-enable=0&ui-logo=0&ui-start-screen-info=0&controls=true&ui-theme=dark&ui-advance=0&ui-chapters=0&ui-description=0&ui-mute=0&ui-endscreen=0&logo=0&info=0`;
                setVideoUrl(embedUrl);
                console.log("🎬 Using DailyMotion embedded player (clean mode)");
            } else {
                setError("Invalid DailyMotion URL");
            }
        } else if (detectedType === 'vimeo') {
            setIsVimeoVideo(true);
            setIsDailyMotionVideo(false);
            const vimeoId = extractVimeoId(url);
            if (vimeoId) {
                // Clean Vimeo embed - no logos, no text
                const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=true&badge=0&transparent=1&color=ffffff&autopause=0&player_id=0&app_id=0`;
                setVideoUrl(embedUrl);
                console.log("🎬 Using Vimeo embedded player (clean mode)");
            } else {
                setError("Invalid Vimeo URL");
            }
        } else if (detectedType === 'youtube') {
            setIsVimeoVideo(false);
            setIsDailyMotionVideo(false);
            const youtubeId = extractYouTubeId(url);
            if (youtubeId) {
                setYoutubeId(youtubeId);
                // We'll use the YouTube API player instead of iframe
                setVideoUrl(''); // Not needed for API player
                console.log("🎬 Using YouTube API player with custom controls (professional mode)");
            } else {
                setError("Invalid YouTube URL");
            }
        } else if (detectedType === 'embed') {
            setIsVimeoVideo(false);
            setIsDailyMotionVideo(false);
            // Try to extract iframe src
            const srcMatch = url.match(/src=["']([^"']+)["']/);
            if (srcMatch) {
                setVideoUrl(srcMatch[1]);
            } else {
                setVideoUrl(url);
            }
            console.log("🎬 Using embed player");
        } else {
            setIsVimeoVideo(false);
            setIsDailyMotionVideo(false);
            setVideoUrl(url);
            console.log("🎬 Using custom HTML5 player");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!movie) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        setUseEmbed(false);
        initializeVideo();

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [movie, retryCount]);

    const renderVideoPlayer = () => {
        if (useEmbed) {
            return (
                <div className="relative w-full h-full">
                    <iframe
                        src={videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={movie?.title || 'Video Player'}
                        onLoad={() => {
                            console.log("✅ Embed iframe loaded");
                            setVideoLoaded(true);
                            setPlaying(true);
                        }}
                        onError={() => {
                            setError("Failed to load embedded video");
                            setVideoLoaded(false);
                        }}
                    />
                </div>
            );
        }

        if (isDailyMotionVideo && dailyMotionId) {
            return (
                <div className="relative w-full h-full">
                    <iframe
                        src={videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={movie?.title || 'Video Player'}
                        onLoad={() => {
                            console.log("✅ DailyMotion iframe loaded");
                            setVideoLoaded(true);
                            setPlaying(true);
                        }}
                        onError={() => {
                            setError("Failed to load DailyMotion video");
                            setVideoLoaded(false);
                        }}
                    />
                </div>
            );
        } else if (isVimeoVideo) {
            return (
                <div className="relative w-full h-full">
                    <iframe
                        src={videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={movie?.title || 'Video Player'}
                        onLoad={() => {
                            console.log("✅ Vimeo iframe loaded");
                            setVideoLoaded(true);
                            setPlaying(true);
                        }}
                        onError={() => {
                            setError("Failed to load Vimeo video");
                            setVideoLoaded(false);
                        }}
                    />
                </div>
            );
        } else if (videoType === 'youtube') {
            // ULTRA-CLEAN YOUTUBE PLAYER - NO BRANDING OR RECOMMENDED VIDEOS
            return (
                <div className="relative w-full h-full bg-black">
                    {/* YouTube Player Container */}
                    <div
                        ref={youtubeContainerRef}
                        className="w-full h-full"
                        style={{
                            position: 'relative',
                            zIndex: 1
                        }}
                    />

                    {/* COMPLETE OVERLAY - Blocks ALL YouTube elements including recommended videos */}
                    <div
                        className="absolute inset-0 z-20"
                        style={{
                            background: 'transparent',
                            cursor: 'pointer'
                        }}
                        onClick={handlePlayPause}
                        onMouseEnter={() => showControlsWithTimer()}
                        onMouseLeave={() => setShowControls(false)}
                    />

                    {/* Additional overlay to ensure nothing shows through */}
                    <div
                        className="absolute inset-0 z-10"
                        style={{
                            background: 'rgba(0,0,0,0.001)',
                            pointerEvents: 'none'
                        }}
                    />

                    {/* When paused, show a simple black overlay to hide any YouTube elements */}
                    {!playing && (
                        <div
                            className="absolute inset-0 z-25"
                            style={{
                                background: 'black',
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                </div>
            );
        } else {
            return (
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain bg-black"
                    src={videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => {
                        console.log("✅ HTML5 video metadata loaded");
                        setVideoLoaded(true);
                        if (videoRef.current) {
                            setDuration(videoRef.current.duration);
                            // Try auto-play
                            const playPromise = videoRef.current.play();
                            if (playPromise !== undefined) {
                                playPromise
                                    .then(() => {
                                        setPlaying(true);
                                    })
                                    .catch(err => {
                                        console.log("Auto-play prevented:", err);
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
                        const video = videoRef.current;
                        let errorMessage = "Failed to load video. ";

                        if (video && video.error) {
                            switch (video.error.code) {
                                case MediaError.MEDIA_ERR_ABORTED:
                                    errorMessage += "The video playback was aborted.";
                                    break;
                                case MediaError.MEDIA_ERR_NETWORK:
                                    errorMessage += "A network error caused the video download to fail.";
                                    break;
                                case MediaError.MEDIA_ERR_DECODE:
                                    errorMessage += "The video playback was aborted due to a corruption problem or because the video used features your browser does not support.";
                                    break;
                                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                    errorMessage += "The video format is not supported by your browser.";
                                    break;
                                default:
                                    errorMessage += "An unknown error occurred.";
                            }
                        } else {
                            errorMessage += "The video source might be invalid or unavailable.";
                        }

                        setError(errorMessage);
                        setVideoLoaded(false);
                    }}
                    playsInline
                    preload="auto"
                    muted={muted}
                    crossOrigin="anonymous"
                >
                    <source src={videoUrl} type="video/mp4" />
                    <source src={videoUrl} type="video/webm" />
                    <source src={videoUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                </video>
            );
        }
    };

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
                                            <FaSpinner className="animate-spin" />
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

    // ===== RENDER RELATED MOVIES SECTION (OPTIMIZED WITH 5 CARDS) =====
    const renderRelatedMovies = () => {
        if (relatedLoading) {
            return (
                <div className="mt-6 sm:mt-8 bg-gray-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
                    <h3 className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <FaPlayCircle className="text-purple-500 text-sm sm:text-2xl" />
                        <span>Related Movies</span>
                    </h3>
                    <div className="flex justify-center py-4 sm:py-8">
                        <FaSpinner className="text-xl sm:text-3xl text-purple-500 animate-spin" />
                    </div>
                </div>
            );
        }

        if (relatedMovies.length === 0) {
            return null;
        }

        // LIMIT CARDS TO 5 FOR ALL DEVICES
        const DISPLAY_LIMIT = 5;

        return (
            <div className="mt-6 sm:mt-8 bg-gray-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                        <FaPlayCircle className="text-purple-500 text-sm sm:text-2xl" />
                        <span>Related Movies</span>
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-400 bg-gray-800 px-2 sm:px-3 py-1 rounded-full">
                        {relatedMovies.length} available
                    </span>
                </div>

                {/* Desktop Grid - Show exactly 5 cards */}
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {relatedMovies.slice(0, DISPLAY_LIMIT).map(relatedMovie => (
                        <div
                            key={relatedMovie.id}
                            onClick={() => handleRelatedMovieClick(relatedMovie)}
                            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 relative"
                        >
                            <div className="relative rounded-xl overflow-hidden shadow-lg shadow-black/50">
                                <img
                                    src={relatedMovie.poster || relatedMovie.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image'}
                                    alt={relatedMovie.title}
                                    className="w-full aspect-[2/3] object-cover group-hover:opacity-80 transition-opacity"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                                    }}
                                />

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Play button overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                        <FaPlay className="text-white ml-1" />
                                    </div>
                                </div>

                                {/* Top badges */}
                                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                    {relatedMovie.rating && (
                                        <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <FaStar className="text-xs" /> {relatedMovie.rating}
                                        </span>
                                    )}
                                    {relatedMovie.year && (
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <FaCalendarAlt className="text-xs" /> {relatedMovie.year}
                                        </span>
                                    )}
                                </div>

                                {/* Category badge */}
                                {relatedMovie.category && (
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            {getCategoryIcon(relatedMovie.category.split(',')[0])}
                                            <span className="hidden group-hover:inline">
                                                {relatedMovie.category.split(',')[0].trim()}
                                            </span>
                                        </span>
                                    </div>
                                )}

                                {/* Bottom info */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                                    <h4 className="text-white font-semibold text-sm line-clamp-1">
                                        {relatedMovie.title}
                                    </h4>
                                    <p className="text-gray-300 text-xs line-clamp-1 mt-1">
                                        {formatMovieMeta(relatedMovie)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Horizontal Scroll - Show exactly 5 cards */}
                <div className="relative md:hidden">
                    {/* Left scroll button - only show if more than 5 cards */}
                    {relatedMovies.length > DISPLAY_LIMIT && (
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 rounded-full p-2 shadow-lg border border-purple-500/30"
                        >
                            <FaChevronLeft className="text-white text-sm" />
                        </button>
                    )}

                    {/* Scrollable container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 px-2"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {relatedMovies.slice(0, DISPLAY_LIMIT).map(relatedMovie => (
                            <div
                                key={relatedMovie.id}
                                onClick={() => handleRelatedMovieClick(relatedMovie)}
                                className="flex-none w-[120px] sm:w-[140px] group cursor-pointer transform transition-transform hover:scale-105"
                            >
                                <div className="relative rounded-xl overflow-hidden shadow-lg">
                                    <img
                                        src={relatedMovie.poster || relatedMovie.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image'}
                                        alt={relatedMovie.title}
                                        className="w-full aspect-[2/3] object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                                        }}
                                    />

                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                                            <FaPlay className="text-white ml-0.5 text-xs sm:text-sm" />
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-1 left-1 flex gap-1">
                                        {relatedMovie.rating && (
                                            <span className="bg-yellow-600 text-white text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                <FaStar className="text-[6px] sm:text-xs" />
                                                <span className="text-[8px] sm:text-xs">{relatedMovie.rating}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Category icon */}
                                    {relatedMovie.category && (
                                        <div className="absolute top-1 right-1">
                                            <span className="bg-purple-600/80 text-white text-[8px] sm:text-xs p-1 rounded-full">
                                                {getCategoryIcon(relatedMovie.category.split(',')[0])}
                                            </span>
                                        </div>
                                    )}

                                    {/* Bottom gradient with title */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                                        <h4 className="text-white font-medium text-[10px] sm:text-xs line-clamp-1">
                                            {relatedMovie.title}
                                        </h4>
                                        {relatedMovie.year && (
                                            <p className="text-gray-300 text-[8px] sm:text-[10px]">
                                                {relatedMovie.year}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right scroll button - only show if more than 5 cards */}
                    {relatedMovies.length > DISPLAY_LIMIT && (
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 rounded-full p-2 shadow-lg border border-purple-500/30"
                        >
                            <FaChevronRight className="text-white text-sm" />
                        </button>
                    )}
                </div>

                {/* View more link - only show if there are more than 5 movies */}
                {relatedMovies.length > DISPLAY_LIMIT && (
                    <div className="text-center mt-4 sm:mt-6">
                        <button
                            onClick={() => {
                                navigate(`/?category=${movie.category?.split(',')[0].trim() || 'all'}`);
                            }}
                            className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-2 bg-purple-900/20 px-3 sm:px-4 py-2 rounded-full"
                        >
                            View all {relatedMovies.length} related movies
                            <FaChevronRight className="text-[10px] sm:text-xs" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const shouldShowCustomControls = !isVimeoVideo && !isDailyMotionVideo && !useEmbed;

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-base sm:text-xl">Loading player...</p>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center p-6 sm:p-8 max-w-lg bg-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-800">
                    <FaExclamationTriangle className="text-red-500 text-4xl sm:text-6xl mx-auto mb-4" />
                    <h1 className="text-2xl sm:text-3xl text-white font-bold mb-4">Playback Error</h1>
                    <p className="text-sm sm:text-base text-gray-400 mb-6">{error || "No movie selected"}</p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm sm:text-base transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm sm:text-base transition-colors flex items-center gap-2 justify-center"
                        >
                            <FaHome /> Go Home
                        </button>
                        {error && error.includes('format') && (
                            <button
                                onClick={handleUseEmbed}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm sm:text-base transition-colors"
                            >
                                Try Embed Player
                            </button>
                        )}
                        {error && (
                            <button
                                onClick={handleRetry}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm sm:text-base transition-colors"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Check if download is available
    const hasDownload = movie?.download || movie?.download_link || movie?.videoUrl || movie?.streamLink;

    return (
        <div className="min-h-screen bg-black text-white">
            {!isFullscreen && (
                <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/90 to-transparent z-10">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-1 sm:gap-2 text-white hover:text-red-500 transition-colors text-sm sm:text-base">
                            <FaArrowLeft className="text-xs sm:text-sm" /> Back
                        </button>

                        <div className="flex-1 text-center px-2 sm:px-4">
                            <h1 className="text-sm sm:text-xl font-bold truncate max-w-xs sm:max-w-2xl mx-auto">{movie.title}</h1>
                            <div className="hidden sm:flex items-center justify-center gap-2 mt-1 text-sm text-gray-400">
                                <FaVideo className="text-red-400" />
                                <span>Now Playing</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* BEAUTIFUL DOWNLOAD BUTTON WITH DROPDOWN */}
                            {hasDownload && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg sm:rounded-xl text-white font-medium text-xs sm:text-base shadow-lg shadow-green-600/20 transition-all duration-200 transform hover:scale-105"
                                        disabled={downloading}
                                    >
                                        {downloading ? (
                                            <>
                                                <FaSpinner className="animate-spin text-xs sm:text-sm" />
                                                <span className="hidden sm:inline">Preparing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCloudDownloadAlt className="text-sm sm:text-lg" />
                                                <span className="hidden sm:inline">Download</span>
                                                {showDownloadOptions ?
                                                    <FaChevronUp className="ml-1 text-xs" /> :
                                                    <FaChevronDown className="ml-1 text-xs" />
                                                }
                                            </>
                                        )}
                                    </button>

                                    {/* DOWNLOAD DROPDOWN MENU - Mobile optimized */}
                                    {showDownloadOptions && !downloading && (
                                        <div className="absolute right-0 mt-2 w-48 sm:w-64 bg-gray-800/95 backdrop-blur-lg border border-gray-700 rounded-lg sm:rounded-xl shadow-2xl overflow-hidden z-50">
                                            <div className="p-2 sm:p-3 border-b border-gray-700">
                                                <p className="text-xs sm:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <FaFileDownload className="text-green-400 text-xs sm:text-sm" />
                                                    Download Options
                                                </p>
                                            </div>

                                            <div className="p-2">
                                                {/* Original Quality */}
                                                <button
                                                    onClick={(e) => handleDownload(e, 'original')}
                                                    className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-gray-700/70 rounded-lg transition-colors group"
                                                >
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <FaHdd className="text-green-400 text-xs sm:text-sm" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-xs sm:text-sm font-medium text-white">Original</p>
                                                        <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Best quality</p>
                                                    </div>
                                                </button>

                                                {/* HD Quality */}
                                                <button
                                                    onClick={(e) => handleDownload(e, 'hd')}
                                                    className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-gray-700/70 rounded-lg transition-colors group"
                                                >
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <FaFilm className="text-blue-400 text-xs sm:text-sm" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-xs sm:text-sm font-medium text-white">HD (720p)</p>
                                                        <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Good quality</p>
                                                    </div>
                                                </button>

                                                {/* Copy Link */}
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 hover:bg-gray-700/70 rounded-lg transition-colors group mt-1 border-t border-gray-700/50 pt-2 sm:pt-3"
                                                >
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <FaLink className="text-purple-400 text-xs sm:text-sm" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-xs sm:text-sm font-medium text-white">Copy Link</p>
                                                        <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Save for later</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div
                ref={playerContainerRef}
                className={`relative w-full ${isMobile ? 'h-[50vh] sm:h-[60vh]' : 'h-screen'} bg-black`}
                onMouseMove={shouldShowCustomControls ? showControlsWithTimer : undefined}
                onMouseLeave={() => shouldShowCustomControls && setShowControls(false)}
                onClick={(e) => {
                    if (shouldShowCustomControls && !e.target.closest('button') && !e.target.closest('input') && !e.target.closest('select')) {
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
                {renderVideoPlayer()}

                {shouldShowCustomControls && videoLoaded && !playing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                        <button
                            onClick={handlePlayPause}
                            className="w-16 h-16 sm:w-24 sm:h-24 bg-red-600/90 hover:bg-red-700 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                        >
                            <FaPlay size={isMobile ? 20 : 40} className="text-white ml-1 sm:ml-2" />
                        </button>
                    </div>
                )}

                {!videoLoaded && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <div className="text-center">
                            <FaSpinner className="text-2xl sm:text-4xl text-red-600 animate-spin mx-auto mb-4" />
                            <p className="text-white text-sm sm:text-base">Loading video...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-4">
                        <div className="text-center p-4 sm:p-6 max-w-md">
                            <FaExclamationTriangle className="text-red-500 text-3xl sm:text-5xl mx-auto mb-4" />
                            <p className="text-white text-sm sm:text-base mb-4">{error}</p>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                                <button
                                    onClick={handleRetry}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs sm:text-sm transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={handleUseEmbed}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs sm:text-sm transition-colors"
                                >
                                    Try Embed Player
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {shouldShowCustomControls && (
                    <div className={`absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-2 sm:mb-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.001"
                                    value={progress}
                                    onChange={handleSeek}
                                    className="w-full h-1 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-2 sm:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                                />
                                <div className="flex justify-between text-[10px] sm:text-sm text-gray-300 mt-1 sm:mt-2">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <button
                                        onClick={handlePlayPause}
                                        className="hover:text-red-500 transition-colors p-1 sm:p-2"
                                    >
                                        {playing ? (
                                            <FaPause className={`${isMobile ? 'text-lg' : 'text-2xl sm:text-3xl'}`} />
                                        ) : (
                                            <FaPlay className={`${isMobile ? 'text-lg ml-0.5' : 'text-2xl sm:text-3xl ml-1'}`} />
                                        )}
                                    </button>

                                    {!isMobile && (
                                        <>
                                            <button
                                                onClick={(e) => handleRewind(e, 10)}
                                                className="hover:text-red-500 transition-colors p-2"
                                            >
                                                <FaBackward className="text-xl sm:text-2xl" />
                                            </button>
                                            <button
                                                onClick={(e) => handleForward(e, 10)}
                                                className="hover:text-red-500 transition-colors p-2"
                                            >
                                                <FaForward className="text-xl sm:text-2xl" />
                                            </button>
                                        </>
                                    )}

                                    {!isMobile && (
                                        <div className="flex items-center gap-2 sm:gap-3 ml-2">
                                            <button
                                                onClick={handleToggleMute}
                                                className="hover:text-red-500 transition-colors p-2"
                                            >
                                                {muted ? <FaVolumeMute className="text-xl sm:text-2xl" /> : <FaVolumeUp className="text-xl sm:text-2xl" />}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-20 sm:w-32 h-1 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-2 sm:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 sm:gap-4">
                                    {!isMobile && (
                                        <div className="relative group">
                                            <button className="px-2 sm:px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs sm:text-sm">
                                                {playbackRate}x
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                                <div className="text-[10px] sm:text-xs text-gray-400 mb-1">Speed</div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                                        <button
                                                            key={rate}
                                                            onClick={(e) => handlePlaybackRate(rate, e)}
                                                            className={`px-1 sm:px-2 py-1 text-[10px] sm:text-xs rounded ${playbackRate === rate ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                        >
                                                            {rate}x
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleFullscreen}
                                        className="hover:text-red-500 transition-colors p-1 sm:p-2"
                                    >
                                        {isFullscreen ? (
                                            <FaCompress className={`${isMobile ? 'text-base' : 'text-xl sm:text-2xl'}`} />
                                        ) : (
                                            <FaExpand className={`${isMobile ? 'text-base' : 'text-xl sm:text-2xl'}`} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!shouldShowCustomControls && showControls && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1 sm:py-2 border border-red-500/30 z-30">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <FaVideo className="text-red-400 text-xs sm:text-sm" />
                            <span className="text-white text-[10px] sm:text-sm">
                                Now Playing
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {!isFullscreen && (
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{movie.title}</h1>

                                {/* BEAUTIFUL DOWNLOAD CARD FOR MOBILE/LATER */}
                                {hasDownload && !showDownloadOptions && (
                                    <button
                                        onClick={() => setShowDownloadOptions(true)}
                                        className="lg:hidden flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm font-medium"
                                    >
                                        <FaDownload className="text-xs sm:text-sm" />
                                        <span className="hidden xs:inline">Download</span>
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                                {movie.year && <span className="px-2 sm:px-4 py-1 sm:py-2 bg-red-600 rounded-full text-xs sm:text-sm">{movie.year}</span>}
                                {movie.rating && <span className="px-2 sm:px-4 py-1 sm:py-2 bg-yellow-600 rounded-full flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"><FaStar className="text-[10px] sm:text-sm" /> {movie.rating}</span>}
                                {movie.category && (
                                    <span className="px-2 sm:px-4 py-1 sm:py-2 bg-purple-600 rounded-full text-xs sm:text-sm">
                                        {movie.category.split(',')[0]}
                                    </span>
                                )}
                                {/* Download badge */}
                                {hasDownload && (
                                    <span className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center gap-1 sm:gap-2 shadow-lg text-xs sm:text-sm">
                                        <FaCloudDownloadAlt className="text-[10px] sm:text-sm" />
                                        <span className="hidden xs:inline">Download Available</span>
                                    </span>
                                )}
                            </div>

                            <p className="text-sm sm:text-base text-gray-300 mb-6 whitespace-pre-wrap">{movie.description || 'No description available'}</p>

                            {/* RELATED MOVIES SECTION - Now showing only 5 cards */}
                            {renderRelatedMovies()}

                            {renderCommentsSection()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Player;