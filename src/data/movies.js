const movies = [
  {
    id: 1,
    title: "Avengers: Endgame",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    // Wide backdrop used as hero background
    backdrop: "https://image.tmdb.org/t/p/original/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    // Optional transparent high-quality backdrop (PNG/WebP with alpha)
    backdropAlpha: "https://example.com/backdrops/avengers-alpha.webp",
    rating: "8.4",
    category: "action",
    // Placeholder transparent background (replace with your high-quality PNG/WebP with alpha)
    posterAlpha: "https://example.com/posters/avengers-alpha.webp",
  },
  {
    id: 2,
    title: "John Wick",
    poster: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    rating: "7.9",
    category: "action",
  },
  {
    id: 3,
    title: "The Dark Knight",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    rating: "9.0",
    category: "action",
  },
  {
    id: 4,
    title: "Spider-Man: No Way Home",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    rating: "8.2",
    category: "action",
  },
  {
    id: 5,
    title: "Black Panther: Wakanda Forever",
    poster: "https://cdn.cinematerial.com/p/297x/1vnyywpx/sisu-2-finnish-movie-poster-md.jpg?v=1758737175",
    rating: "7.3",
    category: "action",
  },
  {
    id: 6,
    title: "Doctor Strange: Multiverse of Madness",
    poster: "https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg",
    rating: "7.0",
    category: "action",
  },
  {
    id: 7,
    title: "Thor: Love and Thunder",
    poster: "https://image.tmdb.org/t/p/w500/4zLfBbGnuUBLbMVtagTZvzFwS8l.jpg",
    rating: "6.9",
    category: "action",
  },
  {
    id: 8,
    title: "Shang-Chi and the Legend of the Ten Rings",
    poster: "https://image.tmdb.org/t/p/w500/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg",
    rating: "7.5",
    category: "action",
  },
  {
    id: 9,
    title: "Captain Marvel",
    poster: "https://cdn.cinematerial.com/p/297x/m1orqeu6/avatar-fire-and-ash-movie-poster-md.jpg?v=1758806843",
    rating: "6.9",
    category: "action",
  },
  {
    id: 10,
    title: "Eternals",
    poster: "https://cdn.cinematerial.com/p/297x/odyg9poc/sinners-movie-poster-md.jpg?v=1743052829",
    rating: "5.7",
    category: "action",
  },
  {
    id: 11,
    title: "Guardians of the Galaxy Vol. 2",
    poster: "https://image.tmdb.org/t/p/w500/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg",
    rating: "7.6",
    category: "action",
  },
  {
    id: 12,
    title: "Iron Man",
    poster: "https://cdn.cinematerial.com/p/297x/r3s1irh6/predator-badlands-movie-poster-md.jpg?v=1759766756",
    rating: "7.9",
    category: "action",
  },
  {
    id: 13,
    title: "Captain America: Civil War",
    poster: "https://image.tmdb.org/t/p/w500/4GDM4aW7pYc0MpgvKRO3t0pldI4.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/2Gf9K9kK8iC6z1z6y1YV2T6Qe2r.jpg",
    backdropAlpha: "https://example.com/backdrops/civil-war-alpha.webp",
    rating: "7.8",
    category: "action",
    // Example trailer (replace with your own hosted trailer file or alpha WebM for transparency)
    trailer: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    // Example alpha WebM trailer (transparent background). Replace with your own hosted WebM with alpha channel.
    trailerAlpha: "https://example.com/trailers/civil-war-alpha.webm",
    posterAlpha: "https://example.com/posters/civil-war-alpha.png",
  },
  // Drama Movies
  {
    id: 14,
    title: "The Shawshank Redemption",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmJy0DlUlNhdQOK5.jpg",
    rating: "9.3",
    category: "drama",
  },
  {
    id: 15,
    title: "The Godfather",
    poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1m8UFA3.jpg",
    rating: "9.2",
    category: "drama",
  },
  {
    id: 16,
    title: "Pulp Fiction",
    poster: "https://image.tmdb.org/t/p/w500/d5iIlW_O0KtMX7PyWuuYkIqJ50b.jpg",
    rating: "8.9",
    category: "drama",
  },
  {
    id: 17,
    title: "The Wolf of Wall Street",
    poster: "https://image.tmdb.org/t/p/w500/cWDaBstProtkDKTOYMuUIkV14A1.jpg",
    rating: "8.2",
    category: "drama",
  },
  {
    id: 18,
    title: "Parasite",
    poster: "https://image.tmdb.org/t/p/w500/7IWcsGD50uCixsvMUypLkoRjUVV.jpg",
    rating: "8.6",
    category: "drama",
  },
  {
    id: 19,
    title: "Forrest Gump",
    poster: "https://image.tmdb.org/t/p/w500/arXVcNME4QPTVUXwJf7pY0rMzyd.jpg",
    rating: "8.8",
    category: "drama",
    trailer: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    trailerAlpha: "https://example.com/trailers/forrest-gump-alpha.webm",
  },
  // Comedy Movies
  {
    id: 20,
    title: "Superbad",
    poster: "https://cdn.cinematerial.com/p/297x/pzdevhtr/the-pickup-movie-poster-md.jpg?v=1753106555",
    rating: "7.6",
    category: "comedy",
  },
  {
    id: 21,
    title: "The Grand Budapest Hotel",
    poster: "https://image.tmdb.org/t/p/w500/kApMmqd8vAXPuaF7e5dXBXJWDvh.jpg",
    rating: "8.1",
    category: "comedy",
  },
  {
    id: 22,
    title: "Dumb and Dumber",
    poster: "https://image.tmdb.org/t/p/w500/4Ydffkg7kJZs0eM0GJLVLqNwvFL.jpg",
    rating: "7.3",
    category: "comedy",
  },
  {
    id: 23,
    title: "The Hangover",
    poster: "https://image.tmdb.org/t/p/w500/F2bh0XaE1Y0FRy4f34Z1oQ1qVMm.jpg",
    rating: "7.7",
    category: "comedy",
    trailer: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    trailerAlpha: "https://example.com/trailers/hangover-alpha.webm",
  },
  {
    id: 24,
    title: "Knives Out",
    poster: "https://image.tmdb.org/t/p/w500/dnMQk3xh89YNvjIiqES2YB7uyLD.jpg",
    rating: "7.9",
    category: "comedy",
  },
  // Horror Movies
  {
    id: 25,
    title: "The Shining",
    poster: "https://cdn.cinematerial.com/p/297x/xxudlmk5/evil-dead-rise-german-movie-poster-md.jpg?v=1680209274",
    trailer: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    rating: "8.4",
    category: "horror",
    trailerAlpha: "https://example.com/trailers/shining-alpha.webm",
  },
  {
    id: 26,
    title: "A Quiet Place",
    poster: "https://cdn.cinematerial.com/p/297x/xnnocoqf/the-nun-ii-movie-poster-md.jpg?v=1692433122",
    rating: "7.5",
    category: "horror",
  },
  {
    id: 27,
    title: "Hereditary",
    poster: "https://image.tmdb.org/t/p/w500/rNH3FRDDv9CxrP08NbyL5JzY5Ml.jpg",
    rating: "7.3",
    category: "horror",
  },
  // Sci-Fi Movies
  {
    id: 28,
    title: "Inception",
    poster: "https://cdn.cinematerial.com/p/297x/r3s1irh6/predator-badlands-movie-poster-md.jpg?v=1759766756",
    rating: "8.8",
    category: "scifi",
  },
  {
    id: 29,
    title: "Interstellar",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: "8.6",
    category: "scifi",
  },
  {
    id: 30,
    title: "The Matrix",
    poster: "https://image.tmdb.org/t/p/w500/vgqKSP1c8DMOriginal.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdropAlpha: "https://example.com/backdrops/matrix-alpha.webp",
    rating: "8.7",
    category: "scifi",
    trailer: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    trailerAlpha: "https://example.com/trailers/matrix-alpha.webm",
    posterAlpha: "https://example.com/posters/matrix-alpha.webp",
  },
];

// If a transparent poster/backdrop isn't provided, generate a placeholder URL
// (Replace these example URLs with your real hosted alpha assets.)
movies.forEach((m) => {
  const slug = (m.title || 'movie').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!m.posterAlpha) m.posterAlpha = `https://example.com/posters/${slug}-alpha.webp`;
  if (!m.backdropAlpha) m.backdropAlpha = `https://example.com/backdrops/${slug}-alpha.webp`;
});

export default movies;
