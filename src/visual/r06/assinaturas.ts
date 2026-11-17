// R06 · Efeitos contínuos ligados à mecânica-assinatura, lendo só o estado real (medidores da assinatura, batida,
// rotação do vinil, cabines da roda, modo mago). Os efeitos de evento ficam em visual/eventos.ts.
import type { Game } from '../../game/rules';
import type { Pintor } from '../../render/playfield';
import { alfa } from '../pincel';
import { luzMacia, poe, sprite } from '../r05/sprites';
import type { PalR06 } from './paleta';

const TAU = Math.PI * 2;
const NOMES: Record<string, string> = { ima: 'ÍMÃ', roda: 'RODA', boca: 'BOCA', braco: 'BRAÇO', pas: 'PÁS', poco: 'POÇO', vinil: 'VINIL', flores: 'FLORES', trilhos: 'TRILHOS', criaturas: 'CRIATURAS', caveira: 'CAVEIRA', escudos: 'ESCUDOS', salta: 'SALTO', compasso: 'COMPASSO', calor: 'CALOR', aceleracao: 'TURBO', salto: 'RAMPA SALTO', serpente: 'SERPENTE', cartas: 'CARTAS' };
/** R06.1: os seis poderes vêm do dado estruturado da assinatura (J.sigs[0].poderes), não do texto do anúncio */
export function registraAnuncio(_J: Game, _tipo: string, _texto?: string) { /* mantido por compatibilidade; não lê mais texto */ }
export const poderesDe = (J: { sigs: { poderes?: readonly string[] }[] }): string[] => (J.sigs?.[0]?.poderes ? [...J.sigs[0].poderes!] : []);
export const nomePoder = (p: string) => NOMES[p] || p.toUpperCase().slice(0, 7);
const medidor = (J: Game) => { try { return J.sigs[0]?.medidor?.() ?? 0; } catch { return 0; } };

export function efeitoContinuo(g: Pintor, J: Game, P: PalR06) {
  const c = g.c, t = g.t, tipo = J.def.assinatura.tipo, ch = J.m.chefe;
  const poca = (x: number, y: number, r: number, cor: string, a: number) => { if (a <= 0.02) return; const [X, Y, K] = g.p(x, y, 0); c.save(); c.globalCompositeOperation = 'lighter'; poe(c, luzMacia(cor, r * K), X, Y, Math.min(1, a)); c.restore(); };
  const anel = (x: number, y: number, r: number, cor: string, a: number, l = 2) => { const [X, Y, K] = g.p(x, y, 1); c.save(); c.globalAlpha = Math.min(1, a); c.strokeStyle = cor; c.lineWidth = l * K; c.beginPath(); c.ellipse(X, Y, r * K, r * K * 0.82, 0, 0, TAU); c.stroke(); c.restore(); };
  if (tipo === 'compasso') { const b = J.batida(), u = b < 0.5 ? b : 1 - b; anel(ch.x, ch.y, 30 + b * 80, P.luz, (1 - b) * 0.5); poca(ch.x, ch.y + 30, 70, '#ff4fd8', u < 0.17 ? 0.35 : 0.08); }
  else if (tipo === 'calor') { const m = medidor(J); poca(ch.x, ch.y, 50 + m * 60, m > 0.8 ? '#ff7a1a' : P.luz, 0.12 + m * 0.5); }
  else if (tipo === 'aceleracao') { const m = medidor(J); if (m > 0) for (const x of [37, 343]) for (let i = 0; i < 4; i++) { const y = 480 - ((t * 400 * (0.5 + m) + i * 90) % 360); const a = g.p(x, y, 2), b = g.p(x, y + 26, 2); c.save(); c.globalAlpha = 0.25 + m * 0.5; c.strokeStyle = P.luz; c.lineWidth = 2 * a[2]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.restore(); } }
  else if (tipo === 'vinil') { const v = J.mesa.pecas.find((q: any) => q.tipo === 'rodaDeVinil') as any; if (v) { const rpm = Math.min(1, Math.abs(v.w) / 9); for (let k = 0; k < 3; k++) anel(v.x, v.y, v.R + 4 + ((t * (20 + rpm * 60) + k * 12) % 36), P.luz, (0.15 + rpm * 0.35) * (1 - k / 3), 1.4); } }
  else if (tipo === 'roda') { const r = J.mesa.pecas.find((q: any) => q.tipo === 'rodaGigante') as any; if (r && r.presas > 0) for (let i = 0; i < 24; i++) { const q = i / 24 * TAU, on = Math.floor(t * 12 + i) % 4 < r.presas; if (!on) continue; const [X, Y, K] = g.p(r.x + Math.cos(q) * (r.R + 8), r.y + Math.sin(q) * (r.R + 8), 2); c.fillStyle = '#ffe45c'; c.beginPath(); c.arc(X, Y, 1.8 * K, 0, TAU); c.fill(); } }
  else if (tipo === 'relampago') {
    // seis selos com os poderes efetivamente sorteados nesta partida
    // seis selos com os poderes realmente sorteados (dado estruturado); cada selo é um sprite em cache
    const pod = poderesDe(J); if (pod.length) pod.slice(0, 6).forEach((p, i) => {
      const q = -Math.PI / 2 + i / 6 * TAU, x = ch.x0 + Math.cos(q) * 74, y = ch.y0 + Math.sin(q) * 64, [X, Y, K] = g.p(x, y, 1);
      if (!g.semBrilho) poca(x, y, 18, P.luz, 0.25 + Math.max(0, Math.sin(t * 2 + i)) * 0.2);
      poe(c, selo(nomePoder(p), K), X, Y);
    });
  }
  // modo mago: um feixe da cor da máquina varre a mesa (momento extraordinário, sem piscar)
  if (J.mago && !g.semBrilho) { const x = 200 + Math.sin(t * 0.9) * 150; poca(x, 380, 160, P.luz, 0.18); }
  void alfa;
}

/** selo hexagonal com o nome do poder (sprite por nome e escala) */
function selo(nome: string, K: number) {
  const k = Math.round(K * 8) / 8;
  return sprite(`selo|${nome}|${k}`, 24 * k, 22 * k, 12 * k, 11 * k, c => {
    c.fillStyle = 'rgba(10,12,40,0.88)'; c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.lineTo(Math.cos(a) * 10 * k, Math.sin(a) * 8.5 * k); } c.closePath(); c.fill();
    c.strokeStyle = '#fff36b'; c.lineWidth = 1.2 * k; c.stroke();
    c.font = `800 ${Math.max(4.5, 3.6 * k)}px Orbitron, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff6c0'; c.fillText(nome, 0, 0.3 * k);
  });
}
