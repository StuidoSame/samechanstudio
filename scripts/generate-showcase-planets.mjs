// Original deterministic materials for the app showcase. No external textures.
import { mkdir, writeFile } from "node:fs/promises";

const destination = new URL("../public/assets/showcase-planets/", import.meta.url);
await mkdir(destination, { recursive: true });

const materials = [
  { id: "mapary", type: "terrain", seed: 12, base: "#345951", tint: [0.30, 0.27, 0.21], offset: [0.12, 0.23, 0.20], relief: 3.5 },
  { id: "runtronome", type: "gas", seed: 27, base: "#443b75", tint: [0.29, 0.23, 0.42], offset: [0.16, 0.12, 0.29], relief: 0.6 },
  { id: "evrune", type: "night", seed: 42, base: "#292739", tint: [0.16, 0.13, 0.24], offset: [0.09, 0.09, 0.16], relief: 1.1 },
  { id: "tocklist", type: "strata", seed: 61, base: "#787381", tint: [0.28, 0.27, 0.32], offset: [0.26, 0.25, 0.31], relief: 2.2 },
  { id: "skkoo", type: "dust", seed: 78, base: "#bbac95", tint: [0.21, 0.19, 0.17], offset: [0.58, 0.51, 0.41], relief: 1.6 },
  { id: "terubozu", type: "sky", seed: 93, base: "#5c9bb9", tint: [0.22, 0.30, 0.34], offset: [0.21, 0.39, 0.51], relief: 0.5 },
  { id: "waesseum", type: "moon", seed: 108, base: "#99999f", tint: [0.31, 0.30, 0.32], offset: [0.28, 0.29, 0.33], relief: 3 },
];

function random(seed) {
  let state = seed;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}

function bands(type, rng) {
  const palette = type === "gas"
    ? ["#515687", "#72639c", "#3d426e", "#8589b1", "#66548c", "#745474"]
    : ["#a4a0ae", "#6a6878", "#8f899c", "#b8b3be", "#7c7986"];
  return `<g filter="url(#flow)" opacity="${type === "gas" ? 0.78 : 0.45}">${Array.from({ length: 34 }, (_, i) => {
    const y = i * 12 - 5;
    const bend = type === "gas" ? 28 : 7;
    return `<path d="M-20 ${y} Q160 ${y + bend} 420 ${y - 8} L420 ${y + 2} Q160 ${y + bend + 9} -20 ${y + 9}Z" fill="${palette[i % palette.length]}" opacity="${(0.45 + rng() * 0.45).toFixed(2)}"/>`;
  }).join("")}</g>`;
}

function clouds(type) {
  return `<g fill="${type === "sky" ? "#e4eef0" : "#8c819e"}" opacity="${type === "sky" ? 0.7 : 0.27}" filter="url(#flow)"><path d="M-10 58Q74 14 155 68T420 65L420 92Q295 128 175 94T-10 84Z"/><path d="M-20 268Q95 220 200 260T430 274L430 297Q295 327 180 291T-20 306Z"/><path d="M-10 143Q120 106 206 150T420 159L420 175Q290 202 185 172T-10 167Z"/></g>`;
}

function craters(rng) {
  return Array.from({ length: 48 }, (_, i) => {
    const x = rng() * 1.8 - 0.9;
    const y = rng() * 1.8 - 0.9;
    if (x * x + y * y > 0.92) return "";
    const r = i < 8 ? 8 + rng() * 13 : 1.5 + rng() * 5;
    const squeeze = Math.sqrt(1 - x * x - y * y);
    return `<ellipse cx="${(200 + x * 193).toFixed(2)}" cy="${(200 + y * 193).toFixed(2)}" rx="${r.toFixed(2)}" ry="${(r * squeeze).toFixed(2)}" fill="url(#crater)" opacity="${(0.26 + rng() * 0.32).toFixed(2)}"/>`;
  }).join("");
}

function details(type, rng) {
  if (type === "gas" || type === "strata") return bands(type, rng);
  if (type === "night" || type === "sky") return clouds(type);
  if (type === "moon") return craters(rng);
  if (type === "terrain") return `<g filter="url(#flow)"><path fill="#8a8064" opacity="0.64" d="M4 0H270L244 32 278 52 239 76 255 115 210 130 183 102 161 129 137 99 96 108 67 81 25 100Z"/><path fill="#69745b" opacity="0.8" d="M-20 228L50 202 82 220 109 197 144 220 154 260 195 276 170 311 199 349 173 410H-20Z"/><path fill="#243f46" opacity="0.85" d="M295 155L339 135 371 155 420 143V398H254L274 351 242 320 267 289 247 245 282 222Z"/><g fill="none" stroke="#bac5a2" stroke-width="0.8" opacity="0.23"><path d="M17 42Q98 12 176 57T254 91M14 56Q99 26 169 69T239 108M5 267Q61 223 99 254T143 307M8 281Q66 241 93 269T130 316"/></g></g>`;
  // High frequency grain reads as a matte, powdery surface rather than cloth.
  return `<path d="M-20 122Q125 66 268 128T430 132M-20 282Q154 218 301 286T430 277" stroke="#e7d8bd" stroke-width="18" fill="none" opacity="0.12" filter="url(#flow)"/>`;
}

for (const material of materials) {
  const { id, type, seed, base, tint, offset, relief } = material;
  const frequency = type === "dust" ? "0.16" : type === "gas" ? "0.018 0.065" : "0.045";
  const matrix = tint.map((value, i) => `${value} 0 0 0 ${offset[i]}`).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 400 400">
<defs>
  <clipPath id="disc"><circle cx="200" cy="200" r="198"/></clipPath>
  <filter id="surface" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="3" seed="${seed}" result="noise"/>
    <feColorMatrix in="noise" values="${matrix} 0 0 0 0 1" result="albedo"/>
    <feDiffuseLighting in="noise" surfaceScale="${relief}" diffuseConstant="1.1" lighting-color="#eee9e1" result="relief"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>
    <feBlend in="albedo" in2="relief" mode="multiply"/>
  </filter>
  <filter id="flow" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.038" numOctaves="2" seed="${seed}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="${type === "strata" ? 5 : 18}" xChannelSelector="R" yChannelSelector="G"/></filter>
  <radialGradient id="light" cx="27%" cy="22%" r="86%">
    <stop stop-color="#fff6e5" stop-opacity="0.3"/><stop offset="0.3" stop-color="#f6f3ee" stop-opacity="0.08"/>
    <stop offset="0.49" stop-color="#070a18" stop-opacity="0.08"/><stop offset="0.7" stop-color="#040714" stop-opacity="0.62"/>
    <stop offset="0.9" stop-color="#030510" stop-opacity="0.96"/><stop offset="1" stop-color="#030510"/>
  </radialGradient>
  <radialGradient id="limb"><stop offset="0.65" stop-color="#01040c" stop-opacity="0"/><stop offset="0.92" stop-color="#01040c" stop-opacity="0.16"/><stop offset="1" stop-color="#01040c" stop-opacity="0.65"/></radialGradient>
  <radialGradient id="crater" cx="64%" cy="67%" r="65%"><stop stop-color="#262a36" stop-opacity="0.75"/><stop offset="0.58" stop-color="#41434c" stop-opacity="0.6"/><stop offset="0.73" stop-color="#ddd9d5" stop-opacity="0.65"/><stop offset="1" stop-color="#515360" stop-opacity="0"/></radialGradient>
</defs>
<g clip-path="url(#disc)">
  <circle cx="200" cy="200" r="198" fill="${base}"/>
  <circle cx="200" cy="200" r="198" filter="url(#surface)"/>
  ${details(type, random(seed))}
  <circle cx="200" cy="200" r="198" fill="url(#limb)"/>
  <circle cx="200" cy="200" r="198" fill="url(#light)"/>
</g>
</svg>
`;
  await writeFile(new URL(`${id}.svg`, destination), svg);
  console.log(`${id}.svg: ${Buffer.byteLength(svg)} bytes`);
}
