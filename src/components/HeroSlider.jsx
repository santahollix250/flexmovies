import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlay,
    FaInfoCircle,
    FaTv,
    FaStar,
    FaPlusCircle,
    FaChevronLeft,
    FaChevronRight,
    FaLanguage,
    FaFilm
} from 'react-icons/fa';

// Smart image optimizer with fallback logic and device detection
const useSmartHeroImage = (backgroundUrl, posterUrl, isMobile) => {
    const [optimizedUrl, setOptimizedUrl] = useState(backgroundUrl || posterUrl);
    const [isLoading, setIsLoading] = useState(true);
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        if (!backgroundUrl && !posterUrl) {
            setIsLoading(false);
            return;
        }

        let primaryImage;
        let fallbackImage;

        if (isMobile) {
            primaryImage = posterUrl || backgroundUrl;
            fallbackImage = backgroundUrl || posterUrl;
        } else {
            primaryImage = backgroundUrl || posterUrl;
            fallbackImage = posterUrl || backgroundUrl;
        }

        let url = primaryImage || fallbackImage;

        if (url) {
            if (url.includes('tmdb.org') || url.includes('themoviedb')) {
                if (isMobile) {
                    url = url.replace(/w[0-9]+/, 'w780');
                } else {
                    url = url.replace(/w[0-9]+/, 'original');
                }
            }

            if (url.includes('cloudinary.com')) {
                if (isMobile) {
                    url = url.includes('?')
                        ? `${url}&c_fill,g_auto,q_auto:best,w=780,h=780`
                        : `${url}?c_fill,g_auto,q_auto:best,w=780,h=780`;
                } else {
                    url = url.includes('?')
                        ? `${url}&c_fill,g_auto,q_auto:best,w=1920,h=1080`
                        : `${url}?c_fill,g_auto,q_auto:best,w=1920,h=1080`;
                }
            }
        }

        const img = new Image();
        img.onload = () => {
            setOptimizedUrl(url);
            setIsLoading(false);
        };
        img.onerror = () => {
            if (primaryImage !== fallbackImage && fallbackImage && !useFallback) {
                setUseFallback(true);
            } else {
                setOptimizedUrl(fallbackImage || url);
                setIsLoading(false);
            }
        };
        img.src = url;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [backgroundUrl, posterUrl, isMobile, useFallback]);

    return { optimizedUrl, isLoading };
};

// Individual Slide Component - Enhanced with balanced typography
const HeroSlide = ({
    item,
    isActive,
    onPlay,
    onInfo,
    isMobile,
    slideIndex,
    currentIndex
}) => {
    const { optimizedUrl, isLoading } = useSmartHeroImage(
        item?.background,
        item?.poster,
        isMobile
    );

    const isSeries = item?.type === 'series' || item?.latestEpisode;
    const hasNewEpisode = !!item?.latestEpisode;
    const hasTranslator = !!item?.translator && item.translator.trim() !== '';

    const getBackgroundPosition = () => {
        if (isMobile) {
            return 'center 30%';
        }
        return 'center 20%';
    };

    const itemRef = useRef(item);
    useEffect(() => {
        itemRef.current = item;
    }, [item]);

    const handlePlayClick = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const currentItem = itemRef.current;
        if (currentItem && onPlay) {
            onPlay(currentItem, e);
        }
    }, [onPlay]);

    const handleInfoClick = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const currentItem = itemRef.current;
        if (currentItem && onInfo) {
            onInfo(currentItem, e);
        }
    }, [onInfo]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`absolute inset-0 ${isActive ? 'z-10' : 'z-0 pointer-events-none'}`}
        >
            <div className="relative w-full h-full overflow-hidden">
                {/* Background Image Container */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[8000ms] ease-out"
                    style={{
                        backgroundImage: `url(${optimizedUrl})`,
                        backgroundPosition: getBackgroundPosition(),
                        backgroundSize: 'cover',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    }}
                />

                {/* Loading Skeleton */}
                {isLoading && isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black animate-pulse">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                )}

                {/* Enhanced Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent hidden md:block" />

                {/* Mobile-specific Gradients */}
                {isMobile && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
                    </>
                )}

                {/* Content Container */}
                <div className={`absolute bottom-0 left-0 right-0 z-20 ${isMobile ? 'p-4 pb-6' : 'p-6 md:p-8 lg:p-10'}`}>
                    <div className="max-w-7xl mx-auto">
                        <div className={isMobile ? 'w-full' : 'max-w-2xl lg:max-w-3xl'}>
                            {/* Badges Section */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex flex-wrap gap-1.5 md:gap-3 mb-2 md:mb-4"
                            >
                                {/* Type Badge */}
                                <span className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full font-semibold shadow-lg ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'
                                    } bg-gradient-to-r from-purple-600 to-pink-600 text-white`}>
                                    {isSeries ? (
                                        <><FaTv className="inline mr-1 text-[8px] md:text-xs" /> SERIES</>
                                    ) : (
                                        <><FaFilm className="inline mr-1 text-[8px] md:text-xs" /> MOVIE</>
                                    )}
                                </span>

                                {/* Translator Badge */}
                                {hasTranslator && (
                                    <span className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full bg-blue-600 text-white font-semibold flex items-center gap-1 shadow-lg ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'
                                        }`}>
                                        <FaLanguage className="text-[8px] md:text-xs" />
                                        {item.translator}
                                    </span>
                                )}

                                {/* New Episode Badge */}
                                {hasNewEpisode && (
                                    <span className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full bg-green-600 text-white font-semibold flex items-center gap-1 animate-pulse shadow-lg ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'
                                        }`}>
                                        <FaPlusCircle className="text-[8px] md:text-xs" />
                                        {!isMobile && 'NEW EPISODE'}
                                        {isMobile && 'NEW'}
                                    </span>
                                )}

                                {/* Episode Number Badge */}
                                {hasNewEpisode && item.latestEpisode && (
                                    <span className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full bg-purple-600/90 text-white font-semibold shadow-lg ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'
                                        }`}>
                                        S{item.latestEpisode.seasonNumber}:E{item.latestEpisode.episodeNumber}
                                    </span>
                                )}

                                {/* Rating Badge */}
                                {item?.rating && (
                                    <span className={`flex items-center gap-1 text-yellow-400 bg-black/50 px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm shadow-lg ${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'
                                        }`}>
                                        <FaStar className="text-[8px] md:text-xs" />
                                        {item.rating}
                                    </span>
                                )}
                            </motion.div>

                            {/* Title - Moderately larger */}
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className={`font-bold text-white leading-tight drop-shadow-lg ${isMobile
                                    ? 'text-2xl mb-1'
                                    : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-3'
                                    }`}
                                style={{
                                    textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                                }}
                            >
                                {item?.title}
                                {hasNewEpisode && !isMobile && (
                                    <span className="text-base md:text-xl ml-2 text-purple-400">- New Episode</span>
                                )}
                                {hasNewEpisode && isMobile && (
                                    <span className="text-xs ml-1 text-purple-400">- New</span>
                                )}
                            </motion.h1>

                            {/* Episode Title */}
                            {hasNewEpisode && item.latestEpisode && (
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className={`text-purple-300 font-medium drop-shadow-md ${isMobile ? 'text-[11px] mb-1' : 'text-sm md:text-base lg:text-lg mb-2 md:mb-3'
                                        }`}
                                >
                                    Latest: {item.latestEpisode.title}
                                </motion.h2>
                            )}

                            {/* Description - Slightly larger */}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className={`text-gray-200 drop-shadow-md leading-relaxed ${isMobile
                                    ? 'text-[11px] mb-3 line-clamp-2'
                                    : 'text-sm md:text-base lg:text-lg mb-3 md:mb-5 line-clamp-2 md:line-clamp-3'
                                    }`}
                            >
                                {hasNewEpisode && item.latestEpisode?.description
                                    ? item.latestEpisode.description
                                    : item?.description || 'Experience this amazing content.'}
                            </motion.p>

                            {/* Action Buttons - Slightly larger */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="flex gap-2 md:gap-3"
                            >
                                <button
                                    onClick={handlePlayClick}
                                    className={`bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold flex items-center gap-1.5 shadow-xl transition-all duration-300 active:scale-95 hover:shadow-lg ${isMobile
                                        ? 'px-4 py-2 text-xs'
                                        : 'px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base'
                                        } hover:from-purple-700 hover:to-pink-700 transform hover:scale-105`}
                                    aria-label="Watch now"
                                >
                                    <FaPlay className={isMobile ? 'text-[10px]' : 'text-xs md:text-sm'} />
                                    <span>{hasNewEpisode ? 'Watch Latest' : 'Watch Now'}</span>
                                </button>
                                <button
                                    onClick={handleInfoClick}
                                    className={`bg-black/50 backdrop-blur-sm rounded-lg text-white font-semibold flex items-center gap-1.5 border border-white/20 transition-all duration-300 active:scale-95 hover:bg-black/70 ${isMobile
                                        ? 'px-4 py-2 text-xs'
                                        : 'px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base'
                                        } transform hover:scale-105`}
                                    aria-label="More info"
                                >
                                    <FaInfoCircle className={isMobile ? 'text-[10px]' : 'text-xs md:text-sm'} />
                                    <span>Info</span>
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Main HeroSlider Component
const HeroSlider = ({ items, onPlay, onInfo }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const autoPlayRef = useRef(null);
    const itemsRef = useRef(items);
    const isSwiping = useRef(false);

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isAutoPlaying && items.length > 1 && !isMobile) {
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length);
            }, 6000);
        }
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [isAutoPlaying, items.length, isMobile]);

    const pauseAutoPlay = useCallback(() => {
        setIsAutoPlaying(false);
        setTimeout(() => {
            if (!isMobile) setIsAutoPlaying(true);
        }, 10000);
    }, [isMobile]);

    const nextSlide = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (itemsRef.current && itemsRef.current.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % itemsRef.current.length);
            pauseAutoPlay();
        }
    }, [pauseAutoPlay]);

    const prevSlide = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (itemsRef.current && itemsRef.current.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + itemsRef.current.length) % itemsRef.current.length);
            pauseAutoPlay();
        }
    }, [pauseAutoPlay]);

    const handleTouchStart = useCallback((e) => {
        const target = e.target;
        const isInteractive = target.closest('button') || target.closest('a') || target.closest('[role="button"]');
        if (isInteractive) return;
        setTouchStart(e.touches[0].clientX);
        setIsAutoPlaying(false);
        isSwiping.current = true;
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isSwiping.current) return;
        const touchDelta = Math.abs(e.touches[0].clientX - touchStart);
        if (touchDelta > 10) e.preventDefault();
        setTouchEnd(e.touches[0].clientX);
    }, [touchStart]);

    const handleTouchEnd = useCallback(() => {
        if (!isSwiping.current) {
            setTouchStart(0);
            setTouchEnd(0);
            return;
        }
        const swipeDistance = touchStart - touchEnd;
        const minSwipeDistance = 50;
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) nextSlide();
            else prevSlide();
        }
        setTouchStart(0);
        setTouchEnd(0);
        isSwiping.current = false;
        setTimeout(() => {
            if (!isMobile) setIsAutoPlaying(true);
        }, 5000);
    }, [touchStart, touchEnd, nextSlide, prevSlide, isMobile]);

    const goToSlide = useCallback((index, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (index >= 0 && index < itemsRef.current.length) {
            setCurrentIndex(index);
            pauseAutoPlay();
        }
    }, [pauseAutoPlay]);

    const handlePlayClick = useCallback((item, event) => {
        if (onPlay) onPlay(item, event);
    }, [onPlay]);

    const handleInfoClick = useCallback((item, event) => {
        if (onInfo) onInfo(item, event);
    }, [onInfo]);

    if (!items || items.length === 0) return null;

    return (
        <section
            className={`relative overflow-hidden bg-black select-none ${isMobile ? 'h-[55vh] sm:h-[60vh]' : 'h-[70vh] md:h-[75vh] lg:h-[80vh]'
                }`}
            onMouseEnter={() => !isMobile && setIsAutoPlaying(false)}
            onMouseLeave={() => !isMobile && setIsAutoPlaying(true)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Slides Container */}
            <div className="relative w-full h-full">
                {items.map((item, index) => (
                    <HeroSlide
                        key={item?.id || index}
                        item={item}
                        isActive={index === currentIndex}
                        onPlay={handlePlayClick}
                        onInfo={handleInfoClick}
                        isMobile={isMobile}
                        slideIndex={index}
                        currentIndex={currentIndex}
                    />
                ))}
            </div>

            {/* Navigation Dots */}
            {items.length > 1 && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 z-30 flex gap-1.5 md:gap-2 ${isMobile ? 'bottom-3' : 'bottom-4 md:bottom-6'
                    }`}>
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => goToSlide(index, e)}
                            className="group focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <span
                                className={`block transition-all duration-300 rounded-full ${index === currentIndex
                                    ? isMobile
                                        ? 'w-4 h-1 bg-gradient-to-r from-purple-600 to-pink-600'
                                        : 'w-6 md:w-8 h-1 bg-gradient-to-r from-purple-600 to-pink-600'
                                    : isMobile
                                        ? 'w-1.5 h-1 bg-gray-500 group-hover:bg-gray-400'
                                        : 'w-2 md:w-3 h-1 bg-gray-500 group-hover:bg-gray-400'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Navigation Arrows - Desktop Only */}
            {items.length > 1 && !isMobile && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300 hover:scale-110 group focus:outline-none"
                        aria-label="Previous slide"
                    >
                        <FaChevronLeft className="text-white text-sm group-hover:text-purple-400 transition-colors" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300 hover:scale-110 group focus:outline-none"
                        aria-label="Next slide"
                    >
                        <FaChevronRight className="text-white text-sm group-hover:text-purple-400 transition-colors" />
                    </button>
                </>
            )}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800/50 z-30">
                <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-400 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
                />
            </div>

            {/* Slide Counter */}
            {items.length > 1 && (
                <div className={`absolute z-30 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 ${isMobile
                    ? 'top-2 right-2 px-1.5 py-0.5 text-[8px]'
                    : 'top-4 md:top-6 right-4 md:right-6 px-2 py-1 text-[10px] md:text-xs'
                    }`}>
                    <span className="text-purple-400 font-bold">{currentIndex + 1}</span>
                    <span className="text-white">/{items.length}</span>
                </div>
            )}
        </section>
    );
};

export default HeroSlider;