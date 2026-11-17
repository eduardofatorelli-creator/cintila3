// R05 · Aurora, protótipo definitivo: peças com material (sprites), luz por fonte e insertos de estado da partida.
// Tudo lê a peça real: posição, flash, aceso, off, vida do chefe. Nenhuma colisão ou regra é tocada.
import type { Seg } from '../../core/physics';
import type { Game } from '../../game/rules';
import { formaInsert, type Pintor } from '../../render/playfield';
import { alfa, tom } from '../pincel';
import { auroraTablado, auroraVidro } from './aurora-arte';
import { SKINS, type Skin } from './skin';
import { bumper, cromo, inserto, luzMacia, poe, poste, saucer, sprite } from './sprites';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
export const AURORA = { ciano: '#7df9ff', violeta: '#b48cff', rosa: '#ff6fb5', ouro: '#ffd27a', rubra: '#ff3355', gelo: '#e8fbff' };
const A = AURORA;
const COR_BUMPER = { corpo: '#4a3a9a', tampa: '#5fd8f0', luz: A.ciano, decal: '#f4fbff' };

// ---------- inserto em sprite (forma estrela da Aurora) ----------
const estrela = (c: Ctx, R: number) => formaInsert(c, 'estrela', R);
const redondo = (c: Ctx, R: number) => formaInsert(c, 'redondo', R);
const seta = (c: Ctx, R: number) => formaInsert(c, 'seta', R);
export function insertoSpr(g: Pintor, x: number, y: number, r: number, cor: string, on: number, forma: 'estrela' | 'redondo' | 'seta' = 'estrela', rot?: string) {
  const [X, Y, K] = g.p(x, y, 0), R = r * K, f = forma === 'estrela' ? estrela : forma === 'seta' ? seta : redondo, c = g.c;
  poe(c, inserto(forma, f, cor, R, false), X, Y);
  if (on > 0.05) poe(c, inserto(forma, f, cor, R, true), X, Y, Math.min(1, on));
  if (rot && K > 0.5) { c.font = `700 ${Math.max(5, 5 * K)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = on > 0.5 ? '#ffffff' : 'rgba(220,226,255,0.5)'; c.fillText(rot, X, Y + R * 1.25); }
}

// ---------- cache de peça parada ----------
/** desenha a peça uma vez num canvas do tamanho da caixa dela (em unidades de mesa) e só copia nos quadros seguintes;
 *  a chave inclui a escala e a resolução; o deslocamento da vista (tremor) entra na cópia, não no cache */
const pecasCache = new Map<string, { c: HTMLCanvasElement; x: number; y: number; w: number; h: number }>();
function cacheado(g: Pintor, chave: string, caixa: [number, number, number, number, number], f: () => void) {
  const k = chave + '|' + g.s.toFixed(4) + '|' + g.cam.P + '|' + devicePixelRatio; let e = pecasCache.get(k);
  if (!e) {
    const ox = g.ox, oy = g.oy, c0 = g.c; g.ox = 0; g.oy = 0;
    const pts = [[caixa[0], caixa[1], 0], [caixa[2], caixa[1], 0], [caixa[0], caixa[3], 0], [caixa[2], caixa[3], 0], [caixa[0], caixa[1], caixa[4]], [caixa[2], caixa[1], caixa[4]], [caixa[0], caixa[3], caixa[4]], [caixa[2], caixa[3], caixa[4]]].map(q => g.p(q[0], q[1], q[2]));
    const x = Math.floor(Math.min(...pts.map(q => q[0]))) - 6, y = Math.floor(Math.min(...pts.map(q => q[1]))) - 6, w = Math.ceil(Math.max(...pts.map(q => q[0]))) + 6 - x, h = Math.ceil(Math.max(...pts.map(q => q[1]))) + 6 - y;
    const R = Math.min(2, devicePixelRatio || 1), cv = document.createElement('canvas'); cv.width = Math.ceil(w * R); cv.height = Math.ceil(h * R); const cc = cv.getContext('2d')!; cc.scale(R, R); cc.translate(-x, -y);
    g.c = cc; try { f(); } finally { g.c = c0; g.ox = ox; g.oy = oy; }
    e = { c: cv, x, y, w, h }; if (pecasCache.size > 40) pecasCache.clear(); pecasCache.set(k, e);
  }
  g.c.drawImage(e.c, g.ox + e.x, g.oy + e.y, e.w, e.h);
}

// ---------- peças ----------
function pBumper(g: Pintor, b: any) {
  const [X, Y, K] = g.p(b.x, b.y, 0), R = b.r * K * 0.96, Hz = 16 * 1.35 * K;
  poe(g.c, bumper(R, Hz, COR_BUMPER, false), X, Y);
  // modo econômico: a camada acesa só aparece no flash (no desktop ela também dá a luz interna constante)
  if (!g.semBrilho || b.flash > 0) poe(g.c, bumper(R, Hz, COR_BUMPER, true), X, Y, (g.semBrilho ? 0 : 0.28) + b.flash * 0.72);
}

function pEstilingue(g: Pintor, e: any) {
  if (e.flash <= 0) { const s = e.s; cacheado(g, 'sl' + s.ax + ',' + s.ay, [Math.min(s.ax, s.bx) - 8, Math.min(s.ay, s.by, 624) - 8, Math.max(s.ax, s.bx) + 8, Math.max(s.ay, s.by, 624) + 8, 16], () => estilingue(g, e)); return; }
  estilingue(g, e);
}
function estilingue(g: Pintor, e: any) {
  const s = e.s, f = e.flash, c = g.c, kick = f * 2.2;
  const A0 = g.p(s.ax, s.ay, 10), C0 = g.p(s.ax, 624, 10), B0 = g.p(s.bx, s.by, 10);
  // plástico translúcido serigrafado
  c.beginPath(); c.moveTo(A0[0], A0[1]); c.lineTo(C0[0], C0[1]); c.lineTo(B0[0], B0[1]); c.closePath();
  const gr = c.createLinearGradient(A0[0], A0[1], C0[0], C0[1]); gr.addColorStop(0, alfa(A.violeta, 0.55 + f * 0.3)); gr.addColorStop(1, alfa('#2a1d5c', 0.85));
  c.fillStyle = gr; c.fill();
  const cx = (A0[0] + B0[0] + C0[0]) / 3, cy = (A0[1] + B0[1] + C0[1]) / 3, rs = A0[2] * 6;
  c.fillStyle = f > 0.2 ? '#ffffff' : alfa(A.gelo, 0.75); c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? rs * 0.4 : rs; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.fill();
  c.strokeStyle = alfa('#d8dcff', 0.7); c.lineWidth = Math.max(0.8, A0[2] * 1.1); c.stroke();
  c.beginPath(); c.moveTo(A0[0], A0[1]); c.lineTo(C0[0], C0[1]); c.lineTo(B0[0], B0[1]); c.strokeStyle = cromo(c, Math.min(A0[0], B0[0]) - 4, Math.max(A0[0], B0[0]) + 4); c.lineWidth = Math.max(1, A0[2] * 1.6); c.stroke();
  // borracha: faixa branca com sombra, empurrada para fora no chute
  const n = [e.nx * kick, e.ny * kick], a1 = g.p(s.ax + n[0], s.ay + n[1], 7), b1 = g.p(s.bx + n[0], s.by + n[1], 7);
  c.lineCap = 'round'; c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 5 * a1[2]; c.beginPath(); c.moveTo(a1[0] + 1, a1[1] + 2); c.lineTo(b1[0] + 1, b1[1] + 2); c.stroke();
  c.strokeStyle = f > 0.2 ? '#ffffff' : '#e6e9f5'; c.lineWidth = 3.6 * a1[2]; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.stroke();
  c.strokeStyle = 'rgba(120,128,160,0.8)'; c.lineWidth = 1 * a1[2]; c.beginPath(); c.moveTo(a1[0], a1[1] + 1.2 * a1[2]); c.lineTo(b1[0], b1[1] + 1.2 * a1[2]); c.stroke();
  for (const [x, y] of [[s.ax, s.ay], [s.bx, s.by], [s.ax, 624]]) { const [X, Y, K] = g.p(x, y, 0); poe(c, poste(4.2 * K, 12 * 1.35 * K), X, Y); }
  if (f > 0) g.glow((s.ax + s.bx) / 2, (s.ay + s.by) / 2, 30, A.violeta, 10, f);
}

function pPoste(g: Pintor, p: any) { if (p.c.off) return; const [X, Y, K] = g.p(p.x, p.y, 0); poe(g.c, poste(p.c.r * K, 10 * 1.35 * K), X, Y); }
function pPosteCentral(g: Pintor, p: any) {
  if (p.c.off) { g.disco(190, 718, 5, '#000', 0.2, 0.8); if (!p.forcado) g.anel(190, 718, 9, '#7dffb0', 2, 0.3, p.recarga); return; }
  const [X, Y, K] = g.p(190, 718, 0); poe(g.c, poste(4.8 * K, 11 * 1.35 * K, '#9dffc8', '#eafff2'), X, Y);
}

function pAlvo(g: Pintor, a: any) {
  if (a.s.off) return;
  const s = a.s, c = g.c, h = 4 + 9 * (a.vidasMax > 1 ? a.vidas / a.vidasMax : 1);
  const a0 = g.p(s.ax, s.ay, 1), b0 = g.p(s.bx, s.by, 1), a1 = g.p(s.ax, s.ay, h), b1 = g.p(s.bx, s.by, h);
  // suporte de metal
  c.strokeStyle = '#1a1c28'; c.lineWidth = 3 * a0[2]; c.beginPath(); c.moveTo(a0[0], a0[1] + 2); c.lineTo(b0[0], b0[1] + 2); c.stroke();
  // face de plástico dourado com estrela; acesa vira ciano iluminado
  const lit = a.flash > 0.3 ? '#ffffff' : a.aceso ? A.ciano : A.ouro;
  c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
  const gr = c.createLinearGradient(0, a1[1], 0, a0[1]); gr.addColorStop(0, tom(lit, 0.45)); gr.addColorStop(0.5, lit); gr.addColorStop(1, tom(lit, -0.45)); c.fillStyle = gr; c.fill();
  c.strokeStyle = tom(lit, -0.6); c.lineWidth = Math.max(0.6, a0[2]); c.stroke();
  const mx = (a0[0] + b0[0] + a1[0] + b1[0]) / 4, my = (a0[1] + b0[1] + a1[1] + b1[1]) / 4, r = Math.max(2, a0[2] * 3.2);
  if (a.rotulo) { c.font = `800 ${Math.max(6, 6.5 * a0[2])}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#10142a'; c.fillText(a.rotulo, mx, my + 0.5); }
  else { c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); for (let i = 0; i < 10; i++) { const q = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; c.lineTo(mx + Math.cos(q) * rr, my + Math.sin(q) * rr); } c.fill(); }
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = Math.max(0.5, a0[2] * 0.7); c.beginPath(); c.moveTo(a1[0], a1[1] + 0.6); c.lineTo(b1[0], b1[1] + 0.6); c.stroke();
  if (a.flash > 0) g.glow(a.x, a.y, 18, A.ciano, 8, a.flash);
}

function pBanco(g: Pintor, b: any) {
  const c = g.c;
  for (const s of b.alvos as Seg[]) {
    const h = s.off ? 1.2 : 11, a0 = g.p(s.ax, s.ay, 0), b0 = g.p(s.bx, s.by, 0), a1 = g.p(s.ax, s.ay, h), b1 = g.p(s.bx, s.by, h);
    c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
    if (s.off) { c.fillStyle = '#05050c'; c.fill(); c.strokeStyle = 'rgba(160,170,210,0.35)'; c.lineWidth = 1; c.stroke(); continue; }
    const cor = b.flash > 0.4 ? '#ffffff' : A.violeta, gr = c.createLinearGradient(0, a1[1], 0, a0[1]); gr.addColorStop(0, tom(cor, 0.5)); gr.addColorStop(0.55, cor); gr.addColorStop(1, tom(cor, -0.5));
    c.fillStyle = gr; c.fill(); c.strokeStyle = tom(cor, -0.6); c.lineWidth = Math.max(0.6, a0[2]); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = Math.max(0.5, a0[2] * 0.8); c.beginPath(); c.moveTo(a1[0], a1[1] + 0.6); c.lineTo(b1[0], b1[1] + 0.6); c.stroke();
    c.fillStyle = alfa('#ffffff', 0.85); const mx = (a0[0] + b1[0]) / 2, my = (a0[1] + b1[1]) / 2; c.beginPath(); c.arc(mx, my, Math.max(1, a0[2] * 1.3), 0, TAU); c.fill();
  }
}

/** rampa de acrílico com trilhos de arame cromado e colunas de apoio, sobre o caminho real */
function pRampa(g: Pintor, r: any) {
  if (r.flash <= 0.2 && !r.bloqueada) { const P = r.caminho as number[][]; cacheado(g, 'rp' + r.lado + r.mx, [Math.min(...P.map(q => q[0])) - 12, Math.min(...P.map(q => q[1])) - 12, Math.max(...P.map(q => q[0])) + 12, Math.max(...P.map(q => q[1])) + 12, 34], () => rampa(g, r)); return; }
  rampa(g, r);
}
function rampa(g: Pintor, r: any) {
  const P = r.caminho as number[][], c = g.c, n = P.length, aceso = r.flash > 0.2;
  const lado = (i: number, d: number) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [P[i][0] - dy / L * d, P[i][1] + dx / L * d, P[i][2]]; };
  const E = P.map((_, i) => lado(i, -8)), D = P.map((_, i) => lado(i, 8));
  // colunas
  for (let i = 1; i < n - 1; i++) for (const q of [E[i], D[i]]) { const b0 = g.p(q[0], q[1], 0), t0 = g.p(q[0], q[1], q[2]); c.strokeStyle = '#6a7290'; c.lineWidth = Math.max(0.8, 1.6 * b0[2]); c.beginPath(); c.moveTo(b0[0], b0[1]); c.lineTo(t0[0], t0[1]); c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.5; c.stroke(); }
  // piso de acrílico translúcido
  c.beginPath(); E.forEach((q, i) => { const p = g.p(q[0], q[1], q[2]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); for (let i = n - 1; i >= 0; i--) { const p = g.p(D[i][0], D[i][1], D[i][2]); c.lineTo(p[0], p[1]); } c.closePath();
  c.fillStyle = alfa(aceso ? A.ciano : '#9fd8ff', aceso ? 0.28 : 0.13); c.fill(); c.strokeStyle = alfa('#ffffff', 0.18); c.lineWidth = 1; c.stroke();
  // trilhos cromados (escuro, médio, brilho)
  for (const L of [E, D]) for (const [cor, l, dz] of [['#151826', 3.4, 3], ['#b9c3e4', 2, 3.6], ['#ffffff', 0.7, 4.3]] as [string, number, number][]) {
    c.strokeStyle = cor; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); let K = 1; L.forEach((q, i) => { const p = g.p(q[0], q[1], q[2] + dz); K = p[2]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.lineWidth = l * K; c.stroke();
  }
  if (r.bloqueada) g.muro(r.mx - 16, 394, r.mx + 16, 394, 14, '#ff3355', 4);
}

function pSaucer(g: Pintor, s: any) {
  const [X, Y, K] = g.p(s.x, s.y, 0); poe(g.c, saucer((s.raio + 2) * K, A.ciano), X, Y, s.ativo === false ? 0.6 : 1);
  if (s.flash > 0 || s.bola) g.glow(s.x, s.y, 22, A.ciano, 2, 0.5 + s.flash * 0.5);
}

function pGiro(g: Pintor, s: any) {
  const c = g.c, h = Math.abs(Math.cos(s.ang)) * 9 + 1, fr = Math.cos(s.ang) > 0;
  for (const dx of [-16, 16]) { const [X, Y, K] = g.p(s.x + dx, s.y, 0); poe(c, poste(2.2 * K, 15 * 1.35 * K, '#b9c3e4', '#ffffff'), X, Y); }
  const a = g.p(s.x - 16, s.y, 15), b = g.p(s.x + 16, s.y, 15); c.strokeStyle = cromo(c, a[0], b[0]); c.lineWidth = 1.6 * a[2]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  const pts = [[s.x - 14, s.y, 12 - h], [s.x + 14, s.y, 12 - h], [s.x + 14, s.y, 12 + h], [s.x - 14, s.y, 12 + h]].map(q => g.p(q[0], q[1], q[2]));
  c.beginPath(); pts.forEach(p => c.lineTo(p[0], p[1])); c.closePath(); c.fillStyle = fr ? cromo(c, pts[0][0], pts[1][0]) : '#2a2f48'; c.fill();
  if (fr && h > 3) { c.fillStyle = alfa(A.ciano, 0.85); c.font = `800 ${Math.max(5, 5 * a[2])}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✦', (pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[2][1]) / 2); }
}

/** Estrela Rubra: pedestal cromado, estrela facetada de rubi com aro de ouro, núcleo incandescente e olhos que seguem a bola */
function estrelaSpr(R: number, n: number, branca: boolean) {
  R = Math.round(R * 4) / 4; const m = R * 1.5;
  return sprite(`er|${R}|${n}|${branca}`, m * 2, m * 2, m, m, c => {
    const luz = -Math.PI * 0.75, base = branca ? '#ffffff' : A.rubra;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i / n * TAU, l = a - Math.PI / n, r = a + Math.PI / n, ri = R * 0.48;
      const tip = [Math.cos(a) * R, Math.sin(a) * R], pl = [Math.cos(l) * ri, Math.sin(l) * ri], pr = [Math.cos(r) * ri, Math.sin(r) * ri];
      const s1 = 0.5 + 0.5 * Math.cos(a - 0.35 - luz), s2 = 0.5 + 0.5 * Math.cos(a + 0.35 - luz);
      c.fillStyle = tom(base, -0.55 + s1 * 0.8); c.beginPath(); c.moveTo(0, 0); c.lineTo(tip[0], tip[1]); c.lineTo(pl[0], pl[1]); c.closePath(); c.fill();
      c.fillStyle = tom(base, -0.55 + s2 * 0.8); c.beginPath(); c.moveTo(0, 0); c.lineTo(tip[0], tip[1]); c.lineTo(pr[0], pr[1]); c.closePath(); c.fill();
    }
    // aro de ouro
    c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? R * 0.48 : R; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath();
    const go = c.createLinearGradient(-R, -R, R, R); go.addColorStop(0, '#fff3c4'); go.addColorStop(0.35, '#e0a93c'); go.addColorStop(0.6, '#7a4a10'); go.addColorStop(1, '#ffd98a');
    c.strokeStyle = go; c.lineWidth = Math.max(1, R * 0.07); c.lineJoin = 'round'; c.stroke();
    // núcleo incandescente (rosto)
    const gc = c.createRadialGradient(-R * 0.08, -R * 0.12, R * 0.02, 0, 0, R * 0.46); gc.addColorStop(0, branca ? '#ffffff' : '#ffe0c0'); gc.addColorStop(0.45, branca ? '#ffffff' : '#ff6a4a'); gc.addColorStop(1, branca ? '#ffe6ea' : '#8a0a26');
    c.fillStyle = gc; c.beginPath(); c.arc(0, 0, R * 0.44, 0, TAU); c.fill(); c.strokeStyle = go; c.lineWidth = Math.max(0.8, R * 0.045); c.stroke();
  });
}
function pChefe(g: Pintor, ch: any) {
  if (ch.c.off) return;
  const c = g.c, t = g.t, [X0, Y0, K] = g.p(ch.x, ch.y, 0);
  // pedestal e poça de luz rubra embaixo
  poe(c, bumper(20 * K, 12 * 1.35 * K, { corpo: '#3a0f22', tampa: '#5a1a2e', luz: A.rubra, decal: '#5a1a2e' }, ch.dor > 0.3), X0, Y0);
  const bob = Math.sin(t * 2.2) * 1.6, [X, Y, KK] = g.p(ch.x, ch.y, 26 + bob), R = 22 * KK * 1.18;
  // halo giratório de raios
  if (!g.semBrilho) { c.save(); c.translate(X, Y); c.globalCompositeOperation = 'lighter';
  poe(c, luzMacia(A.rubra, R * 2.4), 0, 0, 0.35 + ch.dor * 0.5);
  c.rotate(t * 0.4); c.strokeStyle = alfa(A.ouro, 0.55); c.lineWidth = Math.max(0.8, KK * 0.9);
  c.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r0 = R * 1.12, r1 = R * (i % 2 ? 1.22 : 1.36); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); } c.stroke();
  c.beginPath(); c.arc(0, 0, R * 1.12, 0, TAU); c.stroke(); c.restore(); }
  // estrela
  const n = ch.forma?.pontas || 6, pul = 1 + Math.sin(t * 3) * 0.03 + ch.dor * 0.1;
  c.save(); c.translate(X, Y); c.rotate(Math.sin(t * 0.7) * 0.12); c.scale(pul, pul);
  poe(c, estrelaSpr(R, n, false), 0, 0); if (ch.dor > 0.05) poe(c, estrelaSpr(R, n, true), 0, 0, ch.dor);
  // olhos que seguem a bola
  const b = ch.C?.bolas?.[0], dx = b ? Math.max(-1, Math.min(1, (b.x - ch.x) / 120)) : 0, dy = b ? Math.max(-1, Math.min(1, (b.y - ch.y) / 160)) : 0;
  for (const s of [-1, 1]) {
    const ex = s * R * 0.17, ey = -R * 0.06; c.fillStyle = '#fff6f0'; c.beginPath(); c.ellipse(ex, ey, R * 0.1, ch.dor > 0.3 ? R * 0.04 : R * 0.13, 0, 0, TAU); c.fill();
    c.fillStyle = '#2a0610'; c.beginPath(); c.arc(ex + dx * R * 0.04, ey + dy * R * 0.05, R * 0.05, 0, TAU); c.fill();
  }
  c.strokeStyle = '#3a0612'; c.lineWidth = Math.max(0.8, R * 0.04); c.beginPath(); if (ch.dor > 0.2) c.arc(0, R * 0.24, R * 0.1, Math.PI * 1.1, Math.PI * 1.9); else c.arc(0, R * 0.08, R * 0.13, 0.35, Math.PI - 0.35); c.stroke();
  if (ch.protegido) { c.strokeStyle = alfa('#9fe8ff', 0.6 + Math.sin(t * 6) * 0.3); c.lineWidth = Math.max(1, R * 0.06); c.beginPath(); c.arc(0, 0, R * 1.45, 0, TAU); c.stroke(); }
  c.restore();
}

// ---------- paredes: trilho cromado com fio de luz violeta ----------
function paredes(g: Pintor, segs: Seg[]) {
  const c = g.c, ord = segs.slice().sort((a, b) => Math.max(a.ay, a.by) - Math.max(b.ay, b.by));
  for (const s of ord) {
    const z = s.z ?? (s.tipo === 'piso' ? 4 : 12), a0 = g.p(s.ax, s.ay, 0), b0 = g.p(s.bx, s.by, 0), a1 = g.p(s.ax, s.ay, z), b1 = g.p(s.bx, s.by, z), K = (a1[2] + b1[2]) / 2;
    c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
    const gr = c.createLinearGradient(0, Math.min(a1[1], b1[1]), 0, Math.max(a0[1], b0[1])); gr.addColorStop(0, '#2a2450'); gr.addColorStop(1, '#07060f'); c.fillStyle = gr; c.fill();
    const lw = (s.tipo === 'porta' ? 2 : 3.2) * K; c.lineCap = 'round';
    for (const [cor, l, o] of [['#0a0914', 1.35, 0], [alfa(A.violeta, 0.55), 1.0, -0.05], ['#c3cbe8', 0.62, -0.18], ['#ffffff', 0.2, -0.32]] as [string, number, number][]) { c.strokeStyle = cor; c.lineWidth = lw * l; c.beginPath(); c.moveTo(a1[0], a1[1] + lw * o); c.lineTo(b1[0], b1[1] + lw * o); c.stroke(); }
  }
}

// ---------- antes das peças: luz por fonte e insertos de estado ----------
/** posições dos insertos de estado, na zona baixa (entre os estilingues, acima das palhetas) — só tinta, sem colisão */
export const ESTADO = {
  bonus: [[150, 606], [170, 598], [190, 595], [210, 598], [230, 606]] as number[][],
  missoes: [[150, 552], [170, 552], [190, 552], [210, 552], [230, 552]] as number[][],
  protegida: [190, 668] as number[],
};
function antesPecas(g: Pintor, J: Game) {
  const c = g.c, t = g.t, M = J.m;
  c.save(); c.globalCompositeOperation = 'lighter';
  const poça = (x: number, y: number, r: number, cor: string, a: number) => { if (a <= 0.02) return; const [X, Y, K] = g.p(x, y, 0); poe(c, luzMacia(cor, r * K), X, Y, Math.min(1, a)); };
  const eco = g.semBrilho; // econômico: só as poças que mudam (flash); as constantes já estão pintadas no tablado
  for (const b of M.bumpers) poça(b.x, b.y + 4, b.r * 2.8, A.ciano, (eco ? 0 : 0.16) + b.flash * 0.55);
  for (const p of J.mesa.pecas as any[]) {
    if (p.tipo === 'estilingue' && p.flash > 0) poça((p.s.ax + p.s.bx) / 2, (p.s.ay + p.s.by) / 2, 46, A.violeta, p.flash * 0.6);
    else if ((p.tipo === 'portal' || p.tipo === 'travaDeBola') && (p.flash > 0 || p.bola)) poça(p.x, p.y, 34, A.ciano, 0.25 + p.flash * 0.4);
    else if (p.tipo === 'alvoFixo' && !p.s.off && (p.aceso || p.vale)) poça(p.x, p.y + 6, 22, p.aceso ? A.ciano : A.ouro, p.aceso ? 0.22 : 0.12 + (Math.sin(t * 8) > 0 ? 0.12 : 0));
  }
  const ch = M.chefe; if (!ch.c.off) poça(ch.x, ch.y + 6, 58, A.rubra, (eco ? 0 : 0.16 + Math.sin(t * 2.2) * 0.04) + ch.dor * 0.5 + (ch.vida === 1 ? 0.12 : 0));
  c.restore();
  // insertos de estado (luzes embutidas na zona baixa)
  const nb = Math.min(5, Math.max(0, J.bonusX - 1));
  ESTADO.bonus.forEach((q, i) => insertoSpr(g, q[0], q[1], 4.6, A.ouro, i < nb ? 1 : 0, 'estrela'));
  J.missoes.forEach((m, i) => { const q = ESTADO.missoes[i]; if (q) insertoSpr(g, q[0], q[1], 3.6, A.ciano, m.feita ? 1 : i === J.missaoAtiva ? (Math.sin(t * 7) > 0 ? 1 : 0.15) : 0, 'redondo'); });
  const sal = J.salva > 0 && J.estado === 'jogo'; insertoSpr(g, ESTADO.protegida[0], ESTADO.protegida[1], 6.5, '#7dffb0', sal ? (J.salva < 3 ? (Math.sin(t * 10) > 0 ? 1 : 0.2) : 1) : 0, 'seta');
}

export const auroraSkin: Skin = {
  tablado: auroraTablado,
  vidro: auroraVidro,
  pecas: { bumper: pBumper, estilingue: pEstilingue, poste: pPoste, posteCentral: pPosteCentral, alvoFixo: pAlvo, bancoDeQueda: pBanco, rampa: pRampa, portal: pSaucer, travaDeBola: pSaucer, giro: pGiro, chefe: pChefe },
  luzes: { bumper: null },
  paredes,
  palheta: { corpo: '#eef2ff', base: '#6f78a8', borracha: A.ciano },
  antesPecas,
  moldura: true,
};
SKINS.aurora = auroraSkin;
