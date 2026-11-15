// As peças de mesa. Um único conjunto, parametrizado pelos dados de cada máquina.
import { Bola, Campo, Circ, Dono, E_ALVO, E_BORRACHA, E_BUMPER, Peca, Seg, seg } from '../core/physics';
import { TAU, clamp, entre, rng } from '../core/vec';
import type { Gfx, Jogo } from './tipos';

const vel = (b: Bola) => Math.hypot(b.vx, b.vy);
const perto = (b: Bola, x: number, y: number, r: number) => { const dx = b.x - x, dy = b.y - y; return dx * dx + dy * dy < r * r; };

abstract class Base implements Peca {
  tipo = 'peca'; y = 0; flash = 0; vale = 0; z = 0;
  constructor(protected J: Jogo, protected C: Campo) {}
  update(dt: number) { if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 4); this.tick(dt); }
  protected tick(_dt: number) {}
  bateu(_b: Bola, _imp: number, _alvo?: any) {}
}

export class Bumper extends Base {
  tipo = 'bumper'; c: Circ; forca = 500;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public r = 17, public tom = 0) {
    super(J, C); this.y = y; this.c = { x, y, r, e: E_BUMPER, dono: this, invisivel: true }; C.circs.push(this.c);
  }
  bateu(b: Bola, imp: number) {
    if (imp < 30) return;
    const nx = (b.x - this.x), ny = (b.y - this.y), d = Math.hypot(nx, ny) || 1;
    b.vx += nx / d * this.forca; b.vy += ny / d * this.forca; this.flash = 1;
    this.J.ev('bumper', b, this);
  }
  desenhar(g: Gfx) {
    const f = this.flash, k = this.J.cores;
    g.cil(this.x, this.y, this.r * 0.72, 9, '#1a1d33', '#2a2f52');
    g.cil(this.x, this.y, this.r + f * 2, 16, k.c2, f > 0.3 ? '#ffffff' : k.c1);
    g.anel(this.x, this.y, this.r * 0.55, f > 0.3 ? k.c1 : '#ffffff', 2, 16.5, 0.9);
    if (f > 0) g.glow(this.x, this.y, this.r * (1.4 + f), k.c1, 16, f);
  }
  luzes(g: Gfx) { g.luz(this.x, this.y, this.r + 7, this.J.cores.c1, 0.25 + this.flash * 0.75); }
}

export class Estilingue extends Base {
  tipo = 'estilingue'; nx: number; ny: number;
  constructor(J: Jogo, C: Campo, public s: Seg, public lado: number) {
    super(J, C); s.dono = this; this.y = s.by; s.invisivel = true;
    const dx = s.bx - s.ax, dy = s.by - s.ay, L = Math.hypot(dx, dy);
    this.nx = dy / L * (lado > 0 ? 1 : -1) * Math.sign(dy || 1); this.ny = -Math.abs(dx) / L;
    this.nx = lado > 0 ? Math.abs(dy) / L : -Math.abs(dy) / L;
  }
  bateu(b: Bola, imp: number) {
    if (imp < 95) return;
    b.vx += this.nx * 520; b.vy += this.ny * 520; this.flash = 1; this.J.ev('sling', b, this);
  }
  desenhar(g: Gfx) {
    const s = this.s, k = this.J.cores, bx = s.ax, by = 624, f = this.flash;
    g.poli([[s.ax, s.ay, 10], [bx, by, 10], [s.bx, s.by, 10]], f > 0.2 ? k.c1 : '#151a30', 0.95);
    g.muro(s.ax, s.ay, s.bx, s.by, 10, f > 0.2 ? '#ffffff' : k.c2, 3 + f * 3);
    g.cil(s.ax, s.ay, 4, 12, k.c1); g.cil(s.bx, s.by, 4, 12, k.c1); g.cil(bx, by, 4, 12, k.c1);
    if (f > 0) g.glow((s.ax + s.bx) / 2, (s.ay + s.by) / 2, 30, k.c1, 10, f);
  }
}

export class AlvoFixo extends Base {
  tipo = 'alvoFixo'; s: Seg; vidas: number; volta = 0; aceso = false; indice = 0;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public ang: number, public vidasMax = 1, public rotulo = '') {
    super(J, C); this.y = y; this.vidas = vidasMax;
    const dx = Math.cos(ang) * 11, dy = Math.sin(ang) * 11;
    this.s = seg(x - dx, y - dy, x + dx, y + dy, E_ALVO, { dono: this, invisivel: true }); C.segs.push(this.s);
  }
  bateu(b: Bola, imp: number) {
    if (imp < 50) return;
    this.flash = 1;
    if (this.vidasMax > 1) { this.vidas--; if (this.vidas <= 0) { this.s.off = true; this.volta = 9; } }
    this.J.ev('alvo', b, this);
  }
  protected tick(dt: number) { if (this.volta > 0) { this.volta -= dt; if (this.volta <= 0) { this.s.off = false; this.vidas = this.vidasMax; } } }
  desenhar(g: Gfx) {
    if (this.s.off) return;
    const k = this.J.cores, s = this.s, cam = this.vidasMax > 1 ? this.vidas / this.vidasMax : 1;
    const cor = this.flash > 0.3 ? '#ffffff' : this.aceso ? k.c1 : k.c3;
    g.muro(s.ax, s.ay, s.bx, s.by, 5 + 7 * cam, cor, 4);
    if (this.flash > 0) g.glow(this.x, this.y, 18, k.c1, 8, this.flash);
  }
  luzes(g: Gfx) {
    const fx = this.x + Math.sin(this.ang) * 16, fy = this.y - Math.cos(this.ang) * 16 * Math.sign(Math.cos(this.ang) || 1);
    g.luz(fx, this.y + 16, 6, this.J.cores.c3, this.aceso ? 1 : this.vale ? (g.pisca(4) ? 1 : 0.2) : 0.12, this.rotulo);
  }
}

export class BancoDeQueda extends Base {
  tipo = 'bancoDeQueda'; alvos: Seg[] = []; sobe = 0;
  constructor(J: Jogo, C: Campo, public x: number, y: number, dx: number, dy: number, n = 3) {
    super(J, C); this.y = y;
    const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    for (let i = 0; i < n; i++) {
      const cx = x + dx * i, cy = y + dy * i;
      const s = seg(cx - ux * 7, cy - uy * 7, cx + ux * 7, cy + uy * 7, E_ALVO, { dono: this, invisivel: true });
      C.segs.push(s); this.alvos.push(s);
    }
  }
  bateu(b: Bola, imp: number, s: any) {
    if (imp < 45 || s.off) return;
    s.off = true; this.flash = 1; this.J.ev('queda', b, this);
    if (this.alvos.every(a => a.off)) { this.sobe = 1.2; this.J.ev('banco', b, this); }
  }
  protected tick(dt: number) { if (this.sobe > 0) { this.sobe -= dt; if (this.sobe <= 0) this.levanta(); } }
  levanta() { for (const a of this.alvos) a.off = false; }
  desenhar(g: Gfx) {
    const k = this.J.cores;
    for (const s of this.alvos) g.muro(s.ax, s.ay, s.bx, s.by, s.off ? 1 : 11, s.off ? '#222842' : this.flash > 0.4 ? '#fff' : k.c2, 4);
  }
  luzes(g: Gfx) { for (const s of this.alvos) g.luz((s.ax + s.bx) / 2 + 9, (s.ay + s.by) / 2 + 13, 5, this.J.cores.c2, s.off ? 1 : this.vale ? (g.pisca(3) ? 0.9 : 0.2) : 0.15); }
}

export class Rampa extends Base {
  tipo = 'rampa'; bloqueada = false; salto = false; caminho: number[][]; saiX: number; mx: number; my = 384;
  constructor(J: Jogo, C: Campo, public lado: number, cor: string) {
    super(J, C); const m = (x: number) => (lado > 0 ? x : 380 - x); this.mx = m(104); this.y = 400;
    C.parede([[m(54), 300], [m(118), 350], [m(122), 400]], 0.4, { cor, z: 20 });
    C.parede([[m(86), 326], [m(86), 440]], 0.4, { cor, z: 20 });
    C.parede([[m(54), 404], [m(86), 400]], 0.4, { cor, z: 20 });
    C.parede([[m(54), 300], [m(54), 440]], 0.45, { cor });
    this.caminho = [[m(104), 384, 2], [m(102), 350, 18], [m(84), 300, 26], [m(40), 300, 28], [m(34), 420, 26], [m(40), 540, 18], [m(70), 600, 4]];
    this.saiX = m(70);
  }
  colidir(b: Bola) {
    if (b.vy > -250 || b.y > 394 || b.y < 360 || Math.abs(b.x - this.mx) > 15) return;
    if (this.bloqueada) { b.vy = Math.abs(b.vy) * 0.5; this.J.ev('rampaFechada', b, this); return; }
    const v = Math.abs(b.vy); this.flash = 1;
    if (this.salto) {
      const m = (x: number) => (this.lado > 0 ? x : 380 - x);
      b.trilho = { p: [[this.mx, 384, 2], [m(120), 330, 30], [m(190), 250, 70], [m(260), 330, 40], [m(292), 470, 4]], t: 0, dur: 0.9, fim: o => { o.vx = this.lado * 60; o.vy = 260; this.J.ev('pouso', o, this); } };
    } else {
      b.trilho = { p: this.caminho, t: 0, dur: clamp(1500 / v, 0.85, 1.5), fim: o => { o.vx = 0; o.vy = 140; this.J.ev('rampaFim', o, this); } };
    }
    this.J.ev('rampa', b, this);
  }
  desenhar(g: Gfx) {
    const k = this.J.cores, p = this.caminho, a = this.flash > 0.2 ? 1 : 0.55;
    g.linha(p.map(q => [q[0] - 7, q[1], q[2]]), k.c2, 2, a); g.linha(p.map(q => [q[0] + 7, q[1], q[2]]), k.c2, 2, a);
    for (let i = 1; i < p.length - 1; i++) g.linha([[p[i][0], p[i][1], 0], [p[i][0], p[i][1], p[i][2]]], '#8890b8', 1.2, 0.5);
    if (this.bloqueada) g.muro(this.mx - 16, 394, this.mx + 16, 394, 14, '#ff3355', 4);
  }
  luzes(g: Gfx) {
    g.luz(this.mx, 424, 8, this.J.cores.c1, this.vale ? (g.pisca(5) ? 1 : 0.25) : 0.14, this.salto ? 'SALTO' : 'RAMPA');
    g.luz(this.mx + this.lado * 3, 446, 5, this.J.cores.c2, this.vale > 1 ? (g.pisca(8) ? 1 : 0.2) : 0.1);
  }
}

export class Orbita extends Base {
  tipo = 'orbita'; x: number;
  constructor(J: Jogo, C: Campo, public lado: number) { super(J, C); this.x = lado > 0 ? 37 : 343; this.y = 380; }
  colidir(b: Bola) {
    if (b.vy > -300 || b.y > 388 || b.y < 366 || Math.abs(b.x - this.x) > 17 || this.C.tempo - b.orbT < 1.5) return;
    b.orbT = this.C.tempo; this.flash = 1; this.J.ev('orbita', b, this);
  }
  luzes(g: Gfx) { g.luz(this.x, 470, 7, this.J.cores.c3, this.vale ? (g.pisca(5) ? 1 : 0.25) : 0.14 + this.flash, 'ÓRBITA'); }
}

export class Giro extends Base {
  tipo = 'giro'; energia = 0; ang = 0; meia = 0;
  constructor(J: Jogo, C: Campo, public x: number, y: number) { super(J, C); this.y = y; }
  colidir(b: Bola) { if (Math.abs(b.y - this.y) < 5 && Math.abs(b.x - this.x) < 17) this.energia = Math.max(this.energia, Math.abs(b.vy) / 28); }
  protected tick(dt: number) {
    if (this.energia <= 0.4) { this.energia = 0; return; }
    const d = this.energia * dt * 1.6; this.ang += d * TAU; this.meia += d * 2; this.energia *= Math.max(0, 1 - 1.5 * dt);
    while (this.meia >= 1) { this.meia -= 1; this.J.ev('giro', null, this); }
  }
  desenhar(g: Gfx) {
    const h = Math.abs(Math.cos(this.ang)) * 9 + 1;
    g.cil(this.x - 16, this.y, 2, 14, '#aab'); g.cil(this.x + 16, this.y, 2, 14, '#aab');
    g.poli([[this.x - 14, this.y, 12 - h], [this.x + 14, this.y, 12 - h], [this.x + 14, this.y, 12 + h], [this.x - 14, this.y, 12 + h]], Math.cos(this.ang) > 0 ? this.J.cores.c1 : this.J.cores.c3, 0.92);
  }
}

/** Buraco que segura a bola por um tempo e a devolve. Base de portal, trava, poço, boca etc. */
export class Captor extends Base {
  tipo = 'captor'; bola: Bola | null = null; t = 0; espera = 0.9; raio = 10; recarga = 0; ativo = true;
  vx = 0; vy = 300; vcap = 1200; evento = 'portal'; rotulo = '';
  constructor(J: Jogo, C: Campo, public x: number, y: number) { super(J, C); this.y = y; }
  colidir(b: Bola, _h?: number) {
    if (!this.ativo || this.bola || this.recarga > 0 || b.preso || b.trilho) return;
    if (perto(b, this.x, this.y, this.raio) && vel(b) < this.vcap) this.pega(b);
  }
  pega(b: Bola) {
    this.bola = b; b.preso = true; b.x = this.x; b.y = this.y; b.vx = b.vy = 0; this.t = this.espera; this.flash = 1;
    this.J.ev(this.evento, b, this);
  }
  /** recebe de volta uma bola que foi a outro campo */
  recebe(b: Bola, t = 0.5) { this.bola = b; b.preso = true; b.trilho = undefined; b.x = this.x; b.y = this.y; b.z = 0; b.vx = b.vy = 0; this.t = t; }
  protected tick(dt: number) {
    if (this.recarga > 0) this.recarga -= dt;
    const b = this.bola; if (!b) return;
    if (!this.C.bolas.includes(b)) { this.bola = null; return; }
    b.x = this.x; b.y = this.y; this.segura(dt);
    this.t -= dt; if (this.t <= 0) this.solta();
  }
  protected segura(_dt: number) {}
  solta() {
    const b = this.bola; if (!b) return;
    b.preso = false; b.z = 0; b.vx = this.vx + entre(-25, 25); b.vy = this.vy; b.parado = 0;
    this.bola = null; this.recarga = 0.7; this.J.som('saida');
  }
  desenhar(g: Gfx) {
    const k = this.J.cores;
    g.disco(this.x, this.y, this.raio + 3, '#000', 0.3, 0.9);
    g.anel(this.x, this.y, this.raio + 3, this.ativo ? k.c1 : '#445', 2.5, 0.6);
    if (this.flash > 0 || this.bola) g.glow(this.x, this.y, 22, k.c1, 2, 0.5 + this.flash * 0.5);
  }
  luzes(g: Gfx) { if (this.rotulo) g.luz(this.x, this.y + 26, 8, this.J.cores.c1, this.vale ? (g.pisca(4) ? 1 : 0.25) : 0.14, this.rotulo); }
}

export class Portal extends Captor { tipo = 'portal'; constructor(J: Jogo, C: Campo, x: number, y: number) { super(J, C, x, y); this.evento = 'portal'; this.rotulo = 'PORTAL'; this.vx = -70; this.vy = 260; } }
export class TravaDeBola extends Captor { tipo = 'travaDeBola'; constructor(J: Jogo, C: Campo, x: number, y: number) { super(J, C, x, y); this.evento = 'trava'; this.rotulo = 'TRAVA'; this.vx = 70; this.vy = 260; } }
export class TunelMagico extends Captor {
  tipo = 'tunelMagico';
  constructor(J: Jogo, C: Campo, x: number, y: number) { super(J, C, x, y); this.evento = 'tunel'; this.rotulo = 'TÚNEL'; this.vy = 240; this.raio = 11; }
  colidir(b: Bola) { this.ativo = this.J.andarAceso; super.colidir(b); }
  desenhar(g: Gfx) {
    super.desenhar(g);
    for (let i = 0; i < 3; i++) g.anel(this.x, this.y, 5 + ((g.t * 14 + i * 5) % 15), this.J.cores.c3, 1.5, 1 + i, this.ativo ? 0.8 : 0.2);
  }
}

export class Sensor extends Base {
  tipo = 'sensor'; ult = -9;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public r: number, public evento: string, public lado = 0, public rotulo = '') { super(J, C); this.y = y; }
  colidir(b: Bola) {
    if (!perto(b, this.x, this.y, this.r) || this.C.tempo - this.ult < 0.6) return;
    this.ult = this.C.tempo; this.flash = 1; this.J.ev(this.evento, b, this);
  }
  luzes(g: Gfx) { g.luz(this.x, this.y, 6, this.J.cores.c2, this.vale ? (g.pisca(4) ? 1 : 0.3) : 0.12 + this.flash, this.rotulo); }
}
export class CanaletaDeRetorno extends Sensor { tipo = 'canaletaDeRetorno'; constructor(J: Jogo, C: Campo, lado: number) { super(J, C, lado > 0 ? 70 : 310, 626, 13, 'retorno', lado); } }
export class CanaletaExterna extends Sensor {
  tipo = 'canaletaExterna';
  constructor(J: Jogo, C: Campo, lado: number) { super(J, C, lado > 0 ? 37 : 343, 664, 14, 'externa', lado); }
  colidir(b: Bola) { if (perto(b, this.x, this.y, this.r)) b.lateral = true; super.colidir(b); }
}

export class Resgate extends Base {
  tipo = 'resgate'; armado = false; x: number;
  constructor(J: Jogo, C: Campo, public lado: number) { super(J, C); this.x = lado > 0 ? 37 : 343; this.y = 712; }
  colidir(b: Bola) {
    if (!this.armado || b.y < 700 || b.y > 748 || Math.abs(b.x - this.x) > 18) return;
    b.x = this.x; b.vx = this.lado * 20; b.vy = -1280; b.lateral = false; this.armado = false; this.flash = 1; this.J.ev('resgate', b, this);
  }
  desenhar(g: Gfx) { g.cil(this.x, 728, 7, this.armado ? 8 : 3, this.armado ? this.J.cores.c1 : '#334', this.armado ? '#fff' : '#445'); }
  luzes(g: Gfx) { g.luz(this.x, 690, 7, '#7dffb0', this.armado ? (g.pisca(2) ? 1 : 0.6) : 0.1, 'RESGATE'); }
}

export class PosteCentral extends Base {
  tipo = 'posteCentral'; c: Circ; baixo = 0; cai = 0; forcado = false; tempoBaixo = 4; x = 190;
  constructor(J: Jogo, C: Campo) { super(J, C); this.y = 718; this.c = { x: 190, y: 718, r: 4.6, e: 0.85, dono: this, invisivel: true }; C.circs.push(this.c); }
  get recarga() { return this.baixo > 0 ? 1 - this.baixo / this.tempoBaixo : 1; }
  bateu(b: Bola, imp: number) {
    if (imp < 25) return;
    if (b.vy > -260) b.vy = -260 - imp * 0.3;
    if (this.cai <= 0) { this.cai = 0.6; this.flash = 1; this.J.ev('poste', b, this); }
  }
  protected tick(dt: number) {
    if (this.cai > 0) { this.cai -= dt; if (this.cai <= 0) this.baixo = this.tempoBaixo; }
    if (this.baixo > 0) this.baixo -= dt;
    const off = this.forcado || this.baixo > 0;
    if (this.c.off && !off) for (const b of this.C.bolas) if (perto(b, 190, 718, 13)) { b.vx += (b.x < 190 ? -1 : 1) * 190; b.vy -= 120; }
    this.c.off = off;
  }
  desenhar(g: Gfx) {
    if (this.c.off) { g.disco(190, 718, 5, '#111', 0.2); if (!this.forcado) g.anel(190, 718, 9, '#7dffb0', 2, 0.3, this.recarga); return; }
    g.cil(190, 718, 4.6, 11, '#7dffb0', '#ffffff');
  }
  luzes(g: Gfx) {
    if (!this.c.off || this.forcado) return;
    const n = Math.round(this.recarga * 10);
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / 10 * TAU; g.luz(190 + Math.cos(a) * 11, 718 + Math.sin(a) * 11, 1.6, '#7dffb0', 1); }
  }
}

/** Captor com mira: gira o ângulo e dispara quando o jogador aperta uma palheta. Base de ímã, canhão e braço. */
export class Mirador extends Captor {
  tipo = 'canhao'; mira = 0; a0 = -2.2; a1 = -0.9; vsai = 980; dir = 1; forma = 'canhao'; velMira = 1.6; armado = 0.25;
  constructor(J: Jogo, C: Campo, x: number, y: number) { super(J, C, x, y); this.espera = 3.2; this.evento = 'mira'; this.mira = this.a0; this.raio = 11; }
  protected segura(dt: number) {
    this.mira += this.dir * this.velMira * dt;
    if (this.mira > this.a1) { this.mira = this.a1; this.dir = -1; } if (this.mira < this.a0) { this.mira = this.a0; this.dir = 1; }
    const b = this.bola!;
    if (this.forma !== 'canhao') { b.x = this.x + Math.cos(this.mira) * 22; b.y = this.y + Math.sin(this.mira) * 22; b.z = this.forma === 'braco' ? 14 : 8; }
    this.armado -= dt;
    if (this.armado <= 0 && (this.J.botE || this.J.botD)) this.t = 0;
  }
  pega(b: Bola) { super.pega(b); this.armado = 0.25; }
  solta() {
    const b = this.bola; if (!b) return;
    b.x = this.x + Math.cos(this.mira) * 16; b.y = this.y + Math.sin(this.mira) * 16;
    super.solta(); b.vx = Math.cos(this.mira) * this.vsai; b.vy = Math.sin(this.mira) * this.vsai;
    this.recarga = 1.2; this.J.ev('disparo', b, this);
  }
  desenhar(g: Gfx) {
    const k = this.J.cores, m = this.mira, cx = Math.cos(m), cy = Math.sin(m);
    if (this.forma === 'ima') {
      g.cil(this.x, this.y, 12, 6, '#2b2f55', this.bola ? k.c1 : '#44497a');
      for (let i = 0; i < 3; i++) g.anel(this.x, this.y, 14 + ((g.t * 20 + i * 8) % 24), k.c1, 1.5, 1, 0.35);
    } else if (this.forma === 'braco') {
      g.cil(this.x, this.y, 9, 12, '#3a3f66', k.c2);
      g.linha([[this.x, this.y, 13], [this.x + cx * 12, this.y + cy * 12, 22], [this.x + cx * 22, this.y + cy * 22, 15]], '#cfd4ff', 4);
      g.cil(this.x + cx * 22, this.y + cy * 22, 3, 16, k.c1);
    } else {
      g.cil(this.x, this.y, 13, 8, '#2b2f55', '#44497a');
      g.linha([[this.x, this.y, 10], [this.x + cx * 26, this.y + cy * 26, 12]], k.c2, 9); g.linha([[this.x, this.y, 12], [this.x + cx * 26, this.y + cy * 26, 14]], '#fff', 2, 0.6);
    }
    if (this.bola) for (let i = 2; i < 7; i++) g.disco(this.x + cx * i * 16, this.y + cy * i * 16, 2, '#fff', 4, 0.75 - i * 0.09);
  }
}
export class Canhao extends Mirador { tipo = 'canhao'; rotulo = 'CANHÃO'; }
export class BracoRobotico extends Mirador { tipo = 'bracoRobotico'; constructor(J: Jogo, C: Campo, x: number, y: number) { super(J, C, x, y); this.forma = 'braco'; this.a0 = -2.7; this.a1 = -0.45; this.rotulo = 'BRAÇO'; } }
export class Ima extends Mirador {
  tipo = 'imã'; alcance = 60; forca = 520; agarra = true;
  constructor(J: Jogo, C: Campo, x: number, y: number) { super(J, C, x, y); this.forma = 'ima'; this.a0 = -2.6; this.a1 = -0.55; this.vcap = 520; this.rotulo = 'ÍMÃ'; }
  colidir(b: Bola, h = 0) {
    if (!b.preso && this.recarga <= 0 && perto(b, this.x, this.y, this.alcance)) {
      const dx = this.x - b.x, dy = this.y - b.y, d = Math.hypot(dx, dy) || 1; b.vx += dx / d * this.forca * h; b.vy += dy / d * this.forca * h;
    }
    if (this.agarra) super.colidir(b);
  }
}

export class AlvoGiratorio extends Base {
  tipo = 'alvoGiratorio'; cs: (Circ & { vidas: number; est: number })[] = []; ang = 0; trilho?: number[][]; volta = 0; evento = 'giratorio'; forma = 'escudo';
  constructor(J: Jogo, C: Campo, public x: number, y: number, public raio: number, n: number, public vel = 1.2, public vidas = 1) {
    super(J, C); this.y = y;
    for (let i = 0; i < n; i++) { const c: any = { x, y, r: 8, e: E_ALVO, dono: this, invisivel: true, vidas, est: 1 }; this.cs.push(c); C.circs.push(c); }
    this.tick(0);
  }
  get vivos() { return this.cs.filter(c => !c.off).length; }
  bateu(b: Bola, imp: number, c: any) {
    if (imp < 40) return;
    c.vidas--; this.flash = 1; const quebrou = c.vidas <= 0;
    if (quebrou) c.off = true;
    this.J.ev(this.evento, b, { peca: this, c, quebrou, x: c.x, y: c.y });
    if (this.vivos === 0) { this.volta = 10; this.J.ev(this.evento + 'Fim', b, this); }
  }
  renasce() { for (const c of this.cs) { c.off = false; c.vidas = this.vidas; } this.volta = 0; }
  protected tick(dt: number) {
    this.ang += this.vel * dt; const n = this.cs.length;
    this.cs.forEach((c, i) => {
      const x0 = c.x, y0 = c.y;
      if (this.trilho) {
        const p = this.trilho, m = p.length - 1; let u = ((this.ang * 0.16 + i / n) % 2 + 2) % 2; if (u > 1) u = 2 - u;
        const f = u * m, j = Math.min(m - 1, Math.floor(f)), t = f - j; c.x = p[j][0] + (p[j + 1][0] - p[j][0]) * t; c.y = p[j][1] + (p[j + 1][1] - p[j][1]) * t;
      } else { const a = this.ang + i / n * TAU; c.x = this.x + Math.cos(a) * this.raio; c.y = this.y + Math.sin(a) * this.raio * 0.92; }
      if (dt > 0) { c.lvx = (c.x - x0) / dt; c.lvy = (c.y - y0) / dt; }
    });
    if (this.volta > 0) { this.volta -= dt; if (this.volta <= 0) this.renasce(); }
  }
  desenhar(g: Gfx) {
    const k = this.J.cores;
    if (this.trilho) g.linha(this.trilho.map(p => [p[0], p[1], 1]), k.c3, 1.5, 0.35);
    for (const c of this.cs) {
      if (c.off) continue;
      if (this.forma === 'criatura') {
        const r = 5 + c.est * 2; g.cil(c.x, c.y, r, 6 + c.est * 3, k.c2, c.est > 2 ? '#fff' : k.c1);
        g.disco(c.x - 2.5, c.y, 1.3, '#000', 8 + c.est * 3); g.disco(c.x + 2.5, c.y, 1.3, '#000', 8 + c.est * 3);
      } else g.cil(c.x, c.y, c.r, 12, k.c3, c.vidas > 1 ? '#fff' : k.c1);
      g.glow(c.x, c.y, 13, k.c1, 10, 0.35);
    }
  }
}

export class Esteira extends Base {
  tipo = 'esteira'; controlavel = false; dir = 1;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public w: number, public h: number, public ax: number, public ay: number) { super(J, C); this.y = y; }
  colidir(b: Bola, h: number) {
    if (Math.abs(b.x - this.x) > this.w / 2 || Math.abs(b.y - this.y) > this.h / 2) return;
    if (this.controlavel) this.dir = this.J.botE && !this.J.botD ? -1 : this.J.botD && !this.J.botE ? 1 : 0;
    b.vx += this.ax * this.dir * h; b.vy += this.ay * h;
  }
  luzes(g: Gfx) {
    const k = this.J.cores, x0 = this.x - this.w / 2, y0 = this.y - this.h / 2;
    g.poli([[x0, y0, 0], [x0 + this.w, y0, 0], [x0 + this.w, y0 + this.h, 0], [x0, y0 + this.h, 0]], '#0b1026', 0.75);
    for (let i = 0; i < 6; i++) {
      const u = ((i / 6 + g.t * 0.5 * (this.dir || 0.0001)) % 1 + 1) % 1, x = x0 + u * this.w;
      g.linha([[x, y0 + 3, 0], [x + 6 * (this.dir || 1), this.y, 0], [x, y0 + this.h - 3, 0]], k.c1, 2, 0.6);
    }
  }
}

export class Elevador extends Captor {
  tipo = 'elevador'; nivel = 0;
  constructor(J: Jogo, C: Campo, x: number, y: number, public niveis: number[][]) { super(J, C, x, y); this.evento = 'elevadorEntra'; this.espera = 0.5; this.rotulo = 'ELEVADOR'; }
  solta() {
    const b = this.bola; if (!b) return; const n = this.niveis[this.nivel % this.niveis.length]; const nv = this.nivel % this.niveis.length; this.nivel++;
    this.bola = null; this.recarga = 1.5; b.preso = false;
    b.trilho = { p: [[this.x, this.y, 0], [this.x, this.y, 46], [n[0], n[1], 46], [n[0], n[1], 2]], t: 0, dur: 1.5, fim: o => { o.vx = n[2] || 0; o.vy = n[3] || 200; this.J.ev('elevador', o, { peca: this, nivel: nv }); } };
  }
  desenhar(g: Gfx) {
    super.desenhar(g); const k = this.J.cores;
    for (const s of [-1, 1]) g.linha([[this.x + s * 12, this.y, 0], [this.x + s * 12, this.y, 50]], '#99a', 2);
    this.niveis.forEach((n, i) => { g.anel(n[0], n[1], 9, k.c2, 2, 0.4, 0.7); g.txt(n[0], n[1] + 3, String(i + 1), k.c1, 9, 0.5); });
  }
}

export class BolaCativa extends Base {
  tipo = 'bolaCativa'; c: Circ; u = 0; vu = 0;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public dx: number, public dy: number, public curso = 46) {
    super(J, C); this.y = y; this.c = { x, y, r: 7, e: 0.2, dono: this, invisivel: true }; C.circs.push(this.c);
    const px = -dy, py = dx; // canaleta que guia a bola cativa
    C.parede([[x + px * 10, y + py * 10], [x + dx * (curso + 12) + px * 10, y + dy * (curso + 12) + py * 10], [x + dx * (curso + 12) - px * 10, y + dy * (curso + 12) - py * 10], [x - px * 10, y - py * 10]], 0.4, { cor: J.cores.c3, z: 8 });
  }
  bateu(b: Bola, imp: number) { const along = -(b.x - this.c.x) * this.dx - (b.y - this.c.y) * this.dy; if (imp > 60 && along > 0) { this.vu = Math.max(this.vu, imp * 0.9); this.J.som('alvo', 0.6); } }
  protected tick(dt: number) {
    this.u += this.vu * dt; this.vu -= 700 * dt;
    if (this.u >= this.curso) { this.u = this.curso; if (this.vu > 0) { this.flash = 1; this.J.ev('cativa', null, this); this.vu = -this.vu * 0.4; } }
    if (this.u <= 0) { this.u = 0; if (this.vu < 0) this.vu = 0; }
    this.c.x = this.x + this.dx * this.u; this.c.y = this.y + this.dy * this.u;
  }
  desenhar(g: Gfx) {
    g.disco(this.c.x, this.c.y + 2, 7, '#000', 0, 0.4); g.cil(this.c.x, this.c.y, 6.5, 6, '#aab4d8', '#ffffff');
    const ex = this.x + this.dx * (this.curso + 9), ey = this.y + this.dy * (this.curso + 9);
    g.cil(ex, ey, 5, 10, this.flash > 0.2 ? '#fff' : this.J.cores.c1);
  }
}

export class RodaGigante extends Base {
  tipo = 'rodaGigante'; ang = 0; cab: (Bola | null)[]; tempo = 0; c: Circ; w = 0.9; cheia = 3;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public R = 40, n = 5) {
    super(J, C); this.y = y; this.cab = new Array(n).fill(null); this.c = { x, y, r: 9, e: 0.5, invisivel: true }; C.circs.push(this.c);
  }
  pos(i: number): [number, number] { const a = this.ang + i / this.cab.length * TAU; return [this.x + Math.cos(a) * this.R, this.y + Math.sin(a) * this.R]; }
  get presas() { return this.cab.filter(Boolean).length; }
  colidir(b: Bola) {
    if (b.preso || b.trilho || this.tempo < 0) return;
    for (let i = 0; i < this.cab.length; i++) {
      if (this.cab[i]) continue; const [x, y] = this.pos(i);
      if (perto(b, x, y, 10) && vel(b) < 1000) { this.cab[i] = b; b.preso = true; b.vx = b.vy = 0; this.tempo = 7; this.flash = 1; this.J.ev('roda', b, this); return; }
    }
  }
  protected tick(dt: number) {
    this.ang += this.w * dt; if (this.tempo < 0) this.tempo += dt;
    this.cab.forEach((b, i) => { if (!b) return; if (!this.C.bolas.includes(b)) { this.cab[i] = null; return; } const [x, y] = this.pos(i); b.x = x; b.y = y; b.z = 10; });
    if (this.presas > 0) { this.tempo -= dt; if (this.tempo <= 0 || this.presas >= this.cheia) this.soltaTudo(); }
  }
  soltaTudo() {
    const n = this.presas;
    this.cab.forEach((b, i) => { if (!b) return; b.preso = false; b.z = 0; b.vx = entre(-220, 220); b.vy = entre(120, 320); b.parado = 0; this.cab[i] = null; });
    this.tempo = -1.5; this.J.ev('rodaSolta', null, { peca: this, n });
  }
  desenhar(g: Gfx) {
    const k = this.J.cores;
    g.anel(this.x, this.y, this.R, k.c2, 3, 10, 0.9); g.cil(this.x, this.y, 9, 14, k.c3, k.c1);
    for (let i = 0; i < this.cab.length; i++) {
      const [x, y] = this.pos(i); g.linha([[this.x, this.y, 12], [x, y, 10]], k.c2, 1.5, 0.6);
      g.anel(x, y, 9, this.cab[i] ? '#fff' : k.c1, 2.5, 10); if (!this.cab[i]) g.disco(x, y, 7, '#000', 9, 0.45);
    }
  }
}

export class RodaDeVinil extends Base {
  tipo = 'rodaDeVinil'; ang = 0; w = 5; fase = 0; ult = -9;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public R = 44) { super(J, C); this.y = y; }
  colidir(b: Bola, h: number) {
    const dx = b.x - this.x, dy = b.y - this.y; if (dx * dx + dy * dy > this.R * this.R) return;
    const sx = -this.w * dy, sy = this.w * dx, k = Math.min(1, 5 * h); b.vx += (sx - b.vx) * k; b.vy += (sy - b.vy) * k - this.C.g * h * 0.6;
    if (this.C.tempo - this.ult > 1.2) { this.ult = this.C.tempo; this.flash = 1; this.J.ev('vinil', b, this); }
  }
  protected tick(dt: number) { this.fase += dt; this.w = 6.5 * Math.sin(this.fase * 0.7) + (Math.sin(this.fase * 0.7) >= 0 ? 2.5 : -2.5); this.ang += this.w * dt; }
  luzes(g: Gfx) {
    const k = this.J.cores; g.disco(this.x, this.y, this.R, '#07080f', 0, 0.95);
    for (let r = this.R - 4; r > 14; r -= 6) g.anel(this.x, this.y, r, '#1c2038', 1.2);
    g.disco(this.x, this.y, 13, k.c1); g.disco(this.x, this.y, 2.5, '#000');
    for (let i = 0; i < 3; i++) { const a = this.ang + i * TAU / 3; g.linha([[this.x + Math.cos(a) * 15, this.y + Math.sin(a) * 15, 0], [this.x + Math.cos(a) * (this.R - 3), this.y + Math.sin(a) * (this.R - 3), 0]], k.c2, 2, 0.7); }
  }
}

/** Parede que abre e fecha, ou bloco que percorre um trilho empurrando a bola pela velocidade da superfície. */
export class PortaMovel extends Base {
  tipo = 'portaMovel'; ss: Seg[] = []; fechada = true; ciclo = 0; t = 0; u = 0; dir = 1; trilho?: number[]; velT = 70; meiaL = 20; x = 0; evento = 'porta';
  constructor(J: Jogo, C: Campo, public ax: number, public ay: number, public bx: number, public by: number, trilho?: number[]) {
    super(J, C); this.y = Math.max(ay, by); this.trilho = trilho;
    const n = trilho ? 4 : 1; for (let i = 0; i < n; i++) { const s = seg(ax, ay, bx, by, 0.5, { dono: this, invisivel: true }); this.ss.push(s); C.segs.push(s); }
    if (trilho) this.tick(0);
  }
  bateu(b: Bola, imp: number) { if (imp > 60) { this.flash = 1; this.J.ev(this.evento, b, this); } }
  set(fechada: boolean) { this.fechada = fechada; if (!this.trilho) this.ss[0].off = !fechada; }
  protected tick(dt: number) {
    if (this.trilho) {
      const [x0, y0, x1, y1] = this.trilho, L = Math.hypot(x1 - x0, y1 - y0);
      this.u += this.dir * this.velT * dt / L; if (this.u > 1) { this.u = 1; this.dir = -1; } if (this.u < 0) { this.u = 0; this.dir = 1; }
      const cx = x0 + (x1 - x0) * this.u, cy = y0 + (y1 - y0) * this.u, ux = (x1 - x0) / L, uy = (y1 - y0) / L, w = this.meiaL, hh = 8;
      const q = [[-w, -hh], [w, -hh], [w, hh], [-w, hh]].map(([a, b]) => [cx + ux * a - uy * b, cy + uy * a + ux * b]);
      this.ss.forEach((s, i) => { const a = q[i], b = q[(i + 1) % 4]; s.ax = a[0]; s.ay = a[1]; s.bx = b[0]; s.by = b[1]; s.lvx = ux * this.velT * this.dir; s.lvy = uy * this.velT * this.dir; s.off = !this.fechada; });
      this.x = cx; this.y = cy + hh;
    } else if (this.ciclo > 0) { this.t += dt; if (this.t > this.ciclo) { this.t = 0; this.set(!this.fechada); } }
  }
  desenhar(g: Gfx) {
    const k = this.J.cores;
    if (this.trilho) {
      if (!this.fechada) return; const s = this.ss;
      g.poli(s.map(q => [q.ax, q.ay, 14]), this.flash > 0.2 ? '#fff' : k.c2, 0.95);
      for (const q of s) g.muro(q.ax, q.ay, q.bx, q.by, 14, k.c3, 2);
      g.glow(s[0].ax + (s[1].ax - s[0].ax) * (this.dir > 0 ? 1 : 0), s[0].ay, 10, '#fff', 12, 0.8);
    } else if (this.fechada) g.muro(this.ax, this.ay, this.bx, this.by, 13, this.flash > 0.2 ? '#fff' : k.c1, 4);
    else { g.cil(this.ax, this.ay, 2.5, 13, k.c3); g.cil(this.bx, this.by, 2.5, 13, k.c3); }
  }
  luzes(g: Gfx) { if (this.trilho) { const t = this.trilho; g.linha([[t[0], t[1], 0], [t[2], t[3], 0]], '#667', 5, 0.35); g.linha([[t[0], t[1], 0], [t[2], t[3], 0]], '#99a', 1, 0.6); } }
}

export class PocoDeAreia extends Captor {
  tipo = 'pocoDeAreia'; R = 34;
  constructor(J: Jogo, C: Campo, x: number, y: number) { super(J, C, x, y); this.espera = 3; this.evento = 'poco'; this.vy = -620; this.vcap = 260; this.raio = 12; this.rotulo = 'POÇO'; }
  colidir(b: Bola, h = 0) {
    if (!b.preso && this.recarga <= 0 && perto(b, this.x, this.y, this.R)) {
      const k = Math.max(0, 1 - 5 * h); b.vx *= k; b.vy *= k; b.vy -= this.C.g * h * 0.8;
      b.vx += (this.x - b.x) * 22 * h; b.vy += (this.y - b.y) * 22 * h;
    }
    super.colidir(b);
  }
  protected segura() { if (this.bola) this.bola.z = -6 * (1 - Math.abs(this.t / this.espera * 2 - 1)); }
  solta() { const b = this.bola; super.solta(); if (b) { b.vx = entre(-260, 260); this.recarga = 1.6; this.J.ev('pocoCospe', b, this); } }
  luzes(g: Gfx) {
    for (let i = 0; i < 5; i++) { const r = this.R * (1 - i / 5); g.disco(this.x + Math.cos(g.t * 2 + i) * 2, this.y + Math.sin(g.t * 2 + i) * 2, r, i % 2 ? '#c9a45a' : '#a8833e', 0, 0.9); }
    super.luzes(g);
  }
  desenhar(g: Gfx) { if (this.bola) g.glow(this.x, this.y, 20, '#ffe9a8', 2, 0.6); }
}

export class BocaQueEngole extends Captor {
  tipo = 'bocaQueEngole'; canos: number[][]; ult = 0; forma = 'boca';
  constructor(J: Jogo, C: Campo, x: number, y: number, canos: number[][]) { super(J, C, x, y); this.canos = canos; this.espera = 0.8; this.evento = 'boca'; this.raio = 13; this.rotulo = 'BOCA'; }
  solta() {
    const b = this.bola; if (!b) return; const i = Math.floor(rng() * this.canos.length) % this.canos.length, cn = this.canos[i]; this.ult = i;
    this.bola = null; this.recarga = 1.2; b.preso = false;
    b.trilho = { p: [[this.x, this.y, -12], [(this.x + cn[0]) / 2, (this.y + cn[1]) / 2, -12], [cn[0], cn[1], -12], [cn[0], cn[1], 2]], t: 0, dur: 0.8, fim: o => { o.vx = cn[2]; o.vy = cn[3]; this.J.ev('cano', o, { peca: this, i }); } };
  }
  desenhar(g: Gfx) {
    const k = this.J.cores, ab = this.bola ? 0.3 : 0.6 + Math.sin(g.t * 3) * 0.25;
    g.cil(this.x, this.y, 17, 9, this.forma === 'caveira' ? '#d9dbe8' : k.c3, this.forma === 'caveira' ? '#f4f5ff' : k.c2);
    g.disco(this.x, this.y + 3, 11 * ab + 2, '#000', 9.5, 0.95);
    g.disco(this.x - 6, this.y - 7, 3, this.forma === 'caveira' ? '#000' : '#fff', 10); g.disco(this.x + 6, this.y - 7, 3, this.forma === 'caveira' ? '#000' : '#fff', 10);
    this.canos.forEach((cn, i) => { g.cil(cn[0], cn[1], 8, 7, '#39406b', this.ult === i && this.flash > 0 ? '#fff' : '#111'); });
  }
}

export class PasDeMoinho extends Base {
  tipo = 'pasDeMoinho'; ss: Seg[] = []; ang = 0; w = 2.4; fase = 0; variavel = true;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public R = 38, n = 3) {
    super(J, C); this.y = y; C.circs.push({ x, y, r: 6, e: 0.5, invisivel: true });
    for (let i = 0; i < n; i++) { const s = seg(x, y, x, y, 0.55, { dono: this, invisivel: true, px: x, py: y }); this.ss.push(s); C.segs.push(s); }
    this.tick(0);
  }
  bateu(b: Bola, imp: number) { if (imp > 80) { this.flash = 1; this.J.ev('pas', b, this); } }
  protected tick(dt: number) {
    this.fase += dt; if (this.variavel) this.w = 2.6 + 1.8 * Math.sin(this.fase * 0.9);
    this.ang += this.w * dt;
    this.ss.forEach((s, i) => { const a = this.ang + i / this.ss.length * TAU; s.ax = this.x + Math.cos(a) * 8; s.ay = this.y + Math.sin(a) * 8; s.bx = this.x + Math.cos(a) * this.R; s.by = this.y + Math.sin(a) * this.R; s.w = this.w; });
  }
  desenhar(g: Gfx) {
    const k = this.J.cores;
    for (const s of this.ss) { g.muro(s.ax, s.ay, s.bx, s.by, 12, this.flash > 0.3 ? '#fff' : k.c2, 4); }
    g.cil(this.x, this.y, 7, 15, k.c3, k.c1);
  }
}

/** Buracos que abrem e fecham (flores, alçapões). */
export class Flor extends Captor {
  tipo = 'flor'; fase: number; aberta = true;
  constructor(J: Jogo, C: Campo, x: number, y: number, fase = 0) { super(J, C, x, y); this.fase = fase; this.evento = 'flor'; this.espera = 1.1; this.vy = -420; this.raio = 11; }
  protected tick(dt: number) { this.fase += dt; this.aberta = (this.fase % 7) < 4.2; this.ativo = this.aberta; super.tick(dt); }
  solta() { const b = this.bola; super.solta(); if (b) b.vx = entre(-200, 200); }
  desenhar(g: Gfx) {
    const k = this.J.cores, ab = this.aberta ? 1 : 0.25;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + this.fase * 0.2; g.disco(this.x + Math.cos(a) * 12 * ab, this.y + Math.sin(a) * 12 * ab, 7, i % 2 ? k.c1 : k.c2, 1.5, 0.9); }
    g.disco(this.x, this.y, this.aberta ? 9 : 5, this.aberta ? '#000' : k.c3, 2, 0.95);
    if (this.bola) g.glow(this.x, this.y, 20, k.c1, 3, 0.7);
  }
}

export class Faixas extends Base {
  tipo = 'faixas'; xs = [150, 190, 230]; acesas = [false, false, false]; ult = [-9, -9, -9]; certeira = -1;
  constructor(J: Jogo, C: Campo, cor: string) {
    super(J, C); this.y = 96;
    for (const x of [130, 170, 210, 250]) { C.parede([[x, 84], [x, 106]], 0.4, { cor, z: 9 }); C.circs.push({ x, y: 84, r: 2.5, e: 0.5, invisivel: true }); C.circs.push({ x, y: 106, r: 2.5, e: 0.5, invisivel: true }); }
  }
  colidir(b: Bola) {
    if (Math.abs(b.y - 96) > 8) return;
    for (let i = 0; i < 3; i++) if (Math.abs(b.x - this.xs[i]) < 12 && this.C.tempo - this.ult[i] > 0.8) {
      this.ult[i] = this.C.tempo; const nova = !this.acesas[i]; this.acesas[i] = true; this.flash = 1;
      this.J.ev('faixa', b, { i, nova, certeira: this.certeira === i });
      if (this.acesas.every(Boolean)) { this.acesas = [false, false, false]; this.J.ev('faixas', b, this); }
    }
  }
  luzes(g: Gfx) { for (let i = 0; i < 3; i++) g.luz(this.xs[i], 96, 7, this.certeira === i ? '#ffffff' : this.J.cores.c1, this.certeira === i ? (g.pisca(6) ? 1 : 0.2) : this.acesas[i] ? 1 : 0.15); }
}

export interface ChefeForma { tipo: string; pontas: number; olhos: number; cor?: string; extra?: string }
export class Chefe extends Base {
  tipo = 'chefe'; c: Circ; vida = 3; fase = 0; morto = 0; imune = 0; protegido = false; dor = 0; x0: number; y0: number; modo = 'fixo'; fx_ = 0; r = 22;
  constructor(J: Jogo, C: Campo, public x: number, y: number, public forma: ChefeForma, modo = 'fixo') {
    super(J, C); this.y = y; this.x0 = x; this.y0 = y; this.modo = modo; this.c = { x, y, r: 22, e: 0.55, dono: this, invisivel: true }; C.circs.push(this.c);
  }
  bateu(b: Bola, imp: number) {
    if (imp < 90 || this.imune > 0) return;
    const nx = b.x - this.x, ny = b.y - this.y, d = Math.hypot(nx, ny) || 1; b.vx += nx / d * 240; b.vy += ny / d * 240;
    this.imune = 0.3; this.flash = 1;
    if (this.protegido) { this.J.ev('escudo', b, this); return; }
    this.dor = 1; this.J.ev('chefe', b, this);
  }
  salta() { this.x = this.x0 + entre(-70, 70); this.y = this.y0 + entre(-30, 50); }
  some(t: number) { this.morto = t; this.c.off = true; }
  protected tick(dt: number) {
    this.fx_ += dt; if (this.imune > 0) this.imune -= dt; if (this.dor > 0) this.dor = Math.max(0, this.dor - dt * 2);
    if (this.morto > 0) { this.morto -= dt; if (this.morto <= 0) { this.c.off = false; this.x = this.x0; this.y = this.y0; this.J.ev('chefeVolta', null, this); } }
    if (this.modo === 'vaga') { this.x = this.x0 + Math.sin(this.fx_ * 0.8) * 44; }
    if (this.modo === 'orbita') { this.x = this.x0 + Math.cos(this.fx_ * 0.7) * 30; this.y = this.y0 + Math.sin(this.fx_ * 0.7) * 18; }
    this.c.x = this.x; this.c.y = this.y;
  }
  desenhar(g: Gfx) {
    if (this.c.off) return;
    const [sx, sy, k] = g.p(this.x, this.y, 16), c = g.c, cs = this.J.cores;
    g.disco(this.x, this.y + 3, 24, '#000', 0, 0.45);
    g.cil(this.x, this.y, 22, 14, cs.c3, cs.c3);
    c.save(); c.translate(sx, sy); c.scale(k * 24, k * 24); desenhaChefe(c, this.forma, cs, g.t, this.dor, this.protegido); c.restore();
    g.glow(this.x, this.y, 40, this.dor > 0.2 ? '#ffffff' : cs.c1, 14, 0.35 + this.dor * 0.6);
  }
  luzes(g: Gfx) { for (let i = 0; i < this.vida; i++) g.luz(this.x - (this.vida - 1) * 7 + i * 14, this.y + 38, 4.5, '#ff5577', g.pisca(2 + i) ? 1 : 0.6); }
}

/** Desenho paramétrico do chefe em espaço unitário (raio 1). Usado na mesa e no retrato do painel. */
export function desenhaChefe(c: CanvasRenderingContext2D, f: ChefeForma, cs: { c1: string; c2: string; c3: string }, t: number, dor: number, escudo = false) {
  const n = f.pontas, pulso = 1 + Math.sin(t * 3) * 0.04 + dor * 0.12;
  c.save(); c.scale(pulso, pulso); c.lineJoin = 'round';
  const corpo = dor > 0.3 ? '#ffffff' : (f.cor || cs.c1);
  const estrela = (ri: number, ro: number, rot: number) => { c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? ri : ro; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); };
  if (f.tipo === 'estrela') { c.fillStyle = cs.c2; estrela(0.62, 1.12, t * 0.6); c.fill(); c.fillStyle = corpo; estrela(0.5, 0.92, -t * 0.4); c.fill(); }
  else if (f.tipo === 'globo') { c.fillStyle = corpo; c.beginPath(); c.arc(0, 0, 0.95, 0, TAU); c.fill(); c.strokeStyle = cs.c3; c.lineWidth = 0.05; for (let i = 1; i < n; i++) { const x = -0.95 + i * 1.9 / n; c.beginPath(); c.ellipse(0, 0, Math.abs(x), 0.95, 0, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(-0.95, x); c.lineTo(0.95, x); c.stroke(); } }
  else if (f.tipo === 'engrenagem') { c.fillStyle = cs.c2; c.save(); c.rotate(t * 0.8); for (let i = 0; i < n; i++) { c.rotate(TAU / n); c.fillRect(-0.16, -1.15, 0.32, 0.4); } c.restore(); c.fillStyle = corpo; c.beginPath(); c.arc(0, 0, 0.86, 0, TAU); c.fill(); }
  else if (f.tipo === 'tentaculos') { c.strokeStyle = cs.c2; c.lineWidth = 0.17; c.lineCap = 'round'; for (let i = 0; i < n; i++) { const a = i / n * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 0.5, Math.sin(a) * 0.5); c.quadraticCurveTo(Math.cos(a + 0.5) * 1.0, Math.sin(a + 0.5) * 1.0, Math.cos(a + Math.sin(t * 2 + i) * 0.5) * 1.3, Math.sin(a + Math.sin(t * 2 + i) * 0.5) * 1.3); c.stroke(); } c.fillStyle = corpo; c.beginPath(); c.arc(0, 0, 0.72, 0, TAU); c.fill(); }
  else if (f.tipo === 'cristal') { c.fillStyle = cs.c2; estrela(0.75, 1.1, Math.PI / n); c.fill(); c.fillStyle = corpo; c.beginPath(); for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2; c.lineTo(Math.cos(a) * 0.85, Math.sin(a) * 0.85); } c.closePath(); c.fill(); c.strokeStyle = '#ffffff88'; c.lineWidth = 0.04; for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 0.85, Math.sin(a) * 0.85); c.stroke(); } }
  else if (f.tipo === 'mascara') { c.fillStyle = corpo; c.beginPath(); c.ellipse(0, 0, 0.8, 0.98, 0, 0, TAU); c.fill(); c.fillStyle = cs.c2; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.42; c.beginPath(); c.moveTo(Math.cos(a) * 0.8, Math.sin(a) * 0.9); c.lineTo(Math.cos(a - 0.14) * 0.85, Math.sin(a - 0.14) * 0.9); c.lineTo(Math.cos(a) * 1.3, Math.sin(a) * 1.3); c.lineTo(Math.cos(a + 0.14) * 0.85, Math.sin(a + 0.14) * 0.9); c.fill(); } }
  else if (f.tipo === 'olho') { c.fillStyle = cs.c2; estrela(0.9, 1.15, t); c.fill(); c.fillStyle = '#f4f6ff'; c.beginPath(); c.ellipse(0, 0, 0.95, 0.62, 0, 0, TAU); c.fill(); c.fillStyle = corpo; c.beginPath(); c.arc(Math.sin(t) * 0.2, 0, 0.42, 0, TAU); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(Math.sin(t) * 0.2, 0, 0.2, 0, TAU); c.fill(); }
  else if (f.tipo === 'serpente') { c.strokeStyle = corpo; c.lineWidth = 0.32; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU * 1.7 + t, r = 0.25 + i / 40 * 0.75; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke(); c.fillStyle = cs.c2; const a = TAU * 1.7 + t; c.beginPath(); c.arc(Math.cos(a), Math.sin(a), 0.26, 0, TAU); c.fill(); }
  else { c.fillStyle = cs.c2; c.fillRect(-0.95, -0.95, 1.9, 1.9); c.fillStyle = corpo; c.fillRect(-0.78, -0.78, 1.56, 1.56); c.fillStyle = cs.c3; for (let i = 0; i < n; i++) c.fillRect(-0.7 + i * 1.4 / n, 0.3, 1.0 / n, 0.4); }
  // rosto
  if (f.tipo !== 'olho' && f.tipo !== 'serpente') {
    const o = f.olhos, raiva = dor > 0.2 ? 0.1 : 0;
    for (let i = 0; i < o; i++) {
      const x = o === 1 ? 0 : (i - (o - 1) / 2) * (0.62 / Math.max(1, o - 1)) * 1.4, y = -0.12;
      c.fillStyle = '#05060f'; c.beginPath(); c.ellipse(x, y, 0.15, 0.2 - raiva, 0, 0, TAU); c.fill();
      c.fillStyle = dor > 0.2 ? '#ff3355' : '#ffffff'; c.beginPath(); c.arc(x + Math.sin(t * 1.3) * 0.04, y, 0.06, 0, TAU); c.fill();
    }
    if (f.extra !== 'semBoca') { c.strokeStyle = '#05060f'; c.lineWidth = 0.08; c.beginPath(); if (dor > 0.2) c.arc(0, 0.5, 0.2, Math.PI, 0); else c.arc(0, 0.28, 0.26, 0.2, Math.PI - 0.2); c.stroke(); }
  }
  if (escudo) { c.strokeStyle = '#9fe8ff'; c.lineWidth = 0.08; c.globalAlpha = 0.6 + Math.sin(t * 6) * 0.3; c.beginPath(); c.arc(0, 0, 1.3, 0, TAU); c.stroke(); }
  c.restore();
}

/** Poste de borracha simples (muros laterais, pinos de labirinto). */
export class Poste extends Base {
  tipo = 'poste'; c: Circ;
  constructor(J: Jogo, C: Campo, public x: number, y: number, r = 5.7, public cor = '') { super(J, C); this.y = y; this.c = { x, y, r, e: E_BORRACHA, invisivel: true }; C.circs.push(this.c); }
  desenhar(g: Gfx) { if (!this.c.off) g.cil(this.x, this.y, this.c.r, 10, this.cor || this.J.cores.c2, '#ffffff'); }
}

/** Alvo redondo que some ao ser atingido (tijolos, enxame, holofotes das fases em campo separado). */
export class Tijolo extends Base {
  tipo = 'tijolo'; c: Circ; vx = 0; vy = 0; vidas = 1; lim = [40, 360, 120, 420];
  constructor(J: Jogo, C: Campo, public x: number, y: number, public r = 11, public evento = 'tijolo', public cor = '') {
    super(J, C); this.y = y; this.c = { x, y, r, e: 0.6, dono: this, invisivel: true }; C.circs.push(this.c);
  }
  get vivo() { return !this.c.off; }
  bateu(b: Bola, imp: number) { if (imp < 30) return; this.vidas--; this.flash = 1; if (this.vidas <= 0) this.c.off = true; this.J.ev(this.evento, b, this); }
  protected tick(dt: number) {
    if (!this.vx && !this.vy) return;
    this.x += this.vx * dt; this.y += this.vy * dt; const l = this.lim;
    if (this.x < l[0] || this.x > l[1]) this.vx = -this.vx; if (this.y < l[2] || this.y > l[3]) this.vy = -this.vy;
    this.c.x = this.x; this.c.y = this.y; this.c.lvx = this.vx; this.c.lvy = this.vy;
  }
  desenhar(g: Gfx) {
    if (this.c.off) return; const k = this.J.cores;
    g.cil(this.x, this.y, this.r, 10, this.cor || k.c2, this.flash > 0.2 ? '#fff' : this.vidas > 1 ? '#ffffff' : k.c1); g.glow(this.x, this.y, this.r + 6, this.cor || k.c1, 9, 0.3);
  }
}
