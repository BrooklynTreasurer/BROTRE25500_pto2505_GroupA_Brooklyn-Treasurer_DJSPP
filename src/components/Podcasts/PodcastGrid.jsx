import PodcastCard from "./PodcastCard.jsx";
import { Link } from "react-router-dom";

/**
 * Renders a responsive grid of podcast cards.
 * @param {Object} props - Component props.
 * @param {Object[]} props.podcasts - List of podcasts.
 * @returns {JSX.Element}
 */

export default function PodcastGrid({ podcasts }) {

  return (
    <div className="podcast-grid">
      {podcasts.map(podcast => (
        <Link key={podcast.id} to={`/show/${podcast.id}`} className="podcast-link">
        <PodcastCard podcast={podcast}/>
        </Link>
      ))}
    </div>
  );
}
