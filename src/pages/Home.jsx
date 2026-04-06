import { useState, useEffect } from "react";

import { fetchPodcasts } from "../api/fetchPodcast.js";
import PodcastGrid from "../components/Podcasts/PodcastGrid.jsx";
import loadingCat from "../assets/loading-cat.mp4";
import SearchBar from "../components/Filters/SearchBar.jsx";
import GenreFilter from "../components/Filters/GenreFilter.jsx";
import SortSelect from "../components/Filters/SortSelect.jsx";
import { GenreService } from "../utils/genreService.js";
import { SORT_OPTIONS } from "../utils/sortOptions.js";
import Pagination from "../components/UI/Pagnation.jsx";
import PodcastCarousel from "../components/Podcasts/PodcastCarousel.jsx";

const HOME_STATE_KEYS = {
  search: "home.searchTerm",
  genre: "home.selectedGenre",
  sort: "home.sortKey",
  page: "home.currentPage",
};

function getStoredValue(key, fallback) {
  const raw = sessionStorage.getItem(key);
  if (raw === null) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Main application component.
 * @returns {JSX.Element}
 */
function Home() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(() =>
    getStoredValue(HOME_STATE_KEYS.search, "")
  );
  const [selectedGenre, setSelectedGenre] = useState(() =>
    getStoredValue(HOME_STATE_KEYS.genre, "all")
  );
  const [sortKey, setSortKey] = useState(() =>
    getStoredValue(HOME_STATE_KEYS.sort, "date-desc")
  );
  const [currentPage, setCurrentPage] = useState(() =>
    getStoredValue(HOME_STATE_KEYS.page, 1)
  );
  const pageSize = 12;

  const genres = GenreService.getAll();
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredBySearch = normalizedSearch
    ? podcasts.filter((podcast) =>
        podcast.title.toLowerCase().includes(normalizedSearch)
      )
    : podcasts;

  const filteredPodcasts =
    selectedGenre === "all"
      ? filteredBySearch
      : filteredBySearch.filter(
          (podcast) =>
            Array.isArray(podcast.genres) &&
            podcast.genres.includes(Number(selectedGenre))
        );
  const sortedPodcasts = [...filteredPodcasts];

  switch (sortKey) {
    case "title-asc":
      sortedPodcasts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title-desc":
      sortedPodcasts.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "date-asc":
      sortedPodcasts.sort((a, b) => new Date(a.updated) - new Date(b.updated));
      break;
    case "date-desc":
    default:
      sortedPodcasts.sort((a, b) => new Date(b.updated) - new Date(a.updated));
      break;
  }

  const totalPages = Math.max(1, Math.ceil(sortedPodcasts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedPodcasts = sortedPodcasts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPodcasts();
        setPodcasts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, sortKey]);

  useEffect(() => {
    sessionStorage.setItem(HOME_STATE_KEYS.search, JSON.stringify(searchTerm));
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem(
      HOME_STATE_KEYS.genre,
      JSON.stringify(selectedGenre)
    );
  }, [selectedGenre]);

  useEffect(() => {
    sessionStorage.setItem(HOME_STATE_KEYS.sort, JSON.stringify(sortKey));
  }, [sortKey]);

  useEffect(() => {
    sessionStorage.setItem(HOME_STATE_KEYS.page, JSON.stringify(safePage));
  }, [safePage]);

  return (
    <>
      <div className="controls">
        <GenreFilter
          genres={genres}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
        />
         <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
        <SortSelect
          options={SORT_OPTIONS}
          selectedSort={sortKey}
          onSelectSort={setSortKey}
        />
      </div>


      {loading && (
        <div className="loader-container">
          <video
            src={loadingCat}
            autoPlay
            loop
            muted
            className="loader-video"
          />
        </div>
      )}

      {error && <p>Error: {error.message}</p>}

      {!loading && !error && (
        <>
          <PodcastCarousel podcasts={podcasts} />
          <PodcastGrid podcasts={pagedPodcasts} />
          <Pagination
            totalPages={totalPages}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
}

export default Home;
