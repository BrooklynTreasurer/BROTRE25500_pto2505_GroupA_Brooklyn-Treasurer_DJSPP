import { useMemo } from "react";
import { useAudioPlayerStore } from "../../store/audioPlayerStore.js";
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
    const titleA = String(a?.title || "");
    const titleB = String(b?.title || "");

    if (sortKey === "title-asc") {
      return titleA.localeCompare(titleB);
    }
    if (sortKey === "title-desc") {
      return titleB.localeCompare(titleA);
    }

    const timeA = new Date(a?.addedAt || 0).getTime() || 0;
    const timeB = new Date(b?.addedAt || 0).getTime() || 0;

    if (sortKey === "addedAt-asc") {
      return timeA - timeB;
    }
    return timeB - timeA;
  });
}

export default function Favourites() {
  const favourites = useFavouritesStore((state) => state.favourites);
  const sortKey = useFavouritesStore((state) => state.sortKey);
  const setSortKey = useFavouritesStore((state) => state.setSortKey);
  const removeFavourite = useFavouritesStore((state) => state.removeFavourite);
  const resetListeningHistory = useFavouritesStore((state) => state.resetListeningHistory);
  const playTrack = useAudioPlayerStore((state) => state.playTrack);
  const currentTrack = useAudioPlayerStore((state) => state.currentTrack);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);

  const sortedFavourites = useMemo(
    () => sortFavourites(Array.isArray(favourites) ? favourites.filter(Boolean) : [], sortKey),
    [favourites, sortKey],
  );

  return (
    <div className={styles.favouritesPage}>
      <div className={styles.favouritesPage__header}>
        <div>
          <h2>Your Favourite Episodes</h2>
          <p>
            Browse episodes saved as favourites and track your listening progress over time.
          </p>
        </div>

        <div className={styles.favouritesPage__headerActions}>
          <SortSelect
            options={SORT_OPTIONS}
            selectedSort={sortKey}
            onSelectSort={setSortKey}
          />
          <button
            type="button"
            className={styles.favouritesPage__resetButton}
            onClick={resetListeningHistory}
          >
            Reset listening history
          </button>
        </div>
      </div>

      {sortedFavourites.length === 0 ? (
        <p className={styles.emptyState}>No favourites yet. Add an episode from a show detail page.</p>
      ) : (
        <ul className={styles.favouritesList}>
          {sortedFavourites.map((episode) => {
            const isActiveEpisode = Boolean(currentTrack?.id)
              ? currentTrack.id === episode.id
              : currentTrack?.src === episode.src;

            const safeTitle = episode.title || "Untitled episode";
            const safeShowTitle = episode.showTitle || "Podcast";
            const safeImage = episode.image || "";
            const safeAddedAt = episode.addedAt || "";
            const safePlayedTime = Math.max(0, Number(episode.playedTime) || 0);
            const safeDuration = Math.max(0, Number(episode.duration) || 0);
            const progressPercent = safeDuration > 0
              ? Math.min(100, Math.round((safePlayedTime / safeDuration) * 100))
              : 0;

            return (
              <li key={episode.id || episode.src || safeTitle} className={styles.favouritesItem}>
                <img
                  src={safeImage}
                  alt={safeShowTitle}
                  className={styles.favouritesItem__image}
                />
                <div className={styles.favouritesItem__content}>
                  <strong>{safeTitle}</strong>
                  <span>{safeShowTitle}</span>
                  <p>Added {safeAddedAt ? formatDateTime(safeAddedAt) : "Unknown"}</p>
                  <p className={styles.favouritesItem__progress}>
                    {progressPercent > 0 ? `${progressPercent}% listened` : "Not started"}
                  </p>
                </div>

                <div className={styles.favouritesItem__actions}>
                  <button
                    type="button"
                    className={styles.favouritesItem__play}
                    onClick={() =>
                      playTrack({
                        id: episode.id || episode.src,
                        src: episode.src,
                        title: safeTitle,
                        showTitle: safeShowTitle,
                        image: safeImage,
                        startTime: episode.finished ? 0 : safePlayedTime,
                      })
                    }
                  >
                    {isActiveEpisode && isPlaying
                      ? "Playing"
                      : episode.finished
                      ? "Replay"
                      : "Play"}
                  </button>
                  <button
                    type="button"
                    className={styles.favouritesItem__remove}
                    onClick={() => removeFavourite(episode.id || episode.src)}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}