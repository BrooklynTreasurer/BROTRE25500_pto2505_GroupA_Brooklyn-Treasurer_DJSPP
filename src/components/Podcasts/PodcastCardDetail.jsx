import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import formatDate from "../../utils/formatDate.js";
import styles from "../../styles/PodcastCardDetail.module.css";
import detailBackground from "../../assets/svg.png";
import { useAudioPlayerStore } from "../../store/audioPlayerStore.js";
import { useFavouritesStore } from "../../store/favouritesStore.js";
import AddFavourites from "../Filters/AddFavourites.jsx";

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

/**
 * Renders a detailed podcast card view.
 * @param {Object} props - Component props.
 * @param {Object} props.podcast - Podcast details.
 * @param {string[]} [props.genreNames] - Resolved genre names from genre API.
 * @returns {JSX.Element}
 */
export default function PodcastCardDetail({ podcast, genreNames = [] }) {
  const genres = Array.isArray(genreNames) ? genreNames.join(" | ") : "";
  const seasons = Array.isArray(podcast.seasons) ? podcast.seasons : [];
  const seasonCount = seasons.length || Number(podcast.seasons) || 0;
  const updatedText = podcast.updated ? formatDate(podcast.updated) : "Unknown";
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [isSeasonMenuOpen, setIsSeasonMenuOpen] = useState(false);
  const seasonMenuRef = useRef(null);
  const { playTrack, currentTrack, isPlaying } = useAudioPlayerStore();
  const favourites = useFavouritesStore((state) => state.favourites);

  useEffect(() => {
    const closeMenuOnOutsideClick = (event) => {
      if (!seasonMenuRef.current?.contains(event.target)) {
        setIsSeasonMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenuOnOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeMenuOnOutsideClick);
    };
  }, []);

  const listenedMap = useMemo(() => {
    const map = new Map();
    favourites.forEach((item) => {
      if (item?.id) {
        map.set(item.id, item);
      }
      if (item?.src) {
        map.set(item.src, item);
      }
    });
    return map;
  }, [favourites]);

  const safeSelectedSeasonIndex = Math.min(
    selectedSeasonIndex,
    Math.max(seasons.length - 1, 0),
  );
  const selectedSeason = seasons[safeSelectedSeasonIndex];
  const selectedSeasonNumber = selectedSeason?.season || safeSelectedSeasonIndex + 1;
  const selectedSeasonTitle =
    selectedSeason?.title || `Season ${selectedSeasonNumber}`;
  const selectedSeasonEpisodes = Array.isArray(selectedSeason?.episodes)
    ? selectedSeason.episodes
    : [];

  return (
    <section className={styles.page}>
      <div className={styles.backLink}>
        <Link to="/">&larr; Back to all podcasts</Link>
      </div>
      <header
        className={styles.hero}
        style={{ "--hero-bg": `url(${detailBackground})` }}
      >
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <p className={styles.heroKicker}>Last updated {updatedText}</p>
            <h1 className={styles.heroTitle}>{podcast.title}</h1>
            <p className={styles.heroDescription}>{podcast.description}</p>
            <div className={styles.heroMeta}>
              <span>{seasonCount} seasons</span>
              {genres && <span>{genres}</span>}
            </div>
          </div>

          <img
            className={styles.heroImage}
            src={podcast.image}
            alt={podcast.title || "Podcast cover"}
          />
        </div>

        <div className={styles.wave} aria-hidden="true" />
      </header>

      <section className={styles.seasonSection}>
        <div className={styles.sectionHeading}>
          <h2>Episodes By Season</h2>
          {seasons.length > 0 && (
            <div className={styles.seasonDropdown} ref={seasonMenuRef}>
              <span className={styles.seasonDropdownLabel}>Season</span>
              <button
                type="button"
                className={styles.seasonTrigger}
                aria-expanded={isSeasonMenuOpen}
                aria-haspopup="listbox"
                onClick={() => setIsSeasonMenuOpen((prev) => !prev)}
              >
                <span className={styles.seasonTriggerText}>{selectedSeasonTitle}</span>
                <span className={styles.seasonArrow} aria-hidden="true">
                  {isSeasonMenuOpen ? "^" : "v"}
                </span>
              </button>

              {isSeasonMenuOpen && (
                <div className={styles.seasonMenu} role="listbox">
                  {seasons.map((season, index) => {
                    const seasonNumber = season.season || index + 1;
                    const seasonTitle = season.title || `Season ${seasonNumber}`;
                    const isSelected = index === safeSelectedSeasonIndex;

                    return (
                      <button
                        type="button"
                        key={season.id || `season-option-${seasonNumber}`}
                        className={`${styles.seasonOption} ${
                          isSelected ? styles.seasonOptionSelected : ""
                        }`}
                        onClick={() => {
                          setSelectedSeasonIndex(index);
                          setIsSeasonMenuOpen(false);
                        }}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {seasonTitle}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {seasons.length === 0 ? (
          <p className={styles.emptyState}>No season details available for this show.</p>
        ) : (
          <div className={styles.seasonList}>
            <p className={styles.seasonSummary}>
              Showing {selectedSeasonTitle} ({safeSelectedSeasonIndex + 1} of {seasonCount})
            </p>

            <article
              key={
                selectedSeason?.id ||
                `${podcast.id}-season-${selectedSeasonNumber}`
              }
              className={styles.seasonCard}
            >
              <img
                src={selectedSeason?.image || podcast.image}
                alt={selectedSeasonTitle}
                className={styles.seasonImage}
              />

              <div className={styles.seasonContent}>
                <div className={styles.seasonTop}>
                  <h3>{selectedSeasonTitle}</h3>
                  <p className={styles.seasonMeta}>
                    {selectedSeasonEpisodes.length} episodes
                  </p>
                </div>

                {selectedSeason?.description && (
                  <p className={styles.seasonDescription}>
                    {selectedSeason.description}
                  </p>
                )}

                {selectedSeasonEpisodes.length > 0 && (
                  <details className={styles.episodeList}>
                    <summary>View episodes</summary>
                    <ol>
                      {selectedSeasonEpisodes.map((episode, episodeIndex) => {
                        const episodeNumber = episode.episode || episodeIndex + 1;
                        const episodeSource = episode.file || "";
                        const episodeTrackId = `${
                          podcast.id || "podcast"
                        }-${selectedSeasonNumber}-${
                          episode.id || `episode-${episodeNumber}`
                        }`;
                        const episodeHistoryItem =
                          listenedMap.get(episodeTrackId) || listenedMap.get(episodeSource);
                        const safePlayedTime = Math.max(0, Number(episodeHistoryItem?.playedTime) || 0);
                        const safeProgress = Math.min(
                          100,
                          Math.max(0, Number(episodeHistoryItem?.progress) || 0),
                        );
                        const isFinishedEpisode = episodeHistoryItem?.finished || safeProgress >= 100;
                        const resumeTime = isFinishedEpisode ? 0 : safePlayedTime;
                        const isActiveEpisode =
                          Boolean(episodeSource) &&
                          (currentTrack?.id
                            ? currentTrack.id === episodeTrackId
                            : currentTrack?.src === episodeSource);

                        return (
                          <li
                            key={
                              episode.id ||
                              `${selectedSeasonNumber}-episode-${episodeNumber}`
                            }
                          >
                            <img
                              src={selectedSeason?.image || podcast.image}
                              alt={selectedSeasonTitle}
                              className={styles.episodeImage}
                            />
                            <strong>{episode.title}</strong>
                            {episode.description && (
                              <p className={styles.episodeDescription}>
                                {episode.description}
                              </p>
                            )}
                            {(safeProgress > 0 || isFinishedEpisode) && (
                              <p className={styles.episodeProgress}>
                                {isFinishedEpisode
                                  ? "Finished"
                                  : `Resume at ${formatTime(safePlayedTime)} • ${safeProgress}% listened`}
                              </p>
                            )}

                            <div className={styles.episodeActions}>
                              <button
                                type="button"
                                className={`${styles.episodePlayButton} ${
                                  isActiveEpisode ? styles.episodePlayButtonActive : ""
                                }`}
                                onClick={() =>
                                  playTrack({
                                    id: episodeTrackId,
                                    src: episodeSource,
                                    title: episode.title || `Episode ${episodeNumber}`,
                                    showTitle: podcast.title || "Podcast",
                                    image: selectedSeason?.image || podcast.image,
                                    startTime: resumeTime,
                                  })
                                }
                                disabled={!episodeSource}
                              >
                                {isActiveEpisode && isPlaying
                                  ? "Now Playing"
                                  : isFinishedEpisode
                                  ? "Replay episode"
                                  : safeProgress > 0
                                  ? `Resume at ${formatTime(safePlayedTime)}`
                                  : "Listen To Episode"}
                              </button>
                              <AddFavourites
                                episode={{
                                  id: episodeTrackId,
                                  src: episodeSource,
                                  title: episode.title || `Episode ${episodeNumber}`,
                                  showTitle: podcast.title || "Podcast",
                                  image: selectedSeason?.image || podcast.image,
                                  description: episode.description,
                                }}
                              />
                            </div>

                    
                          </li>
                        );
                      })}
                    </ol>
                  </details>
                )}
              </div>
            </article>
          </div>
        )}
      </section>
    </section>
  );
}
