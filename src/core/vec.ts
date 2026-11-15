// Utilidades numéricas. O gerador é semeado para que o jogo seja reproduzível nos testes.
export const TAU = Math.PI * 2;
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(bx - ax, by - ay);
export const suave = (t: number) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const saida = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

let semente = 20261114;
export function semear(s: number) { semente = s >>> 0 || 1; }
export function rng(): number {
  semente = (semente + 0x6d2b79f5) | 0;
  let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const entre = (a: number, b: number) => a + (b - a) * rng();
export const sorteia = <T>(l: readonly T[]): T => l[Math.floor(rng() * l.length) % l.length];
export function embaralha<T>(l: T[]): T[] {
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
}
/** ponto ao longo de uma polilinha [x,y,z][], u em 0..1 */
export function noCaminho(p: number[][], u: number): [number, number, number] {
  const n = p.length - 1; const f = clamp(u, 0, 1) * n; const i = Math.min(n - 1, Math.floor(f)); const t = f - i;
  return [lerp(p[i][0], p[i + 1][0], t), lerp(p[i][1], p[i + 1][1], t), lerp(p[i][2] || 0, p[i + 1][2] || 0, t)];
}
