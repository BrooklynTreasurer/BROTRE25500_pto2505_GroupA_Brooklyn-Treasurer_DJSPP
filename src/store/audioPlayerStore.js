import { create } from "zustand";

/**
 * Global audio player state managed by Zustand.
 * Track source and playback metadata remain alive across route changes.
 */
export const useAudioPlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,

  playTrack: (track) => {
    if (!track?.src) return;

    const previousTrack = get().currentTrack;
    const isNewTrack = previousTrack?.src !== track.src;

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: isNewTrack ? 0 : get().currentTime,
      duration: isNewTrack ? 0 : get().duration,
    });
  },

  togglePlayPause: () => {
    if (!get().currentTrack?.src) return;
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  pause: () => set({ isPlaying: false }),

  setCurrentTime: (currentTime) =>
    set({ currentTime: Math.max(0, Number(currentTime) || 0) }),

  setDuration: (duration) =>
    set({ duration: Math.max(0, Number(duration) || 0) }),
}));
