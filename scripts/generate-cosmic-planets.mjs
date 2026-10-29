// Original, deterministic SVG materials. No downloaded textures or runtime JS.
import { mkdir, writeFile } from "node:fs/promises";

const destination = new URL("../public/assets/cosmic-planets/", import.meta.url);
await mkdir(destination, { recursive: true });
const random = (seed) => {
  let state = seed;
  return () => ((state = Math.imul(state, 1664525) + 1013904223 >>> 0) / 4294967296);
};

const materials = [
  { name: "rocky", size: 384, seed: 7, base: "#756052", tint: "0.38 0.22 0.14", offset: "0.18 0.13 0.10", craters: 54 },
  { name: "gas", size: 384, seed: 18, base: "#b7a38c", tint: "0.32 0.28 0.20", offset: "0.30 0.26 0.22" },
  { name: "atmosphere", size: 256, seed: 31, base: "#28576b", tint: "0.18 0.35 0.32", offset: "0.06 0.12 0.16", air: "#75b4e0" },
  { name: "ice", size: 256, seed: 49, base: "#83b4c6", tint: "0.20 0.29 0.33", offset: "0.24 0.42 0.49", air: "#a2d1dc" },
  { name: "moon", size: 160, seed: 62, base: "#71716f", tint: "0.32 0.30 0.28", offset: "0.16 0.16 0.16", craters: 72 },
  { name: "distant", size: 128, seed: 88, base: "#64585b", tint: "0.30 0.19 0.23", offset: "0.16 0.13 0.16", craters: 18 },
];

function craterField(count, rng) {
  return Array.from({ length: count }, (_, i) => {
    // Orthographic projection compresses craters toward the spherical limb.
    const x = (rng() * 2 - 1) * 0.86;
    const y = (rng() * 2 - 1) * 0.86;
    if (x * x + y * y > 0.86) return "";
    const radius = i < 6 ? 10 + rng() * 14 : 1.5 + rng() * 7;
    const squeeze = Math.sqrt(1 - x * x - y * y);
    return `<ellipse cx="${(160 + x * 154).toFixed(2)}" cy="${(160 + y * 154).toFixed(2)}" rx="${radius.toFixed(2)}" ry="${(radius * squeeze).toFixed(2)}" fill="url(#crater)" opacity="${(0.3 + rng() * 0.4).toFixed(2)}"/>`;
  }).join("");
}

function gasBands(rng) {
  const palette = ["#c5b69a", "#95785d", "#d1c3a7", "#806752", "#b79a7a", "#e0d4bc"];
  return `<g filter="url(#flow)">${Array.from({ length: 36 }, (_, i) => {
    const y = i * 9;
    return `<path d="M-20 ${y} Q160 ${y + 14} 340 ${y - 3} L340 ${y + 8} Q160 ${y + 22} -20 ${y + 7}Z" fill="${palette[i % palette.length]}" opacity="${(0.4 + rng() * 0.5).toFixed(2)}"/>`;
  }).join("")}<ellipse cx="204" cy="194" rx="27" ry="10" fill="#92715b"/><ellipse cx="202" cy="192" rx="20" ry="6" fill="#b49a7d"/><ellipse cx="200" cy="191" rx="12" ry="3" fill="#cdb393"/></g>`;
}

function iceFissures(rng) {
  return `<g fill="none" stroke="#476879" stroke-width="0.75" opacity="0.46">${Array.from({ length: 18 }, () => {
    const x = rng() * 320;
    const y = rng() * 320;
    return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l14 -21 -7 -16 26 -18 -4 -21 17 -18 m-29 39 20 4 11 -13"/>`;
  }).join("")}</g>`;
}

for (const material of materials) {
  const rng = random(material.seed);
  const tint = material.tint.split(" ");
  const offset = material.offset.split(" ");
  const rocky = Boolean(material.craters);
  const details = rocky ? craterField(material.craters, rng)
    : material.name === "gas" ? gasBands(rng)
    : material.name === "ice" ? iceFissures(rng)
    : `<path fill="#becbd2" opacity="0.55" filter="url(#flow)" d="M30 80 Q100 42 180 91T310 83 L310 94 Q220 128 165 106T30 102Z M-10 175 Q80 132 164 171T340 180 L340 192 Q240 214 157 189T-10 193Z"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${material.size}" height="${material.size}" viewBox="0 0 320 320">
<defs>
  <clipPath id="disc"><circle cx="160" cy="160" r="156"/></clipPath>
  <radialGradient id="shade" cx="27%" cy="23%" r="82%">
    <stop stop-color="#fff0dd" stop-opacity="0.14"/>
    <stop offset="0.35" stop-color="#03040b" stop-opacity="0"/>
    <stop offset="0.62" stop-color="#03040b" stop-opacity="0.32"/>
    <stop offset="0.82" stop-color="#03040b" stop-opacity="0.91"/>
    <stop offset="1" stop-color="#04050d" stop-opacity="0.99"/>
  </radialGradient>
  <radialGradient id="limb"><stop offset="0.72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#01020a" stop-opacity="0.6"/></radialGradient>
  <radialGradient id="crater" cx="60%" cy="66%" r="65%">
    <stop stop-color="#252324" stop-opacity="0.85"/>
    <stop offset="0.58" stop-color="#292625" stop-opacity="0.5"/>
    <stop offset="0.72" stop-color="#d3c5b1" stop-opacity="0.62"/>
    <stop offset="0.87" stop-color="#37312c" stop-opacity="0.1"/>
    <stop offset="1" stop-color="#37312c" stop-opacity="0"/>
  </radialGradient>
  <filter id="terrain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${rocky ? "0.055" : "0.025"}" numOctaves="4" seed="${material.seed}" result="noise"/>
    <feColorMatrix values="${tint[0]} 0 0 0 ${offset[0]} ${tint[1]} 0 0 0 ${offset[1]} ${tint[2]} 0 0 0 ${offset[2]} 0 0 0 0 1" result="albedo"/>
    <feDiffuseLighting in="noise" surfaceScale="${rocky ? "4" : "1.5"}" diffuseConstant="1.2" lighting-color="#f4e5d6" result="relief"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>
    <feBlend in="albedo" in2="relief" mode="multiply"/>
  </filter>
  <filter id="flow" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.015 0.05" numOctaves="3" seed="${material.seed}" result="flow"/><feDisplacementMap in="SourceGraphic" in2="flow" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter>
  <radialGradient id="air"><stop offset="0.91" stop-color="${material.air || "#000"}" stop-opacity="0"/><stop offset="0.965" stop-color="${material.air || "#000"}" stop-opacity="0.28"/><stop offset="1" stop-color="${material.air || "#000"}" stop-opacity="0"/></radialGradient>
  <linearGradient id="airlight" x2="1" y2="1"><stop offset="0.3" stop-color="#fff"/><stop offset="0.8" stop-color="#000"/></linearGradient>
  <mask id="sunlit-air"><rect width="320" height="320" fill="url(#airlight)"/></mask>
</defs>
<g clip-path="url(#disc)">
  <circle cx="160" cy="160" r="156" fill="${material.base}"/>
  <circle cx="160" cy="160" r="156" filter="url(#terrain)"/>
  ${details}
  <circle cx="160" cy="160" r="156" fill="url(#limb)"/>
  <circle cx="160" cy="160" r="156" fill="url(#shade)"/>
</g>
${material.air ? '<circle cx="160" cy="160" r="159" fill="url(#air)" mask="url(#sunlit-air)"/>' : ""}
</svg>\n`;
  await writeFile(new URL(`${material.name}.svg`, destination), svg);
  console.log(`${material.name}.svg: ${Buffer.byteLength(svg)} bytes`);
}
