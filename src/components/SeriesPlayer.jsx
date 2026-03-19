import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress,
    FaArrowLeft, FaDownload, FaHome, FaStar, FaForward, FaBackward,
    FaVideo, FaComment, FaHeart, FaPaperPlane, FaTrash, FaEdit, FaCheck, FaTimes,
    FaSpinner, FaExclamationTriangle, FaCloudDownloadAlt, FaFileDownload,
    FaChevronDown, FaChevronUp, FaLink, FaHdd, FaFilm, FaList, FaChevronLeft, FaChevronRight,
    FaBookmark, FaEllipsisV, FaCalendar, FaClock, FaEye, FaThumbsUp, FaShare, FaInfoCircle,
    FaLanguage, FaTv, FaPlayCircle, FaListUl, FaArrowCircleRight, FaArrowCircleLeft
} from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { MoviesContext } from '../context/MoviesContext';

const SeriesPlayer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { movies, episodes = [], getEpisodesBySeries } = useContext(MoviesContext);

    // Get series data from location state
    const [series, setSeries] = useState(location.state?.series || null);
    const [currentEpisode, setCurrentEpisode] = useState(location.state?.episode || null);
    const [episodesList, setEpisodesList] = useState(location.state?.episodes || []);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(location.state?.episodeIndex || 0);

    const [selectedSeason, setSelectedSeason] = useState(1);
    const [seasons, setSeasons] = useState([]);
    const [showEpisodeList, setShowEpisodeList] = useState(true);

    // ========== REFS ==========
    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const youtubeContainerRef = useRef(null);
    const controlsTimerRef = useRef(null);
    const iframeRef = useRef(null);
    const progressBarRef = useRef(null);
    const volumeBarRef = useRef(null);
    const episodesScrollRef = useRef(null);

    // YouTube specific states
    const [youTubePlayer, setYouTubePlayer] = useState(null);
    const [youTubeApiReady, setYouTubeApiReady] = useState(false);

    // Video player states
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
    const [downloadEpisodeId, setDownloadEpisodeId] = useState(null);
    const [youtubeId, setYoutubeId] = useState('');
    const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showSeasonSelector, setShowSeasonSelector] = useState(false);

    // Slider interaction states
    const [isSeeking, setIsSeeking] = useState(false);
    const [isVolumeChanging, setIsVolumeChanging] = useState(false);

    // Comments state
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [userAvatar, setUserAvatar] = useState('');

    // Favorites/Watchlist
    const [favorites, setFavorites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    // ========== INITIALIZATION ==========

    // Sort episodes function
    const sortEpisodes = (episodesArray) => {
        if (!episodesArray || !Array.isArray(episodesArray)) return [];
        return [...episodesArray].sort((a, b) => {
            const seasonA = parseInt(a.seasonNumber) || parseInt(a.season_number) || 1;
            const seasonB = parseInt(b.seasonNumber) || parseInt(b.season_number) || 1;
            const episodeA = parseInt(a.episodeNumber) || parseInt(a.episode_number) || 1;
            const episodeB = parseInt(b.episodeNumber) || parseInt(b.episode_number) || 1;
            if (seasonA !== seasonB) return seasonA - seasonB;
            return episodeA - episodeB;
        });
    };

    // Get seasons from episodes
    const getSeasonsFromEpisodes = (episodesArray) => {
        const seasonSet = new Set();
        episodesArray.forEach(ep => {
            const season = parseInt(ep.seasonNumber) || parseInt(ep.season_number) || 1;
            seasonSet.add(season);
        });
        return Array.from(seasonSet).sort((a, b) => a - b);
    };

    // Initialize series data
    useEffect(() => {
        if (!series && id && movies.length > 0) {
            const foundSeries = movies.find(m => m.id === id || m.id === parseInt(id));
            if (foundSeries) {
                setSeries(foundSeries);

                const seriesEpisodes = typeof getEpisodesBySeries === 'function'
                    ? getEpisodesBySeries(foundSeries.id)
                    : episodes.filter(ep =>
                        ep.seriesId === foundSeries.id ||
                        ep.series_id === foundSeries.id ||
                        ep.movieId === foundSeries.id
                    );

                if (seriesEpisodes.length > 0) {
                    const sorted = sortEpisodes(seriesEpisodes);
                    setEpisodesList(sorted);

                    const seasonList = getSeasonsFromEpisodes(sorted);
                    setSeasons(seasonList);

                    if (seasonList.length > 0) {
                        setSelectedSeason(seasonList[0]);
                    }

                    if (currentEpisode) {
                        const index = sorted.findIndex(ep => ep.id === currentEpisode.id);
                        setCurrentEpisodeIndex(index > -1 ? index : 0);
                        setCurrentEpisode(sorted[index > -1 ? index : 0]);
                    } else {
                        setCurrentEpisode(sorted[0]);
                        setCurrentEpisodeIndex(0);
                    }
                }
            }
        }

        if (episodesList.length > 0 && seasons.length === 0) {
            const seasonList = getSeasonsFromEpisodes(episodesList);
            setSeasons(seasonList);
            if (seasonList.length > 0) {
                setSelectedSeason(seasonList[0]);
            }
        }

        if (currentEpisode && !series) {
            const seriesId = currentEpisode.seriesId || currentEpisode.series_id;
            if (seriesId) {
                const foundSeries = movies.find(m => m.id === seriesId || m.id === parseInt(seriesId));
                if (foundSeries) {
                    setSeries(foundSeries);
                }
            }
        }
    }, [id, movies, episodes, getEpisodesBySeries]);

    // Update when current episode index changes
    useEffect(() => {
        if (episodesList.length > 0 && currentEpisodeIndex >= 0 && currentEpisodeIndex < episodesList.length) {
            const episode = episodesList[currentEpisodeIndex];
            setCurrentEpisode(episode);
            const episodeSeason = parseInt(episode.seasonNumber) || parseInt(episode.season_number) || 1;
            setSelectedSeason(episodeSeason);
        }
    }, [currentEpisodeIndex, episodesList]);

    // Initialize video when current episode changes
    useEffect(() => {
        if (currentEpisode) {
            setLoading(true);
            setError('');
            setUseEmbed(false);
            setVideoLoaded(false);
            setProgress(0);
            setCurrentTime(0);
            setPlaying(false);
            initializeVideo(currentEpisode);
        }
    }, [currentEpisode, retryCount]);

    // ========== COMMENTS FUNCTIONS ==========

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

        if (currentEpisode?.id) {
            fetchComments();
        }
    }, [currentEpisode]);

    const fetchComments = async () => {
        if (!currentEpisode?.id) return;

        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('movie_id', currentEpisode.id.toString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            const localComments = localStorage.getItem(`comments_${currentEpisode.id}`);
            if (localComments) {
                setComments(JSON.parse(localComments));
            }
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !userName.trim() || !currentEpisode?.id) return;

        setIsSubmitting(true);
        const commentData = {
            movie_id: currentEpisode.id.toString(),
            user_name: userName,
            user_avatar: userAvatar,
            message: newComment.trim(),
            content_type: 'episode',
            series_id: series?.id,
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

            const existingComments = JSON.parse(localStorage.getItem(`comments_${currentEpisode.id}`) || '[]');
            existingComments.unshift({
                ...commentData,
                id: Date.now(),
                created_at: new Date().toISOString()
            });
            localStorage.setItem(`comments_${currentEpisode.id}`, JSON.stringify(existingComments));

        } catch (error) {
            console.error('Error submitting comment:', error);
            const fallbackComment = {
                ...commentData,
                id: Date.now(),
                created_at: new Date().toISOString()
            };
            const existingComments = JSON.parse(localStorage.getItem(`comments_${currentEpisode.id}`) || '[]');
            existingComments.unshift(fallbackComment);
            localStorage.setItem(`comments_${currentEpisode.id}`, JSON.stringify(existingComments));
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

            const existingComments = JSON.parse(localStorage.getItem(`comments_${currentEpisode.id}`) || '[]');
            const updatedComments = existingComments.map(c =>
                c.id === commentId ? { ...c, likes: updatedLikes } : c
            );
            localStorage.setItem(`comments_${currentEpisode.id}`, JSON.stringify(updatedComments));

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

            const existingComments = JSON.parse(localStorage.getItem(`comments_${currentEpisode.id}`) || '[]');
            const updatedComments = existingComments.map(c =>
                c.id === commentId ? { ...c, message: editText.trim() } : c
            );
            localStorage.setItem(`comments_${currentEpisode.id}`, JSON.stringify(updatedComments));

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

            const existingComments = JSON.parse(localStorage.getItem(`comments_${currentEpisode.id}`) || '[]');
            const updatedComments = existingComments.filter(c => c.id !== commentId);
            localStorage.setItem(`comments_${currentEpisode.id}`, JSON.stringify(updatedComments));

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

    // ========== VIDEO FUNCTIONS ==========

    const detectVideoType = (url) => {
        if (!url || typeof url !== 'string') return 'direct';

        if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
            return 'dailymotion';
        }

        if (url.includes('vimeo.com') || url.includes('player.vimeo.com') || /^\d+$/.test(url.trim())) {
            return 'vimeo';
        }

        if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com')) {
            return 'youtube';
        }

        if (url.match(/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|ogg|ogv|wmv|flv|m4v|3gp|ts)$/i)) {
            return 'direct';
        }

        if (url.includes('/stream/') || url.includes('/video/') || url.includes('/watch/')) {
            return 'direct';
        }

        if (url.includes('mux.com') || url.includes('.mpd')) {
            return 'mux';
        }

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
                        object-fit: contain !important;
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

                    event.target.setVolume(volume * 100);
                    startYouTubeProgressTracking(event.target);

                    const iframe = event.target.getIframe();
                    if (iframe) {
                        hideYouTubeBranding(iframe);
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

                    if (event.data === window.YT.PlayerState.PAUSED) {
                        const iframe = event.target.getIframe();
                        if (iframe) {
                            setTimeout(() => hideYouTubeBranding(iframe), 50);
                        }
                    }

                    if (event.data === window.YT.PlayerState.ENDED) {
                        event.target.playVideo();
                        setProgress(0);
                        setCurrentTime(0);

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
            if (player && player.getCurrentTime && player.getDuration && !isSeeking) {
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

    const initializeVideo = (episode) => {
        if (!episode) return;

        const url = episode?.videoUrl || episode?.streamLink || '';

        if (!url) {
            setError("No video URL available for this episode");
            setLoading(false);
            return;
        }

        const detectedType = detectVideoType(url);
        setVideoType(detectedType);

        if (detectedType === 'dailymotion') {
            setIsDailyMotionVideo(true);
            setIsVimeoVideo(false);
            setIsYouTubeVideo(false);
            const dailymotionId = extractDailyMotionId(url);
            if (dailymotionId) {
                setDailyMotionId(dailymotionId);
                const embedUrl = `https://www.dailymotion.com/embed/video/${dailymotionId}?autoplay=1&queue-autoplay-next=0&queue-enable=0&sharing-enable=0&ui-logo=0&ui-start-screen-info=0&controls=true&ui-theme=dark&ui-advance=0&ui-chapters=0&ui-description=0&ui-mute=0&ui-endscreen=0&logo=0&info=0`;
                setVideoUrl(embedUrl);
                console.log("🎬 Using DailyMotion embedded player (clean mode)");
            } else {
                setError("Invalid DailyMotion URL");
            }
        } else if (detectedType === 'vimeo') {
            setIsVimeoVideo(true);
            setIsDailyMotionVideo(false);
            setIsYouTubeVideo(false);
            const vimeoId = extractVimeoId(url);
            if (vimeoId) {
                const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=true&badge=0&transparent=1&color=ffffff&autopause=0&player_id=0&app_id=0`;
                setVideoUrl(embedUrl);
                console.log("🎬 Using Vimeo embedded player (clean mode)");
            } else {
                setError("Invalid Vimeo URL");
            }
        } else if (detectedType === 'youtube') {
            setIsVimeoVideo(false);
            setIsDailyMotionVideo(false);
            setIsYouTubeVideo(true);
            const youtubeId = extractYouTubeId(url);
            if (youtubeId) {
                setYoutubeId(youtubeId);
                setVideoUrl('');
                console.log("🎬 Using YouTube API player with custom controls");
            } else {
                setError("Invalid YouTube URL");
            }
        } else if (detectedType === 'embed') {
            setIsVimeoVideo(false);
            setIsDailyMotionVideo(false);
            setIsYouTubeVideo(false);
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
            setIsYouTubeVideo(false);
            setVideoUrl(url);
            console.log("🎬 Using custom HTML5 player");
        }
        setLoading(false);
    };

    const handlePlayPause = useCallback((e) => {
        e?.stopPropagation();

        if (isVimeoVideo || isDailyMotionVideo || useEmbed) {
            return;
        }

        if (videoType === 'youtube' && youTubePlayer) {
            if (playing) {
                youTubePlayer.pauseVideo();
            } else {
                youTubePlayer.playVideo();
                setTimeout(() => {
                    const iframe = youTubePlayer.getIframe();
                    if (iframe) hideYouTubeBranding(iframe);
                }, 100);
            }
            setPlaying(!playing);
        } else {
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
        if (videoRef.current && !isVimeoVideo && !isDailyMotionVideo && videoType !== 'youtube' && !useEmbed && !isSeeking) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration || 0;
            setCurrentTime(current);
            setProgress(total > 0 ? current / total : 0);
            setDuration(total);
        }
    };

    const handleSeekStart = (e) => {
        e.stopPropagation();
        setIsSeeking(true);
    };

    const handleSeekChange = (e) => {
        e.stopPropagation();
        const seekTo = parseFloat(e.target.value);
        setProgress(seekTo);

        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = seekTo * youTubePlayer.getDuration();
            setCurrentTime(newTime);
        } else if (videoRef.current && !isNaN(videoRef.current.duration)) {
            const newTime = seekTo * videoRef.current.duration;
            setCurrentTime(newTime);
        }
    };

    const handleSeekEnd = (e) => {
        e.stopPropagation();
        const seekTo = parseFloat(e.target.value);

        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = seekTo * youTubePlayer.getDuration();
            youTubePlayer.seekTo(newTime, true);
        } else if (videoRef.current && !isNaN(videoRef.current.duration)) {
            const newTime = seekTo * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
        }

        setIsSeeking(false);
        showControlsWithTimer();
    };

    const handleVolumeStart = (e) => {
        e.stopPropagation();
        setIsVolumeChanging(true);
    };

    const handleVolumeChange = (e) => {
        e.stopPropagation();
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        if (videoType === 'youtube' && youTubePlayer) {
            youTubePlayer.setVolume(newVolume * 100);
        } else if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }

        setMuted(newVolume === 0);
    };

    const handleVolumeEnd = (e) => {
        e.stopPropagation();
        setIsVolumeChanging(false);
        showControlsWithTimer();
    };

    const handleToggleMute = (e) => {
        e?.stopPropagation();

        if (videoType === 'youtube' && youTubePlayer) {
            if (muted) {
                youTubePlayer.unMute();
                youTubePlayer.setVolume(volume * 100);
            } else {
                youTubePlayer.mute();
            }
        } else if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
        }

        setMuted(!muted);
        showControlsWithTimer();
    };

    const handleForward = (e, seconds = 10) => {
        e?.stopPropagation();

        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = Math.min(youTubePlayer.getCurrentTime() + seconds, youTubePlayer.getDuration());
            youTubePlayer.seekTo(newTime, true);
            setCurrentTime(newTime);
            setProgress(newTime / youTubePlayer.getDuration());
        } else if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            setCurrentTime(videoRef.current.currentTime);
            setProgress(videoRef.current.currentTime / videoRef.current.duration);
        }
        showControlsWithTimer();
    };

    const handleRewind = (e, seconds = 10) => {
        e?.stopPropagation();

        if (videoType === 'youtube' && youTubePlayer) {
            const newTime = Math.max(0, youTubePlayer.getCurrentTime() - seconds);
            youTubePlayer.seekTo(newTime, true);
            setCurrentTime(newTime);
            setProgress(newTime / youTubePlayer.getDuration());
        } else if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
            setCurrentTime(videoRef.current.currentTime);
            setProgress(videoRef.current.currentTime / videoRef.current.duration);
        }
        showControlsWithTimer();
    };

    const handlePlaybackRate = (rate, e) => {
        e?.stopPropagation();

        if (videoType === 'youtube' && youTubePlayer) {
            youTubePlayer.setPlaybackRate(rate);
        } else if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }

        setPlaybackRate(rate);
        showControlsWithTimer();
    };

    const handleDownload = (e, episode) => {
        e?.stopPropagation();

        const downloadUrl = episode?.download || episode?.download_link || episode?.videoUrl || episode?.streamLink;

        if (downloadUrl) {
            setDownloadEpisodeId(episode.id);
            setDownloading(true);

            window.open(downloadUrl, '_blank');

            setTimeout(() => {
                setDownloading(false);
                setDownloadEpisodeId(null);
            }, 1000);
        } else {
            alert('Download link not available for this episode.');
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
        if (currentEpisode) {
            initializeVideo(currentEpisode);
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
            if (playing && isFullscreen && !isSeeking && !isVolumeChanging) setShowControls(false);
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

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Episode navigation
    const goToNextEpisode = () => {
        if (currentEpisodeIndex < episodesList.length - 1) {
            setCurrentEpisodeIndex(prev => prev + 1);
        }
    };

    const goToPreviousEpisode = () => {
        if (currentEpisodeIndex > 0) {
            setCurrentEpisodeIndex(prev => prev - 1);
        }
    };

    const goToEpisode = (index) => {
        if (index >= 0 && index < episodesList.length) {
            setCurrentEpisodeIndex(index);
            setShowEpisodeList(false);
        }
    };

    const toggleFavorite = () => {
        if (!currentEpisode?.id) return;
        setFavorites(prev =>
            prev.includes(currentEpisode.id)
                ? prev.filter(id => id !== currentEpisode.id)
                : [...prev, currentEpisode.id]
        );
    };

    const toggleWatchlist = () => {
        if (!currentEpisode?.id) return;
        setWatchlist(prev =>
            prev.includes(currentEpisode.id)
                ? prev.filter(id => id !== currentEpisode.id)
                : [...prev, currentEpisode.id]
        );
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showMobileMenu && !e.target.closest('.mobile-menu-container')) {
                setShowMobileMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showMobileMenu]);

    // ========== RENDER FUNCTIONS ==========

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
                        title={currentEpisode?.title || 'Video Player'}
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
                        title={currentEpisode?.title || 'Video Player'}
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
                        title={currentEpisode?.title || 'Video Player'}
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
            return (
                <div className="relative w-full h-full bg-black">
                    <div
                        ref={youtubeContainerRef}
                        className="w-full h-full"
                        style={{
                            position: 'relative',
                            zIndex: 1
                        }}
                    />
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
                    <div
                        className="absolute inset-0 z-10"
                        style={{
                            background: 'rgba(0,0,0,0.001)',
                            pointerEvents: 'none'
                        }}
                    />
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
        <div className="mt-8 bg-gradient-to-br from-gray-900/80 to-gray-950/80 rounded-2xl p-5 md:p-6 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between mb-5 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
                    <FaComment className="text-purple-500 text-xl md:text-2xl" />
                    Comments ({comments.length})
                </h3>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="px-4 md:px-5 py-2 md:py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-all duration-200 text-sm md:text-base"
                >
                    {showComments ? 'Hide' : 'Show'} Comments
                </button>
            </div>

            {showComments && (
                <>
                    <div className="mb-6 p-4 md:p-5 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={userAvatar}
                                alt={userName}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-purple-600"
                                onError={(e) => {
                                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;
                                }}
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={updateUserName}
                                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm md:text-base"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        <form onSubmit={handleSubmitComment} className="relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full px-3 md:px-4 py-3 md:py-3 bg-gray-900 border border-gray-700 rounded-xl text-white resize-none text-sm md:text-base"
                                placeholder="Share your thoughts about this episode..."
                                rows="3"
                                maxLength="500"
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs md:text-sm text-gray-400">
                                    {newComment.length}/500 characters
                                </span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200 text-sm md:text-base"
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

                    <div className="space-y-3 md:space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 md:py-12 text-gray-500">
                                <FaComment className="text-4xl md:text-5xl mx-auto mb-3 opacity-50" />
                                <p className="text-sm md:text-base">No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="bg-gray-800/30 rounded-xl p-4 md:p-5 hover:bg-gray-800/50 transition-all duration-200 border border-gray-700/50 hover:border-gray-600"
                                >
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={comment.user_avatar}
                                            alt={comment.user_name}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-purple-600/50"
                                            onError={(e) => {
                                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_name}`;
                                            }}
                                        />

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-white text-sm md:text-base">
                                                        {comment.user_name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatTimeAgo(comment.created_at)}
                                                        {comment.device_info?.platform && (
                                                            <span className="ml-2">
                                                                • {comment.device_info.platform}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>

                                                {comment.user_name === userName && (
                                                    <div className="flex items-center gap-1 md:gap-2">
                                                        {editingComment === comment.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSaveEdit(comment.id)}
                                                                    className="p-1.5 md:p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                                                    title="Save"
                                                                >
                                                                    <FaCheck size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingComment(null)}
                                                                    className="p-1.5 md:p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                                    title="Cancel"
                                                                >
                                                                    <FaTimes size={14} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditComment(comment)}
                                                                    className="p-1.5 md:p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                                                    title="Edit"
                                                                >
                                                                    <FaEdit size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="p-1.5 md:p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
                                                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm md:text-base"
                                                        rows="2"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-gray-200 mb-3 whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                                                    {comment.message}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-3 md:gap-4">
                                                <button
                                                    onClick={() => handleLikeComment(comment.id)}
                                                    className="flex items-center gap-1.5 text-gray-400 hover:text-purple-500 transition-colors text-sm md:text-base"
                                                >
                                                    <FaHeart className={`${comment.likes > 0 ? 'text-purple-500' : ''} text-sm md:text-base`} />
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
                        <div className="mt-6 pt-6 border-t border-gray-800">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                <div className="text-center p-3 md:p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700">
                                    <div className="text-xl md:text-3xl font-bold text-purple-500">{comments.length}</div>
                                    <div className="text-xs md:text-sm text-gray-400">Total Comments</div>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700">
                                    <div className="text-xl md:text-3xl font-bold text-yellow-500">
                                        {comments.reduce((sum, c) => sum + (c.likes || 0), 0)}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-400">Total Likes</div>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700">
                                    <div className="text-xl md:text-3xl font-bold text-green-500">
                                        {new Set(comments.map(c => c.user_name)).size}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-400">Unique Users</div>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700">
                                    <div className="text-xl md:text-3xl font-bold text-blue-500">
                                        {comments.filter(c => c.device_info?.platform?.includes('Mobile')).length}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-400">Mobile Users</div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const shouldShowCustomControls = !isVimeoVideo && !isDailyMotionVideo && !useEmbed;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
                    <p className="text-white text-base md:text-xl font-light">Loading player...</p>
                </div>
            </div>
        );
    }

    if (error || !currentEpisode) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black flex items-center justify-center p-4">
                <div className="text-center p-6 md:p-10 max-w-lg bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl">
                    <FaExclamationTriangle className="text-purple-500 text-5xl md:text-7xl mx-auto mb-3 md:mb-4" />
                    <h1 className="text-2xl md:text-4xl text-white font-bold mb-2 md:mb-4">Playback Error</h1>
                    <p className="text-gray-400 text-sm md:text-lg mb-6 md:mb-8">{error || "No episode selected"}</p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all duration-200 text-sm md:text-base"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2 justify-center text-sm md:text-base"
                        >
                            <FaHome /> Go Home
                        </button>
                        {error && error.includes('format') && (
                            <button
                                onClick={handleUseEmbed}
                                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white font-medium transition-all duration-200 text-sm md:text-base"
                            >
                                Try Embed Player
                            </button>
                        )}
                        {error && (
                            <button
                                onClick={handleRetry}
                                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all duration-200 text-sm md:text-base"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const getPlayerTypeInfo = () => {
        if (useEmbed) {
            return {
                color: 'text-orange-400',
                bgColor: 'bg-orange-600',
                label: 'Embed',
                text: 'text-orange-300'
            };
        }
        if (isDailyMotionVideo) {
            return {
                color: 'text-purple-400',
                bgColor: 'bg-purple-600',
                label: 'DailyMotion',
                text: 'text-purple-300'
            };
        } else if (isVimeoVideo) {
            return {
                color: 'text-blue-400',
                bgColor: 'bg-blue-600',
                label: 'Vimeo',
                text: 'text-blue-300'
            };
        } else if (videoType === 'youtube') {
            return {
                color: 'text-red-400',
                bgColor: 'bg-red-600',
                label: 'YouTube',
                text: 'text-red-300'
            };
        } else {
            return {
                color: 'text-green-400',
                bgColor: 'bg-green-600',
                label: 'Custom Player',
                text: 'text-green-300'
            };
        }
    };

    const playerType = getPlayerTypeInfo();
    const hasDownload = (ep) => ep?.download || ep?.download_link || ep?.videoUrl || ep?.streamLink;
    const isFavorite = favorites.includes(currentEpisode?.id);
    const inWatchlist = watchlist.includes(currentEpisode?.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white">
            {!isFullscreen && (
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-30">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-white hover:text-purple-500 transition-colors text-sm md:text-base font-medium group"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                        </button>

                        <div className="flex-1 text-center px-4 hidden md:block">
                            <h1 className="text-xl md:text-2xl font-bold truncate max-w-2xl mx-auto">{series?.title || 'Series'}</h1>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <FaVideo className={playerType.color} />
                                <span className={`text-xs md:text-sm ${playerType.text}`}>
                                    {playerType.label}
                                </span>
                            </div>
                            <div className="text-xs md:text-sm text-gray-400 mt-0.5">
                                Season {currentEpisode.seasonNumber || currentEpisode.season_number || 1} • Episode {currentEpisode.episodeNumber || currentEpisode.episode_number || 1}: {currentEpisode.title}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Favorite & Watchlist Buttons */}
                            <button
                                onClick={toggleFavorite}
                                className={`p-1.5 md:p-2 rounded-lg transition-colors hidden md:block ${isFavorite ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500'}`}
                                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <FaHeart size={20} />
                            </button>
                            <button
                                onClick={toggleWatchlist}
                                className={`p-1.5 md:p-2 rounded-lg transition-colors hidden md:block ${inWatchlist ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                                title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                            >
                                <FaBookmark size={20} />
                            </button>

                            {/* Episode Navigation */}
                            <button
                                onClick={goToPreviousEpisode}
                                disabled={currentEpisodeIndex === 0}
                                className={`p-1.5 md:p-2 rounded-lg transition-colors hidden md:block ${currentEpisodeIndex === 0
                                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                                title="Previous Episode"
                            >
                                <FaArrowCircleLeft size={18} />
                            </button>
                            <span className="text-xs md:text-sm text-gray-300 hidden md:block font-medium">
                                {currentEpisodeIndex + 1}/{episodesList.length}
                            </span>
                            <button
                                onClick={goToNextEpisode}
                                disabled={currentEpisodeIndex === episodesList.length - 1}
                                className={`p-1.5 md:p-2 rounded-lg transition-colors hidden md:block ${currentEpisodeIndex === episodesList.length - 1
                                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                                title="Next Episode"
                            >
                                <FaArrowCircleRight size={18} />
                            </button>

                            {/* Episode List Toggle */}
                            <button
                                onClick={() => setShowEpisodeList(!showEpisodeList)}
                                className="p-1.5 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white hidden md:block"
                                title={showEpisodeList ? 'Hide episodes' : 'Show episodes'}
                            >
                                <FaListUl size={20} />
                            </button>

                            {/* Season Selector Toggle */}
                            {seasons.length > 1 && (
                                <button
                                    onClick={() => setShowSeasonSelector(!showSeasonSelector)}
                                    className="p-1.5 md:p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white hidden md:flex items-center gap-1"
                                    title="Select Season"
                                >
                                    <FaTv size={18} />
                                    <span className="text-xs">S{selectedSeason}</span>
                                </button>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="md:hidden p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                            >
                                <FaEllipsisV size={18} />
                            </button>

                            {/* Mobile Menu Dropdown */}
                            {showMobileMenu && (
                                <div className="absolute top-16 right-4 w-80 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl shadow-2xl z-50 mobile-menu-container md:hidden">
                                    <div className="p-4 border-b border-gray-800">
                                        <p className="text-sm font-medium text-gray-300">Menu Options</p>
                                    </div>
                                    <div className="p-3 space-y-1 max-h-[80vh] overflow-y-auto">
                                        <button
                                            onClick={toggleFavorite}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isFavorite ? 'text-purple-500 bg-purple-500/10' : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                        >
                                            <FaHeart size={18} />
                                            <span className="text-sm">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                                        </button>

                                        <button
                                            onClick={toggleWatchlist}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${inWatchlist ? 'text-blue-500 bg-blue-500/10' : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                        >
                                            <FaBookmark size={18} />
                                            <span className="text-sm">{inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}</span>
                                        </button>

                                        <div className="border-t border-gray-800 my-2"></div>

                                        {/* Mobile Season Selector */}
                                        {seasons.length > 1 && (
                                            <div className="mb-2">
                                                <p className="text-xs text-gray-400 px-3 py-2">Select Season</p>
                                                <div className="flex flex-wrap gap-2 px-3">
                                                    {seasons.map(season => (
                                                        <button
                                                            key={season}
                                                            onClick={() => {
                                                                setSelectedSeason(season);
                                                                const firstEpisode = episodesList.find(ep =>
                                                                    (parseInt(ep.seasonNumber) || parseInt(ep.season_number) || 1) === season
                                                                );
                                                                if (firstEpisode) {
                                                                    const index = episodesList.findIndex(ep => ep.id === firstEpisode.id);
                                                                    goToEpisode(index);
                                                                }
                                                                setShowMobileMenu(false);
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-sm ${selectedSeason === season
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-800 text-gray-300'
                                                                }`}
                                                        >
                                                            Season {season}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-800 my-2"></div>

                                        <button
                                            onClick={goToPreviousEpisode}
                                            disabled={currentEpisodeIndex === 0}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${currentEpisodeIndex === 0
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                        >
                                            <FaArrowCircleLeft size={18} />
                                            <span className="text-sm">Previous Episode</span>
                                        </button>

                                        <button
                                            onClick={goToNextEpisode}
                                            disabled={currentEpisodeIndex === episodesList.length - 1}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${currentEpisodeIndex === episodesList.length - 1
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                        >
                                            <FaArrowCircleRight size={18} />
                                            <span className="text-sm">Next Episode</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowEpisodeList(!showEpisodeList);
                                                setShowMobileMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                                        >
                                            <FaListUl size={18} />
                                            <span className="text-sm">{showEpisodeList ? 'Hide episodes' : 'Show episodes'}</span>
                                        </button>

                                        {/* Mobile Download Option */}
                                        {hasDownload(currentEpisode) && (
                                            <>
                                                <div className="border-t border-gray-800 my-2"></div>
                                                <button
                                                    onClick={(e) => {
                                                        handleDownload(e, currentEpisode);
                                                        setShowMobileMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 rounded-lg transition-all group border border-green-500/20 hover:border-green-500/40"
                                                    disabled={downloading && downloadEpisodeId === currentEpisode.id}
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                                                        <FaCloudDownloadAlt className="text-green-400 text-lg" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-sm font-medium text-white">
                                                            {downloading && downloadEpisodeId === currentEpisode.id ? 'Opening...' : 'Download Episode'}
                                                        </p>
                                                        <p className="text-xs text-gray-400">Click to download</p>
                                                    </div>
                                                    {downloading && downloadEpisodeId === currentEpisode.id && <FaSpinner className="animate-spin text-green-400" />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Season Selector Dropdown - Desktop */}
            {showSeasonSelector && seasons.length > 1 && !isFullscreen && (
                <div className="absolute top-20 right-32 z-40 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-xl shadow-2xl">
                    <div className="p-3">
                        <p className="text-xs text-gray-400 mb-2 px-2">Select Season</p>
                        <div className="flex flex-col gap-1">
                            {seasons.map(season => (
                                <button
                                    key={season}
                                    onClick={() => {
                                        setSelectedSeason(season);
                                        const firstEpisode = episodesList.find(ep =>
                                            (parseInt(ep.seasonNumber) || parseInt(ep.season_number) || 1) === season
                                        );
                                        if (firstEpisode) {
                                            const index = episodesList.findIndex(ep => ep.id === firstEpisode.id);
                                            goToEpisode(index);
                                        }
                                        setShowSeasonSelector(false);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm text-left transition-all ${selectedSeason === season
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                >
                                    Season {season}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div
                ref={playerContainerRef}
                className={`relative w-full ${isMobile ? 'h-[50vh]' : 'h-[70vh]'} bg-black`}
                onMouseMove={shouldShowCustomControls ? showControlsWithTimer : undefined}
                onMouseLeave={() => shouldShowCustomControls && setShowControls(false)}
                onClick={(e) => {
                    if (shouldShowCustomControls &&
                        !e.target.closest('button') &&
                        !e.target.closest('input') &&
                        !e.target.closest('select') &&
                        !e.target.closest('.slider-container')) {
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                        <button
                            onClick={handlePlayPause}
                            className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl"
                        >
                            <FaPlay size={24} className="text-white ml-1" />
                        </button>
                    </div>
                )}

                {!videoLoaded && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <div className="text-center">
                            <FaSpinner className="text-3xl md:text-4xl text-purple-600 animate-spin mx-auto mb-3" />
                            <p className="text-white text-sm md:text-base">Loading video...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                        <div className="text-center p-6 max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800">
                            <FaExclamationTriangle className="text-purple-500 text-4xl md:text-5xl mx-auto mb-3" />
                            <p className="text-white text-sm md:text-base mb-4">{error}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleRetry}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium text-sm"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={handleUseEmbed}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white font-medium text-sm"
                                >
                                    Try Embed Player
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {shouldShowCustomControls && (
                    <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="max-w-7xl mx-auto slider-container">
                            {/* Progress slider */}
                            <div className="mb-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.001"
                                    value={progress}
                                    onMouseDown={handleSeekStart}
                                    onTouchStart={handleSeekStart}
                                    onChange={handleSeekChange}
                                    onMouseUp={handleSeekEnd}
                                    onTouchEnd={handleSeekEnd}
                                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-600 [&::-webkit-slider-thumb]:to-pink-600 hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex justify-between text-xs text-gray-300 mt-1">
                                    <span className="font-mono">{formatTime(currentTime)}</span>
                                    <span className="font-mono">{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-4">
                                    <button
                                        onClick={handlePlayPause}
                                        className="hover:text-purple-500 transition-colors p-1.5"
                                    >
                                        {playing ? (
                                            <FaPause className={`${isMobile ? 'text-xl' : 'text-2xl'}`} />
                                        ) : (
                                            <FaPlay className={`${isMobile ? 'text-xl ml-0.5' : 'text-2xl ml-1'}`} />
                                        )}
                                    </button>

                                    {!isMobile && (
                                        <>
                                            <button
                                                onClick={(e) => handleRewind(e, 10)}
                                                className="hover:text-purple-500 transition-colors p-1.5"
                                            >
                                                <FaBackward className="text-xl" />
                                            </button>
                                            <button
                                                onClick={(e) => handleForward(e, 10)}
                                                className="hover:text-purple-500 transition-colors p-1.5"
                                            >
                                                <FaForward className="text-xl" />
                                            </button>
                                        </>
                                    )}

                                    {!isMobile && (
                                        <div className="flex items-center gap-2 ml-1">
                                            <button
                                                onClick={handleToggleMute}
                                                className="hover:text-purple-500 transition-colors p-1.5"
                                            >
                                                {muted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={volume}
                                                onMouseDown={handleVolumeStart}
                                                onTouchStart={handleVolumeStart}
                                                onChange={handleVolumeChange}
                                                onMouseUp={handleVolumeEnd}
                                                onTouchEnd={handleVolumeEnd}
                                                className="w-20 md:w-28 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-600 [&::-webkit-slider-thumb]:to-pink-600 hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 md:gap-4">
                                    {!isMobile && (
                                        <div className="relative group">
                                            <button className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-xs md:text-sm font-medium">
                                                {playbackRate}x
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-lg p-1.5 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
                                                <div className="text-xs text-gray-400 mb-1 px-1">Speed</div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                                        <button
                                                            key={rate}
                                                            onClick={(e) => handlePlaybackRate(rate, e)}
                                                            className={`px-2 py-1 text-xs rounded ${playbackRate === rate ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-800 hover:bg-gray-700'}`}
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
                                        className="hover:text-purple-500 transition-colors p-1.5"
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

                {!shouldShowCustomControls && showControls && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-purple-500/30 z-30">
                        <div className="flex items-center gap-1.5">
                            <FaVideo className={playerType.color} />
                            <span className="text-white text-xs">
                                {playerType.label} Player
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {!isFullscreen && (
                <div className="max-w-7xl mx-auto px-4 py-5 md:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        <div className="lg:col-span-2">
                            {/* Episode Info */}
                            <div className="mb-6 md:mb-8">
                                <h1 className="text-2xl md:text-4xl font-bold mb-2">{series?.title}</h1>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                    <span className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs md:text-sm font-medium">
                                        Season {currentEpisode.seasonNumber || currentEpisode.season_number || 1}
                                    </span>
                                    <span className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs md:text-sm font-medium">
                                        Episode {currentEpisode.episodeNumber || currentEpisode.episode_number || 1}
                                    </span>
                                    {series?.year && (
                                        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full text-xs md:text-sm font-medium flex items-center gap-1">
                                            <FaCalendar size={12} /> {series.year}
                                        </span>
                                    )}
                                    {series?.rating && (
                                        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-full flex items-center gap-1 text-xs md:text-sm font-medium">
                                            <FaStar className="text-yellow-300" /> {series.rating}
                                        </span>
                                    )}

                                    {/* Translator Badge */}
                                    {series?.translator && (
                                        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center gap-1 text-xs md:text-sm font-medium">
                                            <FaLanguage className="text-green-200" /> {series.translator}
                                        </span>
                                    )}

                                    {/* Download Button */}
                                    {hasDownload(currentEpisode) && (
                                        <button
                                            onClick={(e) => handleDownload(e, currentEpisode)}
                                            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full text-white font-medium shadow-lg shadow-green-600/30 transition-all duration-200 transform hover:scale-105 text-xs md:text-sm"
                                            disabled={downloading && downloadEpisodeId === currentEpisode.id}
                                        >
                                            {downloading && downloadEpisodeId === currentEpisode.id ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    <span>Opening...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaCloudDownloadAlt />
                                                    <span>Download</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold mb-2">{currentEpisode.title}</h2>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-3">
                                    {currentEpisode.description || 'No description available for this episode.'}
                                </p>

                                {/* Episode metadata */}
                                <div className="flex flex-wrap gap-3 md:gap-4 text-gray-400 text-xs md:text-sm">
                                    {currentEpisode.duration && (
                                        <span className="flex items-center gap-1"><FaClock /> {currentEpisode.duration}</span>
                                    )}
                                    {currentEpisode.views && (
                                        <span className="flex items-center gap-1"><FaEye /> {currentEpisode.views} views</span>
                                    )}
                                    {currentEpisode.likes && (
                                        <span className="flex items-center gap-1"><FaThumbsUp /> {currentEpisode.likes}</span>
                                    )}
                                </div>
                            </div>

                            {/* Season Selector - Mobile Friendly */}
                            {seasons.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg md:text-xl font-bold mb-3">Seasons</h3>
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {seasons.map(season => (
                                            <button
                                                key={season}
                                                onClick={() => {
                                                    setSelectedSeason(season);
                                                    const firstEpisode = episodesList.find(ep =>
                                                        (parseInt(ep.seasonNumber) || parseInt(ep.season_number) || 1) === season
                                                    );
                                                    if (firstEpisode) {
                                                        const index = episodesList.findIndex(ep => ep.id === firstEpisode.id);
                                                        goToEpisode(index);
                                                    }
                                                }}
                                                className={`px-4 md:px-5 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm md:text-base font-medium ${selectedSeason === season
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                                                    }`}
                                            >
                                                Season {season}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Episodes Grid */}
                            {episodesList.length > 0 && showEpisodeList && (
                                <div className="mb-8">
                                    <h3 className="text-lg md:text-xl font-bold mb-3">Episodes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {episodesList
                                            .filter(ep => (parseInt(ep.seasonNumber) || parseInt(ep.season_number) || 1) === selectedSeason)
                                            .map((episode) => {
                                                const epNumber = parseInt(episode.episodeNumber) || parseInt(episode.episode_number) || 1;
                                                const isCurrent = currentEpisode?.id === episode.id;
                                                const globalIndex = episodesList.findIndex(ep => ep.id === episode.id);
                                                const episodeHasDownload = hasDownload(episode);

                                                return (
                                                    <div
                                                        key={episode.id}
                                                        className={`flex items-center gap-3 p-3 md:p-4 rounded-xl transition-all duration-200 ${isCurrent
                                                            ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 border border-purple-500/50 shadow-lg shadow-purple-600/10'
                                                            : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 hover:from-gray-800/50 hover:to-gray-900/50 border border-gray-700/50 hover:border-gray-600'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={() => goToEpisode(globalIndex)}
                                                            className="flex-1 flex items-center gap-3 text-left"
                                                        >
                                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xs md:text-sm font-bold">{epNumber}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-white text-sm md:text-base truncate">
                                                                    {episode.title}
                                                                </h4>
                                                                {episode.duration && (
                                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <FaClock size={10} /> {episode.duration}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isCurrent && (
                                                                <FaPlay size={10} className="text-purple-400 flex-shrink-0" />
                                                            )}
                                                        </button>

                                                        {/* Episode-specific download button */}
                                                        {episodeHasDownload && (
                                                            <button
                                                                onClick={(e) => handleDownload(e, episode)}
                                                                className="p-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 rounded-lg transition-all border border-green-500/20 hover:border-green-500/40 group"
                                                                title="Download this episode"
                                                                disabled={downloading && downloadEpisodeId === episode.id}
                                                            >
                                                                {downloading && downloadEpisodeId === episode.id ? (
                                                                    <FaSpinner className="animate-spin text-green-400 text-sm" />
                                                                ) : (
                                                                    <FaCloudDownloadAlt className="text-green-400 text-sm group-hover:scale-110 transition-transform" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* Comments Section */}
                            {renderCommentsSection()}
                        </div>

                        {/* Right sidebar with series info */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-5 md:p-6 border border-gray-800 sticky top-4">
                                <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                                    <FaInfoCircle className="text-purple-500" />
                                    About {series?.title}
                                </h3>

                                {series?.poster && (
                                    <img
                                        src={series.poster}
                                        alt={series.title}
                                        className="w-full rounded-xl mb-4 border border-gray-700"
                                    />
                                )}

                                <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
                                    {series?.description || 'No description available for this series.'}
                                </p>

                                <div className="space-y-2 text-xs md:text-sm">
                                    {series?.genre && (
                                        <p><span className="text-gray-400">Genre:</span> <span className="text-white">{series.genre}</span></p>
                                    )}
                                    {series?.country && (
                                        <p><span className="text-gray-400">Country:</span> <span className="text-white">{series.country}</span></p>
                                    )}
                                    {series?.language && (
                                        <p><span className="text-gray-400">Language:</span> <span className="text-white">{series.language}</span></p>
                                    )}
                                    {series?.translator && (
                                        <p className="flex items-center gap-1"><span className="text-gray-400">Translator:</span> <span className="text-green-400">{series.translator}</span></p>
                                    )}
                                    <p><span className="text-gray-400">Total Episodes:</span> <span className="text-white">{episodesList.length}</span></p>
                                    <p><span className="text-gray-400">Seasons:</span> <span className="text-white">{seasons.length}</span></p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-800">
                                    <button
                                        onClick={() => setShowComments(!showComments)}
                                        className="w-full px-4 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
                                    >
                                        <FaComment />
                                        {showComments ? 'Hide Comments' : 'View Comments'} ({comments.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1f2937;
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #8b5cf6;
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a78bfa;
                }
            `}</style>
        </div>
    );
};

export default SeriesPlayer;