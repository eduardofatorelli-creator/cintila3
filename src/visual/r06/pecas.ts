// R06 · Peças premium para as 30 máquinas (generalização das peças aprovadas da Aurora R05).
// Cada função lê a peça real (posição, flash, aceso, off, ângulo) e a paleta da máquina; só desenha.
import type { Seg } from '../../core/physics';
import type { Game } from '../../game/rules';
import { formaInsert, type Pintor } from '../../render/playfield';
import { alfa, tom } from '../pincel';
import { bumper, cromo, decal, inserto, luzMacia, poe, poste, saucer, sprite } from '../r05/sprites';
import type { PalR06 } from './paleta';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

// ---------- cache de peça parada ----------
const pecasCache = new Map<string, { c: HTMLCanvasElement; x: number; y: number; w: number; h: number }>();
export function limpaCachePecas() { pecasCache.clear(); }
/** desenha a peça uma vez num canvas do tamanho da caixa dela e só copia nos quadros seguintes (o tremor entra na cópia) */
export function cacheado(g: Pintor, chave: string, caixa: [number, number, number, number, number], f: () => void) {
  const k = chave + '|' + g.s.toFixed(4) + '|' + g.cam.P + '|' + g.camY + '|' + devicePixelRatio; let e = pecasCache.get(k);
  if (!e) {
    const ox = g.ox, oy = g.oy, c0 = g.c; g.ox = 0; g.oy = 0;
    const pts = [[caixa[0], caixa[1], 0], [caixa[2], caixa[1], 0], [caixa[0], caixa[3], 0], [caixa[2], caixa[3], 0], [caixa[0], caixa[1], caixa[4]], [caixa[2], caixa[1], caixa[4]], [caixa[0], caixa[3], caixa[4]], [caixa[2], caixa[3], caixa[4]]].map(q => g.p(q[0], q[1], q[2]));
    const x = Math.floor(Math.min(...pts.map(q => q[0]))) - 6, y = Math.floor(Math.min(...pts.map(q => q[1]))) - 6, w = Math.ceil(Math.max(...pts.map(q => q[0]))) + 6 - x, h = Math.ceil(Math.max(...pts.map(q => q[1]))) + 6 - y;
    const R = Math.min(2, devicePixelRatio || 1), cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w * R)); cv.height = Math.max(1, Math.ceil(h * R)); const cc = cv.getContext('2d')!; cc.scale(R, R); cc.translate(-x, -y);
    g.c = cc; try { f(); } finally { g.c = c0; g.ox = ox; g.oy = oy; }
    e = { c: cv, x, y, w, h }; if (pecasCache.size > 60) pecasCache.clear(); pecasCache.set(k, e);
  }
  g.c.drawImage(e.c, g.ox + e.x, g.oy + e.y, e.w, e.h);
}

// ---------- insertos em sprite ----------
const FORMAS: Record<string, (c: Ctx, R: number) => void> = {};
const forma = (n: string) => FORMAS[n] || (FORMAS[n] = (c: Ctx, R: number) => formaInsert(c, n as any, R));
export function insertoSpr(g: Pintor, x: number, y: number, r: number, cor: string, on: number, f = 'estrela', rot?: string) {
  const [X, Y, K] = g.p(x, y, 0), R = r * K, fn = forma(f), c = g.c;
  poe(c, inserto(f, fn, cor, R, false), X, Y);
  if (on > 0.05) poe(c, inserto(f, fn, cor, R, true), X, Y, Math.min(1, on));
  if (rot && K > 0.5) { c.font = `700 ${Math.max(5, 5 * K)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = on > 0.5 ? '#ffffff' : 'rgba(220,226,255,0.5)'; c.fillText(rot, X, Y + R * 1.25); }
}

// ---------- peças comuns ----------
export function pBumper(g: Pintor, b: any, P: PalR06) {
  const [X, Y, K] = g.p(b.x, b.y, 0), R = b.r * K * 0.96, Hz = 16 * 1.35 * K;
  poe(g.c, bumper(R, Hz, P.bumper, false), X, Y);
  if (!g.semBrilho || b.flash > 0) poe(g.c, bumper(R, Hz, P.bumper, true), X, Y, (g.semBrilho ? 0 : 0.28) + b.flash * 0.72);
}

export function pEstilingue(g: Pintor, e: any, P: PalR06) {
  if (e.flash <= 0) { const s = e.s; cacheado(g, 'sl' + P.sling.plastico + s.ax + ',' + s.ay, [Math.min(s.ax, s.bx) - 8, Math.min(s.ay, s.by, 624) - 8, Math.max(s.ax, s.bx) + 8, Math.max(s.ay, s.by, 624) + 8, 16], () => estilingue(g, e, P)); return; }
  estilingue(g, e, P);
}
function estilingue(g: Pintor, e: any, P: PalR06) {
  const s = e.s, f = e.flash, c = g.c, kick = f * 2.2, S = P.sling;
  const A0 = g.p(s.ax, s.ay, 10), C0 = g.p(s.ax, 624, 10), B0 = g.p(s.bx, s.by, 10);
  c.beginPath(); c.moveTo(A0[0], A0[1]); c.lineTo(C0[0], C0[1]); c.lineTo(B0[0], B0[1]); c.closePath();
  const gr = c.createLinearGradient(A0[0], A0[1], C0[0], C0[1]); gr.addColorStop(0, alfa(S.plastico, 0.55 + f * 0.3)); gr.addColorStop(1, alfa(tom(S.plastico, -0.6), 0.88));
  c.fillStyle = gr; c.fill();
  const cx = (A0[0] + B0[0] + C0[0]) / 3, cy = (A0[1] + B0[1] + C0[1]) / 3, rs = A0[2] * 6;
  c.save(); c.translate(cx, cy); c.fillStyle = f > 0.2 ? '#ffffff' : alfa('#f4f8ff', 0.75); decal(c, S.decal, rs); c.fill(); c.restore();
  c.beginPath(); c.moveTo(A0[0], A0[1]); c.lineTo(C0[0], C0[1]); c.lineTo(B0[0], B0[1]); c.strokeStyle = cromo(c, Math.min(A0[0], B0[0]) - 4, Math.max(A0[0], B0[0]) + 4, P.parede.cromo); c.lineWidth = Math.max(1, A0[2] * 1.6); c.stroke();
  const n = [e.nx * kick, e.ny * kick], a1 = g.p(s.ax + n[0], s.ay + n[1], 7), b1 = g.p(s.bx + n[0], s.by + n[1], 7);
  c.lineCap = 'round'; c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 5 * a1[2]; c.beginPath(); c.moveTo(a1[0] + 1, a1[1] + 2); c.lineTo(b1[0] + 1, b1[1] + 2); c.stroke();
  c.strokeStyle = f > 0.2 ? '#ffffff' : S.borracha; c.lineWidth = 3.6 * a1[2]; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.stroke();
  c.strokeStyle = 'rgba(120,128,160,0.8)'; c.lineWidth = 1 * a1[2]; c.beginPath(); c.moveTo(a1[0], a1[1] + 1.2 * a1[2]); c.lineTo(b1[0], b1[1] + 1.2 * a1[2]); c.stroke();
  for (const [x, y] of [[s.ax, s.ay], [s.bx, s.by], [s.ax, 624]]) { const [X, Y, K] = g.p(x, y, 0); poe(c, poste(4.2 * K, 12 * 1.35 * K), X, Y); }
  if (f > 0) g.glow((s.ax + s.bx) / 2, (s.ay + s.by) / 2, 30, S.plastico, 10, f);
}

export function pPoste(g: Pintor, p: any) { if (p.c.off) return; const [X, Y, K] = g.p(p.x, p.y, 0); poe(g.c, poste(p.c.r * K, 10 * 1.35 * K), X, Y); }
export function pPosteCentral(g: Pintor, p: any) {
  if (p.c.off) { g.disco(190, 718, 5, '#000', 0.2, 0.8); if (!p.forcado) g.anel(190, 718, 9, '#7dffb0', 2, 0.3, p.recarga); return; }
  const [X, Y, K] = g.p(190, 718, 0); poe(g.c, poste(4.8 * K, 11 * 1.35 * K, '#9dffc8', '#eafff2'), X, Y);
}

export function pAlvo(g: Pintor, a: any, P: PalR06) {
  if (a.s.off) return;
  // parado (sem flash): cópia em cache por estado real (aceso, vidas)
  if (a.flash <= 0) { const s = a.s; cacheado(g, 'al' + P.alvo.face + s.ax + ',' + s.ay + (a.aceso ? 'a' : '') + a.vidas + (a.rotulo || ''), [Math.min(s.ax, s.bx) - 6, Math.min(s.ay, s.by) - 6, Math.max(s.ax, s.bx) + 6, Math.max(s.ay, s.by) + 6, 16], () => alvo(g, a, P)); return; }
  alvo(g, a, P);
}
function alvo(g: Pintor, a: any, P: PalR06) {
  const s = a.s, c = g.c, h = 4 + 9 * (a.vidasMax > 1 ? a.vidas / a.vidasMax : 1);
  const a0 = g.p(s.ax, s.ay, 1), b0 = g.p(s.bx, s.by, 1), a1 = g.p(s.ax, s.ay, h), b1 = g.p(s.bx, s.by, h);
  c.strokeStyle = '#1a1c28'; c.lineWidth = 3 * a0[2]; c.beginPath(); c.moveTo(a0[0], a0[1] + 2); c.lineTo(b0[0], b0[1] + 2); c.stroke();
  const lit = a.flash > 0.3 ? '#ffffff' : a.aceso ? P.alvo.aceso : P.alvo.face;
  c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
  const gr = c.createLinearGradient(0, a1[1], 0, a0[1]); gr.addColorStop(0, tom(lit, 0.45)); gr.addColorStop(0.5, lit); gr.addColorStop(1, tom(lit, -0.45)); c.fillStyle = gr; c.fill();
  c.strokeStyle = tom(lit, -0.6); c.lineWidth = Math.max(0.6, a0[2]); c.stroke();
  // trincas visíveis nos alvos de várias camadas (o estado real de vidas)
  if (a.vidasMax > 1 && a.vidas < a.vidasMax) { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.7; c.beginPath(); for (let i = 0; i < a.vidasMax - a.vidas; i++) { const u = 0.3 + i * 0.3; c.moveTo(a1[0] + (b1[0] - a1[0]) * u, a1[1] + (b1[1] - a1[1]) * u); c.lineTo(a0[0] + (b0[0] - a0[0]) * (u + 0.1), a0[1] + (b0[1] - a0[1]) * (u + 0.1)); } c.stroke(); }
  const mx = (a0[0] + b0[0] + a1[0] + b1[0]) / 4, my = (a0[1] + b0[1] + a1[1] + b1[1]) / 4, r = Math.max(2, a0[2] * 3.2);
  if (a.rotulo) { c.font = `800 ${Math.max(6, 6.5 * a0[2])}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = P.alvo.tinta; c.fillText(a.rotulo, mx, my + 0.5); }
  else { c.save(); c.translate(mx, my); c.fillStyle = 'rgba(255,255,255,0.8)'; decal(c, P.sling.decal, r); c.fill(); c.restore(); }
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = Math.max(0.5, a0[2] * 0.7); c.beginPath(); c.moveTo(a1[0], a1[1] + 0.6); c.lineTo(b1[0], b1[1] + 0.6); c.stroke();
  if (a.flash > 0) g.glow(a.x, a.y, 18, P.alvo.aceso, 8, a.flash);
}

export function pBanco(g: Pintor, b: any, P: PalR06) {
  if (b.flash <= 0) { const A = b.alvos as Seg[], xs = A.flatMap(s => [s.ax, s.bx]), ys = A.flatMap(s => [s.ay, s.by]); cacheado(g, 'bq' + P.banco + A[0].ax + ',' + A[0].ay + A.map(s => (s.off ? 1 : 0)).join(''), [Math.min(...xs) - 6, Math.min(...ys) - 6, Math.max(...xs) + 6, Math.max(...ys) + 6, 14], () => banco(g, b, P)); return; }
  banco(g, b, P);
}
function banco(g: Pintor, b: any, P: PalR06) {
  const c = g.c;
  for (const s of b.alvos as Seg[]) {
    const h = s.off ? 1.2 : 11, a0 = g.p(s.ax, s.ay, 0), b0 = g.p(s.bx, s.by, 0), a1 = g.p(s.ax, s.ay, h), b1 = g.p(s.bx, s.by, h);
    c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
    if (s.off) { c.fillStyle = '#05050c'; c.fill(); c.strokeStyle = 'rgba(160,170,210,0.35)'; c.lineWidth = 1; c.stroke(); continue; }
    const cor = b.flash > 0.4 ? '#ffffff' : P.banco, gr = c.createLinearGradient(0, a1[1], 0, a0[1]); gr.addColorStop(0, tom(cor, 0.5)); gr.addColorStop(0.55, cor); gr.addColorStop(1, tom(cor, -0.5));
    c.fillStyle = gr; c.fill(); c.strokeStyle = tom(cor, -0.6); c.lineWidth = Math.max(0.6, a0[2]); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = Math.max(0.5, a0[2] * 0.8); c.beginPath(); c.moveTo(a1[0], a1[1] + 0.6); c.lineTo(b1[0], b1[1] + 0.6); c.stroke();
    c.fillStyle = alfa('#ffffff', 0.85); const mx = (a0[0] + b1[0]) / 2, my = (a0[1] + b1[1]) / 2; c.beginPath(); c.arc(mx, my, Math.max(1, a0[2] * 1.3), 0, TAU); c.fill();
  }
}

export function pRampa(g: Pintor, r: any, P: PalR06) {
  if (r.flash <= 0.2 && !r.bloqueada) { const C = r.caminho as number[][]; cacheado(g, 'rp' + P.piso + r.lado + r.mx + (r.salto ? 's' : ''), [Math.min(...C.map(q => q[0])) - 12, Math.min(...C.map(q => q[1])) - 12, Math.max(...C.map(q => q[0])) + 12, Math.max(...C.map(q => q[1])) + 12, 34], () => rampa(g, r, P)); return; }
  rampa(g, r, P);
}
function rampa(g: Pintor, r: any, P: PalR06) {
  const C = r.caminho as number[][], c = g.c, n = C.length, aceso = r.flash > 0.2;
  const lado = (i: number, d: number) => { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [C[i][0] - dy / L * d, C[i][1] + dx / L * d, C[i][2]]; };
  const E = C.map((_, i) => lado(i, -8)), D = C.map((_, i) => lado(i, 8));
  for (let i = 1; i < n - 1; i++) for (const q of [E[i], D[i]]) { const b0 = g.p(q[0], q[1], 0), t0 = g.p(q[0], q[1], q[2]); c.strokeStyle = '#6a7290'; c.lineWidth = Math.max(0.8, 1.6 * b0[2]); c.beginPath(); c.moveTo(b0[0], b0[1]); c.lineTo(t0[0], t0[1]); c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.5; c.stroke(); }
  c.beginPath(); E.forEach((q, i) => { const p = g.p(q[0], q[1], q[2]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); for (let i = n - 1; i >= 0; i--) { const p = g.p(D[i][0], D[i][1], D[i][2]); c.lineTo(p[0], p[1]); } c.closePath();
  c.fillStyle = alfa(aceso ? P.piso : tom(P.piso, 0.4), aceso ? 0.3 : 0.13); c.fill(); c.strokeStyle = alfa('#ffffff', 0.18); c.lineWidth = 1; c.stroke();
  for (const L of [E, D]) for (const [cor, l, dz] of [['#151826', 3.4, 3], [P.parede.cromo, 2, 3.6], ['#ffffff', 0.7, 4.3]] as [string, number, number][]) {
    c.strokeStyle = cor; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); let K = 1; L.forEach((q, i) => { const p = g.p(q[0], q[1], q[2] + dz); K = p[2]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.lineWidth = l * K; c.stroke();
  }
  if (r.bloqueada) g.muro(r.mx - 16, 394, r.mx + 16, 394, 14, '#ff3355', 4);
}

export function pSaucer(g: Pintor, s: any, P: PalR06) {
  const [X, Y, K] = g.p(s.x, s.y, 0); poe(g.c, saucer((s.raio + 2) * K, P.saucer), X, Y, s.ativo === false ? 0.6 : 1);
  if (s.flash > 0 || s.bola) g.glow(s.x, s.y, 22, P.saucer, 2, 0.5 + s.flash * 0.5);
}

export function pGiro(g: Pintor, s: any, P: PalR06) {
  if (s.energia <= 0) { cacheado(g, 'gi' + s.x + ',' + s.y + Math.round(Math.cos(s.ang) * 8), [s.x - 20, s.y - 6, s.x + 20, s.y + 6, 24], () => giro(g, s, P)); return; }
  giro(g, s, P);
}
function giro(g: Pintor, s: any, P: PalR06) {
  const c = g.c, h = Math.abs(Math.cos(s.ang)) * 9 + 1, fr = Math.cos(s.ang) > 0;
  for (const dx of [-16, 16]) { const [X, Y, K] = g.p(s.x + dx, s.y, 0); poe(c, poste(2.2 * K, 15 * 1.35 * K, P.parede.cromo, '#ffffff'), X, Y); }
  const a = g.p(s.x - 16, s.y, 15), b = g.p(s.x + 16, s.y, 15); c.strokeStyle = cromo(c, a[0], b[0], P.parede.cromo); c.lineWidth = 1.6 * a[2]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  const pts = [[s.x - 14, s.y, 12 - h], [s.x + 14, s.y, 12 - h], [s.x + 14, s.y, 12 + h], [s.x - 14, s.y, 12 + h]].map(q => g.p(q[0], q[1], q[2]));
  c.beginPath(); pts.forEach(p => c.lineTo(p[0], p[1])); c.closePath(); c.fillStyle = fr ? cromo(c, pts[0][0], pts[1][0], P.parede.cromo) : '#2a2f48'; c.fill();
  if (fr && h > 3) { c.save(); c.translate((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[2][1]) / 2); c.fillStyle = alfa(P.luz, 0.85); decal(c, P.bumper.forma, Math.min(h * a[2] * 0.6, 4 * a[2])); c.fill(); c.restore(); }
}

/** peça de alvo na fase de cima (tijolo): joia facetada sobre base de metal */
function joia(R: number, cor: string, branca: boolean) {
  R = Math.round(R * 4) / 4; const m = R * 2.4;
  return sprite(`jo|${R}|${cor}|${branca}`, m * 2, m * 2, m, m * 1.3, c => {
    c.save(); c.translate(R * 0.15, R * 0.3); c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.ellipse(0, 0, R * 1.4, R * 0.8, 0, 0, TAU); c.fill(); c.restore();
    c.fillStyle = cromo(c, -R * 1.15, R * 1.15); c.beginPath(); c.ellipse(0, 0, R * 1.15, R * 0.92, 0, 0, TAU); c.fill();
    const base = branca ? '#ffffff' : cor, n = 6; c.translate(0, -R * 0.8);
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * TAU, b = a + TAU / n, sh = 0.5 + 0.5 * Math.cos(a + 0.5 - (-2.4)); c.fillStyle = tom(base, -0.45 + sh * 0.75); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R, Math.sin(a) * R * 0.85); c.lineTo(Math.cos(b) * R, Math.sin(b) * R * 0.85); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = Math.max(0.5, R * 0.06); c.beginPath(); for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * TAU; c.lineTo(Math.cos(a) * R, Math.sin(a) * R * 0.85); } c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(-R * 0.3, -R * 0.35, R * 0.22, R * 0.1, -0.5, 0, TAU); c.fill();
  });
}
export function pTijolo(g: Pintor, t: any, P: PalR06) {
  if (t.c.off) return; const [X, Y, K] = g.p(t.c.x, t.c.y, 0), cor = t.cor || (t.vidas > 1 ? P.alvo.aceso : P.bumper.tampa);
  poe(g.c, joia(t.r * K, cor, false), X, Y); if (t.flash > 0.05) poe(g.c, joia(t.r * K, cor, true), X, Y, t.flash);
}

/** disco de vinil girando com o ângulo real */
function vinilSpr(R: number, rotulo: string) {
  R = Math.round(R * 2) / 2;
  return sprite(`vn|${R}|${rotulo}`, R * 2.2, R * 2.2, R * 1.1, R * 1.1, c => {
    c.fillStyle = '#0a0a10'; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
    for (let r = R * 0.38; r < R * 0.98; r += Math.max(0.8, R * 0.025)) { c.strokeStyle = `rgba(120,120,150,${0.12 + (r * 7 % 1) * 0.12})`; c.lineWidth = 0.5; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); }
    const sh = c.createLinearGradient(-R, -R, R, R); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.16)'); sh.addColorStop(0.65, 'rgba(255,255,255,0)'); c.fillStyle = sh; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
    c.fillStyle = rotulo; c.beginPath(); c.arc(0, 0, R * 0.34, 0, TAU); c.fill(); c.fillStyle = tom(rotulo, -0.4); c.fillRect(-R * 0.3, -R * 0.04, R * 0.6, R * 0.08);
    c.fillStyle = '#ffffff'; c.font = `800 ${R * 0.1}px Orbitron, sans-serif`; c.textAlign = 'center'; c.fillText('45', 0, -R * 0.14);
    c.fillStyle = '#d8dce8'; c.beginPath(); c.arc(0, 0, R * 0.04, 0, TAU); c.fill();
  });
}
export function pVinil(g: Pintor, v: any, P: PalR06) {
  const [X, Y, K] = g.p(v.x, v.y, 2), R = v.R * K, c = g.c;
  c.save(); c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.ellipse(X + R * 0.08, Y + R * 0.12, R * 1.05, R * 0.86, 0, 0, TAU); c.fill();
  c.translate(X, Y); c.scale(1, 0.82); c.rotate(v.ang); const s = vinilSpr(R, P.bumper.tampa); c.drawImage(s.c, -s.ox, -s.oy, s.w, s.h); c.restore();
  if (v.flash > 0) g.glow(v.x, v.y, v.R * 0.6, P.luz, 4, v.flash * 0.6);
}

/** pás do moinho: lâminas de metal escovado com rebites */
export function pPas(g: Pintor, m: any, P: PalR06) {
  const c = g.c;
  for (const s of m.ss as Seg[]) {
    const a0 = g.p(s.ax, s.ay, 4), b0 = g.p(s.bx, s.by, 4), a1 = g.p(s.ax, s.ay, 13), b1 = g.p(s.bx, s.by, 13);
    c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath(); c.fillStyle = '#10121e'; c.fill();
    c.strokeStyle = cromo(c, Math.min(a1[0], b1[0]) - 2, Math.max(a1[0], b1[0]) + 2, P.parede.cromo); c.lineWidth = 4.5 * a1[2]; c.lineCap = 'round'; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.stroke();
    c.strokeStyle = m.flash > 0.3 ? '#ffffff' : alfa(P.luz, 0.85); c.lineWidth = 1.2 * a1[2]; c.stroke();
  }
  const [X, Y, K] = g.p(m.x, m.y, 0); poe(c, bumper(8 * K, 16 * 1.35 * K, P.bumper, m.flash > 0.2), X, Y);
}

/** boca / caveira que engole: aro de metal, garganta escura, olhos e os canos de saída */
export function pBoca(g: Pintor, b: any, P: PalR06) {
  const c = g.c, cav = b.forma === 'caveira', ab = b.bola ? 0.3 : 0.6 + Math.sin(g.t * 3) * 0.25;
  for (const cn of b.canos) { const [X, Y, K] = g.p(cn[0], cn[1], 0); poe(c, saucer(8 * K, b.ult === b.canos.indexOf(cn) && b.flash > 0 ? '#ffffff' : P.saucer), X, Y); }
  const [X, Y, K] = g.p(b.x, b.y, 0), R = 17 * K;
  poe(c, bumper(R, 9 * 1.35 * K, { corpo: cav ? '#3a362c' : P.bumper.corpo, tampa: cav ? '#e8e2cc' : P.bumper.tampa, luz: P.luz, decal: cav ? '#e8e2cc' : P.bumper.tampa, forma: 'circulo' }, b.flash > 0.3), X, Y);
  const [x2, y2] = g.p(b.x, b.y, 10);
  c.fillStyle = '#000000'; c.beginPath(); c.ellipse(x2, y2 + R * 0.2, R * 0.6 * ab + R * 0.15, (R * 0.6 * ab + R * 0.15) * 0.7, 0, 0, TAU); c.fill();
  c.strokeStyle = alfa(P.luz, 0.6); c.lineWidth = Math.max(0.6, K * 0.8); c.stroke();
  for (const sx of [-1, 1]) { c.fillStyle = cav ? '#0a0806' : '#ffffff'; c.beginPath(); c.ellipse(x2 + sx * R * 0.38, y2 - R * 0.42, R * 0.17, R * 0.2, 0, 0, TAU); c.fill(); if (cav) { c.fillStyle = alfa(P.luz, 0.8 + Math.sin(g.t * 4) * 0.2); c.beginPath(); c.arc(x2 + sx * R * 0.38, y2 - R * 0.42, R * 0.06, 0, TAU); c.fill(); } }
  if (b.bola) g.glow(b.x, b.y, 24, P.luz, 8, 0.6);
}

// ---------- paredes ----------
export function paredes(g: Pintor, segs: Seg[], P: PalR06) {
  const c = g.c, ord = segs.slice().sort((a, b) => Math.max(a.ay, a.by) - Math.max(b.ay, b.by)), W = P.parede;
  for (const s of ord) {
    const z = s.z ?? (s.tipo === 'piso' ? 4 : 12), a0 = g.p(s.ax, s.ay, 0), b0 = g.p(s.bx, s.by, 0), a1 = g.p(s.ax, s.ay, z), b1 = g.p(s.bx, s.by, z), K = (a1[2] + b1[2]) / 2;
    c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
    const gr = c.createLinearGradient(0, Math.min(a1[1], b1[1]), 0, Math.max(a0[1], b0[1])); gr.addColorStop(0, W.topo); gr.addColorStop(1, W.baixo); c.fillStyle = gr; c.fill();
    const lw = (s.tipo === 'porta' ? 2 : 3.2) * K; c.lineCap = 'round';
    const camadas: [string, number, number][] = P.fioForte === false ? [['#0a0914', 1.35, 0], [alfa(W.fio, 0.55), 1.0, -0.05], [W.cromo, 0.62, -0.18], ['#ffffff', 0.2, -0.32]] : [['#0a0914', 1.35, 0], [alfa(W.fio, 0.9), 1.05, -0.05], [W.cromo, 0.4, -0.22], ['#ffffff', 0.16, -0.34]];
    for (const [cor, l, o] of camadas) { c.strokeStyle = cor; c.lineWidth = lw * l; c.beginPath(); c.moveTo(a1[0], a1[1] + lw * o); c.lineTo(b1[0], b1[1] + lw * o); c.stroke(); }
  }
}

// ---------- antes das peças: luz por fonte e insertos de estado ----------
export const ESTADO = {
  bonus: [[150, 606], [170, 598], [190, 595], [210, 598], [230, 606]] as number[][],
  missoes: [[150, 552], [170, 552], [190, 552], [210, 552], [230, 552]] as number[][],
  protegida: [190, 668] as number[],
};
export function antesPecas(g: Pintor, J: Game, P: PalR06, extra?: (g: Pintor, J: Game) => void) {
  const c = g.c, t = g.t, M = J.m, eco = g.semBrilho;
  c.save(); c.globalCompositeOperation = 'lighter';
  const poca = (x: number, y: number, r: number, cor: string, a: number) => { if (a <= 0.02) return; const [X, Y, K] = g.p(x, y, 0); poe(c, luzMacia(cor, r * K), X, Y, Math.min(1, a)); };
  for (const b of M.bumpers) poca(b.x, b.y + 4, b.r * 2.8, P.bumper.luz, (eco ? 0 : 0.16) + b.flash * 0.55);
  for (const p of J.mesa.pecas as any[]) {
    if (p.tipo === 'estilingue' && p.flash > 0) poca((p.s.ax + p.s.bx) / 2, (p.s.ay + p.s.by) / 2, 46, P.sling.plastico, p.flash * 0.6);
    else if ((p.tipo === 'portal' || p.tipo === 'travaDeBola') && (p.flash > 0 || p.bola)) poca(p.x, p.y, 34, P.saucer, 0.25 + p.flash * 0.4);
    else if (p.tipo === 'alvoFixo' && !p.s.off && (p.aceso || p.vale)) poca(p.x, p.y + 6, 22, p.aceso ? P.alvo.aceso : P.alvo.face, p.aceso ? 0.22 : 0.12 + (Math.sin(t * 8) > 0 ? 0.12 : 0));
  }
  const ch = M.chefe, cl = P.chefe.pedestal.luz; if (!ch.c.off) poca(ch.x, ch.y + 6, 58, cl, (eco ? 0 : 0.16 + Math.sin(t * 2.2) * 0.04) + ch.dor * 0.5 + (ch.vida === 1 ? 0.12 : 0));
  c.restore();
  extra?.(g, J);
  const nb = Math.min(5, Math.max(0, J.bonusX - 1));
  ESTADO.bonus.forEach((q, i) => insertoSpr(g, q[0], q[1], 4.6, P.insertos.bonus, i < nb ? 1 : 0, 'estrela'));
  J.missoes.forEach((m, i) => { const q = ESTADO.missoes[i]; if (q) insertoSpr(g, q[0], q[1], 3.6, P.insertos.missao, m.feita ? 1 : i === J.missaoAtiva ? (Math.sin(t * 7) > 0 ? 1 : 0.15) : 0, 'redondo'); });
  const sal = J.salva > 0 && J.estado === 'jogo'; insertoSpr(g, ESTADO.protegida[0], ESTADO.protegida[1], 6.5, P.insertos.protegida, sal ? (J.salva < 3 ? (Math.sin(t * 10) > 0 ? 1 : 0.2) : 1) : 0, 'seta');
}
