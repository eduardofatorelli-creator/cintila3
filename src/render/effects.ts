// Partículas, textos que sobem, bloom e flashes.
import type { FxEv } from '../game/rules';
import type { Pintor } from './playfield';
import { novaTela } from './tema';

interface Part { x: number; y: number; z: number; vx: number; vy: number; vz: number; vida: number; max: number; cor: string; r: number; texto?: string }


export class Efeitos {
  ps: Part[] = []; max = 300; simples = false; private bloomTela: HTMLCanvasElement | null = null; bloom: CanvasRenderingContext2D | null = null;
  private temFiltro = typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype;
  recebe(fila: FxEv[]) {
    for (const e of fila) {
      if (e.tipo === 'pontos') { this.ps.push({ x: e.x, y: e.y, z: 16, vx: 0, vy: -26, vz: 26, vida: 1.1, max: 1.1, cor: e.cor || '#fff', r: 0, texto: e.texto }); continue; }
      const n = Math.min(e.n || 8, this.max - this.ps.length), forte = e.tipo === 'explosao';
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = (forte ? 60 + Math.random() * 260 : 40 + Math.random() * 140), vida = forte ? 0.5 + Math.random() * 0.7 : 0.25 + Math.random() * 0.4;
        this.ps.push({ x: e.x, y: e.y, z: 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 40 + Math.random() * (forte ? 220 : 110), vida, max: vida, cor: Math.random() < 0.3 ? '#ffffff' : e.cor || '#fff', r: forte ? 1.5 + Math.random() * 2.5 : 1 + Math.random() * 1.6 });
      }
    }
    fila.length = 0;
    if (this.ps.length > this.max) this.ps.splice(0, this.ps.length - this.max);
  }
  passo(dt: number) {
    for (let i = this.ps.length - 1; i >= 0; i--) {
      const p = this.ps[i]; p.vida -= dt; if (p.vida <= 0) { this.ps.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (!p.texto) { p.vz -= 520 * dt; if (p.z < 0) { p.z = 0; p.vz *= -0.4; } }
    }
  }
  desenha(g: Pintor) {
    const c = g.c;
    for (const p of this.ps) {
      const u = p.vida / p.max;
      if (p.texto) {
        const [X, Y, K] = g.p(p.x, p.y, p.z); c.globalAlpha = Math.min(1, u * 2.2); c.font = `800 ${Math.max(8, 11 * K)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.75)'; c.strokeText(p.texto, X, Y); c.fillStyle = p.cor; c.fillText(p.texto, X, Y); c.globalAlpha = 1;
      } else { g.disco(p.x, p.y, p.r * (0.4 + u * 0.6), p.cor, p.z, u); if (p.r > 2) g.glow(p.x, p.y, p.r * 3, p.cor, p.z, u * 0.8); }
    }
  }
  /** prepara o canvas auxiliar do bloom, em metade da resolução */
  preparaBloom(w: number, h: number): CanvasRenderingContext2D {
    if (!this.bloomTela || this.bloomTela.width !== Math.ceil(w / 2) || this.bloomTela.height !== Math.ceil(h / 2)) { const [t, c] = novaTela(Math.ceil(w / 2), Math.ceil(h / 2)); this.bloomTela = t; this.bloom = c; }
    this.bloom!.clearRect(0, 0, w, h); return this.bloom!;
  }
  compoeBloom(c: CanvasRenderingContext2D, w: number, h: number) {
    if (!this.bloomTela) return;
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.44;
    if (this.temFiltro && !this.simples) c.filter = 'blur(5px)';
    c.drawImage(this.bloomTela, 0, 0, w, h);
    if (!this.temFiltro || this.simples) { c.globalAlpha = 0.2; c.drawImage(this.bloomTela, -3, -3, w + 6, h + 6); }
    c.restore();
  }
}
