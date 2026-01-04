import { useContext, useMemo, useState } from "react";
import { MoviesContext } from "../context/MoviesContext";
import MovieCard from "../components/MovieCard";
import SimpleVideoModal from "../components/SimpleVideoModal";

export default function Movies() {
  const { movies, loading } = useContext(MoviesContext);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Filter movies based on search query and type
  const filtered = useMemo(() => {
    return movies.filter((m) => {
      if (filterType === "movie" && m.type !== "movie") return false;
      if (filterType === "series" && m.type !== "series") return false;
      return m.title.toLowerCase().includes(query.toLowerCase());
    });
  }, [movies, query, filterType]);

  // Handle video play
  const handlePlayVideo = (movie) => {
    const streamUrl = movie.streamLink ||
      movie.videoUrl ||
      `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;

    setSelectedVideo({
      url: streamUrl,
      title: movie.title,
      description: movie.description || movie.overview || "No description available.",
      year: movie.year || movie.release_date?.split("-")[0] || "2024",
      rating: movie.rating || (movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"),
      type: movie.type || "movie",
      genre: movie.category || movie.genre || "General",
      duration: movie.duration || "2h",
      poster: movie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=300&fit=crop"
    });
    setModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalMovies = movies.filter(m => m.type === "movie").length;
    const totalSeries = movies.filter(m => m.type === "series").length;
    const totalActive = movies.filter(m => m.status === "active" || !m.status).length;
    const totalWithVideo = movies.filter(m => m.streamLink || m.videoUrl).length;

    return {
      movies: totalMovies,
      series: totalSeries,
      active: totalActive,
      withVideo: totalWithVideo
    };
  }, [movies]);

  if (loading) {
    return (
      <main className="bg-black min-h-screen pt-28 px-6 text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Loading movies...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="bg-black min-h-screen pt-28 px-4 md:px-6 text-white">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          <div
            className="h-64 md:h-80 bg-cover bg-center"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=400&fit=crop)'
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Discover Amazing Movies</h1>
              <p className="text-gray-300 text-center max-w-2xl mb-6">
                Stream your favorite movies and series in high quality. New content added weekly!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Action</span>
                <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">Drama</span>
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Comedy</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Thriller</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">All Movies</h1>
              <p className="text-gray-400">{filtered.length} movies found</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 rounded-lg transition-all ${filterType === "all" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("movie")}
                  className={`px-4 py-2 rounded-lg transition-all ${filterType === "movie" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                >
                  Movies
                </button>
                <button
                  onClick={() => setFilterType("series")}
                  className={`px-4 py-2 rounded-lg transition-all ${filterType === "series" ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                >
                  Series
                </button>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 md:w-64">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies and series..."
                  className="w-full p-3 pl-10 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
                <svg
                  className="w-5 h-5 text-gray-500 absolute left-3 top-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-400">Sort by:</span>
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
              onChange={(e) => {
                // Add sorting logic here if needed
                console.log("Sort by:", e.target.value);
              }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A-Z</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 text-gray-700 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-semibold mb-2">No movies found</h3>
            <p className="text-gray-400 mb-6">Try changing your search or filter criteria</p>
            <button
              onClick={() => { setQuery(""); setFilterType("all"); }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filtered.map((movie) => (
              <div
                key={movie.id}
                className="cursor-pointer transform transition-transform hover:scale-[1.02]"
                onClick={() => handlePlayVideo(movie)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {!loading && filtered.length > 0 && (
          <div className="text-center py-8">
            <button
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              onClick={() => {
                // Add load more logic here if needed
                console.log("Load more movies");
              }}
            >
              Load More Movies
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl border border-red-800/30">
              <div className="text-3xl font-bold text-red-500 mb-2">{stats.movies}</div>
              <div className="text-gray-400">Movies</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl border border-purple-800/30">
              <div className="text-3xl font-bold text-purple-500 mb-2">{stats.series}</div>
              <div className="text-gray-400">TV Series</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl border border-blue-800/30">
              <div className="text-3xl font-bold text-blue-500 mb-2">{stats.active}</div>
              <div className="text-gray-400">Active</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl border border-green-800/30">
              <div className="text-3xl font-bold text-green-500 mb-2">{stats.withVideo}</div>
              <div className="text-gray-400">With Video</div>
            </div>
          </div>

          {/* Source Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Showing {filtered.length} of {movies.length} movies from all sources
            </p>
          </div>
        </div>
      </main>

      {/* Video Modal */}
      <SimpleVideoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        videoUrl={selectedVideo?.url}
        title={selectedVideo?.title}
        description={selectedVideo?.description}
        year={selectedVideo?.year}
        rating={selectedVideo?.rating}
        type={selectedVideo?.type}
        genre={selectedVideo?.genre}
        duration={selectedVideo?.duration}
        poster={selectedVideo?.poster}
      />
    </>
  );
}