// Apresentação na tela: entrada da máquina, letreiros de evento no backglass, bordas de estado (chefe, mago,
// multibola), transições do andar de cima e do túnel, e o reflexo do vidro. Tudo sincronizado ao estado real do jogo.
import type { Anuncio, Game } from '../game/rules';
import type { MachineDef } from '../machines/_schema';
import type { Ret } from '../render/cabinet';
import type { Vista } from '../render/playfield';
import { visualDe } from './manifesto';
import { alfa, tom } from './pincel';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const W = 400, H = 760;
const suave = (u: number) => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);

interface Letreiro { titulo: string; sub: string; cor: string; t: number; dur: number; forte: boolean }

/** qual acontecimento vira letreiro no backglass, com que cor e peso */
function letreiroDe(a: Anuncio, k: { c1: string; c2: string; c3: string }): Omit<Letreiro, 't'> | null {
  const tx = (a.texto || '').toUpperCase();
  switch (a.tipo) {
    case 'chefeCai': return { titulo: 'NÚCLEO DESTRUÍDO', sub: tx + ' · FASE ' + (a.d?.fase ?? ''), cor: '#ff4466', dur: 2.4, forte: true };
    case 'chefeVolta': return { titulo: tx + ' VOLTOU', sub: 'NOVA FASE DO CHEFE', cor: '#ff4466', dur: 1.8, forte: false };
    case 'mago': return { titulo: 'MODO MAGO', sub: tx, cor: k.c1, dur: 2.8, forte: true };
    case 'magoVence': return { titulo: 'MAGO VENCIDO', sub: 'PRÓXIMA MÁQUINA LIBERADA', cor: '#ffd24a', dur: 3.2, forte: true };
    case 'magoFim': return { titulo: 'FIM DO MODO MAGO', sub: tx, cor: k.c2, dur: 1.8, forte: false };
    case 'multibola': return { titulo: 'MULTIBOLA', sub: 'RAMPAS E ÓRBITAS DÃO JACKPOT', cor: '#ffd24a', dur: 2.2, forte: true };
    case 'jackpot': return { titulo: 'JACKPOT', sub: '60.000', cor: '#ffd24a', dur: 1.5, forte: false };
    case 'super': return { titulo: 'SUPER JACKPOT', sub: '250.000', cor: '#ffffff', dur: 2.2, forte: true };
    case 'sobe': return { titulo: a.d?.origem === 'andar' ? 'ANDAR DE CIMA' : 'SUBFASE', sub: tx.split(' · ')[1] || tx, cor: k.c1, dur: 1.8, forte: true };
    case 'desce': return { titulo: a.d?.venceu ? 'VITÓRIA' : 'DE VOLTA À MESA', sub: tx.split(' · ')[0], cor: a.d?.venceu ? '#ffd24a' : k.c2, dur: 1.6, forte: !!a.d?.venceu };
    case 'andarAceso': return { titulo: 'ANDAR DE CIMA ACESO', sub: 'RAMPA DIREITA OU PORTAL', cor: k.c1, dur: 2.0, forte: false };
    case 'missaoOk': return { titulo: 'MISSÃO CUMPRIDA', sub: tx, cor: k.c1, dur: 1.8, forte: false };
    case 'atalho': return { titulo: 'ATALHO ABERTO', sub: 'PRÓXIMA MÁQUINA LIBERADA', cor: '#ffd24a', dur: 2.4, forte: true };
    case 'ataque': return { titulo: 'ATAQUE DO CHEFE', sub: tx, cor: '#ff4466', dur: 1.3, forte: false };
    case 'assinaturaTotal': return { titulo: tx.length > 22 ? tx.slice(0, 22) + '…' : tx, sub: '', cor: k.c3, dur: 2.0, forte: false };
    default: return null;
  }
}

export class Apresentacao {
  private fila: Letreiro[] = []; private atual: Letreiro | null = null;
  private entrada = 0; private entradaDur = 0; private def: MachineDef | null = null;
  private vidro: HTMLCanvasElement | null = null; private vidroChave = '';
  borda = 0; t = 0; reduzido = false; curtas = false;

  /** começa a apresentação da máquina; com transições curtas, só um esmaecer rápido */
  inicia(def: MachineDef, comEscolha: boolean) {
    this.def = def; this.fila = []; this.atual = null;
    this.entradaDur = this.curtas || this.reduzido ? 0.6 : comEscolha ? 1.2 : 2.6; this.entrada = this.entradaDur;
  }
  pula() { if (this.entrada > 0.35) this.entrada = 0.35; }
  encerra() { this.entrada = 0; }
  get emEntrada() { return this.entrada > 0; }
  /** lê os anúncios antes do painel de pontos consumi-los (só leitura) */
  observa(an: Anuncio[], k: { c1: string; c2: string; c3: string }) {
    for (const a of an) { const l = letreiroDe(a, k); if (!l) continue; if (l.forte) this.fila = this.fila.filter(x => x.forte); this.fila.push({ ...l, t: 0 }); if (this.fila.length > 3) this.fila.shift(); }
  }
  passo(dt: number) {
    this.t += dt; if (this.entrada > 0) this.entrada = Math.max(0, this.entrada - dt);
    if (this.atual) { this.atual.t += dt * (this.fila.length ? 1.6 : 1); if (this.atual.t >= this.atual.dur) this.atual = null; }
    if (!this.atual && this.fila.length) this.atual = this.fila.shift()!;
  }

  /** letreiro no backglass, por cima da arte e acima do painel de pontos (nunca sobre a mesa) */
  letreiro(c: Ctx, r: Ret) {
    const L = this.atual; if (!L) return;
    const m = Math.max(4, r.h * 0.035), dw = Math.min(r.w - m * 4, (r.h * 0.5) * 3), dh = dw / 3, topo = r.y + m, base = r.y + r.h - dh - m * 1.6 - 6;
    const h = base - topo; if (h < 26) return;
    const u = L.t / L.dur, ent = suave(L.t / 0.25), sai = 1 - suave((L.t - (L.dur - 0.3)) / 0.3), a = Math.min(ent, sai), cy = topo + h / 2;
    c.save(); c.beginPath(); c.rect(r.x + m, topo, r.w - m * 2, h); c.clip();
    // faixa opaca sobre toda a área da arte: o letreiro nunca se mistura ao título do backglass
    c.globalAlpha = a * 0.94; c.fillStyle = '#03040c'; c.fillRect(r.x + m, cy - h * 0.5 * ent, r.w - m * 2, h * ent);
    c.globalAlpha = a; c.fillStyle = L.cor; c.fillRect(r.x + m, cy - h * 0.5 * ent, r.w - m * 2, 2); c.fillRect(r.x + m, cy + h * 0.5 * ent - 2, r.w - m * 2, 2);
    const tam = Math.min(h * 0.36, r.w / Math.max(8, L.titulo.length) * 1.25);
    c.font = `800 ${tam}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const x = r.x + r.w / 2 + (1 - ent) * r.w * 0.3, y = cy - (L.sub ? tam * 0.3 : 0);
    c.lineWidth = tam * 0.16; c.strokeStyle = 'rgba(0,0,0,0.8)'; c.strokeText(L.titulo, x, y);
    const g = c.createLinearGradient(0, y - tam / 2, 0, y + tam / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, L.cor); g.addColorStop(1, tom(L.cor, -0.3)); c.fillStyle = g; c.fillText(L.titulo, x, y);
    // brilho que corre sobre as letras
    if (!this.reduzido) { const sx = r.x + (u * 1.6 - 0.3) * r.w; const gl = c.createLinearGradient(sx - 40, 0, sx + 40, 0); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, 'rgba(255,255,255,0.45)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.globalCompositeOperation = 'lighter'; c.fillStyle = gl; c.fillRect(r.x, cy - h * 0.36, r.w, h * 0.72); c.globalCompositeOperation = 'source-over'; }
    if (L.sub) { c.font = `700 ${Math.max(9, tam * 0.36)}px Orbitron, sans-serif`; c.fillStyle = '#e8ecff'; c.fillText(L.sub, x, y + tam * 0.78); }
    c.restore();
  }

  /** bordas de estado sobre a mesa: nunca no centro, só nas margens */
  bordas(c: Ctx, v: Vista, J: Game) {
    const k = J.cores, x = v.ox, y = v.oy, w = W * v.s, h = H * v.s, t = this.t, S = J.sub;
    let cor = '', a = 0;
    const tensao = (!S && J.m.chefe.vida === 1 && !J.m.chefe.c.off) || S?.tipo === 'chefao';
    if (J.mago) { cor = k.c1; a = 0.35 + Math.sin(t * 4) * 0.12; }
    else if (tensao) { cor = '#ff2a48'; a = 0.22 + Math.sin(t * 5) * (this.reduzido ? 0.02 : 0.1); }
    else if (J.multibola) { cor = '#ffd24a'; a = 0.2; }
    if (cor) {
      const e = Math.min(w, h) * 0.12;
      const faixa = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, alfa(cor, a)); g.addColorStop(1, alfa(cor, 0)); c.fillStyle = g; c.fillRect(rx, ry, rw, rh); };
      c.save(); c.globalCompositeOperation = 'lighter';
      faixa(x, 0, x + e, 0, x, y, e, h); faixa(x + w, 0, x + w - e, 0, x + w - e, y, e, h); faixa(0, y, 0, y + e, x, y, w, e);
      c.restore();
    }
    // modo mago: luzes que correm pela moldura da mesa
    if (J.mago && !this.reduzido) {
      c.save(); c.lineWidth = Math.max(2, 3 * v.s); c.setLineDash([10 * v.s, 14 * v.s]);
      for (const [cor2, dir] of [[k.c1, 1], [k.c3, -1]] as [string, number][]) { c.lineDashOffset = -t * 90 * dir; c.strokeStyle = cor2; c.globalAlpha = 0.75; c.strokeRect(x + 3, y + 3, w - 6, h - 6); }
      c.restore();
    }
  }

  /** transição do andar de cima: luz que sobe (ida) ou desce (volta); túnel com linhas de velocidade */
  transicao(c: Ctx, v: Vista, J: Game) {
    const T = J.trans, S = J.sub, k = J.cores, x = v.ox, y = v.oy, w = W * v.s, h = H * v.s;
    if (T) {
      const u = T.t / T.dur, sobe = T.dir > 0, a = Math.sin(Math.min(1, u) * Math.PI) * (this.reduzido ? 0.4 : 0.85);
      c.save(); c.beginPath(); c.rect(x - 30, y - 10, w + 60, h + 20); c.clip(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) {
        const lx = x + ((i * 97) % 100) / 100 * w, vel = 0.8 + (i % 5) * 0.25, comp = h * (0.12 + (i % 3) * 0.06);
        let ly = ((i * 53) % 100) / 100 * h + (sobe ? -1 : 1) * u * h * 1.6 * vel; ly = ((ly % (h + comp)) + h + comp) % (h + comp) - comp;
        const g = c.createLinearGradient(0, y + ly, 0, y + ly + comp); g.addColorStop(sobe ? 1 : 0, alfa(k.c1, 0)); g.addColorStop(sobe ? 0 : 1, alfa(i % 2 ? k.c1 : k.c3, a * 0.7));
        c.fillStyle = g; c.fillRect(lx, y + ly, Math.max(1.5, 2.5 * v.s), comp);
      }
      // faixa de elevação: atravessa a mesa no sentido do movimento
      const by = sobe ? y + h * (1 - suave(u)) : y + h * suave(u), gb = c.createLinearGradient(0, by - 30, 0, by + 30);
      gb.addColorStop(0, alfa(k.c1, 0)); gb.addColorStop(0.5, alfa(k.c1, a * 0.5)); gb.addColorStop(1, alfa(k.c1, 0)); c.fillStyle = gb; c.fillRect(x, by - 30, w, 60);
      c.restore();
    } else if (S?.rolagem) {
      // túnel mágico: linhas de velocidade nas laterais descendo enquanto a bola sobe
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 10; i++) { const lado = i % 2, lx = lado ? x + w - 12 * v.s - (i % 3) * 6 : x + 8 * v.s + (i % 3) * 6, ly = ((i * 71 + this.t * 600) % (h + 80)) - 80; c.fillStyle = alfa(i % 4 < 2 ? k.c2 : k.c1, 0.35); c.fillRect(lx, y + ly, 2, 60 * v.s); }
      c.restore();
    }
  }

  /** reflexo do vidro: duas faixas diagonais muito leves, em cache por tamanho */
  reflexo(c: Ctx, v: Vista, dpr: number) {
    const w = Math.round(W * v.s), h = Math.round(H * v.s), chave = w + 'x' + h + '|' + dpr;
    if (!this.vidro || this.vidroChave !== chave) {
      const cv = document.createElement('canvas'); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); const g = cv.getContext('2d')!; g.scale(dpr, dpr);
      for (const [x0, lg, a] of [[0.12, 0.1, 0.05], [0.5, 0.04, 0.04]] as [number, number, number][]) {
        const gr = g.createLinearGradient(w * x0, 0, w * (x0 + lg), h * 0.3); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(w * x0, 0); g.lineTo(w * (x0 + lg * 2), 0); g.lineTo(w * (x0 + lg * 2 - 0.35), h); g.lineTo(w * (x0 - 0.35), h); g.fill();
      }
      const gt = g.createLinearGradient(0, 0, 0, h * 0.25); gt.addColorStop(0, 'rgba(255,255,255,0.05)'); gt.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gt; g.fillRect(0, 0, w, h * 0.25);
      this.vidro = cv; this.vidroChave = chave;
    }
    c.drawImage(this.vidro, v.ox, v.oy, w, h);
  }

  /** entrada da máquina: cartaz curto sobre a mesa, pulável com qualquer toque ou tecla */
  desenhaEntrada(c: Ctx, v: Vista, celular: boolean) {
    const d = this.def; if (!d || this.entrada <= 0) return;
    const vis = visualDe(d.id), k = d.paleta, T = this.entradaDur, e = T - this.entrada, sai = Math.min(1, this.entrada / 0.35), x = v.ox, y = v.oy, w = W * v.s, h = H * v.s, cx = x + w / 2;
    const u = e / T, ent = suave(e / 0.45);
    c.save(); c.beginPath(); c.rect(x - 36, y - 10, w + 72, h + 20); c.clip(); c.globalAlpha = sai;
    c.fillStyle = 'rgba(2,3,10,0.86)'; c.fillRect(x - 40, y - 12, w + 80, h + 24);
    if (T > 1) {
      // anel de choque na cor da máquina e varredura de luz
      c.globalCompositeOperation = 'lighter';
      const rr = (0.1 + suave(u * 1.4) * 0.8) * w; c.strokeStyle = alfa(vis.luz, 0.6 * (1 - u)); c.lineWidth = 3; c.beginPath(); c.ellipse(cx, y + h * 0.42, rr, rr * 0.5, 0, 0, TAU); c.stroke();
      const sx = x + (u * 1.4 - 0.2) * w, gl = c.createLinearGradient(sx - 60, 0, sx + 60, 0); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, alfa(vis.luz, 0.25)); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(x, y, w, h);
      c.globalCompositeOperation = 'source-over';
    }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const ty = y + h * 0.36 + (1 - ent) * 30;
    c.font = `700 ${Math.max(10, 12 * v.s)}px Orbitron, sans-serif`; c.fillStyle = alfa(k.c2, 0.9 * ent); c.fillText('MÁQUINA ' + String(d.n).padStart(2, '0') + ' DE 30', cx, ty - 44 * v.s);
    const nome = d.nome.toUpperCase(); let tam = Math.min(46 * v.s, w * 0.88 / Math.max(5, nome.length) * 1.55);
    c.font = `800 ${tam}px Orbitron, sans-serif`; if (c.measureText(nome).width > w * 0.9) { tam *= w * 0.9 / c.measureText(nome).width; c.font = `800 ${tam}px Orbitron, sans-serif`; }
    c.globalAlpha = sai * ent; c.lineJoin = 'round'; c.lineWidth = tam * 0.2; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.strokeText(nome, cx, ty);
    const g = c.createLinearGradient(0, ty - tam / 2, 0, ty + tam / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, k.c1); g.addColorStop(1, tom(k.c1, -0.35)); c.fillStyle = g; c.fillText(nome, cx, ty);
    c.fillStyle = alfa(k.c1, 0.8); c.fillRect(cx - w * 0.3 * ent, ty + tam * 0.62, w * 0.6 * ent, 2);
    if (T > 1) {
      const lema = d.lema, fz = Math.max(10, 11 * v.s); c.font = `500 ${fz}px Orbitron, sans-serif`; c.fillStyle = '#e8ecff'; c.globalAlpha = sai * suave((e - 0.35) / 0.4);
      quebra(c, lema, cx, ty + tam * 0.62 + 22 * v.s, w * 0.84, fz * 1.35);
      const chips = [['ASSINATURA', d.assinatura.nome], ['CHEFE', d.chefe.nome], ['MODO MAGO', d.mago.nome]];
      chips.forEach(([r, n], i) => {
        const cy = y + h * 0.6 + i * 36 * Math.max(0.85, v.s); c.globalAlpha = sai * suave((e - 0.6 - i * 0.12) / 0.3);
        c.font = `700 ${Math.max(9, 9 * v.s)}px Orbitron, sans-serif`; c.fillStyle = k.c2; c.fillText(r, cx, cy - 8);
        c.font = `800 ${Math.max(11, 12 * v.s)}px Orbitron, sans-serif`; c.fillStyle = '#ffffff'; c.fillText(n.toUpperCase(), cx, cy + 7);
      });
      c.globalAlpha = sai * (0.5 + Math.sin(this.t * 5) * 0.3); c.font = `600 ${Math.max(9, 10 * v.s)}px Orbitron, sans-serif`; c.fillStyle = '#c9d0f5';
      c.fillText(celular ? 'toque para jogar' : 'qualquer tecla para jogar', cx, y + h * 0.9);
    }
    c.restore();
  }
}

function quebra(c: Ctx, s: string, x: number, y: number, max: number, lh: number) {
  const pal = s.split(' '); let l = '', yy = y;
  for (const p of pal) { if (c.measureText(l + p).width > max && l) { c.fillText(l.trim(), x, yy); l = ''; yy += lh; } l += p + ' '; }
  c.fillText(l.trim(), x, yy);
}
