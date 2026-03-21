// src/pages/SearchPage.jsx
import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MoviesContext } from '../context/MoviesContext';
import AdvancedSearch from '../components/AdvancedSearch';
import MovieCard from '../components/MovieCard';
import { FaFilm, FaSpinner } from 'react-icons/fa';

export default function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        globalSearchResults,
        globalSearchQuery,
        globalSearchFilters,
        updateGlobalSearch,
        clearGlobalSearch,
        loading
    } = useContext(MoviesContext);

    const [isInitialized, setIsInitialized] = useState(false);

    // Parse URL params on load and update global search
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        const genre = params.get('genre');
        const year = params.get('year');
        const rating = params.get('rating');
        const country = params.get('country');
        const language = params.get('language');
        const sort = params.get('sort');
        const type = params.get('type');

        if (search || genre || year || rating || country || language || sort || type) {
            updateGlobalSearch(search || '', {
                genre: genre || '',
                year: year || '',
                rating: rating || '',
                country: country || '',
                language: language || '',
                sortBy: sort || 'popular',
                type: type || 'all'
            });
        }

        setIsInitialized(true);

        // Cleanup on unmount
        return () => {
            // Don't clear search on unmount to preserve state
        };
    }, [location.search, updateGlobalSearch]);

    // Handle clear search
    const handleClearSearch = () => {
        clearGlobalSearch();
        navigate('/movies');
    };

    // Show loading state
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="text-purple-500 text-4xl animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading search...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-20">
            <div className="container mx-auto px-4">
                {/* Advanced Search Component */}
                <AdvancedSearch />

                {/* Search Results */}
                {globalSearchQuery && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                Search Results for "<span className="text-purple-400">{globalSearchQuery}</span>"
                            </h2>
                            <div className="flex items-center gap-3">
                                {globalSearchFilters.genre && (
                                    <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                                        {globalSearchFilters.genre}
                                    </span>
                                )}
                                <button
                                    onClick={handleClearSearch}
                                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                                >
                                    Clear Search
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                            </div>
                        ) : globalSearchResults.length === 0 ? (
                            <div className="text-center py-20">
                                <FaFilm className="text-6xl text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl text-white mb-2">No results found</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    We couldn't find any movies matching "{globalSearchQuery}"
                                    {globalSearchFilters.genre && ` in ${globalSearchFilters.genre} genre`}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                                    <button
                                        onClick={() => navigate('/movies')}
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                                    >
                                        Browse All Movies
                                    </button>
                                    <button
                                        onClick={handleClearSearch}
                                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-400 mb-4">
                                    Found {globalSearchResults.length} result{globalSearchResults.length !== 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                    {globalSearchResults.map(movie => (
                                        <MovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Show featured content when no search */}
                {!globalSearchQuery && (
                    <div className="text-center py-20">
                        <FaFilm className="text-6xl text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl text-white mb-2">Ready to explore?</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Use the search bar above to find your favorite movies and series
                        </p>
                        <button
                            onClick={() => navigate('/movies')}
                            className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                        >
                            Browse All Movies
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}