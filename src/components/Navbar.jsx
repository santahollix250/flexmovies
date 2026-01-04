import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Update search from URL when on movies page
  useEffect(() => {
    if (location.pathname === '/movies') {
      const params = new URLSearchParams(location.search);
      const urlSearch = params.get('search') || '';
      if (urlSearch !== search) {
        setSearch(urlSearch);
      }
    }
  }, [location, search]);

  // Handle navigation
  const handleNavigation = (path, closeMenu = false) => (e) => {
    e.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    }
    if (closeMenu) setIsOpen(false);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // Navigate to movies page with search query
      navigate(`/movies?search=${encodeURIComponent(search.trim())}`);
      setIsOpen(false);
    }
  };

  // Handle search key press
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearch('');
    if (location.pathname === '/movies') {
      navigate('/movies'); // Clear search from URL
    }
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

          {/* Desktop Navigation - Simple */}
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

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center relative group"
            >
              <FiSearch className="absolute left-3 text-gray-400 text-sm group-hover:text-purple-400 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search movies & series..."
                className="pl-10 pr-10 py-2.5 w-48 lg:w-56 text-sm rounded-xl bg-white/5 border border-purple-600/30 text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-10 text-gray-400 hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 text-gray-400 hover:text-purple-400 text-sm p-1"
                title="Search"
              >
                🔍
              </button>
            </form>

            {/* Admin Button Only */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href="/admin"
                onClick={handleNavigation('/admin')}
                className={`px-4 py-2.5 text-sm font-medium border rounded-xl transition-all duration-300 ${location.pathname === '/admin'
                    ? 'text-purple-300 border-purple-500 bg-purple-600/20 shadow-lg shadow-purple-600/20'
                    : 'text-purple-400 hover:text-purple-300 border-purple-600/50 hover:border-purple-400 hover:bg-purple-600/10 hover:shadow-lg hover:shadow-purple-600/20'
                  }`}
              >
                <span className="mr-1">👤</span> Admin
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {isOpen ? (
                <span className="text-xl">✕</span>
              ) : (
                <span className="text-2xl">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Simple */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-b from-black/98 via-black/95 to-black/90 backdrop-blur-xl border-t border-purple-600/30 shadow-2xl animate-slideDown">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search movies & series..."
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-purple-600/30 text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 text-sm p-1"
                title="Search"
              >
                🔍
              </button>
            </form>

            {/* Mobile Links - Simple */}
            <a
              href="/"
              onClick={handleNavigation('/', true)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${location.pathname === '/'
                  ? 'text-white bg-gradient-to-r from-purple-600/30 to-transparent'
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r from-purple-600/20 to-transparent'
                }`}
            >
              <span className="text-lg group-hover:text-purple-300">🏠</span>
              <span className="font-medium">Home</span>
            </a>
            <a
              href="/movies"
              onClick={handleNavigation('/movies', true)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${location.pathname === '/movies'
                  ? 'text-white bg-gradient-to-r from-blue-600/30 to-transparent'
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r from-blue-600/20 to-transparent'
                }`}
            >
              <span className="text-lg group-hover:text-blue-300">🎬</span>
              <span className="font-medium">Movies</span>
            </a>
            <a
              href="/series"
              onClick={handleNavigation('/series', true)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${location.pathname === '/series'
                  ? 'text-white bg-gradient-to-r from-pink-600/30 to-transparent'
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r from-pink-600/20 to-transparent'
                }`}
            >
              <span className="text-lg group-hover:text-pink-300">📺</span>
              <span className="font-medium">Series</span>
            </a>

            {/* Admin Button */}
            <div className="pt-4">
              <a
                href="/admin"
                onClick={handleNavigation('/admin', true)}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border rounded-xl transition-all duration-300 ${location.pathname === '/admin'
                    ? 'text-purple-300 border-purple-500 bg-purple-600/20'
                    : 'text-purple-400 border-purple-600/50 hover:bg-purple-600/10'
                  }`}
              >
                <span>👤</span> Admin Panel
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}