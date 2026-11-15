// Motor de física: passo fixo de 120 Hz com 8 subpassos, colisão círculo-segmento e círculo-círculo.
import { clamp, noCaminho } from './vec';

export const W = 400, H = 760, CX = 190;
export const BOLA_R = 7, G = 1000, VMAX = 1420, HZ = 120, SUB = 8, DT = 1 / HZ;
export const E_PAREDE = 0.45, E_ARCO = 0.32, E_BORRACHA = 0.5, E_BUMPER = 0.5, E_ALVO = 0.6, E_ARENA = 0.28;

export interface Dono { bateu?(b: Bola, impacto: number, alvo: Seg | Circ): void }
export interface Seg {
  ax: number; ay: number; bx: number; by: number; e: number;
  /** normal de sentido único: só colide quando a bola está do lado apontado */
  nx?: number; ny?: number;
  off?: boolean; z?: number; cor?: string; invisivel?: boolean; dono?: Dono; tipo?: string;
  /** movimento da superfície: giro em torno de (px,py) e velocidade linear */
  w?: number; px?: number; py?: number; lvx?: number; lvy?: number;
}
export interface Circ {
  x: number; y: number; r: number; e: number; off?: boolean; z?: number; cor?: string;
  invisivel?: boolean; dono?: Dono; tipo?: string; lvx?: number; lvy?: number;
}
export interface Trilho { p: number[][]; t: number; dur: number; fim: (b: Bola) => void }
export interface Bola {
  id: number; x: number; y: number; vx: number; vy: number; r: number; z: number;
  preso: boolean; trilho?: Trilho; cor?: string; parado: number; lateral: boolean;
  nasceu: number; multi?: number; morta?: boolean; rastro: number[]; orbT: number; naPa?: boolean;
}

let proxId = 1;
export function novaBola(x: number, y: number, vx = 0, vy = 0): Bola {
  return { id: proxId++, x, y, vx, vy, r: BOLA_R, z: 0, preso: false, parado: 0, lateral: false, nasceu: 0, rastro: [], orbT: 0 };
}
export const seg = (ax: number, ay: number, bx: number, by: number, e = E_PAREDE, extra: Partial<Seg> = {}): Seg =>
  ({ ax, ay, bx, by, e, ...extra });

export class Palheta {
  px0 = 0;
  ang: number; w = 0; on = false; base = 55; extra = 0;
  repouso = 0.5; alto = -0.52; sobe = 27; desce = 15; r0 = 6.5; r1 = 4.1;
  /** escorregamento (gelo): atraso em segundos antes de responder */
  atraso = 0; private fila = 0; private alvoOn = false;
  constructor(public px: number, public py: number, public lado: 1 | -1, comp = 55) { this.base = comp; this.ang = this.repouso; this.px0 = px; }
  get comp() { return this.base + this.extra; }
  get tx() { return this.px + this.lado * Math.cos(this.ang) * this.comp; }
  get ty() { return this.py + Math.sin(this.ang) * this.comp; }
  aciona(v: boolean) { if (v !== this.alvoOn) { this.alvoOn = v; this.fila = this.atraso; } if (this.atraso <= 0) this.on = v; }
  passo(h: number) {
    if (this.on !== this.alvoOn) { this.fila -= h; if (this.fila <= 0) this.on = this.alvoOn; }
    const alvo = this.on ? this.alto : this.repouso; const a0 = this.ang;
    if (this.ang > alvo) this.ang = Math.max(alvo, this.ang - this.sobe * h);
    else if (this.ang < alvo) this.ang = Math.min(alvo, this.ang + this.desce * h);
    this.w = (this.ang - a0) / h;
  }
  colide(b: Bola): number {
    const tx = this.tx, ty = this.ty, dx = tx - this.px, dy = ty - this.py, L2 = dx * dx + dy * dy;
    const t = clamp(((b.x - this.px) * dx + (b.y - this.py) * dy) / L2, 0, 1);
    const cx = this.px + dx * t, cy = this.py + dy * t, raio = this.r0 + (this.r1 - this.r0) * t;
    let nx = b.x - cx, ny = b.y - cy; const d = Math.hypot(nx, ny), min = raio + b.r;
    if (d >= min || d === 0) return 0;
    nx /= d; ny /= d; b.x = cx + nx * min; b.y = cy + ny * min;
    // velocidade do ponto de contato: ω × r (espelhada na palheta direita)
    const rx = cx - this.px, ry = cy - this.py, s = this.lado;
    const pvx = -this.w * ry * s, pvy = this.w * rx * s;
    const rvx = b.vx - pvx, rvy = b.vy - pvy, vn = rvx * nx + rvy * ny;
    b.naPa = true;
    if (vn >= 0) return 0;
    const e = Math.abs(this.w) > 0.5 ? 0.42 : 0.26;
    b.vx = rvx - (1 + e) * vn * nx + pvx; b.vy = rvy - (1 + e) * vn * ny + pvy;
    return -vn;
  }
}

export function colideSeg(b: Bola, s: Seg): number {
  if (s.off) return 0;
  const dx = s.bx - s.ax, dy = s.by - s.ay, L2 = dx * dx + dy * dy;
  if (s.nx !== undefined && (b.x - s.ax) * s.nx + (b.y - s.ay) * s.ny! <= 0) return 0;
  const t = L2 > 0 ? clamp(((b.x - s.ax) * dx + (b.y - s.ay) * dy) / L2, 0, 1) : 0;
  const cx = s.ax + dx * t, cy = s.ay + dy * t;
  let nx = b.x - cx, ny = b.y - cy; const d2 = nx * nx + ny * ny;
  if (d2 >= b.r * b.r || d2 === 0) return 0;
  const d = Math.sqrt(d2); nx /= d; ny /= d;
  b.x = cx + nx * b.r; b.y = cy + ny * b.r;
  let svx = s.lvx || 0, svy = s.lvy || 0;
  if (s.w) { svx += -s.w * (cy - s.py!); svy += s.w * (cx - s.px!); }
  const rvx = b.vx - svx, rvy = b.vy - svy, vn = rvx * nx + rvy * ny;
  if (vn >= 0) return 0;
  b.vx = rvx - (1 + s.e) * vn * nx + svx; b.vy = rvy - (1 + s.e) * vn * ny + svy;
  return -vn;
}
export function colideCirc(b: Bola, c: Circ): number {
  if (c.off) return 0;
  let nx = b.x - c.x, ny = b.y - c.y; const min = c.r + b.r, d2 = nx * nx + ny * ny;
  if (d2 >= min * min || d2 === 0) return 0;
  const d = Math.sqrt(d2); nx /= d; ny /= d; b.x = c.x + nx * min; b.y = c.y + ny * min;
  const svx = c.lvx || 0, svy = c.lvy || 0, rvx = b.vx - svx, rvy = b.vy - svy, vn = rvx * nx + rvy * ny;
  if (vn >= 0) return 0;
  b.vx = rvx - (1 + c.e) * vn * nx + svx; b.vy = rvy - (1 + c.e) * vn * ny + svy;
  return -vn;
}

/** Peça de mesa. Toda peça sabe se atualizar, colidir e se desenhar. */
export interface Peca {
  y: number; z?: number; tipo: string;
  update?(dt: number): void;
  /** chamado a cada subpasso para sensores e forças */
  colidir?(b: Bola, h: number): void;
  desenhar?(g: any): void;
  luzes?(g: any): void;
}

export class Campo {
  segs: Seg[] = []; circs: Circ[] = []; pas: Palheta[] = []; pecas: Peca[] = []; bolas: Bola[] = [];
  g = G; gx = 0; arrasto = 0; alt = H; camY = 0; tempo = 0; vmax = VMAX;
  /** piso que devolve a bola (campos selados) */
  nome = 'mesa';
  add<T extends Peca>(p: T): T { this.pecas.push(p); return p; }
  parede(pts: number[][], e = E_PAREDE, extra: Partial<Seg> = {}) {
    const l: Seg[] = [];
    for (let i = 0; i < pts.length - 1; i++) { const s = seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], e, { ...extra }); this.segs.push(s); l.push(s); }
    return l;
  }
  passo(dt: number) {
    this.tempo += dt;
    for (const p of this.pecas) p.update?.(dt);
    // bolas em trilho (rampas, elevadores): seguem o caminho sem física
    for (const b of this.bolas) {
      b.nasceu += dt;
      if (b.trilho) {
        const tr = b.trilho; tr.t += dt; const u = Math.min(1, tr.t / tr.dur);
        const [x, y, z] = noCaminho(tr.p, u); b.x = x; b.y = y; b.z = z; b.vx = b.vy = 0;
        if (u >= 1) { b.trilho = undefined; b.z = 0; tr.fim(b); }
      }
    }
    const h = dt / SUB, bs = this.bolas, n = bs.length;
    for (let s = 0; s < SUB; s++) {
      for (const p of this.pas) p.passo(h);
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i]; if (b.preso || b.trilho) continue;
        b.vy += this.g * h; b.vx += this.gx * h;
        if (this.arrasto) { const k = Math.max(0, 1 - this.arrasto * h); b.vx *= k; b.vy *= k; }
        for (const p of this.pecas) if (p.colidir) p.colidir(b, h);
        if (b.preso || b.trilho || bs[i] !== b) continue;
        const v2 = b.vx * b.vx + b.vy * b.vy;
        if (v2 > this.vmax * this.vmax) { const k = this.vmax / Math.sqrt(v2); b.vx *= k; b.vy *= k; }
        b.x += b.vx * h; b.y += b.vy * h; b.naPa = false;
        for (const p of this.pas) p.colide(b);
        const x0 = b.x - 9, x1 = b.x + 9, y0 = b.y - 9, y1 = b.y + 9;
        for (const sg of this.segs) {
          if (sg.off) continue;
          if ((sg.ax < x0 && sg.bx < x0) || (sg.ax > x1 && sg.bx > x1) || (sg.ay < y0 && sg.by < y0) || (sg.ay > y1 && sg.by > y1)) continue;
          const imp = colideSeg(b, sg); if (imp > 0 && sg.dono?.bateu) sg.dono.bateu(b, imp, sg);
        }
        for (const c of this.circs) { const imp = colideCirc(b, c); if (imp > 0 && c.dono?.bateu) c.dono.bateu(b, imp, c); }
        for (let j = i + 1; j < bs.length; j++) {
          const o = bs[j]; if (o.preso || o.trilho) continue;
          let nx = o.x - b.x, ny = o.y - b.y; const d2 = nx * nx + ny * ny, min = b.r + o.r;
          if (d2 >= min * min || d2 === 0) continue;
          const d = Math.sqrt(d2); nx /= d; ny /= d; const ov = (min - d) / 2;
          b.x -= nx * ov; b.y -= ny * ov; o.x += nx * ov; o.y += ny * ov;
          const vn = (o.vx - b.vx) * nx + (o.vy - b.vy) * ny;
          if (vn < 0) { const k = vn * 0.95; b.vx += k * nx; b.vy += k * ny; o.vx -= k * nx; o.vy -= k * ny; }
        }
      }
    }
    for (const b of bs) {
      if (b.preso || b.trilho) continue;
      const r = b.rastro; r.push(b.x, b.y); if (r.length > 16) r.splice(0, 2);
    }
  }
  temNaN() { return this.bolas.some(b => !(Number.isFinite(b.x) && Number.isFinite(b.y) && Number.isFinite(b.vx) && Number.isFinite(b.vy))); }
}
