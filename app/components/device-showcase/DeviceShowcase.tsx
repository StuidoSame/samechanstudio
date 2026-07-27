import { DeviceSection } from "./DeviceSection";
import { IPhoneFrame } from "./IPhoneFrame";
import { IPadFrame } from "./IPadFrame";
import { WatchGroup } from "./WatchGroup";

const phoneCopy = {
  index: "01",
  category: "PHONE",
  title: "Close to you.",
  body: "Made for everyday moments.\nSmall experiences designed\nto stay close at hand.",
};

const tabletCopy = {
  index: "02",
  category: "TABLET",
  title: "Room to think.",
  body: "A small puzzle for a quieter moment.\nOne simple pattern, refreshed each day.",
};

const watchCopy = {
  index: "03",
  category: "WATCH",
  title: "Tap into rhythm.",
  body: "Three small screens.\nOne quick beat.",
};

export function DeviceShowcase() {
  return (
    <section
      className="device-showcase"
      aria-label="SAME STUDIO device showcase"
    >
      <div className="device-journey-decoration" aria-hidden="true" />
      <div className="device-showcase-inner">
        <DeviceSection
          {...phoneCopy}
          className="device-showcase-phone"
          cosmosVariant="phone"
          device={<IPhoneFrame />}
        />
        <DeviceSection
          {...tabletCopy}
          className="device-showcase-tablet"
          cosmosVariant="tablet"
          device={<IPadFrame />}
          reversed
        />
        <DeviceSection
          {...watchCopy}
          className="device-showcase-watch"
          cosmosVariant="watch"
          device={<WatchGroup />}
        />
      </div>
    </section>
  );
}
