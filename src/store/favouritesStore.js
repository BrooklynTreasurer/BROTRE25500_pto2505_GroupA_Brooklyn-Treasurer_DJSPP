import { create } from "zustand";

const STORAGE_KEY = "podcastAppFavourites";

function loadFavourites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
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
      playedTime: 0,
      duration: 0,
      progress: 0,
    };

    set((state) => {
      const existingIndex = state.favourites.findIndex(
        (item) => item.id === nextEpisode.id,
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
        (item) => item.id !== identifier,
      );
      persistFavourites(favourites);
      return { favourites };
    });
  },

  updateFavouriteProgress: (identifier, playedTime, duration) => {
    set((state) => {
      const favourites = state.favourites.map((item) => {
        if (item.id !== identifier && item.src !== identifier) {
          return item;
        }

        const safePlayedTime = Math.max(0, Number(playedTime) || 0);
        const safeDuration = Math.max(0, Number(duration) || 0);
        const progress = safeDuration > 0
          ? Math.min(100, Math.round((safePlayedTime / safeDuration) * 100))
          : item.progress || 0;

        return {
          ...item,
          playedTime: safePlayedTime,
          duration: safeDuration,
          progress,
        };
      });

      persistFavourites(favourites);
      return { favourites };
    });
  },

  setSortKey: (sortKey) => set({ sortKey }),
}));
