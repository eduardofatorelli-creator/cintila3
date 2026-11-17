// Efeitos de acerto do Visual R04. Observa J.ev (bumper, estilingue, alvo, rampa, órbita, chefe…) e desenha
// um tratamento próprio para cada evento, com a forma de choque e a partícula da máquina. Curto e com limite.
import type { Pintor } from '../render/playfield';
import type { Choque, Particula } from './manifesto';
import { alfa } from './pincel';

const TAU = Math.PI * 2;
interface Fx { tipo: string; x: number; y: number; t: number; dur: number; cor: string; r: number; d?: any }
interface Pt { x: number; y: number; z: number; vx: number; vy: number; vz: number; vida: number; max: number; cor: string; rot: number }

export class EfeitosVisuais {
  private fx: Fx[] = []; private ps: Pt[] = []; maxPs = 70; reduzido = false;
  constructor(public choque: Choque, public particula: Particula, public cores: { c1: string; c2: string; c3: string }) {}
  limpa() { this.fx.length = 0; this.ps.length = 0; }
  private soma(f: Fx) { if (this.fx.length > 24) this.fx.shift(); this.fx.push(f); }
  private solta(x: number, y: number, n: number, cor: string, forca = 1) {
    if (this.reduzido) n = Math.ceil(n / 2);
    for (let i = 0; i < n && this.ps.length < this.maxPs; i++) {
      const a = Math.random() * TAU, v = (50 + Math.random() * 110) * forca, vida = 0.45 + Math.random() * 0.4;
      this.ps.push({ x, y, z: 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 60 + Math.random() * 90, vida, max: vida, cor, rot: Math.random() * TAU });
    }
  }
  /** chamado com cada evento de mesa; só lê */
  observa(tipo: string, b: { x: number; y: number } | null | undefined, d: any, chefe: { x: number; y: number } | null) {
    const K = this.cores, x = b?.x ?? d?.x ?? 190, y = b?.y ?? d?.y ?? 400;
    switch (tipo) {
      case 'bumper': if (d && typeof d.x === 'number') { this.soma({ tipo: 'choque', x: d.x, y: d.y, t: 0, dur: 0.42, cor: K.c1, r: (d.r || 16) }); this.solta(d.x, d.y, 4, K.c1); } break;
      case 'sling': if (d?.s) this.soma({ tipo: 'corte', x: 0, y: 0, t: 0, dur: 0.22, cor: '#ffffff', r: 0, d: d.s }); break;
      case 'alvo': case 'queda': this.soma({ tipo: 'alvo', x, y, t: 0, dur: 0.3, cor: K.c3, r: 10 }); this.solta(x, y, 3, K.c3, 0.8); break;
      case 'rampa': if (d?.caminho) this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.9, cor: K.c1, r: 0, d: d.caminho }); break;
      case 'orbita': if (d && typeof d.x === 'number') this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.7, cor: K.c3, r: 0, d: [[d.x, 470, 2], [d.x, 300, 2], [d.x, 140, 2]] }); break;
      case 'chefe': { const c = chefe || { x, y }; this.soma({ tipo: 'chefe', x: c.x, y: c.y, t: 0, dur: 0.55, cor: '#ff4466', r: 26 }); this.solta(c.x, c.y, 6, '#ff7a90', 1.2); break; }
      case 'portal': case 'trava': case 'tunel': case 'boca': case 'poco': case 'flor': case 'prisma': case 'roda': case 'elevadorEntra':
        this.soma({ tipo: 'gira', x: d?.x ?? x, y: d?.y ?? y, t: 0, dur: 0.6, cor: K.c2, r: 18 }); break;
      case 'cano': case 'pocoCospe': case 'disparo': case 'pouso': case 'giratorio': case 'escudoGira':
        this.soma({ tipo: 'choque', x, y, t: 0, dur: 0.5, cor: K.c2, r: 14 }); this.solta(x, y, 8, K.c2, 1.1); break;
      case 'banco': this.soma({ tipo: 'choque', x, y, t: 0, dur: 0.6, cor: K.c3, r: 30 }); this.solta(x, y, 10, K.c3, 1.2); break;
      default: break;
    }
  }
  passo(dt: number) {
    for (let i = this.fx.length - 1; i >= 0; i--) { const f = this.fx[i]; f.t += dt; if (f.t >= f.dur) this.fx.splice(i, 1); }
    for (let i = this.ps.length - 1; i >= 0; i--) {
      const p = this.ps[i]; p.vida -= dt; if (p.vida <= 0) { this.ps.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= 380 * dt; p.vx *= 0.97; p.vy *= 0.97; p.rot += dt * 6; if (p.z < 0) { p.z = 0; p.vz *= -0.35; }
    }
  }
  desenha(g: Pintor) {
    const c = g.c; c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (const f of this.fx) {
      const u = f.t / f.dur, a = 1 - u;
      if (f.tipo === 'choque' || f.tipo === 'chefe') this.choqueEm(g, f.x, f.y, f.r * (1 + u * 1.6), f.tipo === 'chefe' ? 'raio' : this.choque, f.cor, a, u);
      else if (f.tipo === 'corte') { const s = f.d, A = g.p(s.ax, s.ay, 10), B = g.p(s.bx, s.by, 10); c.globalAlpha = a; c.strokeStyle = f.cor; c.lineWidth = (6 * a + 1) * A[2]; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); }
      else if (f.tipo === 'alvo') { const [X, Y, K] = g.p(f.x, f.y, 8), r = (6 + u * 12) * K; c.globalAlpha = a; c.strokeStyle = f.cor; c.lineWidth = 2 * K; c.strokeRect(X - r, Y - r * 0.8, r * 2, r * 1.6); }
      else if (f.tipo === 'gira') { const [X, Y, K] = g.p(f.x, f.y, 4); c.globalAlpha = a; c.strokeStyle = f.cor; c.lineWidth = 1.6 * K; c.beginPath(); for (let i = 0; i <= 40; i++) { const q = i / 40 * TAU * 2 + u * 6, r = f.r * (1 - u) * (i / 40) * K; c.lineTo(X + Math.cos(q) * r, Y + Math.sin(q) * r * 0.85); } c.stroke(); }
      else if (f.tipo === 'cometa') {
        // um cometa de luz percorre o caminho real da rampa ou da órbita
        const P = f.d as number[][], L = P.length - 1, pos = Math.min(L - 0.001, u * L * 1.15);
        c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 7; k++) {
          const q = pos - k * 0.12; if (q < 0) break; const i = Math.floor(q), w = q - i, p0 = P[i], p1 = P[Math.min(L, i + 1)];
          const [X, Y, K] = g.p(p0[0] + (p1[0] - p0[0]) * w, p0[1] + (p1[1] - p0[1]) * w, (p0[2] || 0) + ((p1[2] || 0) - (p0[2] || 0)) * w + 2);
          c.globalAlpha = (1 - k / 7) * Math.min(1, (1 - u) * 3) * 0.8; c.fillStyle = k ? f.cor : '#ffffff'; c.beginPath(); c.arc(X, Y, (4 - k * 0.4) * K, 0, TAU); c.fill();
        }
        c.globalCompositeOperation = 'source-over';
      }
    }
    for (const p of this.ps) this.desenhaPt(g, p);
    c.restore(); c.globalAlpha = 1;
  }
  private choqueEm(g: Pintor, x: number, y: number, r: number, tipo: Choque, cor: string, a: number, u: number) {
    const c = g.c, [X, Y, K] = g.p(x, y, 8), R = r * K; c.globalAlpha = a; c.strokeStyle = cor; c.fillStyle = cor; c.lineWidth = Math.max(1, 3 * a * K);
    c.save(); c.translate(X, Y); c.scale(1, 0.82);
    switch (tipo) {
      case 'anel': c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke(); c.globalAlpha = a * 0.5; c.beginPath(); c.arc(0, 0, R * 0.7, 0, TAU); c.stroke(); break;
      case 'onda': for (let k = 0; k < 2; k++) { c.beginPath(); for (let i = 0; i <= 36; i++) { const q = i / 36 * TAU, rr = R * (0.75 + k * 0.3) + Math.sin(q * 8 + u * 10) * 2 * K; c.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); } c.stroke(); } break;
      case 'estrela': c.beginPath(); for (let i = 0; i < 8; i++) { const q = i / 8 * TAU + u; c.moveTo(Math.cos(q) * R * 0.45, Math.sin(q) * R * 0.45); c.lineTo(Math.cos(q) * R * (i % 2 ? 0.9 : 1.3), Math.sin(q) * R * (i % 2 ? 0.9 : 1.3)); } c.stroke(); break;
      case 'raio': c.beginPath(); for (let i = 0; i < 5; i++) { const q = i / 5 * TAU + 0.4; let px = Math.cos(q) * R * 0.4, py = Math.sin(q) * R * 0.4; c.moveTo(px, py); for (let k = 1; k <= 3; k++) { px = Math.cos(q) * R * (0.4 + k * 0.28) + (k % 2 ? 4 : -4) * K; py = Math.sin(q) * R * (0.4 + k * 0.28); c.lineTo(px, py); } } c.stroke(); c.beginPath(); c.arc(0, 0, R * 0.9, 0, TAU); c.globalAlpha = a * 0.4; c.stroke(); break;
      case 'quadrado': c.rotate(u * 1.5); c.strokeRect(-R, -R, R * 2, R * 2); c.globalAlpha = a * 0.5; c.strokeRect(-R * 0.6, -R * 0.6, R * 1.2, R * 1.2); break;
      case 'petalas': for (let i = 0; i < 6; i++) { const q = i / 6 * TAU + u; c.beginPath(); c.ellipse(Math.cos(q) * R * 0.7, Math.sin(q) * R * 0.7, R * 0.35, R * 0.14, q, 0, TAU); c.fill(); } break;
      case 'engrenagem': c.rotate(u * 2); c.beginPath(); c.arc(0, 0, R * 0.85, 0, TAU); c.stroke(); for (let i = 0; i < 10; i++) { c.rotate(TAU / 10); c.fillRect(-R * 0.08, -R * 1.1, R * 0.16, R * 0.25); } break;
      case 'cristal': for (let i = 0; i < 6; i++) { const q = i / 6 * TAU + 0.3; c.beginPath(); c.moveTo(Math.cos(q) * R * 0.5, Math.sin(q) * R * 0.5); c.lineTo(Math.cos(q + 0.12) * R * 1.2, Math.sin(q + 0.12) * R * 1.2); c.lineTo(Math.cos(q - 0.12) * R * 1.2, Math.sin(q - 0.12) * R * 1.2); c.closePath(); c.stroke(); } break;
    }
    c.restore();
  }
  private desenhaPt(g: Pintor, p: Pt) {
    const c = g.c, [X, Y, K] = g.p(p.x, p.y, p.z), u = p.vida / p.max, s = 2.2 * K; c.globalAlpha = Math.min(1, u * 1.6); c.fillStyle = p.cor; c.strokeStyle = p.cor; c.lineWidth = Math.max(0.6, 0.8 * K);
    c.save(); c.translate(X, Y); c.rotate(p.rot);
    switch (this.particula) {
      case 'estrela': c.beginPath(); for (let i = 0; i < 8; i++) { const q = i / 8 * TAU, r = i % 2 ? s * 0.35 : s * 1.2; c.lineTo(Math.cos(q) * r, Math.sin(q) * r); } c.fill(); break;
      case 'bolha': c.beginPath(); c.arc(0, 0, s, 0, TAU); c.stroke(); break;
      case 'floco': c.beginPath(); for (let i = 0; i < 3; i++) { const q = i * Math.PI / 3; c.moveTo(-Math.cos(q) * s * 1.2, -Math.sin(q) * s * 1.2); c.lineTo(Math.cos(q) * s * 1.2, Math.sin(q) * s * 1.2); } c.stroke(); break;
      case 'nota': c.font = `${Math.round(10 * K)}px serif`; c.textAlign = 'center'; c.fillText('♪', 0, 0); break;
      case 'petala': case 'folha': c.beginPath(); c.ellipse(0, 0, s * 1.3, s * 0.55, 0, 0, TAU); c.fill(); break;
      case 'faisca': case 'raio': c.beginPath(); c.moveTo(-s * 1.4, 0); c.lineTo(-s * 0.2, s * 0.4); c.lineTo(s * 0.2, -s * 0.4); c.lineTo(s * 1.4, 0); c.stroke(); break;
      case 'pixel': case 'confete': c.fillRect(-s * 0.8, -s * 0.5, s * 1.6, s); break;
      case 'cristal': c.beginPath(); c.moveTo(0, -s * 1.3); c.lineTo(s * 0.6, s * 0.6); c.lineTo(-s * 0.6, s * 0.6); c.closePath(); c.fill(); break;
      case 'engrenagem': c.beginPath(); c.arc(0, 0, s, 0, TAU); c.stroke(); for (let i = 0; i < 6; i++) { c.rotate(TAU / 6); c.fillRect(-s * 0.15, -s * 1.4, s * 0.3, s * 0.4); } break;
      case 'brasa': c.fillStyle = alfa('#ffb02e', 1); c.beginPath(); c.arc(0, 0, s * 0.7, 0, TAU); c.fill(); break;
      default: c.beginPath(); c.arc(0, 0, s * 0.6, 0, TAU); c.fill();
    }
    c.restore();
  }
}
