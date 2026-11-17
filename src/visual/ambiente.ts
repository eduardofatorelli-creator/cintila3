// Camada viva do tablado: um efeito ambiente por máquina (aurora, bolhas, brasas, neve, chuva, neon…).
// Desenhada entre o tablado parado e as peças. Poucos elementos, alfa baixo, longe das palhetas.
import type { Pintor } from '../render/playfield';
import type { Ambiente as Tipo } from './manifesto';
import { alfa } from './pincel';

const TAU = Math.PI * 2;
interface Pt { x: number; y: number; vx: number; vy: number; f: number; s: number; v: number }

export class Ambiente {
  private ps: Pt[] = []; private t = 0; private raio = 0; private raioPts: number[][] = [];
  /** 1 normal, 2 no modo mago; 0,5 em modo econômico */
  forca = 1; reduzido = false;
  constructor(public tipo: Tipo, public cores: { c1: string; c2: string; c3: string }, n = 28) {
    for (let i = 0; i < n; i++) this.ps.push(this.novo(true));
  }
  private novo(inicio = false): Pt {
    const r = Math.random, T = this.tipo, sobe = T === 'bolhas' || T === 'brasas' || T === 'vapor' || T === 'notas';
    const cai = T === 'neve' || T === 'confete' || T === 'petalas' || T === 'folhas' || T === 'chuva' || T === 'neon';
    const y = inicio ? 60 + r() * 560 : sobe ? 640 : cai ? 40 : 60 + r() * 520;
    const vy = sobe ? -(14 + r() * 26) : T === 'chuva' || T === 'neon' ? 380 + r() * 160 : cai ? 18 + r() * 26 : (r() - 0.5) * 10;
    return { x: 30 + r() * 340, y, vx: T === 'chuva' || T === 'neon' ? -60 : (r() - 0.5) * 16, vy, f: r() * TAU, s: 0.6 + r() * 0.8, v: 0 };
  }
  passo(dt: number) {
    const k = this.reduzido ? 0.25 : 1; this.t += dt * k;
    const n = Math.round(this.ps.length * Math.min(1, this.forca));
    for (let i = 0; i < n; i++) {
      const p = this.ps[i]; p.x += p.vx * dt * k; p.y += p.vy * dt * k * this.forca; p.f += dt * 2 * k; p.v += dt;
      if (this.tipo === 'vagalumes' || this.tipo === 'poeira' || this.tipo === 'prisma') { p.vx += Math.sin(p.f * 1.3) * 6 * dt; p.vy += Math.cos(p.f) * 6 * dt; }
      if (p.y < 40 || p.y > 640 || p.x < 20 || p.x > 380) this.ps[i] = this.novo();
    }
    if (this.tipo === 'raios' || this.tipo === 'faiscas') {
      this.raio -= dt; if (this.raio < -(this.reduzido ? 12 : 3 + Math.random() * 4) / this.forca) {
        this.raio = 0.18; const x = 40 + Math.random() * 320, y = 40 + Math.random() * 120; this.raioPts = [[x, y]];
        for (let i = 1; i < 6; i++) this.raioPts.push([x + (Math.random() - 0.5) * 50, y + i * (this.tipo === 'faiscas' ? 10 : 34)]);
      }
    }
  }
  desenha(g: Pintor) {
    const c = g.c, T = this.tipo, K = this.cores, n = Math.round(this.ps.length * Math.min(1, this.forca)), a0 = 0.5 * Math.min(1.4, this.forca);
    c.save(); c.globalCompositeOperation = 'lighter';
    if (T === 'aurora') {
      // três faixas lentas de aurora no alto da mesa
      for (let k = 0; k < 3; k++) {
        c.beginPath(); for (let x = 20; x <= 380; x += 30) { const [X, Y] = g.p(x, 70 + k * 34 + Math.sin(x * 0.02 + this.t * 0.6 + k * 2) * 16); c.lineTo(X, Y); }
        c.strokeStyle = alfa([K.c1, '#7dffb0', K.c3][k], 0.08 * a0 * 2); c.lineWidth = 22 * g.s; c.lineCap = 'round'; c.stroke();
      }
    }
    if (T === 'feixes' || T === 'prisma') {
      for (let k = 0; k < 2; k++) {
        const q = Math.PI / 2 + Math.sin(this.t * 0.5 + k * 2.5) * 0.6, [X, Y] = g.p(k ? 360 : 40, 20), L = 700 * g.s;
        const gr = c.createRadialGradient(X, Y, 0, X, Y, L); gr.addColorStop(0, alfa(k ? K.c2 : K.c1, 0.12 * a0)); gr.addColorStop(1, alfa(K.c1, 0));
        c.fillStyle = gr; c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, L, q - 0.12, q + 0.12); c.closePath(); c.fill();
      }
    }
    for (let i = 0; i < n; i++) {
      const p = this.ps[i], [X, Y, Kk] = g.p(p.x, p.y, 2), pul = 0.5 + 0.5 * Math.sin(p.f * 2.2), cor = [K.c1, K.c2, K.c3][i % 3];
      const fade = Math.min(1, p.v * 2) * (p.y > 560 ? Math.max(0, (640 - p.y) / 80) : 1), a = a0 * fade;
      c.globalAlpha = 1;
      switch (T) {
        case 'cintilar': case 'pixels': case 'prisma': {
          c.fillStyle = alfa(T === 'prisma' ? ['#ff6b9a', '#ffe14d', '#4dff88', '#4da6ff'][i % 4] : cor, a * pul);
          const r = (T === 'pixels' ? 1.6 : 1.2) * Kk * p.s; if (T === 'pixels') c.fillRect(X - r, Y - r, r * 2, r * 2); else { c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill(); } break;
        }
        case 'bolhas': c.strokeStyle = alfa(K.c1, a * 0.7); c.lineWidth = 0.8 * Kk; c.beginPath(); c.arc(X + Math.sin(p.f) * 3, Y, 2.6 * Kk * p.s, 0, TAU); c.stroke(); break;
        case 'brasas': c.fillStyle = alfa(i % 2 ? '#ffb02e' : '#ff4a1c', a * (0.4 + pul * 0.6)); c.beginPath(); c.arc(X + Math.sin(p.f) * 4, Y, 1.4 * Kk * p.s, 0, TAU); c.fill(); break;
        case 'vagalumes': case 'poeira': c.fillStyle = alfa(T === 'poeira' ? '#fff1c8' : cor, a * (T === 'poeira' ? 0.45 : pul)); c.beginPath(); c.arc(X, Y, (T === 'poeira' ? 0.9 : 1.6) * Kk * p.s, 0, TAU); c.fill(); break;
        case 'neve': c.fillStyle = alfa('#ffffff', a * 0.8); c.beginPath(); c.arc(X + Math.sin(p.f) * 4, Y, 1.3 * Kk * p.s, 0, TAU); c.fill(); break;
        case 'chuva': case 'neon': c.strokeStyle = alfa(T === 'neon' ? cor : '#bcd2ff', a * 0.5); c.lineWidth = 0.8 * Kk; c.beginPath(); c.moveTo(X, Y); c.lineTo(X + 2.5 * Kk, Y - 11 * Kk); c.stroke(); break;
        case 'confete': case 'petalas': case 'folhas': {
          c.fillStyle = alfa(T === 'folhas' ? (i % 2 ? '#3aa874' : '#9c7b3a') : cor, a * 0.8); c.save(); c.translate(X + Math.sin(p.f) * 6, Y); c.rotate(p.f);
          if (T === 'confete') c.fillRect(-1.8 * Kk, -0.9 * Kk, 3.6 * Kk, 1.8 * Kk); else { c.beginPath(); c.ellipse(0, 0, 2.6 * Kk, 1.1 * Kk, 0, 0, TAU); c.fill(); } c.restore(); break;
        }
        case 'vapor': c.fillStyle = alfa(K.c1, a * 0.1); c.beginPath(); c.arc(X, Y, (6 + (640 - p.y) * 0.03) * Kk, 0, TAU); c.fill(); break;
        case 'notas': c.fillStyle = alfa(cor, a * 0.7); c.font = `${Math.round(9 * Kk * p.s)}px serif`; c.fillText(i % 2 ? '♪' : '♫', X + Math.sin(p.f) * 5, Y); break;
        case 'faiscas': case 'raios': c.fillStyle = alfa(K.c1, a * pul * 0.8); c.beginPath(); c.arc(X, Y, 1 * Kk, 0, TAU); c.fill(); break;
        default: break;
      }
    }
    if ((T === 'raios' || T === 'faiscas') && this.raio > 0 && this.raioPts.length) {
      c.globalAlpha = Math.min(1, this.raio * 6) * 0.8; c.strokeStyle = K.c1; c.lineWidth = 1.6 * g.s; c.lineJoin = 'miter'; c.beginPath();
      for (const q of this.raioPts) { const [X, Y] = g.p(q[0], q[1], 4); c.lineTo(X, Y); } c.stroke();
    }
    c.restore();
  }
}
