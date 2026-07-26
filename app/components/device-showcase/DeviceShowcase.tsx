import { DeviceSection } from "./DeviceSection";
import { IPhoneFrame } from "./IPhoneFrame";
import { IPadFrame } from "./IPadFrame";

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

export function DeviceShowcase() {
  return (
    <div className="device-showcase" aria-label="SAME STUDIO device showcase">
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
      </div>
    </div>
  );
}
