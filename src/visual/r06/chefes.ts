// R06 · Chefes com presença: pedestal, corpo por forma (9 formas), material e acessório da máquina, olhos que seguem a bola,
// expressão no golpe (dor real), escudo quando protegido, fases sinalizadas pelas luzes de vida da própria peça.
// Corpo em sprite (cache); olhos, halo e acessórios animados ao vivo. Movimento e vida são os da peça real.
import type { Pintor } from '../../render/playfield';
import { alfa, tom } from '../pincel';
import { bumper, luzMacia, poe, sprite } from '../r05/sprites';
import type { MatChefe, PalR06 } from './paleta';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const LUZ = -Math.PI * 0.75;

/** cor base e brilho de cada material */
const MAT: Record<MatChefe, { base: string; aro: string; brilho: number }> = {
  rubi: { base: '#ff3355', aro: '#e9bd62', brilho: 0.8 }, ouro: { base: '#e8b440', aro: '#fff0b0', brilho: 0.7 }, prata: { base: '#c8d0e8', aro: '#ffffff', brilho: 0.8 },
  pedra: { base: '#7a7468', aro: '#bdb5a2', brilho: 0.35 }, madeira: { base: '#8a5530', aro: '#d8b080', brilho: 0.4 }, cristal: { base: '#a8e8ff', aro: '#ffffff', brilho: 0.9 },
  neon: { base: '#2a1a5a', aro: '#21e6ff', brilho: 0.6 }, osso: { base: '#d9d3c2', aro: '#8a8270', brilho: 0.45 }, jade: { base: '#3aa874', aro: '#e0c070', brilho: 0.65 },
  bronze: { base: '#b07a3a', aro: '#ffd8a0', brilho: 0.6 }, obsidiana: { base: '#30364d', aro: '#9aa6d0', brilho: 0.7 }, gelo: { base: '#bfe9ff', aro: '#ffffff', brilho: 0.9 },
  lava: { base: '#ff5a1a', aro: '#ffe08a', brilho: 0.7 }, esmalte: { base: '#ff5ea8', aro: '#ffe45c', brilho: 0.7 },
};

/** sombreado facetado: cor da face conforme o ângulo da luz */
const face = (cor: string, a: number, f = 0.75) => tom(cor, -0.5 + (0.5 + 0.5 * Math.cos(a - LUZ)) * f);
function aroOuro(c: Ctx, R: number, cor: string) { const g = c.createLinearGradient(-R, -R, R, R); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, cor); g.addColorStop(0.6, tom(cor, -0.55)); g.addColorStop(1, tom(cor, 0.3)); return g; }

type Corpo = (c: Ctx, R: number, cor: string, aro: string, n: number) => void;
const CORPOS: Record<string, Corpo> = {
  estrela(c, R, cor, aro, n) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i / n * TAU, ri = R * 0.48, l = a - Math.PI / n, r = a + Math.PI / n;
      for (const [b, d] of [[l, -0.35], [r, 0.35]] as [number, number][]) { c.fillStyle = face(cor, a + d); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R, Math.sin(a) * R); c.lineTo(Math.cos(b) * ri, Math.sin(b) * ri); c.closePath(); c.fill(); }
    }
    c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? R * 0.48 : R; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = Math.max(1, R * 0.07); c.lineJoin = 'round'; c.stroke();
  },
  globo(c, R, cor, aro) {
    // globo de espelhos: ladrilhos com brilho variável
    const g = c.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R); g.addColorStop(0, tom(cor, 0.5)); g.addColorStop(0.7, cor); g.addColorStop(1, tom(cor, -0.6)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip();
    for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) { const x = i * R / 6, y = j * R / 6, d = Math.hypot(x, y) / R; if (d > 1) continue; const k = Math.sin(i * 1.7 + j * 2.3); c.fillStyle = k > 0.6 ? 'rgba(255,255,255,0.75)' : k > 0 ? alfa(tom(cor, 0.4), 0.45) : 'rgba(0,0,0,0.25)'; c.fillRect(x - R / 13 * (1 - d * 0.4), y - R / 13, R / 7 * (1 - d * 0.4), R / 7.5); }
    c.restore(); c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = Math.max(1, R * 0.05); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke();
  },
  engrenagem(c, R, cor, aro, n) {
    for (let i = 0; i < n; i++) { const a = i / n * TAU; c.save(); c.rotate(a); c.fillStyle = face(cor, a, 0.7); c.beginPath(); c.moveTo(-R * 0.14, -R * 0.82); c.lineTo(-R * 0.1, -R * 1.08); c.lineTo(R * 0.1, -R * 1.08); c.lineTo(R * 0.14, -R * 0.82); c.closePath(); c.fill(); c.restore(); }
    const g = c.createRadialGradient(-R * 0.25, -R * 0.3, R * 0.1, 0, 0, R * 0.86); g.addColorStop(0, tom(cor, 0.5)); g.addColorStop(0.6, cor); g.addColorStop(1, tom(cor, -0.55)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 0.86, 0, TAU); c.fill();
    c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = Math.max(1, R * 0.05); c.stroke(); c.fillStyle = tom(cor, -0.5); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; c.beginPath(); c.arc(Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6, R * 0.1, 0, TAU); c.fill(); }
  },
  tentaculos(c, R, cor, aro) {
    const g = c.createRadialGradient(-R * 0.25, -R * 0.35, R * 0.1, 0, 0, R * 0.7); g.addColorStop(0, tom(cor, 0.5)); g.addColorStop(0.6, cor); g.addColorStop(1, tom(cor, -0.6)); c.fillStyle = g; c.beginPath(); c.ellipse(0, -R * 0.05, R * 0.7, R * 0.62, 0, 0, TAU); c.fill();
    c.fillStyle = alfa(tom(cor, 0.6), 0.5); for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.5; c.beginPath(); c.arc(Math.cos(a) * R * 0.45, Math.sin(a) * R * 0.4 - R * 0.05, R * 0.05, 0, TAU); c.fill(); }
    c.strokeStyle = alfa(aro, 0.6); c.lineWidth = Math.max(0.8, R * 0.04); c.beginPath(); c.ellipse(0, -R * 0.05, R * 0.7, R * 0.62, 0, 0, TAU); c.stroke();
  },
  cristal(c, R, cor, aro, n) {
    n = Math.max(3, n); const pts = Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i / n * TAU; return [Math.cos(a) * R, Math.sin(a) * R * 1.05]; });
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], ang = Math.atan2((a[1] + b[1]) / 2, (a[0] + b[0]) / 2); c.fillStyle = alfa(face(cor, ang, 0.9), 0.92); c.beginPath(); c.moveTo(0, -R * 0.1); c.lineTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = Math.max(0.6, R * 0.03); c.beginPath(); for (const p of pts) { c.moveTo(0, -R * 0.1); c.lineTo(p[0], p[1]); } c.stroke();
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = Math.max(1, R * 0.05); c.stroke();
  },
  mascara(c, R, cor, aro, n) {
    // máscara de baile: rosto oval, testa ornamentada com n pontas, bochechas pintadas
    for (let i = 0; i < Math.min(9, n + 2); i++) { const k = Math.min(9, n + 2), a = -Math.PI / 2 + (i - (k - 1) / 2) * 0.32; c.fillStyle = face(aro, a, 0.8); c.beginPath(); c.moveTo(Math.cos(a - 0.12) * R * 0.6, Math.sin(a - 0.12) * R * 0.6); c.lineTo(Math.cos(a) * R * 1.15, Math.sin(a) * R * 1.15); c.lineTo(Math.cos(a + 0.12) * R * 0.6, Math.sin(a + 0.12) * R * 0.6); c.closePath(); c.fill(); }
    const g = c.createRadialGradient(-R * 0.25, -R * 0.3, R * 0.1, 0, 0, R * 0.9); g.addColorStop(0, tom(cor, 0.55)); g.addColorStop(0.6, cor); g.addColorStop(1, tom(cor, -0.5)); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, R * 0.78, R * 0.9, 0, 0, TAU); c.fill();
    c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = Math.max(1, R * 0.05); c.stroke();
    c.fillStyle = alfa('#ff4d6d', 0.35); for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.42, R * 0.22, R * 0.14, 0, TAU); c.fill(); }
  },
  olho(c, R, cor, aro, n) {
    for (let i = 0; i < n; i++) { const a = i / n * TAU; c.fillStyle = face(aro, a, 0.7); c.beginPath(); c.moveTo(Math.cos(a - 0.15) * R * 0.85, Math.sin(a - 0.15) * R * 0.85); c.lineTo(Math.cos(a) * R * 1.18, Math.sin(a) * R * 1.18); c.lineTo(Math.cos(a + 0.15) * R * 0.85, Math.sin(a + 0.15) * R * 0.85); c.closePath(); c.fill(); }
    const g = c.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R * 0.9); g.addColorStop(0, '#ffffff'); g.addColorStop(0.8, '#dfe4f2'); g.addColorStop(1, '#7a8098'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 0.88, 0, TAU); c.fill();
    c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = Math.max(1, R * 0.06); c.stroke(); void cor;
  },
  serpente(c, R, cor, aro) {
    // espiral de escamas
    for (let i = 60; i >= 0; i--) { const a = i / 60 * TAU * 1.8, r = R * (0.2 + i / 60 * 0.8), w = R * (0.12 + i / 60 * 0.16); c.fillStyle = i % 2 ? face(cor, a, 0.7) : tom(face(cor, a, 0.7), -0.15); c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r * 0.9, w, 0, TAU); c.fill(); }
    c.fillStyle = alfa(aro, 0.5); for (let i = 0; i < 60; i += 4) { const a = i / 60 * TAU * 1.8, r = R * (0.2 + i / 60 * 0.8); c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r * 0.9 - R * 0.04, R * 0.035, 0, TAU); c.fill(); }
  },
  bloco(c, R, cor, aro, n) {
    // monólito chanfrado com rebites
    const w = R * 0.95, h = R * 1.05, ch = R * 0.22;
    c.fillStyle = tom(cor, -0.45); c.beginPath(); c.moveTo(-w, -h + ch); c.lineTo(-w + ch, -h); c.lineTo(w - ch, -h); c.lineTo(w, -h + ch); c.lineTo(w, h - ch); c.lineTo(w - ch, h); c.lineTo(-w + ch, h); c.lineTo(-w, h - ch); c.closePath(); c.fill();
    const g = c.createLinearGradient(-w, -h, w, h); g.addColorStop(0, tom(cor, 0.45)); g.addColorStop(0.5, cor); g.addColorStop(1, tom(cor, -0.35)); c.fillStyle = g; c.fillRect(-w + ch, -h + ch, (w - ch) * 2, (h - ch) * 2);
    c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = Math.max(1, R * 0.05); c.strokeRect(-w + ch, -h + ch, (w - ch) * 2, (h - ch) * 2);
    c.fillStyle = aro; for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); c.arc(x * (w - ch * 1.5), y * (h - ch * 1.5), R * 0.05, 0, TAU); c.fill(); }
    c.fillStyle = alfa(aro, 0.5); for (let i = 0; i < Math.min(6, n); i++) c.fillRect(-w * 0.6 + i * w * 1.2 / Math.max(1, n - 1) - R * 0.04, h * 0.45, R * 0.08, R * 0.22);
  },
};

function corpoSpr(tipo: string, R: number, cor: string, aro: string, n: number, branco: boolean) {
  R = Math.round(R * 4) / 4; const m = R * 1.6;
  return sprite(`ch|${tipo}|${R}|${cor}|${aro}|${n}|${branco}`, m * 2, m * 2, m, m, c => {
    (CORPOS[tipo] || CORPOS.estrela)(c, R, branco ? '#ffffff' : cor, aro, n);
    if (tipo !== 'olho' && tipo !== 'serpente') {
      // núcleo/rosto incandescente
      const gc = c.createRadialGradient(-R * 0.08, -R * 0.12, R * 0.02, 0, 0, R * 0.44); gc.addColorStop(0, branco ? '#ffffff' : tom(cor, 0.75)); gc.addColorStop(0.5, branco ? '#ffffff' : tom(cor, 0.2)); gc.addColorStop(1, branco ? '#f0f0f0' : tom(cor, -0.5));
      if (tipo === 'estrela') { c.fillStyle = gc; c.beginPath(); c.arc(0, 0, R * 0.44, 0, TAU); c.fill(); c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = Math.max(0.8, R * 0.045); c.stroke(); }
    }
  });
}

/** desenha o chefe da máquina sobre a peça real */
export function pChefe(g: Pintor, ch: any, P: PalR06) {
  if (ch.c.off) return;
  const c = g.c, t = g.t, f = ch.forma || { tipo: 'estrela', pontas: 6, olhos: 2 }, M = MAT[P.chefe.material], cor = f.cor && P.chefe.material === 'rubi' ? M.base : (f.cor || M.base);
  const corB = P.chefe.material === 'pedra' || P.chefe.material === 'madeira' || P.chefe.material === 'osso' || P.chefe.material === 'bronze' || P.chefe.material === 'ouro' || P.chefe.material === 'gelo' || P.chefe.material === 'cristal' || P.chefe.material === 'prata' ? M.base : cor;
  const [X0, Y0, K] = g.p(ch.x, ch.y, 0);
  poe(c, bumper(20 * K, 12 * 1.35 * K, { ...P.chefe.pedestal, decal: P.chefe.pedestal.tampa, forma: 'circulo' }, ch.dor > 0.3), X0, Y0);
  const bob = Math.sin(t * 2.2) * 1.6, [X, Y, KK] = g.p(ch.x, ch.y, 26 + bob), R = 22 * KK * 1.18, luz = P.chefe.pedestal.luz;
  // modo econômico: chefe inteiro num sprite (corpo, olhos, acessório) + clarão do golpe real por cima
  if (g.semBrilho) {
    const Rq = Math.round(R * 2) / 2, n0 = f.pontas || 6, sp = sprite(`ce|${P.luz}|${P.chefe.material}|${P.chefe.acessorio}|${f.tipo}|${n0}|${Rq}`, Rq * 4.6, Rq * 4.6, Rq * 2.3, Rq * 2.3, cc => retratoChefe(cc, 0, 0, Rq, P, f));
    const pul = 1 + ch.dor * 0.1; c.save(); c.translate(X, Y); c.scale(pul, pul); poe(c, sp, 0, 0);
    if (ch.dor > 0.05) poe(c, corpoSpr(f.tipo, R, cor, M.aro, n0, true), 0, 0, ch.dor);
    if (ch.protegido) { c.strokeStyle = alfa('#9fe8ff', 0.7); c.lineWidth = Math.max(1, R * 0.06); c.beginPath(); c.arc(0, 0, R * 1.45, 0, TAU); c.stroke(); }
    c.restore(); return;
  }
  if (!g.semBrilho) {
    c.save(); c.translate(X, Y); c.globalCompositeOperation = 'lighter'; poe(c, luzMacia(luz, R * 2.4), 0, 0, 0.3 + ch.dor * 0.5);
    c.rotate(t * 0.4); c.strokeStyle = alfa(M.aro, 0.5); c.lineWidth = Math.max(0.8, KK * 0.9); c.beginPath();
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r0 = R * 1.12, r1 = R * (i % 2 ? 1.22 : 1.36); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); }
    c.stroke(); c.beginPath(); c.arc(0, 0, R * 1.12, 0, TAU); c.stroke(); c.restore();
  }
  const pul = 1 + Math.sin(t * 3) * 0.03 + ch.dor * 0.1, n = f.pontas || 6, rot = f.tipo === 'engrenagem' ? t * 0.8 : f.tipo === 'estrela' || f.tipo === 'cristal' ? Math.sin(t * 0.7) * 0.12 : 0;
  c.save(); c.translate(X, Y);
  acessorioAtras(c, P.chefe.acessorio, R, t, M.aro, luz);
  if (f.tipo === 'tentaculos') tentaculos(c, R, corB, n, t, ch.dor);
  c.save(); c.rotate(rot); c.scale(pul, pul);
  poe(c, corpoSpr(f.tipo, R, corB, M.aro, n, false), 0, 0); if (ch.dor > 0.05) poe(c, corpoSpr(f.tipo, R, corB, M.aro, n, true), 0, 0, ch.dor);
  c.restore(); c.scale(pul, pul);
  // olhos que seguem a bola e expressão
  const b = ch.C?.bolas?.[0], dx = b ? Math.max(-1, Math.min(1, (b.x - ch.x) / 120)) : 0, dy = b ? Math.max(-1, Math.min(1, (b.y - ch.y) / 160)) : 0;
  if (f.tipo === 'olho') {
    const ir = R * 0.42; c.fillStyle = luz; c.beginPath(); c.arc(dx * R * 0.25, dy * R * 0.2, ir, 0, TAU); c.fill(); c.fillStyle = '#05060f'; c.beginPath(); c.arc(dx * R * 0.3, dy * R * 0.24, ir * (ch.dor > 0.3 ? 0.25 : 0.5), 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(dx * R * 0.25 - ir * 0.35, dy * R * 0.2 - ir * 0.35, ir * 0.18, 0, TAU); c.fill();
    const fecha = ch.dor > 0.3 ? 0.55 : 0.05 + Math.max(0, Math.sin(t * 0.9) - 0.96) * 18; c.fillStyle = tom(M.aro, -0.4); c.beginPath(); c.ellipse(0, -R * 0.9, R * 0.92, R * 0.9 * fecha + 0.1, 0, 0, Math.PI); c.fill();
  } else {
    const o = Math.max(1, Math.min(3, f.olhos || 2)), ey = f.tipo === 'serpente' ? -R * 0.05 : -R * 0.08, sp = f.tipo === 'bloco' ? R * 0.36 : R * 0.2;
    const ox = f.tipo === 'serpente' ? R * 0.15 : 0;
    for (let i = 0; i < o; i++) {
      const ex = ox + (o === 1 ? 0 : (i - (o - 1) / 2) * sp * (o === 3 ? 1 : 1.7)); c.fillStyle = '#fff6f0'; c.beginPath(); c.ellipse(ex, ey, R * 0.1, ch.dor > 0.3 ? R * 0.035 : R * 0.13, 0, 0, TAU); c.fill();
      c.fillStyle = f.tipo === 'serpente' ? luz : '#1a0610'; c.beginPath(); c.ellipse(ex + dx * R * 0.04, ey + dy * R * 0.05, f.tipo === 'serpente' ? R * 0.025 : R * 0.05, R * 0.06, 0, 0, TAU); c.fill();
    }
    if (f.tipo !== 'serpente' && f.extra !== 'semBoca') { c.strokeStyle = tom(corB, -0.75); c.lineWidth = Math.max(0.8, R * 0.045); c.beginPath(); if (ch.dor > 0.2) c.arc(0, R * 0.3, R * 0.11, Math.PI * 1.1, Math.PI * 1.9); else c.arc(0, R * 0.12, R * 0.14, 0.35, Math.PI - 0.35); c.stroke(); }
  }
  acessorioFrente(c, P.chefe.acessorio, R, t, M.aro, luz);
  if (ch.protegido) { c.strokeStyle = alfa('#9fe8ff', 0.6 + Math.sin(t * 6) * 0.3); c.lineWidth = Math.max(1, R * 0.06); c.beginPath(); c.arc(0, 0, R * 1.45, 0, TAU); c.stroke(); c.globalAlpha = 0.12; c.fillStyle = '#9fe8ff'; c.fill(); c.globalAlpha = 1; }
  c.restore();
}

/** retrato estático do chefe (backglass, galeria, andar do chefão): corpo + olhos + acessório */
export function retratoChefe(c: Ctx, x: number, y: number, R: number, P: PalR06, f: { tipo: string; pontas: number; olhos: number; cor?: string }) {
  const M = MAT[P.chefe.material], cor = P.chefe.material === 'rubi' ? M.base : (['pedra', 'madeira', 'osso', 'bronze', 'ouro', 'gelo', 'cristal', 'prata'].includes(P.chefe.material) ? M.base : (f.cor || M.base)), luz = P.chefe.pedestal.luz;
  c.save(); c.translate(x, y); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, 0, 0, 0, 0, R * 2.6); g.addColorStop(0, alfa(luz, 0.5)); g.addColorStop(1, alfa(luz, 0)); c.fillStyle = g; c.fillRect(-R * 3, -R * 3, R * 6, R * 6); c.globalCompositeOperation = 'source-over';
  acessorioAtras(c, P.chefe.acessorio, R, 0.5, M.aro, luz);
  if (f.tipo === 'tentaculos') tentaculos(c, R, cor, f.pontas || 6, 0.5, 0);
  (CORPOS[f.tipo] || CORPOS.estrela)(c, R, cor, M.aro, f.pontas || 6);
  if (f.tipo === 'olho') { c.fillStyle = luz; c.beginPath(); c.arc(0, 0, R * 0.42, 0, TAU); c.fill(); c.fillStyle = '#05060f'; c.beginPath(); c.arc(0, 0, R * 0.2, 0, TAU); c.fill(); }
  else {
    if (f.tipo === 'estrela') { const gc = c.createRadialGradient(0, 0, 0, 0, 0, R * 0.44); gc.addColorStop(0, tom(cor, 0.75)); gc.addColorStop(1, tom(cor, -0.5)); c.fillStyle = gc; c.beginPath(); c.arc(0, 0, R * 0.42, 0, TAU); c.fill(); }
    const o = Math.max(1, Math.min(3, f.olhos || 2)); for (let i = 0; i < o; i++) { const ex = o === 1 ? 0 : (i - (o - 1) / 2) * R * 0.34; c.fillStyle = '#fff6f0'; c.beginPath(); c.ellipse(ex, -R * 0.08, R * 0.09, R * 0.12, 0, 0, TAU); c.fill(); c.fillStyle = '#1a0610'; c.beginPath(); c.arc(ex - R * 0.02, -R * 0.06, R * 0.045, 0, TAU); c.fill(); }
  }
  acessorioFrente(c, P.chefe.acessorio, R, 0.5, M.aro, luz);
  c.restore();
}

function tentaculos(c: Ctx, R: number, cor: string, n: number, t: number, dor: number) {
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 0.15 + i / Math.max(1, n - 1) * Math.PI * 0.7, L = R * (1.1 + 0.2 * Math.sin(i * 1.7)), w = Math.sin(t * 2 + i) * 0.35 + dor * 0.6;
    const x0 = Math.cos(a) * R * 0.45, y0 = Math.sin(a) * R * 0.4, x1 = Math.cos(a + w) * L, y1 = Math.sin(a + w) * L * 0.9, x2 = Math.cos(a - w * 0.5) * L * 1.35, y2 = Math.sin(a - w * 0.5) * L * 1.2;
    for (const [cc, l] of [[tom(cor, -0.55), R * 0.2], [cor, R * 0.14], [tom(cor, 0.4), R * 0.05]] as [string, number][]) { c.strokeStyle = cc; c.lineWidth = l; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke(); }
  }
}
function acessorioAtras(c: Ctx, a: string, R: number, t: number, aro: string, luz: string) {
  if (a === 'raios') { c.save(); c.rotate(t * 0.6); c.strokeStyle = alfa(luz, 0.6); c.lineWidth = R * 0.05; c.beginPath(); for (let i = 0; i < 8; i++) { const q = i / 8 * TAU; c.moveTo(Math.cos(q) * R * 1.05, Math.sin(q) * R * 1.05); c.lineTo(Math.cos(q + 0.1) * R * 1.3, Math.sin(q + 0.1) * R * 1.3); c.lineTo(Math.cos(q - 0.05) * R * 1.5, Math.sin(q - 0.05) * R * 1.5); } c.stroke(); c.restore(); }
  if (a === 'engrenagens') { for (const [x, s] of [[-1, 1], [1, -1]] as [number, number][]) { c.save(); c.translate(x * R * 1.05, -R * 0.55); c.rotate(t * s); c.fillStyle = aro; for (let i = 0; i < 8; i++) { c.rotate(TAU / 8); c.fillRect(-R * 0.05, -R * 0.36, R * 0.1, R * 0.12); } c.beginPath(); c.arc(0, 0, R * 0.27, 0, TAU); c.fill(); c.fillStyle = tom(aro, -0.5); c.beginPath(); c.arc(0, 0, R * 0.1, 0, TAU); c.fill(); c.restore(); } }
  if (a === 'plumas') { for (let i = 0; i < 7; i++) { const q = -Math.PI / 2 + (i - 3) * 0.25, cc = ['#ff3fa4', '#ffe14d', '#33e0a1', '#7aa2ff'][i % 4]; c.fillStyle = cc; c.beginPath(); c.ellipse(Math.cos(q) * R * 1.2, Math.sin(q) * R * 1.2, R * 0.12, R * 0.5, q + Math.PI / 2 + Math.sin(t * 2 + i) * 0.08, 0, TAU); c.fill(); } }
  if (a === 'folhas') { for (let i = 0; i < 6; i++) { const q = -Math.PI / 2 + (i - 2.5) * 0.45; c.fillStyle = i % 2 ? '#3aa874' : '#7be36a'; c.beginPath(); c.ellipse(Math.cos(q) * R * 1.05, Math.sin(q) * R * 1.05, R * 0.14, R * 0.36, q + Math.PI / 2 + Math.sin(t * 1.5 + i) * 0.1, 0, TAU); c.fill(); } }
  if (a === 'chamas') { for (let i = 0; i < 5; i++) { const x = (i - 2) * R * 0.35, h = R * (0.5 + 0.25 * Math.sin(t * 9 + i * 1.7)); c.fillStyle = alfa(i % 2 ? '#ffb02e' : luz, 0.85); c.beginPath(); c.moveTo(x - R * 0.16, -R * 0.75); c.quadraticCurveTo(x, -R * 0.75 - h * 1.3, x + R * 0.16, -R * 0.75); c.fill(); } }
}
function acessorioFrente(c: Ctx, a: string, R: number, t: number, aro: string, luz: string) {
  if (a === 'coroa') { c.fillStyle = aroOuro(c, R, aro); c.beginPath(); c.moveTo(-R * 0.5, -R * 0.82); c.lineTo(-R * 0.55, -R * 1.25); c.lineTo(-R * 0.25, -R * 1.02); c.lineTo(0, -R * 1.35); c.lineTo(R * 0.25, -R * 1.02); c.lineTo(R * 0.55, -R * 1.25); c.lineTo(R * 0.5, -R * 0.82); c.closePath(); c.fill(); c.fillStyle = luz; c.beginPath(); c.arc(0, -R * 1.05, R * 0.07, 0, TAU); c.fill(); }
  if (a === 'chifres') { for (const s of [-1, 1]) { c.fillStyle = aroOuro(c, R, aro); c.beginPath(); c.moveTo(s * R * 0.35, -R * 0.7); c.quadraticCurveTo(s * R * 1.0, -R * 1.0, s * R * 0.85, -R * 1.45); c.quadraticCurveTo(s * R * 0.7, -R * 1.0, s * R * 0.2, -R * 0.82); c.closePath(); c.fill(); } }
  if (a === 'antena') { for (const s of [-1, 1]) { c.strokeStyle = aro; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(s * R * 0.3, -R * 0.75); c.lineTo(s * R * 0.55, -R * 1.35); c.stroke(); c.fillStyle = Math.sin(t * 6 + s) > 0 ? luz : tom(luz, -0.5); c.beginPath(); c.arc(s * R * 0.55, -R * 1.38, R * 0.1, 0, TAU); c.fill(); } }
  if (a === 'cartola') { c.fillStyle = '#111018'; c.fillRect(-R * 0.42, -R * 1.5, R * 0.84, R * 0.62); c.fillRect(-R * 0.68, -R * 0.92, R * 1.36, R * 0.12); c.fillStyle = luz; c.fillRect(-R * 0.42, -R * 1.06, R * 0.84, R * 0.12); }
  if (a === 'gelo') { c.fillStyle = 'rgba(230,250,255,0.75)'; for (let i = 0; i < 5; i++) { const x = (i - 2) * R * 0.32, h = R * (0.35 + (i % 2) * 0.25); c.beginPath(); c.moveTo(x - R * 0.1, -R * 0.78); c.lineTo(x, -R * 0.78 - h); c.lineTo(x + R * 0.1, -R * 0.78); c.fill(); } }
  if (a === 'halo') { c.strokeStyle = aroOuro(c, R, aro); c.lineWidth = R * 0.05; c.beginPath(); c.ellipse(0, -R * 1.12, R * 0.45, R * 0.12, 0, 0, TAU); c.stroke(); }
  if (a === 'notas') { c.fillStyle = luz; c.font = `${R * 0.5}px serif`; c.textAlign = 'center'; for (let i = 0; i < 3; i++) { const q = t * 0.8 + i * 2.1; c.globalAlpha = 0.5 + 0.5 * Math.sin(q * 2); c.fillText('♪', Math.cos(q) * R * 1.25, Math.sin(q) * R * 0.9 - R * 0.6); } c.globalAlpha = 1; }
  if (a === 'olhos') { for (const [x, y] of [[-0.7, -0.75], [0.7, -0.75]]) { c.fillStyle = Math.sin(t * 3 + x) > 0.2 ? luz : tom(luz, -0.6); c.beginPath(); c.arc(x * R, y * R, R * 0.07, 0, TAU); c.fill(); } }
}
