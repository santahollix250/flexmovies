// src/components/AdvancedSearch.jsx
import { useState } from 'react';
import { FaSearch, FaFilter, FaStar, FaCalendar, FaGlobe, FaSort } from 'react-icons/fa';

export default function AdvancedSearch({ onSearch }) {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        rating: '',
        country: '',
        sortBy: 'popular',
    });
    const [showFilters, setShowFilters] = useState(false);

    const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation'];
    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    const ratings = ['9+', '8+', '7+', '6+', '5+'];
    const countries = ['USA', 'UK', 'India', 'Japan', 'Korea', 'France', 'Germany'];

    const handleSearch = () => {
        onSearch({ query, ...filters });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-6 mb-8">
            {/* Main Search Bar */}
            <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search movies by title, actor, director..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-red-500"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium flex items-center gap-2"
                >
                    <FaFilter /> Filters
                </button>
                <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-bold"
                >
                    Search
                </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Genre Filter */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                                <FaFilter className="text-xs" /> Genre
                            </label>
                            <select
                                value={filters.genre}
                                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                                <FaCalendar className="text-xs" /> Year
                            </label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                                <FaStar className="text-xs" /> Rating
                            </label>
                            <select
                                value={filters.rating}
                                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="">Any Rating</option>
                                {ratings.map(rating => (
                                    <option key={rating} value={rating}>{rating}+</option>
                                ))}
                            </select>
                        </div>

                        {/* Country Filter */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                                <FaGlobe className="text-xs" /> Country
                            </label>
                            <select
                                value={filters.country}
                                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="">All Countries</option>
                                {countries.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                                <FaSort className="text-xs" /> Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="newest">Newest First</option>
                                <option value="rating">Highest Rated</option>
                                <option value="az">A → Z</option>
                                <option value="za">Z → A</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <button
                            onClick={() => setFilters({
                                genre: 'Action',
                                year: new Date().getFullYear(),
                                rating: '7+',
                                country: '',
                                sortBy: 'popular'
                            })}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm"
                        >
                            New Action Movies
                        </button>
                        <button
                            onClick={() => setFilters({
                                genre: '',
                                year: '',
                                rating: '8+',
                                country: '',
                                sortBy: 'rating'
                            })}
                            className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg text-sm"
                        >
                            Top Rated
                        </button>
                        <button
                            onClick={() => setFilters({
                                genre: '',
                                year: '2024',
                                rating: '',
                                country: '',
                                sortBy: 'newest'
                            })}
                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm"
                        >
                            2024 Releases
                        </button>
                        <button
                            onClick={() => setFilters({
                                genre: '',
                                year: '',
                                rating: '',
                                country: '',
                                sortBy: 'popular'
                            })}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}