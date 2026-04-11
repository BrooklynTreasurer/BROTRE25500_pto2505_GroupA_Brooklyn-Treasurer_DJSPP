import { useMemo } from "react";
import { useFavouritesStore } from "../../store/favouritesStore.js";
import SortSelect from "../Filters/SortSelect.jsx";
import styles from "../../styles/Favourites.module.css";

const SORT_OPTIONS = [
  { key: "addedAt-desc", label: "Date added (newest first)" },
  { key: "addedAt-asc", label: "Date added (oldest first)" },
  { key: "title-asc", label: "Title (A–Z)" },
  { key: "title-desc", label: "Title (Z–A)" },
];

function formatDateTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sortFavourites(favourites, sortKey) {
  return [...favourites].sort((a, b) => {
    if (sortKey === "title-asc") {
      return a.title.localeCompare(b.title);
    }
    if (sortKey === "title-desc") {
      return b.title.localeCompare(a.title);
    }
    if (sortKey === "addedAt-asc") {
      return new Date(a.addedAt) - new Date(b.addedAt);
    }
    return new Date(b.addedAt) - new Date(a.addedAt);
  });
}

export default function Favourites() {
  const favourites = useFavouritesStore((state) => state.favourites);
  const sortKey = useFavouritesStore((state) => state.sortKey);
  const setSortKey = useFavouritesStore((state) => state.setSortKey);
  const removeFavourite = useFavouritesStore((state) => state.removeFavourite);

  const sortedFavourites = useMemo(
    () => sortFavourites(favourites, sortKey),
    [favourites, sortKey],
  );

  return (
    <div className={styles.favouritesPage}>
      <div className={styles.favouritesPage__header}>
        <div>
          <h2>Your Favourite Episodes</h2>
          <p>
            Browse episodes saved as favourites and sort by title or the date and time you added them.
          </p>
        </div>

        <SortSelect
          options={SORT_OPTIONS}
          selectedSort={sortKey}
          onSelectSort={setSortKey}
        />
      </div>

      {sortedFavourites.length === 0 ? (
        <p className={styles.emptyState}>No favourites yet. Add an episode from a show detail page.</p>
      ) : (
        <ul className={styles.favouritesList}>
          {sortedFavourites.map((episode) => (
            <li key={episode.id || episode.src} className={styles.favouritesItem}>
              <img
                src={episode.image}
                alt={episode.showTitle || episode.title}
                className={styles.favouritesItem__image}
              />
              <div className={styles.favouritesItem__content}>
                <strong>{episode.title}</strong>
                <span>{episode.showTitle}</span>
                <p>Added {formatDateTime(episode.addedAt)}</p>
              </div>
              <button
                type="button"
                className={styles.favouritesItem__remove}
                onClick={() => removeFavourite(episode.id || episode.src)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}