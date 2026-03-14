/**
 * Checks if a movie has any playable content
 */
export const hasPlayableContent = (movie) => {
    if (!movie) return false;

    // Check for direct video URL
    if (movie.videoUrl || movie.streamLink) return true;

    // Check for parts
    const parts = getMovieParts(movie);
    if (parts.length > 0) return true;

    // Check for embed code
    if (movie.embedCode) return true;

    return false;
};

/**
 * Extracts movie parts from download field
 */
export const getMovieParts = (movie) => {
    if (!movie) return [];

    // If parts already exist in the movie object
    if (movie.parts && Array.isArray(movie.parts)) {
        return movie.parts;
    }

    // Try to parse from download field
    if (movie.download) {
        try {
            const parsed = typeof movie.download === 'string'
                ? JSON.parse(movie.download)
                : movie.download;

            if (Array.isArray(parsed)) {
                return parsed;
            } else if (parsed && parsed.parts && Array.isArray(parsed.parts)) {
                return parsed.parts;
            }
        } catch (e) {
            // Not JSON, ignore
        }
    }

    return [];
};

/**
 * Gets the first playable part from a movie
 */
export const getFirstPlayablePart = (movie) => {
    const parts = getMovieParts(movie);
    return parts.length > 0 ? parts[0] : null;
};

/**
 * Normalizes movie data for consistent access
 */
export const normalizeMovie = (movie) => {
    if (!movie) return null;

    const parts = getMovieParts(movie);
    const firstPart = parts.length > 0 ? parts[0] : null;

    return {
        // Core fields
        id: movie.id || movie._id,
        title: movie.title || 'Untitled',
        description: movie.description || '',
        type: movie.type || 'movie',

        // Images
        poster: movie.poster || movie.poster_url || '',
        background: movie.background || movie.background_url || movie.backdrop || '',

        // Categories and metadata
        category: movie.category || movie.genre || '',
        year: movie.year || movie.release_year || (movie.release_date ? movie.release_date.split('-')[0] : ''),
        rating: movie.rating || movie.imdbRating || movie.vote_average,

        // Video related - IMPORTANT: Use first part's video if available
        videoUrl: movie.videoUrl || movie.streamLink || (firstPart?.videoUrl) || '',
        videoType: movie.videoType || firstPart?.videoType || 'direct',
        videoId: movie.videoId || firstPart?.videoId || '',
        embedCode: movie.embedCode || firstPart?.embedCode || '',
        streamLink: movie.streamLink || movie.videoUrl || (firstPart?.streamLink) || (firstPart?.videoUrl) || '',
        duration: movie.duration || firstPart?.duration || '',
        quality: movie.quality || 'HD',

        // Download related
        download_link: movie.download_link || movie.download || firstPart?.download_link || '',
        download: movie.download || '',

        // Parts
        parts: parts,
        hasParts: parts.length > 0,
        partsCount: parts.length,

        // Series specific
        totalSeasons: movie.totalSeasons || movie.seasons,
        totalEpisodes: movie.totalEpisodes || movie.episodes,

        // Additional metadata
        nation: movie.nation || movie.country || '',
        translator: movie.translator || '',
        director: movie.director || '',
        status: movie.status || 'completed',
        views: parseInt(movie.views) || 0,

        // Timestamps
        created_at: movie.created_at || movie.createdAt || movie.timestamp,
        updated_at: movie.updated_at || movie.updatedAt
    };
};