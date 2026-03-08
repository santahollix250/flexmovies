import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaHome,
  FaFilm,
  FaTv,
  FaUser,
  FaBars,
  FaTimes,
  FaCog
} from "react-icons/fa";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-black/90 backdrop-blur-lg border-b border-gray-800"
        : "bg-gradient-to-b from-black/90 to-transparent"
        }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-white font-bold text-xl md:text-2xl bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                MovieStream
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search movies..."
                  className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-900/70 border border-gray-800 text-white placeholder:text-gray-400 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaHome />
                  Home
                </Link>
                <Link
                  to="/movies"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaFilm />
                  Movies
                </Link>
                <Link
                  to="/series"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaTv />
                  Series
                </Link>
                <Link
                  to="/admin"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaCog />
                  Admin
                </Link>
              </div>

              {/* User Profile */}
              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <FaUser className="text-gray-300" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-white text-xl" />
              ) : (
                <FaBars className="text-white text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-gray-800">
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search movies..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900/70 border border-gray-800 text-white placeholder:text-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <FaHome />
                  Home
                </Link>
                <Link
                  to="/movies"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <FaFilm />
                  Movies
                </Link>
                <Link
                  to="/series"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <FaTv />
                  Series
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <FaCog />
                  Admin
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}