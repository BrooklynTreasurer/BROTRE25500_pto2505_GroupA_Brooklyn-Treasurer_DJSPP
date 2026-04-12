import { create } from "zustand";

const STORAGE_KEY = "podcastAppAudioState";

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

const initialAudioState = loadAudioState();

export const useAudioPlayerStore = create((set, get) => ({
  currentTrack: initialAudioState.currentTrack || null,
  isPlaying: false,
  currentTime: Math.max(0, Number(initialAudioState.currentTime) || 0),
  duration: Math.max(0, Number(initialAudioState.duration) || 0),

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
