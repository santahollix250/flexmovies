// src/components/AdvancedSearch.jsx
import { useState, useEffect, useRef } from 'react';
import {
    FaSearch,
    FaFilter,
    FaStar,
    FaCalendar,
    FaGlobe,
    FaSort,
    FaTimes,
    FaHistory,
    FaFire,
    FaClock,
    FaChartLine,
    FaFilm,
    FaTv,
    FaUser,
    FaVideo,
    FaLanguage,
    FaTheaterMasks
} from 'react-icons/fa';

export default function AdvancedSearch({ onSearch, initialFilters = {}, recentSearches = [] }) {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        rating: '',
        country: '',
        language: '',
        sortBy: 'popular',
        type: 'all', // all, movie, series
        ...initialFilters
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showRecent, setShowRecent] = useState(false);
    const [filteredGenres, setFilteredGenres] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Complete datasets
    const genres = [
        'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
        'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History',
        'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi',
        'Sport', 'Thriller', 'War', 'Western'
    ];

    const languages = [
        'English', 'Hindi', 'Spanish', 'French', 'German', 'Italian',
        'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic',
        'Turkish', 'Dutch', 'Swedish', 'Danish', 'Norwegian', 'Finnish'
    ];

    const countries = [
        'USA', 'UK', 'India', 'Japan', 'South Korea', 'France', 'Germany',
        'Italy', 'Spain', 'Canada', 'Australia', 'Brazil', 'Mexico',
        'Russia', 'China', 'Turkey', 'Sweden', 'Denmark', 'Norway', 'Finland'
    ];

    const years = Array.from({ length: 50 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year, label: year.toString() };
    });

    const ratings = [
        { value: '9', label: '9+ ★★★★★' },
        { value: '8', label: '8+ ★★★★☆' },
        { value: '7', label: '7+ ★★★☆☆' },
        { value: '6', label: '6+ ★★☆☆☆' },
        { value: '5', label: '5+ ★☆☆☆☆' }
    ];

    const sortOptions = [
        { value: 'popular', label: 'Most Popular', icon: FaFire },
        { value: 'newest', label: 'Newest First', icon: FaClock },
        { value: 'rating', label: 'Highest Rated', icon: FaStar },
        { value: 'trending', label: 'Trending', icon: FaChartLine },
        { value: 'az', label: 'A → Z', icon: FaSort },
        { value: 'za', label: 'Z → A', icon: FaSort }
    ];

    const contentTypes = [
        { value: 'all', label: 'All Content', icon: FaFilm },
        { value: 'movie', label: 'Movies Only', icon: FaVideo },
        { value: 'series', label: 'Series Only', icon: FaTv }
    ];

    // Handle click outside to close recent searches
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowRecent(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter genres based on query
    useEffect(() => {
        if (query.length > 1) {
            const filtered = genres.filter(genre =>
                genre.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredGenres(filtered.slice(0, 5));
        } else {
            setFilteredGenres([]);
        }
    }, [query]);

    const handleSearch = () => {
        // Don't search if query is empty and no filters are applied
        if (!query.trim() && !Object.values(filters).some(value => value)) {
            return;
        }

        onSearch({
            query: query.trim(),
            ...filters,
            timestamp: new Date().toISOString()
        });

        setShowRecent(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearFilters = () => {
        setFilters({
            genre: '',
            year: '',
            rating: '',
            country: '',
            language: '',
            sortBy: 'popular',
            type: 'all'
        });
    };

    const applyQuickFilter = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const applyRecentSearch = (search) => {
        setQuery(search.query || '');
        setFilters({
            genre: search.genre || '',
            year: search.year || '',
            rating: search.rating || '',
            country: search.country || '',
            language: search.language || '',
            sortBy: search.sortBy || 'popular',
            type: search.type || 'all'
        });
        setShowRecent(false);
        handleSearch();
    };

    const getActiveFilterCount = () => {
        return Object.entries(filters).filter(([key, value]) =>
            value && key !== 'sortBy' && value !== 'all'
        ).length;
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-900/95 to-black backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-8 shadow-2xl">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4" ref={searchRef}>
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => recentSearches.length > 0 && setShowRecent(true)}
                        placeholder="Search movies by title, actor, director, genre..."
                        className="w-full pl-12 pr-12 py-4 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                    )}

                    {/* Recent Searches Dropdown */}
                    {showRecent && recentSearches.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <div className="p-2 bg-gray-900/50 border-b border-gray-700">
                                <span className="text-xs text-gray-400 flex items-center gap-2">
                                    <FaHistory /> Recent Searches
                                </span>
                            </div>
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => applyRecentSearch(search)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 border-b border-gray-700/50 last:border-0"
                                >
                                    <FaHistory className="text-gray-500 text-sm" />
                                    <div className="flex-1">
                                        <span className="text-white">{search.query || 'All Content'}</span>
                                        {search.genre && (
                                            <span className="ml-2 text-xs px-2 py-0.5 bg-red-600/20 text-red-400 rounded-full">
                                                {search.genre}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(search.timestamp).toLocaleDateString()}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-6 py-4 rounded-xl text-white font-medium flex items-center gap-2 transition-all duration-300 ${showFilters
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                    >
                        <FaFilter />
                        Filters
                        {getActiveFilterCount() > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-red-500 text-xs rounded-full">
                                {getActiveFilterCount()}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleSearch}
                        className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-bold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                    >
                        <FaSearch /> Search
                    </button>
                </div>
            </div>

            {/* Genre Suggestions */}
            {filteredGenres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {filteredGenres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => {
                                setQuery('');
                                setFilters({ ...filters, genre });
                                handleSearch();
                            }}
                            className="px-3 py-1 bg-gray-800 hover:bg-red-600/20 text-gray-300 hover:text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                            <FaTheaterMasks className="text-xs" />
                            {genre}
                        </button>
                    ))}
                </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-800 animate-fadeIn">
                    {/* Content Type Tabs */}
                    <div className="flex gap-2 mb-6">
                        {contentTypes.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setFilters({ ...filters, type: type.value })}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${filters.type === type.value
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <type.icon /> {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* Genre Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300 flex items-center gap-2">
                                <FaTheaterMasks className="text-red-400" /> Genre
                            </label>
                            <select
                                value={filters.genre}
                                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300 flex items-center gap-2">
                                <FaCalendar className="text-red-400" /> Year
                            </label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                            >
                                <option value="">All Years</option>
                                {years.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300 flex items-center gap-2">
                                <FaStar className="text-yellow-400" /> Rating
                            </label>
                            <select
                                value={filters.rating}
                                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                            >
                                <option value="">Any Rating</option>
                                {ratings.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Language Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300 flex items-center gap-2">
                                <FaLanguage className="text-red-400" /> Language
                            </label>
                            <select
                                value={filters.language}
                                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                            >
                                <option value="">All Languages</option>
                                {languages.map(language => (
                                    <option key={language} value={language}>{language}</option>
                                ))}
                            </select>
                        </div>

                        {/* Country Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300 flex items-center gap-2">
                                <FaGlobe className="text-red-400" /> Country
                            </label>
                            <select
                                value={filters.country}
                                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                            >
                                <option value="">All Countries</option>
                                {countries.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm text-gray-300 flex items-center gap-2">
                                <FaSort className="text-red-400" /> Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                            >
                                {sortOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick Filter Chips */}
                    <div className="mt-6">
                        <h4 className="text-sm text-gray-400 mb-3">Quick Filters</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    applyQuickFilter('genre', 'Action');
                                    applyQuickFilter('year', new Date().getFullYear().toString());
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-600/5 hover:from-red-600/30 hover:to-red-600/10 text-red-400 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-red-600/30"
                            >
                                <FaFire className="text-xs" /> New Action Movies
                            </button>
                            <button
                                onClick={() => {
                                    applyQuickFilter('rating', '8');
                                    applyQuickFilter('sortBy', 'rating');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-yellow-600/5 hover:from-yellow-600/30 hover:to-yellow-600/10 text-yellow-400 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-yellow-600/30"
                            >
                                <FaStar className="text-xs" /> Top Rated
                            </button>
                            <button
                                onClick={() => {
                                    applyQuickFilter('year', '2024');
                                    applyQuickFilter('sortBy', 'newest');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-blue-600/5 hover:from-blue-600/30 hover:to-blue-600/10 text-blue-400 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-blue-600/30"
                            >
                                <FaCalendar className="text-xs" /> 2024 Releases
                            </button>
                            <button
                                onClick={() => {
                                    applyQuickFilter('type', 'series');
                                    applyQuickFilter('sortBy', 'popular');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-purple-600/5 hover:from-purple-600/30 hover:to-purple-600/10 text-purple-400 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-purple-600/30"
                            >
                                <FaTv className="text-xs" /> Popular Series
                            </button>
                            <button
                                onClick={() => {
                                    applyQuickFilter('language', 'English');
                                    applyQuickFilter('country', 'USA');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-green-600/20 to-green-600/5 hover:from-green-600/30 hover:to-green-600/10 text-green-400 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-green-600/30"
                            >
                                <FaGlobe className="text-xs" /> Hollywood
                            </button>
                            <button
                                onClick={() => {
                                    applyQuickFilter('language', 'Hindi');
                                    applyQuickFilter('country', 'India');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-orange-600/20 to-orange-600/5 hover:from-orange-600/30 hover:to-orange-600/10 text-orange-400 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-orange-600/30"
                            >
                                <FaGlobe className="text-xs" /> Bollywood
                            </button>
                            <button
                                onClick={() => {
                                    applyQuickFilter('genre', 'Horror');
                                    applyQuickFilter('rating', '6');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-gray-600/20 to-gray-600/5 hover:from-gray-600/30 hover:to-gray-600/10 text-gray-300 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-gray-600/30"
                            >
                                <FaTheaterMasks className="text-xs" /> Horror Movies
                            </button>
                            <button
                                onClick={() => {
                                    applyQuickFilter('type', 'movie');
                                    applyQuickFilter('sortBy', 'trending');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-pink-600/20 to-pink-600/5 hover:from-pink-600/30 hover:to-pink-600/10 text-pink-400 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-pink-600/30"
                            >
                                <FaChartLine className="text-xs" /> Trending Movies
                            </button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {getActiveFilterCount() > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(filters).map(([key, value]) => {
                                        if (value && key !== 'sortBy' && key !== 'type') {
                                            return (
                                                <span
                                                    key={key}
                                                    className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg text-sm flex items-center gap-2"
                                                >
                                                    {key}: {value}
                                                    <button
                                                        onClick={() => setFilters({ ...filters, [key]: '' })}
                                                        className="hover:text-white"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}