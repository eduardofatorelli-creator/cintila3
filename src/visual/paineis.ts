// Painéis laterais do desktop (layout "palco" da R05).
// Esquerda: identidade da máquina, compacta, logo abaixo do backbox. Direita: a partida, com hierarquia
// (bola/bônus → missão ativa → lista de missões → evoluções → recordes → instrução de lançamento → controles).
// Todo texto quebra linha em vez de ser cortado.
import type { Game } from '../game/rules';
import type { MachineDef } from '../machines/_schema';
import { relogio } from '../render/backbox';
import type { Ret } from '../render/cabinet';
import { rr } from '../render/cabinet';
import { alfa } from './pincel';
import { estadoMissao } from './estado';

type Ctx = CanvasRenderingContext2D;
const F = (peso: number, px: number) => `${peso} ${px}px Orbitron, sans-serif`;

/** quebra o texto na largura dada; devolve as linhas */
function linhas(c: Ctx, s: string, max: number): string[] {
  const out: string[] = []; let l = '';
  for (const p of s.split(' ')) { const t = l ? l + ' ' + p : p; if (c.measureText(t).width > max && l) { out.push(l); l = p; } else l = t; }
  if (l) out.push(l); return out;
}

function placa(c: Ctx, x: number, y: number, w: number, h: number, k: { c1: string; c2: string }) {
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(16,18,40,0.94)'); g.addColorStop(1, 'rgba(6,7,18,0.94)');
  rr(c, x, y, w, h, 12); c.fillStyle = g; c.fill();
  c.lineWidth = 1; c.strokeStyle = alfa(k.c2, 0.35); c.stroke();
  const gb = c.createLinearGradient(x, 0, x + w, 0); gb.addColorStop(0, alfa(k.c1, 0)); gb.addColorStop(0.5, alfa(k.c1, 0.9)); gb.addColorStop(1, alfa(k.c1, 0));
  c.fillStyle = gb; c.fillRect(x + 14, y, w - 28, 1.5);
}

/** escritor com quebra de linha; mede antes (seco) para saber a altura da placa */
function escritor(c: Ctx, x: number, w: number, base: number, seco: boolean) {
  let y = 0;
  const E = {
    get y() { return y; }, set y(v: number) { y = v; },
    t(s: string, cor: string, peso = 500, esc = 0.6, recuo = 0, alinha: CanvasTextAlign = 'left') {
      const px = Math.round(base * esc); c.font = F(peso, px); c.textBaseline = 'top'; c.textAlign = alinha;
      for (const l of linhas(c, s, w - recuo)) { if (!seco) { c.fillStyle = cor; c.fillText(l, alinha === 'right' ? x + w : x + recuo, y); } y += px * 1.32; }
    },
    rotulo(s: string, cor: string) { E.t(s, cor, 800, 0.44); y += 1; },
    pula(n: number) { y += n; },
  };
  return E;
}

export function painelEsquerdo(c: Ctx, r: Ret, J: Game, def: MachineDef, _mini: HTMLCanvasElement | null, t: number) {
  if (r.w < 220 || r.h < 120) return;
  const k = J.cores, base = Math.max(18, Math.min(28, r.w / 16.5)), pad = 16, x = r.x + pad, w = r.w - pad * 2;
  const conteudo = (E: ReturnType<typeof escritor>, seco: boolean) => {
    E.t(String(def.n).padStart(2, '0') + ' · ' + def.nome.toUpperCase(), k.c1, 800, 0.82);
    E.t(def.lema, '#c9d0f5', 500, 0.5); E.pula(8);
    const ch = J.m.chefe, ultima = ch.vida === 1 && !ch.c.off;
    const bloco = (rot: string, cor: string, nome: string, extra?: () => void) => { E.rotulo(rot, cor); E.t(nome, '#ffffff', 700, 0.56); extra?.(); E.pula(6); };
    bloco('ASSINATURA', k.c2, def.assinatura.nome, () => E.t(def.assinatura.dica, '#aab2d8', 500, 0.47));
    const pod = (J.sigs?.[0] as any)?.poderes as string[] | undefined; if (pod?.length) bloco('PODERES DESTA PARTIDA', '#fff36b', pod.join(' · ').toUpperCase());
    bloco('CHEFE', ultima ? '#ff5a72' : k.c2, def.chefe.nome, () => {
      const y = E.y + 2; if (!seco) for (let i = 0; i < Math.min(8, Math.max(0, ch.vida)); i++) { c.fillStyle = i === 0 && ultima && Math.floor(t * 4) % 2 ? '#ffffff' : '#ff4466'; rr(c, x + i * 15, y, 11, 7, 3); c.fill(); }
      E.pula(13); if (ch.c.off) E.t('derrubado · volta em instantes', '#aab2d8', 500, 0.45);
    });
    const lamp = (rot: string, nome: string, aceso: boolean, cor: string) => {
      const y = E.y + base * 0.22;
      if (!seco) { c.fillStyle = aceso ? cor : '#262a42'; c.beginPath(); c.arc(x + 5, y, 4.5, 0, Math.PI * 2); c.fill(); if (aceso) { c.fillStyle = alfa(cor, 0.28); c.beginPath(); c.arc(x + 5, y, 10, 0, Math.PI * 2); c.fill(); } }
      E.t(rot + ' · ' + nome, aceso ? '#ffffff' : '#8a92b8', aceso ? 700 : 500, 0.47, 16);
    };
    lamp('ANDAR DE CIMA', def.andar.nome, J.andarAceso, k.c1);
    lamp('MULTIBOLA', J.multibola ? 'ativa' : 'trave 2 bolas', J.multibola, '#ffd24a');
    lamp('MODO MAGO', def.mago.nome, J.mago, k.c3);
  };
  const S = escritor(c, x, w, base, true); conteudo(S, true);
  const h = Math.min(r.h, S.y + pad * 2);
  placa(c, r.x, r.y, r.w, h, k);
  c.save(); c.beginPath(); c.rect(r.x, r.y, r.w, h); c.clip();
  const E = escritor(c, x, w, base, false); E.y = r.y + pad; conteudo(E, false); c.restore();
}

let fantasma: Ctx | null = null;
export function painelDireito(c0: Ctx, r: Ret, J: Game, def: MachineDef, eterno: { tempo: number } | null, t: number, ranking: number[] = [], lancar = '') {
  if (r.w < 220 || r.h < 160) return;
  const k = J.cores, base = Math.max(18, Math.min(28, r.w / 16.5)), pad = 16, x = r.x + pad, w = r.w - pad * 2;
  // passa uma vez num contexto fantasma para medir a altura e ajustar a placa ao conteúdo
  if (!fantasma) fantasma = document.createElement('canvas').getContext('2d')!;
  const corpo = (c: Ctx) => {
    const E = escritor(c, x, w, base, false); E.y = r.y + pad;
    const bola = J.modo === 'eterno' ? 'RESERVA ' + J.vidasEternas + ' · ' + relogio(J.tempoJogo) : 'BOLA ' + Math.min(J.bola, J.bolasTotal) + ' DE ' + J.bolasTotal + (J.extras ? ' +' + J.extras : '');
    c.font = F(800, Math.round(base * 0.72)); c.textBaseline = 'top'; c.textAlign = 'left'; c.fillStyle = '#ffffff'; c.fillText(bola, x, E.y);
    c.textAlign = 'right'; c.fillStyle = k.c2; c.fillText('BÔNUS ' + J.bonusX + 'X', x + w, E.y); c.textAlign = 'left'; E.pula(base * 0.72 * 1.4);
    E.t('nível ' + J.nivel + (eterno ? ' · degrau ' + (J.degrau + 1) + ' · recorde ' + relogio(eterno.tempo) : '') + ' · travas ' + J.travas + ' de 2', '#aab2d8', 500, 0.46);
    E.pula(8);
    const M = estadoMissao(J), ativa = M.ativa ? M : null, by = E.y, bh0 = ativa ? base * 2.9 : base * 2.1;
    rr(c, x - 6, by - 4, w + 12, bh0, 9); c.fillStyle = ativa ? alfa(k.c1, 0.1) : 'rgba(255,255,255,0.03)'; c.fill(); c.strokeStyle = alfa(ativa ? k.c1 : '#8a92b8', 0.35); c.lineWidth = 1; c.stroke();
    E.y = by + 4;
    if (ativa) {
      E.rotulo('MISSÃO ATIVA', k.c1); E.t(ativa.nome.toUpperCase(), '#ffffff', 800, 0.6);
      const y = E.y + 2, bw = w - base * 3.6; c.fillStyle = '#1a1e38'; rr(c, x, y, bw, 7, 3.5); c.fill(); c.fillStyle = k.c1; rr(c, x, y, bw * Math.min(1, ativa.n / ativa.meta), 7, 3.5); c.fill();
      c.font = F(700, Math.round(base * 0.48)); c.textAlign = 'right'; c.fillStyle = ativa.tempo < 10 ? '#ff5577' : '#e8ecff'; c.fillText(ativa.n + '/' + ativa.meta + ' · ' + ativa.tempo + 's', x + w, y - 3); c.textAlign = 'left';
    } else { E.rotulo('MISSÃO', '#8a92b8'); E.t(M.todas ? 'todas cumpridas neste ciclo' : 'próxima: ' + M.proxima + ' · o PORTAL inicia', '#c9d0f5', 600, 0.5); }
    E.y = by + bh0 + 10;
    E.rotulo('MISSÕES · ' + M.feitas + ' DE ' + M.total, k.c2);
    J.missoes.forEach((m, i) => E.t((m.feita ? '✔ ' : i === J.missaoAtiva ? '▶ ' : '· ') + m.nome, m.feita ? k.c1 : i === J.missaoAtiva ? '#ffffff' : '#8a92b8', i === J.missaoAtiva ? 700 : 500, 0.5));
    E.pula(8); E.rotulo('EVOLUÇÕES', k.c2); E.t(J.nomesEvolucoes.join(' · ') || 'nenhuma ainda', '#cdd3f5', 500, 0.48);
    E.pula(8); E.rotulo('RECORDES DESTA MÁQUINA', k.c2);
    if (ranking.length) ranking.slice(0, 3).forEach((p, i) => E.t((i + 1) + '.  ' + Math.round(p).toLocaleString('pt-BR'), i ? '#cdd3f5' : '#ffd24a', 600, 0.5)); else E.t('nenhum ainda: o primeiro é seu', '#8a92b8', 500, 0.46);
    if (lancar) {
      E.pula(10); const a = 0.65 + Math.sin(t * 5) * 0.25, y0 = E.y; rr(c, x - 6, y0, w + 12, base * 1.6, 9); c.fillStyle = alfa(k.c1, 0.14 * a + 0.05); c.fill(); c.strokeStyle = alfa(k.c1, a); c.lineWidth = 1.5; c.stroke();
      E.y = y0 + base * 0.42; E.t(lancar, '#ffffff', 800, 0.5); E.y = y0 + base * 1.6;
    }
    E.pula(12);
    E.t('Z / ←  palheta esquerda  ·  M / →  palheta direita', '#8088aa', 500, 0.42);
    E.t('ESPAÇO  lança  ·  ↑  sacode  ·  P  pausa', '#8088aa', 500, 0.42);
    return E.y;
  };
  const fim = corpo(fantasma), h = Math.min(r.h, fim - r.y + pad);
  placa(c0, r.x, r.y, r.w, h, k);
  c0.save(); c0.beginPath(); c0.rect(r.x, r.y, r.w, h); c0.clip(); corpo(c0); c0.restore();
  void def;
}
