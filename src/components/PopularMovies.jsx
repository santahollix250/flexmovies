import { useContext, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MoviesContext } from "../context/MoviesContext";
import MovieCard from "../components/MovieCard";
import {
  FaSearch,
  FaFilter,
  FaFire,
  FaStar,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaInfoCircle,
  FaChevronDown,
  FaFilm,
  FaTv,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarAlt,
  FaRegClock,
  FaRegHeart,
  FaHeart,
  FaTh,
  FaList,
  FaRocket,
  FaCrown,
  FaMedal,
  FaVideo,
  FaCamera,
  FaTheaterMasks,
  FaBolt,
  FaGem,
  FaMagic,
  FaBars,
  FaEye,
  FaClock,
  FaSpinner,
  FaUpload,
  FaPlusCircle,
  FaPlayCircle,
  FaLanguage,
  FaSkull,
  FaLaugh,
  FaHeart as FaHeartIcon,
  FaRobot,
  FaDragon,
  FaMask,
  FaGlobe,
  FaBabyCarriage,
  FaGhost,
  FaSpaceShuttle,
  FaBrain,
  FaTree,
  FaMusic,
  FaFootballBall,
  FaGavel
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// ===== ENHANCED CINEMATIC LOADING ANIMATION WITH ACF LOGO =====
const CinematicLoading = () => {
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [acfLetter, setAcfLetter] = useState('A');
  const letters = ['A', 'C', 'F'];

  // Letter rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAcfLetter(prev => {
        const currentIndex = letters.indexOf(prev);
        const nextIndex = (currentIndex + 1) % letters.length;
        return letters[nextIndex];
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Film reel animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 12);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Progress animation with smooth increments
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + Math.random() * 1.5;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Show tagline after logo appears
  useEffect(() => {
    if (logoLoaded) {
      setTimeout(() => setShowTagline(true), 500);
    }
  }, [logoLoaded]);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 150);
    }, 3000);
    return () => clearInterval(glitchInterval);
  }, []);

  // Cinematic quotes
  const quotes = [
    "Premium Streaming Experience",
    "Where Stories Come to Life",
    "Your Ultimate Entertainment Hub",
    "Cinema at Your Fingertips",
    "Experience the Magic of Movies",
    "Unlimited Entertainment, Unlimited Joy",
    "Stream the Best, Watch the Rest",
    "Your Gateway to Cinema Excellence"
  ];

  const currentQuote = quotes[Math.floor(progress / 12.5) % quotes.length];

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Animated Background Gradient - Black & Gold */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-yellow-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent" />
      </div>

      {/* Animated Particle Effect - Gold particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-yellow-500/40 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, -150, -300],
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Floating Gold Dust */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            className="absolute w-1 h-1 bg-yellow-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, -100],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Film Strip Pattern - Top with gold animation */}
      <div className="absolute top-0 left-0 w-full h-24 sm:h-28 opacity-20">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, #FFD700 30px, #FFD700 40px, transparent 40px, transparent 70px)',
            backgroundSize: '70px 100%',
          }}
          animate={{
            backgroundPosition: ['0px', '70px']
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Film Strip Pattern - Bottom with gold animation */}
      <div className="absolute bottom-0 left-0 w-full h-24 sm:h-28 opacity-20">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, #FFD700 30px, #FFD700 40px, transparent 40px, transparent 70px)',
            backgroundSize: '70px 100%',
          }}
          animate={{
            backgroundPosition: ['70px', '0px']
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Animated Grain Texture */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          animation: 'grain 8s steps(10) infinite'
        }}
      />

      {/* Scanlines Effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(255,215,0,0.05) 0px, rgba(255,215,0,0.05) 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 2px'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        {/* Center Container */}
        <div className="max-w-4xl w-full mx-auto text-center">
          {/* ACF Logo Container - Premium Design */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-8 sm:mb-10 md:mb-12"
          >
            {/* 3D Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-3xl blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Main Logo Container */}
            <div className="relative">
              <motion.div
                className="relative inline-block"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onAnimationComplete={() => setLogoLoaded(true)}
              >
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 animate-spin-slow" style={{ padding: '4px' }}>
                  <div className="absolute inset-[4px] rounded-full bg-black" />
                </div>

                {/* ACF Letters Container */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto flex items-center justify-center">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-yellow-500/20 rounded-full blur-xl" />

                  {/* Main ACF Letters */}
                  <div className="relative flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
                    {['A', 'C', 'F'].map((letter, index) => (
                      <motion.div
                        key={letter}
                        className="relative"
                        animate={{
                          y: [0, -8, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: index * 0.2,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl blur-md opacity-50" />
                          <div className={`relative text-7xl sm:text-8xl md:text-9xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent ${glitchEffect ? 'animate-glitch' : ''}`}
                            style={{
                              textShadow: '0 0 20px rgba(255,215,0,0.5)',
                            }}
                          >
                            {letter}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8"
                    animate={{
                      rotate: [0, 15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <FaPlayCircle className="text-yellow-500 text-3xl sm:text-4xl drop-shadow-lg" />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8"
                    animate={{
                      rotate: [0, -15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3
                    }}
                  >
                    <FaFilm className="text-yellow-500 text-3xl sm:text-4xl drop-shadow-lg" />
                  </motion.div>
                  <motion.div
                    className="absolute top-1/2 -right-8 sm:-right-10 transform -translate-y-1/2"
                    animate={{
                      x: [0, 5, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  >
                    <FaStar className="text-yellow-400 text-xl sm:text-2xl" />
                  </motion.div>
                  <motion.div
                    className="absolute top-1/2 -left-8 sm:-left-10 transform -translate-y-1/2"
                    animate={{
                      x: [0, -5, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.5
                    }}
                  >
                    <FaStar className="text-yellow-400 text-xl sm:text-2xl" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Brand Name */}
              <motion.h1
                className={`relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mt-6 ${glitchEffect ? 'animate-glitch' : ''}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                  AGASOBANUYE CINEVA FILMS
                </span>
                <motion.span
                  className="absolute -top-2 -right-2 text-sm sm:text-base"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                >
                  ✨
                </motion.span>
              </motion.h1>

              {/* Tagline */}
              <AnimatePresence>
                {showTagline && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xs sm:text-sm text-yellow-400/80 mt-2 tracking-wider font-light"
                  >
                    {currentQuote}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Film Reel Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex justify-center items-center gap-2 sm:gap-3 mb-8 sm:mb-10"
          >
            {/* Left Reel */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
              <motion.div
                className="absolute inset-0 border-2 border-yellow-600/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 border-2 border-yellow-600/50 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 border-2 border-yellow-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-yellow-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </div>

            {/* Center Film Strip */}
            <div className="flex gap-1 sm:gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="relative w-7 h-12 sm:w-8 sm:h-14 md:w-10 md:h-16"
                  animate={{
                    y: [0, -6, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/80 to-yellow-500/80 rounded transform -skew-y-3 shadow-lg">
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-white/30 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/20 rounded-full" />
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-white/30 rounded-full" />
                    <div className="absolute bottom-0 right-1 text-[4px] sm:text-[6px] text-white/40">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Reel */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
              <motion.div
                className="absolute inset-0 border-2 border-yellow-600/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 border-2 border-yellow-600/50 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 border-2 border-yellow-600 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-yellow-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="max-w-xs sm:max-w-sm mx-auto"
          >
            <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-1.5 h-1.5 bg-yellow-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="text-[10px] text-gray-500 tracking-wider">
                  LOADING EXPERIENCE
                </span>
              </div>
              <motion.span
                className="text-[10px] font-mono text-yellow-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {Math.floor(progress)}%
              </motion.span>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-yellow-600/50 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>

            <motion.div
              className="flex justify-center gap-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {["🎬", "🎥", "🍿", "🎞️", "✨"].map((icon, index) => (
                <motion.span
                  key={index}
                  className="text-base sm:text-lg"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.15,
                    ease: "easeInOut"
                  }}
                >
                  {icon}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8"
          >
            <p className="text-[10px] text-gray-600 max-w-md mx-auto">
              Experience the ultimate streaming destination with the latest movies, series, and exclusive content
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="absolute bottom-4 left-0 right-0 text-center"
        >
          <p className="text-[8px] text-yellow-700/50 tracking-[0.3em] uppercase">
            PREMIUM CINEMATIC STREAMING PLATFORM
          </p>
          <p className="text-[6px] text-gray-800 mt-1">
            © 2025 AGASOBANUYE CINEVA FILMS. ALL RIGHTS RESERVED.
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-2%, 0); }
          40% { transform: translate(2%, 2%); }
          50% { transform: translate(-1%, 2%); }
          60% { transform: translate(1%, -1%); }
          70% { transform: translate(-2%, 1%); }
          80% { transform: translate(2%, -1%); }
          90% { transform: translate(-1%, -2%); }
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
          100% { transform: translate(0); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-glitch {
          animation: glitch 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default function Movies() {
  const {
    movies = [],
    episodes = [],
    loading = false,
    globalSearchQuery,
    clearGlobalSearch
  } = useContext(MoviesContext);

  const location = useLocation();
  const navigate = useNavigate();

  // If there's a global search query, redirect to search page
  useEffect(() => {
    if (globalSearchQuery && location.pathname === '/movies') {
      navigate(`/search?search=${encodeURIComponent(globalSearchQuery)}`);
    }
  }, [globalSearchQuery, location.pathname, navigate]);

  // Refs for touch handling
  const heroRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';

  // Hero Slider State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [heroContentType, setHeroContentType] = useState("all");
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [likedMovies, setLikedMovies] = useState([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewMovie, setQuickViewMovie] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const itemsPerPage = 24;

  // Touch handlers for mobile hero slider
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diffX = touchStartX.current - touchEndX.current;

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        setCurrentHeroSlide((prev) => (prev + 1) % filteredHeroContent.length);
      } else {
        setCurrentHeroSlide((prev) => (prev - 1 + filteredHeroContent.length) % filteredHeroContent.length);
      }
    }

    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Helper function to get episodes for a series
  const getEpisodesForSeries = useCallback((seriesId) => {
    return episodes.filter(ep => ep.seriesId === seriesId);
  }, [episodes]);

  // Helper function to sort episodes
  const sortEpisodes = useCallback((episodesArray) => {
    if (!episodesArray || !Array.isArray(episodesArray)) return [];
    return [...episodesArray].sort((a, b) => {
      const seasonA = parseInt(a.seasonNumber) || parseInt(a.season_number) || 1;
      const seasonB = parseInt(b.seasonNumber) || parseInt(b.season_number) || 1;
      const episodeA = parseInt(a.episodeNumber) || parseInt(a.episode_number) || 1;
      const episodeB = parseInt(b.episodeNumber) || parseInt(b.episode_number) || 1;
      if (seasonA !== seasonB) return seasonA - seasonB;
      return episodeA - episodeB;
    });
  }, []);

  // Helper function to get movie parts from download field
  const getMovieParts = useCallback((movie) => {
    if (!movie) return [];
    if (movie.parts && Array.isArray(movie.parts)) {
      return movie.parts;
    }
    if (movie.download) {
      try {
        const parsed = typeof movie.download === 'string'
          ? JSON.parse(movie.download)
          : movie.download;
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (parsed && parsed.parts && Array.isArray(parsed.parts)) {
          return parsed.parts;
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
    return [];
  }, []);

  // Function to get optimized image URL
  const getOptimizedImageUrl = useCallback((url, isBackground = true) => {
    if (!url) return null;

    if (isBackground && window.innerWidth > 1024) {
      if (url.includes('tmdb.org') || url.includes('themoviedb')) {
        return url.replace(/w[0-9]+/, 'original');
      }
      if (url.includes('cloudinary.com')) {
        return url.includes('?') ? `${url}&q_auto:best&c_fill&g_auto` : `${url}?q_auto:best&c_fill&g_auto`;
      }
    }

    return url;
  }, []);

  // Get hero content with latest episodes
  const heroContent = useMemo(() => {
    const seriesWithEpisodes = movies
      .filter(item => item?.type === "series")
      .map(series => {
        const seriesEpisodes = episodes.filter(ep => ep.seriesId === series.id);
        if (seriesEpisodes.length === 0) return null;
        const latestEpisode = seriesEpisodes.sort((a, b) => {
          const dateA = a?.created_at || a?.id || 0;
          const dateB = b?.created_at || b?.id || 0;
          return new Date(dateB) - new Date(dateA);
        })[0];
        return {
          ...series,
          latestEpisode: {
            id: latestEpisode.id,
            title: latestEpisode.title,
            seasonNumber: latestEpisode.seasonNumber,
            episodeNumber: latestEpisode.episodeNumber,
            description: latestEpisode.description || series.description,
            videoUrl: latestEpisode.videoUrl,
            duration: latestEpisode.duration,
            created_at: latestEpisode.created_at
          },
          hasNewEpisode: true,
          episodeCount: seriesEpisodes.length,
          lastUpdated: latestEpisode.created_at
        };
      })
      .filter(series => series !== null);

    const moviesWithBackground = movies
      .filter(item => item?.type === "movie" && item?.background)
      .map(movie => ({
        ...movie,
        type: 'movie'
      }));

    const allContent = [...moviesWithBackground, ...seriesWithEpisodes]
      .sort((a, b) => {
        const dateA = a?.lastUpdated || a?.created_at || a?.id || 0;
        const dateB = b?.lastUpdated || b?.created_at || b?.id || 0;
        return new Date(dateB) - new Date(dateA);
      });

    return allContent.slice(0, 8);
  }, [movies, episodes]);

  // Filter hero content by type
  const filteredHeroContent = useMemo(() => {
    if (heroContentType === "all") return heroContent;
    if (heroContentType === "movies") return heroContent.filter(item => item?.type === "movie");
    if (heroContentType === "series") return heroContent.filter(item => item?.type === "series" || item?.latestEpisode);
    return heroContent;
  }, [heroContent, heroContentType]);

  const currentHeroItem = filteredHeroContent[currentHeroSlide] || {};
  const isSeriesWithNewEpisode = currentHeroItem?.latestEpisode ? true : false;

  // Get recently updated series
  const recentlyUpdatedSeries = useMemo(() => {
    return movies
      .filter(item => item?.type === "series")
      .map(series => {
        const seriesEpisodes = episodes.filter(ep => ep.seriesId === series.id);
        if (seriesEpisodes.length === 0) return null;
        const latestEpisode = seriesEpisodes.sort((a, b) => {
          const dateA = a?.created_at || a?.id || 0;
          const dateB = b?.created_at || b?.id || 0;
          return new Date(dateB) - new Date(dateA);
        })[0];
        return {
          ...series,
          latestEpisode,
          episodeCount: seriesEpisodes.length,
          lastUpdated: latestEpisode.created_at
        };
      })
      .filter(series => series !== null)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 12);
  }, [movies, episodes]);

  // Latest uploads
  const latestUploads = useMemo(() => {
    const moviesList = movies
      .filter(movie => movie?.type === "movie")
      .map(movie => ({
        ...movie,
        uploadType: 'movie',
        displayDate: movie?.created_at || movie?.id
      }));

    const seriesList = movies
      .filter(item => item?.type === "series")
      .map(series => {
        const seriesEpisodes = episodes.filter(ep => ep.seriesId === series.id);
        if (seriesEpisodes.length === 0) return null;
        const latestEpisode = seriesEpisodes.sort((a, b) => {
          const dateA = a?.created_at || a?.id || 0;
          const dateB = b?.created_at || b?.id || 0;
          return new Date(dateB) - new Date(dateA);
        })[0];
        return {
          ...series,
          uploadType: 'series',
          latestEpisode,
          displayDate: latestEpisode.created_at || series.created_at || series.id
        };
      })
      .filter(series => series !== null);

    return [...moviesList, ...seriesList]
      .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
      .slice(0, 16);
  }, [movies, episodes]);

  // ===== DYNAMIC CATEGORY EXTRACTION =====
  const dynamicCategories = useMemo(() => {
    const categoryMap = new Map();

    movies.forEach(movie => {
      if (movie?.type === "movie" && movie?.category) {
        const categories = movie.category.split(',').map(cat => cat.trim().toLowerCase());
        categories.forEach(cat => {
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, {
              id: cat,
              name: cat.charAt(0).toUpperCase() + cat.slice(1),
              count: 0,
              movies: []
            });
          }
          categoryMap.get(cat).count++;
          categoryMap.get(cat).movies.push(movie);
        });
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [movies]);

  // Category icons mapping
  const getCategoryIconAndColor = (categoryName) => {
    const categoryLower = categoryName.toLowerCase();

    const iconMap = {
      action: { icon: <FaBolt className="text-orange-500" />, color: "from-orange-600 to-red-600", bgColor: "bg-orange-900/20", borderColor: "border-orange-500/30" },
      horror: { icon: <FaSkull className="text-red-500" />, color: "from-red-600 to-pink-600", bgColor: "bg-red-900/20", borderColor: "border-red-500/30" },
      comedy: { icon: <FaLaugh className="text-green-500" />, color: "from-green-600 to-teal-600", bgColor: "bg-green-900/20", borderColor: "border-green-500/30" },
      drama: { icon: <FaTheaterMasks className="text-purple-500" />, color: "from-purple-600 to-pink-600", bgColor: "bg-purple-900/20", borderColor: "border-purple-500/30" },
      romance: { icon: <FaHeartIcon className="text-pink-500" />, color: "from-pink-600 to-rose-600", bgColor: "bg-pink-900/20", borderColor: "border-pink-500/30" },
      scifi: { icon: <FaRocket className="text-cyan-500" />, color: "from-cyan-600 to-blue-600", bgColor: "bg-cyan-900/20", borderColor: "border-cyan-500/30" },
      fantasy: { icon: <FaMagic className="text-indigo-500" />, color: "from-indigo-600 to-purple-600", bgColor: "bg-indigo-900/20", borderColor: "border-indigo-500/30" },
      thriller: { icon: <FaMask className="text-yellow-500" />, color: "from-yellow-600 to-orange-600", bgColor: "bg-yellow-900/20", borderColor: "border-yellow-500/30" },
      cartoon: { icon: <FaBabyCarriage className="text-yellow-400" />, color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-900/20", borderColor: "border-yellow-500/30" },
      animation: { icon: <FaBabyCarriage className="text-blue-400" />, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-900/20", borderColor: "border-blue-500/30" },
      adventure: { icon: <FaGlobe className="text-green-400" />, color: "from-green-500 to-emerald-500", bgColor: "bg-green-900/20", borderColor: "border-green-500/30" },
      mystery: { icon: <FaGhost className="text-purple-400" />, color: "from-purple-500 to-indigo-500", bgColor: "bg-purple-900/20", borderColor: "border-purple-500/30" },
      crime: { icon: <FaGavel className="text-red-400" />, color: "from-red-500 to-orange-500", bgColor: "bg-red-900/20", borderColor: "border-red-500/30" },
      documentary: { icon: <FaCamera className="text-cyan-400" />, color: "from-cyan-500 to-teal-500", bgColor: "bg-cyan-900/20", borderColor: "border-cyan-500/30" },
      music: { icon: <FaMusic className="text-pink-400" />, color: "from-pink-500 to-rose-500", bgColor: "bg-pink-900/20", borderColor: "border-pink-500/30" },
      sport: { icon: <FaFootballBall className="text-green-400" />, color: "from-green-500 to-lime-500", bgColor: "bg-green-900/20", borderColor: "border-green-500/30" },
      science: { icon: <FaBrain className="text-blue-400" />, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-900/20", borderColor: "border-blue-500/30" },
      space: { icon: <FaSpaceShuttle className="text-cyan-400" />, color: "from-cyan-500 to-blue-500", bgColor: "bg-cyan-900/20", borderColor: "border-cyan-500/30" },
      nature: { icon: <FaTree className="text-green-400" />, color: "from-green-500 to-emerald-500", bgColor: "bg-green-900/20", borderColor: "border-green-500/30" }
    };

    const defaultStyle = { icon: <FaFilm className="text-gray-400" />, color: "from-gray-600 to-gray-500", bgColor: "bg-gray-900/20", borderColor: "border-gray-500/30" };

    return iconMap[categoryLower] || defaultStyle;
  };

  // Get movies by category
  const getMoviesByCategory = useCallback((categoryName) => {
    return movies
      .filter(movie => movie?.type === "movie" &&
        movie?.category?.toLowerCase().split(',').map(c => c.trim()).includes(categoryName.toLowerCase()))
      .sort((a, b) => (parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0))
      .slice(0, 12);
  }, [movies]);

  // Handle movie click
  const handleMovieClick = useCallback((movie) => {
    if (!movie || !movie.id) return;
    const parts = getMovieParts(movie);
    const movieToPlay = {
      ...movie,
      parts: parts,
      hasParts: parts.length > 0,
      videoUrl: movie.videoUrl || (parts.length > 0 ? parts[0]?.videoUrl : null),
      streamLink: movie.streamLink || (parts.length > 0 ? parts[0]?.streamLink || parts[0]?.videoUrl : null),
      download_link: movie.download_link || movie.download,
      download: movie.download
    };
    navigate(`/player/${movie.id}`, {
      state: { movie: movieToPlay }
    });
  }, [navigate, getMovieParts]);

  // Handle series click
  const handleUpdatedSeriesClick = useCallback((series) => {
    if (!series || !series.id) return;
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const latestEpisode = sortedEpisodes.length > 0 ? sortedEpisodes[sortedEpisodes.length - 1] : null;
    if (latestEpisode) {
      const episodeIndex = sortedEpisodes.findIndex(ep => ep && ep.id === latestEpisode.id);
      navigate(`/series-player/${series.id}`, {
        state: {
          series: series,
          episode: latestEpisode,
          episodes: sortedEpisodes,
          episodeIndex: episodeIndex
        }
      });
    } else {
      alert('No episodes available for this series yet.');
    }
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  // Handle series click
  const handleSeriesClick = useCallback((series) => {
    if (!series || !series.id) return;
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const targetEpisode = sortedEpisodes.length > 0 ? sortedEpisodes[0] : null;
    if (targetEpisode) {
      navigate(`/series-player/${series.id}`, {
        state: {
          series: series,
          episode: targetEpisode,
          episodes: sortedEpisodes,
          episodeIndex: 0
        }
      });
    } else {
      alert('No episodes available for this series yet.');
    }
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  // Handle series click with specific episode
  const handleSeriesClickWithEpisode = useCallback((series, episode) => {
    if (!series || !series.id || !episode) return;
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const episodeIndex = sortedEpisodes.findIndex(ep => ep && ep.id === episode.id);
    navigate(`/series-player/${series.id}`, {
      state: {
        series: series,
        episode: episode,
        episodes: sortedEpisodes,
        episodeIndex: episodeIndex >= 0 ? episodeIndex : 0
      }
    });
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  // Handle hero play
  const handleHeroPlayClick = useCallback(() => {
    if (!currentHeroItem || !currentHeroItem.id) return;
    if (isSeriesWithNewEpisode && currentHeroItem.latestEpisode) {
      handleSeriesClickWithEpisode(currentHeroItem, currentHeroItem.latestEpisode);
    } else if (currentHeroItem.type === "series") {
      handleSeriesClick(currentHeroItem);
    } else {
      handleMovieClick(currentHeroItem);
    }
  }, [currentHeroItem, isSeriesWithNewEpisode, handleSeriesClickWithEpisode, handleSeriesClick, handleMovieClick]);

  // Handle hero info
  const handleHeroInfoClick = useCallback(() => {
    if (!currentHeroItem) return;
    setQuickViewMovie(currentHeroItem);
    setShowQuickView(true);
    setIsAutoPlaying(false);
  }, [currentHeroItem]);

  // Auto slide
  useEffect(() => {
    if (!isAutoPlaying || filteredHeroContent.length === 0 || isHoveringHero) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % filteredHeroContent.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredHeroContent.length, isHoveringHero]);

  const nextHeroSlide = useCallback(() => {
    setCurrentHeroSlide((prev) => (prev + 1) % filteredHeroContent.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [filteredHeroContent.length]);

  const prevHeroSlide = useCallback(() => {
    setCurrentHeroSlide((prev) => (prev - 1 + filteredHeroContent.length) % filteredHeroContent.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [filteredHeroContent.length]);

  // Get all categories for filter
  const allCategories = useMemo(() => {
    const categories = new Set(['all', 'featured']);
    movies.forEach(movie => {
      if (movie?.category) {
        movie.category.split(',').map(cat => cat.trim()).forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories);
  }, [movies]);

  const getCategoryIcon = (category) => {
    const style = getCategoryIconAndColor(category);
    return style.icon;
  };

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let filtered = movies.filter(movie => movie?.type === "movie");

    if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "featured") {
      filtered = filtered.filter(movie =>
        movie?.category?.toLowerCase().split(',').map(c => c.trim()).includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedCategory === "featured") {
      filtered = filtered.filter(movie => movie?.background || (movie?.rating && parseFloat(movie.rating) >= 8));
    }

    filtered.sort((a, b) => {
      const order = sortOrder === "desc" ? -1 : 1;
      switch (sortBy) {
        case "rating":
          return ((parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0)) * order;
        case "year":
          return ((parseInt(b?.year) || 0) - (parseInt(a?.year) || 0)) * order;
        case "title":
          return (a?.title || '').localeCompare(b?.title || '') * (sortOrder === "desc" ? 1 : -1);
        default:
          const ratingDiff = ((parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0)) * order;
          return ratingDiff !== 0 ? ratingDiff : ((b?.id || 0) - (a?.id || 0)) * order;
      }
    });

    return filtered;
  }, [movies, selectedCategory, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMovies, currentPage]);

  // Featured movies
  const featuredMovies = useMemo(() => {
    return movies
      .filter(movie => movie?.type === "movie" && (movie?.background || (movie?.rating && parseFloat(movie.rating) >= 8.5)))
      .sort((a, b) => (parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0))
      .slice(0, 12);
  }, [movies]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, sortOrder]);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  }, []);

  // Loading state
  if (loading) {
    return <CinematicLoading />;
  }

  // Don't show movies page content if there's a search query
  if (globalSearchQuery) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20">
      {/* Hero Slider Section - Fixed for mobile */}
      {filteredHeroContent.length > 0 && (
        <section
          ref={heroRef}
          className="relative h-[70vh] md:h-[75vh] lg:h-[80vh] xl:h-[85vh] overflow-hidden group"
          onMouseEnter={() => setIsHoveringHero(true)}
          onMouseLeave={() => setIsHoveringHero(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {filteredHeroContent.map((item, index) => (
            <div
              key={item?.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="relative w-full h-full">
                {imageLoading && index === currentHeroSlide && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center">
                      <FaSpinner className="text-purple-600 text-4xl animate-spin mb-3" />
                      <p className="text-gray-400 text-sm">Loading cinematic experience...</p>
                    </div>
                  </div>
                )}

                {/* Improved image container for mobile */}
                <div className="absolute inset-0">
                  <img
                    src={getOptimizedImageUrl(item?.background || item?.poster, true)}
                    alt={item?.title}
                    className="w-full h-full object-cover md:object-cover"
                    style={{
                      objectPosition: 'center 20%', // Better positioning for mobile
                      transform: 'scale(1)',
                    }}
                    loading={index === currentHeroSlide ? "eager" : "lazy"}
                    onLoad={() => {
                      if (index === currentHeroSlide) {
                        setImageLoading(false);
                      }
                    }}
                    onError={(e) => {
                      if (index === currentHeroSlide) {
                        setImageLoading(false);
                      }
                      if (e.target.src !== item?.poster && item?.poster) {
                        e.target.src = getOptimizedImageUrl(item?.poster, true);
                      }
                    }}
                  />
                </div>

                {/* Enhanced gradient overlay for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-[2]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent hidden md:block z-[2]" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/30 hidden md:block z-[2]" />
              </div>
            </div>
          ))}

          {/* Content overlay - Improved positioning for mobile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 z-20">
            <div className="max-w-7xl mx-auto w-full">
              <div className="md:max-w-2xl lg:max-w-3xl text-left">
                {/* Badges - Visible on both mobile and desktop */}
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 flex-wrap">
                  <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                    {isSeriesWithNewEpisode ? <><FaTv className="inline mr-1 md:mr-2 text-[10px] md:text-sm" /> SERIES</> : currentHeroItem?.type === "series" ? <><FaTv className="inline mr-1 md:mr-2 text-[10px] md:text-sm" /> SERIES</> : <><FaPlay className="inline mr-1 md:mr-2 text-[10px] md:text-sm" /> MOVIE</>}
                  </span>
                  {isSeriesWithNewEpisode && (
                    <>
                      <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-green-600 text-white text-[10px] md:text-xs font-semibold flex items-center gap-1 md:gap-2 animate-pulse shadow-lg">
                        <FaPlusCircle className="text-[8px] md:text-sm" />
                        NEW EPISODE
                      </span>
                      <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-purple-600/90 text-white text-[10px] md:text-xs font-semibold shadow-lg">
                        S{currentHeroItem.latestEpisode.seasonNumber}:E{currentHeroItem.latestEpisode.episodeNumber}
                      </span>
                    </>
                  )}
                  {currentHeroItem?.translator && (
                    <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] md:text-xs font-semibold flex items-center gap-1 md:gap-2 shadow-lg">
                      <FaLanguage className="text-[8px] md:text-sm" />
                      <span className="hidden lg:inline">Translator: {currentHeroItem.translator}</span>
                      <span className="inline lg:hidden max-w-[60px] truncate">{currentHeroItem.translator}</span>
                    </div>
                  )}
                  {currentHeroItem?.rating && (
                    <span className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm text-yellow-400 bg-yellow-900/30 px-2 md:px-3 py-1 md:py-1.5 rounded-lg backdrop-blur-sm">
                      <FaStar className="text-[8px] md:text-sm" /> {currentHeroItem.rating}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 md:mb-4 leading-tight drop-shadow-lg">
                  {currentHeroItem?.title}
                  {isSeriesWithNewEpisode && (
                    <span className="text-sm md:text-2xl lg:text-3xl ml-2 md:ml-3 text-purple-400">
                      - New Episode
                    </span>
                  )}
                </h1>

                {isSeriesWithNewEpisode && currentHeroItem.latestEpisode && (
                  <h2 className="text-xs md:text-lg lg:text-xl text-purple-300 mb-2 md:mb-4 font-medium drop-shadow-md">
                    Latest: {currentHeroItem.latestEpisode.title}
                  </h2>
                )}

                <p className="text-xs md:text-sm lg:text-base text-gray-200 mb-3 md:mb-6 line-clamp-2 md:line-clamp-3 max-w-2xl lg:max-w-3xl drop-shadow-md">
                  {isSeriesWithNewEpisode && currentHeroItem.latestEpisode?.description
                    ? currentHeroItem.latestEpisode.description
                    : currentHeroItem?.description || 'Experience this amazing content.'}
                </p>

                <div className="flex gap-2 md:gap-3 lg:gap-4">
                  <button
                    onClick={handleHeroPlayClick}
                    className="px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xs md:text-sm lg:text-base font-semibold flex items-center gap-1 md:gap-2 shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <FaPlay className="text-[10px] md:text-xs lg:text-sm" />
                    <span>{isSeriesWithNewEpisode ? 'Watch Latest' : 'Watch Now'}</span>
                  </button>
                  <button
                    onClick={handleHeroInfoClick}
                    className="px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 bg-gray-800/90 backdrop-blur-sm rounded-lg text-white text-xs md:text-sm lg:text-base font-semibold flex items-center gap-1 md:gap-2 border border-gray-700 hover:bg-gray-700/90 transition-all duration-300 transform hover:scale-105"
                  >
                    <FaInfoCircle className="text-[10px] md:text-xs lg:text-sm" />
                    <span>Info</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Made more compact for mobile */}
          <div className="absolute top-2 md:top-4 lg:top-6 left-2 md:left-4 lg:left-6 z-20 flex gap-1 md:gap-2">
            <button
              onClick={() => setHeroContentType("all")}
              className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs lg:text-sm font-medium transition-all duration-300 ${heroContentType === "all"
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-black/60 backdrop-blur-sm text-gray-300 hover:bg-black/80 border border-white/20'}`}
            >
              All
            </button>
            <button
              onClick={() => setHeroContentType("movies")}
              className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs lg:text-sm font-medium transition-all duration-300 ${heroContentType === "movies"
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-black/60 backdrop-blur-sm text-gray-300 hover:bg-black/80 border border-white/20'}`}
            >
              Movies
            </button>
            <button
              onClick={() => setHeroContentType("series")}
              className={`px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs lg:text-sm font-medium transition-all duration-300 ${heroContentType === "series"
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-black/60 backdrop-blur-sm text-gray-300 hover:bg-black/80 border border-white/20'}`}
            >
              Series
            </button>
          </div>

          {/* Slide indicators - Made more compact for mobile */}
          <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 md:gap-2 z-20">
            {filteredHeroContent.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentHeroSlide(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className="group/dot"
              >
                <span className={`block transition-all duration-300 rounded-full ${index === currentHeroSlide
                  ? 'w-4 md:w-6 lg:w-8 h-0.5 md:h-1 bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'w-1 md:w-1.5 h-0.5 md:h-1 bg-gray-500 group-hover/dot:bg-gray-300'}`} />
              </button>
            ))}
          </div>

          {/* Navigation arrows - Hidden on mobile for better touch experience */}
          <button
            onClick={prevHeroSlide}
            className="hidden md:flex absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 z-30 group/arrow opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-md opacity-0 group-hover/arrow:opacity-50 transition-opacity duration-300" />
              <div className="relative w-8 h-8 lg:w-10 lg:h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover/arrow:border-purple-500/50 transition-all duration-300 group-hover/arrow:scale-110">
                <FaChevronLeft className="text-white text-xs lg:text-sm group-hover/arrow:text-purple-400 transition-colors duration-300" />
              </div>
            </div>
          </button>

          <button
            onClick={nextHeroSlide}
            className="hidden md:flex absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-30 group/arrow opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-l from-purple-600 to-pink-600 rounded-full blur-md opacity-0 group-hover/arrow:opacity-50 transition-opacity duration-300" />
              <div className="relative w-8 h-8 lg:w-10 lg:h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover/arrow:border-purple-500/50 transition-all duration-300 group-hover/arrow:scale-110">
                <FaChevronRight className="text-white text-xs lg:text-sm group-hover/arrow:text-purple-400 transition-colors duration-300" />
              </div>
            </div>
          </button>

          {/* Slide counter - Made more compact for mobile */}
          <div className="absolute top-2 md:top-4 lg:top-6 right-2 md:right-4 lg:right-6 z-20 bg-black/60 backdrop-blur-sm px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs text-white border border-white/20">
            <span className="text-purple-400 font-bold">{currentHeroSlide + 1}</span>/{filteredHeroContent.length}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800/30 z-20">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-400 transition-all duration-300"
              style={{ width: `${((currentHeroSlide + 1) / filteredHeroContent.length) * 100}%` }}
            />
          </div>
        </section>
      )}

      {/* Recently Updated Series Section */}
      {recentlyUpdatedSeries.length > 0 && (
        <section className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaPlayCircle className="text-purple-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Recently Updated Series</span>
              <span className="xs:hidden">Updated Series</span>
            </h2>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {recentlyUpdatedSeries.length}
            </span>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {recentlyUpdatedSeries.map(series => (
              <div
                key={series?.id}
                className="cursor-pointer group relative transform transition-transform duration-300 hover:scale-105"
              >
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                    <FaPlusCircle className="text-[10px]" />
                    S{series.latestEpisode.seasonNumber}:E{series.latestEpisode.episodeNumber}
                  </span>
                </div>
                <MovieCard movie={series} onSeriesClick={handleUpdatedSeriesClick} />
              </div>
            ))}
          </div>

          <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
            {recentlyUpdatedSeries.map(series => (
              <div
                key={series?.id}
                className="flex-none w-[130px] sm:w-[150px] relative transform transition-transform duration-300 active:scale-95"
              >
                <div className="absolute top-1 left-1 z-10">
                  <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[10px] rounded-full shadow-lg">
                    S{series.latestEpisode.seasonNumber}:E{series.latestEpisode.episodeNumber}
                  </span>
                </div>
                <MovieCard movie={series} onSeriesClick={handleUpdatedSeriesClick} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Uploads Section */}
      {latestUploads.length > 0 && (
        <section className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaUpload className="text-green-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Latest Updates</span>
              <span className="xs:hidden">Updates</span>
            </h2>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {latestUploads.length}
            </span>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {latestUploads.map(item => (
              <div
                key={item?.id}
                className="cursor-pointer group relative transform transition-transform duration-300 hover:scale-105"
              >
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  {item.uploadType === 'series' && item.latestEpisode ? (
                    <>
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                        <FaTv className="text-[10px]" />
                        New
                      </span>
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        S{item.latestEpisode.seasonNumber}:E{item.latestEpisode.episodeNumber}
                      </span>
                    </>
                  ) : (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1 shadow-lg">
                      <FaUpload className="text-[10px]" />
                      New
                    </span>
                  )}
                </div>
                <MovieCard
                  movie={item}
                  onSeriesClick={item.uploadType === 'series' ? handleUpdatedSeriesClick : undefined}
                />
              </div>
            ))}
          </div>

          <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
            {latestUploads.map(item => (
              <div
                key={item?.id}
                className="flex-none w-[130px] sm:w-[150px] relative transform transition-transform duration-300 active:scale-95"
              >
                <div className="absolute top-1 left-1 z-10">
                  {item.uploadType === 'series' ? (
                    <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[10px] rounded-full shadow-lg">
                      NEW
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] rounded-full shadow-lg">
                      NEW
                    </span>
                  )}
                </div>
                <MovieCard
                  movie={item}
                  onSeriesClick={item.uploadType === 'series' ? handleUpdatedSeriesClick : undefined}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Category Sections */}
      {dynamicCategories.map((category) => {
        const categoryMovies = getMoviesByCategory(category.id);
        if (categoryMovies.length === 0) return null;
        const { icon, color, bgColor, borderColor } = getCategoryIconAndColor(category.id);

        return (
          <section key={category.id} className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center border ${borderColor}`}>
                  {icon}
                </div>
                <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                  {category.name}
                </h2>
                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full ml-2">
                  {categoryMovies.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                View All <FaChevronRight className="text-[8px]" />
              </button>
            </div>

            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
              {categoryMovies.slice(0, 12).map(movie => (
                <div
                  key={movie?.id}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md`} />
                    <MovieCard movie={movie} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
              {categoryMovies.slice(0, 8).map(movie => (
                <div
                  key={movie?.id}
                  className="flex-none w-[130px] sm:w-[150px] transform transition-transform duration-300 active:scale-95"
                  onClick={() => handleMovieClick(movie)}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Featured Movies Section */}
      {selectedCategory === "all" && featuredMovies.length > 0 && (
        <section className="container mx-auto px-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaFire className="text-purple-500 text-sm sm:text-base" />
              <span className="hidden xs:inline">Featured Movies</span>
              <span className="xs:hidden">Featured</span>
            </h2>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
            {featuredMovies.slice(0, 12).map(movie => (
              <div
                key={movie?.id}
                className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
                onClick={() => handleMovieClick(movie)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
            {featuredMovies.slice(0, 8).map(movie => (
              <div
                key={movie?.id}
                className="flex-none w-[130px] sm:w-[150px] transform transition-transform duration-300 active:scale-95"
                onClick={() => handleMovieClick(movie)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gray-900/80 rounded-xl border border-gray-800 p-3 sm:p-4">
          <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs sm:text-sm"
            >
              <FaFilter className={showFilters ? 'text-purple-400' : ''} />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="year">Year</option>
              <option value="title">Title</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
            >
              {sortOrder === "desc" ? <FaSortAmountDown className="text-xs sm:text-sm" /> : <FaSortAmountUp className="text-xs sm:text-sm" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-300 mb-1 sm:mb-2">Categories</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs ${selectedCategory === "all" ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedCategory("featured")}
                      className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs flex items-center gap-1 ${selectedCategory === "featured" ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    >
                      <FaFire className="text-[6px] sm:text-xs" /> Featured
                    </button>
                    {dynamicCategories.map(cat => {
                      const { icon: catIcon } = getCategoryIconAndColor(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full text-left px-2 py-1 rounded text-[8px] sm:text-xs flex items-center gap-1 ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                        >
                          {catIcon}
                          <span className="capitalize">{cat.name}</span>
                          <span className="ml-auto text-[10px] text-gray-500">{cat.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Movies Section */}
      <section className="container mx-auto px-4 pb-8 sm:pb-12">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <FaFilm className="text-white text-sm" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              All Movies
            </h2>
          </div>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 sm:px-3 py-1 rounded-full">
            {filteredMovies.length}
          </span>
        </div>

        <div className="flex gap-1.5 mb-4 sm:mb-5 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === "all"
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory("featured")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 whitespace-nowrap transition-all duration-300 ${selectedCategory === "featured"
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            <FaFire className="text-xs" /> Featured
          </button>
          {dynamicCategories.slice(0, 12).map(category => {
            const { icon: catIcon, color } = getCategoryIconAndColor(category.id);
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 whitespace-nowrap transition-all duration-300 ${selectedCategory === category.id
                  ? `bg-gradient-to-r ${color} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                {catIcon}
                <span className="capitalize">{category.name}</span>
              </button>
            );
          })}
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gray-900/30 rounded-xl">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎬</div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">No movies found</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              Try different category or filter
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {paginatedMovies.map(movie => (
                <div
                  key={movie?.id}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
                  onClick={() => handleMovieClick(movie)}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-gray-800 disabled:opacity-50 text-white flex items-center justify-center hover:bg-gray-700 transition-all duration-300"
                >
                  <FaChevronLeft className="text-xs sm:text-sm" />
                </button>
                <span className="text-xs sm:text-sm text-white bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-gray-800 disabled:opacity-50 text-white flex items-center justify-center hover:bg-gray-700 transition-all duration-300"
                >
                  <FaChevronRight className="text-xs sm:text-sm" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Quick View Modal */}
      {showQuickView && quickViewMovie && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="w-full md:max-w-2xl bg-gray-900 rounded-t-2xl md:rounded-2xl border border-gray-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-32 md:h-56">
              <img
                src={getOptimizedImageUrl(quickViewMovie?.background || quickViewMovie?.poster, true)}
                alt={quickViewMovie?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              <button
                onClick={() => setShowQuickView(false)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300"
              >
                <FaTimes className="text-white text-xs sm:text-sm" />
              </button>

              {quickViewMovie.latestEpisode && (
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                    Latest
                  </span>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    S{quickViewMovie.latestEpisode.seasonNumber}:E{quickViewMovie.latestEpisode.episodeNumber}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-5">
              <h2 className="text-base sm:text-xl font-bold text-white mb-1">{quickViewMovie?.title}</h2>

              {quickViewMovie?.translator && (
                <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-lg mb-2 inline-block">
                  <FaLanguage className="text-xs" />
                  <span>Translator: {quickViewMovie.translator}</span>
                </div>
              )}

              {quickViewMovie.latestEpisode && (
                <h3 className="text-sm text-purple-400 mb-1 line-clamp-1">
                  {quickViewMovie.latestEpisode.title}
                </h3>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-400 mb-3">
                {quickViewMovie?.rating && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500 text-xs" /> {quickViewMovie.rating}
                  </span>
                )}
                {quickViewMovie?.year && <span>{quickViewMovie.year}</span>}
                {quickViewMovie.lastUpdated && (
                  <span className="text-green-400">
                    {formatDate(quickViewMovie.lastUpdated)}
                  </span>
                )}
                {quickViewMovie.episodeCount && (
                  <span className="text-purple-400">
                    {quickViewMovie.episodeCount} eps
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mb-3 line-clamp-2 sm:line-clamp-3">
                {quickViewMovie.latestEpisode?.description || quickViewMovie?.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (quickViewMovie.latestEpisode) {
                      handleSeriesClickWithEpisode(quickViewMovie, quickViewMovie.latestEpisode);
                    } else if (quickViewMovie.type === "series") {
                      handleUpdatedSeriesClick(quickViewMovie);
                    } else {
                      handleMovieClick(quickViewMovie);
                    }
                    setShowQuickView(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-1 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  <FaPlay className="text-xs" /> {quickViewMovie.latestEpisode ? 'Watch Latest' : 'Watch'}
                </button>
                <button
                  onClick={() => setShowQuickView(false)}
                  className="flex-1 bg-gray-800 py-2 rounded-lg text-white text-sm font-semibold hover:bg-gray-700 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}