import { WatchFrame } from "./WatchFrame";

export function WatchGroup() {
  return (
    <div className="device-watch-stage" aria-label="Three empty Apple Watch frames">
      <div className="device-watch-group">
        <WatchFrame variant="left" />
        <WatchFrame variant="center" />
        <WatchFrame variant="right" />
      </div>
    </div>
  );
}
