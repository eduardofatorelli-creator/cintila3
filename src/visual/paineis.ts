// Painéis laterais do desktop (só quando sobra largura ao lado da mesa): placas iluminadas do gabinete.
// Esquerda: a máquina (arte, assinatura, chefe, andar, mago). Direita: missões, evoluções e controles. Sem repetir o placar.
import type { Game } from '../game/rules';
import type { MachineDef } from '../machines/_schema';
import { relogio } from '../render/backbox';
import type { Ret } from '../render/cabinet';
import { rr } from '../render/cabinet';
import { alfa } from './pincel';

type Ctx = CanvasRenderingContext2D;

function placa(c: Ctx, r: Ret, k: { c1: string; c2: string }) {
  const g = c.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, 'rgba(14,16,36,0.92)'); g.addColorStop(1, 'rgba(5,6,16,0.92)');
  rr(c, r.x, r.y, r.w, r.h, 14); c.fillStyle = g; c.fill();
  c.lineWidth = 1.5; c.strokeStyle = alfa(k.c2, 0.55); c.stroke();
  c.fillStyle = alfa(k.c1, 0.85); c.fillRect(r.x + 18, r.y, r.w - 36, 2);
}

function escritor(c: Ctx, r: Ret, lh: number) {
  let y = r.y + 16;
  const L = (s: string, cor: string, peso = 500, esc = 0.62, recuo = 0) => { c.font = `${peso} ${lh * esc}px Orbitron, sans-serif`; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = cor; c.fillText(cabe(c, s, r.w - 32 - recuo), r.x + 16 + recuo, y); y += lh * (esc + 0.4); };
  return { L, pula: (n: number) => { y += n; }, get y() { return y; }, set y(v: number) { y = v; } };
}
function cabe(c: Ctx, s: string, max: number) { if (c.measureText(s).width <= max) return s; while (s.length > 3 && c.measureText(s + '…').width > max) s = s.slice(0, -1); return s + '…'; }

export function painelEsquerdo(c: Ctx, r: Ret, J: Game, def: MachineDef, mini: HTMLCanvasElement | null, t: number) {
  if (r.h < 200 || r.w < 200) return; const k = J.cores, lh = Math.max(16, Math.min(24, r.h / 20));
  placa(c, r, k);
  let y0 = r.y + 14;
  if (mini) { const w = r.w - 28, h = w * mini.height / mini.width; c.save(); rr(c, r.x + 14, y0, w, h, 10); c.clip(); c.drawImage(mini, r.x + 14, y0, w, h); c.restore(); rr(c, r.x + 14, y0, w, h, 10); c.strokeStyle = alfa(k.c1, 0.5); c.lineWidth = 1; c.stroke(); y0 += h + 10; }
  const E = escritor(c, { ...r, y: y0 - 16 }, lh);
  E.L(String(def.n).padStart(2, '0') + ' · ' + def.nome.toUpperCase(), k.c1, 800, 0.78);
  E.L(def.lema, '#c9d0f5', 500, 0.5); E.pula(6);
  E.L('ASSINATURA · ' + def.assinatura.nome.toUpperCase(), k.c2, 800, 0.56); E.L(def.assinatura.dica, '#e8ecff', 500, 0.5); E.pula(6);
  const ch = J.m.chefe, vivo = !ch.c.off;
  E.L('CHEFE · ' + def.chefe.nome.toUpperCase(), J.m.chefe.vida === 1 && vivo ? '#ff5a72' : k.c2, 800, 0.56);
  const py = E.y + 2; for (let i = 0; i < Math.min(8, Math.max(0, ch.vida)); i++) { c.fillStyle = i === 0 && ch.vida === 1 && Math.floor(t * 4) % 2 ? '#ffffff' : '#ff4466'; rr(c, r.x + 16 + i * 16, py, 12, 8, 3); c.fill(); }
  E.pula(16); E.pula(4);
  const lamp = (rot: string, aceso: boolean, cor: string) => { const yy = E.y + lh * 0.3; c.fillStyle = aceso ? cor : '#22263c'; c.beginPath(); c.arc(r.x + 22, yy, 5, 0, Math.PI * 2); c.fill(); if (aceso) { c.fillStyle = alfa(cor, 0.3); c.beginPath(); c.arc(r.x + 22, yy, 10, 0, Math.PI * 2); c.fill(); } E.L(rot, aceso ? '#ffffff' : '#8088aa', 600, 0.52, 16); };
  lamp('ANDAR DE CIMA · ' + def.andar.nome.toUpperCase(), J.andarAceso, k.c1);
  lamp('MULTIBOLA', J.multibola, '#ffd24a');
  lamp('MODO MAGO · ' + def.mago.nome.toUpperCase(), J.mago, k.c3);
}

export function painelDireito(c: Ctx, r: Ret, J: Game, def: MachineDef, eterno: { tempo: number } | null, t: number, ranking: number[] = []) {
  if (r.h < 160) return; const k = J.cores, lh = Math.max(16, Math.min(24, r.h / 18));
  placa(c, r, k); const E = escritor(c, r, lh);
  E.L('NÍVEL ' + J.nivel + (J.modo === 'eterno' ? ' · MODO ETERNO' : ''), k.c1, 800, 0.7); E.pula(4);
  E.L('MISSÕES', k.c2, 800, 0.6);
  J.missoes.forEach((m, i) => {
    const ativa = i === J.missaoAtiva, cor = m.feita ? k.c1 : ativa ? '#ffffff' : '#8088aa';
    E.L((m.feita ? '✔ ' : ativa ? '▶ ' : '· ') + m.nome, cor, ativa ? 700 : 500, 0.56);
    if (ativa) { const y = E.y - lh * 0.12, w = r.w - 64; c.fillStyle = '#1a1e38'; rr(c, r.x + 30, y, w, 5, 2.5); c.fill(); c.fillStyle = k.c1; rr(c, r.x + 30, y, w * Math.min(1, m.n / m.meta), 5, 2.5); c.fill(); c.font = `600 ${lh * 0.46}px Orbitron, sans-serif`; c.fillStyle = J.missaoT < 10 ? '#ff5577' : '#c9d0f5'; c.textAlign = 'right'; c.fillText(m.n + '/' + m.meta + ' · ' + Math.ceil(J.missaoT) + 's', r.x + r.w - 16, y - lh * 0.62); c.textAlign = 'left'; E.pula(10); }
  });
  E.pula(6); E.L('EVOLUÇÕES', k.c2, 800, 0.6); E.L(J.nomesEvolucoes.join(' · ') || 'nenhuma ainda', '#cdd3f5', 500, 0.52);
  E.pula(6); E.L('TRAVAS ' + J.travas + '/2 · BÔNUS ' + J.bonusX + 'X', '#cdd3f5', 600, 0.54);
  if (eterno) E.L('RESERVA ' + J.vidasEternas + ' · ' + relogio(J.tempoJogo) + ' · RECORDE ' + relogio(eterno.tempo), '#ffd24a', 600, 0.54);
  if (ranking.length && E.y < r.y + r.h - lh * 6) { E.pula(6); E.L('RECORDES DESTA MÁQUINA', k.c2, 800, 0.6); ranking.slice(0, 3).forEach((p, i) => E.L((i + 1) + '.  ' + Math.round(p).toLocaleString('pt-BR'), i ? '#cdd3f5' : '#ffd24a', 600, 0.54)); }
  // controles no pé da placa
  E.y = r.y + r.h - lh * 2.2;
  E.L('Z / ←  palheta esq.   ·   M / →  palheta dir.', '#8088aa', 500, 0.48); E.L('ESPAÇO lança   ·   ↑ sacode   ·   P pausa', '#8088aa', 500, 0.48);
  void t; void def;
}
