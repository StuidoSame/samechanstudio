import { FLIGHT_CONSTELLATIONS, getFlightBodies } from "./spaceFlight";
import "./space-flight.css";

const PLANETS = getFlightBodies(1280);

export function CosmicScenery() {
  return (
    <div className="cosmic-intro-scenery" aria-hidden="true">
      <svg className="cosmic-flight-stars" fill="none">
        {Array.from({ length: 144 }, (_, index) => (
          <line key={index} className="cosmic-flight-star" visibility="hidden" />
        ))}
      </svg>
      {FLIGHT_CONSTELLATIONS.map(({ id, points }) => (
        <svg key={id} className="cosmic-flight-plane" fill="none">
          <g data-flight-constellation={id} className="cosmic-intro-constellation" visibility="hidden">
            <polyline />
            {points.map((_, index) => <circle key={index} />)}
          </g>
        </svg>
      ))}
      {PLANETS.map(({ id }) => (
        <span key={id} data-flight-planet={id} className={`cosmic-intro-planet cosmic-intro-planet--${id}`}>
          <span className="cosmic-intro-planet-sphere" />
        </span>
      ))}
    </div>
  );
}
