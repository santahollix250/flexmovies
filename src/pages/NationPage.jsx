// src/pages/NationPage.js
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoviesContext } from '../context/MoviesContext';
import { FaFilm, FaTv, FaGlobe, FaSearch, FaArrowLeft } from 'react-icons/fa';

// Country data with codes, names, and flags (matching your admin panel exactly)
const countriesData = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
];

// Function to get country info from code
const getCountryInfo = (code) => {
  const country = countriesData.find(c => c.code === code);
  if (country) {
    return { name: country.name, flag: country.flag, code: country.code };
  }
  // If code not found, return the code itself as name with earth flag
  return { name: code, flag: '🌍', code: code };
};

export default function NationPage() {
  const { movies = [] } = useContext(MoviesContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNation, setSelectedNation] = useState(null);

  // Group movies by nation code
  const nationsMap = new Map();
  
  movies.forEach(movie => {
    // Skip if no nation
    if (!movie.nation) return;
    
    const nationCode = movie.nation;
    if (!nationsMap.has(nationCode)) {
      const countryInfo = getCountryInfo(nationCode);
      nationsMap.set(nationCode, {
        code: nationCode,
        name: countryInfo.name,
        flag: countryInfo.flag,
        movies: [],
        series: []
      });
    }
    
    const nationData = nationsMap.get(nationCode);
    if (movie.type === 'movie') {
      nationData.movies.push(movie);
    } else if (movie.type === 'series') {
      nationData.series.push(movie);
    }
  });

  // Convert to array and sort
  let nations = Array.from(nationsMap.values());
  
  // Filter nations by search (search by name or code)
  if (searchTerm) {
    nations = nations.filter(nation =>
      nation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nation.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Sort by name
  nations.sort((a, b) => a.name.localeCompare(b.name));

  // Get selected nation data
  const selectedNationData = selectedNation 
    ? nations.find(n => n.code === selectedNation)
    : null;

  // If a nation is selected, show their content
  if (selectedNationData) {
    const allContent = [...selectedNationData.movies, ...selectedNationData.series];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => setSelectedNation(null)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
          >
            <FaArrowLeft /> Back to Countries
          </button>

          {/* Nation Header */}
          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 mb-8 border border-blue-500/30">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-5xl">
                {selectedNationData.flag}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {selectedNationData.name} {selectedNationData.flag}
                </h1>
                <p className="text-gray-400 mt-1">
                  {selectedNationData.movies.length} Movies • {selectedNationData.series.length} Series
                </p>
                <p className="text-xs text-gray-500 mt-1">Code: {selectedNationData.code}</p>
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
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                      item.type === 'movie' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-purple-600 text-white'
                    }`}>
                      {item.type === 'movie' ? 'Movie' : 'Series'}
                    </span>
                    <h3 className="text-white text-sm font-semibold line-clamp-2">
                      {item.title}
                    </h3>
                    {item.year && (
                      <p className="text-gray-300 text-xs mt-1">{item.year}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-lg">{selectedNationData.flag}</span>
                      <span className="text-xs text-gray-400">{selectedNationData.name}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-blue-400 transition-colors">
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
              <FaGlobe className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No content found for this country</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show all nations grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mb-4">
            <FaGlobe className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Content by Country
          </h1>
          <p className="text-gray-400">Browse movies and series by country of origin</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by country name or code (e.g., France or FR)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Debug Info - Remove after testing */}
        {nations.length === 0 && movies.length > 0 && (
          <div className="text-center mb-4 p-4 bg-yellow-900/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              No countries found. Make sure you have added nation/country data to your movies in the admin panel.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Total movies with nation data: {movies.filter(m => m.nation).length} out of {movies.length}
            </p>
          </div>
        )}

        {/* Nations Grid */}
        {nations.length === 0 ? (
          <div className="text-center py-12">
            <FaGlobe className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No countries found. Add nation data in admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nations.map((nation) => {
              const totalContent = nation.movies.length + nation.series.length;
              return (
                <button
                  key={nation.code}
                  onClick={() => setSelectedNation(nation.code)}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 text-left hover:border-blue-500/50 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    {/* Large flag */}
                    <div className="text-6xl">{nation.flag}</div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg">
                        {nation.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {nation.code} • {totalContent} items
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs mt-3">
                    <span className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-full flex items-center gap-1">
                      🎬 {nation.movies.length} Movies
                    </span>
                    <span className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-full flex items-center gap-1">
                      📺 {nation.series.length} Series
                    </span>
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