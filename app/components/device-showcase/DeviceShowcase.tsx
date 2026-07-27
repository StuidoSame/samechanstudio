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
  body: "A little more space for ideas,\nmemories, and everything in between.",
};

const watchCopy = {
  index: "03",
  category: "WATCH",
  title: "Small, but present.",
  body: "Sometimes a glance is all you need.\nThe smallest screen can still hold\na thoughtful moment.",
};

export function DeviceShowcase() {
  return (
    <section
      className="device-showcase"
      id="about"
      aria-label="SAME STUDIO device showcase"
    >
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
