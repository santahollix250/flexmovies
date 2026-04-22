// src/pages/TranslatorPage.js
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoviesContext } from '../context/MoviesContext';
import { FaFilm, FaTv, FaUser, FaSearch, FaLanguage, FaArrowLeft, FaStar, FaCheckCircle } from 'react-icons/fa';

export default function TranslatorPage() {
  const { movies = [] } = useContext(MoviesContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTranslator, setSelectedTranslator] = useState(null);

  // Group movies by translator
  const translatorsMap = new Map();
  
  movies.forEach(movie => {
    const translatorName = movie.translator || 'Unknown Translator';
    if (!translatorsMap.has(translatorName)) {
      translatorsMap.set(translatorName, {
        name: translatorName,
        movies: [],
        series: []
      });
    }
    
    const translatorData = translatorsMap.get(translatorName);
    if (movie.type === 'movie') {
      translatorData.movies.push(movie);
    } else if (movie.type === 'series') {
      translatorData.series.push(movie);
    }
  });

  // Convert to array and sort
  let translators = Array.from(translatorsMap.values());
  
  // Filter translators by search
  if (searchTerm) {
    translators = translators.filter(translator =>
      translator.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Sort by name
  translators.sort((a, b) => a.name.localeCompare(b.name));

  // Get selected translator data
  const selectedTranslatorData = selectedTranslator 
    ? translators.find(t => t.name === selectedTranslator)
    : null;

  // If a translator is selected, show their content
  if (selectedTranslatorData) {
    const allContent = [...selectedTranslatorData.movies, ...selectedTranslatorData.series];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => setSelectedTranslator(null)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all duration-300 hover:scale-105 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Translators
          </button>

          {/* Translator Header */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 mb-8 border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
                <FaLanguage className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {selectedTranslatorData.name}
                </h1>
                <div className="flex gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600/20 text-red-400 rounded-full text-xs">
                    <FaFilm className="text-xs" /> {selectedTranslatorData.movies.length} Movies
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">
                    <FaTv className="text-xs" /> {selectedTranslatorData.series.length} Series
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                    <FaCheckCircle className="text-xs" /> Total: {selectedTranslatorData.movies.length + selectedTranslatorData.series.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allContent.map((item) => (
              <Link
                key={item.id}
                to={item.type === 'movie' ? `/player/${item.id}` : `/series-player/${item.id}`}
                className="group cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden bg-gray-800 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <img
                    src={item.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Enhanced Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    {item.type === 'movie' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-lg shadow-lg transform transition-all duration-300 group-hover:scale-110">
                        <FaFilm className="text-xs" />
                        MOVIE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold rounded-lg shadow-lg transform transition-all duration-300 group-hover:scale-110">
                        <FaTv className="text-xs" />
                        SERIES
                      </span>
                    )}
                  </div>

                  {/* Rating Badge (if available) */}
                  {item.rating && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/30">
                        <FaStar className="text-xs" />
                        {item.rating}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-sm font-semibold line-clamp-2">
                      {item.title}
                    </h3>
                    {item.year && (
                      <p className="text-gray-300 text-xs mt-1">{item.year}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-purple-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.year && (
                    <p className="text-gray-400 text-xs">{item.year}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {allContent.length === 0 && (
            <div className="text-center py-12">
              <FaLanguage className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No content found for this translator</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show all translators grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4 animate-bounce">
            <FaLanguage className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Content by Translator
          </h1>
          <p className="text-gray-400">Browse movies and series by translator</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search translator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        {/* Translators Grid */}
        {translators.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No translators found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {translators.map((translator) => {
              const totalContent = translator.movies.length + translator.series.length;
              return (
                <button
                  key={translator.name}
                  onClick={() => setSelectedTranslator(translator.name)}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 text-left hover:border-purple-500/50 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-purple-600/5 group-hover:to-transparent transition-all duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center group-hover:from-purple-600/30 group-hover:to-pink-600/30 transition-all">
                        <FaLanguage className="text-purple-400 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {translator.name}
                        </h3>
                        <p className="text-xs text-gray-400">{totalContent} items</p>
                      </div>
                    </div>
                    
                    {/* Enhanced Badges */}
                    <div className="flex gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 rounded-full border border-red-500/30">
                        <FaFilm className="text-xs" />
                        {translator.movies.length} Movies
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600/20 to-purple-700/20 text-purple-400 rounded-full border border-purple-500/30">
                        <FaTv className="text-xs" />
                        {translator.series.length} Series
                      </span>
                    </div>

                    {/* Featured badge for top translators */}
                    {totalContent > 10 && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded-full shadow-lg">
                          <FaStar className="text-xs" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}