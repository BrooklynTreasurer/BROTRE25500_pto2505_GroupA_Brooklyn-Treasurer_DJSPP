import { create } from "zustand";

const STORAGE_KEY = "podcastAppFavourites";

function loadFavourites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistFavourites(favourites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  } catch {
    // ignore write failures
  }
}

export const useFavouritesStore = create((set, get) => ({
  favourites: loadFavourites(),
  sortKey: "addedAt-desc",

  addFavourite: (episode) => {
    if (!episode?.src) return;

    const nextEpisode = {
      id: episode.id || episode.src,
      src: episode.src,
      title: episode.title || "Untitled episode",
      showTitle: episode.showTitle || "Podcast",
      image: episode.image || "",
      description: episode.description || "",
      addedAt: new Date().toISOString(),
    };

    set((state) => {
      const existingIndex = state.favourites.findIndex(
        (item) => item.id === nextEpisode.id || item.src === nextEpisode.src,
      );
      const favourites = [...state.favourites];

      if (existingIndex !== -1) {
        favourites[existingIndex] = {
          ...favourites[existingIndex],
          ...nextEpisode,
          addedAt: favourites[existingIndex].addedAt || nextEpisode.addedAt,
        };
      } else {
        favourites.push(nextEpisode);
      }

      persistFavourites(favourites);
      return { favourites };
    });
  },

  removeFavourite: (identifier) => {
    set((state) => {
      const favourites = state.favourites.filter(
        (item) => item.id !== identifier && item.src !== identifier,
      );
      persistFavourites(favourites);
      return { favourites };
    });
  },

  setSortKey: (sortKey) => set({ sortKey }),
}));
