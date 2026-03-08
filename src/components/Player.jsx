import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress,
    FaArrowLeft, FaHome, FaStar, FaForward, FaBackward,
    FaVideo, FaComment, FaHeart, FaPaperPlane, FaTrash, FaEdit, FaCheck, FaTimes,
    FaSpinner, FaExclamationTriangle, FaDownload,
    FaFilm, FaTv, FaFire, FaClock,
    FaCalendarAlt, FaPlayCircle, FaChevronRight, FaChevronLeft,
    FaYoutube, FaVimeo, FaDailymotion, FaList, FaLayerGroup
} from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { MoviesContext } from '../context/MoviesContext';

const Player = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { movies } = useContext(MoviesContext);

    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const youtubeContainerRef = useRef(null);
    const controlsTimerRef = useRef(null);
    const commentsEndRef = useRef(null);

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
    const [downloading, setDownloading] = useState(false);
    const [youtubeId, setYoutubeId] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);

    // Movie parts state
    const [movieParts, setMovieParts] = useState([]);
    const [selectedPart, setSelectedPart] = useState(null);
    const [showPartsList, setShowPartsList] = useState(false);

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
    const scrollContainerRef = useRef(null);

    // Try to find movie from context if not in state
    useEffect(() => {
        if (!movie && id && movies.length > 0) {
            const foundMovie = movies.find(m => m.id === id || m.id === parseInt(id));
            if (foundMovie) {
                setMovie(foundMovie);
                setError('');
            } else setError("Movie not found");
        } else if (!movie && !id) setError("No movie selected");
    }, [movie, id, movies]);

    // Parse movie parts from download field
    useEffect(() => {
        if (movie?.download) {
            try {
                const parsed = JSON.parse(movie.download);
                if (Array.isArray(parsed)) {
                    setMovieParts(parsed);
                    if (parsed.length > 0 && !selectedPart) setSelectedPart(parsed[0]);
                } else if (parsed?.parts) {
                    setMovieParts(parsed.parts);
                    if (parsed.parts.length > 0 && !selectedPart) setSelectedPart(parsed.parts[0]);
                } else setMovieParts([]);
            } catch { setMovieParts([]); }
        }
    }, [movie]);

    // Update video when part changes
    useEffect(() => {
        if (selectedPart) {
            setLoading(true);
            setError('');
            setUseEmbed(false);
            initializeVideo(selectedPart.streamLink || selectedPart.videoUrl, selectedPart.videoType);
        } else if (movie) {
            initializeVideo(movie.videoUrl, movie.videoType);
        }
    }, [selectedPart, movie, retryCount]);

    // Related movies
    useEffect(() => {
        if (movie && movies.length > 0) findRelatedMovies();
    }, [movie, movies]);

    const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

    const findRelatedMovies = () => {
        setRelatedLoading(true);
        if (!movie || !movies.length) { setRelatedLoading(false); return; }

        const currentCategories = movie.category ? movie.category.split(',').map(c => c.trim().toLowerCase()) : [];
        const currentYear = movie.year ? parseInt(movie.year) : null;
        const currentMovieId = movie.id;

        const scoredMovies = movies
            .filter(m => m.id !== currentMovieId && m.type === "movie")
            .map(otherMovie => {
                let score = 0;
                const otherCategories = otherMovie.category ? otherMovie.category.split(',').map(c => c.trim().toLowerCase()) : [];
                const commonCategories = currentCategories.filter(cat => otherCategories.includes(cat));
                score += commonCategories.length * 10;

                const otherYear = otherMovie.year ? parseInt(otherMovie.year) : null;
                if (currentYear && otherYear && Math.abs(currentYear - otherYear) <= 2) score += 5;
                if (otherMovie.imdbRating && parseFloat(otherMovie.imdbRating) >= 8) score += 3;
                if (otherMovie.background) score += 2;

                return { movie: otherMovie, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8)
            .map(item => item.movie);

        if (scoredMovies.length < 6) {
            const popularMovies = movies
                .filter(m => m.id !== currentMovieId && m.type === "movie" && !scoredMovies.some(sm => sm.id === m.id) && (m.background || (m.imdbRating && parseFloat(m.imdbRating) >= 7.5)))
                .sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0))
                .slice(0, 6 - scoredMovies.length);
            setRelatedMovies([...scoredMovies, ...popularMovies]);
        } else setRelatedMovies(scoredMovies);

        setRelatedLoading(false);
    };

    const handleRelatedMovieClick = (relatedMovie) => navigate(`/player/${relatedMovie.id}`, { state: { movie: relatedMovie } });

    const formatMovieMeta = (movie) => [movie.year, movie.imdbRating && `★ ${movie.imdbRating}`, movie.duration].filter(Boolean).join(' • ');

    const getCategoryIcon = (category) => {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('action')) return <FaFire className="text-orange-400" />;
        if (cat.includes('comedy')) return <FaFilm className="text-green-400" />;
        if (cat.includes('drama')) return <FaTv className="text-purple-400" />;
        if (cat.includes('sci-fi') || cat.includes('scifi')) return <FaPlayCircle className="text-blue-400" />;
        if (cat.includes('horror')) return <FaVideo className="text-red-400" />;
        if (cat.includes('romance')) return <FaHeart className="text-pink-400" />;
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
            setUserName(randomName);
            setUserAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}`);
            localStorage.setItem('videoCommenter', JSON.stringify({ name: randomName, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}` }));
        }
        if (movie?.id) fetchComments();
    }, [movie]);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase.from('comments').select('*').eq('movie_id', movie.id.toString()).order('created_at', { ascending: false });
            if (error) throw error;
            setComments(data || []);
        } catch {
            const localComments = localStorage.getItem(`comments_${movie.id}`);
            if (localComments) setComments(JSON.parse(localComments));
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
            device_info: { userAgent: navigator.userAgent, platform: navigator.platform, screen: `${window.screen.width}x${window.screen.height}`, timestamp: new Date().toISOString() },
            likes: 0
        };

        try {
            const { data, error } = await supabase.from('comments').insert([commentData]).select();
            if (error) throw error;
            setComments(prev => [data[0], ...prev]);
            setNewComment('');
            setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch {
            const fallbackComment = { ...commentData, id: Date.now(), created_at: new Date().toISOString() };
            const existingComments = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            existingComments.unshift(fallbackComment);
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(existingComments));
            setComments(existingComments);
            setNewComment('');
        } finally { setIsSubmitting(false); }
    };

    const handleLikeComment = async (commentId) => {
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;
        try {
            const { error } = await supabase.from('comments').update({ likes: (comment.likes || 0) + 1 }).eq('id', commentId);
            if (error) throw error;
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c));
        } catch {
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c));
        }
    };

    const handleEditComment = (comment) => { setEditingComment(comment.id); setEditText(comment.message); };

    const handleSaveEdit = async (commentId) => {
        try {
            const { error } = await supabase.from('comments').update({ message: editText.trim() }).eq('id', commentId);
            if (error) throw error;
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, message: editText.trim() } : c));
            setEditingComment(null);
            setEditText('');
        } catch (error) { console.error('Error updating comment:', error); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) { console.error('Error deleting comment:', error); }
    };

    const formatTimeAgo = (timestamp) => {
        const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const updateUserName = (e) => {
        setUserName(e.target.value);
        const userData = JSON.parse(localStorage.getItem('videoCommenter') || '{}');
        userData.name = e.target.value;
        localStorage.setItem('videoCommenter', JSON.stringify(userData));
    };

    // Video type detection functions
    const detectVideoType = (url) => {
        if (!url || typeof url !== 'string') return 'direct';
        if (url.includes('dailymotion.com') || url.includes('dai.ly')) return 'dailymotion';
        if (url.includes('vimeo.com') || url.includes('player.vimeo.com') || /^\d+$/.test(url.trim())) return 'vimeo';
        if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com')) return 'youtube';
        if (url.match(/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|ogg|ogv|wmv|flv|m4v|3gp|ts)$/i)) return 'direct';
        if (url.includes('/stream/') || url.includes('/video/') || url.includes('/watch/')) return 'direct';
        if (url.includes('<iframe') || url.includes('embed')) return 'embed';
        return 'direct';
    };

    const extractVimeoId = (url) => {
        if (!url) return '';
        if (/^\d+$/.test(url.trim())) return url.trim();
        const patterns = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/, /vimeo\.com\/channels\/[^\/]+\/(\d+)/, /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return '';
    };

    const extractDailyMotionId = (url) => {
        if (!url) return '';
        const cleanUrl = url.split('?')[0].split('#')[0];
        const patterns = [/dailymotion\.com\/video\/([a-zA-Z0-9]+)/, /dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/, /dai\.ly\/([a-zA-Z0-9]+)/, /dailymotion\.com\/(?:swf|embed)\/video\/([a-zA-Z0-9]+)/, /\/\/www\.dailymotion\.com\/video\/([a-zA-Z0-9]+)_/];
        for (const pattern of patterns) {
            const match = cleanUrl.match(pattern);
            if (match) return match[1];
        }
        if (/^[a-zA-Z0-9]+$/.test(url.trim())) return url.trim();
        return '';
    };

    const extractYouTubeId = (url) => {
        if (!url) return '';
        const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /^[a-zA-Z0-9_-]{11}$/];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1] || match[0];
        }
        return '';
    };

    // Load YouTube IFrame API
    useEffect(() => {
        if (videoType !== 'youtube') return;
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);
            window.onYouTubeIframeAPIReady = () => setYouTubeApiReady(true);
        } else setYouTubeApiReady(true);
        return () => { window.onYouTubeIframeAPIReady = null; };
    }, [videoType]);

    // Initialize YouTube player
    useEffect(() => {
        if (!youTubeApiReady || videoType !== 'youtube' || !youtubeId || !youtubeContainerRef.current) return;
        const player = new window.YT.Player(youtubeContainerRef.current, {
            videoId: youtubeId,
            height: '100%', width: '100%',
            playerVars: { autoplay: 1, controls: 1, modestbranding: 0, rel: 1, showinfo: 1, iv_load_policy: 1, fs: 1, disablekb: 0, cc_load_policy: 1, color: 'red', playsinline: 1, origin: window.location.origin, widget_referrer: window.location.origin, enablejsapi: 1, loop: 0, mute: muted ? 1 : 0, hl: 'en', autohide: 0, theme: 'dark' },
            events: {
                onReady: (event) => {
                    setYouTubePlayer(event.target);
                    setVideoLoaded(true);
                    setPlaying(true);
                    setDuration(event.target.getDuration());
                    event.target.setVolume(volume * 100);
                    startYouTubeProgressTracking(event.target);
                },
                onStateChange: (event) => {
                    setPlaying(event.data === window.YT.PlayerState.PLAYING);
                    if (event.data === window.YT.PlayerState.PLAYING) setDuration(event.target.getDuration());
                    if (event.data === window.YT.PlayerState.ENDED) { setProgress(0); setCurrentTime(0); }
                },
                onError: () => setError("Failed to load video. Please try again.")
            }
        });
        return () => { if (player?.destroy) player.destroy(); };
    }, [youTubeApiReady, videoType, youtubeId, muted, volume]);

    const startYouTubeProgressTracking = (player) => {
        const interval = setInterval(() => {
            if (player?.getCurrentTime && player?.getDuration) {
                const current = player.getCurrentTime();
                const total = player.getDuration();
                if (total > 0) { setCurrentTime(current); setProgress(current / total); }
            }
        }, 500);
        return () => clearInterval(interval);
    };

    const handlePlayPause = useCallback((e) => {
        e?.stopPropagation();
        if (isVimeoVideo || isDailyMotionVideo || useEmbed) return;
        if (videoType === 'youtube' && youTubePlayer) {
            playing ? youTubePlayer.pauseVideo() : youTubePlayer.playVideo();
            setPlaying(!playing);
        } else {
            if (!videoRef.current) return;
            const video = videoRef.current;
            if (video.paused || video.ended) {
                video.play().then(() => setPlaying(true)).catch(() => {
                    video.muted = true;
                    setMuted(true);
                    video.play().then(() => setPlaying(true)).catch(() => setError("Unable to play video"));
                });
            } else { video.pause(); setPlaying(false); }
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
        e.stopPropagation();
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoType === 'youtube' && youTubePlayer) youTubePlayer.setVolume(newVolume * 100);
        else if (videoRef.current) videoRef.current.volume = newVolume;
        setMuted(newVolume === 0);
        showControlsWithTimer();
    };

    const handleToggleMute = (e) => {
        e.stopPropagation();
        if (videoType === 'youtube' && youTubePlayer) {
            muted ? (youTubePlayer.unMute(), youTubePlayer.setVolume(volume * 100)) : youTubePlayer.mute();
        } else if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
        setMuted(!muted);
        showControlsWithTimer();
    };

    const handleSeek = (e) => {
        e.stopPropagation();
        const seekTo = parseFloat(e.target.value);
        setProgress(seekTo);
        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = seekTo * youTubePlayer.getDuration();
            youTubePlayer.seekTo(newTime, true);
            setCurrentTime(newTime);
        } else if (videoRef.current && !isNaN(videoRef.current.duration)) {
            const newTime = seekTo * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
        showControlsWithTimer();
    };

    const handleForward = (e, seconds = 10) => {
        e.stopPropagation();
        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = Math.min(youTubePlayer.getCurrentTime() + seconds, youTubePlayer.getDuration());
            youTubePlayer.seekTo(newTime, true);
            setCurrentTime(newTime);
        } else if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handleRewind = (e, seconds = 10) => {
        e.stopPropagation();
        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = Math.max(0, youTubePlayer.getCurrentTime() - seconds);
            youTubePlayer.seekTo(newTime, true);
            setCurrentTime(newTime);
        } else if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
            setCurrentTime(videoRef.current.currentTime);
        }
        showControlsWithTimer();
    };

    const handlePlaybackRate = (rate, e) => {
        e.stopPropagation();
        if (videoType === 'youtube' && youTubePlayer) youTubePlayer.setPlaybackRate(rate);
        else if (videoRef.current) videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
        showControlsWithTimer();
    };

    const handlePartSelect = (part) => { setSelectedPart(part); setShowPartsList(false); setLoading(true); setVideoLoaded(false); setError(''); };

    // Check if download is available (non-YouTube)
    const isDownloadAvailable = (item) => {
        if (!item) return false;
        const link = item.download_link || item.videoUrl;
        if (!link) return false;
        // Don't show download for YouTube videos
        return !(link.includes('youtube.com') || link.includes('youtu.be') || videoType === 'youtube');
    };

    // Download handler - YouTube links filtered out
    const handleDownload = (e, downloadUrl, partInfo = null) => {
        e?.stopPropagation();
        e?.preventDefault();

        if (!downloadUrl) {
            alert('Download link not available');
            return;
        }

        // Double-check for YouTube
        if (downloadUrl.includes('youtube.com') || downloadUrl.includes('youtu.be') || videoType === 'youtube') {
            alert('This is a streaming video and cannot be downloaded directly. Please use the player to watch.');
            return;
        }

        setDownloading(true);
        setDownloadProgress(0);

        const interval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        setTimeout(() => {
            clearInterval(interval);
            setDownloadProgress(100);

            try {
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';

                if (partInfo) {
                    const fileExt = downloadUrl.split('.').pop() || 'mp4';
                    link.download = `${partInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileExt}`;
                } else if (movie) {
                    const fileExt = downloadUrl.split('.').pop() || 'mp4';
                    link.download = `${movie.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileExt}`;
                }

                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    setDownloading(false);
                    setDownloadProgress(0);
                }, 1000);

            } catch {
                window.open(downloadUrl, '_blank');
                setDownloading(false);
                setDownloadProgress(0);
            }
        }, 1000);
    };

    const handleFullscreen = (e) => {
        e.stopPropagation();
        const element = playerContainerRef.current;
        if (!element) return;
        if (!document.fullscreenElement) {
            element.requestFullscreen ? element.requestFullscreen() : element.webkitRequestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen?.();
            setIsFullscreen(false);
        }
        showControlsWithTimer();
    };

    const handleGoHome = () => navigate('/');
    const handleRetry = () => { setRetryCount(prev => prev + 1); setError(''); setLoading(true); setVideoLoaded(false); };
    const handleUseEmbed = () => { setUseEmbed(true); setError(''); setLoading(false); };

    const resetControlsTimer = () => {
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = setTimeout(() => { if (playing) setShowControls(false); }, 3000);
    };

    const showControlsWithTimer = () => { setShowControls(true); resetControlsTimer(); };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes().toString().padStart(2, '0');
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        return hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
    };

    const initializeVideo = (url, type) => {
        if (!url) { setError("No video URL available"); setLoading(false); return; }

        const detectedType = type || detectVideoType(url);
        setVideoType(detectedType);

        if (detectedType === 'dailymotion') {
            setIsDailyMotionVideo(true);
            setIsVimeoVideo(false);
            const dailymotionId = extractDailyMotionId(url);
            if (dailymotionId) {
                setDailyMotionId(dailymotionId);
                setVideoUrl(`https://www.dailymotion.com/embed/video/${dailymotionId}?autoplay=1&controls=1&ui-theme=dark`);
            } else setError("Invalid DailyMotion URL");
        } else if (detectedType === 'vimeo') {
            setIsVimeoVideo(true);
            setIsDailyMotionVideo(false);
            const vimeoId = extractVimeoId(url);
            if (vimeoId) setVideoUrl(`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=1&byline=1&portrait=1&controls=1`);
            else setError("Invalid Vimeo URL");
        } else if (detectedType === 'youtube') {
            setIsVimeoVideo(false);
            setIsDailyMotionVideo(false);
            const youtubeId = extractYouTubeId(url);
            youtubeId ? setYoutubeId(youtubeId) : setError("Invalid YouTube URL");
            setVideoUrl('');
        } else if (detectedType === 'embed') {
            setIsVimeoVideo(false);
            setIsDailyMotionVideo(false);
            const srcMatch = url.match(/src=["']([^"']+)["']/);
            setVideoUrl(srcMatch ? srcMatch[1] : url);
        } else {
            setIsVimeoVideo(false);
            setIsDailyMotionVideo(false);
            setVideoUrl(url);
        }
        setLoading(false);
    };

    const renderVideoPlayer = () => {
        if (useEmbed) return (
            <iframe
                src={videoUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={movie?.title}
                onLoad={() => { setVideoLoaded(true); setPlaying(true); }}
                onError={() => { setError("Failed to load embedded video"); setVideoLoaded(false); }}
            />
        );

        if (isDailyMotionVideo && dailyMotionId) return (
            <div className="relative w-full h-full">
                <div className="absolute top-2 left-2 z-10 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs sm:text-sm">
                    <FaDailymotion className="text-blue-400" /><span>DailyMotion</span>
                </div>
                <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={movie?.title}
                    onLoad={() => { setVideoLoaded(true); setPlaying(true); }}
                    onError={() => { setError("Failed to load DailyMotion video"); setVideoLoaded(false); }}
                />
            </div>
        );

        if (isVimeoVideo) return (
            <div className="relative w-full h-full">
                <div className="absolute top-2 left-2 z-10 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs sm:text-sm">
                    <FaVimeo className="text-blue-400" /><span>Vimeo</span>
                </div>
                <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={movie?.title}
                    onLoad={() => { setVideoLoaded(true); setPlaying(true); }}
                    onError={() => { setError("Failed to load Vimeo video"); setVideoLoaded(false); }}
                />
            </div>
        );

        if (videoType === 'youtube') return (
            <div className="relative w-full h-full bg-black">
                <div className="absolute top-2 left-2 z-10 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs sm:text-sm">
                    <FaYoutube className="text-red-500" /><span>YouTube</span>
                </div>
                <div ref={youtubeContainerRef} className="w-full h-full" style={{ position: 'relative', zIndex: 1 }} />
            </div>
        );

        return (
            <video
                ref={videoRef}
                className="w-full h-full object-contain bg-black"
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                    setVideoLoaded(true);
                    if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                        videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
                    }
                }}
                onPlay={() => { setPlaying(true); setError(''); }}
                onPause={() => setPlaying(false)}
                onError={(e) => {
                    let msg = "Failed to load video. ";
                    const video = videoRef.current;
                    if (video?.error) {
                        switch (video.error.code) {
                            case MediaError.MEDIA_ERR_ABORTED: msg += "Playback aborted."; break;
                            case MediaError.MEDIA_ERR_NETWORK: msg += "Network error."; break;
                            case MediaError.MEDIA_ERR_DECODE: msg += "Corruption or unsupported features."; break;
                            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: msg += "Format not supported."; break;
                            default: msg += "Unknown error.";
                        }
                    } else msg += "Source unavailable.";
                    setError(msg);
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
    };

    const renderPartsList = () => (
        <div className="mb-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl p-3 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold flex items-center gap-1">
                    <FaLayerGroup className="text-green-500 text-sm" />
                    <span>Movie Parts</span>
                    <span className="ml-1 px-2 py-0.5 bg-green-600/20 text-green-400 rounded-full text-xs">
                        {movieParts.length} {movieParts.length === 1 ? 'Part' : 'Parts'}
                    </span>
                </h3>
                <button
                    onClick={() => setShowPartsList(!showPartsList)}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs flex items-center gap-1 border border-gray-700"
                >
                    <FaList className="text-xs" />
                    {showPartsList ? 'Hide' : 'Show'}
                </button>
            </div>

            {showPartsList && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {movieParts.map((part) => {
                        const isSelected = selectedPart?.partNumber === part.partNumber;
                        const canDownload = isDownloadAvailable(part);

                        return (
                            <div
                                key={part.partNumber}
                                onClick={() => handlePartSelect(part)}
                                className={`p-2 rounded-lg cursor-pointer transition-all ${isSelected
                                        ? 'bg-gradient-to-r from-green-600/30 to-teal-600/30 border border-green-500'
                                        : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1 mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isSelected ? 'bg-green-600 text-white' : 'bg-green-600/20 text-green-400'
                                                }`}>
                                                Part {part.partNumber}
                                            </span>
                                            <h4 className="font-semibold text-xs truncate max-w-[100px]">{part.title}</h4>
                                            {part.videoType && part.videoType !== 'youtube' && (
                                                <span className="px-1 py-0.5 bg-blue-600/20 text-blue-400 rounded-full text-[8px]">
                                                    {part.videoType}
                                                </span>
                                            )}
                                        </div>
                                        {part.duration && (
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                <FaClock className="text-[8px]" /> {part.duration}
                                            </div>
                                        )}
                                    </div>

                                    {canDownload && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(e, part.download_link, part);
                                            }}
                                            className="ml-2 p-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg text-white transition-all transform hover:scale-105 shadow-lg shadow-green-600/30 flex items-center gap-1"
                                            disabled={downloading}
                                        >
                                            <FaDownload className="text-xs" />
                                            <span className="text-[8px] hidden xs:inline">Download</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderCommentsSection = () => (
        <div className="mt-4 bg-gray-900/50 rounded-xl p-3 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <FaComment className="text-red-500 text-sm" />
                    Comments ({comments.length})
                </h3>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs"
                >
                    {showComments ? 'Hide' : 'Show'}
                </button>
            </div>

            {showComments && (
                <>
                    <div className="mb-3 p-2 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <img
                                src={userAvatar}
                                alt={userName}
                                className="w-6 h-6 rounded-full border border-red-600"
                                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`; }}
                            />
                            <input
                                type="text"
                                value={userName}
                                onChange={updateUserName}
                                className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs"
                                placeholder="Your name"
                            />
                        </div>

                        <form onSubmit={handleSubmitComment}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs resize-none"
                                placeholder="Share your thoughts..."
                                rows="2"
                                maxLength="500"
                            />
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[8px] text-gray-400">{newComment.length}/500</span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-white font-medium flex items-center gap-1 text-xs"
                                >
                                    {isSubmitting ? (
                                        <><FaSpinner className="animate-spin text-xs" />Posting...</>
                                    ) : (
                                        <><FaPaperPlane className="text-xs" />Post</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {comments.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                <FaComment className="text-2xl mx-auto mb-1 opacity-50" />
                                <p className="text-xs">No comments yet.</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-800/30 rounded-lg p-2 hover:bg-gray-800/50">
                                    <div className="flex items-start gap-2">
                                        <img
                                            src={comment.user_avatar}
                                            alt={comment.user_name}
                                            className="w-6 h-6 rounded-full border border-red-600/50"
                                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_name}`; }}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-xs text-white truncate max-w-[80px]">
                                                        {comment.user_name}
                                                    </span>
                                                    <span className="text-[8px] text-gray-400">
                                                        {formatTimeAgo(comment.created_at)}
                                                    </span>
                                                </div>

                                                {comment.user_name === userName && (
                                                    editingComment === comment.id ? (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleSaveEdit(comment.id)} className="p-0.5 text-green-500">
                                                                <FaCheck className="text-xs" />
                                                            </button>
                                                            <button onClick={() => setEditingComment(null)} className="p-0.5 text-red-500">
                                                                <FaTimes className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleEditComment(comment)} className="p-0.5 text-blue-400">
                                                                <FaEdit className="text-xs" />
                                                            </button>
                                                            <button onClick={() => handleDeleteComment(comment.id)} className="p-0.5 text-red-500">
                                                                <FaTrash className="text-xs" />
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {editingComment === comment.id ? (
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs mt-1"
                                                    rows="2"
                                                    autoFocus
                                                />
                                            ) : (
                                                <p className="text-gray-200 text-xs whitespace-pre-wrap break-words my-1">
                                                    {comment.message}
                                                </p>
                                            )}

                                            <button
                                                onClick={() => handleLikeComment(comment.id)}
                                                className="flex items-center gap-1 text-gray-400 hover:text-red-500 text-xs"
                                            >
                                                <FaHeart className={comment.likes > 0 ? 'text-red-500' : ''} />
                                                <span>{comment.likes || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={commentsEndRef} />
                    </div>
                </>
            )}
        </div>
    );

    const renderRelatedMovies = () => {
        if (relatedLoading) return (
            <div className="mt-4 bg-gray-900/30 rounded-xl p-3 border border-gray-800">
                <h3 className="text-base font-bold flex items-center gap-2 mb-3">
                    <FaPlayCircle className="text-purple-500 text-sm" />
                    <span>Related Movies</span>
                </h3>
                <div className="flex justify-center py-2">
                    <FaSpinner className="text-lg text-purple-500 animate-spin" />
                </div>
            </div>
        );

        if (relatedMovies.length === 0) return null;

        const DISPLAY_LIMIT = 5;

        return (
            <div className="mt-4 bg-gray-900/30 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold flex items-center gap-1">
                        <FaPlayCircle className="text-purple-500 text-sm" />
                        <span>Related Movies</span>
                    </h3>
                    <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                        {relatedMovies.length} available
                    </span>
                </div>

                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {relatedMovies.slice(0, DISPLAY_LIMIT).map(rm => (
                        <div
                            key={rm.id}
                            onClick={() => handleRelatedMovieClick(rm)}
                            className="group cursor-pointer transition-all hover:scale-105 relative"
                        >
                            <div className="relative rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={rm.poster || rm.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image'}
                                    alt={rm.title}
                                    className="w-full aspect-[2/3] object-cover group-hover:opacity-80"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                        <FaPlay className="text-white ml-0.5 text-xs" />
                                    </div>
                                </div>
                                <div className="absolute top-1 left-1 flex gap-0.5">
                                    {rm.imdbRating && (
                                        <span className="bg-yellow-600 text-white text-[8px] px-1 py-0.5 rounded-full">
                                            {rm.imdbRating}
                                        </span>
                                    )}
                                    {rm.year && (
                                        <span className="bg-blue-600 text-white text-[8px] px-1 py-0.5 rounded-full">
                                            {rm.year}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black to-transparent">
                                    <h4 className="text-white font-medium text-[8px] line-clamp-1">{rm.title}</h4>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative md:hidden">
                    {relatedMovies.length > DISPLAY_LIMIT && (
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 rounded-full p-1 shadow-lg border border-purple-500/30"
                        >
                            <FaChevronLeft className="text-white text-xs" />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-1 overflow-x-auto scrollbar-hide pb-2 px-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                        {relatedMovies.slice(0, DISPLAY_LIMIT).map(rm => (
                            <div
                                key={rm.id}
                                onClick={() => handleRelatedMovieClick(rm)}
                                className="flex-none w-[80px] group cursor-pointer"
                            >
                                <div className="relative rounded-lg overflow-hidden shadow-lg">
                                    <img
                                        src={rm.poster || rm.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image'}
                                        alt={rm.title}
                                        className="w-full aspect-[2/3] object-cover"
                                        loading="lazy"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 group-hover:opacity-100 flex items-center justify-center">
                                        <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                                            <FaPlay className="text-white ml-0.5 text-[6px]" />
                                        </div>
                                    </div>
                                    <div className="absolute top-0.5 left-0.5">
                                        <span className="bg-yellow-600 text-white text-[6px] px-0.5 py-0.5 rounded-full">
                                            {rm.imdbRating}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-0.5 bg-gradient-to-t from-black to-transparent">
                                        <h4 className="text-white font-medium text-[6px] line-clamp-1">{rm.title}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {relatedMovies.length > DISPLAY_LIMIT && (
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 rounded-full p-1 shadow-lg border border-purple-500/30"
                        >
                            <FaChevronRight className="text-white text-xs" />
                        </button>
                    )}
                </div>

                {relatedMovies.length > DISPLAY_LIMIT && (
                    <div className="text-center mt-2">
                        <button
                            onClick={() => navigate(`/?category=${movie.category?.split(',')[0].trim() || 'all'}`)}
                            className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 bg-purple-900/20 px-2 py-1 rounded-full"
                        >
                            View all {relatedMovies.length} <FaChevronRight className="text-[6px]" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const shouldShowCustomControls = !isVimeoVideo && !isDailyMotionVideo && !useEmbed && videoType !== 'youtube';

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-white text-sm">Loading player...</p>
            </div>
        </div>
    );

    if (error || !movie) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-3">
            <div className="text-center p-4 max-w-sm bg-gray-900/50 rounded-xl border border-gray-800">
                <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-2" />
                <h1 className="text-lg text-white font-bold mb-2">Playback Error</h1>
                <p className="text-xs text-gray-400 mb-3">{error || "No movie selected"}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                    <button onClick={() => navigate(-1)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs">Go Back</button>
                    <button onClick={handleGoHome} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xs flex items-center gap-1"><FaHome className="text-xs" /> Home</button>
                </div>
            </div>
        </div>
    );

    const showMainDownload = isDownloadAvailable(selectedPart) || (!selectedPart && movie && isDownloadAvailable(movie));

    return (
        <div className="min-h-screen bg-black text-white">
            {!isFullscreen && (
                <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/90 to-transparent z-10">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white hover:text-red-500 transition-colors text-xs">
                            <FaArrowLeft className="text-xs" />
                            <span className="hidden xs:inline">Back</span>
                        </button>
                        <div className="flex-1 text-center px-1">
                            <h1 className="text-sm font-bold truncate max-w-[120px] mx-auto">{movie.title}</h1>
                            {selectedPart && (
                                <div className="text-[8px] text-green-400 truncate">Part {selectedPart.partNumber}</div>
                            )}
                        </div>
                        <div className="w-12"></div>
                    </div>
                </div>
            )}

            <div
                ref={playerContainerRef}
                className={`relative w-full ${isMobile ? 'h-[35vh] sm:h-[45vh] md:h-[55vh]' : 'h-screen'} bg-black`}
                onMouseMove={shouldShowCustomControls ? showControlsWithTimer : undefined}
                onMouseLeave={() => shouldShowCustomControls && setShowControls(false)}
                onClick={(e) => {
                    if (shouldShowCustomControls && !e.target.closest('button') && !e.target.closest('input')) handlePlayPause(e);
                    if (shouldShowCustomControls) showControlsWithTimer();
                }}
                style={isFullscreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 } : {}}
            >
                {renderVideoPlayer()}

                {shouldShowCustomControls && videoLoaded && !playing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                        <button onClick={handlePlayPause} className="w-10 h-10 sm:w-16 sm:h-16 bg-red-600/90 hover:bg-red-700 rounded-full flex items-center justify-center">
                            <FaPlay size={isMobile ? 14 : 20} className="text-white ml-1" />
                        </button>
                    </div>
                )}

                {!videoLoaded && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <div className="text-center">
                            <FaSpinner className="text-lg text-red-600 animate-spin mx-auto mb-1" />
                            <p className="text-white text-xs">Loading...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-2">
                        <div className="text-center p-2 max-w-xs">
                            <FaExclamationTriangle className="text-red-500 text-xl mx-auto mb-1" />
                            <p className="text-white text-xs mb-2">{error}</p>
                            <div className="flex gap-2 justify-center">
                                <button onClick={handleRetry} className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white text-[10px]">Retry</button>
                                <button onClick={handleUseEmbed} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-[10px]">Embed</button>
                            </div>
                        </div>
                    </div>
                )}

                {shouldShowCustomControls && (
                    <div className={`absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.001"
                                    value={progress}
                                    onChange={handleSeek}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                                />
                                <div className="flex justify-between text-[8px] text-gray-300">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <button onClick={handlePlayPause} className="hover:text-red-500 p-1">
                                        {playing ? <FaPause className="text-sm" /> : <FaPlay className="text-sm ml-0.5" />}
                                    </button>

                                    {!isMobile && (
                                        <>
                                            <button onClick={(e) => handleRewind(e, 10)} className="hover:text-red-500 p-1">
                                                <FaBackward className="text-xs" />
                                            </button>
                                            <button onClick={(e) => handleForward(e, 10)} className="hover:text-red-500 p-1">
                                                <FaForward className="text-xs" />
                                            </button>
                                        </>
                                    )}

                                    {!isMobile && (
                                        <div className="flex items-center gap-1 ml-1">
                                            <button onClick={handleToggleMute} className="hover:text-red-500 p-1">
                                                {muted ? <FaVolumeMute className="text-xs" /> : <FaVolumeUp className="text-xs" />}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-12 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {!isMobile && (
                                        <div className="relative group">
                                            <button className="px-1 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-[8px]">
                                                {playbackRate}x
                                            </button>
                                            <div className="absolute right-0 bottom-full mb-1 bg-gray-900 border border-gray-700 rounded p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                                                <div className="grid grid-cols-3 gap-0.5">
                                                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                                        <button
                                                            key={rate}
                                                            onClick={(e) => handlePlaybackRate(rate, e)}
                                                            className={`px-1 py-0.5 text-[6px] rounded ${playbackRate === rate ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                        >
                                                            {rate}x
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleFullscreen} className="hover:text-red-500 p-1">
                                        {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!isFullscreen && (
                <div className="max-w-7xl mx-auto px-2 py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        <div className="lg:col-span-2">
                            <h1 className="text-base font-bold mb-1 break-words">{movie.title}</h1>

                            <div className="flex flex-wrap gap-1 mb-2">
                                {movie.year && <span className="px-2 py-0.5 bg-red-600 rounded-full text-[8px]">{movie.year}</span>}
                                {movie.imdbRating && (
                                    <span className="px-2 py-0.5 bg-yellow-600 rounded-full flex items-center gap-0.5 text-[8px]">
                                        <FaStar className="text-[6px]" /> {movie.imdbRating}
                                    </span>
                                )}
                                {movie.category && (
                                    <span className="px-2 py-0.5 bg-purple-600 rounded-full text-[8px] truncate max-w-[60px]">
                                        {movie.category.split(',')[0]}
                                    </span>
                                )}
                                {movieParts.length > 0 && (
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center gap-0.5 text-[8px]">
                                        <FaLayerGroup className="text-[6px]" />
                                        <span>{movieParts.length}</span>
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-300 mb-3 whitespace-pre-wrap break-words">
                                {movie.description || 'No description'}
                            </p>

                            {movieParts.length > 0 && renderPartsList()}

                            {showMainDownload && (
                                <div className="mb-3">
                                    <button
                                        onClick={(e) => handleDownload(e, selectedPart?.download_link || movie?.download_link || movie?.videoUrl, selectedPart)}
                                        className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-semibold text-xs shadow-lg shadow-green-600/30 transition-all transform hover:scale-[1.02] border border-green-400/30"
                                        disabled={downloading}
                                    >
                                        {downloading ? (
                                            <>
                                                <FaSpinner className="animate-spin text-xs" />
                                                <span className="text-xs">
                                                    {downloadProgress < 100 ? `Preparing... ${downloadProgress}%` : 'Starting...'}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <FaDownload className="text-sm" />
                                                <span className="text-xs">
                                                    {selectedPart ? `Download Part ${selectedPart.partNumber}` : `Download`}
                                                </span>
                                                {movie.quality && (
                                                    <span className="text-[8px] opacity-75 ml-1">({movie.quality})</span>
                                                )}
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[8px] text-gray-400 mt-1 text-center">Click to download</p>
                                </div>
                            )}

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