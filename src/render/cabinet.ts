// O gabinete em volta da mesa: enquadramento, laterais com a arte da máquina, apron e botões.
import { H, W } from '../core/physics';
import { CAM_MESA, proj } from '../core/projection';
import type { Vista } from './playfield';

type Ctx = CanvasRenderingContext2D;
export interface Ret { x: number; y: number; w: number; h: number }
export interface Quadro { w: number; h: number; paisagem: boolean; mesa: Vista; caixa: Ret; apron: Ret; painel: Ret | null; sacudir: Ret; celular: boolean }

/** Divide a tela: backbox em cima (ou à direita em paisagem), mesa em perspectiva e apron. */
export function enquadra(w: number, h: number): Quadro {
  const paisagem = w / h >= 1.2, celular = Math.min(w, h) < 560;
  if (paisagem) {
    const s = Math.min(h * 0.93 / H, w * 0.46 / W), mw = W * s, ox = Math.max(w * 0.04, w * 0.30 - mw / 2), oy = h * 0.03;
    const bx = ox + mw + w * 0.04, bw = Math.min(w - bx - w * 0.03, h * 1.1), bh = Math.min(bw / 1.75, h * 0.5);
    const apron = { x: ox, y: oy + H * s, w: mw, h: h - oy - H * s };
    return { w, h, paisagem, celular, mesa: { ox, oy, s }, caixa: { x: bx, y: h * 0.05, w: bw, h: bh }, apron, painel: { x: bx, y: h * 0.05 + bh + h * 0.03, w: bw, h: h * 0.87 - bh }, sacudir: { x: bx + bw - 150, y: h - 64, w: 150, h: 44 } };
  }
  const fb = celular ? 0.24 : 0.28, fm = celular ? 0.72 : 0.68, bh = h * fb, s = Math.min(h * fm / H, w * 0.98 / W), mw = W * s, ox = (w - mw) / 2, oy = bh;
  const bw = Math.min(w, Math.max(mw, bh * 1.9));
  const ah = h - bh - H * s;
  return { w, h, paisagem, celular, mesa: { ox, oy, s }, caixa: { x: (w - bw) / 2, y: 0, w: bw, h: bh }, apron: { x: ox, y: oy + H * s, w: mw, h: ah }, painel: null, sacudir: { x: w / 2 - 54, y: h - Math.max(ah, 30), w: 108, h: Math.max(ah, 30) } };
}

export function desenhaGabinete(c: Ctx, q: Quadro, cores: { c1: string; c2: string; c3: string }, fundo: string[], lateral: HTMLCanvasElement | null, t: number) {
  const { w, h, mesa: v } = q;
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#03040b'); g.addColorStop(0.5, fundo[1]); g.addColorStop(1, '#020208'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  // laterais do gabinete com a arte da máquina
  const tl = proj(0, 0, 0, CAM_MESA), bl = proj(0, H, 0, CAM_MESA), tr = proj(W, 0, 0, CAM_MESA), br = proj(W, H, 0, CAM_MESA);
  const P = (p: { sx: number; sy: number }) => [v.ox + p.sx * v.s, v.oy + p.sy * v.s];
  const [tlx, tly] = P(tl), [blx, bly] = P(bl), [trx, try_] = P(tr), [brx, bry] = P(br), e = 26 * v.s;
  for (const lado of [0, 1]) {
    const x0 = lado ? trx : tlx, x1 = lado ? brx : blx, d = lado ? 1 : -1;
    c.save(); c.beginPath(); c.moveTo(x0, tly); c.lineTo(x0 + d * e * 0.7, tly - e * 0.2); c.lineTo(x1 + d * e, bly + e * 0.2); c.lineTo(x1, bly); c.closePath(); c.clip();
    c.fillStyle = '#0a0c1a'; c.fillRect(0, 0, w, h);
    if (lateral) { c.globalAlpha = 0.75; c.drawImage(lateral, lado ? lateral.width * 0.6 : 0, 0, lateral.width * 0.4, lateral.height, Math.min(x0, x1 + d * e), tly - e, e * 1.9, bly - tly + e * 2); c.globalAlpha = 1; }
    const gl = c.createLinearGradient(x0, 0, x0 + d * e, 0); gl.addColorStop(0, 'rgba(0,0,0,0.7)'); gl.addColorStop(1, 'rgba(0,0,0,0.1)'); c.fillStyle = gl; c.fillRect(0, 0, w, h);
    c.restore();
    c.strokeStyle = cores.c2; c.lineWidth = Math.max(1.5, 2.4 * v.s); c.beginPath(); c.moveTo(x0, tly); c.lineTo(x1, bly); c.stroke();
    // botão de palheta desenhado na lateral
    const by = bly - 70 * v.s, bx = x1 + d * e * 0.55;
    c.fillStyle = '#11142a'; c.beginPath(); c.arc(bx, by, 9 * v.s, 0, Math.PI * 2); c.fill(); c.fillStyle = cores.c1; c.beginPath(); c.arc(bx, by, 6.5 * v.s, 0, Math.PI * 2); c.fill();
  }
  // moldura de trás e trilho do vidro
  c.strokeStyle = cores.c2; c.lineWidth = Math.max(2, 3 * v.s); c.beginPath(); c.moveTo(tlx, tly); c.lineTo(trx, try_); c.stroke();
  c.fillStyle = '#04050c'; c.beginPath(); c.moveTo(tlx, tly); c.lineTo(trx, try_); c.lineTo(brx, bry); c.lineTo(blx, bly); c.fill();
  // apron
  const a = q.apron; if (a.h > 4) {
    const ga = c.createLinearGradient(0, a.y, 0, a.y + a.h); ga.addColorStop(0, '#1a1e3a'); ga.addColorStop(1, '#070812'); c.fillStyle = ga; c.fillRect(a.x - e, a.y, a.w + e * 2, a.h);
    c.fillStyle = cores.c1; c.fillRect(a.x - e, a.y, a.w + e * 2, Math.max(1.5, 2 * v.s));
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
