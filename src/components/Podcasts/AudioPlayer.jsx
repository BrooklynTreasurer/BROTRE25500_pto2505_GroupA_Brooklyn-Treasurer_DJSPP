import { useEffect, useRef } from "react";
import { useAudioPlayerStore } from "../../store/audioPlayerStore.js";

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

/**
 * Persistent player dock rendered once at application root.
 * @returns {JSX.Element|null}
 */
export default function AudioPlayer() {
  const audioRef = useRef(null);
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

  if (!currentTrack?.src) {
    return <audio ref={audioRef} preload="metadata" hidden />;
  }

  const safeDuration = duration > 0 ? duration : 0;
  const safeCurrentTime = safeDuration > 0 ? Math.min(currentTime, safeDuration) : 0;

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

      <div className="global-audio-player__meta">
        <p className="global-audio-player__title">{currentTrack.title || "Untitled episode"}</p>
        <p className="global-audio-player__subtitle">
          {currentTrack.showTitle || "Podcast"}
        </p>
      </div>

      <button
        type="button"
        className="global-audio-player__button"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause current episode" : "Play current episode"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <div className="global-audio-player__timeline">
        <span>{formatTime(safeCurrentTime)}</span>
        <input
          type="range"
          min={0}
          max={safeDuration || 0}
          step={1}
          value={safeCurrentTime}
          onChange={(event) => {
            const nextTime = Math.max(0, Number(event.target.value) || 0);
            if (audioRef.current) {
              audioRef.current.currentTime = nextTime;
            }
            setCurrentTime(nextTime);
          }}
          aria-label="Seek in current episode"
        />
        <span>{formatTime(safeDuration)}</span>
      </div>
    </section>
  );
}
