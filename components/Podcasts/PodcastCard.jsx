import formatDate from "../../utils/formatDate.js";
import { GenreService } from "../../utils/genreService.js";

/**
 * Displays one podcast card.
 * @param {Object} props - Component props.
 * @param {Object} props.podcast - Podcast data.
 * @returns {JSX.Element}
 */
export default function PodcastCard({ podcast }) {
  const safePodcast = podcast ?? {};
  const genres = GenreService.getNames(safePodcast.genres).slice(0, 2).join(" | ");
  const title = safePodcast.title || "Untitled podcast";
  const image = safePodcast.image || "";
  const description = safePodcast.description || "No description available.";
  const seasons = Number(safePodcast.seasons) || 0;
  const updated = safePodcast.updated ? formatDate(safePodcast.updated) : "Unknown date";

  return (
    <article className="podcast-card" style={{ "--bg": `url(${image})` }}>
      <img className="podcast-image" src={image} alt={title} />
      <p className="podcast-date">{updated}</p>
      <h3 className="podcast-title">{title}</h3>
      <p className="podcast-description">{description}</p>

      <div className="podcast-meta">
        <span>{seasons} seasons</span>
        <span>{genres}</span>
      </div>
    </article>
  );
}
