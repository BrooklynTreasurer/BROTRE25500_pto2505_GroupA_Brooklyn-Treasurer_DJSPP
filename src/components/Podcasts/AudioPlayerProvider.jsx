import { useEffect } from "react";
import AudioPlayer from "./AudioPlayer.jsx";
import { useAudioPlayerStore } from "../../store/audioPlayerStore.js";

export default function AudioPlayerProvider({ children }) {
  const currentTrack = useAudioPlayerStore((state) => state.currentTrack);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!currentTrack?.src) {
        return;
      }

      const message = "Your audio playback is active. Are you sure you want to leave?";
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentTrack]);

  return (
    <>
      <div className="audio-player-provider">{children}</div>
      <AudioPlayer />
    </>
  );
}
