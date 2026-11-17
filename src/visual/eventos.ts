// Efeitos de acerto do Visual R04. Observa J.ev (bumper, estilingue, alvo, rampa, órbita, chefe…) e desenha
// um tratamento próprio para cada evento, com a forma de choque e a partícula da máquina. Curto e com limite.
import type { Pintor } from '../render/playfield';
import type { Choque, Particula } from './manifesto';
import { alfa } from './pincel';

const TAU = Math.PI * 2;
interface Fx { tipo: string; x: number; y: number; t: number; dur: number; cor: string; r: number; d?: any }
interface Pt { x: number; y: number; z: number; vx: number; vy: number; vz: number; vida: number; max: number; cor: string; rot: number; forma?: Particula }

export class EfeitosVisuais {
  private fx: Fx[] = []; private ps: Pt[] = []; maxPs = 70; reduzido = false;
  /** peças da mesa (só leitura), para os efeitos que ligam uma peça à outra */
  pecas: () => any[] = () => [];
  /** jogo (só leitura): batida, medidores e posição do chefe para os efeitos de assinatura */
  jogo: () => any = () => null;
  constructor(public choque: Choque, public particula: Particula, public cores: { c1: string; c2: string; c3: string }, public sig = '') {}
  limpa() { this.fx.length = 0; this.ps.length = 0; }
  private soma(f: Fx) { if (this.fx.length > 24) this.fx.shift(); this.fx.push(f); }
  private solta(x: number, y: number, n: number, cor: string, forca = 1, forma?: Particula) {
    if (this.reduzido) n = Math.ceil(n / 2);
    for (let i = 0; i < n && this.ps.length < this.maxPs; i++) {
      const a = Math.random() * TAU, v = (50 + Math.random() * 110) * forca, vida = 0.45 + Math.random() * 0.4;
      this.ps.push({ x, y, z: 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 60 + Math.random() * 90, vida, max: vida, cor, rot: Math.random() * TAU, forma });
    }
  }
  /** chamado com cada evento de mesa; só lê */
  observa(tipo: string, b: { x: number; y: number } | null | undefined, d: any, chefe: { x: number; y: number } | null) {
    const K = this.cores, x = b?.x ?? d?.x ?? 190, y = b?.y ?? d?.y ?? 400;
    try { this.assinatura(tipo, b, d, x, y); } catch { /* efeito de assinatura nunca derruba o jogo */ }
    switch (tipo) {
      case 'bumper': if (d && typeof d.x === 'number') { this.soma({ tipo: 'choque', x: d.x, y: d.y, t: 0, dur: 0.42, cor: K.c1, r: (d.r || 16) }); this.solta(d.x, d.y, 4, K.c1); } break;
      case 'sling': if (d?.s) this.soma({ tipo: 'corte', x: 0, y: 0, t: 0, dur: 0.22, cor: '#ffffff', r: 0, d: d.s }); break;
      case 'alvo': case 'queda': {
        this.soma({ tipo: 'alvo', x, y, t: 0, dur: 0.3, cor: K.c3, r: 10 }); this.solta(x, y, 3, K.c3, 0.8);
        // Aurora (e a máquina final, se sortear): o alvo acertado manda um traço de luz para a próxima estrela da constelação
        if (tipo === 'alvo' && d?.rotulo && /^\d+$/.test(d.rotulo)) { const prox = this.pecas().find(q => q.tipo === 'alvoFixo' && q.aceso === false && q.vale === 1); if (prox && prox !== d) this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.75, cor: K.c1, r: 0, d: [[d.x, d.y, 6], [(d.x + prox.x) / 2, (d.y + prox.y) / 2, 30], [prox.x, prox.y, 6]] }); }
        break;
      }
      case 'rampa': if (d?.caminho) this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.9, cor: K.c1, r: 0, d: d.caminho }); break;
      case 'orbita': if (d && typeof d.x === 'number') this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.7, cor: K.c3, r: 0, d: [[d.x, 470, 2], [d.x, 300, 2], [d.x, 140, 2]] }); break;
      case 'chefe': { const c = chefe || { x, y }; this.soma({ tipo: 'chefe', x: c.x, y: c.y, t: 0, dur: 0.55, cor: '#ff4466', r: 26 }); this.solta(c.x, c.y, 6, '#ff7a90', 1.2); break; }
      case 'portal': case 'trava': case 'tunel': case 'boca': case 'poco': case 'flor': case 'prisma': case 'roda': case 'elevadorEntra':
        this.soma({ tipo: 'gira', x: d?.x ?? x, y: d?.y ?? y, t: 0, dur: 0.6, cor: K.c2, r: 18 }); break;
      case 'cano': if (d?.peca?.canos) { const p0 = d.peca, cn = p0.canos[d.i]; this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.7, cor: K.c1, r: 0, d: [[p0.x, p0.y, 2], [(p0.x + cn[0]) / 2, (p0.y + cn[1]) / 2, 2], [cn[0], cn[1], 2]] }); this.solta(cn[0], cn[1], 7, '#bff8ff', 0.7); }
        this.soma({ tipo: 'choque', x, y, t: 0, dur: 0.5, cor: K.c2, r: 14 }); break;
      case 'giratorio': if (d?.peca?.trilho) { const tr = d.peca.trilho as number[][]; this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.6, cor: K.c2, r: 0, d: tr.map(q => [q[0], q[1], 2]) }); this.soma({ tipo: 'choque', x: d.x, y: d.y, t: 0, dur: 0.5, cor: K.c3, r: 16 }); this.solta(d.x, d.y, 10, K.c1, 1.2); break; }
        this.soma({ tipo: 'choque', x, y, t: 0, dur: 0.5, cor: K.c2, r: 14 }); this.solta(x, y, 8, K.c2, 1.1); break;
      case 'pas': if (d && typeof d.x === 'number') { this.soma({ tipo: 'choque', x: d.x, y: d.y, t: 0, dur: 0.4, cor: K.c3, r: 20 }); this.solta(x, y, 4, K.c1); } break;
      case 'pocoCospe': case 'disparo': case 'pouso': case 'escudoGira':
        this.soma({ tipo: 'choque', x, y, t: 0, dur: 0.5, cor: K.c2, r: 14 }); this.solta(x, y, 8, K.c2, 1.1); break;
      case 'banco': this.soma({ tipo: 'choque', x, y, t: 0, dur: 0.6, cor: K.c3, r: 30 }); this.solta(x, y, 10, K.c3, 1.2); break;
      default: break;
    }
  }
  /** efeitos exclusivos de cada mecânica-assinatura, sempre no evento real que a mecânica usa */
  private assinatura(tipo: string, b: any, d: any, x: number, y: number) {
    const K = this.cores, J = this.jogo(), S = this.sig, GOLPES = ['bumper', 'alvo', 'queda', 'rampa', 'orbita', 'chefe'];
    const pulso = (px: number, py: number, r: number, cor: string, dur = 0.6) => this.soma({ tipo: 'pulso', x: px, y: py, t: 0, dur, cor, r });
    const arco = (x0: number, y0: number, x1: number, y1: number, cor: string) => this.soma({ tipo: 'arco', x: x0, y: y0, t: 0, dur: 0.35, cor, r: 0, d: [x1, y1, Math.random() * 1000] });
    const ch = J?.m?.chefe;
    switch (S) {
      case 'compasso': if (GOLPES.includes(tipo) && J) { const f = J.batida(); if (f < 0.17 || f > 0.83) { pulso(x, y, 46, '#ff4fd8', 0.7); this.solta(x, y, 8, '#c8c4e8', 0.8, 'grao'); } } break;
      case 'criaturas': if (tipo === 'giratorio' && d) { if (d.quebrou) { this.soma({ tipo: 'cometa', x: d.x, y: d.y, t: 0, dur: 0.9, cor: K.c1, r: 0, d: [[d.x, d.y, 4], [d.x + 10, d.y - 60, 30], [d.x - 6, d.y - 140, 60]] }); this.solta(d.x, d.y, 12, K.c1, 1.1, 'folha'); } else pulso(d.x, d.y, 22, K.c2, 0.45); } break;
      case 'escudos': if (tipo === 'escudoGira' && d?.quebrou) { this.solta(x, y, 12, '#c0c7e0', 1.3, 'cristal'); this.soma({ tipo: 'choque', x, y, t: 0, dur: 0.5, cor: '#ffb347', r: 18 }); } if (tipo === 'escudoGiraFim' && ch) pulso(ch.x, ch.y, 90, '#ffb347', 0.9); break;
      case 'salta': if (tipo === 'chefe' && ch) { pulso(ch.x, ch.y, 60, '#5cff9d', 0.7); this.solta(ch.x, ch.y, 10, '#5cff9d', 1, 'pixel'); } break;
      case 'ima': case 'braco': if (tipo === 'mira') pulso(x, y, 30, K.c1, 0.5); if (tipo === 'disparo' && b) this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.5, cor: K.c1, r: 0, d: [[b.x, b.y, 4], [b.x + b.vx * 0.12, b.y + b.vy * 0.12, 6], [b.x + b.vx * 0.25, b.y + b.vy * 0.25, 6]] }); break;
      case 'trem': if (tipo === 'porta' && d?.trilho) { for (let i = 0; i < 3; i++) this.solta(d.x + (i - 1) * 8, d.trilho[1] - 6, 4, '#dffff6', 0.5, 'bolha'); } break;
      case 'relogio': if (tipo === 'bumper' && d && Math.abs(d.y - 456) < 4 && d.x === 190) this.soma({ tipo: 'engrenagem', x: d.x, y: d.y, t: 0, dur: 1.4, cor: '#ffd27a', r: 58 }); break;
      case 'roda': if (tipo === 'rodaSolta') { const r = this.pecas().find(q => q.tipo === 'rodaGigante'); if (r) for (let i = 0; i < 5; i++) { const q = i / 5 * TAU; this.soma({ tipo: 'choque', x: r.x + Math.cos(q) * 50, y: r.y + Math.sin(q) * 50, t: -i * 0.08, dur: 0.6, cor: [K.c1, K.c2, K.c3][i % 3], r: 14 }); } this.solta(x, y, 20, K.c2, 1.4, 'confete'); } break;
      case 'salto': if (tipo === 'pouso') { pulso(x, y, 50, '#ff7a1a', 0.7); this.solta(x, y, 14, '#ffb02e', 1.2, 'brasa'); } break;
      case 'labirinto': if (tipo === 'labSaida') { pulso(x, y, 30, '#ffcc4d', 0.6); this.solta(x, y, 10, ['#e2572b', '#ffcc4d', '#38d6b0'][Math.floor(Math.random() * 3)], 0.9, 'grao'); } break;
      case 'aceleracao': if (tipo === 'orbita' && J) { const m = J.sigs[0]?.medidor?.() ?? 0; for (let i = 0; i < 2 + m * 5; i++) this.solta(x, y, 1, K.c1, 1.6, 'faisca'); } break;
      case 'vidro': if (tipo === 'alvo' && d?.vidasMax === 3) { this.solta(x, y, 10, '#e0fff6', 1.2, 'cristal'); this.soma({ tipo: 'choque', x: d.x, y: d.y, t: 0, dur: 0.45, cor: '#d8fbff', r: 14 }); } break;
      case 'caveira': if (tipo === 'boca') { pulso(x, y, 34, '#b6ff5c', 0.7); this.solta(x, y, 8, '#b6ff5c', 0.8, 'brasa'); } if (tipo === 'cano') this.solta(x, y, 12, '#b6ff5c', 1.2, 'brasa'); break;
      case 'pas': if (tipo === 'pas' && d && b) { arco(d.x, d.y, b.x, b.y, '#c8f1ff'); this.solta(b.x, b.y, 5, '#ffe35c', 1, 'faisca'); } break;
      case 'canhaoAndar': if (tipo === 'disparo') this.solta(x, y, 18, K.c1, 1.5, 'confete'); break;
      case 'prisma': if (tipo === 'prisma' && d) { ['#ff4d6d', '#4dff88', '#4da6ff'].forEach((k, i) => this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.6, cor: k, r: 0, d: [[d.x, d.y, 16], [d.x + (i - 1) * 40, d.y - 80, 20], [d.x + (i - 1) * 80, d.y - 170, 10]] })); } break;
      case 'poco': if (tipo === 'pocoCospe') { pulso(x, y, 40, '#ffe9a8', 0.6); this.solta(x, y, 14, '#ffe9a8', 1.1, 'grao'); } break;
      case 'cartas': if (tipo === 'banco') { pulso(x, y, 50, '#ffd9a0', 0.7); this.solta(x, y, 14, '#f2e2c0', 1.2, 'folha'); } break;
      case 'calor': if (GOLPES.includes(tipo) && J && (J.sigs[0]?.medidor?.() ?? 0) > 0.7) this.solta(x, y, 5, '#ff7a1a', 1, 'faisca'); break;
      case 'flores': if (tipo === 'flor' && d) { pulso(d.x, d.y, 34, '#ff8fc7', 0.7); this.solta(d.x, d.y, 14, '#ff8fc7', 1, 'petala'); } break;
      case 'elevador': if (tipo === 'elevador' && d && b) { const e = this.pecas().find(q => q.tipo === 'elevador'); const n = e?.niveis?.[d.nivel]; if (e && n) this.soma({ tipo: 'cometa', x, y, t: 0, dur: 0.7, cor: '#ffc24d', r: 0, d: [[e.x, e.y, 2], [e.x, (e.y + n[1]) / 2, 30], [n[0], n[1], 2]] }); } break;
      case 'serpente': if (tipo === 'rampaFechada' && d) { this.soma({ tipo: 'choque', x: d.mx, y: 394, t: 0, dur: 0.45, cor: '#37d67a', r: 18 }); this.solta(d.mx, 394, 6, '#d9b25c', 0.8, 'folha'); } break;
      case 'vinil': if (tipo === 'vinil' && d) { pulso(d.x, d.y, d.R + 12, '#ff9f43', 0.5); this.solta(x, y, 4, '#ff9f43', 0.8, 'nota'); } break;
      case 'gelo': if (tipo === 'chefe' || tipo === 'banco') { this.solta(x, y, 12, '#e6fbff', 1.2, 'cristal'); this.soma({ tipo: 'choque', x, y, t: 0, dur: 0.5, cor: '#e6fbff', r: 20 }); } break;
      case 'relampago': if (tipo === 'chefe' && ch && b) arco(ch.x, ch.y - 10, b.x, b.y, '#fff36b'); break;
    }
  }
  /** pagamento visual quando a assinatura pontua (anúncio real "assinatura"/"assinaturaTotal") */
  assinou(x: number, y: number, total: boolean) {
    const K = this.cores; this.soma({ tipo: 'pulso', x, y, t: 0, dur: total ? 1 : 0.6, cor: K.c1, r: total ? 110 : 50 });
    this.solta(x, y, total ? 18 : 8, K.c1, total ? 1.5 : 1);
    if (this.sig === 'relampago') this.soma({ tipo: 'arco', x: 190, y: 40, t: 0, dur: 0.35, cor: '#fff36b', r: 0, d: [x, y, Math.random() * 1000] });
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
      if (f.t < 0) continue; const u = f.t / f.dur, a = 1 - u;
      if (f.tipo === 'choque' || f.tipo === 'chefe') this.choqueEm(g, f.x, f.y, f.r * (1 + u * 1.6), f.tipo === 'chefe' ? 'raio' : this.choque, f.cor, a, u);
      else if (f.tipo === 'pulso') { const [X, Y, K] = g.p(f.x, f.y, 2), r = f.r * (0.2 + u * 0.8) * K; c.globalAlpha = a * 0.6; c.lineWidth = Math.max(1, 5 * a * K); c.strokeStyle = f.cor; c.beginPath(); c.ellipse(X, Y, r, r * 0.82, 0, 0, TAU); c.stroke(); c.globalAlpha = a * 0.12; c.fillStyle = f.cor; c.fill(); }
      else if (f.tipo === 'arco') { const [x1, y1, sd] = f.d, A = g.p(f.x, f.y, 14), B = g.p(x1, y1, 8); let s2 = sd; const rr = () => ((s2 = (s2 * 9301 + 49297) % 233280) / 233280 - 0.5); c.globalAlpha = a; c.strokeStyle = f.cor; c.lineWidth = 2 * a + 0.6; c.beginPath(); c.moveTo(A[0], A[1]); for (let k = 1; k < 7; k++) { const q = k / 7; c.lineTo(A[0] + (B[0] - A[0]) * q + rr() * 14, A[1] + (B[1] - A[1]) * q + rr() * 14); } c.lineTo(B[0], B[1]); c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.stroke(); }
      else if (f.tipo === 'engrenagem') { if (f.t < 0) continue; this.choqueEm(g, f.x, f.y, f.r, 'engrenagem', f.cor, Math.min(1, a * 1.5) * 0.7, f.t * 1.5); }
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
    switch (p.forma || this.particula) {
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
