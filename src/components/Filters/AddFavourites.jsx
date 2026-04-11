import { useMemo } from "react";
import { useFavouritesStore } from "../../store/favouritesStore.js";

export default function AddFavourites({ episode }) {
  const favourites = useFavouritesStore((state) => state.favourites);
  const addFavourite = useFavouritesStore((state) => state.addFavourite);
  const removeFavourite = useFavouritesStore((state) => state.removeFavourite);

  const identifier = useMemo(
    () => episode?.src || episode?.id || "",
    [episode],
  );

  const isFavourite = favourites.some(
    (item) => item.id === identifier || item.src === identifier,
  );

  const handleToggle = () => {
    if (isFavourite) {
      removeFavourite(identifier);
      return;
    }

    addFavourite(episode);
  };

  return (
    <button
      type="button"
      className="episode-favourite-button"
      onClick={handleToggle}
      disabled={!episode?.src}
      aria-pressed={isFavourite}
    >
      {isFavourite ? "❤️" : "🤍"}
    </button>
  );
}
