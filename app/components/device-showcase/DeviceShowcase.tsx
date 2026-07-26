import { DeviceSection } from "./DeviceSection";
import { IPhoneFrame } from "./IPhoneFrame";

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

export function DeviceShowcase() {
  return (
    <div className="device-showcase" aria-label="SAME STUDIO device showcase">
      <div className="device-showcase-inner">
        <DeviceSection
          {...phoneCopy}
          className="device-showcase-phone"
          device={<IPhoneFrame />}
        />
      </div>
    </div>
  );
}
