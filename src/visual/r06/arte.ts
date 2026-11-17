// R06 · Biblioteca de pintura para os tablados premium: materiais por ruído (pedra, madeira, metal, areia, lava, água),
// volumes chanfrados, cristais facetados, tubos, engrenagens, nuvens, cidade, lona, placa gravada do chefe e o acabamento
// comum (luz geral, placa de insertos de estado, setas nos tiros reais, canaleta, contraste, grão).
import type { InfoMesa } from '../cenas';
import { Pincel, alfa, tom } from '../pincel';
import { estrelaGravada, gravada, lampada, nevoaRuido, rnd } from '../r05/aurora-arte';
import type { PalR06 } from './paleta';

export type Ctx = CanvasRenderingContext2D;
export const TAU = Math.PI * 2;
export { alfa, tom, rnd, lampada, gravada, estrelaGravada, nevoaRuido };

/** fundo vertical com várias paradas */
export function degrade(c: Ctx, w: number, h: number, st: [number, string][]) { const g = c.createLinearGradient(0, 0, 0, h); for (const [o, k] of st) g.addColorStop(o, k); c.fillStyle = g; c.fillRect(0, 0, w, h); }
/** textura de material por ruído cobrindo um retângulo */
export function textura(c: Ctx, x: number, y: number, w: number, h: number, seed: number, cores: string[], a = 0.5, limiar = 0.3) { nevoaRuido(c, x, y, w, h, seed, cores, a, () => 1, limiar); }
/** névoa macia */
export function brilho(c: Ctx, x: number, y: number, r: number, cor: string, a = 0.4, ry = r) { c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.scale(1, ry / r); const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, alfa(cor, a)); g.addColorStop(1, alfa(cor, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.restore(); }
export function sombra(c: Ctx, x: number, y: number, r: number, a = 0.5, ry = r) { c.save(); c.translate(x, y); c.scale(1, ry / r); const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.restore(); }
/** cone de luz */
export function feixe(c: Ctx, x: number, y: number, ang: number, abre: number, comp: number, cor: string, a = 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, comp); g.addColorStop(0, alfa(cor, a)); g.addColorStop(1, alfa(cor, 0)); c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.arc(x, y, comp, ang - abre, ang + abre); c.closePath(); c.fill(); c.restore(); }

/** blocos de pedra chanfrados (luz de cima-esquerda) com textura */
export function pedras(c: Ctx, x: number, y: number, w: number, h: number, bw: number, bh: number, cor: string, seed: number, a = 1) {
  const r = rnd(seed); c.save(); c.globalAlpha = a; c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let j = 0, yy = y; yy < y + h; j++, yy += bh) for (let xx = x - (j % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
    const k = tom(cor, (r() - 0.5) * 0.25); c.fillStyle = k; c.fillRect(xx + 1, yy + 1, bw - 2, bh - 2);
    c.fillStyle = 'rgba(255,255,255,0.09)'; c.fillRect(xx + 1, yy + 1, bw - 2, 1.5); c.fillRect(xx + 1, yy + 1, 1.5, bh - 2);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(xx + 1, yy + bh - 2.5, bw - 2, 1.5); c.fillRect(xx + bw - 2.5, yy + 1, 1.5, bh - 2);
  }
  c.restore(); textura(c, x, y, w, h, seed + 3, ['#000000', '#3a3a3a', '#8a8a8a'], 0.12 * a, 0.35);
}
/** tábuas de madeira com veio */
export function madeira(c: Ctx, x: number, y: number, w: number, h: number, pw: number, cor: string, seed: number) {
  const r = rnd(seed);
  for (let xx = x; xx < x + w; xx += pw) {
    const g = c.createLinearGradient(xx, 0, xx + pw, 0); const k = tom(cor, (r() - 0.5) * 0.2); g.addColorStop(0, tom(k, -0.25)); g.addColorStop(0.5, k); g.addColorStop(1, tom(k, -0.35)); c.fillStyle = g; c.fillRect(xx, y, pw - 1, h);
    c.strokeStyle = alfa(tom(k, -0.5), 0.45); c.lineWidth = 0.6; for (let i = 0; i < 5; i++) { const ox = xx + pw * (0.15 + i * 0.17); c.beginPath(); c.moveTo(ox, y); for (let yy = y; yy < y + h; yy += 20) c.lineTo(ox + Math.sin(yy * 0.02 + i + seed) * 2, yy); c.stroke(); }
  }
}
/** chapas de metal com bisel, rebites e sujeira */
export function chapas(c: Ctx, x: number, y: number, w: number, h: number, pw: number, ph: number, cor: string, seed: number) {
  for (let yy = y; yy < y + h; yy += ph) for (let xx = x; xx < x + w; xx += pw) {
    const g = c.createLinearGradient(xx, yy, xx + pw, yy + ph); g.addColorStop(0, tom(cor, 0.15)); g.addColorStop(0.5, cor); g.addColorStop(1, tom(cor, -0.35)); c.fillStyle = g; c.fillRect(xx + 1, yy + 1, pw - 2, ph - 2);
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.strokeRect(xx + 1.5, yy + 1.5, pw - 3, ph - 3);
    for (const [rx, ry] of [[5, 5], [pw - 5, 5], [5, ph - 5], [pw - 5, ph - 5]]) { const gg = c.createRadialGradient(xx + rx - 0.6, yy + ry - 0.6, 0, xx + rx, yy + ry, 2); gg.addColorStop(0, '#ffffff'); gg.addColorStop(1, tom(cor, -0.5)); c.fillStyle = gg; c.beginPath(); c.arc(xx + rx, yy + ry, 1.8, 0, TAU); c.fill(); }
  }
  textura(c, x, y, w, h, seed, ['#000000', '#2a2418', '#5a4a30'], 0.22, 0.4);
}
/** engrenagem chanfrada de metal */
export function engrenagem(c: Ctx, x: number, y: number, r: number, d: number, cor: string, rot = 0, a = 1) {
  c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.arc(r * 0.08, r * 0.12, r * 1.12, 0, TAU); c.fill();
  for (let i = 0; i < d; i++) { c.save(); c.rotate(i / d * TAU); const g = c.createLinearGradient(-r * 0.12, 0, r * 0.12, 0); g.addColorStop(0, tom(cor, -0.4)); g.addColorStop(0.5, tom(cor, 0.25)); g.addColorStop(1, tom(cor, -0.5)); c.fillStyle = g; c.beginPath(); c.moveTo(-r * 0.13, -r * 0.88); c.lineTo(-r * 0.09, -r * 1.14); c.lineTo(r * 0.09, -r * 1.14); c.lineTo(r * 0.13, -r * 0.88); c.fill(); c.restore(); }
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, tom(cor, 0.45)); g.addColorStop(0.6, cor); g.addColorStop(1, tom(cor, -0.5)); c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, r * 0.92, 0, TAU); c.arc(0, 0, r * 0.6, 0, TAU, true); c.fill();
  for (let i = 0; i < 5; i++) { c.save(); c.rotate(i / 5 * TAU); c.fillStyle = cor; c.fillRect(-r * 0.07, -r * 0.62, r * 0.14, r * 0.62); c.restore(); }
  c.fillStyle = tom(cor, 0.2); c.beginPath(); c.arc(0, 0, r * 0.2, 0, TAU); c.fill(); c.fillStyle = tom(cor, -0.6); c.beginPath(); c.arc(0, 0, r * 0.08, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 0.8; c.beginPath(); c.arc(0, 0, r * 0.92, Math.PI * 1.05, Math.PI * 1.65); c.stroke(); c.restore();
}
/** cristal facetado: faces claras e escuras, aresta brilhante e brilho interno */
export function cristal(c: Ctx, x: number, y: number, w: number, h: number, cor: string, inc = 0, a = 1) {
  c.save(); c.globalAlpha = a; const t = [x + inc, y - h], l = [x - w, y - h * 0.18], r = [x + w, y - h * 0.22], b = [x, y];
  const tri = (p: number[][], k: string) => { c.fillStyle = k; c.beginPath(); p.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fill(); };
  tri([t, l, b], alfa(tom(cor, 0.35), 0.85)); tri([t, r, b], alfa(tom(cor, -0.35), 0.85)); tri([t, [x + inc * 0.4, y - h * 0.5], l], alfa('#ffffff', 0.18));
  c.strokeStyle = alfa('#ffffff', 0.7); c.lineWidth = 0.8; c.beginPath(); c.moveTo(t[0], t[1]); c.lineTo(b[0], b[1]); c.stroke(); c.restore();
  brilho(c, x + inc * 0.4, y - h * 0.45, w * 1.4, cor, 0.25 * a);
}
/** tubo cilíndrico (sombra, corpo, reflexo) ao longo de pontos */
export function tubo(c: Ctx, pts: number[][], r: number, cor: string) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [k, l, dy] of [['rgba(0,0,0,0.5)', r * 2.4, r * 0.4], [tom(cor, -0.45), r * 2, 0], [cor, r * 1.3, -r * 0.15], [alfa('#ffffff', 0.45), r * 0.35, -r * 0.55]] as [string, number, number][]) { c.strokeStyle = k; c.lineWidth = l; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1] + dy) : c.moveTo(p[0], p[1] + dy))); c.stroke(); }
}
/** nuvens por ruído numa faixa */
export function nuvens(c: Ctx, y0: number, y1: number, seed: number, cores: string[], a = 0.6, w = 400) { nevoaRuido(c, 0, y0, w, y1 - y0, seed, cores, a, (u, v) => Math.sin(v * Math.PI), 0.38); }
/** cidade: prédios com janelas, tetos e luzes de topo */
export function cidade(c: Ctx, base: number, alt: number, seed: number, cor: string, janela: string, w = 400) {
  const r = rnd(seed);
  for (let x = -10; x < w;) {
    const bw = 18 + r() * 34, bh = alt * (0.35 + r() * 0.65); const g = c.createLinearGradient(x, 0, x + bw, 0); g.addColorStop(0, tom(cor, 0.15)); g.addColorStop(0.7, cor); g.addColorStop(1, tom(cor, -0.4)); c.fillStyle = g; c.fillRect(x, base - bh, bw - 2, bh + 400);
    for (let j = base - bh + 6; j < base + 60; j += 7) for (let i = x + 3; i < x + bw - 6; i += 5) if (r() < 0.32) { c.fillStyle = alfa(janela, 0.4 + r() * 0.5); c.fillRect(i, j, 2.4, 3.6); }
    if (r() < 0.4) { c.fillStyle = '#ff4466'; c.beginPath(); c.arc(x + bw / 2, base - bh - 3, 1.3, 0, TAU); c.fill(); brilho(c, x + bw / 2, base - bh - 3, 6, '#ff4466', 0.5); }
    x += bw;
  }
}
/** lona listrada em gomos com dobras sombreadas */
export function lona(c: Ctx, cx: number, cy: number, raio: number, a0: number, a1: number, n: number, c1: string, c2: string) {
  for (let i = 0; i < n; i++) {
    const q0 = a0 + (a1 - a0) * i / n, q1 = a0 + (a1 - a0) * (i + 1) / n, qm = (q0 + q1) / 2;
    const g = c.createLinearGradient(cx + Math.cos(q0) * raio, cy + Math.sin(q0) * raio, cx + Math.cos(q1) * raio, cy + Math.sin(q1) * raio); const k = i % 2 ? c1 : c2; g.addColorStop(0, tom(k, -0.35)); g.addColorStop(0.5, k); g.addColorStop(1, tom(k, -0.45));
    c.fillStyle = g; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(q0) * raio, cy + Math.sin(q0) * raio); c.quadraticCurveTo(cx + Math.cos(qm) * raio * 1.04, cy + Math.sin(qm) * raio * 1.04, cx + Math.cos(q1) * raio, cy + Math.sin(q1) * raio); c.closePath(); c.fill();
  }
}
/** linha de lâmpadas acesas (marquise) */
export function lampadas(c: Ctx, pts: number[][], cor: string, r = 2) { for (const p of pts) { brilho(c, p[0], p[1], r * 4, cor, 0.4); const g = c.createRadialGradient(p[0] - r * 0.3, p[1] - r * 0.3, 0, p[0], p[1], r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, cor); g.addColorStop(1, tom(cor, -0.5)); c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], r, 0, TAU); c.fill(); } }
export const arco = (x: number, y: number, r: number, a0: number, a1: number, n: number) => Array.from({ length: n }, (_, i) => { const q = a0 + (a1 - a0) * i / Math.max(1, n - 1); return [x + Math.cos(q) * r, y + Math.sin(q) * r]; });

/** placa gravada sob o chefe: anéis em relevo do metal da máquina, marcações e (opcional) texto */
export function placaChefe(c: Ctx, x: number, y: number, r: number, metal: string, texto = '', marcas = 48) {
  const anel = (rr: number, l: number) => { for (const [k, f, d] of [['rgba(0,0,0,0.6)', 1.6, 0.8], [tom(metal, -0.45), 1.15, 0], [metal, 0.7, -0.3], ['#ffffff', 0.2, -0.55]] as [string, number, number][]) { c.strokeStyle = k; c.lineWidth = l * f; c.beginPath(); c.arc(x, y + d, rr, 0, TAU); c.stroke(); } };
  sombra(c, x, y, r * 1.25, 0.55);
  anel(r, 3); anel(r * 0.8, 1.5);
  for (let i = 0; i < marcas; i++) { const a = i / marcas * TAU, l = i % 4 ? 0.05 : 0.1; c.strokeStyle = i % 4 ? alfa(metal, 0.55) : tom(metal, 0.4); c.lineWidth = i % 4 ? 0.6 : 1.2; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82); c.lineTo(x + Math.cos(a) * r * (0.82 + l), y + Math.sin(a) * r * (0.82 + l)); c.stroke(); }
  if (texto) { c.save(); c.font = `700 ${Math.max(5, r * 0.11)}px Orbitron, sans-serif`; c.fillStyle = tom(metal, 0.3); c.textAlign = 'center'; c.textBaseline = 'middle'; const L = texto.split(''), passo = 0.11; let q = Math.PI / 2 + (L.length - 1) * passo / 2; for (const ch of L) { c.save(); c.translate(x + Math.cos(q) * r * 1.13, y + Math.sin(q) * r * 1.13); c.rotate(q - Math.PI / 2); c.fillText(ch, 0, 0); c.restore(); q -= passo; } c.restore(); }
}

/** acabamento comum: luz geral, placa de insertos de estado e rótulos, setas, canaleta, contraste e grão */
export function finaliza(c: Ctx, p: Pincel, m: InfoMesa, P: PalR06, o: { placa?: string; texto?: string; lago?: boolean } = {}) {
  if (o.placa) placaChefe(c, m.chefe.x, m.chefe.y, 50, o.placa, o.texto || '');
  for (const [x, y, k] of [[100, 600, P.sling.plastico], [280, 600, P.sling.plastico], [70, 470, P.saucer], [310, 470, P.saucer], [104, 455, P.luz], [276, 455, P.luz], [60, 200, P.bumper.tampa], [320, 200, P.bumper.tampa]] as [number, number, string][]) lampada(c, x, y, 44, k, 0.26);
  for (const b of m.bumpers) { lampada(c, b.x, b.y + 4, b.r * 2.6, P.bumper.luz, 0.22); sombra(c, b.x, b.y + 6, b.r * 1.5, 0.45); }
  // placa da zona baixa: recebe os insertos de estado (bônus, missões, bola protegida)
  const z = c.createRadialGradient(190, 615, 10, 190, 615, 110); z.addColorStop(0, 'rgba(10,12,30,0.6)'); z.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = z; c.fillRect(70, 520, 240, 190);
  gravada(c, p.arcoPts(190, 690, 104, Math.PI * 1.18, Math.PI * 1.82, 24), alfa(P.parede.cromo, 0.45), 0.8);
  gravada(c, p.arcoPts(190, 690, 66, Math.PI * 1.08, Math.PI * 1.92, 20), alfa(P.parede.cromo, 0.35), 0.7);
  const rot = (s: string, x: number, y: number, tam: number, cor: string) => { c.font = `700 ${tam}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillText(s, x, y + 0.6); c.fillStyle = cor; c.fillText(s, x, y); };
  rot('M I S S Õ E S', 190, 562, 4.6, tom(P.insertos.missao, 0.3)); rot('B Ô N U S', 190, 618, 4.8, tom(P.insertos.bonus, 0.3)); rot('BOLA PROTEGIDA', 190, 681, 4.6, tom(P.insertos.protegida, 0.3));
  for (const rp of m.rampas) for (let k = 0; k < 3; k++) p.chevron(rp.mx, 476 + k * 15, 5.5, 0, k === 0 ? '#ffffff' : P.luz, 0.5 - k * 0.12);
  for (const x of m.orbitas) for (let k = 0; k < 2; k++) p.chevron(x, 500 + k * 14, 4, 0, P.sling.plastico, 0.4 - k * 0.12);
  const ac = c.createLinearGradient(362, 0, 392, 0); ac.addColorStop(0, '#05060c'); ac.addColorStop(0.5, '#1c2034'); ac.addColorStop(1, '#05060c'); c.fillStyle = ac; c.fillRect(362, 186, 30, 574);
  for (let y = 200; y < 760; y += 3) { c.fillStyle = 'rgba(140,150,190,0.05)'; c.fillRect(362, y, 30, 1); }
  const cal = c.createLinearGradient(0, 640, 0, 760); cal.addColorStop(0, 'rgba(1,2,8,0)'); cal.addColorStop(1, 'rgba(1,2,8,0.72)'); c.fillStyle = cal; c.fillRect(0, 640, 400, 120);
  p.vinheta(0.55, 200, 330); p.grao(0.08);
}
