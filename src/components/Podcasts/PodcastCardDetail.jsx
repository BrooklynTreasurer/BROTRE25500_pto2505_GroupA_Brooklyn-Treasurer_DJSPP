import { useEffect, useRef, useState } from "react";
import formatDate from "../../utils/formatDate.js";
import styles from "../../styles/PodcastCardDetail.module.css";
import detailBackground from "../../assets/svg.png";

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

  useEffect(() => {
    setSelectedSeasonIndex(0);
    setIsSeasonMenuOpen(false);
  }, [podcast.id]);

  useEffect(() => {
    if (selectedSeasonIndex > seasons.length - 1) {
      setSelectedSeasonIndex(Math.max(seasons.length - 1, 0));
    }
  }, [selectedSeasonIndex, seasons.length]);

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
        <a href="../">&larr; Back to all podcasts</a>
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
