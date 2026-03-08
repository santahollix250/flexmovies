import { useState, useMemo } from "react";
import { useContext } from "react";
import { MoviesContext } from "../context/MoviesContext";
import MovieCard from "../components/MovieCard";

export default function Series() {
  const { movies } = useContext(MoviesContext); // all movies and series
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(12);

  // get unique categories for series only
  const categories = useMemo(() => {
    const set = new Set();
    movies
      .filter((m) => m.type === "series")
      .forEach((s) => set.add(s.category || "other"));
    return ["all", ...Array.from(set)];
  }, [movies]);

  // filter series
  const filtered = useMemo(() => {
    return movies
      .filter((m) => m.type === "series") // <-- only series
      .filter((m) => category === "all" || m.category === category)
      .filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));
  }, [movies, category, query]);

  return (
    <main className="bg-black min-h-screen pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-white">All Series</h1>

          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search series..."
              className="w-full max-w-xs rounded-md bg-white/5 px-4 py-2 text-white placeholder:text-gray-400"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md bg-white/5 px-3 py-2 text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.slice(0, visible).map((s) => (
            <MovieCard key={s.id} movie={s} />
          ))}
        </div>

        {visible < filtered.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + 12)}
              className="rounded-md bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition"
            >
              Load more
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-gray-300">
            No series found.
          </p>
        )}
      </div>
    </main>
  );
}
