import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiSearch, FiX, FiFilm, FiTv } from 'react-icons/fi';
import { FaShieldAlt, FaLanguage, FaGlobe, FaGem } from 'react-icons/fa';
import { MoviesContext } from '../context/MoviesContext';
import logo from '../assets/Newlogo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchTimeout = useRef(null);

  // Get context values
  const {
    globalSearchQuery,
    globalSearchFilters,
    updateGlobalSearch,
    clearGlobalSearch,
    getSuggestions,
    recentSearches,
    saveRecentSearch
  } = useContext(MoviesContext);

  // Sync local search with global search query
  useEffect(() => {
    setSearch(globalSearchQuery);
  }, [globalSearchQuery]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get suggestions as user types
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (search.trim().length >= 2) {
      searchTimeout.current = setTimeout(() => {
        const results = getSuggestions(search, 8);
        setSuggestions(results);
        setShowResults(true);
      }, 300);
    } else {
      setSuggestions([]);
      if (!search.trim()) {
        setShowResults(false);
      }
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search, getSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults) return;

    const totalItems = suggestions.length + (recentSearches?.length > 0 && !search.trim() ? recentSearches.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (suggestions.length > 0 && selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else if (recentSearches?.length > 0 && !search.trim()) {
            const recentIndex = selectedIndex - suggestions.length;
            if (recentIndex >= 0 && recentIndex < recentSearches.length) {
              handleRecentSearchClick(recentSearches[recentIndex]);
            }
          }
        } else if (search.trim()) {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (search.trim()) {
      // Prepare search data
      const searchData = {
        query: search.trim(),
        genre: globalSearchFilters?.genre || '',
        year: globalSearchFilters?.year || '',
        rating: globalSearchFilters?.rating || '',
        country: globalSearchFilters?.country || '',
        language: globalSearchFilters?.language || '',
        sortBy: globalSearchFilters?.sortBy || 'popular',
        type: globalSearchFilters?.type || 'all'
      };

      // Update global search state
      updateGlobalSearch(search.trim(), {
        genre: searchData.genre,
        year: searchData.year,
        rating: searchData.rating,
        country: searchData.country,
        language: searchData.language,
        sortBy: searchData.sortBy,
        type: searchData.type
      });

      // Save to recent searches
      if (saveRecentSearch) {
        saveRecentSearch({
          query: search.trim(),
          timestamp: new Date().toISOString()
        });
      }

      // Build URL with search parameters
      const params = new URLSearchParams();
      params.set('search', search.trim());
      if (searchData.genre) params.set('genre', searchData.genre);
      if (searchData.year) params.set('year', searchData.year);
      if (searchData.rating) params.set('rating', searchData.rating);
      if (searchData.country) params.set('country', searchData.country);
      if (searchData.language) params.set('language', searchData.language);
      if (searchData.sortBy && searchData.sortBy !== 'popular') params.set('sort', searchData.sortBy);
      if (searchData.type && searchData.type !== 'all') params.set('type', searchData.type);

      // Navigate to search page
      navigate(`/search?${params.toString()}`);

      setIsOpen(false);
      setShowResults(false);
    }
  };

  // Handle form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearchSubmit();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setShowResults(false);
    setSelectedIndex(-1);
    setIsOpen(false);

    switch (suggestion.type) {
      case 'movie':
        navigate(`/player/${suggestion.id}`);
        break;
      case 'episode':
        navigate(`/series-player/${suggestion.seriesId}`, {
          state: {
            seriesId: suggestion.seriesId,
            seasonNumber: suggestion.seasonNumber,
            episodeNumber: suggestion.episodeNumber
          }
        });
        break;
      case 'category':
        const params = new URLSearchParams();
        params.set('genre', suggestion.title);
        navigate(`/category?${params.toString()}`);
        updateGlobalSearch('', {
          genre: suggestion.title,
          type: 'all'
        });
        break;
      default:
        break;
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (recent) => {
    setSearch(recent.query || '');
    if (recent.query) {
      const params = new URLSearchParams();
      params.set('search', recent.query);
      if (recent.genre) params.set('genre', recent.genre);
      if (recent.year) params.set('year', recent.year);
      if (recent.rating) params.set('rating', recent.rating);
      if (recent.country) params.set('country', recent.country);
      if (recent.language) params.set('language', recent.language);
      if (recent.sortBy && recent.sortBy !== 'popular') params.set('sort', recent.sortBy);
      if (recent.type && recent.type !== 'all') params.set('type', recent.type);

      updateGlobalSearch(recent.query, {
        genre: recent.genre || '',
        year: recent.year || '',
        rating: recent.rating || '',
        country: recent.country || '',
        language: recent.language || '',
        sortBy: recent.sortBy || 'popular',
        type: recent.type || 'all'
      });

      navigate(`/search?${params.toString()}`);
    }
    setShowResults(false);
    setSelectedIndex(-1);
    setIsOpen(false);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearch('');
    setSuggestions([]);
    setShowResults(false);
    setSelectedIndex(-1);

    if (location.pathname === '/search') {
      clearGlobalSearch();
      navigate('/category');
    }

    inputRef.current?.focus();
  };

  // Render search suggestions dropdown
  const renderSuggestions = () => {
    const hasSuggestions = suggestions.length > 0;
    const hasRecent = recentSearches && recentSearches.length > 0 && !search.trim();

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-purple-600/30 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
        {/* Recent Searches */}
        {hasRecent && (
          <>
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-purple-600/30 flex items-center gap-2 sticky top-0 bg-gray-900">
              <span>🕒 Recent Searches</span>
            </div>
            {recentSearches.slice(0, 5).map((recent, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearchClick(recent)}
                className={`w-full px-4 py-2 text-left hover:bg-purple-600/20 transition-colors flex items-center gap-3 ${selectedIndex === index ? 'bg-purple-600/30' : ''
                  }`}
              >
                <span className="text-gray-400 text-sm">🕒</span>
                <span className="text-white flex-1 text-sm truncate">{recent.query || 'All Content'}</span>
                {recent.genre && (
                  <span className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full">
                    {recent.genre}
                  </span>
                )}
              </button>
            ))}
          </>
        )}

        {/* Suggestions */}
        {hasSuggestions && (
          <>
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-purple-600/30 sticky top-0 bg-gray-900">
              Suggestions
            </div>
            {suggestions.map((item, index) => {
              const displayIndex = hasRecent ? recentSearches.length + index : index;
              return (
                <button
                  key={`${item.type}-${item.id || item.title}`}
                  onClick={() => handleSuggestionClick(item)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-purple-600/20 transition-colors border-b border-purple-600/10 last:border-0 ${selectedIndex === displayIndex ? 'bg-purple-600/30' : ''
                    }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center flex-shrink-0">
                    {item.type === 'movie' && <FiFilm className="text-purple-400 text-sm" />}
                    {item.type === 'episode' && <FiTv className="text-pink-400 text-sm" />}
                    {item.type === 'category' && <span className="text-blue-400 text-sm">#</span>}
                  </div>

                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-white text-sm">
                      {item.title}
                      {item.type === 'episode' && (
                        <span className="ml-2 text-xs text-gray-400">
                          S{item.seasonNumber}:E{item.episodeNumber}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {item.type === 'movie' && `Movie • ${item.year || ''}`}
                      {item.type === 'episode' && `${item.seriesTitle}`}
                      {item.type === 'category' && 'Category'}
                    </p>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* Search action */}
        {search.trim() && (
          <button
            onClick={handleSearchSubmit}
            className="w-full p-3 text-center text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 border-t border-purple-600/30 transition-colors"
          >
            Search for "{search}"
          </button>
        )}

        {/* Empty state */}
        {!hasSuggestions && !hasRecent && !search.trim() && (
          <div className="p-4 text-center text-gray-400 text-sm">
            Type to search movies & series...
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-black/95 backdrop-blur-sm border-b border-purple-600/30 shadow-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo with Infinity Animation */}
          <Link
            to="/"
            onClick={() => {
              setIsOpen(false);
              if (location.pathname === '/search') {
                clearGlobalSearch();
              }
            }}
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              {/* Infinity Animation Container */}
              <div className="relative">
                {/* Pulsing rings animation */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 animate-ping opacity-75" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse opacity-50"></div>
                
                {/* Rotating border animation */}
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-spin-slow opacity-75"></div>
                
                {/* Logo container */}
                <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden ring-2 ring-purple-600/30 group-hover:ring-purple-500 transition-all duration-300 group-hover:scale-105 bg-black">
                  <img
                    src={logo}
                    alt="agasobanuyecineva Logo"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="h-full w-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <span class="text-white font-bold text-xl animate-pulse">A</span>
                        </div>
                      `;
                    }}
                  />
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
            </div>

            <div className="flex flex-col">
              <h1 className="text-sm md:text-lg lg:text-xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  agasobanuyecineva
                </span>
              </h1>
              <span className="text-[8px] md:text-[10px] text-gray-500 -mt-0.5 animate-pulse-slow">Premium Streaming</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${location.pathname === '/'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-300 hover:bg-purple-600/20 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-1">
                <span>🏠</span> Home
              </span>
            </Link>
            <Link
              to="/category"
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${location.pathname === '/category'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-300 hover:bg-blue-600/20 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-1">
                <span>🎬</span> Category
              </span>
            </Link>
            <Link
              to="/series"
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${location.pathname === '/series'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-gray-300 hover:bg-pink-600/20 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-1">
                <span>📺</span> Series
              </span>
            </Link>
            <Link
              to="/translator"
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${location.pathname === '/translator'
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                : 'text-gray-300 hover:bg-green-600/20 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-1">
                <FaLanguage className="text-xs" /> Translator
              </span>
            </Link>
            <Link
              to="/nation"
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${location.pathname === '/nation'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-gray-300 hover:bg-cyan-600/20 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-1">
                <FaGlobe className="text-xs" /> Nation
              </span>
            </Link>
          </div>

          {/* Right Side - Search & VIP Access */}
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <form onSubmit={handleFormSubmit} className="relative">
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0 || (recentSearches && recentSearches.length > 0) || search.trim()) {
                      setShowResults(true);
                    }
                  }}
                  placeholder="Search movies, series..."
                  className="pl-7 pr-7 py-1.5 w-56 lg:w-64 text-xs rounded-lg bg-gray-800 border border-purple-600/30 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </form>
              {showResults && renderSuggestions()}
            </div>

            {/* VIP Access Button - Updated from Admin */}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 rounded-lg text-white shadow-lg shadow-yellow-600/30 transition-all duration-300 hover:scale-105 animate-pulse-slow"
            >
              <FaGem className="text-xs" />
              VIP Access
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={20} /> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-purple-600/30">
          <div className="px-4 py-3 space-y-2">
            {/* Mobile Search */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleFormSubmit}>
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0 || (recentSearches && recentSearches.length > 0) || search.trim()) {
                      setShowResults(true);
                    }
                  }}
                  placeholder="Search movies, series..."
                  className="w-full pl-7 pr-7 py-2 text-sm rounded-lg bg-gray-800 border border-purple-600/30 text-white placeholder-gray-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </form>
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50">
                  {renderSuggestions()}
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === '/'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                <span>🏠</span> Home
              </span>
            </Link>
            <Link
              to="/category"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === '/category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                <span>🎬</span> Category
              </span>
            </Link>
            <Link
              to="/series"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === '/series'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                <span>📺</span> Series
              </span>
            </Link>
            <Link
              to="/translator"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === '/translator'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                <FaLanguage className="text-sm" /> Translator
              </span>
            </Link>
            <Link
              to="/nation"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === '/nation'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                <FaGlobe className="text-sm" /> Nation
              </span>
            </Link>
            
            {/* VIP Access Button - Mobile */}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-lg text-white font-medium flex items-center gap-2"
            >
              <FaGem className="text-sm" /> VIP Access
            </Link>
          </div>
        </div>
      )}

      {/* Add custom animations to your global CSS or as a style tag */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
}