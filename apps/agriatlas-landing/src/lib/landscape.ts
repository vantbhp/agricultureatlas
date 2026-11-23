/**
 * Agriculture Atlas procedural "field from orbit" engine (client-side, Canvas 2D).
 *
 * Draws an illustrative Mekong-delta-like landscape: two silty river branches, a rotated
 * canal grid, rice strips whose colour follows a crop season, orchards, aquaculture ponds and
 * tree-lined villages — plus an Uber-H3-style hex lattice used as the "virtual sensor" layer.
 *
 * IMPORTANT: everything here is ILLUSTRATIVE. Index colours are derived from the drawing itself
 * (season phase, distance to coast…), never presented as measurements.
 */

export type Mode = 'soil_moisture' | 'et0' | 'gdd' | 'salinity' | 'frost' | 'leaf_wetness' | 'crop_stress';
export type RegionPreset = 'mekong' | 'highlands' | 'red_river' | 'central_coast';
type RGB = [number, number, number];

/* ------------------------------------------------------------------ noise & colour */

function hash(x: number, y: number, s: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function vnoise(x: number, y: number, s: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x: number, y: number, s: number): number {
  return (vnoise(x, y, s) * 0.5 + vnoise(x * 2.03, y * 2.03, s + 7) * 0.3 + vnoise(x * 4.1, y * 4.1, s + 13) * 0.2);
}
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const hex2rgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function ramp(stops: [number, string][]): (t: number) => RGB {
  const s = stops.map(([p, c]) => [p, hex2rgb(c)] as const);
  return (t: number) => {
    t = clamp01(t);
    for (let i = 1; i < s.length; i++) {
      if (t <= s[i]![0]) {
        const [p0, c0] = s[i - 1]!, [p1, c1] = s[i]!;
        const k = (t - p0) / (p1 - p0 || 1);
        return [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k];
      }
    }
    return s[s.length - 1]![1] as RGB;
  };
}
const css = (c: RGB, a = 1, l = 0) =>
  `rgb(${Math.round(Math.min(255, c[0] * (1 + l)))} ${Math.round(Math.min(255, c[1] * (1 + l)))} ${Math.round(Math.min(255, c[2] * (1 + l)))} / ${a})`;

/** Rice colour through one crop season (0 → 1 wraps). */
export const ricePalette = ramp([
  [0, '#93AFB4'], [0.07, '#AFC3C0'], [0.15, '#B4C56B'], [0.28, '#86B04A'], [0.42, '#4E8D37'],
  [0.58, '#3D7A30'], [0.68, '#8B9B39'], [0.78, '#CDAA44'], [0.85, '#C8B27D'], [0.93, '#8A7458'], [1, '#93AFB4'],
]);
export const SEASON_STOPS = [
  { at: 0, key: 'season.flooded' }, { at: 0.13, key: 'season.seedling' }, { at: 0.36, key: 'season.growing' },
  { at: 0.66, key: 'season.ripening' }, { at: 0.83, key: 'season.harvest' },
] as const;
export function seasonKey(p: number): (typeof SEASON_STOPS)[number]['key'] {
  let k: (typeof SEASON_STOPS)[number]['key'] = SEASON_STOPS[0].key;
  for (const s of SEASON_STOPS) if (p >= s.at) k = s.key;
  return k;
}

/** Illustrative colour ramps for the seven lens modes (low → high). */
export const MODE_RAMPS: Record<Mode, (t: number) => RGB> = {
  soil_moisture: ramp([[0, '#3A2612'], [0.3, '#8C6A3A'], [0.55, '#D8D0A0'], [0.78, '#5FC0D6'], [1, '#0B5FA0']]),
  et0: ramp([[0, '#0E2238'], [0.35, '#3B6079'], [0.65, '#E2B65A'], [1, '#EA5527']]),
  gdd: ramp([[0, '#0E2A1D'], [0.35, '#2F7A3A'], [0.7, '#D9C547'], [1, '#F08A24']]),
  salinity: ramp([[0, '#0C2A29'], [0.4, '#2E7F77'], [0.75, '#BFE6E0'], [1, '#FFFFFF']]),
  frost: ramp([[0, '#2A1B12'], [0.45, '#6A7F8F'], [0.8, '#CFE8F5'], [1, '#FFFFFF']]),
  leaf_wetness: ramp([[0, '#1C1A10'], [0.4, '#4A6A3A'], [0.75, '#56B6A8'], [1, '#00F0FF']]),
  crop_stress: ramp([[0, '#10B981'], [0.5, '#F59E0B'], [1, '#EF4444']]),
};
export const MODE_CSS_GRADIENT = (m: Mode) =>
  `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1].map((t) => css(MODE_RAMPS[m](t))).join(', ')})`;

const TRAFFIC: RGB[] = [hex2rgb('#10B981'), hex2rgb('#F59E0B'), hex2rgb('#EF4444')];
const CYAN = '#00F0FF';

/* ------------------------------------------------------------------ scene */

type Kind = 'rice' | 'orchard' | 'pond';
interface Parcel { pts: number[]; kind: Kind; offset: number; tone: number; cx: number; cy: number }
interface Hex { x: number; y: number; pts: number[]; parcel: number; water: boolean; n: number }
export interface Scene {
  W: number; H: number; parcels: Parcel[]; hexes: Hex[]; hexSize: number;
  rivers: { pts: [number, number][]; w: number }[];
  canalsMajor: [number, number, number, number][]; canalsMinor: [number, number, number, number][];
}

function riverPath(a: [number, number], b: [number, number], seed: number, amp: number): [number, number][] {
  const r = rng(seed);
  const pts: [number, number][] = [];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len, ph = r() * 6.28;
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const o = amp * (Math.sin(t * 9 + ph) * 0.6 + Math.sin(t * 23 + ph * 2) * 0.25 + (fbm(t * 6, seed, seed) - 0.5));
    pts.push([a[0] + dx * t + nx * o, a[1] + dy * t + ny * o]);
  }
  return pts;
}
function distToPolyline(x: number, y: number, pts: [number, number][]): number {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1]!, [x2, y2] = pts[i]!;
    const vx = x2 - x1, vy = y2 - y1;
    const t = clamp01(((x - x1) * vx + (y - y1) * vy) / (vx * vx + vy * vy));
    const d = Math.hypot(x - (x1 + vx * t), y - (y1 + vy * t));
    if (d < best) best = d;
  }
  return best;
}
function inPoly(x: number, y: number, p: number[]): boolean {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i]!, yi = p[i + 1]!, xj = p[j]!, yj = p[j + 1]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Build the Mekong-like scene once; it is shared by every canvas on the page. */
export function buildScene(seed = 11): Scene {
  const W = 1600, H = 1000;
  const r = rng(seed);
  const rivers = [
    { pts: riverPath([-120, 150], [1720, 760], seed + 1, 46), w: 64 },
    { pts: riverPath([-120, 520], [1720, 1120], seed + 2, 38), w: 50 },
  ];
  const ang = Math.atan2(610, 1840);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const cx = W / 2, cy = H / 2;
  const toWorld = (u: number, v: number): [number, number] => [cx + u * ca - v * sa, cy + u * sa + v * ca];
  const BU = 150, BV = 96;
  const parcels: Parcel[] = [];
  const canalsMajor: Scene['canalsMajor'] = [], canalsMinor: Scene['canalsMinor'] = [];
  for (let bv = -9; bv <= 9; bv++) {
    const v0 = bv * BV, v1 = v0 + BV;
    const a = toWorld(-1300, v0), b = toWorld(1300, v0);
    canalsMajor.push([a[0], a[1], b[0], b[1]]);
    for (let bu = -9; bu <= 9; bu++) {
      const jitter = (hash(bu, bv, seed) - 0.5) * 40;
      const u0 = bu * BU + jitter, u1 = u0 + BU;
      const mid = toWorld((u0 + u1) / 2, (v0 + v1) / 2);
      if (mid[0] < -200 || mid[0] > W + 200 || mid[1] < -200 || mid[1] > H + 200) continue;
      const c0 = toWorld(u0, v0), c1 = toWorld(u0, v1);
      canalsMinor.push([c0[0], c0[1], c1[0], c1[1]]);
      const roll = hash(bu * 3, bv * 5, seed + 3);
      const kind: Kind = roll < 0.1 ? 'orchard' : roll < 0.16 ? 'pond' : 'rice';
      const blockOffset = fbm(bu * 0.35, bv * 0.35, seed + 9) * 0.75;
      let u = u0 + 3;
      while (u < u1 - 6) {
        const wdt = kind === 'pond' ? 26 + r() * 14 : 11 + r() * 15;
        const ue = Math.min(u + wdt, u1 - 3);
        const vIn = kind === 'pond' ? 6 : 4;
        const p = [toWorld(u, v0 + vIn), toWorld(ue, v0 + vIn), toWorld(ue, v1 - vIn), toWorld(u, v1 - vIn)];
        const pc = toWorld((u + ue) / 2, (v0 + v1) / 2);
        parcels.push({
          pts: p.flat(), kind, offset: (blockOffset + (r() - 0.5) * 0.05 + 1) % 1, tone: (r() - 0.5) * 0.16, cx: pc[0], cy: pc[1],
        });
        u = ue + (kind === 'pond' ? 4 : 1.2);
      }
    }
  }
  // spatial buckets for point → parcel lookup
  const CELL = 60, bucket = new Map<number, number[]>();
  parcels.forEach((p, i) => {
    const xs = p.pts.filter((_, k) => k % 2 === 0), ys = p.pts.filter((_, k) => k % 2 === 1);
    for (let gx = Math.floor(Math.min(...xs) / CELL); gx <= Math.floor(Math.max(...xs) / CELL); gx++)
      for (let gy = Math.floor(Math.min(...ys) / CELL); gy <= Math.floor(Math.max(...ys) / CELL); gy++) {
        const key = gx * 10007 + gy;
        (bucket.get(key) ?? bucket.set(key, []).get(key)!).push(i);
      }
  });
  const hexSize = 24, hw = Math.sqrt(3) * hexSize, hexes: Hex[] = [];
  for (let row = -1; row * 1.5 * hexSize < H + hexSize * 2; row++)
    for (let col = -1; col * hw < W + hw; col++) {
      const x = col * hw + (row & 1 ? hw / 2 : 0), y = row * 1.5 * hexSize;
      const pts: number[] = [];
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 180) * (60 * k - 30);
        pts.push(x + hexSize * 0.96 * Math.cos(a), y + hexSize * 0.96 * Math.sin(a));
      }
      const water = rivers.some((rv) => distToPolyline(x, y, rv.pts) < rv.w * 0.55);
      let parcel = -1;
      for (const i of bucket.get(Math.floor(x / CELL) * 10007 + Math.floor(y / CELL)) ?? [])
        if (inPoly(x, y, parcels[i]!.pts)) { parcel = i; break; }
      hexes.push({ x, y, pts, parcel, water, n: fbm(x * 0.012, y * 0.012, seed + 21) });
    }
  return { W, H, parcels, hexes, hexSize, rivers, canalsMajor, canalsMinor };
}

let shared: Scene | null = null;
/** One scene per page, shared by the hero, the lab and the footer wordmark. */
export function sharedScene(): Scene { return (shared ??= buildScene(11)); }

/* ------------------------------------------------------------------ illustrative index field */

function phaseOf(p: Parcel | undefined, season: number) { return p ? (season + p.offset) % 1 : 0.5; }
export function indexValue(mode: Mode, sc: Scene, h: Hex, season: number): number {
  const p = h.parcel >= 0 ? sc.parcels[h.parcel] : undefined;
  const ph = phaseOf(p, season);
  const dry = 0.5 + 0.5 * Math.cos(Math.PI * 2 * (season - 0.1));
  const coast = clamp01((h.x / sc.W + h.y / sc.H - 0.95) * 1.25);
  const moist = h.water ? 1 : !p ? 0.5 : p.kind === 'pond' ? 1 : p.kind === 'orchard' ? 0.55
    : ph < 0.15 ? 0.95 : ph < 0.66 ? 0.72 + h.n * 0.12 : ph < 0.83 ? 0.42 : ph < 0.93 ? 0.2 : 0.32;
  switch (mode) {
    case 'soil_moisture': return clamp01(moist + (h.n - 0.5) * 0.18);
    case 'et0': return clamp01(0.25 + dry * 0.45 + (1 - moist) * 0.22 + (h.n - 0.5) * 0.12);
    case 'gdd': return h.water ? 0 : p?.kind === 'rice' ? ph : 0.6;
    case 'salinity': return h.water ? clamp01(coast * 1.1) : clamp01(coast * (0.55 + dry * 0.5) + (h.n - 0.5) * 0.14);
    case 'frost': return clamp01((1 - h.y / sc.H) * 0.16 * (1 - dry) + h.n * 0.05);
    case 'leaf_wetness': return h.water ? 0 : clamp01((ph > 0.25 && ph < 0.72 ? 0.62 : 0.28) + (1 - dry) * 0.25 + (h.n - 0.5) * 0.25);
    case 'crop_stress': return h.water ? 0 : clamp01((1 - moist) * 0.55 + dry * 0.25 + coast * 0.45 + (h.n - 0.5) * 0.2 - 0.12);
  }
}

/* ------------------------------------------------------------------ rendering */

export interface View { w: number; h: number; dpr: number; zoom?: number; focusX?: number; focusY?: number }
export interface RenderState {
  season: number;
  hexAlpha?: number;
  swath?: number | null;
  traffic?: number;
  mode?: Mode | null;
  modeAlpha?: number;
  lens?: { x: number; y: number; r: number; alpha: number; mode: Mode } | null;
}

interface Cam { sc: number; ox: number; oy: number }
function camera(sc: Scene, v: View): Cam {
  const z = v.zoom ?? 1;
  const s = Math.max((v.w * v.dpr) / sc.W, (v.h * v.dpr) / sc.H) * z;
  const fx = v.focusX ?? 0.5, fy = v.focusY ?? 0.5;
  return { sc: s, ox: v.w * v.dpr * 0.5 - sc.W * fx * s, oy: v.h * v.dpr * 0.5 - sc.H * fy * s };
}
function poly(ctx: CanvasRenderingContext2D, p: number[]) {
  ctx.moveTo(p[0]!, p[1]!);
  for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i]!, p[i + 1]!);
  ctx.closePath();
}
function strokeLine(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.stroke();
}

let grain: CanvasPattern | null = null;
function grainPattern(ctx: CanvasRenderingContext2D) {
  if (grain) return grain;
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const g = c.getContext('2d')!;
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + Math.random() * 90;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grain = ctx.createPattern(c, 'repeat');
  return grain;
}

/** Static overlay (canals, villages, orchards, ponds, rivers, clouds) cached per canvas size. */
function staticLayer(sc: Scene, cam: Cam, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.setTransform(cam.sc, 0, 0, cam.sc, cam.ox, cam.oy);
  ctx.lineCap = 'round';
  // orchards & ponds
  for (const p of sc.parcels) {
    if (p.kind === 'rice') continue;
    ctx.beginPath(); poly(ctx, p.pts);
    if (p.kind === 'orchard') {
      ctx.fillStyle = css([46, 84, 40], 1, p.tone); ctx.fill();
      ctx.fillStyle = 'rgb(28 52 26 / 0.85)';
      for (let k = 0; k < 9; k++) {
        const x = p.cx + (hash(k, p.cx | 0, 3) - 0.5) * 18, y = p.cy + (hash(k, p.cy | 0, 5) - 0.5) * 70;
        ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 6.283); ctx.fill();
      }
    } else {
      ctx.fillStyle = css([86, 122, 128], 1, p.tone); ctx.fill();
      ctx.strokeStyle = 'rgb(70 62 44 / 0.9)'; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.fillStyle = 'rgb(235 245 240 / 0.7)';
      ctx.beginPath(); ctx.arc(p.cx, p.cy, 1.6, 0, 6.283); ctx.fill();
    }
  }
  // canals: minor (silver threads) and major (with tree-lined village bands)
  ctx.strokeStyle = 'rgb(150 170 160 / 0.55)'; ctx.lineWidth = 1.4;
  for (const [x1, y1, x2, y2] of sc.canalsMinor) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  sc.canalsMajor.forEach(([x1, y1, x2, y2], i) => {
    if (i % 2 === 0) {
      ctx.strokeStyle = 'rgb(34 58 32 / 0.95)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x1, y1 + 5); ctx.lineTo(x2, y2 + 5); ctx.stroke();
      ctx.fillStyle = 'rgb(26 46 24 / 0.9)';
      const len = Math.hypot(x2 - x1, y2 - y1);
      for (let d = 0; d < len; d += 5) {
        if (hash(i, d, 7) < 0.45) continue;
        const t = d / len;
        ctx.beginPath(); ctx.arc(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + 5 + (hash(d, i, 9) - 0.5) * 8, 2.6 + hash(d, i, 2) * 2.4, 0, 6.283); ctx.fill();
      }
      if (i % 4 === 0) {
        ctx.fillStyle = 'rgb(196 170 140 / 0.9)';
        for (let d = 40; d < len; d += 23) {
          if (hash(i, d, 11) < 0.6) continue;
          const t = d / len;
          ctx.fillRect(x1 + (x2 - x1) * t - 2.5, y1 + (y2 - y1) * t + 1, 5, 4);
        }
      }
    }
    ctx.strokeStyle = 'rgb(165 182 172 / 0.8)'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });
  // rivers (silty Mekong water with lighter thalweg)
  for (const rv of sc.rivers) {
    ctx.strokeStyle = 'rgb(58 70 52 / 0.9)'; ctx.lineWidth = rv.w + 12; strokeLine(ctx, rv.pts);
    ctx.strokeStyle = '#8E8566'; ctx.lineWidth = rv.w; strokeLine(ctx, rv.pts);
    ctx.strokeStyle = 'rgb(176 166 130 / 0.55)'; ctx.lineWidth = rv.w * 0.35; strokeLine(ctx, rv.pts);
  }
  // grain for photographic texture
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = grainPattern(ctx) ?? 'transparent';
  ctx.fillRect(0, 0, w, h);
  return c;
}

const layerCache = new WeakMap<HTMLCanvasElement, { key: string; layer: HTMLCanvasElement }>();

export function renderField(canvas: HTMLCanvasElement, sc: Scene, v: View, st: RenderState) {
  const w = Math.round(v.w * v.dpr), h = Math.round(v.h * v.dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext('2d')!;
  const cam = camera(sc, v);
  const key = `${w}x${h}:${v.zoom ?? 1}:${v.focusX ?? 0.5}:${v.focusY ?? 0.5}`;
  let cached = layerCache.get(canvas);
  if (!cached || cached.key !== key) { cached = { key, layer: staticLayer(sc, cam, w, h) }; layerCache.set(canvas, cached); }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#3B4A33';
  ctx.fillRect(0, 0, w, h);
  ctx.setTransform(cam.sc, 0, 0, cam.sc, cam.ox, cam.oy);
  // rice strips (season-dependent)
  for (const p of sc.parcels) {
    if (p.kind !== 'rice') continue;
    ctx.beginPath(); poly(ctx, p.pts);
    ctx.fillStyle = css(ricePalette((st.season + p.offset) % 1), 1, p.tone);
    ctx.fill();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(cached.layer, 0, 0);
  ctx.setTransform(cam.sc, 0, 0, cam.sc, cam.ox, cam.oy);

  const lw = 1 / cam.sc;
  // full false-colour mode (indices section)
  if (st.mode && (st.modeAlpha ?? 0) > 0.01) {
    const f = MODE_RAMPS[st.mode];
    for (const hx of sc.hexes) {
      ctx.beginPath(); poly(ctx, hx.pts);
      ctx.fillStyle = css(f(indexValue(st.mode, sc, hx, st.season)), 0.86 * st.modeAlpha!);
      ctx.fill();
    }
    ctx.strokeStyle = `rgb(8 11 16 / ${0.35 * st.modeAlpha!})`; ctx.lineWidth = 1.2 * lw;
    for (const hx of sc.hexes) { ctx.beginPath(); poly(ctx, hx.pts); ctx.stroke(); }
  }
  // traffic-light advice layer
  if ((st.traffic ?? 0) > 0.01) {
    for (const hx of sc.hexes) {
      if (hx.water) continue;
      const v2 = indexValue('crop_stress', sc, hx, st.season);
      ctx.beginPath(); poly(ctx, hx.pts);
      ctx.fillStyle = css(TRAFFIC[v2 < 0.36 ? 0 : v2 < 0.58 ? 1 : 2]!, 0.6 * st.traffic!);
      ctx.fill();
    }
  }
  // satellite swath sweeping across (illustrative)
  if (st.swath != null) {
    const sx = -300 + st.swath * (sc.W + 600), tilt = 0.22, band = 220;
    for (const hx of sc.hexes) {
      const d = hx.x - (sx + (hx.y - sc.H / 2) * tilt);
      if (d < -band || d > 18) continue;
      const k = d > 0 ? 1 - d / 18 : 1 + d / band;
      ctx.beginPath(); poly(ctx, hx.pts);
      ctx.fillStyle = `rgb(0 240 255 / ${0.42 * k * k})`;
      ctx.fill();
    }
    ctx.strokeStyle = CYAN; ctx.lineWidth = 2.5 * lw;
    ctx.beginPath(); ctx.moveTo(sx - tilt * sc.H, -50); ctx.lineTo(sx + tilt * sc.H, sc.H + 50); ctx.stroke();
  }
  // H3 lattice
  if ((st.hexAlpha ?? 0) > 0.01) {
    ctx.strokeStyle = `rgb(0 240 255 / ${0.5 * st.hexAlpha!})`; ctx.lineWidth = 1.1 * lw;
    ctx.beginPath();
    for (const hx of sc.hexes) poly(ctx, hx.pts);
    ctx.stroke();
  }
  // sensor lens
  if (st.lens && st.lens.alpha > 0.01) {
    const L = st.lens;
    const wx = (L.x * v.dpr - cam.ox) / cam.sc, wy = (L.y * v.dpr - cam.oy) / cam.sc, wr = (L.r * v.dpr) / cam.sc;
    const f = MODE_RAMPS[L.mode];
    ctx.save();
    ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 6.283); ctx.clip();
    ctx.fillStyle = `rgb(8 11 16 / ${0.35 * L.alpha})`; ctx.fillRect(wx - wr, wy - wr, wr * 2, wr * 2);
    for (const hx of sc.hexes) {
      if (Math.abs(hx.x - wx) > wr + 30 || Math.abs(hx.y - wy) > wr + 30) continue;
      ctx.beginPath(); poly(ctx, hx.pts);
      ctx.fillStyle = css(f(indexValue(L.mode, sc, hx, st.season)), 0.92 * L.alpha);
      ctx.fill();
      ctx.strokeStyle = `rgb(8 11 16 / ${0.55 * L.alpha})`; ctx.lineWidth = 1.4 * lw; ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = `rgb(0 240 255 / ${L.alpha})`; ctx.lineWidth = 2 * lw;
    ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = `rgb(0 240 255 / ${0.45 * L.alpha})`; ctx.lineWidth = 1 * lw;
    ctx.setLineDash([4 * lw, 6 * lw]);
    ctx.beginPath(); ctx.arc(wx, wy, wr + 14 * lw * v.dpr, 0, 6.283); ctx.stroke();
    ctx.setLineDash([]);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(a) * (wr - 10 * lw * v.dpr), wy + Math.sin(a) * (wr - 10 * lw * v.dpr));
      ctx.lineTo(wx + Math.cos(a) * (wr + 8 * lw * v.dpr), wy + Math.sin(a) * (wr + 8 * lw * v.dpr));
      ctx.strokeStyle = `rgb(0 240 255 / ${L.alpha})`; ctx.lineWidth = 2 * lw; ctx.stroke();
    }
  }
}

/* ------------------------------------------------------------------ region postcards (static) */

function ringPts(cx: number, cy: number, R: number, seed: number, squash = 0.75, n = 64): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = 1 + (fbm(Math.cos(a) * 1.3 + seed, Math.sin(a) * 1.3, seed) - 0.5) * 0.55;
    out.push(cx + Math.cos(a) * R * m, cy + Math.sin(a) * R * m * squash);
  }
  return out;
}

export function renderRegion(canvas: HTMLCanvasElement, preset: RegionPreset, v: View, seed = 5) {
  if (preset === 'mekong') {
    renderField(canvas, buildScene(seed + 40), { ...v, zoom: 1.7, focusX: 0.42, focusY: 0.45 }, { season: 0.3, hexAlpha: 0.25 });
    return;
  }
  const w = Math.round(v.w * v.dpr), h = Math.round(v.h * v.dpr);
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const W = 800, H = 1000;
  const s = Math.max(w / W, h / H), ox = (w - W * s) / 2, oy = (h - H * s) / 2;
  ctx.setTransform(s, 0, 0, s, ox, oy);
  const r = rng(seed + preset.length * 17);

  if (preset === 'highlands') {
    // red basalt soil, contour-planted coffee, a reservoir and a laterite road
    for (let y = 0; y < H; y += 10) for (let x = 0; x < W; x += 10) {
      const n = fbm(x * 0.006, y * 0.006, 3);
      ctx.fillStyle = css([118 + n * 50, 46 + n * 22, 26 + n * 10]); ctx.fillRect(x, y, 10.5, 10.5);
    }
    const hills = [[220, 260, 230], [580, 420, 200], [300, 760, 240], [690, 860, 150]] as const;
    hills.forEach(([cx, cy, R], hi) => {
      for (let rr = 18; rr < R; rr += 11) {
        const p = ringPts(cx, cy, rr, hi * 3 + 1, 0.78, 90);
        for (let i = 0; i < p.length; i += 2) {
          if (hash(i, rr, hi) < 0.12) continue;
          ctx.fillStyle = 'rgb(30 62 28)'; ctx.beginPath(); ctx.arc(p[i]!, p[i + 1]!, 3.6, 0, 6.283); ctx.fill();
          ctx.fillStyle = 'rgb(70 112 52 / 0.8)'; ctx.beginPath(); ctx.arc(p[i]! - 1, p[i + 1]! - 1, 1.6, 0, 6.283); ctx.fill();
        }
      }
    });
    ctx.fillStyle = '#2F6371';
    ctx.beginPath(); poly(ctx, ringPts(560, 140, 110, 9, 0.5, 80)); ctx.fill();
    ctx.strokeStyle = 'rgb(220 240 240 / 0.35)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = '#C98F58'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-20, 560); ctx.bezierCurveTo(240, 480, 360, 640, 520, 600); ctx.bezierCurveTo(660, 570, 720, 680, 840, 640); ctx.stroke();
  } else if (preset === 'red_river') {
    // forested mountains with golden rice terraces following the contours
    for (let y = 0; y < H; y += 10) for (let x = 0; x < W; x += 10) {
      const n = fbm(x * 0.01, y * 0.01, 8);
      ctx.fillStyle = css([28 + n * 30, 54 + n * 40, 30 + n * 20]); ctx.fillRect(x, y, 10.5, 10.5);
    }
    const hills = [[260, 300, 300], [640, 640, 280], [180, 900, 220]] as const;
    hills.forEach(([cx, cy, R], hi) => {
      for (let rr = R; rr > 26; rr -= 13) {
        const p = ringPts(cx, cy, rr, hi * 5 + 2, 0.7, 96);
        ctx.beginPath(); poly(ctx, p);
        const k = (rr / R) * 0.25 + 0.62 + (hash(rr, hi, 4) - 0.5) * 0.05;
        ctx.fillStyle = css(ricePalette(k % 1), 1, (hash(rr, hi, 1) - 0.5) * 0.14); ctx.fill();
        ctx.strokeStyle = 'rgb(60 48 28 / 0.75)'; ctx.lineWidth = 1.6; ctx.stroke();
      }
      ctx.fillStyle = 'rgb(30 60 30)'; ctx.beginPath(); poly(ctx, ringPts(cx, cy, 26, hi, 0.7)); ctx.fill();
    });
    ctx.strokeStyle = 'rgb(150 170 160 / 0.9)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(820, 120); ctx.bezierCurveTo(560, 260, 520, 420, 420, 520); ctx.bezierCurveTo(330, 610, 380, 760, -20, 820); ctx.stroke();
  } else {
    // central coast: sea, beach, dunes, dragon-fruit grid, shrimp ponds
    ctx.fillStyle = '#D9C49A'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 10) for (let x = 0; x < W; x += 10) {
      const n = fbm(x * 0.008, y * 0.008, 4);
      ctx.fillStyle = css([200 + n * 40, 178 + n * 36, 132 + n * 30], 0.6); ctx.fillRect(x, y, 10.5, 10.5);
    }
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 4; gx++) {
      const x0 = 30 + gx * 120, y0 = 40 + gy * 108;
      if (hash(gx, gy, 2) < 0.35) {
        ctx.fillStyle = '#4F8E8C'; ctx.fillRect(x0, y0, 104, 90);
        ctx.strokeStyle = '#8C7A56'; ctx.lineWidth = 4; ctx.strokeRect(x0, y0, 104, 90);
        ctx.fillStyle = 'rgb(240 250 250 / 0.8)';
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x0 + 20 + k * 32, y0 + 45, 2.4, 0, 6.283); ctx.fill(); }
      } else {
        for (let yy = y0 + 8; yy < y0 + 90; yy += 11) for (let xx = x0 + 8; xx < x0 + 104; xx += 11) {
          ctx.fillStyle = 'rgb(48 104 52)'; ctx.beginPath(); ctx.arc(xx, yy, 3.8, 0, 6.283); ctx.fill();
          if (hash(xx, yy, 6) > 0.93) { ctx.fillStyle = '#D6336C'; ctx.beginPath(); ctx.arc(xx + 1, yy - 1, 1.8, 0, 6.283); ctx.fill(); }
        }
      }
    }
    ctx.strokeStyle = 'rgb(170 140 96 / 0.55)'; ctx.lineWidth = 1.6;
    for (let k = 0; k < 14; k++) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 610 + k * 14 + Math.sin(x * 0.02 + k) * 6 - x * 0.12);
      ctx.stroke();
    }
    const shore = (x: number) => 790 - x * 0.16 + Math.sin(x * 0.012) * 16;
    ctx.fillStyle = '#1F5E78';
    ctx.beginPath(); ctx.moveTo(0, shore(0)); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, shore(x)); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 10; k++) {
      ctx.strokeStyle = `rgb(220 245 250 / ${0.6 - k * 0.05})`; ctx.lineWidth = k === 0 ? 4 : 1.4;
      ctx.beginPath(); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, shore(x) + 6 + k * 22 + Math.sin(x * 0.05 + k * 1.7) * 3); ctx.stroke();
    }
  }
  // faint H3 lattice + grain for family resemblance with the hero field
  ctx.strokeStyle = 'rgb(0 240 255 / 0.16)'; ctx.lineWidth = 1;
  const S = 30, hw = Math.sqrt(3) * S;
  ctx.beginPath();
  for (let row = -1; row * 1.5 * S < H + S; row++) for (let col = -1; col * hw < W + hw; col++) {
    const x = col * hw + (row & 1 ? hw / 2 : 0), y = row * 1.5 * S;
    for (let k = 0; k <= 6; k++) {
      const a = (Math.PI / 180) * (60 * k - 30);
      k ? ctx.lineTo(x + S * Math.cos(a), y + S * Math.sin(a)) : ctx.moveTo(x + S * Math.cos(a), y + S * Math.sin(a));
    }
  }
  ctx.stroke();
  void r;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.18;
  ctx.fillStyle = grainPattern(ctx) ?? 'transparent'; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
