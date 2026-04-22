// src/pages/CategoryPage.js
import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoviesContext } from '../context/MoviesContext';
import { 
  FaFilm, FaTv, FaSearch, FaTag, FaFire, FaStar, 
  FaArrowLeft, FaEye, FaCalendar, FaClock, FaTheaterMasks,
  FaHeart, FaThumbsUp, FaChartLine, FaCrown, FaGem
} from 'react-icons/fa';

export default function CategoryPage() {
  const { movies = [] } = useContext(MoviesContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('popular');

  // Group movies by category
  const categoriesMap = new Map();
  
  movies.forEach(movie => {
    const categoryName = movie.category || 'Uncategorized';
    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, {
        name: categoryName,
        movies: [],
        series: [],
        totalViews: 0,
        totalItems: 0,
        avgRating: 0
      });
    }
    
    const categoryData = categoriesMap.get(categoryName);
    if (movie.type === 'movie') {
      categoryData.movies.push(movie);
    } else if (movie.type === 'series') {
      categoryData.series.push(movie);
    }
    categoryData.totalItems++;
    categoryData.totalViews += parseInt(movie.views) || 0;
  });

  // Calculate average rating for each category
  categoriesMap.forEach(category => {
    const allItems = [...category.movies, ...category.series];
    const totalRating = allItems.reduce((sum, item) => sum + (parseFloat(item.imdbRating) || 0), 0);
    category.avgRating = allItems.length > 0 ? (totalRating / allItems.length).toFixed(1) : 0;
  });

  // Convert to array and sort
  let categories = Array.from(categoriesMap.values());
  
  // Filter categories by search
  if (searchTerm) {
    categories = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Sort categories
  categories.sort((a, b) => {
    switch(sortBy) {
      case 'popular':
        return b.totalViews - a.totalViews;
      case 'rating':
        return b.avgRating - a.avgRating;
      case 'items':
        return b.totalItems - a.totalItems;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return b.totalViews - a.totalViews;
    }
  });

  // Get category icon based on name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Action': '⚡',
      'Adventure': '🗺️',
      'Animation': '🎨',
      'Biography': '📖',
      'Comedy': '😄',
      'Crime': '🔫',
      'Documentary': '📹',
      'Drama': '🎭',
      'Family': '👨‍👩‍👧‍👦',
      'Fantasy': '🐉',
      'History': '📜',
      'Horror': '👻',
      'Music': '🎵',
      'Musical': '🎤',
      'Mystery': '🔍',
      'Romance': '💕',
      'Sci-Fi': '🚀',
      'Sport': '🏆',
      'Thriller': '🔪',
      'War': '⚔️',
      'Western': '🤠',
      'Anime': '🎎',
      'Reality TV': '📺',
      'Talk Show': '🎙️'
    };
    return iconMap[categoryName] || '🎬';
  };

  // Get gradient colors for category
  const getCategoryGradient = (categoryName, index) => {
    const gradients = [
      'from-red-600 to-orange-600',
      'from-blue-600 to-cyan-600',
      'from-green-600 to-teal-600',
      'from-purple-600 to-pink-600',
      'from-yellow-600 to-orange-600',
      'from-indigo-600 to-purple-600',
      'from-pink-600 to-rose-600',
      'from-cyan-600 to-blue-600',
      'from-emerald-600 to-green-600',
      'from-violet-600 to-purple-600'
    ];
    return gradients[index % gradients.length];
  };

  // Get selected category data
  const selectedCategoryData = selectedCategory 
    ? categories.find(c => c.name === selectedCategory)
    : null;

  // If a category is selected, show its content
  if (selectedCategoryData) {
    const allContent = [...selectedCategoryData.movies, ...selectedCategoryData.series];
    
    // Sort content based on selected sort
    const sortedContent = [...allContent].sort((a, b) => {
      switch(sortBy) {
        case 'popular':
          return (parseInt(b.views) || 0) - (parseInt(a.views) || 0);
        case 'rating':
          return (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        default:
          return (parseInt(b.views) || 0) - (parseInt(a.views) || 0);
      }
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => setSelectedCategory(null)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all duration-300 hover:scale-105 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Categories
          </button>

          {/* Category Header with Enhanced Badge */}
          <div className="relative mb-8 overflow-hidden rounded-2xl">
            <div className={`absolute inset-0 bg-gradient-to-r ${getCategoryGradient(selectedCategoryData.name, 0)} opacity-20`}></div>
            <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className={`w-20 h-20 bg-gradient-to-br ${getCategoryGradient(selectedCategoryData.name, 0)} rounded-2xl flex items-center justify-center shadow-2xl animate-pulse`}>
                  <span className="text-4xl">{getCategoryIcon(selectedCategoryData.name)}</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {selectedCategoryData.name}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm">
                      <FaFilm className="text-xs" /> {selectedCategoryData.movies.length} Movies
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                      <FaTv className="text-xs" /> {selectedCategoryData.series.length} Series
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm">
                      <FaStar className="text-xs" /> ★ {selectedCategoryData.avgRating}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                      <FaEye className="text-xs" /> {selectedCategoryData.totalViews.toLocaleString()} Views
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                    <option value="year">Latest</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedContent.map((item) => (
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
                  
                  {/* Type Badge */}
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

                  {/* Rating Badge */}
                  {item.imdbRating && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/30">
                        <FaStar className="text-xs" />
                        {item.imdbRating}
                      </span>
                    </div>
                  )}

                  {/* Year Badge */}
                  {item.year && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg">
                        <FaCalendar className="text-xs" />
                        {item.year}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-sm font-semibold line-clamp-2">
                      {item.title}
                    </h3>
                    {item.director && (
                      <p className="text-gray-300 text-xs mt-1">{item.director}</p>
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

          {sortedContent.length === 0 && (
            <div className="text-center py-12">
              <FaTag className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No content found in this category</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show all categories grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full mb-4 animate-bounce">
            <FaTag className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Browse by Category
          </h1>
          <p className="text-gray-400">Discover movies and series by genre</p>
        </div>

        {/* Search and Sort Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'popular' 
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'}`}
            >
              <FaFire className="inline mr-1" /> Most Popular
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'rating' 
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'}`}
            >
              <FaStar className="inline mr-1" /> Top Rated
            </button>
            <button
              onClick={() => setSortBy('items')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'items' 
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'}`}
            >
              <FaFilm className="inline mr-1" /> Most Content
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'name' 
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'}`}
            >
              A-Z
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <FaTag className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const totalContent = category.movies.length + category.series.length;
              const gradient = getCategoryGradient(category.name, index);
              
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
                    {/* Top Right Badge */}
                    <div className="absolute top-3 right-3">
                      {totalContent > 20 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded-full shadow-lg">
                          <FaCrown className="text-xs" /> Popular
                        </span>
                      )}
                      {category.avgRating >= 8 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                          <FaGem className="text-xs" /> Top Rated
                        </span>
                      )}
                    </div>

                    {/* Category Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <span className="text-3xl">{getCategoryIcon(category.name)}</span>
                    </div>

                    {/* Category Name */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 transition-all duration-300">
                      {category.name}
                    </h3>

                    {/* Stats Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600/20 text-red-400 rounded-full text-xs">
                        <FaFilm className="text-xs" />
                        {category.movies.length}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">
                        <FaTv className="text-xs" />
                        {category.series.length}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">
                        <FaStar className="text-xs" />
                        {category.avgRating}
                      </span>
                    </div>

                    {/* Total Items Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {totalContent} {totalContent === 1 ? 'item' : 'items'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg text-white text-xs font-medium shadow-lg">
                        Browse <FaArrowLeft className="text-xs rotate-180 ml-1" />
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Popularity</span>
                        <span>{Math.min(100, Math.floor((category.totalViews / Math.max(...categories.map(c => c.totalViews))) * 100))}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${gradient} h-1.5 rounded-full transition-all duration-1000`}
                          style={{ width: `${Math.min(100, Math.floor((category.totalViews / Math.max(...categories.map(c => c.totalViews))) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Statistics Footer */}
        {categories.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <FaTag className="text-2xl text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{categories.length}</div>
                <div className="text-xs text-gray-400">Categories</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <FaFilm className="text-2xl text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {categories.reduce((sum, cat) => sum + cat.movies.length, 0)}
                </div>
                <div className="text-xs text-gray-400">Total Movies</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <FaTv className="text-2xl text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {categories.reduce((sum, cat) => sum + cat.series.length, 0)}
                </div>
                <div className="text-xs text-gray-400">Total Series</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <FaEye className="text-2xl text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {categories.reduce((sum, cat) => sum + cat.totalViews, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Total Views</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}