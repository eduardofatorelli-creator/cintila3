// R05 · Sprites pré-renderizados: cada objeto com material (bumper, poste, inserto, saucer, luz) é pintado uma vez,
// com gradientes complexos, reflexo e sombra de contato, e depois só copiado por quadro. Cache por chave e resolução.
import { alfa, tom } from '../pincel';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const cache = new Map<string, Spr>();
export interface Spr { c: HTMLCanvasElement; ox: number; oy: number; w: number; h: number }
let RES = 1;
/** resolução dos sprites (dpr do quadro); muda a chave do cache */
/** resolução atual do quadro (a mesma dos sprites) */
export const resAtual = () => RES;
export function resolucao(r: number) { if (r !== RES) { RES = r; cache.clear(); } }
const q = (v: number) => Math.round(v * 4) / 4;

/** cria (ou reaproveita) um sprite de w×h px com origem (ox, oy) */
export function sprite(chave: string, w: number, h: number, ox: number, oy: number, pinta: (c: Ctx) => void): Spr {
  const k = chave + '@' + RES; let s = cache.get(k); if (s) return s;
  const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w * RES)); cv.height = Math.max(1, Math.ceil(h * RES));
  const c = cv.getContext('2d')!; c.scale(RES, RES); c.translate(ox, oy); pinta(c);
  s = { c: cv, ox, oy, w, h }; if (cache.size > 900) cache.clear(); cache.set(k, s); return s;
}
export function poe(c: Ctx, s: Spr, x: number, y: number, a = 1) { if (a <= 0.01) return; if (a < 1) c.globalAlpha = a; c.drawImage(s.c, x - s.ox, y - s.oy, s.w, s.h); if (a < 1) c.globalAlpha = 1; }

const lin = (c: Ctx, x0: number, y0: number, x1: number, y1: number, st: [number, string][]) => { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, k] of st) g.addColorStop(o, k); return g; };
const rad = (c: Ctx, x: number, y: number, r0: number, r1: number, st: [number, string][], fx = x, fy = y) => { const g = c.createRadialGradient(fx, fy, r0, x, y, r1); for (const [o, k] of st) g.addColorStop(o, k); return g; };
const elipse = (c: Ctx, x: number, y: number, rx: number, ry: number) => { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); };
/** cromo horizontal: escuro nas bordas, reflexo de céu e de chão */
export const cromo = (c: Ctx, x0: number, x1: number, tinta = '#c9d2f2') => lin(c, x0, 0, x1, 0, [[0, '#1b1e2c'], [0.12, '#5c6584'], [0.3, '#f4f7ff'], [0.42, tinta], [0.6, '#3a405a'], [0.78, '#aab3d2'], [1, '#161925']]);
const SQ = 0.8; // achatamento das elipses (câmera inclinada)

/** sombra de contato macia */
export function sombra(c: Ctx, rx: number, ry: number, a = 0.6) { c.fillStyle = rad(c, 0, 0, 0, rx, [[0, `rgba(0,0,0,${a})`], [0.6, `rgba(0,0,0,${a * 0.5})`], [1, 'rgba(0,0,0,0)']]); c.save(); c.scale(1, ry / rx); c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.restore(); c.fill(); }

/** pop bumper: base cromada com parafusos, corpo de plástico fumê iluminado por dentro, saia de metal, tampa translúcida com decalque */
export function bumper(R: number, Hz: number, cor: { corpo: string; tampa: string; luz: string; decal: string; forma?: string; base?: string }, aceso: boolean): Spr {
  R = q(R); Hz = q(Hz); const W2 = R * 3.4, ox = W2 / 2, oy = Hz + R * 1.1;
  return sprite(`bp|${R}|${Hz}|${cor.corpo}|${cor.tampa}|${cor.luz}|${cor.forma || 'estrela'}|${cor.decal}|${aceso}`, W2, oy + R * 1.5, ox, oy, c => {
    c.save(); c.translate(R * 0.12, R * 0.2); sombra(c, R * 1.6, R * 0.95, 0.7); c.restore();
    // base de metal
    c.fillStyle = cromo(c, -R * 1.3, R * 1.3); elipse(c, 0, 0, R * 1.3, R * 1.3 * SQ); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = Math.max(0.6, R * 0.05); c.stroke();
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; c.fillStyle = '#20232f'; elipse(c, Math.cos(a) * R * 1.12, Math.sin(a) * R * 1.12 * SQ, R * 0.07, R * 0.06); c.fill(); }
    const yb = -Hz * 0.12, yt = -Hz * 0.74, yc = -Hz;
    // corpo de plástico fumê (luz por dentro quando aceso)
    c.beginPath(); c.ellipse(0, yb, R, R * SQ, 0, 0, Math.PI); c.lineTo(-R, yt); c.ellipse(0, yt, R, R * SQ, 0, Math.PI, 0, true); c.closePath();
    c.fillStyle = lin(c, -R, 0, R, 0, aceso ? [[0, tom(cor.luz, -0.55)], [0.35, cor.luz], [0.5, '#ffffff'], [0.65, cor.luz], [1, tom(cor.luz, -0.6)]] : [[0, '#0b0c18'], [0.3, tom(cor.corpo, -0.35)], [0.45, tom(cor.corpo, 0.1)], [0.7, tom(cor.corpo, -0.45)], [1, '#07080f']]); c.fill();
    // saia de metal
    c.beginPath(); c.ellipse(0, yt + Hz * 0.12, R * 1.06, R * 1.06 * SQ, 0, 0, Math.PI); c.lineTo(-R * 1.06, yt); c.ellipse(0, yt, R * 1.06, R * 1.06 * SQ, 0, Math.PI, 0, true); c.closePath(); c.fillStyle = cromo(c, -R * 1.06, R * 1.06); c.fill();
    // tampa translúcida: aba, cúpula, decalque, brilho de borda
    c.fillStyle = lin(c, -R, 0, R, 0, [[0, tom(cor.tampa, -0.5)], [0.3, cor.tampa], [0.5, tom(cor.tampa, 0.45)], [1, tom(cor.tampa, -0.55)]]);
    c.beginPath(); c.ellipse(0, yt, R * 1.12, R * 1.12 * SQ, 0, 0, Math.PI); c.lineTo(-R * 1.12, yc); c.ellipse(0, yc, R * 1.12, R * 1.12 * SQ, 0, Math.PI, 0, true); c.closePath(); c.fill();
    c.fillStyle = rad(c, 0, yc, R * 0.05, R * 1.12, [[0, aceso ? '#ffffff' : tom(cor.tampa, 0.55)], [0.55, aceso ? tom(cor.tampa, 0.3) : cor.tampa], [1, tom(cor.tampa, -0.4)]], -R * 0.3, yc - R * 0.35);
    elipse(c, 0, yc, R * 1.12, R * 1.12 * SQ); c.fill();
    // decalque da máquina (estrela, engrenagem, gota, chama…)
    c.save(); c.translate(0, yc); c.scale(1, SQ); c.fillStyle = aceso ? '#ffffff' : cor.decal; c.globalAlpha = 0.9; decal(c, cor.forma || 'estrela', R * 0.62); c.fill();
    c.globalAlpha = 1; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = Math.max(0.6, R * 0.06); c.beginPath(); c.arc(0, 0, R * 1.04, Math.PI * 1.1, Math.PI * 1.75); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(0, 0, R * 1.08, 0.2, Math.PI - 0.2); c.stroke(); c.restore();
    c.fillStyle = 'rgba(255,255,255,0.7)'; elipse(c, -R * 0.42, yc - R * 0.42, R * 0.22, R * 0.11); c.fill();
  });
}

/** poste de borracha: pino cromado com anel de borracha branca */
export function poste(R: number, Hz: number, borracha = '#f2f4ff', topo = '#dfe6ff'): Spr {
  R = q(R); Hz = q(Hz); const ox = R * 2, oy = Hz + R * 1.5;
  return sprite(`po|${R}|${Hz}|${borracha}|${topo}`, R * 4, oy + R * 2, ox, oy, c => {
    c.save(); c.translate(R * 0.2, R * 0.3); sombra(c, R * 1.7, R, 0.6); c.restore();
    c.beginPath(); c.ellipse(0, 0, R, R * SQ, 0, 0, Math.PI); c.lineTo(-R, -Hz * 0.75); c.ellipse(0, -Hz * 0.75, R, R * SQ, 0, Math.PI, 0, true); c.closePath();
    c.fillStyle = lin(c, -R, 0, R, 0, [[0, tom(borracha, -0.6)], [0.35, borracha], [0.55, '#ffffff'], [1, tom(borracha, -0.55)]]); c.fill();
    const r2 = R * 0.6; c.beginPath(); c.ellipse(0, -Hz * 0.75, r2, r2 * SQ, 0, 0, Math.PI); c.lineTo(-r2, -Hz); c.ellipse(0, -Hz, r2, r2 * SQ, 0, Math.PI, 0, true); c.closePath(); c.fillStyle = cromo(c, -r2, r2); c.fill();
    c.fillStyle = rad(c, 0, -Hz, 0, r2, [[0, '#ffffff'], [0.6, topo], [1, '#5a6280']], -r2 * 0.3, -Hz - r2 * 0.3); elipse(c, 0, -Hz, r2, r2 * SQ); c.fill();
  });
}

/** inserto embutido: aro escuro, lente de vidro facetada; aceso tem núcleo quente e halo */
export function inserto(nome: string, forma: (c: Ctx, R: number) => void, cor: string, R: number, aceso: boolean, halo = true): Spr {
  R = q(R); const m = R * (aceso && halo ? 3.2 : 1.6);
  return sprite(`in|${nome}|${cor}|${R}|${aceso}|${halo}`, m * 2, m * 2, m, m, c => {
    c.scale(1, 0.86);
    if (aceso && halo) { c.fillStyle = rad(c, 0, 0, R * 0.4, m, [[0, alfa(cor, 0.55)], [0.4, alfa(cor, 0.18)], [1, alfa(cor, 0)]]); c.fillRect(-m, -m * 1.2, m * 2, m * 2.4); }
    c.fillStyle = '#020309'; forma(c, R * 1.22); c.fill(); c.strokeStyle = 'rgba(160,170,210,0.35)'; c.lineWidth = Math.max(0.5, R * 0.08); c.stroke();
    c.fillStyle = aceso ? rad(c, 0, 0, 0, R * 1.1, [[0, '#ffffff'], [0.35, tom(cor, 0.5)], [0.8, cor], [1, tom(cor, -0.3)]]) : rad(c, 0, 0, 0, R * 1.1, [[0, alfa(tom(cor, -0.2), 0.55)], [1, alfa(tom(cor, -0.65), 0.75)]]);
    forma(c, R); c.fill();
    // facetas e reflexo do vidro
    c.save(); forma(c, R); c.clip(); c.strokeStyle = aceso ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'; c.lineWidth = Math.max(0.4, R * 0.05);
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.moveTo(0, 0); c.lineTo(Math.cos(a) * R * 1.3, Math.sin(a) * R * 1.3); } c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.28)'; c.beginPath(); c.ellipse(-R * 0.3, -R * 0.45, R * 0.6, R * 0.22, -0.4, 0, TAU); c.fill(); c.restore();
  });
}

/** saucer (buraco com aro cromado e kicker) */
export function saucer(R: number, cor: string): Spr {
  R = q(R); const m = R * 2.2;
  return sprite(`sa|${R}|${cor}`, m * 2, m * 2, m, m, c => {
    c.scale(1, SQ);
    c.fillStyle = cromo(c, -R * 1.55, R * 1.55); c.beginPath(); c.arc(0, 0, R * 1.55, 0, TAU); c.fill();
    c.fillStyle = rad(c, 0, R * 0.2, 0, R * 1.2, [[0, '#000000'], [0.7, '#05060c'], [1, '#2a2f45']]); c.beginPath(); c.arc(0, 0, R * 1.2, 0, TAU); c.fill();
    c.strokeStyle = alfa(cor, 0.8); c.lineWidth = Math.max(0.8, R * 0.12); c.beginPath(); c.arc(0, 0, R * 1.36, 0, TAU); c.stroke();
    c.fillStyle = '#9aa3c0'; c.fillRect(-R * 0.25, R * 0.55, R * 0.5, R * 0.35);
  });
}

/** rótulo de inserto em sprite (texto desenhado uma vez por texto, tamanho e estado) */
export function rotulo(txt: string, px: number, aceso: boolean): Spr {
  px = Math.round(px * 2) / 2; const w = txt.length * px * 0.9 + 4;
  return sprite(`rt|${txt}|${px}|${aceso}`, w, px * 1.6, w / 2, 0, c => { c.font = `700 ${px}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = aceso ? '#ffffff' : 'rgba(220,226,255,0.5)'; c.fillText(txt, 0, 0); });
}

/** poça de luz macia (somada com 'lighter') */
export function luzMacia(cor: string, R: number): Spr {
  R = Math.max(4, Math.round(R / 4) * 4);
  return sprite(`lz|${cor}|${R}`, R * 2, R * 2, R, R, c => { c.fillStyle = rad(c, 0, 0, 0, R, [[0, alfa(cor, 0.9)], [0.25, alfa(cor, 0.45)], [0.6, alfa(cor, 0.12)], [1, alfa(cor, 0)]]); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill(); });
}

/** contorno de decalque em raio R, centrado (preencher depois) */
export function decal(c: Ctx, f: string, R: number) {
  c.beginPath();
  const poli = (n: number, r0: number, r1: number, rot = -Math.PI / 2) => { for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r1 : r0; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); };
  switch (f) {
    case 'circulo': c.arc(0, 0, R * 0.8, 0, TAU); c.moveTo(R * 0.4, 0); c.arc(0, 0, R * 0.4, 0, TAU, true); break;
    case 'diamante': c.moveTo(0, -R); c.lineTo(R * 0.7, 0); c.lineTo(0, R); c.lineTo(-R * 0.7, 0); c.closePath(); break;
    case 'engrenagem': poli(10, R, R * 0.74, 0); c.moveTo(R * 0.32, 0); c.arc(0, 0, R * 0.32, 0, TAU, true); break;
    case 'gota': c.moveTo(0, -R); c.quadraticCurveTo(R * 0.85, R * 0.1, 0, R * 0.8); c.quadraticCurveTo(-R * 0.85, R * 0.1, 0, -R); break;
    case 'chama': c.moveTo(0, -R); c.quadraticCurveTo(R * 0.9, -R * 0.1, R * 0.5, R * 0.6); c.quadraticCurveTo(0, R * 1.0, -R * 0.5, R * 0.6); c.quadraticCurveTo(-R * 0.9, -R * 0.1, 0, -R); break;
    case 'floco': for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.moveTo(Math.cos(a) * R * 0.12, Math.sin(a) * R * 0.12); c.lineTo(Math.cos(a - 0.12) * R, Math.sin(a - 0.12) * R); c.lineTo(Math.cos(a + 0.12) * R, Math.sin(a + 0.12) * R); c.closePath(); } break;
    case 'olho': c.ellipse(0, 0, R, R * 0.55, 0, 0, TAU); c.moveTo(R * 0.3, 0); c.arc(0, 0, R * 0.3, 0, TAU, true); break;
    case 'raio': c.moveTo(R * 0.2, -R); c.lineTo(-R * 0.5, R * 0.1); c.lineTo(-R * 0.05, R * 0.1); c.lineTo(-R * 0.25, R); c.lineTo(R * 0.55, -R * 0.15); c.lineTo(R * 0.08, -R * 0.15); c.closePath(); break;
    case 'folha': c.moveTo(0, -R); c.quadraticCurveTo(R * 0.85, 0, 0, R); c.quadraticCurveTo(-R * 0.85, 0, 0, -R); break;
    case 'nota': c.ellipse(-R * 0.25, R * 0.45, R * 0.38, R * 0.28, -0.4, 0, TAU); c.rect(R * 0.05, -R * 0.9, R * 0.16, R * 1.35); c.rect(R * 0.05, -R * 0.9, R * 0.6, R * 0.2); break;
    case 'coroa': c.moveTo(-R, R * 0.6); c.lineTo(-R, -R * 0.3); c.lineTo(-R * 0.5, R * 0.1); c.lineTo(0, -R * 0.8); c.lineTo(R * 0.5, R * 0.1); c.lineTo(R, -R * 0.3); c.lineTo(R, R * 0.6); c.closePath(); break;
    case 'caveira': c.arc(0, -R * 0.15, R * 0.75, Math.PI * 0.8, Math.PI * 2.2); c.lineTo(R * 0.4, R * 0.85); c.lineTo(-R * 0.4, R * 0.85); c.closePath(); c.moveTo(-R * 0.08, -R * 0.1); c.arc(-R * 0.3, -R * 0.1, R * 0.22, 0, TAU, true); c.moveTo(R * 0.52, -R * 0.1); c.arc(R * 0.3, -R * 0.1, R * 0.22, 0, TAU, true); break;
    case 'hex': poli(3, R, R, 0); break;
    case 'lua': c.arc(0, 0, R * 0.85, 0.6, TAU - 0.6 + 0.0001); c.arc(R * 0.35, 0, R * 0.62, TAU - 0.9, 0.9, true); c.closePath(); break;
    case 'onda': for (let k = 0; k < 2; k++) { const y = -R * 0.3 + k * R * 0.6; c.moveTo(-R, y); for (let x = -R; x <= R; x += R / 6) c.lineTo(x, y + Math.sin(x / R * 6) * R * 0.18); for (let x = R; x >= -R; x -= R / 6) c.lineTo(x, y + R * 0.2 + Math.sin(x / R * 6) * R * 0.18); c.closePath(); } break;
    case 'triangulo': c.moveTo(0, -R); c.lineTo(R * 0.9, R * 0.7); c.lineTo(-R * 0.9, R * 0.7); c.closePath(); break;
    case 'espiral': for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU * 2, r = R * (0.15 + i / 40 * 0.85); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } for (let i = 40; i >= 0; i--) { const a = i / 40 * TAU * 2, r = R * (0.05 + i / 40 * 0.6); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); break;
    case 'flor': for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.moveTo(0, 0); c.ellipse(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, R * 0.48, R * 0.22, a, 0, TAU); } break;
    default: poli(5, R, R * 0.42);
  }
}
