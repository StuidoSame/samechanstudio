import { DeviceSection } from "./DeviceSection";
import { IPhoneFrame } from "./IPhoneFrame";
import { IPadFrame } from "./IPadFrame";
import { WatchGroup } from "./WatchGroup";

const phoneCopy = {
  index: "01",
  category: "PHONE",
  title: "Close to you.",
  body: (
    <p>
      Made for everyday moments.
      <br />
      Small experiences designed
      <br />
      to stay close at hand.
    </p>
  ),
};

const tabletCopy = {
  index: "02",
  category: "TABLET",
  title: "Room to think.",
  body: (
    <p>
      A little more space for ideas,
      <br />
      memories, and everything in between.
    </p>
  ),
};

const watchCopy = {
  index: "03",
  category: "WATCH",
  title: "Small, but present.",
  body: (
    <p>
      Sometimes a glance is all you need.
      <br />
      The smallest screen can still hold
      <br />
      a thoughtful moment.
    </p>
  ),
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
          device={<IPhoneFrame />}
        />
        <DeviceSection
          {...tabletCopy}
          className="device-showcase-tablet"
          device={<IPadFrame />}
          reversed
        />
        <DeviceSection
          {...watchCopy}
          className="device-showcase-watch"
          device={<WatchGroup />}
        />
      </div>
    </section>
  );
}
