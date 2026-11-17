// O gabinete em volta da mesa: enquadramento, laterais com a arte da máquina, apron e botões.
import { H, W } from '../core/physics';
import { CAM_MESA, proj } from '../core/projection';
import type { Vista } from './playfield';
import { alfa, tom } from '../visual/pincel';

type Ctx = CanvasRenderingContext2D;
export interface Ret { x: number; y: number; w: number; h: number }
export interface Quadro { w: number; h: number; paisagem: boolean; mesa: Vista; caixa: Ret; apron: Ret; painel: Ret | null; esquerda: Ret | null; sacudir: Ret; celular: boolean }

/** Divide a tela, igual em celular e desktop: backbox em cima, mesa em perspectiva embaixo e apron. A mesa é sempre o maior elemento. */
export function enquadra(w: number, h: number): Quadro {
  const celular = Math.min(w, h) < 560;
  const larga = !celular && w > h * 1.2, fb = celular ? 0.24 : larga ? 0.26 : 0.28, fm = celular ? 0.72 : larga ? 0.70 : 0.68, bh = h * fb, s = Math.min(h * fm / H, w * 0.98 / W), mw = W * s, ox = (w - mw) / 2, oy = bh;
  const bw = Math.min(w, Math.max(mw, bh * (larga ? 2.25 : 1.9)));
  const ah = h - bh - H * s;
  // em tela larga sobra espaço ao lado da mesa: vai ali o painel de missões e controles, sem tirar área da mesa
  const sobra = w - (ox + mw) - 40, painel = sobra >= 250 ? { x: ox + mw + 40, y: oy + H * s * 0.12, w: Math.min(sobra - 16, 430), h: H * s * 0.8 } : null;
  const lw = painel ? Math.min(sobra - 16, 360) : 0, esquerda = painel ? { x: ox - 40 - lw, y: oy + H * s * 0.12, w: lw, h: H * s * 0.8 } : null;
  return { w, h, paisagem: false, celular, mesa: { ox, oy, s }, caixa: { x: (w - bw) / 2, y: 0, w: bw, h: bh }, apron: { x: ox, y: oy + H * s, w: mw, h: ah }, painel, esquerda, sacudir: { x: w / 2 - 54, y: h - Math.max(ah, 30), w: 108, h: Math.max(ah, 30) } };
}

export interface VisGab { luz: string; metal: [string, string, string] }

export function desenhaGabinete(c: Ctx, q: Quadro, cores: { c1: string; c2: string; c3: string }, fundo: string[], lateral: HTMLCanvasElement | null, t: number, vis: VisGab = { luz: cores.c1, metal: ['#30364a', '#a9b3ca', '#ffffff'] }) {
  const { w, h, mesa: v } = q, M = vis.metal;
  // sala: parede escura com a luz da máquina vazando por trás do gabinete e reflexo no chão
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#020309'); g.addColorStop(0.55, fundo[1]); g.addColorStop(1, '#010105'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const cx = v.ox + W * v.s / 2, cy = v.oy + H * v.s * 0.4, rg = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
  rg.addColorStop(0, alfa(vis.luz, 0.22)); rg.addColorStop(0.45, alfa(cores.c2, 0.07)); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(0, 0, w, h);
  if (w > h) { // paredes laterais com frisos de luz (só quando sobra largura)
    c.globalAlpha = 0.18; for (let i = 0; i < 9; i++) { const x = (i + 0.5) / 9 * w; if (Math.abs(x - cx) < W * v.s * 0.75) continue; const gl = c.createLinearGradient(0, 0, 0, h); gl.addColorStop(0, alfa(i % 2 ? cores.c1 : cores.c2, 0)); gl.addColorStop(0.5, alfa(i % 2 ? cores.c1 : cores.c2, 0.6)); gl.addColorStop(1, alfa(cores.c1, 0)); c.fillStyle = gl; c.fillRect(x - 1, 0, 2, h); }
    c.globalAlpha = 1;
  }
  const tl = proj(0, 0, 0, CAM_MESA), bl = proj(0, H, 0, CAM_MESA), tr = proj(W, 0, 0, CAM_MESA), br = proj(W, H, 0, CAM_MESA);
  const P = (p: { sx: number; sy: number }) => [v.ox + p.sx * v.s, v.oy + p.sy * v.s];
  const [tlx, tly] = P(tl), [blx, bly] = P(bl), [trx, try_] = P(tr), [brx, bry] = P(br), e = 26 * v.s;
  for (const lado of [0, 1]) {
    const x0 = lado ? trx : tlx, x1 = lado ? brx : blx, d = lado ? 1 : -1;
    // painel lateral de metal pintado com a arte da máquina por baixo de um verniz
    c.save(); c.beginPath(); c.moveTo(x0, tly); c.lineTo(x0 + d * e * 0.7, tly - e * 0.2); c.lineTo(x1 + d * e, bly + e * 0.2); c.lineTo(x1, bly); c.closePath(); c.clip();
    const gm = c.createLinearGradient(x1, 0, x1 + d * e, 0); gm.addColorStop(0, tom(fundo[1], -0.4)); gm.addColorStop(0.5, tom(fundo[1], 0.08)); gm.addColorStop(1, tom(fundo[1], -0.55)); c.fillStyle = gm; c.fillRect(0, 0, w, h);
    if (lateral) { c.globalAlpha = 0.5; c.drawImage(lateral, lado ? lateral.width * 0.6 : 0, 0, lateral.width * 0.4, lateral.height, Math.min(x0, x1 + d * e), tly - e, e * 1.9, bly - tly + e * 2); c.globalAlpha = 1; }
    // faixa decorativa diagonal na cor da máquina
    c.globalAlpha = 0.5; c.fillStyle = cores.c1; c.beginPath(); c.moveTo(x1, bly - H * v.s * 0.32); c.lineTo(x1 + d * e, bly - H * v.s * 0.4); c.lineTo(x1 + d * e, bly - H * v.s * 0.37); c.lineTo(x1, bly - H * v.s * 0.29); c.fill();
    c.fillStyle = cores.c2; c.beginPath(); c.moveTo(x1, bly - H * v.s * 0.27); c.lineTo(x1 + d * e, bly - H * v.s * 0.35); c.lineTo(x1 + d * e, bly - H * v.s * 0.34); c.lineTo(x1, bly - H * v.s * 0.26); c.fill(); c.globalAlpha = 1;
    const gl = c.createLinearGradient(x0, 0, x0 + d * e, 0); gl.addColorStop(0, 'rgba(0,0,0,0.65)'); gl.addColorStop(0.3, 'rgba(255,255,255,0.05)'); gl.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = gl; c.fillRect(0, 0, w, h);
    c.restore();
    // trilho cromado do vidro sobre a borda da mesa
    const lw = Math.max(3, 5 * v.s);
    for (const [cor, lg, off] of [[M[0], lw, 0], [M[1], lw * 0.62, -lw * 0.12], [M[2], lw * 0.2, -lw * 0.28]] as [string, number, number][]) { c.strokeStyle = cor; c.lineWidth = lg; c.beginPath(); c.moveTo(x0 + d * off * -1, tly + off); c.lineTo(x1 + d * off * -1, bly + off); c.stroke(); }
    // parafusos do trilho
    c.fillStyle = M[1]; for (let k = 1; k < 6; k++) { const u = k / 6, sx = x0 + (x1 - x0) * u + d * lw * 0.9, sy = tly + (bly - tly) * u; c.beginPath(); c.arc(sx, sy, Math.max(1, 1.4 * v.s), 0, Math.PI * 2); c.fill(); }
    // botão de palheta: cromado com miolo na cor da máquina
    const by = bly - 70 * v.s, bx = x1 + d * e * 0.55, rb = 9 * v.s, gbtn = c.createRadialGradient(bx - rb * 0.3, by - rb * 0.3, rb * 0.1, bx, by, rb);
    gbtn.addColorStop(0, M[2]); gbtn.addColorStop(0.6, M[1]); gbtn.addColorStop(1, M[0]); c.fillStyle = gbtn; c.beginPath(); c.arc(bx, by, rb, 0, Math.PI * 2); c.fill();
    c.fillStyle = cores.c1; c.beginPath(); c.arc(bx, by, rb * 0.66, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(bx - rb * 0.2, by - rb * 0.25, rb * 0.22, 0, Math.PI * 2); c.fill();
  }
  // moldura de trás (cromada) e fundo do vão da mesa
  const lt = Math.max(3, 4.5 * v.s);
  for (const [cor, lg] of [[M[0], lt], [M[1], lt * 0.6], [M[2], lt * 0.18]] as [string, number][]) { c.strokeStyle = cor; c.lineWidth = lg; c.beginPath(); c.moveTo(tlx, tly); c.lineTo(trx, try_); c.stroke(); }
  c.fillStyle = '#04050c'; c.beginPath(); c.moveTo(tlx, tly); c.lineTo(trx, try_); c.lineTo(brx, bry); c.lineTo(blx, bly); c.fill();
  // apron com barra de travamento cromada e placa com o nome
  const a = q.apron; if (a.h > 4) {
    const ga = c.createLinearGradient(0, a.y, 0, a.y + a.h); ga.addColorStop(0, tom(fundo[1], 0.06)); ga.addColorStop(1, '#05060e'); c.fillStyle = ga; c.fillRect(a.x - e, a.y, a.w + e * 2, a.h);
    const bh = Math.max(3, Math.min(8, a.h * 0.22)), gb = c.createLinearGradient(0, a.y, 0, a.y + bh); gb.addColorStop(0, M[2]); gb.addColorStop(0.45, M[1]); gb.addColorStop(1, M[0]);
    c.fillStyle = gb; rr(c, a.x - e - 2, a.y - bh * 0.4, a.w + e * 2 + 4, bh, bh / 2); c.fill();
    c.fillStyle = alfa(cores.c1, 0.7); c.fillRect(a.x - e, a.y + bh * 0.6, a.w + e * 2, 1);
  }
  void t;
}

/** Botões desenhados por cima: sacudir, lançador e as zonas de toque no celular. */
export function desenhaBotoes(c: Ctx, q: Quadro, cores: { c1: string; c2: string; c3: string }, carga: number, podeLancar: boolean, t: number, dicas: boolean) {
  const s = q.sacudir, v = q.mesa;
  c.fillStyle = 'rgba(10,12,28,0.85)'; c.strokeStyle = cores.c3; c.lineWidth = 1.5;
  rr(c, s.x + 3, s.y + 3, s.w - 6, s.h - 6, 8); c.fill(); c.stroke();
  c.fillStyle = '#fff'; c.font = `800 ${Math.max(9, Math.min(13, s.h * 0.34))}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SACUDIR', s.x + s.w / 2, s.y + s.h / 2 + 1);
  // puxador do lançador, à direita
  const px = v.ox + W * v.s - 12 * v.s, py = v.oy + H * v.s + 4;
  if (q.apron.h > 14 || q.paisagem) { c.fillStyle = '#c9cee6'; c.fillRect(px - 3, py, 6, 8 + carga * 14); c.fillStyle = podeLancar && Math.floor(t * 3) % 2 ? cores.c1 : '#e33'; c.beginPath(); c.arc(px, py + 12 + carga * 14, 7, 0, Math.PI * 2); c.fill(); }
  if (dicas) {
    c.font = `800 ${Math.max(11, 13 * v.s)}px Orbitron, sans-serif`; c.fillStyle = 'rgba(255,255,255,0.85)';
    const y = v.oy + H * v.s * 0.83, pisca = 0.55 + Math.sin(t * 5) * 0.35; c.globalAlpha = pisca;
    c.fillText(q.celular ? '◀ TOQUE' : '◀ Z', v.ox + W * v.s * 0.2, y); c.fillText(q.celular ? 'TOQUE ▶' : 'M ▶', v.ox + W * v.s * 0.72, y);
    if (podeLancar) { c.fillStyle = cores.c1; c.fillText(q.celular ? 'SEGURE À DIREITA E SOLTE PARA LANÇAR' : 'SEGURE ESPAÇO E SOLTE PARA LANÇAR', v.ox + W * v.s * 0.5, v.oy + H * v.s * 0.62); }
    c.globalAlpha = 1;
  }
}
export function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
