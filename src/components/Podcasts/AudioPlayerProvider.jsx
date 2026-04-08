import AudioPlayer from "./AudioPlayer.jsx";

export default function AudioPlayerProvider({ children }) {
  return (
    <>
      <div className="audio-player-provider">{children}</div>
      <AudioPlayer />
    </>
  );
}
