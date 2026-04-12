import { useMemo } from "react";
import { Link } from "react-router-dom";
import ReactSlickModule from "react-slick";
import { GenreService } from "../../utils/genreService.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SliderComponent =
  (typeof ReactSlickModule === "function" && ReactSlickModule) ||
  (typeof ReactSlickModule?.default === "function" && ReactSlickModule.default) ||
  (typeof ReactSlickModule?.default?.default === "function" &&
    ReactSlickModule.default.default) ||
  null;

function pickRecommendedPodcasts(podcasts, maxShows) {
  const pool = Array.isArray(podcasts)
    ? podcasts.filter(
        (podcast) =>
          podcast && typeof podcast === "object" && podcast.id != null
      )
    : [];

  const scoredPodcasts = [...pool].sort((podcastA, podcastB) => {
    const updatedA = Number.isFinite(new Date(podcastA.updated).getTime())
      ? new Date(podcastA.updated).getTime()
      : 0;
    const updatedB = Number.isFinite(new Date(podcastB.updated).getTime())
      ? new Date(podcastB.updated).getTime()
      : 0;

    if (updatedB !== updatedA) return updatedB - updatedA;

    const seasonsA = Number(podcastA.seasons) || 0;
    const seasonsB = Number(podcastB.seasons) || 0;
    if (seasonsB !== seasonsA) return seasonsB - seasonsA;

    return (podcastA.title || "").localeCompare(podcastB.title || "");
  });

  return scoredPodcasts.slice(0, Math.min(maxShows, scoredPodcasts.length));
}

/**
 * Renders a carousel of recommended podcasts.
 * @param {Object} props - Component props.
 * @param {Object[]} props.podcasts - List of available podcasts.
 * @param {number} [props.maxShows] - Maximum number of recommended podcasts to display.
 * @returns {JSX.Element|null}
 */
export default function PodcastCarousel({ podcasts = [], maxShows = 8 }) {
  const recommendedPodcasts = useMemo(
    () => pickRecommendedPodcasts(podcasts, maxShows),
    [podcasts, maxShows]
  );

  if (recommendedPodcasts.length === 0) return null;
  if (!SliderComponent) return null;

  const settings = {
    dots: recommendedPodcasts.length > 1,
    infinite: recommendedPodcasts.length > 1,
    speed: 500,
    arrows: recommendedPodcasts.length > 1,
    adaptiveHeight: true,
    slidesToShow: Math.min(4, recommendedPodcasts.length),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(4, recommendedPodcasts.length),
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, recommendedPodcasts.length),
        },
      },
      {
        breakpoint: 820,
        settings: {
          slidesToShow: Math.min(2, recommendedPodcasts.length),
          arrows: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };

  return (
    <section className="recommended-carousel-section" aria-label="Recommended podcasts">
      <div className="recommended-carousel-header">
        <h2 className="recommended-carousel-title">Recommended Podcasts</h2>
        <span className="recommended-carousel-more" aria-hidden="true">
          &rsaquo;
        </span>
      </div>
      <div className="recommended-carousel-shell">
        <SliderComponent {...settings}>
          {recommendedPodcasts.map((podcast) => {
            const genreText = GenreService.getNames(podcast.genres)
              .slice(0, 2)
              .join(" | ");

            return (
              <div key={podcast.id} className="recommended-carousel-slide">
                <Link
                  to={`/show/${podcast.id}`}
                  className="recommended-podcast-link"
                  aria-label={`Open ${podcast.title || "podcast"}`}
                >
                  <article className="recommended-podcast-card">
                    <img
                      className="recommended-podcast-image"
                      src={podcast.image || ""}
                      alt={podcast.title || "Podcast cover"}
                      loading="lazy"
                    />
                    <h3 className="recommended-podcast-title">
                      {podcast.title || "Untitled podcast"}
                    </h3>
                    <div className="recommended-podcast-genres">
                      {genreText && <span>{genreText}</span>}
                    </div>
                  </article>
                </Link>
              </div>
            );
          })}
        </SliderComponent>
      </div>
    </section>
  );
}
