// Pincel: a caixa de ferramentas de arte do Visual R04. Estende o Tema (que as máquinas já usam) com
// gradientes, névoas, silhuetas, texturas de material e ornamentos. Tudo é pintado uma vez, no cache do tablado.
import { Paleta, Tema } from '../render/tema';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
export type Stops = [number, string][];

let ruido: HTMLCanvasElement | null = null;
/** textura de grão 128×128, gerada uma vez por sessão (pintura metálica e papel) */
function grao(): HTMLCanvasElement {
  if (ruido) return ruido;
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d')!, img = c.createImageData(128, 128);
  let s = 12345; const r = () => ((s = (s * 16807) % 2147483647) & 0xff);
  for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0); ruido = cv; return cv;
}

/** mistura uma cor hex com alfa */
export function alfa(hex: string, a: number) {
  if (!hex.startsWith('#')) return hex;
  const h = hex.length === 4 ? hex.slice(1).split('').map(x => x + x).join('') : hex.slice(1, 7);
  const n = parseInt(h, 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
/** clareia (+) ou escurece (−) uma cor hex */
export function tom(hex: string, f: number) {
  if (!hex.startsWith('#')) return hex;
  const h = hex.length === 4 ? hex.slice(1).split('').map(x => x + x).join('') : hex.slice(1, 7);
  const n = parseInt(h, 16), ch = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)));
  return '#' + ch.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

export class Pincel extends Tema {
  constructor(c: Ctx, p: Paleta, w: number, h: number, camadas: Ctx[] = []) { super(c, p, w, h, camadas); }
  private com(a: number, f: () => void) { const c = this.c; c.save(); c.globalAlpha *= a; f(); c.restore(); }
  lin(x0: number, y0: number, x1: number, y1: number, st: Stops) { const g = this.c.createLinearGradient(x0, y0, x1, y1); for (const [o, k] of st) g.addColorStop(o, k); return g; }
  rad(x: number, y: number, r0: number, r1: number, st: Stops) { const g = this.c.createRadialGradient(x, y, r0, x, y, r1); for (const [o, k] of st) g.addColorStop(o, k); return g; }

  /** céu ou fundo vertical com várias paradas */
  ceu(st: Stops) { const c = this.c; c.fillStyle = this.lin(0, 0, 0, this.h, st); c.fillRect(0, 0, this.w, this.h); }
  /** névoa elíptica suave */
  nevoa(x: number, y: number, rx: number, ry: number, cor: string, a = 0.5, op: GlobalCompositeOperation = 'source-over') {
    const c = this.c; this.com(a, () => { c.globalCompositeOperation = op; c.translate(x, y); c.scale(1, ry / rx); c.fillStyle = this.rad(0, 0, 0, rx, [[0, cor], [1, alfa(cor.startsWith('#') ? cor : '#000000', 0)]]); c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.fill(); });
  }
  /** silhueta preenchida a partir de pontos (com curva suave opcional) */
  forma(pts: number[][], cor: string | CanvasGradient, a = 1, suave = false) {
    const c = this.c; this.com(a, () => { c.fillStyle = cor; c.beginPath(); this.traco(pts, suave); c.closePath(); c.fill(); });
  }
  private traco(pts: number[][], suave: boolean) {
    const c = this.c; if (pts.length < 2) return; c.moveTo(pts[0][0], pts[0][1]);
    if (!suave) { for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); return; }
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    const u = pts[pts.length - 1]; c.lineTo(u[0], u[1]);
  }
  /** linha suave com espessura */
  curva(pts: number[][], cor: string | CanvasGradient, l: number, a = 1, cap: CanvasLineCap = 'round') {
    const c = this.c; this.com(a, () => { c.strokeStyle = cor; c.lineWidth = l; c.lineCap = cap; c.lineJoin = 'round'; c.beginPath(); this.traco(pts, true); c.stroke(); });
  }
  /** cortina de aurora: traços verticais que esmaecem para baixo, seguindo uma onda */
  cortina(y: number, amp: number, alt: number, cor: string, a = 0.5, fase = 0, x0 = 0, x1 = this.w) {
    const c = this.c; this.com(a, () => {
      c.globalCompositeOperation = 'lighter';
      for (let x = x0; x <= x1; x += 3) {
        const yy = y + Math.sin(x * 0.018 + fase) * amp + Math.sin(x * 0.047 + fase * 2) * amp * 0.35, hh = alt * (0.6 + 0.4 * Math.sin(x * 0.03 + fase * 1.7));
        c.fillStyle = this.lin(0, yy, 0, yy + hh, [[0, alfa(cor, 0)], [0.15, alfa(cor, 0.9)], [1, alfa(cor, 0)]]); c.fillRect(x, yy, 3.2, hh);
      }
    });
  }
  /** cone de luz (holofote, raio de sol, feixe submarino) */
  feixe(x: number, y: number, ang: number, abre: number, comp: number, cor: string, a = 0.35) {
    const c = this.c; this.com(a, () => {
      c.globalCompositeOperation = 'lighter'; c.fillStyle = this.rad(x, y, 0, comp, [[0, cor], [1, alfa(cor, 0)]]);
      c.beginPath(); c.moveTo(x, y); c.arc(x, y, comp, ang - abre, ang + abre); c.closePath(); c.fill();
    });
  }
  /** brilho em cruz de quatro pontas */
  cintila(x: number, y: number, r: number, cor = '#ffffff', a = 1) {
    const c = this.c; this.com(a, () => {
      c.globalCompositeOperation = 'lighter'; c.fillStyle = cor;
      c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill();
      c.fillStyle = this.rad(x, y, 0, r * 0.7, [[0, alfa(cor, 0.8)], [1, alfa(cor, 0)]]); c.fillRect(x - r, y - r, r * 2, r * 2);
    });
  }
  /** grão de pintura sobre tudo (multiplica levemente) */
  grao(a = 0.06) { const c = this.c; this.com(a, () => { c.globalCompositeOperation = 'overlay'; c.fillStyle = c.createPattern(grao(), 'repeat')!; c.fillRect(0, 0, this.w, this.h); }); }
  /** escurece as bordas */
  vinheta(a = 0.6, x = this.w / 2, y = this.h * 0.45) { const c = this.c, r = Math.hypot(this.w, this.h) * 0.62; this.com(a, () => { c.fillStyle = this.rad(x, y, r * 0.35, r, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); c.fillRect(0, 0, this.w, this.h); }); }
  /** faixa calma na zona das palhetas: escurece o terço de baixo para a bola ler bem */
  calma(y0 = 560, a = 0.55) { const c = this.c; c.fillStyle = this.lin(0, y0, 0, this.h, [[0, 'rgba(2,3,10,0)'], [0.45, `rgba(2,3,10,${a * 0.7})`], [1, `rgba(2,3,10,${a})`]]); c.fillRect(0, y0, this.w, this.h - y0); }
  /** arco de texto (letreiros curvos de emblema) */
  textoArco(s: string, x: number, y: number, r: number, tam: number, cor: string, a = 1, ini = -Math.PI / 2, fonte = 'Orbitron') {
    const c = this.c; this.com(a, () => {
      c.font = `800 ${tam}px ${fonte}, sans-serif`; c.fillStyle = cor; c.textAlign = 'center'; c.textBaseline = 'middle';
      const larg = s.split('').map(ch => c.measureText(ch).width + tam * 0.12), tot = larg.reduce((p, q) => p + q, 0) / r; let q = ini - tot / 2;
      s.split('').forEach((ch, i) => { const d = larg[i] / r; c.save(); c.translate(x + Math.cos(q + d / 2) * r, y + Math.sin(q + d / 2) * r); c.rotate(q + d / 2 + Math.PI / 2); c.fillText(ch, 0, 0); c.restore(); q += d; });
    });
  }
  /** letreiro com contorno e brilho, para títulos do backglass */
  letreiro(s: string, x: number, y: number, tam: number, cor: string, borda: string, a = 1, fonte = 'Orbitron') {
    const c = this.c; this.com(a, () => {
      c.font = `800 ${tam}px ${fonte}, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineJoin = 'round'; c.lineWidth = tam * 0.22; c.strokeStyle = 'rgba(0,0,0,0.7)'; c.strokeText(s, x, y + tam * 0.06);
      c.lineWidth = tam * 0.1; c.strokeStyle = borda; c.strokeText(s, x, y);
      c.fillStyle = this.lin(0, y - tam / 2, 0, y + tam / 2, [[0, '#ffffff'], [0.45, cor], [0.55, tom(cor, -0.25)], [1, tom(cor, 0.2)]]); c.fillText(s, x, y);
    });
  }
  /** contorno arredondado (filetes e molduras de inserto pintado) */
  filete(x: number, y: number, w: number, h: number, r: number, cor: string, l = 1.5, a = 1) {
    const c = this.c; this.com(a, () => { c.strokeStyle = cor; c.lineWidth = l; c.beginPath(); c.roundRect(x, y, w, h, r); c.stroke(); });
  }
  /** blocos de pedra ou tijolo */
  pedras(x: number, y: number, w: number, h: number, bw: number, bh: number, cor: string, junta: string, a = 1) {
    const c = this.c; this.com(a, () => {
      c.fillStyle = cor; c.fillRect(x, y, w, h); c.strokeStyle = junta; c.lineWidth = 1.2; c.beginPath();
      for (let j = 0, yy = y; yy < y + h; j++, yy += bh) { c.moveTo(x, yy); c.lineTo(x + w, yy); for (let xx = x + (j % 2 ? bw / 2 : 0); xx < x + w; xx += bw) { c.moveTo(xx, yy); c.lineTo(xx, Math.min(y + h, yy + bh)); } }
      c.stroke();
      for (let i = 0; i < (w * h) / (bw * bh) * 0.4; i++) { c.fillStyle = this.r() < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.12)'; c.fillRect(x + this.rr(0, w - bw), y + this.rr(0, h - bh), bw * 0.9, bh * 0.85); }
    });
  }
  /** chapas metálicas rebitadas */
  chapas(x: number, y: number, w: number, h: number, pw: number, ph: number, cor: string, a = 1) {
    const c = this.c; this.com(a, () => {
      for (let yy = y; yy < y + h; yy += ph) for (let xx = x; xx < x + w; xx += pw) {
        c.fillStyle = this.lin(xx, yy, xx + pw, yy + ph, [[0, tom(cor, 0.12)], [0.5, cor], [1, tom(cor, -0.3)]]); c.fillRect(xx + 1, yy + 1, pw - 2, ph - 2);
        c.fillStyle = tom(cor, 0.35); for (const [rx, ry] of [[4, 4], [pw - 4, 4], [4, ph - 4], [pw - 4, ph - 4]]) { c.beginPath(); c.arc(xx + rx, yy + ry, 1.3, 0, TAU); c.fill(); }
      }
    });
  }
  /** gravura em hachura (livro antigo, mapa, moeda) */
  hachura(x: number, y: number, w: number, h: number, ang: number, passo: number, cor: string, a = 0.3) {
    const c = this.c; this.com(a, () => {
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.translate(x + w / 2, y + h / 2); c.rotate(ang); c.strokeStyle = cor; c.lineWidth = 0.8; c.beginPath();
      const R = Math.hypot(w, h); for (let d = -R; d < R; d += passo) { c.moveTo(-R, d); c.lineTo(R, d); } c.stroke(); c.restore();
    });
  }
  /** roseta / mandala de pétalas, para emblemas centrais */
  roseta(x: number, y: number, r: number, n: number, cor: string, a = 0.5, l = 1.2, rot = 0) {
    const c = this.c; this.com(a, () => {
      c.strokeStyle = cor; c.lineWidth = l;
      for (let i = 0; i < n; i++) { const q = rot + i / n * TAU; c.beginPath(); c.ellipse(x + Math.cos(q) * r * 0.5, y + Math.sin(q) * r * 0.5, r * 0.5, r * 0.16, q, 0, TAU); c.stroke(); }
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.beginPath(); c.arc(x, y, r * 1.08, 0, TAU); c.stroke();
    });
  }
  /** contas de luz em arco (marquises, letreiros de parque) */
  lampadas(pts: number[][], cor: string, r = 2.2, a = 1) { for (const p of pts) { this.nevoa(p[0], p[1], r * 3.2, r * 3.2, cor, 0.35 * a); this.disco(p[0], p[1], r, cor, a); this.disco(p[0] - r * 0.3, p[1] - r * 0.3, r * 0.4, '#ffffff', 0.8 * a); } }
  /** pontos ao longo de um arco */
  arcoPts(x: number, y: number, r: number, a0: number, a1: number, n: number) { const o: number[][] = []; for (let i = 0; i < n; i++) { const q = a0 + (a1 - a0) * i / Math.max(1, n - 1); o.push([x + Math.cos(q) * r, y + Math.sin(q) * r]); } return o; }
  /** seta de pista pintada (aponta para a direção real do tiro) */
  chevron(x: number, y: number, s: number, ang: number, cor: string, a = 0.6) {
    const c = this.c; this.com(a, () => { c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = cor; c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.9, s * 0.2); c.lineTo(s * 0.9, s * 0.75); c.lineTo(0, -s * 0.05); c.lineTo(-s * 0.9, s * 0.75); c.lineTo(-s * 0.9, s * 0.2); c.closePath(); c.fill(); c.restore(); });
  }
  /** contorno grosso com halo, para linhas de neon pintadas */
  neon(pts: number[][], cor: string, l = 2, a = 0.9) { this.curva(pts, cor, l * 4, a * 0.15); this.curva(pts, cor, l * 2, a * 0.3); this.curva(pts, '#ffffff', l * 0.6, a * 0.8); this.curva(pts, cor, l, a * 0.7); }
}
