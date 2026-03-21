import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress,
    FaArrowLeft, FaHome, FaStar, FaForward, FaBackward,
    FaVideo, FaComment, FaHeart, FaPaperPlane, FaTrash, FaEdit, FaCheck, FaTimes,
    FaSpinner, FaExclamationTriangle, FaDownload,
    FaFilm, FaTv, FaFire, FaClock,
    FaPlayCircle, FaChevronRight, FaChevronLeft,
    FaYoutube, FaVimeo, FaDailymotion, FaList, FaLayerGroup,
    FaLanguage, FaCalendarAlt, FaTag, FaInfoCircle
} from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { MoviesContext } from '../context/MoviesContext';

const Player = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { movies } = useContext(MoviesContext);

    // Refs
    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const youtubeContainerRef = useRef(null);
    const controlsTimerRef = useRef(null);
    const commentsEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // State
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
    const [retryCount, setRetryCount] = useState(0);
    const [useEmbed, setUseEmbed] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [youtubeId, setYoutubeId] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [youTubePlayer, setYouTubePlayer] = useState(null);
    const [youTubeApiReady, setYouTubeApiReady] = useState(false);
    const [isVimeoVideo, setIsVimeoVideo] = useState(false);
    const [isDailyMotionVideo, setIsDailyMotionVideo] = useState(false);
    const [dailyMotionId, setDailyMotionId] = useState('');

    // Movie parts
    const [movieParts, setMovieParts] = useState([]);
    const [selectedPart, setSelectedPart] = useState(null);

    // Comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [userAvatar, setUserAvatar] = useState('');

    // Related movies
    const [relatedMovies, setRelatedMovies] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    // Constants
    const DISPLAY_LIMIT = 5;
    const isStreamingVideo = isVimeoVideo || isDailyMotionVideo || useEmbed || videoType === 'youtube';
    const showCustomControls = !isStreamingVideo;

    // Initialize movie from context
    useEffect(() => {
        if (!movie && id && movies.length) {
            const found = movies.find(m => m.id === id || m.id === parseInt(id));
            if (found) {
                setMovie({ ...found, download_link: found.download_link || found.download });
                setError('');
            } else setError('Movie not found');
        }
    }, [movie, id, movies]);

    // Parse movie parts
    useEffect(() => {
        if (movie?.download) {
            try {
                const parsed = typeof movie.download === 'string' ? JSON.parse(movie.download) : movie.download;
                const parts = Array.isArray(parsed) ? parsed : parsed?.parts || [];
                setMovieParts(parts);
                if (parts.length && !selectedPart) setSelectedPart(parts[0]);
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

    // Find related movies
    useEffect(() => {
        if (movie && movies.length) findRelatedMovies();
    }, [movie, movies]);

    // Load YouTube API
    useEffect(() => {
        if (videoType !== 'youtube') return;
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
            window.onYouTubeIframeAPIReady = () => setYouTubeApiReady(true);
        } else setYouTubeApiReady(true);
    }, [videoType]);

    // Initialize YouTube player
    useEffect(() => {
        if (!youTubeApiReady || videoType !== 'youtube' || !youtubeId) return;
        const player = new window.YT.Player(youtubeContainerRef.current, {
            videoId: youtubeId,
            height: '100%', width: '100%',
            playerVars: {
                autoplay: 1,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                fs: 1,
                cc_load_policy: 1,
                playsinline: 1,
                showinfo: 0,
                iv_load_policy: 3
            },
            events: {
                onReady: (e) => {
                    setYouTubePlayer(e.target);
                    setVideoLoaded(true);
                    setPlaying(true);
                    setDuration(e.target.getDuration());
                    e.target.setVolume(volume * 100);
                    startYouTubeTracking(e.target);
                },
                onStateChange: (e) => {
                    setPlaying(e.data === window.YT.PlayerState.PLAYING);
                    if (e.data === window.YT.PlayerState.ENDED) {
                        setProgress(0);
                        setCurrentTime(0);
                    }
                },
                onError: () => setError('Failed to load YouTube video')
            }
        });
        return () => player?.destroy?.();
    }, [youTubeApiReady, videoType, youtubeId]);

    // Load user data and comments
    useEffect(() => {
        const saved = localStorage.getItem('videoCommenter');
        if (saved) {
            const { name, avatar } = JSON.parse(saved);
            setUserName(name);
            setUserAvatar(avatar);
        } else {
            const random = `User${Math.floor(Math.random() * 10000)}`;
            const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${random}`;
            setUserName(random);
            setUserAvatar(avatar);
            localStorage.setItem('videoCommenter', JSON.stringify({ name: random, avatar }));
        }
        if (movie?.id) fetchComments();
    }, [movie]);

    // Utility functions
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes().toString().padStart(2, '0');
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        return hh ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
    };

    const formatTimeAgo = (timestamp) => {
        const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const detectVideoType = (url) => {
        if (!url) return 'direct';
        if (url.includes('dailymotion') || url.includes('dai.ly')) return 'dailymotion';
        if (url.includes('vimeo')) return 'vimeo';
        if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
        if (url.match(/\.(mp4|webm|mkv|m3u8|mpd|ogg)$/i)) return 'direct';
        if (url.includes('<iframe') || url.includes('embed')) return 'embed';
        return 'direct';
    };

    const extractId = (url, type) => {
        if (type === 'vimeo') {
            const match = url.match(/(\d+)/);
            return match ? match[0] : '';
        }
        if (type === 'dailymotion') {
            const match = url.match(/video\/([a-zA-Z0-9]+)/) || url.match(/dai\.ly\/([a-zA-Z0-9]+)/);
            return match ? match[1] : '';
        }
        if (type === 'youtube') {
            const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
            return match ? match[1] : '';
        }
        return '';
    };

    const initializeVideo = (url, type) => {
        if (!url) { setError('No video URL'); setLoading(false); return; }

        const detectedType = type || detectVideoType(url);
        setVideoType(detectedType);
        setIsVimeoVideo(detectedType === 'vimeo');
        setIsDailyMotionVideo(detectedType === 'dailymotion');

        if (detectedType === 'dailymotion') {
            const id = extractId(url, 'dailymotion');
            if (id) {
                setDailyMotionId(id);
                setVideoUrl(`https://www.dailymotion.com/embed/video/${id}?autoplay=1`);
            } else setError('Invalid DailyMotion URL');
        } else if (detectedType === 'vimeo') {
            const id = extractId(url, 'vimeo');
            if (id) setVideoUrl(`https://player.vimeo.com/video/${id}?autoplay=1`);
            else setError('Invalid Vimeo URL');
        } else if (detectedType === 'youtube') {
            const id = extractId(url, 'youtube');
            id ? setYoutubeId(id) : setError('Invalid YouTube URL');
        } else if (detectedType === 'embed') {
            const src = url.match(/src=["']([^"']+)["']/)?.[1] || url;
            setVideoUrl(src);
        } else {
            setVideoUrl(url);
        }
        setLoading(false);
    };

    const startYouTubeTracking = (player) => {
        const interval = setInterval(() => {
            if (player?.getCurrentTime) {
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

    const resetControlsTimer = () => {
        clearTimeout(controlsTimerRef.current);
        if (playing && showCustomControls) {
            controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    };

    const showControlsWithTimer = () => {
        setShowControls(true);
        resetControlsTimer();
    };

    // Video controls
    const handlePlayPause = useCallback((e) => {
        e?.stopPropagation();
        if (isStreamingVideo) return;

        if (videoType === 'youtube' && youTubePlayer) {
            playing ? youTubePlayer.pauseVideo() : youTubePlayer.playVideo();
        } else if (videoRef.current) {
            const video = videoRef.current;
            if (video.paused || video.ended) {
                video.play().catch(() => {
                    video.muted = true;
                    setMuted(true);
                    video.play();
                });
            } else {
                video.pause();
            }
        }
        showControlsWithTimer();
    }, [isStreamingVideo, videoType, youTubePlayer, playing]);

    const handleVolume = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoType === 'youtube' && youTubePlayer) {
            youTubePlayer.setVolume(val * 100);
        } else if (videoRef.current) {
            videoRef.current.volume = val;
        }
        setMuted(val === 0);
        showControlsWithTimer();
    };

    const handleToggleMute = () => {
        if (videoType === 'youtube' && youTubePlayer) {
            muted ? youTubePlayer.unMute() : youTubePlayer.mute();
        } else if (videoRef.current) {
            videoRef.current.muted = !muted;
        }
        setMuted(!muted);
        showControlsWithTimer();
    };

    const handleSeek = (e) => {
        const seekTo = parseFloat(e.target.value);
        setProgress(seekTo);

        if (videoType === 'youtube' && youTubePlayer) {
            const time = seekTo * youTubePlayer.getDuration();
            youTubePlayer.seekTo(time, true);
            setCurrentTime(time);
        } else if (videoRef.current?.duration) {
            videoRef.current.currentTime = seekTo * videoRef.current.duration;
        }
        showControlsWithTimer();
    };

    const handleSkip = (seconds) => {
        if (videoType === 'youtube' && youTubePlayer) {
            const time = youTubePlayer.getCurrentTime() + seconds;
            youTubePlayer.seekTo(Math.max(0, Math.min(time, youTubePlayer.getDuration())), true);
        } else if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + seconds);
        }
        showControlsWithTimer();
    };

    const handlePlaybackRate = (rate) => {
        if (videoType === 'youtube' && youTubePlayer) {
            youTubePlayer.setPlaybackRate(rate);
        } else if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
        setPlaybackRate(rate);
        showControlsWithTimer();
    };

    const handleFullscreen = () => {
        const el = playerContainerRef.current;
        if (!document.fullscreenElement) {
            el?.requestFullscreen?.() || el?.webkitRequestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
            setIsFullscreen(false);
        }
        showControlsWithTimer();
    };

    // Download handler
    const handleDownload = (url, part = null) => {
        if (!url || url.match(/youtube|vimeo|dailymotion|dai\.ly/)) {
            alert('Streaming videos cannot be downloaded');
            return;
        }

        setDownloading(true);
        setDownloadProgress(0);

        const interval = setInterval(() => setDownloadProgress(p => Math.min(p + 10, 90)), 200);

        setTimeout(() => {
            clearInterval(interval);
            setDownloadProgress(100);

            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = part?.title
                ? `${part.title.replace(/[^a-z0-9]/gi, '_')}.mp4`
                : `${movie?.title?.replace(/[^a-z0-9]/gi, '_')}.mp4`;

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                setDownloading(false);
                setDownloadProgress(0);
            }, 1000);
        }, 1000);
    };

    // Comments functions
    const fetchComments = async () => {
        try {
            const { data } = await supabase
                .from('comments')
                .select('*')
                .eq('movie_id', movie.id.toString())
                .order('created_at', { ascending: false });
            setComments(data || []);
        } catch {
            const local = localStorage.getItem(`comments_${movie.id}`);
            if (local) setComments(JSON.parse(local));
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !userName.trim()) return;

        setIsSubmitting(true);
        const comment = {
            movie_id: movie.id.toString(),
            user_name: userName,
            user_avatar: userAvatar,
            message: newComment.trim(),
            likes: 0
        };

        try {
            const { data } = await supabase.from('comments').insert([comment]).select();
            setComments(prev => [data[0], ...prev]);
            setNewComment('');
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch {
            const fallback = { ...comment, id: Date.now(), created_at: new Date().toISOString() };
            const existing = JSON.parse(localStorage.getItem(`comments_${movie.id}`) || '[]');
            existing.unshift(fallback);
            localStorage.setItem(`comments_${movie.id}`, JSON.stringify(existing));
            setComments(existing);
            setNewComment('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeComment = async (id) => {
        const comment = comments.find(c => c.id === id);
        if (!comment) return;

        try {
            await supabase.from('comments').update({ likes: (comment.likes || 0) + 1 }).eq('id', id);
            setComments(prev => prev.map(c => c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c));
        } catch {
            setComments(prev => prev.map(c => c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c));
        }
    };

    const handleEditComment = (id) => {
        const comment = comments.find(c => c.id === id);
        setEditingComment(id);
        setEditText(comment.message);
    };

    const handleSaveEdit = async (id) => {
        try {
            await supabase.from('comments').update({ message: editText.trim() }).eq('id', id);
            setComments(prev => prev.map(c => c.id === id ? { ...c, message: editText.trim() } : c));
            setEditingComment(null);
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDeleteComment = async (id) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await supabase.from('comments').delete().eq('id', id);
            setComments(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const updateUserName = (e) => {
        setUserName(e.target.value);
        const userData = JSON.parse(localStorage.getItem('videoCommenter') || '{}');
        userData.name = e.target.value;
        localStorage.setItem('videoCommenter', JSON.stringify(userData));
    };

    // Related movies functions
    const findRelatedMovies = () => {
        setRelatedLoading(true);
        const categories = movie.category?.split(',').map(c => c.trim().toLowerCase()) || [];
        const year = movie.year ? parseInt(movie.year) : null;

        const scored = movies
            .filter(m => m.id !== movie.id && m.type === 'movie')
            .map(m => {
                let score = 0;
                const otherCats = m.category?.split(',').map(c => c.trim().toLowerCase()) || [];
                score += categories.filter(c => otherCats.includes(c)).length * 10;

                const otherYear = m.year ? parseInt(m.year) : null;
                if (year && otherYear && Math.abs(year - otherYear) <= 2) score += 5;
                if (m.rating && parseFloat(m.rating) >= 8) score += 3;

                return { movie: m, score };
            })
            .filter(i => i.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, DISPLAY_LIMIT)
            .map(i => i.movie);

        if (scored.length < DISPLAY_LIMIT) {
            const popular = movies
                .filter(m => m.id !== movie.id && m.type === 'movie' && !scored.some(s => s.id === m.id))
                .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
                .slice(0, DISPLAY_LIMIT - scored.length);
            setRelatedMovies([...scored, ...popular]);
        } else {
            setRelatedMovies(scored);
        }
        setRelatedLoading(false);
    };

    const handleRelatedMovieClick = (related) => {
        navigate(`/player/${related.id}`, {
            state: { movie: { ...related, download_link: related.download_link || related.download } }
        });
    };

    const scrollRelated = (direction) => {
        scrollContainerRef.current?.scrollBy({ left: direction * 200, behavior: 'smooth' });
    };

    // Check download availability
    const canDownload = (item) => {
        if (!item) return false;
        const link = item.download_link || item.download || item.videoUrl;
        if (!link) return false;
        const str = String(link).toLowerCase();
        return !str.match(/youtube|youtu\.be|vimeo|dailymotion|dai\.ly|<iframe|embed/);
    };

    const getDownloadLink = (item) => {
        return item?.download_link || item?.download || item?.videoUrl;
    };

    // Render video player
    const renderVideo = () => {
        if (useEmbed) {
            return (
                <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={movie?.title}
                    onLoad={() => { setVideoLoaded(true); setPlaying(true); }}
                />
            );
        }

        if (isDailyMotionVideo) {
            return (
                <div className="relative w-full h-full">
                    <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs sm:text-sm">
                        <FaDailymotion className="text-blue-400 text-sm" />
                        <span className="font-medium">DailyMotion</span>
                    </div>
                    <iframe
                        src={videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title={movie?.title}
                        onLoad={() => { setVideoLoaded(true); setPlaying(true); }}
                    />
                </div>
            );
        }

        if (isVimeoVideo) {
            return (
                <div className="relative w-full h-full">
                    <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs sm:text-sm">
                        <FaVimeo className="text-blue-400 text-sm" />
                        <span className="font-medium">Vimeo</span>
                    </div>
                    <iframe
                        src={videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title={movie?.title}
                        onLoad={() => { setVideoLoaded(true); setPlaying(true); }}
                    />
                </div>
            );
        }

        if (videoType === 'youtube') {
            return (
                <div className="relative w-full h-full bg-black">
                    <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs sm:text-sm">
                        <FaYoutube className="text-red-500 text-sm" />
                        <span className="font-medium">YouTube Trailer</span>
                    </div>
                    <div ref={youtubeContainerRef} className="w-full h-full" />
                </div>
            );
        }

        return (
            <video
                ref={videoRef}
                className="w-full h-full object-contain bg-black"
                src={videoUrl}
                onTimeUpdate={() => {
                    if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                        setProgress(videoRef.current.currentTime / (videoRef.current.duration || 1));
                    }
                }}
                onLoadedMetadata={() => {
                    setVideoLoaded(true);
                    setDuration(videoRef.current?.duration || 0);
                    videoRef.current?.play().catch(() => setPlaying(false));
                }}
                onPlay={() => { setPlaying(true); setError(''); }}
                onPause={() => setPlaying(false)}
                onError={() => setError('Failed to load video')}
                playsInline
                muted={muted}
                crossOrigin="anonymous"
            />
        );
    };

    // Render parts list - With download buttons for each part
    const renderPartsList = () => (
        <div className="mb-5 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
                <FaLayerGroup className="text-purple-500 text-base" />
                <h3 className="text-base font-bold">Movie Parts ({movieParts.length})</h3>
            </div>

            <div className="space-y-2">
                {movieParts.map((part) => {
                    const isSelected = selectedPart?.partNumber === part.partNumber;
                    const canDownloadPart = canDownload(part);

                    return (
                        <div
                            key={part.partNumber}
                            onClick={() => { setSelectedPart(part); }}
                            className={`p-3 rounded-xl cursor-pointer transition-all ${isSelected
                                ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500'
                                : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isSelected ? 'bg-purple-600' : 'bg-purple-600/20 text-purple-400'}`}>
                                            Part {part.partNumber}
                                        </span>
                                        <span className="font-semibold text-sm truncate">{part.title}</span>
                                    </div>
                                    {part.duration && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <FaClock className="text-xs" />
                                            <span>{part.duration}</span>
                                        </div>
                                    )}
                                </div>

                                {canDownloadPart && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(getDownloadLink(part), part);
                                        }}
                                        className="ml-3 p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white transition-all transform hover:scale-105 shadow-lg shadow-purple-600/30"
                                        disabled={downloading}
                                    >
                                        <FaDownload className="text-sm" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Render comments section
    const renderComments = () => (
        <div className="mt-5 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                    <FaComment className="text-purple-500" />
                    Comments ({comments.length})
                </h3>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-all"
                >
                    {showComments ? 'Hide' : 'Show'}
                </button>
            </div>

            {showComments && (
                <>
                    <div className="mb-4 p-4 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={userAvatar}
                                alt={userName}
                                className="w-10 h-10 rounded-full border-2 border-purple-600"
                            />
                            <input
                                type="text"
                                value={userName}
                                onChange={updateUserName}
                                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                placeholder="Your name"
                            />
                        </div>

                        <form onSubmit={handleSubmitComment}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-purple-500"
                                placeholder="Share your thoughts about this movie..."
                                rows="3"
                                maxLength="500"
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">{newComment.length}/500</span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-700 rounded-lg text-white font-medium flex items-center gap-2 text-sm transition-all"
                                >
                                    {isSubmitting ? (
                                        <><FaSpinner className="animate-spin" />Posting...</>
                                    ) : (
                                        <><FaPaperPlane />Post Comment</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {comments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FaComment className="text-4xl mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-all">
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={comment.user_avatar}
                                            alt={comment.user_name}
                                            className="w-10 h-10 rounded-full border border-purple-600/50"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-sm text-white">
                                                        {comment.user_name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatTimeAgo(comment.created_at)}
                                                    </span>
                                                </div>

                                                {comment.user_name === userName && (
                                                    editingComment === comment.id ? (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleSaveEdit(comment.id)} className="p-1 text-green-500 hover:bg-green-500/10 rounded transition">
                                                                <FaCheck className="text-xs" />
                                                            </button>
                                                            <button onClick={() => setEditingComment(null)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition">
                                                                <FaTimes className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleEditComment(comment.id)} className="p-1 text-blue-400 hover:bg-blue-400/10 rounded transition">
                                                                <FaEdit className="text-xs" />
                                                            </button>
                                                            <button onClick={() => handleDeleteComment(comment.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition">
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
                                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm mt-2 focus:outline-none focus:border-purple-500"
                                                    rows="2"
                                                    autoFocus
                                                />
                                            ) : (
                                                <p className="text-gray-200 text-sm whitespace-pre-wrap break-words my-2 leading-relaxed">
                                                    {comment.message}
                                                </p>
                                            )}

                                            <button
                                                onClick={() => handleLikeComment(comment.id)}
                                                className="flex items-center gap-1.5 text-gray-400 hover:text-purple-500 text-sm transition-all mt-1"
                                            >
                                                <FaHeart className={comment.likes > 0 ? 'text-purple-500' : ''} />
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

    // Render related movies
    const renderRelated = () => {
        if (relatedLoading) {
            return (
                <div className="mt-5 bg-gray-900/30 rounded-xl p-4 border border-gray-800">
                    <h3 className="text-base font-bold mb-3">You May Also Like</h3>
                    <div className="flex justify-center py-4">
                        <FaSpinner className="text-purple-500 animate-spin text-xl" />
                    </div>
                </div>
            );
        }

        if (!relatedMovies.length) return null;

        return (
            <div className="mt-5 bg-gray-900/30 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold flex items-center gap-2">
                        <FaPlayCircle className="text-purple-500" />
                        <span>You May Also Like</span>
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                        {relatedMovies.length} movies
                    </span>
                </div>

                {/* Desktop grid */}
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {relatedMovies.map(rm => (
                        <div
                            key={rm.id}
                            onClick={() => handleRelatedMovieClick(rm)}
                            className="group cursor-pointer transition-all hover:scale-105 relative"
                        >
                            <div className="relative rounded-xl overflow-hidden shadow-lg">
                                <img
                                    src={rm.poster || rm.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image'}
                                    alt={rm.title}
                                    className="w-full aspect-[2/3] object-cover group-hover:opacity-80 transition-all"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                        <FaPlay className="text-white ml-0.5 text-sm" />
                                    </div>
                                </div>
                                <div className="absolute top-2 left-2 flex gap-1">
                                    {rm.rating && (
                                        <span className="bg-yellow-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            ★ {rm.rating}
                                        </span>
                                    )}
                                    {rm.year && (
                                        <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            {rm.year}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                                    <h4 className="text-white font-medium text-sm line-clamp-1">{rm.title}</h4>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile scroll */}
                <div className="relative md:hidden">
                    {relatedMovies.length > DISPLAY_LIMIT && (
                        <button
                            onClick={() => scrollRelated(-1)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-purple-500/30"
                        >
                            <FaChevronLeft className="text-white text-xs" />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                        {relatedMovies.map(rm => (
                            <div
                                key={rm.id}
                                onClick={() => handleRelatedMovieClick(rm)}
                                className="flex-none w-28 group cursor-pointer"
                            >
                                <div className="relative rounded-xl overflow-hidden shadow-lg">
                                    <img
                                        src={rm.poster || rm.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image'}
                                        alt={rm.title}
                                        className="w-full aspect-[2/3] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 flex items-center justify-center">
                                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                            <FaPlay className="text-white ml-0.5 text-[8px]" />
                                        </div>
                                    </div>
                                    <div className="absolute top-1 left-1">
                                        {rm.rating && (
                                            <span className="bg-yellow-600 text-white text-[8px] px-1 py-0.5 rounded-full">
                                                ★ {rm.rating}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black to-transparent">
                                        <h4 className="text-white font-medium text-xs line-clamp-1">{rm.title}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {relatedMovies.length > DISPLAY_LIMIT && (
                        <button
                            onClick={() => scrollRelated(1)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-purple-500/30"
                        >
                            <FaChevronRight className="text-white text-xs" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-white text-sm">Loading player...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !movie) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4">
                <div className="text-center p-6 max-w-sm bg-gray-900/50 rounded-2xl border border-gray-800">
                    <FaExclamationTriangle className="text-purple-500 text-5xl mx-auto mb-3" />
                    <h1 className="text-xl text-white font-bold mb-2">Playback Error</h1>
                    <p className="text-sm text-gray-400 mb-4">{error || 'No movie selected'}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-sm font-medium transition-all">
                            Go Back
                        </button>
                        <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all">
                            <FaHome className="text-sm" /> Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
            {/* Header - only show when not fullscreen */}
            {!isFullscreen && (
                <div className="sticky top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-white hover:text-purple-500 transition-all text-sm font-medium"
                        >
                            <FaArrowLeft className="text-sm" />
                            <span>Back</span>
                        </button>
                        <div className="flex-1 text-center px-3">
                            <h1 className="text-sm md:text-base font-bold truncate max-w-[200px] md:max-w-md mx-auto">
                                {movie.title}
                            </h1>
                            {selectedPart && (
                                <div className="text-xs text-purple-400 mt-0.5">Part {selectedPart.partNumber}</div>
                            )}
                        </div>
                        <div className="w-16" />
                    </div>
                </div>
            )}

            {/* Video Player Container - Optimized for all devices */}
            <div
                ref={playerContainerRef}
                className="relative w-full bg-black"
                style={{ height: isFullscreen ? '100vh' : 'min(70vh, 600px)' }}
                onMouseMove={showCustomControls ? showControlsWithTimer : undefined}
                onMouseLeave={() => showCustomControls && setShowControls(false)}
                onClick={(e) => {
                    if (showCustomControls && !e.target.closest('button') && !e.target.closest('input')) {
                        handlePlayPause(e);
                    }
                    if (showCustomControls) showControlsWithTimer();
                }}
            >
                {renderVideo()}

                {/* Play overlay when paused */}
                {showCustomControls && videoLoaded && !playing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                        <button
                            onClick={handlePlayPause}
                            className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110"
                        >
                            <FaPlay size={20} className="text-white ml-1" />
                        </button>
                    </div>
                )}

                {/* Loading overlay */}
                {!videoLoaded && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                        <div className="text-center">
                            <FaSpinner className="text-3xl text-purple-600 animate-spin mx-auto mb-2" />
                            <p className="text-white text-sm">Loading video...</p>
                        </div>
                    </div>
                )}

                {/* Error overlay */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-20">
                        <div className="text-center p-4 max-w-sm">
                            <FaExclamationTriangle className="text-purple-500 text-4xl mx-auto mb-2" />
                            <p className="text-white text-sm mb-3">{error}</p>
                            <div className="flex gap-2 justify-center">
                                <button onClick={() => setRetryCount(prev => prev + 1)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-medium">
                                    Retry
                                </button>
                                <button onClick={() => setUseEmbed(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-medium">
                                    Embed Mode
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom controls */}
                {showCustomControls && (
                    <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="max-w-7xl mx-auto">
                            {/* Progress bar */}
                            <div className="mb-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.001"
                                    value={progress}
                                    onChange={handleSeek}
                                    className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
                                />
                                <div className="flex justify-between text-xs text-gray-300 mt-1">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Control buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <button onClick={handlePlayPause} className="hover:text-purple-500 p-1.5 transition-colors">
                                        {playing ? <FaPause size={14} /> : <FaPlay size={14} />}
                                    </button>

                                    {!isMobile && (
                                        <>
                                            <button onClick={() => handleSkip(-10)} className="hover:text-purple-500 p-1.5 transition-colors">
                                                <FaBackward size={12} />
                                            </button>
                                            <button onClick={() => handleSkip(10)} className="hover:text-purple-500 p-1.5 transition-colors">
                                                <FaForward size={12} />
                                            </button>
                                        </>
                                    )}

                                    {!isMobile && (
                                        <div className="flex items-center gap-2 ml-1">
                                            <button onClick={handleToggleMute} className="hover:text-purple-500 p-1.5 transition-colors">
                                                {muted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={volume}
                                                onChange={handleVolume}
                                                className="w-16 md:w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 md:gap-3">
                                    {!isMobile && (
                                        <div className="relative group">
                                            <button className="px-2 py-1 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-xs font-medium">
                                                {playbackRate}x
                                            </button>
                                            <div className="absolute right-0 bottom-full mb-1 bg-gray-900 border border-gray-700 rounded-lg p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
                                                <div className="grid grid-cols-3 gap-1">
                                                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                                        <button
                                                            key={rate}
                                                            onClick={() => handlePlaybackRate(rate)}
                                                            className={`px-2 py-1 text-xs rounded-md transition-all ${playbackRate === rate ? 'bg-purple-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                        >
                                                            {rate}x
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleFullscreen} className="hover:text-purple-500 p-1.5 transition-colors">
                                        {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content below video - only show when not fullscreen */}
            {!isFullscreen && (
                <div className="max-w-7xl mx-auto px-4 py-5 md:py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            {/* Title and metadata - Optimized sizing */}
                            <h1 className="text-xl md:text-2xl font-bold mb-3">{movie.title}</h1>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {movie.year && (
                                    <span className="px-3 py-1 bg-purple-600/20 border border-purple-600/30 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5">
                                        <FaCalendarAlt className="text-purple-400 text-xs" />
                                        {movie.year}
                                    </span>
                                )}
                                {movie.rating && (
                                    <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-600/30 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5">
                                        <FaStar className="text-yellow-500 text-xs" />
                                        {movie.rating}
                                    </span>
                                )}
                                {movie.translator && (
                                    <span className="px-3 py-1 bg-green-600/20 border border-green-600/30 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5">
                                        <FaLanguage className="text-green-400 text-xs" />
                                        {movie.translator}
                                    </span>
                                )}
                                {movie.category && (
                                    <span className="px-3 py-1 bg-blue-600/20 border border-blue-600/30 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5">
                                        <FaTag className="text-blue-400 text-xs" />
                                        {movie.category.split(',')[0]}
                                    </span>
                                )}
                                {movieParts.length > 0 && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-600/30 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5">
                                        <FaLayerGroup className="text-purple-400 text-xs" />
                                        {movieParts.length} Part{movieParts.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Description - Better readability */}
                            <div className="bg-gray-900/50 rounded-xl p-4 mb-5 border border-gray-800">
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FaInfoCircle className="text-purple-400 text-sm" />
                                    Synopsis
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {movie.description || 'No description available for this movie.'}
                                </p>
                            </div>

                            {/* Parts list - With download buttons for each part */}
                            {movieParts.length > 0 && renderPartsList()}

                            {/* Related movies */}
                            {renderRelated()}

                            {/* Comments */}
                            {renderComments()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Player;