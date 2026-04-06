import formatDate from "../../utils/formatDate.js";
import { GenreService } from "../../utils/genreService.js";

/**
 * Displays one podcast card.
 * @param {Object} props - Component props.
 * @param {Object} props.podcast - Podcast data.
 * @returns {JSX.Element}
 */
export default function PodcastCard({ podcast }) {
  const genres = GenreService.getNames(podcast.genres).slice(0, 2).join(" | ");

  return (
    <article className="podcast-card" style={{ "--bg": `url(${podcast.image})` }}>
      <img className="podcast-image" src={podcast.image} alt={podcast.title} />
      <p className="podcast-date">{formatDate(podcast.updated)}</p>
      <h3 className="podcast-title">{podcast.title}</h3>
      <p className="podcast-description">{podcast.description}</p>

      <div className="podcast-meta">
        <span>{podcast.seasons} seasons</span>
        <span>{genres}</span>
      </div>
    </article>
  );
}
