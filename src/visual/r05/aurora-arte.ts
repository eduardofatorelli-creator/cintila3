// R05 · Aurora: tablado e backglass pintados uma vez (cache). Técnicas: ruído fractal para nebulosa e via láctea,
// cortinas de aurora renderizadas em baixa resolução e ampliadas (desfoque real em qualquer navegador), estrelas em 3 camadas,
// cordilheira com luz de borda vinda da aurora, observatório, lago gelado com reflexo, astrolábio de latão sob o chefe,
// constelação gravada ligando os alvos reais e a zona baixa com insertos de estado e luz geral.
import type { InfoMesa } from '../cenas';
import { Pincel, alfa, tom } from '../pincel';
import type { MachineDef } from '../../machines/_schema';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const A = { ciano: '#7df9ff', verde: '#5dffb4', violeta: '#b48cff', rosa: '#ff6fb5', ouro: '#ffd27a', rubra: '#ff3355' };

// ---------- ruído ----------
export function rnd(seed: number) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
/** ruído fractal (value noise, 5 oitavas) em w×h, valores 0..1 */
export function fbm(w: number, h: number, seed: number, escala = 0.06, oit = 5): Float32Array {
  const r = rnd(seed), G = 64, tab = new Float32Array(G * G).map(() => r()), out = new Float32Array(w * h);
  const v = (x: number, y: number) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, s = (t: number) => t * t * (3 - 2 * t), g = (i: number, j: number) => tab[((j % G + G) % G) * G + ((i % G + G) % G)];
    const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1), u = s(xf), vv = s(yf); return a + (b - a) * u + (c - a) * vv + (a - b - c + d) * u * vv; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let f = escala, amp = 0.5, s = 0, n = 0; for (let o = 0; o < oit; o++) { s += v(x * f, y * f) * amp; n += amp; f *= 2; amp *= 0.5; } out[y * w + x] = s / n; }
  return out;
}
const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
/** pinta uma nuvem de ruído colorida (em baixa resolução, ampliada com suavização) */
export function nevoaRuido(c: Ctx, x: number, y: number, w: number, h: number, seed: number, cores: string[], alfaMax: number, mascara: (u: number, v: number) => number, limiar = 0.45) {
  const lw = Math.max(8, Math.round(w / 4)), lh = Math.max(8, Math.round(h / 4)), n = fbm(lw, lh, seed), cv = document.createElement('canvas'); cv.width = lw; cv.height = lh;
  const g = cv.getContext('2d')!, img = g.createImageData(lw, lh), cs = cores.map(hex);
  for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) {
    const k = j * lw + i, val = Math.max(0, (n[k] - limiar) / (1 - limiar)), m = mascara(i / lw, j / lh), a = Math.min(1, val * 1.6) * m * alfaMax;
    const t = Math.min(cs.length - 1.001, val * (cs.length - 1)), i0 = Math.floor(t), f = t - i0, c0 = cs[i0], c1 = cs[i0 + 1];
    img.data[k * 4] = c0[0] + (c1[0] - c0[0]) * f; img.data[k * 4 + 1] = c0[1] + (c1[1] - c0[1]) * f; img.data[k * 4 + 2] = c0[2] + (c1[2] - c0[2]) * f; img.data[k * 4 + 3] = a * 255;
  }
  g.putImageData(img, 0, 0); c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.globalCompositeOperation = 'lighter'; c.drawImage(cv, x, y, w, h); c.restore();
}

/** cortinas de aurora: traços verticais em baixa resolução, ampliados (desfoque) + raios finos em resolução cheia */
export function cortinas(c: Ctx, w: number, h: number, y0: number, alt: number, seed: number, forca = 1, espelho = false) {
  const r = rnd(seed), lw = Math.round(w / 3), lh = Math.round((alt * 1.6) / 3), cv = document.createElement('canvas'); cv.width = lw; cv.height = lh; const g = cv.getContext('2d')!;
  g.globalCompositeOperation = 'lighter';
  const bandas = [{ cor: A.verde, f: 0.3, amp: 0.16, y: 0.2, a: 0.85 }, { cor: '#3fe0d0', f: 1.9, amp: 0.12, y: 0.32, a: 0.55 }, { cor: A.violeta, f: 3.7, amp: 0.1, y: 0.1, a: 0.45 }];
  for (const B of bandas) for (let x = 0; x < lw; x += 0.7) {
    const u = x / lw, yy = (B.y + Math.sin(u * 5.2 + B.f) * B.amp + Math.sin(u * 13 + B.f * 2) * B.amp * 0.3) * lh, hh = lh * (0.35 + 0.35 * Math.abs(Math.sin(u * 9 + B.f * 1.3)) + r() * 0.12);
    const intens = (0.4 + 0.6 * Math.pow(Math.abs(Math.sin(u * 3.1 + B.f)), 0.6)) * B.a;
    const gr = g.createLinearGradient(0, yy, 0, yy + hh); gr.addColorStop(0, alfa(B === bandas[0] ? '#b48cff' : B.cor, 0)); gr.addColorStop(0.12, alfa(B.cor, 0.5 * intens)); gr.addColorStop(0.35, alfa(B.cor, 0.25 * intens)); gr.addColorStop(1, alfa(B.cor, 0));
    g.fillStyle = gr; g.fillRect(x, yy, 0.9, hh);
  }
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = forca; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  if (espelho) { c.translate(0, y0); c.scale(1, -0.55); c.drawImage(cv, 0, -alt * 1.6, w, alt * 1.6); }
  else { c.drawImage(cv, 0, y0, w, alt * 1.6);
    // raios finos: dão textura de cortina sem virar linhas duras
    c.globalAlpha = forca * 0.18;
    for (let i = 0; i < 40; i++) { const x = r() * w, u = x / w, yy = y0 + (0.2 + Math.sin(u * 5.2 + 0.3) * 0.16) * alt * 1.6, hh = alt * (0.3 + r() * 0.5); const gr = c.createLinearGradient(0, yy, 0, yy + hh); gr.addColorStop(0, alfa(A.verde, 0)); gr.addColorStop(0.15, alfa(r() < 0.3 ? '#c6fff0' : A.verde, 0.18)); gr.addColorStop(1, alfa(A.verde, 0)); c.fillStyle = gr; c.fillRect(x, yy, 0.8, hh); }
  }
  c.restore();
}

export function estrelas(c: Ctx, w: number, y0: number, y1: number, seed: number, n: number, densa?: (x: number, y: number) => number) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = y0 + r() * (y1 - y0); if (densa && r() > densa(x, y)) continue;
    const t = r(), rr = t < 0.8 ? 0.35 + r() * 0.4 : t < 0.97 ? 0.8 + r() * 0.5 : 1.4 + r() * 0.8, cor = r() < 0.15 ? '#ffe8c8' : r() < 0.3 ? '#c8e4ff' : '#ffffff';
    c.globalAlpha = 0.35 + r() * 0.65; c.fillStyle = cor; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
    if (rr > 1.3) { c.globalAlpha = 0.5; c.strokeStyle = cor; c.lineWidth = 0.5; c.beginPath(); c.moveTo(x - rr * 4, y); c.lineTo(x + rr * 4, y); c.moveTo(x, y - rr * 4); c.lineTo(x, y + rr * 4); c.stroke(); const g = c.createRadialGradient(x, y, 0, x, y, rr * 5); g.addColorStop(0, alfa('#ffffff', 0.35)); g.addColorStop(1, alfa('#ffffff', 0)); c.fillStyle = g; c.fillRect(x - rr * 5, y - rr * 5, rr * 10, rr * 10); }
  }
  c.globalAlpha = 1;
}

/** serra de montanha: crista suave de ruído (3 oitavas), faces voltadas para a aurora com luz de borda, neve só nos pontos altos */
export function serra(c: Ctx, w: number, base: number, alt: number, seed: number, cor: string, borda: string, neve: boolean, picos = 6) {
  const r = rnd(seed), oit = [0, 1, 2].map(o => Array.from({ length: picos * (1 << o) + 2 }, () => r()));
  const alt1 = (u: number) => { let v = 0, a = 1, n = 0; oit.forEach((tb, o) => { const x = u * (picos * (1 << o)), i = Math.floor(x), f = x - i, s2 = (1 - Math.cos(f * Math.PI)) / 2; v += (tb[i] * (1 - s2) + tb[i + 1] * s2) * a; n += a; a *= 0.45; }); const q = v / n; return Math.pow(Math.max(0, q), 1.6); };
  const N = 120, pts: number[][] = []; for (let i = 0; i <= N; i++) { const u = i / N; pts.push([u * w, base - alt1(u) * alt * 1.6]); }
  c.beginPath(); c.moveTo(0, base + 300); pts.forEach(p => c.lineTo(p[0], p[1])); c.lineTo(w, base + 300); c.closePath();
  const g = c.createLinearGradient(0, base - alt, 0, base + 30); g.addColorStop(0, tom(cor, 0.18)); g.addColorStop(0.6, cor); g.addColorStop(1, tom(cor, -0.5)); c.fillStyle = g; c.fill();
  // encostas que recebem a luz (inclinação descendo para a direita)
  c.save(); c.clip(); for (let i = 1; i < N; i++) { const a = pts[i], b = pts[i + 1], dz = b[1] - a[1]; if (dz <= 0) continue; c.fillStyle = alfa(borda, Math.min(0.16, dz * 0.03)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(b[0] + 6, base + 20); c.lineTo(a[0] + 6, base + 20); c.closePath(); c.fill(); } c.restore();
  c.lineJoin = 'round'; c.strokeStyle = alfa(borda, 0.45); c.lineWidth = 0.9; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
  if (neve) { c.strokeStyle = alfa('#eaf6ff', 0.5); c.lineWidth = 1.6; for (let i = 1; i < N; i++) { if (base - pts[i][1] < alt * 0.95) continue; c.beginPath(); c.moveTo(pts[i][0], pts[i][1] + 0.8); c.lineTo(pts[i + 1][0], pts[i + 1][1] + 0.8); c.stroke(); } }
}

export function pinheiros(c: Ctx, x0: number, x1: number, base: number, alt: number, seed: number, cor: string, n: number) {
  const r = rnd(seed); c.fillStyle = cor;
  for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), h = alt * (0.55 + r() * 0.45), w = h * 0.32; c.beginPath(); c.moveTo(x, base - h); for (let k = 0; k < 4; k++) { const y = base - h + (k + 1) * h * 0.24; c.lineTo(x + w * (0.4 + k * 0.2), y); c.lineTo(x + w * 0.18, y - h * 0.04); } c.lineTo(x + 2, base); c.lineTo(x - 2, base); for (let k = 3; k >= 0; k--) { const y = base - h + (k + 1) * h * 0.24; c.lineTo(x - w * 0.18, y - h * 0.04); c.lineTo(x - w * (0.4 + k * 0.2), y); } c.closePath(); c.fill(); }
}

export function observatorio(c: Ctx, x: number, y: number, s: number) {
  c.fillStyle = '#0c0f26'; c.fillRect(x - 14 * s, y - 12 * s, 28 * s, 14 * s);
  const g = c.createLinearGradient(x - 16 * s, 0, x + 16 * s, 0); g.addColorStop(0, '#1a1e3e'); g.addColorStop(0.35, '#9aa6d0'); g.addColorStop(0.6, '#3a4068'); g.addColorStop(1, '#10132a');
  c.fillStyle = g; c.beginPath(); c.arc(x, y - 12 * s, 16 * s, Math.PI, TAU); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(x + 3 * s, y - 20 * s, 0, x + 3 * s, y - 20 * s, 26 * s); gl.addColorStop(0, alfa('#ffd8a0', 0.6)); gl.addColorStop(1, alfa('#ffd8a0', 0)); c.fillStyle = gl; c.fillRect(x - 30 * s, y - 50 * s, 60 * s, 60 * s); c.restore();
  c.fillStyle = '#ffe2b0'; c.fillRect(x + 1 * s, y - 27 * s, 4 * s, 15 * s);
  c.strokeStyle = '#9aa6d0'; c.lineWidth = 1.4 * s; c.beginPath(); c.moveTo(x + 3 * s, y - 25 * s); c.lineTo(x + 14 * s, y - 36 * s); c.stroke();
  c.fillStyle = '#ffd890'; for (const dx of [-9, -3, 7]) c.fillRect(x + dx * s, y - 6 * s, 2.4 * s, 3 * s);
}

/** astrolábio de latão: anéis em relevo (sombra, ouro, brilho), marcações, numerais e rosa dos ventos */
export function astrolabio(c: Ctx, x: number, y: number, r: number) {
  const anel = (rr: number, l: number) => { for (const [cor, f, d] of [['rgba(0,0,0,0.6)', 1.6, 0.8], ['#8a5a1c', 1.15, 0], ['#e9bd62', 0.7, -0.3], ['#fff4cf', 0.22, -0.55]] as [string, number, number][]) { c.strokeStyle = cor; c.lineWidth = l * f; c.beginPath(); c.arc(x, y + d, rr, 0, TAU); c.stroke(); } };
  c.save();
  const fundo = c.createRadialGradient(x, y, r * 0.2, x, y, r * 1.2); fundo.addColorStop(0, 'rgba(40,20,70,0.0)'); fundo.addColorStop(0.7, 'rgba(10,8,30,0.55)'); fundo.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = fundo; c.beginPath(); c.arc(x, y, r * 1.2, 0, TAU); c.fill();
  anel(r, 3); anel(r * 0.82, 1.6);
  for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, l = i % 6 ? 0.04 : 0.09; c.strokeStyle = i % 6 ? alfa('#e9bd62', 0.6) : '#ffe6a8'; c.lineWidth = i % 6 ? 0.6 : 1.2; c.beginPath(); c.moveTo(x + Math.cos(a) * r * (0.84), y + Math.sin(a) * r * 0.84); c.lineTo(x + Math.cos(a) * r * (0.84 + l), y + Math.sin(a) * r * (0.84 + l)); c.stroke(); }
  const rom = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']; c.fillStyle = '#f2d08a'; c.font = `700 ${Math.max(5, r * 0.085)}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  rom.forEach((s, i) => { const a = -Math.PI / 2 + i / 12 * TAU; c.save(); c.translate(x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1); c.rotate(a + Math.PI / 2); c.fillText(s, 0, 0); c.restore(); });
  // rosa dos ventos gravada (fica sob o pedestal do chefe; só as pontas aparecem)
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i / 8 * TAU, L = r * (i % 2 ? 0.55 : 0.78); c.fillStyle = i % 2 ? alfa('#c99a4a', 0.55) : alfa('#f2d08a', 0.8); c.beginPath(); c.moveTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.lineTo(x + Math.cos(a + 0.18) * r * 0.2, y + Math.sin(a + 0.18) * r * 0.2); c.lineTo(x + Math.cos(a - 0.18) * r * 0.2, y + Math.sin(a - 0.18) * r * 0.2); c.closePath(); c.fill(); }
  c.restore();
}

/** linha gravada em metal: sulco escuro + filete de luz */
export function gravada(c: Ctx, pts: number[][], cor: string, l = 1.2) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [k, w, dy] of [['rgba(0,0,0,0.65)', l * 2.2, 0.7], [cor, l, 0], ['rgba(255,255,255,0.55)', l * 0.35, -0.4]] as [string, number, number][]) { c.strokeStyle = k; c.lineWidth = w; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1] + dy) : c.moveTo(p[0], p[1] + dy))); c.stroke(); }
}
export function estrelaGravada(c: Ctx, x: number, y: number, r: number, cor: string) {
  c.save(); c.translate(x, y); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, 0, 0, 0, 0, r * 3); g.addColorStop(0, alfa(cor, 0.5)); g.addColorStop(1, alfa(cor, 0)); c.fillStyle = g; c.fillRect(-r * 3, -r * 3, r * 6, r * 6); c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#f6f9ff'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr = i % 2 ? r * 0.3 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore();
}

/** luz geral: lâmpada embutida sob plástico (justifica a poça de luz) */
export function lampada(c: Ctx, x: number, y: number, r: number, cor: string, a = 0.5) {
  c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, alfa(cor, a)); g.addColorStop(0.3, alfa(cor, a * 0.4)); g.addColorStop(1, alfa(cor, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore();
}

export function ceuNoturno(c: Ctx, w: number, h: number, seed: number, horizonte: number) {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#02030f'); g.addColorStop(horizonte * 0.45, '#071036'); g.addColorStop(horizonte, '#12184a'); g.addColorStop(Math.min(1, horizonte + 0.02), '#060a24'); g.addColorStop(1, '#02030c'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  // via láctea diagonal (ruído) e nebulosas
  const vl = (u: number, v: number) => { const d = Math.abs((v - 0.05) - (1 - u) * 0.55) ; return Math.max(0, 1 - d * 5) * (v < horizonte ? 1 : 0); };
  nevoaRuido(c, 0, 0, w, h * horizonte, seed, ['#1a1440', '#5a4aa8', '#c8b8ff', '#ffffff'], 0.55, vl, 0.4);
  nevoaRuido(c, 0, 0, w, h * horizonte, seed + 7, ['#0a2a40', '#1c6a7a', '#4dd2c8'], 0.32, (u, v) => Math.max(0, 1 - Math.abs(u - 0.2) * 2.5) * Math.max(0, 1 - v * 1.4), 0.5);
  estrelas(c, w, 0, h * horizonte, seed + 1, Math.round(w * h * horizonte / 90));
  estrelas(c, w, 0, h * horizonte, seed + 2, Math.round(w * h * horizonte / 70), (x, y) => vl(x / w, y / h) * 1.2);
}

// ================= tablado =================
export function auroraTablado(p: Pincel, m: InfoMesa) {
  const c = p.c, W = 400, H = 760, HOR = 0.71; // horizonte do lago em y ≈ 540
  ceuNoturno(c, W, H, 11, HOR);
  cortinas(c, W, H, 18, 170, 5, 0.95);
  // cordilheira distante (azulada) e próxima (escura) com luz de borda verde-água
  serra(c, W, 530, 62, 3, '#151c4a', '#5dffb4', true, 5);
  observatorio(c, 322, 500, 0.95);
  serra(c, W, 543, 26, 9, '#0a0d26', '#7df9ff', false, 9);
  // lago gelado: reflexo da aurora espelhado e ondulado, gelo com trincas
  const lago = c.createLinearGradient(0, 540, 0, H); lago.addColorStop(0, '#0d1a4a'); lago.addColorStop(0.35, '#060b28'); lago.addColorStop(1, '#02030c'); c.fillStyle = lago; c.fillRect(0, 540, W, H - 540);
  c.save(); c.beginPath(); c.rect(0, 540, W, H - 540); c.clip(); cortinas(c, W, H, 540, 170, 5, 0.75, true);
  lampada(c, 322, 552, 40, '#ffd8a0', 0.25);
  const r = rnd(41); for (let y = 545; y < 700; y += 2 + (y - 540) * 0.04) { c.strokeStyle = alfa('#bfe6ff', 0.05 + r() * 0.06); c.lineWidth = 0.6; c.beginPath(); const x0 = r() * W; c.moveTo(x0, y); c.lineTo(x0 + 30 + r() * 120, y); c.stroke(); }
  for (let i = 0; i < 14; i++) { let x = r() * W, y = 560 + r() * 180; c.strokeStyle = alfa('#d8f2ff', 0.1); c.lineWidth = 0.6; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 16; c.lineTo(x, y); } c.stroke(); }
  c.restore();
  for (const [x, y] of [[36, 590], [44, 640], [350, 600], [338, 652], [120, 700], [262, 700]]) { lampada(c, x, y, 14, '#bfefff', 0.35); estrelaGravada(c, x, y, 1.6, '#e8fbff'); }
  pinheiros(c, 0, 70, 548, 46, 21, '#03040e', 7); pinheiros(c, 330, 400, 548, 46, 23, '#03040e', 7);
  // constelação gravada ligando os alvos reais, na ordem numérica (é a mecânica-assinatura)
  const al = m.pecas.filter(q => q.tipo === 'alvoFixo' && /^\d+$/.test(q.rotulo || '')).sort((a, b) => +a.rotulo - +b.rotulo);
  if (al.length > 1) {
    c.save(); c.setLineDash([2, 7]); c.lineCap = 'round'; c.strokeStyle = alfa('#bfe0ff', 0.45); c.lineWidth = 1.1; c.beginPath(); al.forEach((a, i) => (i ? c.lineTo(a.x, a.y + 8) : c.moveTo(a.x, a.y + 8))); c.stroke(); c.restore();
    for (let i = 0; i < al.length - 1; i++) for (let k = 1; k < 3; k++) { const u = k / 3, x = al[i].x + (al[i + 1].x - al[i].x) * u, y = al[i].y + 8 + (al[i + 1].y - al[i].y) * u; estrelaGravada(c, x + (k % 2 ? 6 : -6), y, 1.4, '#c8e4ff'); }
    for (const a of al) estrelaGravada(c, a.x, a.y + 8, 3.2, A.ciano);
  }
  // astrolábio sob o chefe
  astrolabio(c, m.chefe.x, m.chefe.y, 50);
  // luz geral sob os plásticos e ao pé das rampas (cada poça tem uma lâmpada que a justifica)
  for (const [x, y, cor] of [[100, 600, '#9fd8ff'], [280, 600, '#9fd8ff'], [70, 470, A.violeta], [310, 470, A.violeta], [104, 455, A.ciano], [276, 455, A.ciano], [60, 200, '#c8b8ff'], [320, 200, '#c8b8ff']] as [number, number, string][]) lampada(c, x, y, 46, cor, 0.32);
  for (const b of m.bumpers) { lampada(c, b.x, b.y + 4, b.r * 2.6, A.ciano, 0.25); const g = c.createRadialGradient(b.x, b.y + 6, 0, b.x, b.y + 6, b.r * 1.5); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(b.x - b.r * 2, b.y - b.r * 2, b.r * 4, b.r * 4); }
  // zona baixa: placa gravada que recebe os insertos de estado (bônus, missões, bola protegida)
  const zona = c.createRadialGradient(190, 615, 10, 190, 615, 110); zona.addColorStop(0, 'rgba(30,40,90,0.55)'); zona.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = zona; c.fillRect(70, 520, 240, 190);
  gravada(c, p.arcoPts(190, 690, 104, Math.PI * 1.18, Math.PI * 1.82, 24), alfa('#8fa6e0', 0.45), 0.8);
  gravada(c, p.arcoPts(190, 690, 66, Math.PI * 1.08, Math.PI * 1.92, 20), alfa('#8fa6e0', 0.35), 0.7);
  const rotulo = (s: string, x: number, y: number, tam = 5.2, cor = '#c9d6ff') => { c.font = `700 ${tam}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillText(s, x, y + 0.6); c.fillStyle = cor; c.fillText(s, x, y); };
  rotulo('M I S S Õ E S', 190, 562, 4.6, '#9fe8ff'); rotulo('B Ô N U S', 190, 618, 4.8, '#ffe2a0'); rotulo('BOLA PROTEGIDA', 190, 681, 4.6, '#b8ffd8');
  // setas pintadas sob as entradas reais das rampas e órbitas
  for (const rp of m.rampas) for (let k = 0; k < 3; k++) p.chevron(rp.mx, 476 + k * 15, 5.5, 0, k === 0 ? '#ffffff' : A.ciano, 0.5 - k * 0.12);
  for (const x of m.orbitas) for (let k = 0; k < 2; k++) p.chevron(x, 500 + k * 14, 4, 0, A.violeta, 0.4 - k * 0.12);
  // canaleta do lançador: aço escovado
  const ac = c.createLinearGradient(362, 0, 392, 0); ac.addColorStop(0, '#05060c'); ac.addColorStop(0.5, '#1c2034'); ac.addColorStop(1, '#05060c'); c.fillStyle = ac; c.fillRect(362, 186, 30, 574);
  for (let y = 200; y < 760; y += 3) { c.fillStyle = alfa('#8a94c0', 0.05); c.fillRect(362, y, 30, 1); }
  // contraste: escurece a faixa das palhetas e as bordas, grão de impressão por cima
  const calma = c.createLinearGradient(0, 640, 0, H); calma.addColorStop(0, 'rgba(1,2,8,0)'); calma.addColorStop(1, 'rgba(1,2,8,0.7)'); c.fillStyle = calma; c.fillRect(0, 640, W, H - 640);
  p.vinheta(0.55, 200, 330); p.grao(0.08);
}

// ================= backglass =================
export function auroraVidro(L: Ctx[], w: number, h: number, d: MachineDef) {
  const [c0, c1, c2] = L, HOR = 0.82;
  ceuNoturno(c0, w, h, 77, HOR); cortinas(c0, w, h, -8, 70, 13, 1);
  serra(c1, w, h * 0.86, 60, 5, '#121842', '#5dffb4', true, 8); observatorio(c1, w * 0.16, h * 0.8, 0.9);
  // a Estrela Rubra no céu, à direita, com seu brilho
  const ex = w * 0.87, ey = h * 0.2, R = h * 0.12;
  c1.save(); c1.globalCompositeOperation = 'lighter'; const gl = c1.createRadialGradient(ex, ey, 0, ex, ey, R * 2.6); gl.addColorStop(0, alfa(A.rubra, 0.55)); gl.addColorStop(1, alfa(A.rubra, 0)); c1.fillStyle = gl; c1.fillRect(ex - R * 3, ey - R * 3, R * 6, R * 6); c1.restore();
  c1.save(); c1.translate(ex, ey); c1.rotate(0.15);
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i / 6 * TAU, l = a - Math.PI / 6, r2 = a + Math.PI / 6, ri = R * 0.48; for (const [ang, f] of [[l, 0.25], [r2, -0.35]] as [number, number][]) { c1.fillStyle = tom(A.rubra, f + Math.cos(a + 2.3) * 0.2); c1.beginPath(); c1.moveTo(0, 0); c1.lineTo(Math.cos(a) * R, Math.sin(a) * R); c1.lineTo(Math.cos(ang) * ri, Math.sin(ang) * ri); c1.closePath(); c1.fill(); } }
  c1.strokeStyle = '#e9bd62'; c1.lineWidth = 1.4; c1.beginPath(); for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i * Math.PI / 6, r = i % 2 ? R * 0.48 : R; c1.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c1.closePath(); c1.stroke();
  const gc = c1.createRadialGradient(0, 0, 0, 0, 0, R * 0.44); gc.addColorStop(0, '#ffe0c0'); gc.addColorStop(1, '#a01030'); c1.fillStyle = gc; c1.beginPath(); c1.arc(0, 0, R * 0.42, 0, TAU); c1.fill();
  for (const s of [-1, 1]) { c1.fillStyle = '#fff6f0'; c1.beginPath(); c1.ellipse(s * R * 0.16, -R * 0.06, R * 0.08, R * 0.11, 0, 0, TAU); c1.fill(); c1.fillStyle = '#2a0610'; c1.beginPath(); c1.arc(s * R * 0.16 - R * 0.03, -R * 0.04, R * 0.045, 0, TAU); c1.fill(); }
  c1.restore();
  pinheiros(c2, 0, w, h * 0.98, 34, 31, '#02030a', 22);
  // título em letreiro cromado com brilho ciano
  const tx = w * 0.46, ty = h * 0.19, tam = h * 0.19;
  c2.save(); c2.font = `800 ${tam}px Orbitron, sans-serif`; c2.textAlign = 'center'; c2.textBaseline = 'middle';
  c2.shadowColor = A.ciano; c2.shadowBlur = tam * 0.5; c2.fillStyle = alfa(A.ciano, 0.5); c2.fillText(d.nome.toUpperCase(), tx, ty); c2.shadowBlur = 0;
  c2.lineJoin = 'round'; c2.lineWidth = tam * 0.14; c2.strokeStyle = '#0a0c22'; c2.strokeText(d.nome.toUpperCase(), tx, ty + tam * 0.05);
  const g = c2.createLinearGradient(0, ty - tam / 2, 0, ty + tam / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#c9e9ff'); g.addColorStop(0.5, '#5a6aa0'); g.addColorStop(0.62, '#e8f6ff'); g.addColorStop(1, '#7df9ff');
  c2.fillStyle = g; c2.fillText(d.nome.toUpperCase(), tx, ty); c2.lineWidth = 0.8; c2.strokeStyle = alfa('#ffffff', 0.8); c2.strokeText(d.nome.toUpperCase(), tx, ty);
  c2.font = `700 ${h * 0.042}px Orbitron, sans-serif`; c2.fillStyle = '#c8b8ff'; c2.fillText('M Á Q U I N A   0 1', tx, ty + tam * 0.7);
  c2.restore();
}
