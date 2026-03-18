import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiSearch, FiX, FiFilm, FiTv } from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';
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

  // Get context values - using global search state
  const {
    globalSearchQuery,
    globalSearchResults,
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

    const totalItems = suggestions.length + (recentSearches.length > 0 && !search.trim() ? recentSearches.length : 0);

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
          } else if (recentSearches.length > 0 && !search.trim()) {
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

  // Handle navigation
  const handleNavigation = (path, closeMenu = false) => (e) => {
    e.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    }
    if (closeMenu) setIsOpen(false);
    setShowResults(false);
  };

  // Handle search submission - UPDATED to use global search
  const handleSearchSubmit = () => {
    if (search.trim()) {
      // Update global search state
      updateGlobalSearch(search.trim());

      // Save to recent searches
      saveRecentSearch({
        query: search.trim(),
        timestamp: new Date().toISOString()
      });

      // Navigate to search results page
      if (location.pathname !== '/search') {
        navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      }

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
    // Update global search
    updateGlobalSearch(suggestion.title);

    setShowResults(false);
    setSelectedIndex(-1);

    switch (suggestion.type) {
      case 'movie':
        navigate(`/movie/${suggestion.id}`);
        break;
      case 'episode':
        navigate(`/series/${suggestion.seriesId}?season=${suggestion.seasonNumber}&episode=${suggestion.episodeNumber}`);
        break;
      case 'category':
        navigate(`/movies?category=${encodeURIComponent(suggestion.title)}`);
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  // Handle recent search click
  const handleRecentSearchClick = (recent) => {
    setSearch(recent.query || '');
    if (recent.query) {
      // Update global search
      updateGlobalSearch(recent.query);
      navigate(`/search?q=${encodeURIComponent(recent.query)}`);
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
    clearGlobalSearch();
    inputRef.current?.focus();

    // If on search page, go back to movies
    if (location.pathname === '/search') {
      navigate('/movies');
    }
  };

  // Render search suggestions dropdown
  const renderSuggestions = () => {
    const hasSuggestions = suggestions.length > 0;
    const hasRecent = recentSearches.length > 0 && !search.trim();

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-purple-600/30 rounded-xl shadow-2xl overflow-hidden z-50">
        {/* Recent Searches */}
        {hasRecent && (
          <>
            <div className="p-2 text-xs text-gray-400 border-b border-purple-600/30 flex items-center gap-2">
              <span>🕒 Recent Searches</span>
            </div>
            {recentSearches.slice(0, 5).map((recent, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearchClick(recent)}
                className={`w-full px-4 py-2 text-left hover:bg-purple-600/20 transition-colors flex items-center gap-3 ${selectedIndex === index ? 'bg-purple-600/30' : ''
                  }`}
              >
                <span className="text-gray-400">🕒</span>
                <span className="text-white flex-1">{recent.query || 'All Content'}</span>
                {recent.type && (
                  <span className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full">
                    {recent.type}
                  </span>
                )}
              </button>
            ))}
          </>
        )}

        {/* Suggestions */}
        {hasSuggestions && (
          <>
            <div className="p-2 text-xs text-gray-400 border-b border-purple-600/30">
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
                  {/* Icon based on type */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
                    {item.type === 'movie' && <FiFilm className="text-purple-400" />}
                    {item.type === 'episode' && <FiTv className="text-pink-400" />}
                    {item.type === 'category' && <span className="text-blue-400">#</span>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-white">
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

          {/* Logo - Reduced Size */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 group"
          >
            {/* Logo Image - Smaller */}
            <div className="relative">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden ring-2 ring-purple-600/30 group-hover:ring-purple-500 transition-all duration-300 group-hover:scale-105">
                <img
                  src={logo}
                  alt="agasobanuyecineva Logo"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="h-full w-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span class="text-white font-bold text-xl">A</span>
                      </div>
                    `;
                  }}
                />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
            </div>

            {/* Brand Name - Smaller */}
            <div className="flex flex-col">
              <h1 className="text-sm md:text-lg lg:text-xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  agasobanuyecineva
                </span>
              </h1>
              <span className="text-[8px] md:text-[10px] text-gray-500 -mt-0.5">Premium Streaming</span>
            </div>
          </Link>

          {/* Desktop Navigation - Smaller */}
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
              to="/movies"
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${location.pathname === '/movies'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-300 hover:bg-blue-600/20 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-1">
                <span>🎬</span> Movies
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
          </div>

          {/* Right Side - Search & Admin - Smaller */}
          <div className="flex items-center gap-2">
            {/* Desktop Search - Smaller */}
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
                    if (suggestions.length > 0 || recentSearches.length > 0 || search.trim()) {
                      setShowResults(true);
                    }
                  }}
                  placeholder="Search..."
                  className="pl-7 pr-7 py-1.5 w-48 lg:w-56 text-xs rounded-lg bg-gray-800 border border-purple-600/30 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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

            {/* Admin Button - Smaller */}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="hidden md:flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white shadow-lg shadow-purple-600/30 transition-all duration-300 hover:scale-105"
            >
              <FaShieldAlt className="text-xs" />
              Admin
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

      {/* Mobile Menu - Compact */}
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
                    if (suggestions.length > 0 || recentSearches.length > 0 || search.trim()) {
                      setShowResults(true);
                    }
                  }}
                  placeholder="Search..."
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

            {/* Mobile Navigation Links - Compact */}
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
              to="/movies"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === '/movies'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                <span>🎬</span> Movies
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
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium"
            >
              <span className="flex items-center gap-2">
                <FaShieldAlt className="text-sm" /> Admin
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}