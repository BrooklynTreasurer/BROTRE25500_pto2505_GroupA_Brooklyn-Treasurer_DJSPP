import { create } from "zustand";

const STORAGE_KEY = "podcastAppAudioState";
const HISTORY_KEY = "podcastAppListeningHistory";

/**
 * Load the persisted audio player session from local storage.
 * @returns {{currentTrack?: object|null, currentTime?: number, duration?: number}}
 */
function loadAudioState() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/**
 * Persist the current audio player session state to local storage.
 * @param {object} state
 */
function persistAudioState(state) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload = {
      currentTrack: state.currentTrack,
      currentTime: state.currentTime,
      duration: state.duration,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore write failures
  }
}

/**
 * Load the listening history cache from local storage.
 * @returns {Record<string, {playedTime:number,duration:number,progress:number,finished:boolean}>}
 */
function loadListeningHistory() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Persist the listening history cache to local storage.
 * @param {Record<string, object>} history
 */
function persistListeningHistory(history) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore write failures
  }
}

const initialAudioState = loadAudioState();
const initialListeningHistory = loadListeningHistory();

/**
 * Zustand store for global audio playback state and listening history.
 */
export const useAudioPlayerStore = create((set, get) => ({
  currentTrack: initialAudioState.currentTrack || null,
  isPlaying: false,
  currentTime: Math.max(0, Number(initialAudioState.currentTime) || 0),
  duration: Math.max(0, Number(initialAudioState.duration) || 0),
  listeningHistory: initialListeningHistory,

  playTrack: (track) => {
    if (!track?.src) return;

    const previousTrack = get().currentTrack;
    const isSameTrack =
      (track.id && previousTrack?.id && previousTrack.id === track.id) ||
      previousTrack?.src === track.src;

    const requestedStart = Number(track.startTime);
    const startTime = Number.isFinite(requestedStart)
      ? Math.max(0, requestedStart)
      : isSameTrack
      ? get().currentTime
      : 0;

    const nextState = {
      currentTrack: track,
      isPlaying: true,
      currentTime: startTime,
      duration: isSameTrack ? get().duration : 0,
    };

    persistAudioState(nextState);
    set(nextState);
  },

  togglePlayPause: () => {
    const state = get();
    if (!state.currentTrack?.src) return;

    const nextState = {
      currentTrack: state.currentTrack,
      currentTime: state.currentTime,
      duration: state.duration,
    };

    persistAudioState(nextState);
    set({ isPlaying: !state.isPlaying });
  },

  pause: () => {
    const state = get();
    persistAudioState({
      currentTrack: state.currentTrack,
      currentTime: state.currentTime,
      duration: state.duration,
    });
    set({ isPlaying: false });
  },

  setCurrentTime: (currentTime) =>
    set((state) => {
      const nextCurrentTime = Math.max(0, Number(currentTime) || 0);
      const nextState = {
        currentTrack: state.currentTrack,
        currentTime: nextCurrentTime,
        duration: state.duration,
      };
      persistAudioState(nextState);
      return { currentTime: nextCurrentTime };
    }),

  setDuration: (duration) =>
    set((state) => {
      const nextDuration = Math.max(0, Number(duration) || 0);
      const nextState = {
        currentTrack: state.currentTrack,
        currentTime: state.currentTime,
        duration: nextDuration,
      };
      persistAudioState(nextState);
      return { duration: nextDuration };
    }),

  updateListeningHistory: (identifier, playedTime, duration) =>
    set((state) => {
      if (!identifier) return state;

      const safePlayedTime = Math.max(0, Number(playedTime) || 0);
      const safeDuration = Math.max(0, Number(duration) || 0);
      const progress = safeDuration > 0
        ? Math.min(100, Math.round((safePlayedTime / safeDuration) * 100))
        : state.listeningHistory[identifier]?.progress || 0;
      const finished = progress >= 100;

      const nextHistory = {
        ...state.listeningHistory,
        [identifier]: {
          ...state.listeningHistory[identifier],
          playedTime: safePlayedTime,
          duration: safeDuration,
          progress,
          finished,
        },
      };

      persistListeningHistory(nextHistory);
      return { listeningHistory: nextHistory };
    }),

  resetListeningHistory: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(HISTORY_KEY);
    }
    set({ listeningHistory: {} });
  },

  resetAudioState: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  },
}));
