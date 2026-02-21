import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiX, FiFilm, FiTv } from 'react-icons/fi';
import { MoviesContext } from '../context/MoviesContext';
import logo from '../assets/logo.png';

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
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/95 via-black/90 to-black/85 backdrop-blur-xl border-b border-purple-600/30 shadow-2xl">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              onClick={handleNavigation('/')}
              className="flex items-center gap-3 group"
            >
              {/* Logo Image */}
              <div className="h-10 w-10 rounded-xl overflow-hidden ring-2 ring-purple-600/30 group-hover:ring-purple-500 transition-all duration-300 group-hover:scale-105">
                <img
                  src={logo}
                  alt="Agasobanuye Flex Zone Logo"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="h-full w-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
                        <span class="text-white font-bold text-lg">A</span>
                      </div>
                    `;
                  }}
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    agasobanuye
                  </span>
                  <span className="text-white">flex</span>
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    zone
                  </span>
                </h1>
                <span className="text-[10px] text-gray-400 -mt-1">Premium Streaming</span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="/"
              onClick={handleNavigation('/')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/'
                  ? 'text-white bg-gradient-to-r from-purple-600/30 to-pink-600/20'
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r from-purple-600/20 to-pink-600/10'
                }`}
            >
              <span className="group-hover:text-purple-300">🏠</span> Home
            </a>
            <a
              href="/movies"
              onClick={handleNavigation('/movies')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/movies'
                  ? 'text-white bg-gradient-to-r from-blue-600/30 to-cyan-600/20'
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r from-blue-600/20 to-cyan-600/10'
                }`}
            >
              <span className="group-hover:text-blue-300">🎬</span> Movies
            </a>
            <a
              href="/series"
              onClick={handleNavigation('/series')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 group ${location.pathname === '/series'
                  ? 'text-white bg-gradient-to-r from-pink-600/30 to-red-600/20'
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r from-pink-600/20 to-red-600/10'
                }`}
            >
              <span className="group-hover:text-pink-300">📺</span> Series
            </a>
          </div>

          {/* Right Side - Search & Admin */}
          <div className="flex items-center gap-3">
            {/* Desktop Search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <form onSubmit={handleFormSubmit} className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                  className="pl-9 pr-8 py-2 w-48 lg:w-64 text-sm rounded-lg bg-white/5 border border-purple-600/30 text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </form>
              {showResults && renderSuggestions()}
            </div>

            {/* Admin Button */}
            <a
              href="/admin"
              onClick={handleNavigation('/admin')}
              className="hidden md:block px-4 py-2 text-sm font-medium border border-purple-600/50 rounded-lg text-purple-400 hover:bg-purple-600/10"
            >
              Admin
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {isOpen ? <FiX size={24} /> : <span className="text-2xl">☰</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 border-t border-purple-600/30">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleFormSubmit}>
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/5 border border-purple-600/30 text-white"
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
                <div className="absolute top-full left-0 right-0 mt-2">
                  {renderSuggestions()}
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <a
              href="/"
              onClick={handleNavigation('/', true)}
              className={`block px-4 py-2 rounded-lg ${location.pathname === '/' ? 'text-white bg-purple-600/20' : 'text-gray-300'
                }`}
            >
              Home
            </a>
            <a
              href="/movies"
              onClick={handleNavigation('/movies', true)}
              className={`block px-4 py-2 rounded-lg ${location.pathname === '/movies' ? 'text-white bg-blue-600/20' : 'text-gray-300'
                }`}
            >
              Movies
            </a>
            <a
              href="/series"
              onClick={handleNavigation('/series', true)}
              className={`block px-4 py-2 rounded-lg ${location.pathname === '/series' ? 'text-white bg-pink-600/20' : 'text-gray-300'
                }`}
            >
              Series
            </a>
            <a
              href="/admin"
              onClick={handleNavigation('/admin', true)}
              className="block px-4 py-2 text-purple-400"
            >
              Admin
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}