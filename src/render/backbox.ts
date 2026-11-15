// O backbox: arte de backglass em camadas com paralaxe e um painel de matriz de pontos com animações por evento.
import type { Anuncio, Game } from '../game/rules';
import { desenhaChefe } from '../game/elements';
import type { MachineDef } from '../machines/_schema';
import type { Ret } from './cabinet';
import { Tema, novaTela } from './tema';

type Ctx = CanvasRenderingContext2D;
const LW = 192, LH = 64, TAU = Math.PI * 2;
const F = (n: number) => `${n}px "Press Start 2P", monospace`;
const milhar = (n: number) => Math.round(n).toLocaleString('pt-BR');

function T(d: Ctx, s: string, x: number, y: number, tam = 8, cor = '#fff', al: CanvasTextAlign = 'center') { d.font = F(tam); d.textAlign = al; d.textBaseline = 'middle'; d.fillStyle = cor; d.fillText(s, Math.round(x), Math.round(y)); }
function cabe(d: Ctx, s: string, max: number, tam = 8) { d.font = F(tam); let t = tam; while (t > 5 && d.measureText(s).width > max) { t--; d.font = F(t); } return t; }
function TC(d: Ctx, s: string, y: number, tam = 8, cor = '#fff') { T(d, s, LW / 2, y, cabe(d, s, LW - 6, tam), cor); }
function barra(d: Ctx, x: number, y: number, w: number, h: number, u: number, cor: string) { d.strokeStyle = cor; d.lineWidth = 1; d.strokeRect(x + 0.5, y + 0.5, w, h); d.fillStyle = cor; d.fillRect(x + 2, y + 2, Math.max(0, (w - 3) * Math.min(1, u)), h - 3); }

interface Anim { a: Anuncio; t: number; dur: number }
type Desenho = (d: Ctx, u: number, a: Anuncio, k: { c1: string; c2: string; c3: string }, J: Game, t: number) => void;

/** Cada evento tem a sua animação. [duração, desenho] */
const ANIMS: Record<string, [number, Desenho]> = {
  chefeCai: [2.2, (d, u, a, k) => {
    for (let i = 0; i < 5; i++) { const r = (u * 1.4 - i * 0.12) * 110; if (r > 0) { d.strokeStyle = i % 2 ? k.c1 : '#fff'; d.lineWidth = 3 - i * 0.4; d.beginPath(); d.arc(96, 32, r, 0, TAU); d.stroke(); } }
    for (let i = 0; i < 40; i++) { const q = i * 2.4, r = u * (40 + (i * 37) % 90); d.fillStyle = i % 3 ? k.c3 : '#fff'; d.fillRect(96 + Math.cos(q) * r, 32 + Math.sin(q) * r * 0.5, 2, 2); }
    if (u > 0.35) { TC(d, 'NÚCLEO DESTRUÍDO', 24, 10, Math.floor(u * 20) % 2 ? '#fff' : k.c1); TC(d, (a.texto || '').toUpperCase() + ' · FASE ' + a.d.fase, 46, 7, k.c2); }
  }],
  chefeDano: [0.8, (d, u, a, k, J, t) => {
    const tr = (1 - u) * 5; d.save(); d.translate(34 + Math.sin(t * 60) * tr, 32 + Math.cos(t * 47) * tr); d.scale(24, 24); desenhaChefe(d, J.def.chefe.forma, k, t, 1 - u); d.restore();
    T(d, (a.texto || '').toUpperCase(), 68, 18, cabe(d, (a.texto || '').toUpperCase(), 120, 8), '#fff', 'left');
    for (let i = 0; i < Math.max(0, a.d.vida) + 1; i++) { d.fillStyle = i < a.d.vida ? '#ff4466' : Math.floor(u * 12) % 2 ? '#fff' : '#400'; d.fillRect(68 + i * 12, 32, 9, 9); }
    T(d, a.d.vida > 0 ? 'FALTAM ' + a.d.vida : 'CAIU!', 68, 52, 7, k.c1, 'left');
  }],
  chefeVolta: [1.4, (d, u, a, k, J, t) => { d.save(); d.translate(96, 30); d.scale(26 * Math.min(1, u * 2), 26 * Math.min(1, u * 2)); desenhaChefe(d, J.def.chefe.forma, k, t, 0); d.restore(); TC(d, (a.texto || '').toUpperCase() + ' VOLTOU', 57, 7, k.c1); }],
  missao: [1.8, (d, u, a, k) => { const x = Math.max(0, (1 - u * 3)) * LW; T(d, 'MISSÃO', 96 + x, 10, 8, k.c1); const s = (a.texto || '').toUpperCase(); T(d, s, 96 - x, 28, cabe(d, s, 184, 9), '#fff'); barra(d, 26, 42, 140, 9, 0, k.c2); T(d, '0/' + a.d.meta + ' · 48 S', 96, 58, 6, k.c3); }],
  missaoAvanca: [0.9, (d, u, a, k) => { const s = (a.texto || '').toUpperCase(); TC(d, s, 14, 8, '#fff'); barra(d, 16, 28, 160, 12, (a.d.n - 1 + Math.min(1, u * 3)) / a.d.meta, u < 0.4 ? '#fff' : k.c1); TC(d, a.d.n + ' DE ' + a.d.meta, 52, 8, k.c2); }],
  missaoOk: [2.0, (d, u, a, k) => { barra(d, 16, 6, 160, 10, 1, Math.floor(u * 16) % 2 ? '#fff' : k.c1); TC(d, 'MISSÃO CUMPRIDA', 30, 10, '#fff'); TC(d, (a.texto || '').toUpperCase(), 46, 7, k.c2); d.strokeStyle = k.c1; d.lineWidth = 3; d.beginPath(); const v = Math.min(1, u * 2.5); d.moveTo(84, 56); d.lineTo(84 + 8 * Math.min(1, v * 2), 56 + 5 * Math.min(1, v * 2)); if (v > 0.5) d.lineTo(92 + 16 * (v - 0.5) * 2, 61 - 10 * (v - 0.5) * 2); d.stroke(); }],
  missaoFalha: [1.3, (d, u, a, k) => { TC(d, 'TEMPO ESGOTADO', 22, 9, Math.floor(u * 8) % 2 ? '#ff5577' : '#fff'); TC(d, (a.texto || '').toUpperCase(), 44, 7, k.c3); }],
  sobe: [1.6, (d, u, a, k) => { for (let i = 0; i < 9; i++) { const y = ((i * 8 + u * 120) % 72); d.fillStyle = k.c3; d.globalAlpha = 0.5; d.fillRect(0, y, LW, 2); } d.globalAlpha = 1; d.fillStyle = k.c1; const y = 44 - u * 30; d.beginPath(); d.moveTo(96, y - 14); d.lineTo(116, y + 6); d.lineTo(104, y + 6); d.lineTo(104, y + 20); d.lineTo(88, y + 20); d.lineTo(88, y + 6); d.lineTo(76, y + 6); d.fill(); TC(d, a.d.origem === 'andar' ? 'ANDAR DE CIMA' : 'SUBFASE', 8, 8, '#fff'); }],
  fase: [1.8, (d, u, a, k) => { const [t1, t2] = (a.texto || '').split(' · '); TC(d, t1, 14, 10, Math.floor(u * 10) % 2 ? k.c1 : '#fff'); if (t2) TC(d, t2, 32, 8, k.c2); const z = 8 + Math.max(0, 1 - u * 3) * 14; TC(d, Math.round(a.d.dur) + ' S', 52, z, '#fff'); }],
  desce: [1.1, (d, u, a, k) => { for (let i = 0; i < 9; i++) { const y = ((i * 8 - u * 120) % 72 + 72) % 72; d.fillStyle = k.c3; d.globalAlpha = 0.5; d.fillRect(0, y, LW, 2); } d.globalAlpha = 1; TC(d, a.d.venceu ? 'VITÓRIA!' : 'DE VOLTA À MESA', 26, 10, a.d.venceu ? k.c1 : '#fff'); TC(d, (a.texto || '').split(' · ')[0], 46, 7, k.c2); }],
  bonus: [3.3, (d, u, a, k) => {
    const it = a.d.itens as [string, number][], n = Math.min(it.length, Math.floor(u * (it.length + 2)));
    for (let i = 0; i < 46; i++) { const x = (i * 53) % LW, y = ((i * 29) + u * 220) % 70; d.fillStyle = i % 2 ? k.c1 : k.c3; d.fillRect(x, y, 1, 3); }
    d.fillStyle = 'rgba(0,0,0,0.6)'; d.fillRect(8, 2, 176, 60);
    for (let i = 0; i < n; i++) { T(d, it[i][0], 14, 8 + i * 8, 6, k.c2, 'left'); T(d, milhar(it[i][1]), 178, 8 + i * 8, 6, '#fff', 'right'); }
    if (u > 0.72) { T(d, a.d.x + 'X', 14, 54, 8, k.c1, 'left'); T(d, milhar(a.d.total * Math.min(1, (u - 0.72) * 5)), 178, 54, 8, '#fff', 'right'); }
  }],
  fim: [7, (d, u, a, k, J, t) => {
    const rk = (J as any).ranking as number[] || [];
    if (u < 0.3) { TC(d, 'FIM DE JOGO', 20, 12, Math.floor(t * 6) % 2 ? k.c1 : '#fff'); TC(d, milhar(a.d.pontos), 46, 10, '#fff'); return; }
    T(d, 'RANKING', 96, 7, 7, k.c1); const rol = Math.max(0, (u - 0.5) * 30);
    rk.slice(0, 5).forEach((p, i) => { const y = 20 + i * 10 - rol * 0; const eu = p === a.d.pontos; T(d, (i + 1) + '.', 30, y, 7, eu ? k.c1 : k.c3, 'right'); T(d, milhar(p), 170, y, 7, eu && Math.floor(t * 5) % 2 ? '#fff' : eu ? k.c1 : '#bbb', 'right'); });
  }],
  jackpot: [1.5, (d, u, a, k, J, t) => { d.save(); d.translate(96, 32); d.rotate(t * 2); d.fillStyle = k.c1; d.globalAlpha = 0.45; for (let i = 0; i < 10; i++) { d.rotate(TAU / 10); d.beginPath(); d.moveTo(0, 0); d.lineTo(140, -12); d.lineTo(140, 12); d.fill(); } d.restore(); d.globalAlpha = 1; TC(d, 'JACKPOT', 26, 14 + Math.sin(u * 30) * 3, '#fff'); TC(d, '60.000', 50, 8, '#ffd24a'); }],
  super: [2.2, (d, u, a, k, J, t) => { d.fillStyle = Math.floor(t * 14) % 2 ? '#fff' : '#ffd24a'; d.fillRect(0, 0, LW, LH); d.fillStyle = '#000'; d.fillRect(4, 4, LW - 8, LH - 8); for (let i = 0; i < 24; i++) { d.fillStyle = '#ffd24a'; d.fillRect((i * 41 + t * 90) % LW, (i * 17) % LH, 3, 1); } TC(d, 'SUPER', 20, 14, '#ffd24a'); TC(d, 'JACKPOT', 42, 14, '#fff'); TC(d, '250.000', 58, 6, k.c1); }],
  superAceso: [1.2, (d, u, a, k) => { TC(d, 'SUPER JACKPOT', 20, 9, '#ffd24a'); TC(d, 'ACESO NO CHEFE', 42, 8, Math.floor(u * 10) % 2 ? '#fff' : k.c1); }],
  multibola: [2.2, (d, u, a, k, J, t) => { for (let i = 0; i < 3; i++) { const x = ((t * 90 + i * 64) % 230) - 20, y = 32 + Math.abs(Math.sin(t * 5 + i * 2)) * -22 + 20; for (let j = 0; j < 5; j++) { d.globalAlpha = 1 - j * 0.2; d.fillStyle = [k.c1, k.c2, k.c3][i]; d.beginPath(); d.arc(x - j * 6, y, 5 - j * 0.6, 0, TAU); d.fill(); } } d.globalAlpha = 1; d.fillStyle = 'rgba(0,0,0,0.55)'; d.fillRect(0, 18, LW, 22); TC(d, 'MULTIBOLA', 30, 14, Math.floor(t * 8) % 2 ? '#fff' : '#ffd24a'); }],
  multibolaFim: [1.2, (d, u, a, k) => { TC(d, 'FIM DA MULTIBOLA', 32, 8, k.c2); d.fillStyle = k.c3; d.fillRect(96 - 80 * (1 - u), 46, 160 * (1 - u), 2); }],
  evolucao: [2.0, (d, u, a, k) => { for (let i = 0; i < 7; i++) { const x = 14 + i * 28, y = ((60 - u * 150 - i * 9) % 70 + 70) % 70; d.fillStyle = i % 2 ? k.c1 : k.c3; d.beginPath(); d.moveTo(x, y); d.lineTo(x + 7, y + 8); d.lineTo(x - 7, y + 8); d.fill(); } d.fillStyle = 'rgba(0,0,0,0.6)'; d.fillRect(0, 14, LW, 38); TC(d, 'EVOLUÇÃO', 22, 8, k.c1); TC(d, (a.texto || '').toUpperCase(), 36, 9, '#fff'); TC(d, (a.d?.texto || '').toUpperCase(), 48, 5, k.c2); }],
  bolaExtra: [2.0, (d, u, a, k) => { for (let i = 0; i < 3; i++) { d.strokeStyle = k.c1; d.globalAlpha = Math.max(0, 1 - ((u * 2 + i * 0.3) % 1)); d.lineWidth = 2; d.beginPath(); d.arc(34, 32, 10 + ((u * 2 + i * 0.3) % 1) * 26, 0, TAU); d.stroke(); } d.globalAlpha = 1; const g = d.createRadialGradient(31, 29, 1, 34, 32, 11); g.addColorStop(0, '#fff'); g.addColorStop(1, '#667'); d.fillStyle = g; d.beginPath(); d.arc(34, 32, 11, 0, TAU); d.fill(); T(d, 'BOLA', 118, 22, 12, '#fff'); T(d, 'EXTRA', 118, 42, 12, k.c1); }],
  repete: [1.5, (d, u, a, k) => { TC(d, 'JOGUE DE NOVO', 32, 10, Math.floor(u * 8) % 2 ? k.c1 : '#fff'); }],
  tilt: [2.5, (d, u, a, k, J, t) => { const inv = Math.floor(t * 10) % 2; d.fillStyle = inv ? '#ff2244' : '#000'; d.fillRect(0, 0, LW, LH); T(d, 'TILT', 96 + Math.sin(t * 70) * 5, 32 + Math.cos(t * 53) * 3, 26, inv ? '#000' : '#ff2244'); }],
  aviso: [1.0, (d, u, a, k, J, t) => { for (const x of [26, 166]) { d.fillStyle = Math.floor(t * 8) % 2 ? '#ffd24a' : '#553'; d.beginPath(); d.moveTo(x, 16); d.lineTo(x + 16, 46); d.lineTo(x - 16, 46); d.fill(); T(d, '!', x + 1, 36, 12, '#000'); } TC(d, 'CUIDADO', 32, 10, '#ffd24a'); }],
  salva: [1.4, (d, u, a, k) => { d.strokeStyle = '#7dffb0'; d.lineWidth = 4; d.beginPath(); d.arc(96, 70, 60, Math.PI + (1 - Math.min(1, u * 2.5)) * Math.PI / 2, TAU - (1 - Math.min(1, u * 2.5)) * Math.PI / 2); d.stroke(); TC(d, 'BOLA SALVA', 34, 11, '#fff'); }],
  mago: [2.6, (d, u, a, k, J, t) => { if (u < 0.2 || Math.floor(t * 9) % 4 === 0) { d.fillStyle = '#fff'; d.globalAlpha = 0.85 * (1 - u); d.fillRect(0, 0, LW, LH); d.globalAlpha = 1; } const s = (a.texto || '').toUpperCase(), tam = cabe(d, s, 180, 12), w = d.measureText(s).width; let x = 96 - w / 2; for (let i = 0; i < s.length; i++) { const v = Math.min(1, Math.max(0, u * 3 - i * 0.08)); const cw = d.measureText(s[i]).width; T(d, s[i], x + cw / 2, -10 + v * 36, tam, i % 2 ? k.c1 : '#fff'); x += cw; } TC(d, 'MODO MAGO · ' + a.d.meta + ' GOLPES', 50, 6, k.c2); }],
  magoVence: [3, (d, u, a, k, J, t) => { for (let i = 0; i < 30; i++) { d.fillStyle = [k.c1, k.c2, k.c3, '#fff'][i % 4]; d.fillRect((i * 67 + Math.sin(t * 3 + i) * 10) % LW, (i * 23 + t * 50) % LH, 3, 3); } d.fillStyle = 'rgba(0,0,0,0.6)'; d.fillRect(0, 14, LW, 36); TC(d, 'MAGO VENCIDO!', 24, 11, '#fff'); TC(d, 'PRÓXIMA MÁQUINA LIBERADA', 42, 6, k.c1); }],
  magoFim: [1.5, (d, u, a, k) => { TC(d, (a.texto || '').toUpperCase(), 22, 9, k.c2); TC(d, 'O TEMPO ACABOU', 44, 8, '#fff'); }],
  certeiro: [1.6, (d, u, a, k) => { const r = 40 * (1 - Math.min(1, u * 2)) + 12; d.strokeStyle = k.c1; d.lineWidth = 2; d.beginPath(); d.arc(30, 32, r, 0, TAU); d.moveTo(30 - r - 5, 32); d.lineTo(30 + r + 5, 32); d.moveTo(30, 32 - r - 5); d.lineTo(30, 32 + r + 5); d.stroke(); T(d, 'TIRO', 120, 22, 12, '#fff'); T(d, 'CERTEIRO', 120, 42, 10, k.c1); }],
  combo: [1.0, (d, u, a, k) => { const n = Math.min(8, a.d.n); for (let i = 0; i < n; i++) { const x = 96 - n * 9 + i * 18 + 4; d.fillStyle = u * n > i ? (a.d.alterna ? '#ffd24a' : k.c1) : '#333'; d.beginPath(); d.moveTo(x, 8); d.lineTo(x + 9, 18); d.lineTo(x, 28); d.lineTo(x + 5, 18); d.fill(); } TC(d, 'COMBO ' + a.d.n + (a.d.alterna ? ' · DOBRO' : ''), 48, 9, '#fff'); }],
  trava: [1.4, (d, u, a, k) => { for (let i = 0; i < 2; i++) { d.strokeStyle = k.c1; d.lineWidth = 2; d.beginPath(); d.arc(70 + i * 52, 22, 13, 0, TAU); d.stroke(); if (i < a.d.n) { d.fillStyle = i === a.d.n - 1 && Math.floor(u * 10) % 2 ? '#fff' : k.c1; d.beginPath(); d.arc(70 + i * 52, 22, 9, 0, TAU); d.fill(); } } TC(d, a.d.n >= 2 ? 'MULTIBOLA!' : 'BOLA TRAVADA', 52, 9, '#fff'); }],
  andarAceso: [2.0, (d, u, a, k) => { for (let i = 0; i < 6; i++) { d.fillStyle = u * 8 > i ? k.c1 : '#223'; d.fillRect(10 + i * 14, 54 - i * 9, 13, 8); } T(d, 'ANDAR DE', 138, 14, 8, '#fff'); T(d, 'CIMA ACESO', 138, 28, 8, k.c1); T(d, 'RAMPA DIREITA', 138, 46, 6, Math.floor(u * 10) % 2 ? '#fff' : k.c2); T(d, 'OU PORTAL', 138, 56, 6, k.c2); }],
  degrau: [2.0, (d, u, a, k) => { d.strokeStyle = k.c3; d.lineWidth = 2; d.beginPath(); d.moveTo(20, 4); d.lineTo(20, 60); d.moveTo(44, 4); d.lineTo(44, 60); for (let i = 0; i < 6; i++) { const y = (i * 12 + u * 24) % 64; d.moveTo(20, y); d.lineTo(44, y); } d.stroke(); T(d, (a.texto || ''), 120, 24, 11, '#fff'); T(d, 'MAIS DIFÍCIL', 120, 44, 7, k.c1); }],
  bonusX: [1.0, (d, u, a, k) => { const s = (a.texto || '').replace('BÔNUS ', ''); T(d, s, 96, 26, 22 + (1 - Math.min(1, u * 3)) * 16, k.c1); TC(d, 'BÔNUS', 54, 8, '#fff'); }],
  assinatura: [1.1, (d, u, a, k) => { const x = Math.min(1, u * 4) * LW; d.fillStyle = k.c2; d.beginPath(); d.moveTo(0, 16); d.lineTo(x, 16); d.lineTo(x - 14, 48); d.lineTo(0, 48); d.fill(); d.fillStyle = k.c1; d.fillRect(0, 14, x, 2); d.fillRect(0, 48, x - 14, 2); if (u > 0.2) TC(d, (a.texto || '').toUpperCase(), 32, 10, '#000'); }],
  assinaturaTotal: [2.4, (d, u, a, k, J, t) => { for (let i = 0; i < 8; i++) { d.fillStyle = i % 2 ? k.c1 : k.c3; d.globalAlpha = 0.5; d.fillRect(((i * 30 + t * 60) % 240) - 30, 0, 14, LH); } d.globalAlpha = 1; d.fillStyle = 'rgba(0,0,0,0.7)'; d.fillRect(0, 18, LW, 28); const s = (a.texto || '').toUpperCase(); if (d.measureText(s).width > 0) { const tam = cabe(d, s, 100000, 9), w = d.measureText(s).width; if (w > LW - 8) T(d, s, LW - u * (w + LW), 32, tam, '#fff', 'left'); else TC(d, s, 32, 9, '#fff'); } }],
  poste: [0.9, (d, u, a, k) => { const y = 40 - Math.abs(Math.sin(u * 9)) * 16 * (1 - u); d.fillStyle = '#7dffb0'; d.fillRect(22, y, 12, 20); d.beginPath(); d.arc(28, y, 6, 0, TAU); d.fill(); T(d, 'POSTE', 116, 22, 10, '#fff'); T(d, 'DEFENDEU', 116, 42, 10, '#7dffb0'); }],
  resgate: [1.0, (d, u, a, k) => { const y = 60 - u * 80; d.fillStyle = '#7dffb0'; for (let i = 0; i < 3; i++) { d.beginPath(); d.moveTo(28, y + i * 16); d.lineTo(42, y + 12 + i * 16); d.lineTo(14, y + 12 + i * 16); d.fill(); } T(d, 'RESGATE!', 118, 32, 12, '#fff'); }],
  inicio: [2.2, (d, u, a, k) => { const s = (a.texto || '').toUpperCase(), tam = cabe(d, s, 184, 14); T(d, s, 96, 26, tam, k.c1); d.fillStyle = '#000'; d.fillRect(LW * Math.min(1, u * 2.2), 8, LW, 36); d.fillStyle = '#fff'; d.fillRect(LW * Math.min(1, u * 2.2) - 2, 8, 2, 36); if (u > 0.5) TC(d, 'BOA SORTE', 54, 7, '#fff'); }],
  bola: [1.3, (d, u, a, k) => { const x = (1 - Math.min(1, u * 3)) * -LW; T(d, a.texto || '', 96 + x, 32, 14, '#fff'); d.fillStyle = k.c1; d.fillRect(0, 50, LW * Math.min(1, u * 2), 2); }],
  ataque: [1.3, (d, u, a, k, J, t) => { d.fillStyle = Math.floor(t * 10) % 2 ? '#ff2244' : '#000'; d.fillRect(0, 0, LW, 6); d.fillRect(0, 58, LW, 6); TC(d, 'ATAQUE DO CHEFE', 22, 8, '#ff5577'); TC(d, a.texto || '', 42, 10, '#fff'); }],
  chuva: [1.8, (d, u, a, k, J, t) => { for (let i = 0; i < 26; i++) { const x = (i * 47) % LW, y = ((i * 31) + t * 120) % 80 - 8; d.fillStyle = i % 3 ? k.c1 : '#fff'; d.fillRect(x, y, 2, 2); d.globalAlpha = 0.4; d.fillRect(x + 1, y - 6, 1, 6); d.globalAlpha = 1; } d.fillStyle = 'rgba(0,0,0,0.6)'; d.fillRect(0, 20, LW, 24); TC(d, 'CHUVA DE ESTRELAS', 32, 9, '#fff'); }],
  atalho: [2.4, (d, u, a, k) => { const ab = Math.min(1, u * 2) * 60; d.fillStyle = k.c1; d.fillRect(96 - ab, 4, ab * 2, 56); d.fillStyle = '#000'; d.fillRect(96 - ab + 2, 6, ab * 2 - 4, 52); d.fillStyle = k.c3; d.fillRect(96 - ab - 30, 4, 30, 56); d.fillRect(96 + ab, 4, 30, 56); if (u > 0.4) { TC(d, 'ATALHO', 24, 10, '#fff'); TC(d, 'ABERTO', 42, 10, k.c1); } }],
  escolha: [1.0, (d, u, a, k) => { TC(d, a.texto || '', 24, 8, '#fff'); TC(d, '◀ PALHETAS ▶', 44, 7, Math.floor(u * 8) % 2 ? k.c1 : k.c2); }],
  dica: [1.2, (d, u, a, k) => { d.strokeStyle = k.c1; d.strokeRect(6.5, 14.5, LW - 13, 34); TC(d, a.texto || '', 32, 7, Math.floor(u * 8) % 2 ? '#fff' : k.c1); }],
};

export class Backbox {
  private dmdTela: HTMLCanvasElement; private d: Ctx; private fila: Anim[] = []; private atual: Anim | null = null;
  camadas: HTMLCanvasElement[] = []; private mascara: HTMLCanvasElement | null = null; private mascW = 0;
  constructor() { [this.dmdTela, this.d] = novaTela(LW, LH); }
  /** pinta a arte de backglass da máquina em 3 camadas */
  static vidro(def: MachineDef, w = 400, h = 228, esc = 2): HTMLCanvasElement[] {
    const telas = [0, 1, 2].map(() => novaTela(w, h, esc)), t = new Tema(telas[0][1], def.paleta, w, h, telas.map(x => x[1]));
    def.vidro(telas[0][1], t); return telas.map(x => x[0]);
  }
  carrega(def: MachineDef) { this.camadas = Backbox.vidro(def); this.fila = []; this.atual = null; }
  recebe(an: Anuncio[]) {
    for (const a of an) {
      if (!ANIMS[a.tipo]) continue;
      const dur = ANIMS[a.tipo][0];
      if (a.tipo === 'missaoAvanca' || a.tipo === 'chefeDano' || a.tipo === 'combo' || a.tipo === 'assinatura' || a.tipo === 'poste') { if (this.fila.length > 1) continue; }
      if (a.tipo === 'fim' || a.tipo === 'tilt' || a.tipo === 'bonus') this.fila = [];
      this.fila.push({ a, t: 0, dur }); if (this.fila.length > 5) this.fila.splice(0, this.fila.length - 5);
    }
    an.length = 0;
  }
  passo(dt: number) {
    if (this.atual) { this.atual.t += dt * (this.fila.length > 2 ? 1.8 : 1); if (this.atual.t >= this.atual.dur) this.atual = null; }
    if (!this.atual && this.fila.length) this.atual = this.fila.shift()!;
  }
  get ocupado() { return !!this.atual; }

  private base(d: Ctx, J: Game, t: number) {
    const k = J.cores, ch = J.m.chefe;
    d.save(); d.translate(15, 15); d.scale(11, 11); if (!ch.c.off) desenhaChefe(d, J.def.chefe.forma, k, t, ch.dor); d.restore();
    for (let i = 0; i < Math.min(8, ch.vida); i++) { d.fillStyle = '#ff4466'; d.fillRect(3 + i * 4, 30, 3, 3); }
    const s = milhar(J.pontos); T(d, s, 188, 13, cabe(d, s, 150, 16), '#fff', 'right');
    const S = J.sub;
    if (S) {
      // durante a fase em outro campo: contagem regressiva, progresso e a mesa de baixo em miniatura
      T(d, Math.ceil(S.resta) + '', 56, 44, 14, S.resta < 6 && Math.floor(t * 4) % 2 ? '#ff5577' : k.c1);
      T(d, S.dica, 76, 38, cabe(d, S.dica, 82, 6), '#fff', 'left'); barra(d, 76, 46, 80, 7, S.progresso, k.c2);
      if (S.ataque) T(d, S.ataque.toUpperCase(), 76, 59, 5, '#ff5577', 'left');
      d.strokeStyle = k.c3; d.strokeRect(164.5, 26.5, 24, 36); d.fillStyle = k.c3; d.globalAlpha = 0.6;
      for (const sg of J.mesa.segs) if (!sg.invisivel && !sg.dono) { d.fillRect(165 + sg.ax / 400 * 23, 27 + sg.ay / 760 * 35, 1, 1); }
      d.globalAlpha = 1; d.fillStyle = '#fff'; for (const b of J.mesa.bolas) d.fillRect(164 + b.x / 400 * 23, 26 + b.y / 760 * 35, 2, 2);
      return;
    }
    if (J.mago) { T(d, J.def.mago.nome.toUpperCase(), 34, 30, cabe(d, J.def.mago.nome.toUpperCase(), 150, 7), Math.floor(t * 6) % 2 ? '#fff' : k.c1, 'left'); T(d, Math.ceil(J.magoT) + 'S', 34, 44, 10, '#fff', 'left'); barra(d, 76, 39, 110, 9, J.magoN / J.def.mago.regra.meta, k.c1); T(d, J.magoN + '/' + J.def.mago.regra.meta + ' GOLPES', 188, 57, 6, k.c2, 'right'); return; }
    const m = J.missoes[J.missaoAtiva];
    const esq = J.modo === 'eterno' ? 'DEGRAU ' + (J.degrau + 1) + ' · ' + relogio(J.tempoJogo) : 'BOLA ' + Math.min(J.bola, J.bolasTotal) + (J.extras ? '+' + J.extras : '');
    T(d, esq, 34, 30, 7, k.c1, 'left'); T(d, J.bonusX + 'X', 188, 30, 7, k.c2, 'right');
    if (J.dobro > 0) T(d, 'DOBRO ' + Math.ceil(J.dobro), 130, 30, 6, '#ffd24a');
    if (m) { const s2 = m.nome.toUpperCase(); T(d, s2, 4, 42, cabe(d, s2, 120, 6), '#fff', 'left'); T(d, Math.ceil(J.missaoT) + 'S', 188, 42, 6, J.missaoT < 10 ? '#ff5577' : k.c3, 'right'); barra(d, 4, 49, 150, 8, m.n / m.meta, k.c1); T(d, m.n + '/' + m.meta, 188, 54, 6, '#fff', 'right'); return; }
    const sg = J.sigs[0], linhas: string[] = [];
    if (J.andarAceso) linhas.push('ANDAR DE CIMA ACESO: RAMPA DIREITA');
    if (J.camaraAcesa) linhas.push('CÂMARA ALTA: RAMPA ESQUERDA');
    if (J.multibola) linhas.push('MULTIBOLA: RAMPAS E ÓRBITAS DÃO JACKPOT');
    if (sg?.info) linhas.push(sg.info());
    if (J.salva > 0 && J.estado === 'jogo') linhas.push('BOLA PROTEGIDA ' + Math.ceil(J.salva) + ' S');
    linhas.push(J.def.assinatura.dica.toUpperCase());
    const l = linhas[Math.floor(t / 2.6) % linhas.length] || '';
    T(d, l, 96, 43, cabe(d, l, 186, 6), '#fff');
    if (sg?.medidor) barra(d, 30, 51, 132, 7, sg.medidor(), k.c3);
    else { for (let i = 0; i < 5; i++) { d.fillStyle = J.missoes[i].feita ? k.c1 : '#334'; d.fillRect(60 + i * 15, 52, 12, 6); } }
  }

  desenha(c: Ctx, r: Ret, J: Game | null, t: number, px = 0.5, py = 0.5, atracao?: (d: Ctx, t: number) => void) {
    const k = J ? J.cores : { c1: '#7df9ff', c2: '#b48cff', c3: '#ff6fb5' }, m = Math.max(4, r.h * 0.035);
    // moldura do gabinete e arte de backglass em paralaxe
    c.fillStyle = '#0a0c18'; c.fillRect(r.x, r.y, r.w, r.h);
    c.save(); c.beginPath(); c.rect(r.x + m, r.y + m, r.w - m * 2, r.h - m * 2); c.clip();
    this.camadas.forEach((tela, i) => { const d = (i + 1) * 3 * (r.w / 400); c.drawImage(tela, r.x + m - d + (0.5 - px) * d * 2, r.y + m - d * 0.5 + (0.5 - py) * d, r.w - m * 2 + d * 2, r.h - m * 2 + d); });
    const gs = c.createLinearGradient(0, r.y, 0, r.y + r.h); gs.addColorStop(0, 'rgba(0,0,0,0)'); gs.addColorStop(0.5, 'rgba(0,0,0,0.05)'); gs.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = gs; c.fillRect(r.x, r.y, r.w, r.h);
    c.restore();
    c.strokeStyle = k.c2; c.lineWidth = Math.max(2, m * 0.5); c.strokeRect(r.x + m / 2, r.y + m / 2, r.w - m, r.h - m);
    // painel de matriz de pontos
    const dw = Math.min(r.w - m * 4, (r.h * 0.5) * 3), dh = dw / 3, dx = r.x + (r.w - dw) / 2, dy = r.y + r.h - dh - m * 1.6, d = this.d;
    d.setTransform(1, 0, 0, 1, 0, 0); d.globalAlpha = 1; d.fillStyle = '#06030a'; d.fillRect(0, 0, LW, LH);
    if (this.atual) { const A = this.atual; d.save(); ANIMS[A.a.tipo][1](d, A.t / A.dur, A.a, k, J!, t); d.restore(); d.globalAlpha = 1; }
    else if (J) this.base(d, J, t); else if (atracao) atracao(d, t);
    c.fillStyle = '#000'; c.fillRect(dx - 4, dy - 4, dw + 8, dh + 8); c.strokeStyle = '#2a2e4a'; c.lineWidth = 2; c.strokeRect(dx - 4, dy - 4, dw + 8, dh + 8);
    c.imageSmoothingEnabled = false; c.drawImage(this.dmdTela, dx, dy, dw, dh); c.imageSmoothingEnabled = true;
    c.drawImage(this.grade(Math.round(dw)), dx, dy, dw, dh);
  }
  /** grade de pontos por cima do painel */
  private grade(w: number): HTMLCanvasElement {
    if (this.mascara && this.mascW === w) return this.mascara;
    const h = Math.round(w / 3), [tela, c] = novaTela(w, h), p = w / LW;
    c.fillStyle = 'rgba(0,0,0,0.78)'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-out';
    if (p >= 2.2) { c.beginPath(); for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) { c.moveTo((x + 0.5) * p + p * 0.42, (y + 0.5) * p); c.arc((x + 0.5) * p, (y + 0.5) * p, p * 0.42, 0, TAU); } c.fill(); }
    else c.fillRect(0, 0, w, h);
    this.mascara = tela; this.mascW = w; return tela;
  }
}
export function relogio(s: number) { const m = Math.floor(s / 60); return m + ':' + String(Math.floor(s % 60)).padStart(2, '0'); }
export { T as textoDmd, TC as centroDmd, LW, LH, milhar };
