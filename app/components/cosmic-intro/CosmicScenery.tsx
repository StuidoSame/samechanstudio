import "./cosmic-scenery.css";

const CONSTELLATIONS = [
  {
    name: "north",
    points: [[12, 72], [54, 36], [98, 52], [144, 16], [188, 34], [228, 8]],
  },
  {
    name: "south",
    points: [[14, 18], [58, 44], [100, 20], [144, 64], [190, 42], [226, 78]],
  },
] as const;

const PLANETS = ["distant", "atmosphere", "ice", "moon", "gas", "rocky"] as const;

export function CosmicScenery() {
  return (
    <div className="cosmic-intro-scenery" aria-hidden="true">
      {CONSTELLATIONS.map(({ name, points }) => (
        <svg
          key={name}
          className={`cosmic-intro-constellation cosmic-intro-constellation--${name}`}
          viewBox="0 0 240 90"
          fill="none"
        >
          <polyline points={points.map(([x, y]) => `${x},${y}`).join(" ")} />
          {points.map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index % 2 === 0 ? 1.8 : 1.2} />
          ))}
        </svg>
      ))}
      {PLANETS.map((planet) => (
        <span key={planet} className={`cosmic-intro-planet cosmic-intro-planet--${planet}`}>
          <span className="cosmic-intro-planet-sphere" />
        </span>
      ))}
    </div>
  );
}
