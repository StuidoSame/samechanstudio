type SectionCosmosVariant =
  | "hero"
  | "phone"
  | "tablet"
  | "watch"
  | "contact";

type SectionCosmosProps = {
  variant: SectionCosmosVariant;
};

const CONSTELLATIONS: Record<
  SectionCosmosVariant,
  { path: string; points: Array<[number, number]> }
> = {
  hero: {
    path: "M8 62 L34 38 L63 49 L91 17 L126 31 L154 9",
    points: [[8, 62], [34, 38], [63, 49], [91, 17], [126, 31], [154, 9]],
  },
  phone: {
    path: "M12 18 L43 31 L69 12 L98 47 L132 37 L157 62",
    points: [[12, 18], [43, 31], [69, 12], [98, 47], [132, 37], [157, 62]],
  },
  tablet: {
    path: "M10 55 L39 27 L72 43 L104 16 L130 28 L158 12",
    points: [[10, 55], [39, 27], [72, 43], [104, 16], [130, 28], [158, 12]],
  },
  watch: {
    path: "M9 25 L37 49 L68 32 L96 57 L128 26 L157 39",
    points: [[9, 25], [37, 49], [68, 32], [96, 57], [128, 26], [157, 39]],
  },
  contact: {
    path: "M11 58 L38 33 L68 45 L96 19 L124 38 L157 14",
    points: [[11, 58], [38, 33], [68, 45], [96, 19], [124, 38], [157, 14]],
  },
};

export function SectionCosmos({ variant }: SectionCosmosProps) {
  const constellation = CONSTELLATIONS[variant];

  return (
    <div
      className={`section-cosmos section-cosmos--${variant}`}
      aria-hidden="true"
    >
      <svg
        className="section-cosmos-constellation"
        viewBox="0 0 168 72"
        fill="none"
      >
        <path d={constellation.path} />
        {constellation.points.map(([cx, cy], index) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index % 3 === 0 ? 2 : 1.35} />
        ))}
      </svg>
      <span className="section-cosmos-orbit">
        <i />
      </span>
      <span className="section-cosmos-star section-cosmos-star--one" />
      <span className="section-cosmos-star section-cosmos-star--two" />
      <span className="section-cosmos-star section-cosmos-star--three" />
      <span className="section-cosmos-dot section-cosmos-dot--one" />
      <span className="section-cosmos-dot section-cosmos-dot--two" />
      <span className="section-cosmos-dot section-cosmos-dot--three" />
      <span className="section-cosmos-diamond" />
    </div>
  );
}
