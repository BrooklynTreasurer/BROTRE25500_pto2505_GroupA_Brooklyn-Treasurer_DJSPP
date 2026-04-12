import { create } from "zustand";

const STORAGE_KEY = "podcastAppFavourites";

/**
 * Load the persisted favourites list from local storage.
 * @returns {Array<object>}
 */
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

/**
 * Persist the favourites list to local storage.
 * @param {Array<object>} favourites
 */
function persistFavourites(favourites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  } catch {
    // ignore write failures
  }
}

/**
 * Zustand store for favourite episodes and listening progress state.
 */
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
      finished: false,
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
          finished: favourites[existingIndex].finished || false,
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
        const safeDuration = Math.max(
          0,
          Number(duration) || Number(item.duration) || 0,
        );
        const progress = safeDuration > 0
          ? Math.min(100, Math.round((safePlayedTime / safeDuration) * 100))
          : item.progress || 0;

        return {
          ...item,
          playedTime: safePlayedTime,
          duration: safeDuration,
          progress,
          finished: progress >= 100,
        };
      });

      persistFavourites(favourites);
      return { favourites };
    });
  },

  resetListeningHistory: () => {
    set((state) => {
      const favourites = state.favourites.map((item) => ({
        ...item,
        playedTime: 0,
        progress: 0,
        finished: false,
      }));
      persistFavourites(favourites);
      return { favourites };
    });
  },

  setSortKey: (sortKey) => set({ sortKey }),
}));
