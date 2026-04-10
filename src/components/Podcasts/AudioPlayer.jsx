import { useEffect, useRef, useState } from "react";
import { useAudioPlayerStore } from "../../store/audioPlayerStore.js";

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

function pauseOtherMediaElements(activeElement) {
  const mediaElements = document.querySelectorAll("audio, video");
  mediaElements.forEach((mediaElement) => {
    if (mediaElement !== activeElement && !mediaElement.paused) {
      mediaElement.pause();
    }
  });
}

/**
 * Persistent player dock rendered once at application root.
 * @returns {JSX.Element|null}
 */
export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    pause,
    setCurrentTime,
    setDuration,
  } = useAudioPlayerStore();

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack?.src) return;

    const currentSrc = audioElement.getAttribute("src");
    if (currentSrc !== currentTrack.src) {
      audioElement.src = currentTrack.src;
      audioElement.currentTime = 0;
    }

    if (isPlaying) {
      pauseOtherMediaElements(audioElement);
      audioElement.play().catch(() => {
        pause();
      });
    } else {
      audioElement.pause();
    }
  }, [currentTrack, isPlaying, pause]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return undefined;

    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime || 0);
    const handleDurationChange = () => setDuration(audioElement.duration || 0);

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("loadedmetadata", handleDurationChange);
    audioElement.addEventListener("durationchange", handleDurationChange);
    audioElement.addEventListener("ended", pause);

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("loadedmetadata", handleDurationChange);
      audioElement.removeEventListener("durationchange", handleDurationChange);
      audioElement.removeEventListener("ended", pause);
    };
  }, [pause, setCurrentTime, setDuration]);

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
  const isSeekDisabled = safeDuration <= 0;

  const updateCurrentTime = (nextTime) => {
    const safeTime = Math.min(safeDuration, Math.max(0, Number(nextTime) || 0));
    if (audioRef.current) {
      audioRef.current.currentTime = safeTime;
    }
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
          <span>{formatTime(safeCurrentTime)}</span>
          <input
            className="global-audio-player__range global-audio-player__seek"
            type="range"
            min={0}
            max={safeDuration || 1}
            step={1}
            value={safeCurrentTime}
            onChange={(event) => {
              updateCurrentTime(event.target.value);
            }}
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
          <button
            type="button"
            className="global-audio-player__control global-audio-player__control--ghost global-audio-player__control--dots"
            aria-label="More player options"
          >
            ...
          </button>
        </div>
      </div>
    </section>
  );
}
