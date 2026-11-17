// R06.1 · Acabamento premium das peças secundárias (as que ainda usavam o desenho R04 sobre os materiais).
// Só desenho: posição, ângulo, estado (off, vidas, presas, aberta, bola) vêm da peça real. Nenhuma colisão nova.
import type { Seg } from '../../core/physics';
import type { Pintor } from '../../render/playfield';
import { alfa, tom } from '../pincel';
import { bumper, cromo, decal, poe, poste, saucer, sprite } from '../r05/sprites';
import type { PalR06 } from './paleta';
import { cacheado, insertoSpr } from './pecas';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const q4 = (v: number) => Math.round(v * 4) / 4;

/** tubo cromado entre dois pontos 3D (sombra, corpo, brilho) */
function haste(g: Pintor, a: number[], b: number[], r: number, cor = '#b9c3e4') {
  const c = g.c, A = g.p(a[0], a[1], a[2]), B = g.p(b[0], b[1], b[2]), K = (A[2] + B[2]) / 2; c.lineCap = 'round';
  for (const [k, l, dy] of [['rgba(0,0,0,0.45)', 2.4, 0.5], [tom(cor, -0.5), 2, 0], [cor, 1.3, -0.2], ['#ffffff', 0.4, -0.5]] as [string, number, number][]) { c.strokeStyle = k; c.lineWidth = r * l * K; c.beginPath(); c.moveTo(A[0], A[1] + dy * r * K); c.lineTo(B[0], B[1] + dy * r * K); c.stroke(); }
}

// ---------- alvo giratório: criatura (Bestiário), escudo (Cidadela), alvo em fuga (Cidade Neon) ----------
function criatura(R: number, cor: string, est: number, branca: boolean) {
  R = q4(R); const m = R * 2.4;
  return sprite(`cr|${R}|${cor}|${est}|${branca}`, m * 2, m * 2, m, m * 1.25, c => {
    c.save(); c.translate(R * 0.15, R * 0.35); c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.ellipse(0, 0, R * 1.1, R * 0.55, 0, 0, TAU); c.fill(); c.restore();
    c.translate(0, -R * 0.75); const base = branca ? '#ffffff' : cor;
    if (est >= 2) { c.fillStyle = tom(base, -0.3); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.4, -R * 0.6); c.lineTo(s * R * (0.7 + est * 0.1), -R * (1.1 + est * 0.15)); c.lineTo(s * R * 0.1, -R * 0.8); c.fill(); } }
    if (est >= 3) { c.fillStyle = alfa(base, 0.45); for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * R * 0.95, -R * 0.1, R * 0.55, R * 0.22, s * 0.6, 0, TAU); c.fill(); } }
    const g = c.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.05, 0, 0, R); g.addColorStop(0, tom(base, 0.6)); g.addColorStop(0.6, base); g.addColorStop(1, tom(base, -0.5));
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, R, R * 0.92, 0, 0, TAU); c.fill(); c.strokeStyle = alfa('#ffffff', 0.5); c.lineWidth = Math.max(0.5, R * 0.06); c.stroke();
    for (const s of [-1, 1]) { c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(s * R * 0.34, -R * 0.1, R * 0.2, R * 0.25, 0, 0, TAU); c.fill(); c.fillStyle = '#0a1a10'; c.beginPath(); c.arc(s * R * 0.34, -R * 0.06, R * 0.1, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(-R * 0.35, -R * 0.55, R * 0.25, R * 0.12, -0.5, 0, TAU); c.fill();
  });
}
function escudo(R: number, face: string, aro: string, emblema: string, vidas: number, branca: boolean) {
  R = q4(R); const m = R * 2.2;
  return sprite(`es|${R}|${face}|${aro}|${emblema}|${vidas}|${branca}`, m * 2, m * 2, m, m * 1.2, c => {
    c.save(); c.translate(R * 0.1, R * 0.4); c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.ellipse(0, 0, R, R * 0.45, 0, 0, TAU); c.fill(); c.restore();
    c.translate(0, -R * 0.7); const forma = () => { c.beginPath(); c.moveTo(-R, -R * 0.9); c.lineTo(R, -R * 0.9); c.lineTo(R, R * 0.1); c.quadraticCurveTo(R * 0.8, R * 0.85, 0, R * 1.15); c.quadraticCurveTo(-R * 0.8, R * 0.85, -R, R * 0.1); c.closePath(); };
    forma(); c.fillStyle = cromo(c, -R, R, aro); c.fill(); c.save(); c.scale(0.8, 0.8); forma(); const g = c.createLinearGradient(0, -R, 0, R); g.addColorStop(0, tom(branca ? '#ffffff' : face, 0.4)); g.addColorStop(1, tom(branca ? '#ffffff' : face, -0.45)); c.fillStyle = g; c.fill(); c.restore();
    c.fillStyle = alfa('#ffffff', 0.85); decal(c, emblema, R * 0.38); c.fill();
    if (vidas > 1) { c.strokeStyle = alfa('#ffffff', 0.8); c.lineWidth = Math.max(0.6, R * 0.08); c.beginPath(); c.arc(0, 0, R * 0.6, 0, TAU); c.stroke(); }
  });
}
export function pGiratorio(g: Pintor, a: any, P: PalR06) {
  const c = g.c;
  if (a.trilho) { const pts = (a.trilho as number[][]).map(q => g.p(q[0], q[1], 1)); c.lineCap = 'round'; c.lineJoin = 'round'; for (const [k, l] of [['#0a0914', 5], [alfa(P.luz, 0.6), 3], ['#ffffff', 0.8]] as [string, number][]) { c.strokeStyle = k; c.lineWidth = l * pts[0][2]; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); } }
  for (const ci of a.cs) {
    if (ci.off) continue; const [X, Y, K] = g.p(ci.x, ci.y, 0), br = a.flash > 0.3;
    if (a.forma === 'criatura') { const est = Math.max(1, Math.min(3, ci.est || 1)); poe(c, criatura((5 + est * 2) * K, P.bumper.tampa, est, br), X, Y); }
    else poe(c, escudo(ci.r * K * 1.05, P.alvo.face, P.parede.cromo, P.sling.decal, ci.vidas, br), X, Y);
  }
}

// ---------- esteira do labirinto: moldura de metal, roletes e lona que corre no sentido real ----------
export function lEsteira(g: Pintor, e: any, P: PalR06) {
  const c = g.c, x0 = e.x - e.w / 2, y0 = e.y - e.h / 2, x1 = x0 + e.w, y1 = y0 + e.h;
  const quad = (pts: number[][], f: string | CanvasGradient) => { c.beginPath(); pts.forEach(q => { const p = g.p(q[0], q[1], q[2] || 0); c.lineTo(p[0], p[1]); }); c.closePath(); c.fillStyle = f; c.fill(); };
  quad([[x0 - 4, y0 - 4], [x1 + 4, y0 - 4], [x1 + 4, y1 + 4], [x0 - 4, y1 + 4]], '#08060a');
  quad([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], '#1a1418');
  const n = 14, off = ((g.t * 0.6 * (e.dir || 0)) % 1 + 1) % 1;
  for (let i = 0; i < n; i++) { const x = x0 + ((i + off) / n) * e.w; if (x > x1 - 2) continue; quad([[x, y0 + 2], [x + 2.2, y0 + 2], [x + 2.2, y1 - 2], [x, y1 - 2]], alfa('#6a5a50', 0.6)); }
  for (const y of [y0, y1]) haste(g, [x0 - 4, y, 3], [x1 + 4, y, 3], 2, P.parede.cromo);
  for (const x of [x0 - 3, x1 + 3]) haste(g, [x, y0, 3], [x, y1, 3], 3, '#8a7a6a');
  if (e.dir) for (let k = 0; k < 3; k++) { const [X, Y, K] = g.p(e.x + (k - 1) * 18 * e.dir, e.y, 2); c.save(); c.translate(X, Y); c.scale(e.dir, 1); c.fillStyle = alfa(P.luz, 0.75 - k * 0.15); c.beginPath(); c.moveTo(6 * K, 0); c.lineTo(-3 * K, -6 * K); c.lineTo(-3 * K, 6 * K); c.closePath(); c.fill(); c.restore(); }
}

// ---------- elevador: gaiola de metal sobre o poço, plataforma e marcadores dos três níveis ----------
export function pElevador(g: Pintor, e: any, P: PalR06) {
  const [X, Y, K] = g.p(e.x, e.y, 0); poe(g.c, saucer((e.raio + 2) * K, P.saucer), X, Y);
  for (const s of [-1, 1]) haste(g, [e.x + s * 13, e.y + 6, 0], [e.x + s * 13, e.y + 6, 48], 1.6, P.parede.cromo);
  haste(g, [e.x - 13, e.y + 6, 48], [e.x + 13, e.y + 6, 48], 1.6, P.parede.cromo);
  const h = e.bola ? 8 + Math.abs(Math.sin(g.t * 4)) * 30 : 6; haste(g, [e.x - 12, e.y + 6, h], [e.x + 12, e.y + 6, h], 2.4, '#c08a3a');
  (e.niveis as number[][]).forEach((n, i) => insertoSpr(g, n[0], n[1], 6, P.luz, e.bola ? 0.6 : 0.1, 'redondo', String(i + 1)));
  if (e.flash > 0 || e.bola) g.glow(e.x, e.y, 22, P.luz, 2, 0.5 + e.flash * 0.5);
}

// ---------- miradores: canhão (Circo), ímã (Caverna), braço robótico (Órion) ----------
export function pMirador(g: Pintor, m: any, P: PalR06) {
  const c = g.c, cx = Math.cos(m.mira), cy = Math.sin(m.mira), [X, Y, K] = g.p(m.x, m.y, 0);
  if (m.forma === 'ima') {
    poe(c, bumper(12 * K, 6 * 1.35 * K, { corpo: '#2a1a4a', tampa: m.bola ? P.luz : '#5a4a8a', luz: P.luz, decal: '#e0d8ff', forma: 'diamante' }, !!m.bola), X, Y);
    for (let i = 0; i < 3; i++) g.anel(m.x, m.y, 14 + ((g.t * 20 + i * 8) % 24), P.luz, 1.5, 1, 0.35);
    return;
  }
  if (m.forma === 'braco') {
    poe(c, bumper(9 * K, 12 * 1.35 * K, { corpo: '#2a3448', tampa: '#c8d0e8', luz: P.luz, decal: '#2a3448', forma: 'hex' }, !!m.bola), X, Y);
    const j1 = [m.x + cx * 12, m.y + cy * 12, 22], j2 = [m.x + cx * 22, m.y + cy * 22, 15];
    haste(g, [m.x, m.y, 13], j1, 2.2, P.parede.cromo); haste(g, j1, j2, 1.8, P.parede.cromo);
    for (const j of [j1, j2]) { const [x, y, k] = g.p(j[0], j[1], j[2]); c.fillStyle = cromo(c, x - 3 * k, x + 3 * k); c.beginPath(); c.arc(x, y, 2.6 * k, 0, TAU); c.fill(); }
    const [x2, y2, k2] = g.p(j2[0], j2[1], j2[2]); c.strokeStyle = P.luz; c.lineWidth = 1.4 * k2; c.beginPath(); c.arc(x2, y2, 4 * k2, m.mira - 1, m.mira + 1); c.stroke();
    return;
  }
  // canhão do homem-bala
  poe(c, saucer(13 * K, P.saucer), X, Y);
  const b0 = [m.x, m.y, 10], b1 = [m.x + cx * 28, m.y + cy * 28, 13];
  haste(g, b0, b1, 4.6, '#c8203a'); for (let k = 1; k < 4; k++) { const u = k / 4; haste(g, [b0[0] + (b1[0] - b0[0]) * u, b0[1] + (b1[1] - b0[1]) * u, 11.5], [b0[0] + (b1[0] - b0[0]) * (u + 0.07), b0[1] + (b1[1] - b0[1]) * (u + 0.07), 11.6], 4.9, '#ffd84d'); }
  const [mx, my, mk] = g.p(b1[0], b1[1], b1[2]); c.fillStyle = '#05060c'; c.beginPath(); c.arc(mx, my, 3.5 * mk, 0, TAU); c.fill(); c.strokeStyle = cromo(c, mx - 5 * mk, mx + 5 * mk); c.lineWidth = 1.4 * mk; c.stroke();
}

// ---------- porta móvel: locomotiva (Expresso) ou portão de metal ----------
export function pPorta(g: Pintor, p: any, P: PalR06) {
  const c = g.c, s: Seg[] = p.ss;
  if (!p.trilho) {
    if (p.fechada) { const a0 = g.p(p.ax, p.ay, 0), b0 = g.p(p.bx, p.by, 0), a1 = g.p(p.ax, p.ay, 13), b1 = g.p(p.bx, p.by, 13); c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath(); c.fillStyle = p.flash > 0.2 ? '#ffffff' : tom(P.parede.topo, 0.25); c.fill(); haste(g, [p.ax, p.ay, 13], [p.bx, p.by, 13], 1.8, P.parede.cromo); }
    for (const [x, y] of [[p.ax, p.ay], [p.bx, p.by]]) { const [X, Y, K] = g.p(x, y, 0); poe(c, poste(2.6 * K, 13 * 1.35 * K, P.parede.cromo, '#ffffff'), X, Y); }
    return;
  }
  if (!p.fechada || !s.length) return;
  const xs = s.flatMap(q => [q.ax, q.bx]), ys = s.flatMap(q => [q.ay, q.by]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), yc = (y0 + y1) / 2, fr = p.dir > 0 ? x1 : x0;
  const caixa = (xa: number, xb: number, ya: number, yb: number, z0: number, z1: number, cor: string) => {
    const pts = [[xa, yb, z0], [xb, yb, z0], [xb, yb, z1], [xa, yb, z1]].map(q => g.p(q[0], q[1], q[2])), top = [[xa, ya, z1], [xb, ya, z1], [xb, yb, z1], [xa, yb, z1]].map(q => g.p(q[0], q[1], q[2]));
    c.beginPath(); pts.forEach(q => c.lineTo(q[0], q[1])); c.closePath(); c.fillStyle = tom(cor, -0.35); c.fill();
    c.beginPath(); top.forEach(q => c.lineTo(q[0], q[1])); c.closePath(); const gr = c.createLinearGradient(0, top[0][1], 0, top[2][1]); gr.addColorStop(0, tom(cor, 0.3)); gr.addColorStop(1, cor); c.fillStyle = gr; c.fill();
  };
  caixa(x0, x1, y0, y1, 0, 10, p.flash > 0.2 ? '#ffffff' : '#1e3a32');
  haste(g, [x0 + 4, yc, 13], [x1 - 4, yc, 13], 5, '#c08a3a');
  const ch = p.dir > 0 ? x1 - 9 : x0 + 9; haste(g, [ch, yc, 13], [ch, yc, 22], 2.6, '#2a2a2a');
  for (const xx of [x0 + 6, (x0 + x1) / 2, x1 - 6]) { const [X, Y, K] = g.p(xx, y1 + 1, 2); c.fillStyle = '#c08a3a'; c.beginPath(); c.arc(X, Y, 3 * K, 0, TAU); c.fill(); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(X, Y, 1.4 * K, 0, TAU); c.fill(); }
  g.glow(fr, yc, 14, '#fff6c0', 12, 0.9);
}

// ---------- roda-gigante: aro cromado duplo, raios, gôndolas (acesas quando há bola presa) ----------
export function pRoda(g: Pintor, r: any, P: PalR06) {
  const c = g.c, n = r.cab.length, pos = (i: number, R = r.R) => { const a = r.ang + i / n * TAU; return [r.x + Math.cos(a) * R, r.y + Math.sin(a) * R]; };
  // aros fixos (não giram): uma vez só, em cache
  cacheado(g, 'rgA' + r.x + ',' + r.y + P.parede.cromo, [r.x - r.R - 6, r.y - r.R - 6, r.x + r.R + 6, r.y + r.R + 6, 14], () => {
    for (const R of [r.R + 3, r.R - 3]) { g.c.beginPath(); for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, [X, Y] = g.p(r.x + Math.cos(a) * R, r.y + Math.sin(a) * R, 11); i ? g.c.lineTo(X, Y) : g.c.moveTo(X, Y); } g.c.strokeStyle = '#151826'; g.c.lineWidth = 3.4; g.c.stroke(); g.c.strokeStyle = P.parede.cromo; g.c.lineWidth = 1.6; g.c.stroke(); }
  });
  const [cx, cy] = g.p(r.x, r.y, 12); c.strokeStyle = P.parede.cromo; c.lineWidth = 1.2; c.beginPath();
  for (let i = 0; i < n; i++) { const [x, y] = pos(i), [X, Y] = g.p(x, y, 11); c.moveTo(cx, cy); c.lineTo(X, Y); } c.stroke();
  for (let i = 0; i < n; i++) { const [x, y] = pos(i), [X, Y, K] = g.p(x, y, 10), presa = !!r.cab[i]; poe(c, gondola(8 * K, [P.bumper.tampa, P.sling.plastico, P.alvo.face][i % 3], presa), X, Y); if (presa && !g.semBrilho) g.glow(x, y, 14, P.luz, 10, 0.7); }
  const [X, Y, K] = g.p(r.x, r.y, 0); poe(c, bumper(9 * K, 14 * 1.35 * K, P.bumper, r.flash > 0.3), X, Y);
}
function gondola(R: number, cor: string, presa: boolean) {
  R = q4(R); const m = R * 1.6;
  return sprite(`go|${R}|${cor}|${presa}`, m * 2, m * 2, m, m, c => {
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.ellipse(1, R * 0.4, R * 1.1, R * 0.6, 0, 0, TAU); c.fill();
    const gr = c.createLinearGradient(-R, -R, R, R); gr.addColorStop(0, tom(cor, 0.4)); gr.addColorStop(1, tom(cor, -0.45)); c.fillStyle = presa ? '#ffffff' : gr;
    c.beginPath(); c.roundRect(-R, -R * 0.9, R * 2, R * 1.5, R * 0.5); c.fill(); c.strokeStyle = cromo(c, -R, R); c.lineWidth = R * 0.15; c.stroke();
    if (!presa) { c.fillStyle = 'rgba(0,0,0,0.55)'; c.beginPath(); c.arc(0, -R * 0.12, R * 0.6, 0, TAU); c.fill(); }
  });
}

// ---------- flor mecânica: pétalas de esmalte que abrem e fecham (estado real), miolo-buraco ----------
export function pFlor(g: Pintor, f: any, P: PalR06) {
  const c = g.c, ab = f.aberta ? 1 : 0.35, [X, Y, K] = g.p(f.x, f.y, 2);
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); c.ellipse(X + 1, Y + 3 * K, 22 * K * ab + 6 * K, (22 * K * ab + 6 * K) * 0.7, 0, 0, TAU); c.fill();
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + f.fase * 0.2, px = X + Math.cos(a) * 12 * K * ab, py = Y + Math.sin(a) * 12 * K * ab * 0.82, cor = i % 2 ? P.bumper.tampa : P.sling.plastico;
    const gr = c.createRadialGradient(px - 2 * K, py - 2 * K, 0, px, py, 8 * K); gr.addColorStop(0, tom(cor, 0.55)); gr.addColorStop(1, tom(cor, -0.35));
    c.fillStyle = gr; c.beginPath(); c.ellipse(px, py, 8 * K, 5 * K, a, 0, TAU); c.fill(); c.strokeStyle = alfa('#ffffff', 0.45); c.lineWidth = 0.6 * K; c.stroke();
  }
  if (f.aberta) { const gr = c.createRadialGradient(X, Y, 0, X, Y, 9 * K); gr.addColorStop(0, '#000000'); gr.addColorStop(1, tom(P.alvo.face, -0.4)); c.fillStyle = gr; c.beginPath(); c.ellipse(X, Y, 9 * K, 7.5 * K, 0, 0, TAU); c.fill(); }
  else { c.fillStyle = P.alvo.face; c.beginPath(); c.ellipse(X, Y, 5 * K, 4 * K, 0, 0, TAU); c.fill(); }
  if (f.bola) g.glow(f.x, f.y, 20, P.luz, 3, 0.7);
}

// ---------- bola cativa: esfera de aço presa e o alvo no fim da canaleta ----------
export function pCativa(g: Pintor, b: any, P: PalR06) {
  const c = g.c, ex = b.x + b.dx * (b.curso + 9), ey = b.y + b.dy * (b.curso + 9), [EX, EY, EK] = g.p(ex, ey, 0);
  poe(c, poste(5 * EK, 10 * 1.35 * EK, b.flash > 0.2 ? '#ffffff' : P.alvo.face, '#ffffff'), EX, EY);
  const [X, Y, K] = g.p(b.c.x, b.c.y, 7), R = 6.5 * K;
  c.fillStyle = 'rgba(0,0,0,0.5)'; const [sx, sy] = g.p(b.c.x, b.c.y + 2, 0); c.beginPath(); c.ellipse(sx, sy, R, R * 0.45, 0, 0, TAU); c.fill();
  const gr = c.createRadialGradient(X - R * 0.35, Y - R * 0.4, R * 0.08, X, Y, R); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#d8deef'); gr.addColorStop(0.75, '#5a6080'); gr.addColorStop(1, '#1b1e2c');
  c.fillStyle = gr; c.beginPath(); c.arc(X, Y, R, 0, TAU); c.fill(); c.strokeStyle = alfa(P.luz, 0.7); c.lineWidth = Math.max(0.6, R * 0.12); c.stroke();
}
