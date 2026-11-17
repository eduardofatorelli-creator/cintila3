// Desenho da mesa em perspectiva: tablado deformado, peças com altura, sombras, bola e bloom.
import { Campo, H, Palheta, Seg, W } from '../core/physics';
import { CAM_MESA, Camera, proj } from '../core/projection';
import type { Gfx } from '../game/tipos';
import { novaTela } from './tema';
import { MATERIAIS, type Insert, type Material } from '../visual/manifesto';
import { tom } from '../visual/pincel';
import type { Skin } from '../visual/r05/skin';
import { inserto, poe } from '../visual/r05/sprites';
import type { Game } from '../game/rules';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
export interface Vista { ox: number; oy: number; s: number }

/** Implementa as ferramentas de desenho que as peças recebem. */
export class Pintor implements Gfx {
  t = 0; ox = 0; oy = 0; s = 1; cam: Camera = CAM_MESA; camY = 0;
  bloom: Ctx | null = null; bs = 0.5; semBrilho = false;
  /** Visual R04: material, forma dos insertos e luz da máquina atual */
  mat: Material = MATERIAIS.cromo; insert: Insert = 'redondo'; luzCor = '#7df9ff';
  /** R05: skin da máquina (desenho de peças por sprite); null mantém o desenho R04 */
  skin: Skin | null = null;
  private grads = new Map<string, CanvasGradient>();
  constructor(public c: Ctx) {}
  /** gradiente de corpo cilíndrico em coordenadas locais (centro em 0), guardado por cor e raio */
  private corpo(cor: string, R: number) {
    const k = cor + '|' + Math.round(R * 2); let g = this.grads.get(k);
    if (!g) { g = this.c.createLinearGradient(-R, 0, R, 0); g.addColorStop(0, tom(cor, -0.62)); g.addColorStop(0.22, cor); g.addColorStop(0.4, tom(cor, 0.38)); g.addColorStop(0.62, cor); g.addColorStop(1, tom(cor, -0.7)); if (this.grads.size > 500) this.grads.clear(); this.grads.set(k, g); }
    return g;
  }
  /** gradiente de tampa abaulada, também local e em cache */
  tampa(cor: string, R: number) {
    const k = 't' + cor + '|' + Math.round(R * 2); let g = this.grads.get(k);
    if (!g) { g = this.c.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.05, 0, 0, R); g.addColorStop(0, tom(cor, 0.55)); g.addColorStop(0.55, cor); g.addColorStop(1, tom(cor, -0.35)); if (this.grads.size > 500) this.grads.clear(); this.grads.set(k, g); }
    return g;
  }
  mira(v: Vista, cam: Camera, camY = 0) { this.ox = v.ox; this.oy = v.oy; this.s = v.s; this.cam = cam; this.camY = camY; }
  p(x: number, y: number, z = 0): [number, number, number] { const q = proj(x, y - this.camY, z, this.cam); return [this.ox + q.sx * this.s, this.oy + q.sy * this.s, q.k * this.s]; }
  pisca(hz: number) { return Math.floor(this.t * hz * 2) % 2 === 0; }
  disco(x: number, y: number, r: number, cor: string, z = 0, a = 1) { const [X, Y, K] = this.p(x, y, z), c = this.c; c.globalAlpha = a; c.fillStyle = cor; c.beginPath(); c.arc(X, Y, Math.max(0.3, r * K), 0, TAU); c.fill(); c.globalAlpha = 1; }
  anel(x: number, y: number, r: number, cor: string, l = 2, z = 0, a = 1) { const [X, Y, K] = this.p(x, y, z), c = this.c; c.globalAlpha = a; c.strokeStyle = cor; c.lineWidth = l * K; c.beginPath(); c.arc(X, Y, Math.max(0.3, r * K), 0, TAU); c.stroke(); c.globalAlpha = 1; }
  cil(x: number, y: number, r: number, z: number, cor: string, topo?: string) {
    const [X0, Y0, K] = this.p(x, y, 0), [, Y1] = this.p(x, y, z), c = this.c, R = r * K, M = this.mat;
    // corpo com sombreamento cilíndrico (gradiente em cache) e saia metálica na base
    c.save(); c.translate(X0, 0);
    c.fillStyle = this.corpo(cor, R); c.beginPath(); c.arc(0, Y0, R, 0, Math.PI); c.lineTo(-R, Y1); c.arc(0, Y1, R, Math.PI, 0, true); c.closePath(); c.fill();
    if (z > 6 && R > 3 && !this.semBrilho) { c.strokeStyle = M.metal[1]; c.globalAlpha = 0.55; c.lineWidth = Math.max(0.6, R * 0.09); c.beginPath(); c.arc(0, Y0 - (Y0 - Y1) * 0.22, R, 0.05, Math.PI - 0.05); c.stroke(); c.globalAlpha = 1; }
    // tampa: domo, anel, facetado, vidro ou disco, conforme o material da máquina
    const tp = topo || cor; c.translate(0, Y1); c.fillStyle = this.tampa(tp, R); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
    c.lineWidth = Math.max(0.6, R * 0.12); c.strokeStyle = M.metal[2]; c.globalAlpha = 0.5; c.beginPath(); c.arc(0, 0, R * 0.93, 0, TAU); c.stroke();
    if (R > 5 && !this.semBrilho) {
      if (M.tampa === 'anel') { c.globalAlpha = 0.8; c.strokeStyle = M.metal[1]; c.beginPath(); c.arc(0, 0, R * 0.62, 0, TAU); c.stroke(); }
      else if (M.tampa === 'facetado') { c.globalAlpha = 0.3; c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(0.5, R * 0.05); c.beginPath(); for (let i = 0; i < 6; i++) { const q = i / 6 * TAU; c.moveTo(0, 0); c.lineTo(Math.cos(q) * R * 0.9, Math.sin(q) * R * 0.9); } c.stroke(); }
      else if (M.tampa === 'vidro') { c.globalAlpha = 0.35; c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(-R * 0.15, -R * 0.1, R * 0.62, R * 0.4, -0.5, 0, TAU); c.fill(); }
      else if (M.tampa === 'disco') { c.globalAlpha = 0.5; c.fillStyle = M.metal[0]; c.beginPath(); c.arc(0, 0, R * 0.3, 0, TAU); c.fill(); }
    }
    c.globalAlpha = 0.6; c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(-R * 0.34, -R * 0.36, R * 0.3, R * 0.18, -0.6, 0, TAU); c.fill();
    c.restore();
  }
  muro(ax: number, ay: number, bx: number, by: number, z: number, cor: string, l = 3) {
    const a0 = this.p(ax, ay, 0), b0 = this.p(bx, by, 0), a1 = this.p(ax, ay, z), b1 = this.p(bx, by, z), c = this.c;
    c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
    c.fillStyle = cor; c.fill(); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fill();
    // face de cima: cor da peça + fio de brilho do metal da máquina (cromo, latão, gelo…)
    const lw = l * (a1[2] + b1[2]) / 2;
    c.strokeStyle = tom(cor, -0.25); c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.stroke();
    c.strokeStyle = cor; c.lineWidth = lw * 0.62; c.beginPath(); c.moveTo(a1[0], a1[1] - lw * 0.12); c.lineTo(b1[0], b1[1] - lw * 0.12); c.stroke();
    if (z > 3) { c.strokeStyle = this.mat.metal[2]; c.globalAlpha = 0.5; c.lineWidth = Math.max(0.5, lw * 0.18); c.beginPath(); c.moveTo(a1[0], a1[1] - lw * 0.28); c.lineTo(b1[0], b1[1] - lw * 0.28); c.stroke(); c.globalAlpha = 1; }
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
    // R05: insertos em sprite (vidro facetado, aro, halo) quando a máquina tem skin
    if (this.skin) {
      const f = this.insert, fn = (cc: Ctx, RR: number) => formaInsert(cc, f, RR);
      poe(c, inserto(f, fn, cor, R, false), X, Y); if (on > 0.05) poe(c, inserto(f, fn, cor, R, true), X, Y, Math.min(1, on));
      if (rot && K > 0.55) { c.font = `700 ${Math.max(5, 5 * K)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = on > 0.5 ? '#ffffff' : 'rgba(220,226,255,0.5)'; c.fillText(rot, X, Y + R * 1.3); }
      return;
    }
    // modo econômico (toque): só a lente na forma da máquina e o núcleo, sem moldura nem reflexo
    if (this.semBrilho) {
      c.save(); c.translate(X, Y); c.scale(1, 0.88); c.globalAlpha = Math.min(1, 0.16 + on * 0.84); c.fillStyle = cor; formaInsert(c, this.insert, R); c.fill();
      if (on > 0.5) { c.globalAlpha = 0.75; c.fillStyle = '#ffffff'; formaInsert(c, this.insert, R * 0.42); c.fill(); } c.restore();
      if (rot && K > 0.55) { c.font = `800 ${Math.max(5, 5.2 * K)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = on > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.45)'; c.fillText(rot, X, Y + R * 1.3); }
      return;
    }
    // inserto: moldura escura, lente na forma da máquina, núcleo branco quando aceso
    c.save(); c.translate(X, Y); c.scale(1, 0.88);
    c.fillStyle = '#04050b'; formaInsert(c, this.insert, R * 1.22); c.fill();
    if (!this.semBrilho) { c.strokeStyle = this.mat.metal[1]; c.globalAlpha = 0.35; c.lineWidth = Math.max(0.5, R * 0.1); c.stroke(); }
    c.globalAlpha = Math.min(1, 0.14 + on * 0.86); c.fillStyle = on > 0.5 ? this.tampa(cor, R) : cor; formaInsert(c, this.insert, R); c.fill();
    if (on > 0.5) { c.globalAlpha = 0.75; c.fillStyle = '#ffffff'; formaInsert(c, this.insert, R * 0.42); c.fill(); }
    else if (!this.semBrilho) { c.globalAlpha = 0.22; c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(-R * 0.25, -R * 0.35, R * 0.4, R * 0.18, 0, 0, TAU); c.fill(); }
    c.restore();
    if (on > 0.5) this.glow(x, y, r * 1.9, cor, 0, on * 0.9);
    if (rot && K > 0.55) { c.font = `800 ${Math.max(5, 5.2 * K)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = on > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.45)'; c.fillText(rot, X, Y + R * 1.3); }
  }
}

/** contorno de inserto no tamanho R, centrado em 0 (seta e triângulo apontam para o fundo da mesa) */
export function formaInsert(c: Ctx, f: Insert, R: number) {
  c.beginPath();
  if (f === 'redondo') { c.arc(0, 0, R, 0, TAU); return; }
  if (f === 'gota') { c.moveTo(0, -R * 1.25); c.quadraticCurveTo(R * 1.05, R * 0.1, 0, R); c.quadraticCurveTo(-R * 1.05, R * 0.1, 0, -R * 1.25); return; }
  if (f === 'seta') { c.moveTo(0, -R * 1.3); c.lineTo(R, -R * 0.1); c.lineTo(R * 0.45, -R * 0.1); c.lineTo(R * 0.45, R); c.lineTo(-R * 0.45, R); c.lineTo(-R * 0.45, -R * 0.1); c.lineTo(-R, -R * 0.1); c.closePath(); return; }
  if (f === 'escudo') { c.moveTo(-R, -R); c.lineTo(R, -R); c.lineTo(R, R * 0.1); c.quadraticCurveTo(R * 0.8, R * 0.85, 0, R * 1.2); c.quadraticCurveTo(-R * 0.8, R * 0.85, -R, R * 0.1); c.closePath(); return; }
  const n = f === 'estrela' ? 10 : f === 'hex' ? 6 : f === 'triangulo' ? 3 : 4, rot = f === 'quadrado' ? Math.PI / 4 : -Math.PI / 2;
  for (let i = 0; i < n; i++) { const q = rot + i / n * TAU, rr = f === 'estrela' ? (i % 2 ? R * 0.5 : R * 1.15) : f === 'losango' ? R * (i % 2 ? 0.9 : 1.25) : f === 'quadrado' ? R * 1.2 : R * 1.12; c.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); }
  c.closePath();
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
  if (g.skin) { g.skin.paredes(g, segs); return; }
  segs.sort((a, b) => Math.max(a.ay, a.by) - Math.max(b.ay, b.by));
  for (const s of segs) g.muro(s.ax, s.ay, s.bx, s.by, s.z ?? (s.tipo === 'piso' ? 4 : 12), s.cor || '#8890b8', s.tipo === 'porta' ? 2 : 3);
}

interface Base { chave: string; tela: HTMLCanvasElement; mx: number; my: number }
const bases = new Map<string, Base>();

/** Camada parada: tablado deformado + paredes fixas. Refeita só quando a tela ou a máquina muda. */
function camadaBase(id: string, campo: Campo, tex: HTMLCanvasElement, v: Vista, cam: Camera, skin: Skin | null = null): Base {
  const chave = `${id}|${v.s.toFixed(4)}|${cam.P}|${cam.CURVA}|${campo.segs.length}|${skin ? 's' : ''}`;
  const velha = bases.get(id); if (velha && velha.chave === chave) return velha;
  const mx = 30 * v.s, my = 40 * v.s, [tela, c] = novaTela(W * v.s + mx * 2, H * v.s + my * 2);
  const vv = { ox: mx, oy: my, s: v.s };
  deforma(c, tex, vv, cam, 1);
  const g = new Pintor(c); g.skin = skin; g.mira(vv, cam); paredes(g, campo, true);
  const b = { chave, tela, mx, my }; bases.set(id, b); if (bases.size > 6) bases.delete(bases.keys().next().value!);
  return b;
}

/** Pinta a camada parada da mesa num canvas qualquer (usado para montar o fundo pré-renderizado). */
export function pintaBase(c: Ctx, id: string, campo: Campo, tex: HTMLCanvasElement, v: Vista, cam: Camera, skin: Skin | null = null) { const b = camadaBase(id, campo, tex, v, cam, skin); c.drawImage(b.tela, v.ox - b.mx, v.oy - b.my); }

function palheta(g: Pintor, p: Palheta, c1: string, c2: string) {
  const c = g.c, M = g.skin ? { ...g.mat, borracha: g.skin.palheta.borracha } : g.mat;
  if (g.skin) { c1 = g.skin.palheta.corpo; c2 = g.skin.palheta.base; }
  const casca = (z: number, esc: number) => {
    const a = g.p(p.px, p.py + (z === 0 ? 3 : 0), z), b = g.p(p.tx, p.ty + (z === 0 ? 3 : 0), z);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r0 = p.r0 * a[2] * esc, r1 = p.r1 * b[2] * esc;
    c.beginPath(); c.arc(a[0], a[1], r0, ang + Math.PI / 2, ang - Math.PI / 2); c.arc(b[0], b[1], r1, ang - Math.PI / 2, ang + Math.PI / 2); c.closePath();
    return a;
  };
  casca(0, 1); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fill();
  casca(5, 1); c.fillStyle = tom(c2, -0.35); c.fill();
  // corpo com anel de borracha e reflexo
  const a = casca(9, 1), gr = c.createLinearGradient(a[0], a[1] - 6 * a[2], a[0], a[1] + 6 * a[2]); gr.addColorStop(0, tom(c1, 0.5)); gr.addColorStop(0.5, c1); gr.addColorStop(1, tom(c1, -0.35));
  c.fillStyle = gr; c.fill(); c.strokeStyle = M.borracha; c.lineWidth = 1.7 * a[2]; c.stroke();
  casca(9.5, 0.4); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill();
  // pivô de metal
  const pv = g.p(p.px, p.py, 10), R = 2.8 * pv[2], rg = c.createRadialGradient(pv[0] - R * 0.3, pv[1] - R * 0.3, R * 0.1, pv[0], pv[1], R);
  rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.5, M.metal[1]); rg.addColorStop(1, M.metal[0]); c.fillStyle = rg; c.beginPath(); c.arc(pv[0], pv[1], R, 0, TAU); c.fill();
}

export function desenhaBola(g: Pintor, b: { x: number; y: number; z: number; r: number; cor?: string; rastro: number[] }, cor: string) {
  if (b.z < -1) return;
  const c = g.c, r = b.rastro;
  if (!g.semBrilho) for (let i = 0; i < r.length - 2; i += 2) { const u = i / r.length; g.disco(r[i], r[i + 1], b.r * (0.3 + u * 0.6), b.cor || cor, 7 + b.z, u * 0.28); }
  const [sx, sy, sk] = g.p(b.x, b.y + 2, 0);
  c.fillStyle = 'rgba(0,0,0,0.6)'; c.beginPath(); c.ellipse(sx, sy, b.r * sk * (1 + b.z * 0.01), b.r * sk * 0.45, 0, 0, TAU); c.fill();
  const [X, Y, K] = g.p(b.x, b.y, 7 + b.z), R = b.r * K;
  // halo escuro curto: separa a bola de qualquer arte clara por trás
  const hl = c.createRadialGradient(X, Y, R * 0.9, X, Y, R * 2.1); hl.addColorStop(0, 'rgba(0,0,8,0.45)'); hl.addColorStop(1, 'rgba(0,0,8,0)'); c.fillStyle = hl; c.beginPath(); c.arc(X, Y, R * 2.1, 0, TAU); c.fill();
  // aço cromado: reflexo da luz da máquina embaixo, contorno escuro para ler sobre arte clara
  const gr = c.createRadialGradient(X - R * 0.35, Y - R * 0.4, R * 0.08, X, Y, R);
  if (b.cor) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, b.cor); gr.addColorStop(1, '#111'); }
  else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, '#eef2ff'); gr.addColorStop(0.62, '#a3abc4'); gr.addColorStop(0.88, '#454b66'); gr.addColorStop(1, '#1b1e2c'); }
  c.fillStyle = gr; c.beginPath(); c.arc(X, Y, R, 0, TAU); c.fill();
  c.save(); c.clip(); c.globalAlpha = 0.4; c.fillStyle = g.luzCor; c.beginPath(); c.ellipse(X, Y + R * 0.6, R * 0.95, R * 0.28, 0, 0, TAU); c.fill(); c.restore();
  c.strokeStyle = 'rgba(5,6,14,0.75)'; c.lineWidth = Math.max(0.6, R * 0.12); c.beginPath(); c.arc(X, Y, R, 0, TAU); c.stroke();
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(X - R * 0.38, Y - R * 0.42, R * 0.2, 0, TAU); c.fill();
  g.glow(b.x, b.y, b.r * 1.7, b.cor || cor, 7 + b.z, 0.55);
}

export const semEtapa: Record<string, boolean> = {};
export interface OpcoesCampo { id: string; tex: HTMLCanvasElement; cores: { c1: string; c2: string; c3: string }; lancador?: number; passo?: number; semBase?: boolean; basePronta?: boolean; ambiente?: (g: Pintor) => void; jogo?: Game }

/** Desenha um campo inteiro: base parada, luzes, peças em ordem de pintor, palhetas e bolas. */
export function desenhaCampo(g: Pintor, campo: Campo, v: Vista, cam: Camera, o: OpcoesCampo) {
  g.mira(v, cam, campo.camY);
  const c = g.c;
  if (o.semBase) {
    // campo em rolagem (túnel): fundo simples e faixas que correm, paredes desenhadas ao vivo
    const q = [g.p(40, campo.camY), g.p(340, campo.camY), g.p(340, campo.camY + H), g.p(40, campo.camY + H)];
    if (g.skin?.tunel) g.skin.tunel(g, campo); else { c.fillStyle = '#05060f'; c.beginPath(); q.forEach(p => c.lineTo(p[0], p[1])); c.fill(); }
    for (let y = Math.floor(campo.camY / 80) * 80; y < campo.camY + H; y += 80) g.linha([[40, y, 0], [340, y, 0]], o.cores.c3, 2, 0.25);
    for (const s of campo.segs) if (!s.invisivel && !s.off && !s.dono && Math.max(s.ay, s.by) > campo.camY - 20 && Math.min(s.ay, s.by) < campo.camY + H + 20) g.muro(s.ax, Math.max(campo.camY - 10, s.ay), s.bx, Math.max(campo.camY - 10, s.by), 12, s.cor || '#889', 3);
  } else if (o.passo) { deforma(c, o.tex, v, cam, o.passo); paredes(g, campo, true); }
  else if (!semEtapa.base && !o.basePronta) { const b = camadaBase(o.id, campo, o.tex, v, cam, g.skin); c.drawImage(b.tela, v.ox - b.mx, v.oy - b.my); }
  const visivel = (y: number) => y > campo.camY - 40 && y < campo.camY + H + 40;
  const S = g.skin;
  if (S && o.jogo && !semEtapa.luzR05) S.antesPecas(g, o.jogo);
  if (o.ambiente && !semEtapa.ambiente) o.ambiente(g);
  if (!semEtapa.luzes) for (const p of campo.pecas) if (p.luzes && visivel(p.y)) { const f = S?.luzes[p.tipo]; if (f === null) continue; if (f) f(g, p); else p.luzes(g); }
  const lista: { y: number; f: () => void }[] = [];
  if (!semEtapa.pecas) for (const p of campo.pecas) { if (semEtapa['p_' + p.tipo]) continue; const f = S?.pecas[p.tipo]; if ((f || p.desenhar) && visivel(p.y)) lista.push({ y: p.y, f: f ? () => f(g, p) : () => p.desenhar!(g) }); }
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
