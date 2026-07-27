"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type IPhoneFrameProps = {
  children?: ReactNode;
};

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={stageRef} className="device-phone-stage" aria-label="Interactive iPhone moment">
      <div className="device-phone-frame">
        <span className="device-phone-button device-phone-button--action" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-up" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-down" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--power" aria-hidden="true" />
        <div className="device-screen device-phone-screen">
          {children ?? (
            <div className={`phone-daily-experience${hasEntered ? " is-entered" : ""}`}>
              <div className="phone-daily-splash">
                <Image
                  className="phone-daily-logo"
                  src="/assets/favicon/favicon.ico"
                  alt="SAME STUDIO"
                  width={64}
                  height={64}
                  priority
                  unoptimized
                />
                <span>SAME STUDIO</span>
              </div>
              <div className="phone-daily-content" aria-hidden="true" />
            </div>
          )}
        </div>
        <span className="device-phone-island" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
