type SectionCosmosVariant =
  | "hero"
  | "about"
  | "phone"
  | "tablet"
  | "watch"
  | "contact";

type SectionCosmosProps = {
  variant: SectionCosmosVariant;
};

type Constellation = {
  path: string;
  points: Array<[number, number]>;
};

type CosmosComposition = {
  constellations: Constellation[];
  orbitCount: number;
  starCount: number;
  dotCount: number;
  diamondCount: number;
};

const COSMOS_COMPOSITIONS: Record<SectionCosmosVariant, CosmosComposition> = {
  hero: {
    constellations: [
      {
        path: "M8 62 L34 38 L63 49 L91 17 L126 31 L154 9",
        points: [[8, 62], [34, 38], [63, 49], [91, 17], [126, 31], [154, 9]],
      },
      {
        path: "M10 13 L36 28 L61 10 L87 36 L115 23 L140 51 L160 37",
        points: [[10, 13], [36, 28], [61, 10], [87, 36], [115, 23], [140, 51], [160, 37]],
      },
    ],
    orbitCount: 1,
    starCount: 4,
    dotCount: 4,
    diamondCount: 2,
  },
  about: {
    constellations: [
      {
        path: "M9 20 L31 47 L62 35 L86 58 L118 28 L143 39 L160 15",
        points: [[9, 20], [31, 47], [62, 35], [86, 58], [118, 28], [143, 39], [160, 15]],
      },
    ],
    orbitCount: 1,
    starCount: 3,
    dotCount: 3,
    diamondCount: 1,
  },
  phone: {
    constellations: [
      {
        path: "M12 18 L43 31 L69 12 L98 47 L132 37 L157 62",
        points: [[12, 18], [43, 31], [69, 12], [98, 47], [132, 37], [157, 62]],
      },
    ],
    orbitCount: 1,
    starCount: 3,
    dotCount: 2,
    diamondCount: 1,
  },
  tablet: {
    constellations: [
      {
        path: "M10 55 L39 27 L72 43 L104 16 L130 28 L158 12",
        points: [[10, 55], [39, 27], [72, 43], [104, 16], [130, 28], [158, 12]],
      },
    ],
    orbitCount: 1,
    starCount: 3,
    dotCount: 2,
    diamondCount: 1,
  },
  watch: {
    constellations: [
      {
        path: "M9 25 L37 49 L68 32 L96 57 L128 26 L157 39",
        points: [[9, 25], [37, 49], [68, 32], [96, 57], [128, 26], [157, 39]],
      },
    ],
    orbitCount: 1,
    starCount: 3,
    dotCount: 2,
    diamondCount: 1,
  },
  contact: {
    constellations: [
      {
        path: "M11 58 L38 33 L68 45 L96 19 L124 38 L157 14",
        points: [[11, 58], [38, 33], [68, 45], [96, 19], [124, 38], [157, 14]],
      },
      {
        path: "M8 17 L32 41 L58 30 L82 55 L111 35 L137 48 L160 22",
        points: [[8, 17], [32, 41], [58, 30], [82, 55], [111, 35], [137, 48], [160, 22]],
      },
    ],
    orbitCount: 2,
    starCount: 3,
    dotCount: 3,
    diamondCount: 1,
  },
};

const ORDINALS = ["one", "two", "three", "four"] as const;

export function SectionCosmos({ variant }: SectionCosmosProps) {
  const composition = COSMOS_COMPOSITIONS[variant];

  return (
    <div
      className={`section-cosmos section-cosmos--${variant}`}
      aria-hidden="true"
    >
      {composition.constellations.map((constellation, constellationIndex) => (
        <svg
          className={`section-cosmos-constellation section-cosmos-constellation--${ORDINALS[constellationIndex]}`}
          viewBox="0 0 168 72"
          fill="none"
          key={constellation.path}
        >
          <path d={constellation.path} />
          {constellation.points.map(([cx, cy], pointIndex) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={pointIndex % 3 === 0 ? 2.7 : pointIndex % 2 === 0 ? 2.1 : 1.55}
            />
          ))}
        </svg>
      ))}

      {Array.from({ length: composition.orbitCount }, (_, index) => (
        <span
          className={`section-cosmos-orbit section-cosmos-orbit--${ORDINALS[index]}`}
          key={`orbit-${ORDINALS[index]}`}
        >
          <i />
          <b />
        </span>
      ))}

      {Array.from({ length: composition.starCount }, (_, index) => (
        <span
          className={`section-cosmos-star section-cosmos-star--${ORDINALS[index]}`}
          key={`star-${ORDINALS[index]}`}
        />
      ))}
      {Array.from({ length: composition.dotCount }, (_, index) => (
        <span
          className={`section-cosmos-dot section-cosmos-dot--${ORDINALS[index]}`}
          key={`dot-${ORDINALS[index]}`}
        />
      ))}
      {Array.from({ length: composition.diamondCount }, (_, index) => (
        <span
          className={`section-cosmos-diamond section-cosmos-diamond--${ORDINALS[index]}`}
          key={`diamond-${ORDINALS[index]}`}
        />
      ))}
    </div>
  );
}
