// Bouwt compacte SVG-kaartdata voor het spel uit open data:
// provincies: click_that_hood (the-netherlands.geojson), landen: Natural Earth via world-atlas.
const fs = require("fs");
const topo = require("./package/dist/topojson-client.js");
const world = require("./package/countries-50m.json");
const countries = topo.feature(world, world.objects.countries).features;
const nl = JSON.parse(fs.readFileSync("nl.geojson", "utf8")).features;

function pathFrom(geom, proj, box) {
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  let d = "";
  for (const poly of polys) for (const ring of poly) {
    const pts = ring.map(([lo, la]) => proj(lo, la));
    // ring helemaal buiten de kaart? overslaan
    if (pts.every(([x, y]) => x < box[0] - 50 || y < box[1] - 50 || x > box[2] + 50 || y > box[3] + 50)) continue;
    let out = [], last = null;
    for (const [x, y] of pts) {
      const p = [Math.round(x * 2) / 2, Math.round(y * 2) / 2];
      if (last && p[0] === last[0] && p[1] === last[1]) continue;
      out.push(p); last = p;
    }
    if (out.length < 3) continue;
    // simpele Douglas-Peucker
    { const h = Math.floor(out.length / 2); out = [...dp(out.slice(0, h + 1), 0.6).slice(0, -1), ...dp(out.slice(h), 0.6)]; }
    if (out.length < 3) continue;
    d += "M" + out.map(p => p.join(",")).join("L") + "Z";
  }
  return d;
}
function dp(pts, eps) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let max = 0, idx = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len; if (d > max) { max = d; idx = i; } }
    if (max > eps) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

/* ---------- Nederland ---------- */
const K = 200, C = Math.cos(52.2 * Math.PI / 180);
const projNL = (lo, la) => [(lo - 3.25) * C * K, (53.62 - la) * K];
const boxNL = [0, 0, Math.round((7.3 - 3.25) * C * K), Math.round((53.62 - 50.72) * K)];
const nlRegions = {};
for (const f of nl) nlRegions[f.properties.name] = pathFrom(f.geometry, projNL, boxNL);
const nlBg = countries.filter(f => ["Belgium", "Germany"].includes(f.properties.name)).map(f => pathFrom(f.geometry, projNL, boxNL)).join("");

/* ---------- Europa (Lambert azimuthaal, midden 12°O 52°N) ---------- */
const r = Math.PI / 180, l0 = 12 * r, p0 = 52 * r, KE = 1100;
function projEU(lo, la) {
  const l = lo * r, p = la * r;
  const k = Math.sqrt(2 / (1 + Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0)));
  return [k * Math.cos(p) * Math.sin(l - l0) * KE, -k * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0)) * KE];
}
// kader rond IJsland, Portugal, Griekenland, Finland, Oekraïne
const corners = [[-24.5, 66], [-10, 36], [28, 35], [31, 70.5], [40, 50], [-10, 52]].map(([a, b]) => projEU(a, b));
const xs = corners.map(p => p[0]), ys = corners.map(p => p[1]);
const ox = Math.min(...xs) - 10, oy = Math.min(...ys) - 10;
const projE = (lo, la) => { const [x, y] = projEU(lo, la); return [x - ox, y - oy]; };
const boxEU = [0, 0, Math.round(Math.max(...xs) - ox + 10), Math.round(Math.max(...ys) - oy + 10)];
const NAMEN = {
  "Netherlands": "Nederland", "Belgium": "België", "Germany": "Duitsland", "Luxembourg": "Luxemburg", "France": "Frankrijk",
  "United Kingdom": "Verenigd Koninkrijk", "Ireland": "Ierland", "Spain": "Spanje", "Portugal": "Portugal", "Italy": "Italië",
  "Switzerland": "Zwitserland", "Austria": "Oostenrijk", "Norway": "Noorwegen", "Sweden": "Zweden", "Finland": "Finland",
  "Denmark": "Denemarken", "Iceland": "IJsland", "Poland": "Polen", "Czechia": "Tsjechië", "Hungary": "Hongarije",
  "Romania": "Roemenië", "Greece": "Griekenland", "Ukraine": "Oekraïne", "Croatia": "Kroatië", "Slovakia": "Slowakije",
  "Bulgaria": "Bulgarije", "Estonia": "Estland", "Latvia": "Letland", "Lithuania": "Litouwen", "Serbia": "Servië",
  "Slovenia": "Slovenië", "Belarus": "Belarus",
};
const euRegions = {}; let euBg = "";
for (const f of countries) {
  const d = pathFrom(f.geometry, projE, boxEU);
  if (!d) continue;
  const n = NAMEN[f.properties.name];
  if (n) euRegions[n] = d; else euBg += d;
}

/* ---------- steden ---------- */
const STEDEN_NL = {
  "Amsterdam": [52.37, 4.90], "Rotterdam": [51.92, 4.48], "Den Haag": [52.08, 4.30], "Utrecht": [52.09, 5.12],
  "Eindhoven": [51.44, 5.48], "Groningen": [53.22, 6.57], "Tilburg": [51.56, 5.09], "Almere": [52.37, 5.21],
  "Breda": [51.59, 4.78], "Nijmegen": [51.84, 5.86], "Enschede": [52.22, 6.89], "Haarlem": [52.38, 4.64],
  "Arnhem": [51.98, 5.91], "Zwolle": [52.52, 6.08], "Leeuwarden": [53.20, 5.80], "Maastricht": [50.85, 5.69],
  "Assen": [52.99, 6.56], "Lelystad": [52.52, 5.47], "Middelburg": [51.50, 3.61], "'s-Hertogenbosch": [51.69, 5.30],
  "Apeldoorn": [52.21, 5.97], "Den Helder": [52.96, 4.76], "Leiden": [52.16, 4.49], "Amersfoort": [52.16, 5.39],
  "Venlo": [51.37, 6.17], "Alkmaar": [52.63, 4.75],
};
const STEDEN_EU = {
  "Amsterdam": [52.37, 4.90], "Brussel": [50.85, 4.35], "Berlijn": [52.52, 13.40], "Parijs": [48.86, 2.35],
  "Londen": [51.51, -0.13], "Luxemburg": [49.61, 6.13], "Madrid": [40.42, -3.70], "Lissabon": [38.72, -9.14],
  "Rome": [41.90, 12.50], "Bern": [46.95, 7.45], "Wenen": [48.21, 16.37], "Dublin": [53.35, -6.26],
  "Oslo": [59.91, 10.75], "Stockholm": [59.33, 18.07], "Helsinki": [60.17, 24.94], "Kopenhagen": [55.68, 12.57],
  "Reykjavik": [64.15, -21.94], "Warschau": [52.23, 21.01], "Praag": [50.08, 14.44], "Boedapest": [47.50, 19.04],
  "Athene": [37.98, 23.73], "Boekarest": [44.43, 26.10], "Kyiv": [50.45, 30.52],
};
const pt = (proj, [la, lo]) => proj(lo, la).map(v => Math.round(v));
const out = {
  nl: { box: boxNL, bg: nlBg, regions: nlRegions, steden: Object.fromEntries(Object.entries(STEDEN_NL).map(([k, v]) => [k, pt(projNL, v)])) },
  eu: { box: boxEU, bg: euBg, regions: euRegions, steden: Object.fromEntries(Object.entries(STEDEN_EU).map(([k, v]) => [k, pt(projE, v)])) },
};
const missing = Object.values(NAMEN).filter(n => !euRegions[n]);
fs.writeFileSync("kaart.js", "/* Kaartdata (open data): provincies uit click_that_hood, landen uit Natural Earth (world-atlas). */\nconst KAART = " + JSON.stringify(out) + ";\n");
console.log("boxNL", boxNL, "boxEU", boxEU, "missing", missing, "size", fs.statSync("kaart.js").size);
