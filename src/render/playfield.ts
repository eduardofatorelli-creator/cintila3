// Desenho da mesa em perspectiva: tablado deformado, peças com altura, sombras, bola e bloom.
import { Campo, H, Palheta, Seg, W } from '../core/physics';
import { CAM_MESA, Camera, proj } from '../core/projection';
import type { Gfx } from '../game/tipos';
import { novaTela } from './tema';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
export interface Vista { ox: number; oy: number; s: number }

/** Implementa as ferramentas de desenho que as peças recebem. */
export class Pintor implements Gfx {
  t = 0; ox = 0; oy = 0; s = 1; cam: Camera = CAM_MESA; camY = 0;
  bloom: Ctx | null = null; bs = 0.5; semBrilho = false;
  constructor(public c: Ctx) {}
  mira(v: Vista, cam: Camera, camY = 0) { this.ox = v.ox; this.oy = v.oy; this.s = v.s; this.cam = cam; this.camY = camY; }
  p(x: number, y: number, z = 0): [number, number, number] { const q = proj(x, y - this.camY, z, this.cam); return [this.ox + q.sx * this.s, this.oy + q.sy * this.s, q.k * this.s]; }
  pisca(hz: number) { return Math.floor(this.t * hz * 2) % 2 === 0; }
  disco(x: number, y: number, r: number, cor: string, z = 0, a = 1) { const [X, Y, K] = this.p(x, y, z), c = this.c; c.globalAlpha = a; c.fillStyle = cor; c.beginPath(); c.arc(X, Y, Math.max(0.3, r * K), 0, TAU); c.fill(); c.globalAlpha = 1; }
  anel(x: number, y: number, r: number, cor: string, l = 2, z = 0, a = 1) { const [X, Y, K] = this.p(x, y, z), c = this.c; c.globalAlpha = a; c.strokeStyle = cor; c.lineWidth = l * K; c.beginPath(); c.arc(X, Y, Math.max(0.3, r * K), 0, TAU); c.stroke(); c.globalAlpha = 1; }
  cil(x: number, y: number, r: number, z: number, cor: string, topo?: string) {
    const [X0, Y0, K] = this.p(x, y, 0), [, Y1] = this.p(x, y, z), c = this.c, R = r * K;
    c.fillStyle = cor; c.beginPath(); c.arc(X0, Y0, R, 0, Math.PI); c.lineTo(X0 - R, Y1); c.arc(X0, Y1, R, Math.PI, 0, true); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.38)'; c.fill();
    c.fillStyle = topo || cor; c.beginPath(); c.arc(X0, Y1, R, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.28)'; c.beginPath(); c.arc(X0 - R * 0.3, Y1 - R * 0.3, R * 0.36, 0, TAU); c.fill();
  }
  muro(ax: number, ay: number, bx: number, by: number, z: number, cor: string, l = 3) {
    const a0 = this.p(ax, ay, 0), b0 = this.p(bx, by, 0), a1 = this.p(ax, ay, z), b1 = this.p(bx, by, z), c = this.c;
    c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
    c.fillStyle = cor; c.fill(); c.fillStyle = 'rgba(0,0,0,0.42)'; c.fill();
    c.strokeStyle = cor; c.lineWidth = l * (a1[2] + b1[2]) / 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.stroke();
  }
  linha(pts: number[][], cor: string, l: number, a = 1) {
    const c = this.c; c.globalAlpha = a; c.strokeStyle = cor; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); let K = 1;
    for (const q of pts) { const [X, Y, k] = this.p(q[0], q[1], q[2] || 0); c.lineTo(X, Y); K = k; }
    c.lineWidth = l * K; c.stroke(); c.globalAlpha = 1;
  }
  poli(pts: number[][], cor: string, a = 1) { const c = this.c; c.globalAlpha = a; c.fillStyle = cor; c.beginPath(); for (const q of pts) { const [X, Y] = this.p(q[0], q[1], q[2] || 0); c.lineTo(X, Y); } c.closePath(); c.fill(); c.globalAlpha = 1; }
  txt(x: number, y: number, s: string, cor: string, tam: number, z = 0) { const [X, Y, K] = this.p(x, y, z), c = this.c; c.font = `800 ${Math.max(5, tam * K)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = cor; c.fillText(s, X, Y); }
  glow(x: number, y: number, r: number, cor: string, z = 0, a = 1) {
    const [X, Y, K] = this.p(x, y, z), R = r * K;
    if (this.semBrilho && r <= 64) return; // modo econômico: sem brilhos pequenos (eram o bloom)
    if (r > 64 || !this.bloom) { const c = this.c, g = c.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = a * 0.5; c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(X - R, Y - R, R * 2, R * 2); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; return; }
    const b = this.bloom; b.globalAlpha = Math.min(1, a); b.fillStyle = cor; b.beginPath(); b.arc(X * this.bs, Y * this.bs, R * this.bs, 0, TAU); b.fill(); b.globalAlpha = 1;
  }
  luz(x: number, y: number, r: number, cor: string, on: number, rot?: string) {
    const [X, Y, K] = this.p(x, y, 0), c = this.c, R = r * K;
    c.fillStyle = '#05060c'; c.beginPath(); c.ellipse(X, Y, R * 1.15, R * 1.0, 0, 0, TAU); c.fill();
    c.globalAlpha = Math.min(1, 0.12 + on * 0.88); c.fillStyle = cor; c.beginPath(); c.ellipse(X, Y, R, R * 0.88, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
    if (on > 0.5) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(X, Y, R * 0.45, R * 0.4, 0, 0, TAU); c.fill(); this.glow(x, y, r * 1.9, cor, 0, on * 0.9); }
    if (rot && K > 0.55) { c.font = `800 ${Math.max(5, 5.2 * K)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = on > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.4)'; c.fillText(rot, X, Y + R * 1.25); }
  }
}

/** Deforma a textura do tablado, linha a linha, para o trapézio. */
export function deforma(c: Ctx, tex: HTMLCanvasElement, v: Vista, cam: Camera, passo = 1) {
  const eh = tex.height / H, ew = tex.width / W;
  for (let y = 0; y < H; y += passo) {
    const a = proj(0, y, 0, cam), b = proj(W, y, 0, cam), prox = proj(0, y + passo, 0, cam);
    c.drawImage(tex, 0, y * eh, tex.width, Math.max(1, passo * eh), v.ox + a.sx * v.s, v.oy + a.sy * v.s, (b.sx - a.sx) * v.s, (prox.sy - a.sy) * v.s + 0.6);
  }
  void ew;
}

function paredes(g: Pintor, campo: Campo, fixas: boolean) {
  const segs = campo.segs.filter(s => !s.invisivel && !s.off && (fixas ? !s.dono || s.tipo === 'piso' : false));
  segs.sort((a, b) => Math.max(a.ay, a.by) - Math.max(b.ay, b.by));
  for (const s of segs) g.muro(s.ax, s.ay, s.bx, s.by, s.z ?? (s.tipo === 'piso' ? 4 : 12), s.cor || '#8890b8', s.tipo === 'porta' ? 2 : 3);
}

interface Base { chave: string; tela: HTMLCanvasElement; mx: number; my: number }
const bases = new Map<string, Base>();

/** Camada parada: tablado deformado + paredes fixas. Refeita só quando a tela ou a máquina muda. */
function camadaBase(id: string, campo: Campo, tex: HTMLCanvasElement, v: Vista, cam: Camera): Base {
  const chave = `${id}|${v.s.toFixed(4)}|${cam.P}|${cam.CURVA}|${campo.segs.length}`;
  const velha = bases.get(id); if (velha && velha.chave === chave) return velha;
  const mx = 30 * v.s, my = 40 * v.s, [tela, c] = novaTela(W * v.s + mx * 2, H * v.s + my * 2);
  const vv = { ox: mx, oy: my, s: v.s };
  deforma(c, tex, vv, cam, 1);
  const g = new Pintor(c); g.mira(vv, cam); paredes(g, campo, true);
  const b = { chave, tela, mx, my }; bases.set(id, b); if (bases.size > 6) bases.delete(bases.keys().next().value!);
  return b;
}

/** Pinta a camada parada da mesa num canvas qualquer (usado para montar o fundo pré-renderizado). */
export function pintaBase(c: Ctx, id: string, campo: Campo, tex: HTMLCanvasElement, v: Vista, cam: Camera) { const b = camadaBase(id, campo, tex, v, cam); c.drawImage(b.tela, v.ox - b.mx, v.oy - b.my); }

function palheta(g: Pintor, p: Palheta, c1: string, c2: string) {
  const c = g.c;
  for (const [z, cor, esc] of [[0, 'rgba(0,0,0,0.45)', 1], [5, c2, 1], [9, c1, 1], [9.5, '#ffffff', 0.35]] as [number, string, number][]) {
    const a = g.p(p.px, p.py + (z === 0 ? 3 : 0), z), b = g.p(p.tx, p.ty + (z === 0 ? 3 : 0), z);
    c.fillStyle = cor; c.beginPath();
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r0 = p.r0 * a[2] * esc, r1 = p.r1 * b[2] * esc;
    c.arc(a[0], a[1], r0, ang + Math.PI / 2, ang - Math.PI / 2); c.arc(b[0], b[1], r1, ang - Math.PI / 2, ang + Math.PI / 2); c.closePath(); c.fill();
  }
  const a = g.p(p.px, p.py, 10); c.fillStyle = '#0b0d1c'; c.beginPath(); c.arc(a[0], a[1], 2.6 * a[2], 0, TAU); c.fill();
}

export function desenhaBola(g: Pintor, b: { x: number; y: number; z: number; r: number; cor?: string; rastro: number[] }, cor: string) {
  if (b.z < -1) return;
  const c = g.c, r = b.rastro;
  if (!g.semBrilho) for (let i = 0; i < r.length - 2; i += 2) { const u = i / r.length; g.disco(r[i], r[i + 1], b.r * (0.3 + u * 0.6), b.cor || cor, 7 + b.z, u * 0.28); }
  const [sx, sy, sk] = g.p(b.x, b.y + 2, 0);
  c.fillStyle = 'rgba(0,0,0,0.55)'; c.beginPath(); c.ellipse(sx, sy, b.r * sk * (1 + b.z * 0.01), b.r * sk * 0.45, 0, 0, TAU); c.fill();
  const [X, Y, K] = g.p(b.x, b.y, 7 + b.z), R = b.r * K;
  const gr = c.createRadialGradient(X - R * 0.35, Y - R * 0.4, R * 0.1, X, Y, R);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, b.cor || '#cfd6ee'); gr.addColorStop(1, b.cor ? '#111' : '#454c6e');
  c.fillStyle = gr; c.beginPath(); c.arc(X, Y, R, 0, TAU); c.fill();
  g.glow(b.x, b.y, b.r * 1.7, b.cor || cor, 7 + b.z, 0.55);
}

export const semEtapa: Record<string, boolean> = {};
export interface OpcoesCampo { id: string; tex: HTMLCanvasElement; cores: { c1: string; c2: string; c3: string }; lancador?: number; passo?: number; semBase?: boolean; basePronta?: boolean }

/** Desenha um campo inteiro: base parada, luzes, peças em ordem de pintor, palhetas e bolas. */
export function desenhaCampo(g: Pintor, campo: Campo, v: Vista, cam: Camera, o: OpcoesCampo) {
  g.mira(v, cam, campo.camY);
  const c = g.c;
  if (o.semBase) {
    // campo em rolagem (túnel): fundo simples e faixas que correm, paredes desenhadas ao vivo
    const q = [g.p(40, campo.camY), g.p(340, campo.camY), g.p(340, campo.camY + H), g.p(40, campo.camY + H)];
    c.fillStyle = '#05060f'; c.beginPath(); q.forEach(p => c.lineTo(p[0], p[1])); c.fill();
    for (let y = Math.floor(campo.camY / 80) * 80; y < campo.camY + H; y += 80) g.linha([[40, y, 0], [340, y, 0]], o.cores.c3, 2, 0.25);
    for (const s of campo.segs) if (!s.invisivel && !s.off && !s.dono && Math.max(s.ay, s.by) > campo.camY - 20 && Math.min(s.ay, s.by) < campo.camY + H + 20) g.muro(s.ax, Math.max(campo.camY - 10, s.ay), s.bx, Math.max(campo.camY - 10, s.by), 12, s.cor || '#889', 3);
  } else if (o.passo) { deforma(c, o.tex, v, cam, o.passo); paredes(g, campo, true); }
  else if (!semEtapa.base && !o.basePronta) { const b = camadaBase(o.id, campo, o.tex, v, cam); c.drawImage(b.tela, v.ox - b.mx, v.oy - b.my); }
  const visivel = (y: number) => y > campo.camY - 40 && y < campo.camY + H + 40;
  if (!semEtapa.luzes) for (const p of campo.pecas) if (p.luzes && visivel(p.y)) p.luzes(g);
  const lista: { y: number; f: () => void }[] = [];
  if (!semEtapa.pecas) for (const p of campo.pecas) if (p.desenhar && visivel(p.y)) lista.push({ y: p.y, f: () => p.desenhar!(g) });
  for (const p of campo.pas) lista.push({ y: p.py + 8, f: () => palheta(g, p, o.cores.c1, o.cores.c2) });
  for (const b of campo.bolas) lista.push({ y: b.y + (b.z > 2 ? 400 : 0), f: () => desenhaBola(g, b, o.cores.c1) });
  if (o.lancador !== undefined) lista.push({ y: 770, f: () => { const d = o.lancador! * 16; g.muro(368, 748 + d, 386, 748 + d, 6, '#c9cee6', 5); g.linha([[377, 752 + d, 3], [377, 790, 3]], '#8088aa', 3); } });
  lista.sort((a, b) => a.y - b.y);
  for (const i of lista) i.f();
}

/** Textura genérica dos campos separados (arenas e andar de cima). */
export function texturaSub(cores: { c1: string; c2: string; c3: string }, fundo: string[], titulo: string, tipo: string): HTMLCanvasElement {
  const [tela, c] = novaTela(W, H, 1.5);
  const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, fundo[2]); gr.addColorStop(0.5, fundo[0]); gr.addColorStop(1, fundo[1]); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  c.strokeStyle = cores.c3; c.globalAlpha = 0.22; c.lineWidth = 1; c.beginPath();
  for (let x = 20; x <= 360; x += 34) { c.moveTo(x, 70); c.lineTo(x, 760); } for (let y = 70; y <= 760; y += 34) { c.moveTo(20, y); c.lineTo(360, y); } c.stroke();
  c.globalAlpha = 0.5; c.lineWidth = 3; c.strokeStyle = cores.c1; for (const r of [60, 110, 170]) { c.beginPath(); c.arc(190, 300, r, 0, TAU); c.stroke(); }
  c.globalAlpha = 0.16; c.fillStyle = cores.c2; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.moveTo(190, 300); c.lineTo(190 + Math.cos(a - 0.1) * 330, 300 + Math.sin(a - 0.1) * 330); c.lineTo(190 + Math.cos(a + 0.1) * 330, 300 + Math.sin(a + 0.1) * 330); c.fill(); }
  c.globalAlpha = 0.7; c.fillStyle = cores.c1; c.font = '800 22px Orbitron, sans-serif'; c.textAlign = 'center'; c.fillText(titulo.split(' · ')[0], 190, 470);
  c.globalAlpha = 0.5; c.font = '800 12px Orbitron, sans-serif'; c.fillStyle = '#fff'; c.fillText(titulo.split(' · ')[1] || tipo.toUpperCase(), 190, 494);
  c.globalAlpha = 1;
  return tela;
}
export type { Seg };
