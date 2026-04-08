import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPodcastDetails } from "../api/fetchPodcastDetails.js";
import { fetchGenreNames } from "../api/fetchGenre.js";
import PodcastCardDetail from "../components/Podcasts/PodcastCardDetail.jsx";
import loadingCat from "../assets/loading-cat.mp4";

/**
 * ShowDetail page component.
 * @returns {JSX.Element}
 */
function ShowDetail() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [genreNames, setGenreNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);
    setError(null);
    setGenreNames([]);

    /**
     * Loads the selected show and resolves display-ready genre names.
     * @returns {Promise<void>}
     */
    const loadShowDetail = async () => {
      try {
        const data = await fetchPodcastDetails(id);
        if (isCancelled) return;

        setShow(data);

        const names = await fetchGenreNames(data.genres || []);
        if (isCancelled) return;

        setGenreNames(names);
      } catch (err) {
        if (isCancelled) return;
        setError(err.message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadShowDetail();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="loader-container" aria-live="polite">
        <video
          src={loadingCat}
          autoPlay
          loop
          muted
          playsInline
          className="loader-video"
        />
      </div>
    );
  }
  if (error) return <p>Error: {error}</p>;
  if (!show) return <p>Show not found.</p>;

  return <PodcastCardDetail key={show.id} podcast={show} genreNames={genreNames} />;
}

export default ShowDetail;
