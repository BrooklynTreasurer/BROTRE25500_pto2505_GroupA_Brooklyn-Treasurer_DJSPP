import { useEffect, useRef, useState } from "react";
import { useAudioPlayerStore } from "../../store/audioPlayerStore.js";
import { useFavouritesStore } from "../../store/favouritesStore.js";

const PLAYBACK_RATES = [1, 1.25, 1.5, 2];

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatRate(rate) {
  if (Number.isInteger(rate)) {
    return `${rate.toFixed(1)}x`;
  }

  return `${String(rate).replace(/0+$/, "").replace(/\.$/, "")}x`;
}

/**
 * Pause other playing audio or video elements when the global player starts.
 *
 * @param {HTMLMediaElement} activeElement
 */
function pauseOtherMediaElements(activeElement) {
  const mediaElements = document.querySelectorAll("audio, video");
  mediaElements.forEach((mediaElement) => {
    if (mediaElement !== activeElement && !mediaElement.paused) {
      mediaElement.pause();
    }
  });
}

/**
 * Persistent audio player dock rendered once at the application root.
 *
 * @returns {JSX.Element|null}
 */
export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [pendingSeekTime, setPendingSeekTime] = useState(null);
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    pause,
    setCurrentTime,
    setDuration,
    updateListeningHistory,
  } = useAudioPlayerStore();
  const updateFavouriteProgress = useFavouritesStore((state) => state.updateFavouriteProgress);
  const lastProgressUpdate = useRef(0);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack?.src) return;

    const currentSrc = audioElement.getAttribute("src");
    const shouldLoadSource = currentSrc !== currentTrack.src;
    const resumeTime = Math.max(0, Number(currentTime) || 0);

    if (shouldLoadSource) {
      audioElement.src = currentTrack.src;
      if (resumeTime > 0) {
        const setStartTime = () => {
          audioElement.currentTime = Math.min(resumeTime, audioElement.duration || resumeTime);
          audioElement.removeEventListener("loadedmetadata", setStartTime);
        };
        audioElement.addEventListener("loadedmetadata", setStartTime);
      } else {
        audioElement.currentTime = 0;
      }
    }
  }, [currentTrack?.src, currentTime]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack?.src) return;

    if (isPlaying) {
      pauseOtherMediaElements(audioElement);
      audioElement.play().catch(() => {
        pause();
      });
    } else {
      audioElement.pause();
    }
  }, [currentTrack?.src, isPlaying, pause]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return undefined;

    const handleTimeUpdate = () => {
      const current = audioElement.currentTime || 0;
      setCurrentTime(current);

      const trackId = currentTrack?.id || currentTrack?.src;
      const safeDuration = audioElement.duration || 0;
      const isIntervalPassed = Math.abs(current - lastProgressUpdate.current) >= 5;
      if (trackId && safeDuration > 0 && isIntervalPassed) {
        lastProgressUpdate.current = current;
        updateFavouriteProgress(trackId, current, safeDuration);
        updateListeningHistory(trackId, current, safeDuration);
      }
    };

    const handleDurationChange = () => {
      setDuration(audioElement.duration || 0);
      setCurrentTime(audioElement.currentTime || 0);
    };

    const handleSeeked = () => {
      const current = audioElement.currentTime || 0;
      setCurrentTime(current);
      setPendingSeekTime(null);

      const trackId = currentTrack?.id || currentTrack?.src;
      const safeDuration = audioElement.duration || 0;
      if (trackId && safeDuration > 0) {
        lastProgressUpdate.current = current;
        updateFavouriteProgress(trackId, current, safeDuration);
        updateListeningHistory(trackId, current, safeDuration);
      }
    };

    const handleEnded = () => {
      const trackId = currentTrack?.id || currentTrack?.src;
      const safeDuration = audioElement.duration || 0;
      if (trackId && safeDuration > 0) {
        updateFavouriteProgress(trackId, safeDuration, safeDuration);
        updateListeningHistory(trackId, safeDuration, safeDuration);
      }
      pause();
    };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("loadedmetadata", handleDurationChange);
    audioElement.addEventListener("durationchange", handleDurationChange);
    audioElement.addEventListener("seeked", handleSeeked);
    audioElement.addEventListener("ended", handleEnded);

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("loadedmetadata", handleDurationChange);
      audioElement.removeEventListener("durationchange", handleDurationChange);
      audioElement.removeEventListener("seeked", handleSeeked);
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, [pause, setCurrentTime, setDuration, currentTrack, updateFavouriteProgress, updateListeningHistory]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume, currentTrack]);

  useEffect(() => {
    return () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    };
  }, []);

  if (!currentTrack?.src) {
    return <audio ref={audioRef} preload="metadata" hidden />;
  }

  const safeDuration = duration > 0 ? duration : 0;
  const safeCurrentTime = safeDuration > 0 ? Math.min(currentTime, safeDuration) : 0;
  const displayCurrentTime = pendingSeekTime !== null ? pendingSeekTime : safeCurrentTime;
  const isSeekDisabled = safeDuration <= 0;

  const updateCurrentTime = (nextTime) => {
    const numericTime = Number(nextTime);
    const safeTime = Math.min(safeDuration, Math.max(0, numericTime || 0));
    const audioElement = audioRef.current;

    if (audioElement) {
      if (audioElement.readyState >= 1) {
        audioElement.currentTime = safeTime;
      } else {
        const applyPendingSeek = () => {
          audioElement.currentTime = safeTime;
          audioElement.removeEventListener("loadedmetadata", applyPendingSeek);
        };
        audioElement.addEventListener("loadedmetadata", applyPendingSeek);
      }
    }

    setPendingSeekTime(safeTime);
    setCurrentTime(safeTime);
  };

  const cyclePlaybackRate = () => {
    setPlaybackRate((currentRate) => {
      const currentIndex = PLAYBACK_RATES.indexOf(currentRate);
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % PLAYBACK_RATES.length : 0;
      return PLAYBACK_RATES[nextIndex];
    });
  };

  return (
    <section className="global-audio-player" aria-label="Global audio player">
      <audio ref={audioRef} preload="metadata" />

      {currentTrack.image ? (
        <img
          className="global-audio-player__image"
          src={currentTrack.image}
          alt={currentTrack.title || "Episode artwork"}
        />
      ) : (
        <div className="global-audio-player__placeholder" aria-hidden="true" />
      )}

      <div className="global-audio-player__content">
        <div className="global-audio-player__meta">
          <p className="global-audio-player__subtitle">
            {currentTrack.showTitle || "Podcast"}
          </p>
          <p className="global-audio-player__title">
            {currentTrack.title || "Untitled episode"}
          </p>
        </div>

        <div className="global-audio-player__progress-row">
          <span>{formatTime(displayCurrentTime)}</span>
          <input
            className="global-audio-player__range global-audio-player__seek"
            type="range"
            min={0}
            max={safeDuration || 1}
            step={0.1}
            value={pendingSeekTime !== null ? pendingSeekTime : safeCurrentTime}
            onChange={(event) => updateCurrentTime(event.target.value)}
            onInput={(event) => updateCurrentTime(event.target.value)}
            aria-label="Seek in current episode"
            disabled={isSeekDisabled}
          />
          <span>{formatTime(safeDuration)}</span>
          <label className="global-audio-player__volume-control">
            <span className="global-audio-player__volume-label" aria-hidden="true">
              Vol
            </span>
            <input
              className="global-audio-player__range global-audio-player__volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => {
                setVolume(Math.min(1, Math.max(0, Number(event.target.value) || 0)));
              }}
              aria-label="Adjust player volume"
            />
          </label>
        </div>

        <div className="global-audio-player__controls">
          <button
            type="button"
            className="global-audio-player__control global-audio-player__control--ghost"
            onClick={cyclePlaybackRate}
            aria-label="Change playback speed"
          >
            {formatRate(playbackRate)}
          </button>
          <button
            type="button"
            className="global-audio-player__control global-audio-player__control--ghost"
            onClick={() => updateCurrentTime(safeCurrentTime - 15)}
            aria-label="Rewind 15 seconds"
            disabled={isSeekDisabled}
          >
            {"<< 15"}
          </button>
          <button
            type="button"
            className="global-audio-player__control global-audio-player__control--primary"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause current episode" : "Play current episode"}
          >
            {isPlaying ? "||" : ">"}
          </button>
          <button
            type="button"
            className="global-audio-player__control global-audio-player__control--ghost"
            onClick={() => updateCurrentTime(safeCurrentTime + 15)}
            aria-label="Skip forward 15 seconds"
            disabled={isSeekDisabled}
          >
            {"15 >>"}
          </button>
        </div>
      </div>
    </section>
  );
}
