// R06 · Tablados premium das 29 máquinas (a Aurora mantém o seu, aprovado na R05).
// Cada receita pinta ambiente + foco ligado à mecânica real (posições lidas da mesa montada) e devolve o metal da placa do chefe.
// O acabamento comum (luz geral, insertos de estado, setas, contraste) vem de finaliza().
import type { InfoMesa } from '../cenas';
import type { Pincel } from '../pincel';
import { cortinas, estrelas, observatorio, pinheiros, serra } from '../r05/aurora-arte';
import { Ctx, TAU, alfa, arco, brilho, chapas, cidade, cristal, degrade, engrenagem, estrelaGravada, feixe, lampada, lampadas, lona, madeira, nevoaRuido, nuvens, pedras, rnd, sombra, textura, tom, tubo } from './arte';
import type { PalR06 } from './paleta';

export type Receita = (c: Ctx, p: Pincel, m: InfoMesa, P: PalR06) => { placa: string; texto?: string };
const acha = (m: InfoMesa, t: string) => m.pecas.filter(q => q.tipo === t);
const sig = (m: InfoMesa, t: string) => acha(m, t)[0] || { x: 190, y: 456 };
const W = 400, H = 760;

export const RECEITAS: Record<string, Receita> = {
  // ===== Grupo 1 =====
  'passo-lunar'(c, p, m) {
    degrade(c, W, H, [[0, '#05020f'], [0.4, '#160830'], [0.62, '#24143e'], [1, '#08040f']]);
    estrelas(c, W, 0, 300, 21, 900);
    // a Terra nascendo e um anel de luz rosa
    brilho(c, 300, 110, 120, '#4dd2ff', 0.25); const g = c.createRadialGradient(285, 95, 5, 300, 110, 46); g.addColorStop(0, '#9fe0ff'); g.addColorStop(0.5, '#2a6ac8'); g.addColorStop(1, '#0a1a40'); c.fillStyle = g; c.beginPath(); c.arc(300, 110, 46, 0, TAU); c.fill();
    nevoaRuido(c, 254, 64, 92, 92, 7, ['#2a8a4a', '#5ac87a'], 0.7, (u, v) => (Math.hypot(u - 0.5, v - 0.5) < 0.48 ? 1 : 0), 0.5);
    // solo lunar com relevo de ruído e crateras chanfradas
    c.fillStyle = '#3a3650'; c.beginPath(); c.moveTo(0, 330); for (let x = 0; x <= W; x += 10) c.lineTo(x, 322 + Math.sin(x * 0.03) * 8 + Math.sin(x * 0.11) * 3); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    textura(c, 0, 320, W, 440, 12, ['#1a1828', '#4a4660', '#8a86a8'], 0.55, 0.25);
    const r = rnd(5); for (let i = 0; i < 14; i++) { const x = r() * W, y = 360 + r() * 360, rr = 8 + r() * 26; sombra(c, x, y, rr, 0.5, rr * 0.45); c.strokeStyle = alfa('#c8c4e8', 0.35); c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y - 1, rr, rr * 0.42, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
    // pista quadriculada iluminada sob o Globo de Espelhos
    const cx = m.chefe.x, cy = m.chefe.y;
    for (let j = 0; j < 6; j++) for (let i = -4; i <= 4; i++) { const x = cx + i * 22 - 11, y = cy - 30 + j * 20; const k = (i + j + 20) % 3; c.fillStyle = alfa(['#ff4fd8', '#ffe14d', '#4dd2ff'][k], 0.16 + ((i * j + 7) % 3) * 0.06); c.fillRect(x, y, 21, 19); c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x, y, 21, 2); }
    for (let i = 0; i < 6; i++) feixe(c, cx, cy - 40, -Math.PI / 2 + (i - 2.5) * 0.45, 0.05, 330, ['#ff4fd8', '#4dd2ff', '#ffe14d'][i % 3], 0.14);
    // módulo lunar ao lado (alumínio)
    c.save(); c.translate(70, 290); c.fillStyle = '#c8ccdc'; c.fillRect(-14, -18, 28, 16); c.fillStyle = '#ffd27a'; c.fillRect(-10, -2, 20, 8); c.strokeStyle = '#9aa0b8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-12, 6); c.lineTo(-20, 16); c.moveTo(12, 6); c.lineTo(20, 16); c.stroke(); c.restore(); lampada(c, 70, 300, 30, '#ff4fd8', 0.3);
    return { placa: '#d8dcf0', texto: 'GLOBO DE ESPELHOS' };
  },
  bestiario(c, p, m) {
    // pergaminho escuro com gravura, moldura de livro e floresta encantada
    degrade(c, W, H, [[0, '#0a1a12'], [0.5, '#123224'], [1, '#06120c']]);
    textura(c, 0, 0, W, H, 31, ['#000000', '#1a3a26', '#3a5a3a'], 0.45, 0.3);
    p.hachura(0, 0, W, H, 0.7, 4, '#2a5a42', 0.3);
    for (let k = 0; k < 2; k++) { c.strokeStyle = alfa('#ffd166', 0.45 - k * 0.15); c.lineWidth = 1.5 - k * 0.6; c.strokeRect(14 + k * 8, 14 + k * 8, W - 28 - k * 16, H - 28 - k * 16); }
    for (const [x, y] of [[22, 22], [378, 22], [22, 738], [378, 738]]) p.roseta(x, y, 12, 6, '#ffd166', 0.6);
    pinheiros(c, 0, W, 590, 180, 31, '#04140c', 12); pinheiros(c, 0, W, 640, 120, 33, '#020c06', 16);
    for (const [x, y, r] of [[70, 470, 7], [96, 474, 7], [302, 444, 6], [324, 447, 6], [150, 530, 5], [170, 532, 5]]) { brilho(c, x, y, r * 3, '#ffd166', 0.45); p.olho(x, y, r, '#ffd166', 0.9); }
    // brasão e roseta rúnica sob o ninho e as criaturas
    const cr = sig(m, 'alvoGiratorio'); p.roseta(cr.x, cr.y, 58, 12, '#8dff6a', 0.4, 1.2); p.roseta(cr.x, cr.y, 40, 8, '#3ad6c0', 0.45, 1, 0.3); brilho(c, cr.x, cr.y, 70, '#8dff6a', 0.2);
    for (let i = 0; i < 40; i++) { const r = rnd(i); brilho(c, 30 + r() * 340, 80 + r() * 480, 4, '#c8ff8a', 0.7); }
    return { placa: '#d8b878', texto: 'NINHO ASTRAL' };
  },
  cidadela(c, p, m) {
    degrade(c, W, H, [[0, '#0b0816'], [0.35, '#2a1a33'], [1, '#0c0810']]);
    nuvens(c, 0, 220, 41, ['#1a1028', '#4a3050', '#8a6070'], 0.5);
    // eclipse com coroa
    brilho(c, 200, 100, 120, '#ffb347', 0.45); c.strokeStyle = alfa('#ffd8a0', 0.8); c.lineWidth = 2; c.beginPath(); c.arc(200, 100, 52, 0, TAU); c.stroke(); c.fillStyle = '#07050c'; c.beginPath(); c.arc(200, 100, 50, 0, TAU); c.fill();
    // muralha de pedra lavrada e duas torres
    pedras(c, 0, 470, W, 290, 34, 17, '#3a3240', 43);
    for (let x = 0; x < W; x += 40) { pedras(c, x, 452, 22, 18, 22, 9, '#433a4a', x); }
    for (const tx of [46, 354]) { pedras(c, tx - 26, 300, 52, 170, 13, 9, '#3a3240', tx); c.fillStyle = '#2a2230'; for (let i = 0; i < 4; i++) c.fillRect(tx - 28 + i * 15, 288, 10, 14); lampada(c, tx, 380, 30, '#ffb347', 0.5); c.fillStyle = '#ffd27a'; c.fillRect(tx - 3, 372, 6, 12); }
    // brasão de ferro sob o portão com os quatro escudos
    const cx = m.chefe.x, cy = m.chefe.y; c.save(); c.beginPath(); c.moveTo(cx - 46, cy - 52); c.lineTo(cx + 46, cy - 52); c.lineTo(cx + 46, cy + 12); c.lineTo(cx, cy + 60); c.lineTo(cx - 46, cy + 12); c.closePath(); c.clip(); chapas(c, cx - 50, cy - 56, 100, 120, 25, 30, '#4a4252', 47); c.restore();
    for (let i = 0; i < 4; i++) { const q = i / 4 * TAU + Math.PI / 4; p.poligono(cx + Math.cos(q) * 32, cy + Math.sin(q) * 32, 9, 3, '#ff5a5f', 0.55); }
    return { placa: '#aeb4c8', texto: 'PORTÃO' };
  },
  invasao(c, p, m) {
    degrade(c, W, H, [[0, '#010409'], [0.5, '#07182e'], [1, '#020810']]);
    estrelas(c, W, 0, 380, 51, 500);
    nuvens(c, 120, 330, 52, ['#03101a', '#0a3020', '#1a6a40'], 0.45);
    // feixe de abdução e nave no céu
    feixe(c, 200, 120, Math.PI / 2, 0.22, 560, '#5cff9d', 0.22);
    c.save(); c.translate(200, 120); const g = c.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, '#1a2a3a'); g.addColorStop(0.5, '#8aa0b8'); g.addColorStop(1, '#0a1420'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 70, 14, 0, 0, TAU); c.fill(); c.fillStyle = alfa('#5cff9d', 0.5); c.beginPath(); c.ellipse(0, -8, 26, 14, 0, Math.PI, TAU); c.fill(); c.restore();
    lampadas(c, arco(200, 120, 62, 0.15, Math.PI - 0.15, 9).map(q => [q[0], 120 + (q[1] - 120) * 0.2 + 4]), '#5cff9d', 1.8);
    // cidade sitiada e grade de radar holográfica sob a nave-mãe
    cidade(c, 640, 230, 53, '#061224', '#5cff9d');
    const cx = m.chefe.x, cy = m.chefe.y;
    for (let k = 1; k <= 4; k++) { c.strokeStyle = alfa('#5cff9d', 0.28); c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, k * 34, 0, TAU); c.stroke(); }
    for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; c.strokeStyle = alfa('#5cff9d', 0.12); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(q) * 136, cy + Math.sin(q) * 136); c.stroke(); }
    feixe(c, cx, cy, -0.9, 0.35, 136, '#5cff9d', 0.3);
    return { placa: '#b8c8d8', texto: 'NAVE-MÃE' };
  },
  caverna(c, p, m) {
    degrade(c, W, H, [[0, '#06040f'], [0.45, '#140e30'], [1, '#05040c']]);
    textura(c, 0, 0, W, H, 61, ['#000000', '#2a1e4a', '#4a3a7a'], 0.55, 0.3);
    // estalactites com brilho de borda
    const r = rnd(62); for (let i = 0; i < 11; i++) { const x = r() * W, l = 60 + r() * 100, w = 12 + r() * 10; const g = c.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, '#120c28'); g.addColorStop(0.5, '#3a2a68'); g.addColorStop(1, '#0a0618'); c.fillStyle = g; c.beginPath(); c.moveTo(x - w, 0); c.lineTo(x + w, 0); c.lineTo(x + r() * 4 - 2, l); c.fill(); }
    // veios minerais luminosos
    for (let i = 0; i < 12; i++) { const pts: number[][] = []; let x = r() * W, y = 150 + r() * 400; for (let k = 0; k < 6; k++) { pts.push([x, y]); x += (r() - 0.5) * 50; y += 10 + r() * 30; } c.strokeStyle = alfa('#c58cff', 0.3); c.lineWidth = 1 + r() * 1.5; c.beginPath(); pts.forEach((q, j) => (j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke(); }
    // geodo aberto em volta do ímã: anel de cristais facetados
    const im = sig(m, 'ima'); sombra(c, im.x, im.y, 60, 0.6); brilho(c, im.x, im.y, 70, '#7ff0ff', 0.3);
    for (let i = 0; i < 16; i++) { const q = i / 16 * TAU; cristal(c, im.x + Math.cos(q) * 48, im.y + Math.sin(q) * 42 + 12, 6, 16 + (i % 3) * 6, i % 2 ? '#7ff0ff' : '#c58cff', (i % 3 - 1) * 3, 0.85); }
    for (const [x, n, k] of [[60, 5, '#c58cff'], [340, 5, '#ff9de1'], [200, 4, '#7ff0ff']] as [number, number, string][]) for (let i = 0; i < n; i++) cristal(c, x + (i - n / 2) * 14, 760, 7, 40 + (i * 13) % 40, k, (i % 2 ? 4 : -4), 0.7);
    return { placa: '#d8d0ff', texto: 'GOLEM DE QUARTZO' };
  },

  // ===== Grupo 2 =====
  expresso(c, p, m) {
    degrade(c, W, H, [[0, '#03050c'], [0.5, '#141b33'], [1, '#05070e']]);
    nuvens(c, 0, 260, 71, ['#0a1020', '#2a3a4a', '#5a7a7a'], 0.4);
    p.lua(320, 70, 22, '#e8fff8', 0.3);
    // estação: colunas de ferro fundido, relógio de plataforma, bancos de madeira
    for (const x of [40, 120, 280, 360]) { const g = c.createLinearGradient(x - 6, 0, x + 6, 0); g.addColorStop(0, '#0a0e1c'); g.addColorStop(0.5, '#3a4466'); g.addColorStop(1, '#070a14'); c.fillStyle = g; c.fillRect(x - 6, 140, 12, 200); c.fillStyle = '#2a3250'; c.fillRect(x - 10, 136, 20, 8); }
    madeira(c, 0, 330, W, 18, 40, '#4a3020', 72);
    c.save(); c.translate(200, 170); c.fillStyle = '#0e1220'; c.beginPath(); c.arc(0, 0, 30, 0, TAU); c.fill(); const g = c.createRadialGradient(-8, -8, 2, 0, 0, 26); g.addColorStop(0, '#fff8e0'); g.addColorStop(1, '#d8c8a0'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 26, 0, TAU); c.fill(); c.strokeStyle = '#c08a3a'; c.lineWidth = 3; c.stroke(); c.strokeStyle = '#1a1a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -18); c.moveTo(0, 0); c.lineTo(12, 5); c.stroke(); c.restore();
    // leito de trilhos com dormentes de madeira na linha real da locomotiva
    const tr = acha(m, 'portaMovel')[0], ty = tr?.trilho ? tr.trilho[1] : 492;
    madeira(c, 30, ty - 10, 340, 20, 13, '#3a2414', 73); for (const dy of [-5, 5]) tubo(c, [[30, ty + dy], [370, ty + dy]], 1.4, '#c08a5a');
    for (let i = 0; i < 6; i++) { const r = rnd(i + 70); brilho(c, 40 + r() * 320, 360 + r() * 260, 50, '#aaffee', 0.08, 18); }
    // vapor esverdeado e trilhos que somem na névoa
    for (const [x0, x1] of [[120, 170], [280, 230]]) { madeira(c, Math.min(x0, x1) - 8, 560, Math.abs(x1 - x0) + 16, 200, 8, '#1a1008', 74); }
    return { placa: '#e0b070', texto: 'MAQUINISTA' };
  },
  relojoeiro(c, p, m) {
    // bancada de relojoeiro: madeira escura, tapete de couro, engrenagens de latão
    madeira(c, 0, 0, W, H, 50, '#2a1a0c', 81); textura(c, 0, 0, W, H, 82, ['#000000', '#1a0e04', '#4a2e10'], 0.4, 0.35);
    for (const [x, y, r, d, rot] of [[60, 110, 48, 14, 0.2], [352, 190, 62, 18, 0.5], [36, 420, 38, 12, 0.1], [360, 520, 44, 14, 0.8], [100, 640, 30, 10, 0.3], [300, 650, 26, 9, 0.6]]) engrenagem(c, x, y, r, d, '#c98b4a', rot, 0.8);
    // mostrador gravado sob o bumper-relógio (as quatro horas de prêmio)
    const rel = m.bumpers.find(b => Math.abs(b.y - 456) < 6 && b.x === 190) || { x: 190, y: 456 };
    sombra(c, rel.x, rel.y + 4, 66, 0.6);
    const g = c.createRadialGradient(rel.x - 14, rel.y - 14, 4, rel.x, rel.y, 56); g.addColorStop(0, '#f8ecd0'); g.addColorStop(1, '#c8b088'); c.fillStyle = g; c.beginPath(); c.arc(rel.x, rel.y, 56, 0, TAU); c.fill();
    for (const [k, l] of [['#5a3a10', 5], ['#e8c070', 3], ['#fff2c8', 0.8]] as [string, number][]) { c.strokeStyle = k; c.lineWidth = l; c.beginPath(); c.arc(rel.x, rel.y, 56, 0, TAU); c.stroke(); }
    ['DOBRO', 'OURO', 'ESCUDO', 'BÔNUS'].forEach((s, i) => p.textoArco(s, rel.x, rel.y, 44, 6.5, '#5a3a10', 0.9, -Math.PI / 2 + i * Math.PI / 2 + Math.PI / 4));
    for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; c.fillStyle = '#c0262e'; c.beginPath(); c.arc(rel.x + Math.cos(q) * 50, rel.y + Math.sin(q) * 50, 2.3, 0, TAU); c.fill(); }
    lampada(c, 200, 300, 160, '#ffd27a', 0.12);
    return { placa: '#f0c070', texto: 'ENGRENAGEM-MESTRA' };
  },
  feira(c, p, m) {
    degrade(c, W, H, [[0, '#0b041c'], [0.5, '#2a0d4a'], [1, '#100520']]);
    estrelas(c, W, 0, 220, 91, 200);
    lona(c, 200, 330, 340, Math.PI, TAU, 16, '#c8304a', '#f2e8d8');
    c.save(); c.globalAlpha = 0.45; c.fillStyle = '#0b041c'; c.fillRect(0, 0, W, 330); c.restore();
    lampadas(c, arco(200, 330, 205, Math.PI * 1.05, Math.PI * 1.95, 24), '#ffe45c', 2.2);
    // roda-gigante metálica em volta da roda real
    const rd = sig(m, 'rodaGigante'); brilho(c, rd.x, rd.y, 100, '#ff5ea8', 0.25);
    for (const [k, l] of [['#1a0a20', 6], ['#e8e0f0', 2.5]] as [string, number][]) { c.strokeStyle = k; c.lineWidth = l; c.beginPath(); c.arc(rd.x, rd.y, 64, 0, TAU); c.stroke(); for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; c.beginPath(); c.moveTo(rd.x, rd.y); c.lineTo(rd.x + Math.cos(q) * 64, rd.y + Math.sin(q) * 64); c.stroke(); } }
    lampadas(c, arco(rd.x, rd.y, 64, 0, TAU * 0.96, 24), '#5ce1ff', 1.6);
    // barracas de prêmio e chão de serragem
    for (const [x, k] of [[70, '#ff5ea8'], [330, '#5ce1ff']] as [number, string][]) { lona(c, x, 590, 70, Math.PI * 1.15, Math.PI * 1.85, 8, k, '#f2e8d8'); lampadas(c, arco(x, 590, 72, Math.PI * 1.15, Math.PI * 1.85, 7), '#ffe45c', 1.6); }
    textura(c, 0, 600, W, 160, 92, ['#1a0a10', '#4a2a1a', '#8a5a3a'], 0.35, 0.4);
    return { placa: '#f0e8ff', texto: 'PALHAÇO VOLTAICO' };
  },
  abissal(c, p, m) {
    degrade(c, W, H, [[0, '#03305a'], [0.25, '#04204a'], [0.7, '#020c1e'], [1, '#01050e']]);
    nevoaRuido(c, 0, 0, W, 300, 101, ['#04305a', '#0a6a8a', '#4dfff0'], 0.25, (u, v) => 1 - v, 0.45);
    for (const [x, a] of [[60, 1.35], [150, 1.5], [260, 1.62], [350, 1.75]]) feixe(c, x, -40, a, 0.07, 640, '#7fd8ff', 0.14);
    // cáusticas na luz de cima
    const r = rnd(102); for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * 260; c.strokeStyle = alfa('#9fefff', 0.08); c.lineWidth = 0.8; c.beginPath(); c.ellipse(x, y, 10 + r() * 14, 3, r() * 3, 0, TAU); c.stroke(); }
    // recife bioluminescente e tentáculos do Kraken no fundo
    for (let i = 0; i < 7; i++) { const x = 30 + i * 56, pts = [[x, 790], [x + (r() - 0.5) * 80, 640], [x + (r() - 0.5) * 100, 520]]; tubo(c, pts, 6 - i % 2, '#0a3a7a'); for (let k = 0; k < 6; k++) { const u = k / 6, y = 780 - u * 240; c.fillStyle = alfa('#4dfff0', 0.25); c.beginPath(); c.arc(pts[0][0] + (pts[2][0] - pts[0][0]) * u + 4, y, 1.6, 0, TAU); c.fill(); } }
    for (let i = 0; i < 26; i++) { const x = 20 + r() * 360, y = 560 + r() * 180, k = i % 3 ? '#4dfff0' : '#ff7ad9'; tubo(c, [[x, y + 26], [x + (r() - 0.5) * 12, y + 8], [x + (r() - 0.5) * 16, y]], 1.4, tom(k, -0.3)); brilho(c, x, y, 8, k, 0.5); }
    // redemoinho da Boca e trilhas dos três canos
    const b = sig(m, 'bocaQueEngole'); sombra(c, b.x, b.y, 72, 0.7);
    for (let k = 0; k < 3; k++) { c.strokeStyle = alfa('#4dfff0', 0.25 - k * 0.06); c.lineWidth = 2.4; c.beginPath(); for (let i = 0; i <= 80; i++) { const q = i / 80 * TAU * 3 + k * 2, rr = 64 * (1 - i / 80); c.lineTo(b.x + Math.cos(q) * rr, b.y + Math.sin(q) * rr * 0.9); } c.stroke(); }
    for (const cn of ((b as any).canos || [])) tubo(c, [[b.x, b.y], [(b.x + cn[0]) / 2, (b.y + cn[1]) / 2 - 10], [cn[0], cn[1]]], 3, '#123a6a');
    for (let i = 0; i < 40; i++) { c.strokeStyle = alfa('#bff8ff', 0.3); c.lineWidth = 0.8; c.beginPath(); c.arc(20 + r() * 360, 60 + r() * 500, 1 + r() * 4, 0, TAU); c.stroke(); }
    return { placa: '#bfefff', texto: 'COVIL DO KRAKEN' };
  },
  vulcao(c, p, m) {
    degrade(c, W, H, [[0, '#1a0503'], [0.3, '#3a0a04'], [1, '#0a0201']]);
    nuvens(c, 0, 200, 111, ['#1a0806', '#4a1a10', '#8a3a1a'], 0.6);
    // cone de basalto com rachaduras de lava (ruído com limiar alto = veios)
    c.fillStyle = '#1a0804'; c.beginPath(); c.moveTo(0, 470); c.lineTo(140, 228); c.lineTo(260, 228); c.lineTo(400, 470); c.lineTo(400, H); c.lineTo(0, H); c.fill();
    textura(c, 0, 228, W, 532, 112, ['#000000', '#2a0e06', '#4a1a0a'], 0.6, 0.25);
    nevoaRuido(c, 0, 228, W, 532, 113, ['#ff4a1c', '#ffb02e', '#fff0b0'], 0.5, (u, v) => 0.6 + 0.4 * (1 - v), 0.72);
    brilho(c, 200, 230, 90, '#ffb02e', 0.6, 30); brilho(c, 200, 230, 40, '#fff0b0', 0.5, 14);
    for (const r of m.rampas) if (r.caminho.length) { c.strokeStyle = alfa('#ff4a1c', 0.12); c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); r.caminho.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke(); }
    for (let i = 0; i < 16; i++) { const r = rnd(i + 114); const x = r() * W, y = 300 + r() * 420; cristal(c, x, y, 5, 10 + r() * 14, '#5a2a1a', 0, 0.8); }
    return { placa: '#c8a090', texto: 'CORAÇÃO DE MAGMA' };
  },

  // ===== Grupo 3 =====
  especiarias(c, p, m) {
    degrade(c, W, H, [[0, '#1a0b05'], [0.5, '#3a180a'], [1, '#140703']]);
    textura(c, 0, 0, W, H, 121, ['#000000', '#3a1a08', '#6a3414'], 0.4, 0.3);
    // arcos mouriscos com azulejos e lanternas
    for (let i = 0; i < 4; i++) { const x = 50 + i * 100; c.save(); c.beginPath(); c.moveTo(x - 40, 300); c.lineTo(x - 40, 150); c.arc(x, 150, 40, Math.PI, TAU); c.lineTo(x + 40, 300); c.closePath(); c.fillStyle = '#120602'; c.fill(); c.clip(); feixe(c, x, 300, -Math.PI / 2, 0.5, 160, '#ffcc4d', 0.12); c.restore(); c.strokeStyle = '#ffcc4d'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 40, 300); c.lineTo(x - 40, 150); c.arc(x, 150, 40, Math.PI, TAU); c.lineTo(x + 40, 300); c.stroke(); lampada(c, x, 210, 26, '#ffcc4d', 0.55); c.fillStyle = '#ffcc4d'; c.beginPath(); c.arc(x, 210, 4, 0, TAU); c.fill(); }
    // tapete de azulejos sob o labirinto, saídas douradas
    const e = sig(m, 'esteira'); c.save(); c.translate(e.x, e.y);
    for (let j = -3; j <= 3; j++) for (let i = -4; i <= 4; i++) { const x = i * 18, y = j * 17; c.fillStyle = (i + j) % 2 ? '#1a5a7a' : '#d8c8a0'; c.fillRect(x - 8.5, y - 8, 17, 16); c.fillStyle = (i + j) % 2 ? '#38d6b0' : '#e2572b'; c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + 6, y); c.lineTo(x, y + 6); c.lineTo(x - 6, y); c.fill(); }
    c.restore(); c.strokeStyle = '#ffcc4d'; c.lineWidth = 2.5; c.strokeRect(e.x - 84, e.y - 64, 168, 128);
    for (const sx of [-46, 46]) lampada(c, e.x + sx, e.y + 62, 24, '#ffcc4d', 0.6);
    // montes de pigmento em tigelas de cobre
    for (const [x, k] of [[70, '#e2572b'], [140, '#ffcc4d'], [260, '#38d6b0'], [330, '#c8326a']] as [number, string][]) { const g = c.createRadialGradient(x - 8, 670, 2, x, 690, 40); g.addColorStop(0, tom(k, 0.3)); g.addColorStop(1, tom(k, -0.4)); c.fillStyle = g; c.beginPath(); c.moveTo(x - 34, 700); c.quadraticCurveTo(x, 640, x + 34, 700); c.fill(); const gb = c.createLinearGradient(x - 40, 0, x + 40, 0); gb.addColorStop(0, '#5a2a10'); gb.addColorStop(0.5, '#e09060'); gb.addColorStop(1, '#4a2008'); c.fillStyle = gb; c.beginPath(); c.ellipse(x, 703, 40, 9, 0, 0, Math.PI); c.fill(); }
    return { placa: '#e8b070', texto: 'VIZIR' };
  },
  'zero-g'(c, p, m) {
    degrade(c, W, H, [[0, '#04041a'], [0.5, '#0c1640'], [1, '#04061a']]);
    estrelas(c, W, 0, H, 131, 900);
    nevoaRuido(c, 0, 0, W, H, 132, ['#0a0a30', '#3a1a6a', '#ff3d81'], 0.3, (u, v) => Math.max(0, 1 - Math.abs(u - v * 0.6 - 0.2) * 3), 0.42);
    // planeta com anel e estação orbital
    const g = c.createRadialGradient(300, 600, 10, 330, 630, 110); g.addColorStop(0, '#5a8ad8'); g.addColorStop(0.6, '#1a3a7a'); g.addColorStop(1, '#050a20'); c.fillStyle = g; c.beginPath(); c.arc(330, 630, 100, 0, TAU); c.fill();
    c.strokeStyle = alfa('#f5ff4d', 0.4); c.lineWidth = 3; c.beginPath(); c.ellipse(330, 630, 150, 26, -0.25, 0, TAU); c.stroke();
    chapas(c, 20, 280, 70, 34, 23, 17, '#2a3050', 133); chapas(c, 310, 300, 70, 34, 23, 17, '#2a3050', 134);
    for (const [x, y] of [[20, 297], [380, 317]]) lampada(c, x, y, 16, '#39e0ff', 0.6);
    // pista orbital em volta do chefe e faixas de velocidade nas órbitas reais
    const cx = m.chefe.x, cy = m.chefe.y; for (let k = 0; k < 3; k++) { c.strokeStyle = alfa(['#f5ff4d', '#ff3d81', '#39e0ff'][k], 0.3); c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, 150 - k * 12, 54 - k * 5, 0, 0, TAU); c.stroke(); }
    for (const x of m.orbitas) for (let y = 160; y < 520; y += 24) p.chevron(x, y, 5, 0, '#39e0ff', 0.2);
    return { placa: '#e0e8ff', texto: 'PILOTO SOMBRIO' };
  },
  'floresta-vidro'(c, p, m) {
    degrade(c, W, H, [[0, '#03111a'], [0.5, '#0c2c36'], [1, '#03101a']]);
    nevoaRuido(c, 0, 0, W, H, 141, ['#03111a', '#1a5a5a', '#6fe3c1'], 0.3, () => 1, 0.5);
    for (const [x, a] of [[80, 1.3], [200, 1.55], [320, 1.8]]) feixe(c, x, -30, a, 0.1, 680, '#d8fbff', 0.14);
    // troncos de vidro facetados
    for (const [x, w] of [[30, 14], [110, 10], [290, 11], [370, 15]]) { cristal(c, x, 760, w, 640, '#6fe3c1', 0, 0.55); }
    const r = rnd(142); for (let i = 0; i < 60; i++) { const x = r() * W, y = 30 + r() * 330; cristal(c, x, y, 3 + r() * 5, 8 + r() * 12, ['#d8fbff', '#6fe3c1', '#b59bff'][i % 3], (r() - 0.5) * 6, 0.6); }
    // vitral sob os alvos de vidro reais
    for (const a of acha(m, 'alvoFixo').filter(q => q.vidasMax === 3)) { brilho(c, a.x, a.y, 24, '#d8fbff', 0.35); p.poligono(a.x, a.y + 4, 16, 6, '#b59bff', 0.35, 0, 1.2); }
    return { placa: '#e0fff6', texto: 'ÁRVORE-MÃE' };
  },
  orion(c, p, m) {
    degrade(c, W, H, [[0, '#02030a'], [0.5, '#0a1428'], [1, '#03050c']]);
    estrelas(c, W, 0, H, 151, 900);
    nevoaRuido(c, 0, 80, W, 300, 152, ['#100820', '#7a3a8a', '#ff8a3d', '#ffe0c0'], 0.5, (u, v) => Math.max(0, 1 - Math.hypot(u - 0.3, v - 0.5) * 2), 0.42);
    p.constelacao([[60, 90], [110, 120], [150, 116], [190, 128], [240, 92], [150, 180], [120, 240], [180, 240]], '#e6ecff', 0.45);
    for (const y of [300, 340]) { chapas(c, 0, y, 60, 30, 20, 15, '#14304a', 153); chapas(c, 340, y, 60, 30, 20, 15, '#14304a', 154); }
    // mapa astronômico técnico e doca hexagonal do braço robótico
    p.grade(20, '#6ee7ff', 0.05, 380);
    const br = sig(m, 'bracoRobotico'); sombra(c, br.x, br.y, 56, 0.6);
    c.save(); c.translate(br.x, br.y); c.beginPath(); for (let i = 0; i < 6; i++) { const q = i / 6 * TAU; c.lineTo(Math.cos(q) * 46, Math.sin(q) * 46); } c.closePath(); c.clip(); chapas(c, -50, -50, 100, 100, 25, 25, '#1a2a40', 155); c.restore();
    p.poligono(br.x, br.y, 46, 6, '#6ee7ff', 0.7, 0, 1.8); for (let i = 0; i < 4; i++) { const q = i / 4 * TAU; c.strokeStyle = '#ff8a3d'; c.lineWidth = 2; c.beginPath(); c.moveTo(br.x + Math.cos(q) * 52, br.y + Math.sin(q) * 52); c.lineTo(br.x + Math.cos(q) * 64, br.y + Math.sin(q) * 64); c.stroke(); }
    return { placa: '#f0f4ff', texto: 'IA-ÓRION' };
  },
  catacumbas(c, p, m) {
    pedras(c, 0, 0, W, H, 30, 15, '#1e1a24', 161);
    degrade(c, W, H, [[0, 'rgba(0,0,0,0.35)'], [0.5, 'rgba(0,0,0,0.05)'], [1, 'rgba(0,0,0,0.55)']]);
    // galerias em arco com nichos de ossos e velas
    for (const x of [70, 200, 330]) { c.save(); c.beginPath(); c.moveTo(x - 50, 360); c.lineTo(x - 50, 220); c.arc(x, 220, 50, Math.PI, TAU); c.lineTo(x + 50, 360); c.closePath(); c.fillStyle = '#050407'; c.fill(); c.clip(); for (let k = 0; k < 4; k++) for (let i = 0; i < 6; i++) { c.fillStyle = alfa('#d8cfb8', 0.35); c.beginPath(); c.arc(x - 40 + i * 16, 250 + k * 26, 5, 0, TAU); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(x - 42 + i * 16, 249 + k * 26, 1.2, 0, TAU); c.arc(x - 38 + i * 16, 249 + k * 26, 1.2, 0, TAU); c.fill(); } c.restore(); pedras(c, x - 56, 214, 12, 150, 12, 10, '#2e2934', x); pedras(c, x + 44, 214, 12, 150, 12, 10, '#2e2934', x + 1); }
    for (const x of [40, 100, 170, 230, 300, 360]) { lampada(c, x, 330, 22, '#b6ff5c', 0.55); c.fillStyle = '#d8cfb8'; c.fillRect(x - 2, 332, 4, 12); c.fillStyle = '#eaffc0'; c.beginPath(); c.moveTo(x - 2.5, 332); c.quadraticCurveTo(x, 322, x + 2.5, 332); c.fill(); }
    // nicho octogonal da caveira
    const cv = sig(m, 'bocaQueEngole'); sombra(c, cv.x, cv.y, 66, 0.7); brilho(c, cv.x, cv.y, 70, '#b6ff5c', 0.2); p.poligono(cv.x, cv.y, 56, 8, '#c9c2b0', 0.6, Math.PI / 8, 2);
    return { placa: '#c9c2b0', texto: 'GUARDIÃO' };
  },

  // ===== Grupo 4 =====
  tempestade(c, p, m) {
    degrade(c, W, H, [[0, '#04050c'], [0.4, '#141c38'], [1, '#05070f']]);
    const ms = sig(m, 'pasDeMoinho');
    // espiral de nuvens (ruído) em volta do olho do ciclone no moinho
    nevoaRuido(c, 0, 0, W, H, 171, ['#0a1020', '#3a4a7a', '#a0b4e8'], 0.5, (u, v) => { const d = Math.hypot(u * W - ms.x, v * H - ms.y) / 300; return Math.max(0, Math.min(1, d * 1.6)) * (0.5 + 0.5 * Math.sin(Math.atan2(v * H - ms.y, u * W - ms.x) * 3 + d * 12)); }, 0.35);
    brilho(c, ms.x, ms.y, 60, '#c8f1ff', 0.3); sombra(c, ms.x, ms.y, 40, 0.5);
    // chuva diagonal fina (baixo contraste) e relâmpagos ao longe
    const r = rnd(172); for (let i = 0; i < 200; i++) { const x = r() * 420, y = r() * H; c.strokeStyle = alfa('#a8c4ff', 0.13); c.lineWidth = 0.7; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 15); c.stroke(); }
    p.relampago(60, 0, 100, 220, '#ffe35c', 2, 0.6); p.relampago(360, 40, 320, 260, '#c8f1ff', 1.6, 0.45);
    // moinho de ferro no horizonte e casa com janela acesa
    c.fillStyle = '#060912'; c.beginPath(); c.moveTo(0, 640); c.lineTo(120, 610); c.lineTo(260, 630); c.lineTo(400, 604); c.lineTo(400, H); c.lineTo(0, H); c.fill();
    c.fillStyle = '#0a0f1c'; c.fillRect(300, 560, 40, 50); c.fillStyle = '#ffd27a'; c.fillRect(312, 576, 8, 10); lampada(c, 316, 580, 22, '#ffd27a', 0.4);
    return { placa: '#d0d8f0', texto: 'OLHO DO CICLONE' };
  },
  circo(c, p, m) {
    degrade(c, W, H, [[0, '#12030a'], [0.5, '#3d0a1c'], [1, '#12030a']]);
    lona(c, 200, -80, 520, Math.PI * 0.18, Math.PI * 0.82, 18, '#c8203a', '#f4e8d4');
    c.save(); c.globalCompositeOperation = 'multiply'; degrade(c, W, H, [[0, '#ffffff'], [0.6, '#6a5a6a'], [1, '#1a0a10']]); c.restore();
    lampadas(c, arco(200, -80, 500, Math.PI * 0.22, Math.PI * 0.78, 22), '#ffd84d', 2.2);
    // holofotes cruzados e picadeiro de serragem
    feixe(c, 30, 0, 1.15, 0.11, 640, '#fff3c0', 0.2); feixe(c, 370, 0, 1.99, 0.11, 640, '#fff3c0', 0.2);
    c.fillStyle = '#3a1608'; c.beginPath(); c.ellipse(200, 600, 190, 80, 0, 0, TAU); c.fill(); textura(c, 10, 520, 380, 160, 181, ['#1a0804', '#7a4a20', '#c99a5a'], 0.45, 0.3);
    c.save(); c.globalAlpha = 0.45; lampadas(c, arco(200, 600, 190, 0, TAU * 0.97, 30).map(q => [q[0], 600 + (q[1] - 600) * 0.42]), '#ffd84d', 1.2); c.restore();
    // alvo de homem-bala sob o canhão
    const cn = sig(m, 'canhao'); for (let k = 4; k > 0; k--) { c.fillStyle = k % 2 ? '#c8203a' : '#f4e8d4'; c.beginPath(); c.arc(cn.x, cn.y, k * 9, 0, TAU); c.fill(); } sombra(c, cn.x, cn.y, 40, 0.3);
    return { placa: '#f0e0b0', texto: 'MESTRE DE PISTA' };
  },
  prisma(c, p, m) {
    degrade(c, W, H, [[0, '#05060c'], [0.5, '#121628'], [1, '#05060c']]);
    p.grade(25, '#7aa2ff', 0.06); p.grade(100, '#7aa2ff', 0.1);
    // bancada óptica: lentes em suportes cromados sobre trilho
    tubo(c, [[20, 182], [380, 182]], 2.2, '#5a6488');
    for (const x of [60, 130, 270, 340]) { tubo(c, [[x, 182], [x, 146]], 2, '#8a94b8'); c.save(); c.translate(x, 130); const g = c.createLinearGradient(-8, 0, 8, 0); g.addColorStop(0, alfa('#cfe0ff', 0.2)); g.addColorStop(0.5, alfa('#ffffff', 0.6)); g.addColorStop(1, alfa('#cfe0ff', 0.2)); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 6, 16, 0, 0, TAU); c.fill(); c.strokeStyle = '#c8d0e8'; c.lineWidth = 1.5; c.stroke(); c.restore(); }
    // feixe branco até o prisma e espectro saindo
    const pr = m.pecas.find(q => q.tipo === 'captor' && q.rotulo === 'PRISMA') || { x: 190, y: 456 };
    feixe(c, pr.x, pr.y, -Math.PI / 2 - 0.9, 0.04, 280, '#ffffff', 0.4);
    ['#ff4d6d', '#ffb14d', '#fff14d', '#4dff88', '#4da6ff', '#a24dff'].forEach((k, i) => feixe(c, pr.x, pr.y, Math.PI / 2 - 0.5 + i * 0.2, 0.055, 320, k, 0.24));
    cristal(c, pr.x, pr.y + 24, 26, 46, '#e8f0ff', 0, 0.5);
    for (let i = 0; i < 10; i++) { const r = rnd(i + 190); p.cintila(30 + r() * 340, 60 + r() * 500, 2 + r() * 3, '#ffffff', 0.6); }
    return { placa: '#f4f8ff', texto: 'PRISMA' };
  },
  deserto(c, p, m) {
    degrade(c, W, H, [[0, '#1e1004'], [0.25, '#4a2e10'], [0.6, '#5e3c16'], [1, '#1e1206']]);
    brilho(c, 200, 70, 140, '#ffe9a8', 0.35, 90); c.fillStyle = '#fff1c8'; c.beginPath(); c.arc(200, 70, 32, 0, TAU); c.fill();
    // templo dourado em ruínas, dunas com ruído de vento
    for (let i = 0; i < 5; i++) { const x = 70 + i * 65, h = 80 + (i % 2) * 30; const g = c.createLinearGradient(x - 9, 0, x + 9, 0); g.addColorStop(0, '#4a2e10'); g.addColorStop(0.5, '#c89a4a'); g.addColorStop(1, '#3a2008'); c.fillStyle = g; c.fillRect(x - 9, 330 - h, 18, h); c.fillStyle = '#d8aa5a'; c.fillRect(x - 13, 330 - h - 6, 26, 7); }
    for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#5e3a14' : '#46290c'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 8) c.lineTo(x, 360 + k * 34 + Math.sin(x * 0.02 + k * 2) * 16 + Math.sin(x * 0.05 + k) * 5); c.lineTo(W, H); c.fill(); }
    textura(c, 0, 340, W, 420, 201, ['#2a1a08', '#8a5a24', '#ffe0a0'], 0.25, 0.45);
    // redemoinho de areia sobre o poço
    const po = sig(m, 'pocoDeAreia'); sombra(c, po.x, po.y, 50, 0.6);
    for (let k = 0; k < 4; k++) { c.strokeStyle = alfa('#ffe9a8', 0.35 - k * 0.07); c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 60; i++) { const q = i / 60 * TAU * 2.4 + k * 1.6, rr = 54 * (1 - i / 60); c.lineTo(po.x + Math.cos(q) * rr, po.y + Math.sin(q) * rr * 0.85); } c.stroke(); }
    return { placa: '#f0d08a', texto: 'VERME' };
  },
  biblioteca(c, p, m) {
    madeira(c, 0, 0, W, H, 40, '#2a1a10', 211);
    // estantes em perspectiva com lombadas reais (cores variadas), escada de bronze
    p.estantes(0, 0, 120, 420, 7, 0.9); p.estantes(280, 0, 120, 420, 7, 0.9);
    c.save(); c.globalCompositeOperation = 'multiply'; const g0 = c.createLinearGradient(0, 0, W, 0); g0.addColorStop(0, '#6a5a50'); g0.addColorStop(0.3, '#ffffff'); g0.addColorStop(0.7, '#ffffff'); g0.addColorStop(1, '#6a5a50'); c.fillStyle = g0; c.fillRect(0, 0, W, 420); c.restore();
    for (const x of [300, 320]) tubo(c, [[x, 420], [x + 40, 120]], 1.6, '#c08a3a'); for (let k = 0; k < 9; k++) tubo(c, [[300 + k * 4.4, 420 - k * 33], [320 + k * 4.4, 420 - k * 33]], 1.2, '#c08a3a');
    lampada(c, 200, 220, 120, '#ffd9a0', 0.25); c.fillStyle = '#ffd9a0'; c.beginPath(); c.arc(200, 150, 5, 0, TAU); c.fill(); tubo(c, [[200, 0], [200, 145]], 0.8, '#6a4a2a');
    // tapete e páginas soltas
    c.fillStyle = '#4a1a14'; c.fillRect(70, 450, 260, 260); textura(c, 70, 450, 260, 260, 212, ['#2a0a08', '#6a2a1a', '#a8603a'], 0.4, 0.35); c.strokeStyle = alfa('#d8a050', 0.3); c.lineWidth = 1.2; c.strokeRect(78, 458, 244, 244);
    const r = rnd(213); for (let i = 0; i < 14; i++) { const x = 40 + r() * 320, y = 440 + r() * 260; c.save(); c.translate(x, y); c.rotate(r() * 3); c.fillStyle = '#f2e2c0'; c.fillRect(-6, -8, 12, 16); c.strokeStyle = alfa('#5a4030', 0.4); c.lineWidth = 0.5; for (let k = -5; k < 6; k += 3) { c.beginPath(); c.moveTo(-4, k); c.lineTo(4, k); c.stroke(); } c.restore(); }
    return { placa: '#d8b080', texto: 'BIBLIOTECÁRIO' };
  },

  // ===== Grupo 5 =====
  reator(c, p, m) {
    chapas(c, 0, 0, W, H, 50, 38, '#1a2a20', 221);
    for (const x of [26, 50, 350, 374]) tubo(c, [[x, 0], [x, H]], 5, '#3a4a40');
    for (const y of [140, 420]) tubo(c, [[0, y], [80, y], [100, y + 30]], 4, '#5a4a30');
    // núcleo com bobinas e anéis de contenção
    const cx = m.chefe.x, cy = m.chefe.y; brilho(c, cx, cy, 100, '#c6ff3d', 0.4);
    for (let k = 0; k < 4; k++) { c.strokeStyle = k % 2 ? '#ff7a1a' : '#c6ff3d'; c.globalAlpha = 0.45; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, 64 + k * 15, (64 + k * 15) * 0.9, 0, 0, TAU); c.stroke(); c.globalAlpha = 1; }
    for (let i = 0; i < 8; i++) { const q = i / 8 * TAU; tubo(c, [[cx + Math.cos(q) * 70, cy + Math.sin(q) * 63], [cx + Math.cos(q) * 92, cy + Math.sin(q) * 83]], 3, '#b07a3a'); }
    // faixas de perigo e mostradores
    for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#ffcc00' : '#111'; c.beginPath(); c.moveTo(130 + i * 10, 612); c.lineTo(140 + i * 10, 612); c.lineTo(134 + i * 10, 624); c.lineTo(124 + i * 10, 624); c.fill(); }
    for (const x of [70, 330]) { c.fillStyle = '#0a100c'; c.beginPath(); c.arc(x, 560, 18, 0, TAU); c.fill(); c.strokeStyle = '#8a9a8a'; c.lineWidth = 2; c.stroke(); c.strokeStyle = '#c6ff3d'; c.beginPath(); c.moveTo(x, 560); c.lineTo(x + 10, 550); c.stroke(); }
    return { placa: '#b0c0b0', texto: 'NÚCLEO' };
  },
  carnaval(c, p, m) {
    degrade(c, W, H, [[0, '#12041c'], [0.5, '#3a0c52'], [1, '#14041e']]);
    nevoaRuido(c, 0, 0, W, H, 231, ['#12041c', '#7a1a8a', '#ff3fa4'], 0.3, () => 1, 0.5);
    // alegoria: plumas e máscara gigante dourada, avenida iluminada
    for (const [x, y, s] of [[60, 150, 1], [340, 170, -1]]) for (let k = 0; k < 9; k++) { const q = -Math.PI / 2 + s * (k - 4) * 0.2; const g = c.createLinearGradient(x, y, x + Math.cos(q) * 110, y + Math.sin(q) * 110); const kk = ['#ff3fa4', '#ffe14d', '#33e0a1'][k % 3]; g.addColorStop(0, tom(kk, -0.3)); g.addColorStop(1, kk); c.fillStyle = g; c.beginPath(); c.ellipse(x + Math.cos(q) * 55, y + Math.sin(q) * 55, 12, 55, q + Math.PI / 2, 0, TAU); c.fill(); }
    c.save(); c.translate(200, 610); const gm = c.createLinearGradient(-60, -30, 60, 30); gm.addColorStop(0, '#fff0a0'); gm.addColorStop(0.5, '#d8a020'); gm.addColorStop(1, '#7a5010'); c.fillStyle = gm; c.beginPath(); c.ellipse(0, 0, 60, 34, 0, 0, TAU); c.fill(); c.fillStyle = '#12041c'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 24, -2, 15, 9, s * 0.3, 0, TAU); c.fill(); } c.restore();
    for (const r of m.rampas) { c.strokeStyle = alfa(r.lado > 0 ? '#ffe14d' : '#33e0a1', 0.4); c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(r.mx, 700); c.bezierCurveTo(r.mx - 30 * r.lado, 610, r.mx + 20 * r.lado, 520, r.mx, 445); c.stroke(); }
    const r = rnd(232); for (let i = 0; i < 120; i++) { c.save(); c.translate(r() * W, r() * H); c.rotate(r() * 3); c.fillStyle = alfa(['#ff3fa4', '#ffe14d', '#33e0a1', '#ffffff'][i % 4], 0.5); c.fillRect(-2, -1, 4, 2); c.restore(); }
    lampadas(c, Array.from({ length: 10 }, (_, i) => [40 + i * 36, 724]), '#ffe14d', 2);
    return { placa: '#ffe8a0', texto: 'REI MOMO' };
  },
  'cidade-neon'(c, p, m) {
    degrade(c, W, H, [[0, '#04020c'], [0.4, '#160a3a'], [1, '#060312']]);
    nuvens(c, 0, 200, 241, ['#0a0420', '#3a1a6a', '#ff2bd6'], 0.35);
    cidade(c, 260, 200, 242, '#0b0624', '#21e6ff'); cidade(c, 300, 120, 243, '#07041a', '#ff2bd6');
    // letreiros de neon com tubo duplo
    for (const [x, y, w, k, s] of [[60, 120, 70, '#ff2bd6', 'HOTEL'], [300, 150, 76, '#21e6ff', 'BAR 24H'], [180, 70, 64, '#ffe53b', 'NOODLE']] as [number, number, number, string, string][]) { brilho(c, x, y, w * 0.8, k, 0.35, 22); c.strokeStyle = alfa(k, 0.9); c.lineWidth = 2; c.strokeRect(x - w / 2, y - 12, w, 24); c.strokeStyle = '#ffffff'; c.lineWidth = 0.6; c.strokeRect(x - w / 2, y - 12, w, 24); c.font = '800 10px Orbitron, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.fillText(s, x, y + 1); }
    // asfalto molhado com reflexos verticais
    c.fillStyle = '#0a0620'; c.fillRect(0, 300, W, 460); textura(c, 0, 300, W, 460, 244, ['#000000', '#1a1030', '#3a2a5a'], 0.4, 0.4);
    const r = rnd(245); for (let i = 0; i < 50; i++) { const x = r() * W, k = ['#ff2bd6', '#21e6ff', '#ffe53b'][i % 3], gl = c.createLinearGradient(0, 310, 0, 470); gl.addColorStop(0, alfa(k, 0.25)); gl.addColorStop(1, alfa(k, 0)); c.fillStyle = gl; c.fillRect(x, 310, 1 + r() * 3, 160); }
    // trilhos da perseguição em neon (posição real) e viaduto
    const g = acha(m, 'alvoGiratorio')[0]; if (g?.trilho) { c.lineCap = 'round'; for (const [k, l] of [[alfa('#21e6ff', 0.15), 10], [alfa('#21e6ff', 0.5), 4], ['#ffffff', 1]] as [string, number][]) { c.strokeStyle = k; c.lineWidth = l; c.beginPath(); g.trilho.forEach((q: number[], i: number) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke(); } }
    tubo(c, [[0, 560], [400, 520]], 7, '#1a1240');
    for (let i = 0; i < 9; i++) { c.fillStyle = alfa('#e8e8ff', 0.1); c.fillRect(110 + i * 20, 640, 12, 32); }
    return { placa: '#d0c8ff', texto: 'SINDICATO' };
  },
  jardim(c, p, m) {
    degrade(c, W, H, [[0, '#041008'], [0.5, '#12382a'], [1, '#04100a']]);
    textura(c, 0, 0, W, H, 251, ['#000000', '#1a4a24', '#3a8a3a'], 0.45, 0.35);
    // terraços de pedra com cipós e folhas grandes
    for (let k = 0; k < 4; k++) { const y = 160 + k * 150; pedras(c, 0, y, W, 16, 26, 8, '#3a4a2a', 252 + k); }
    const r = rnd(256); for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * 520, q = r() * 3; c.save(); c.translate(x, y); c.rotate(q); const g = c.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#0a3a1a'); g.addColorStop(0.5, '#3aa874'); g.addColorStop(1, '#0a2a14'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 8, 22, 0, 0, TAU); c.fill(); c.strokeStyle = alfa('#7be36a', 0.6); c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -20); c.lineTo(0, 20); c.stroke(); c.restore(); }
    for (let i = 0; i < 18; i++) { p.flor(20 + r() * 360, 80 + r() * 640, 5 + r() * 5, ['#ff8fc7', '#ffe46b', '#ffffff'][i % 3], '#ffe46b', 0.6); }
    // canteiros sob as flores mecânicas reais
    for (const f of acha(m, 'flor')) { sombra(c, f.x, f.y, 30, 0.5); brilho(c, f.x, f.y, 34, '#ff8fc7', 0.3); p.flor(f.x, f.y, 24, '#ff8fc7', '#ffe46b', 0.35, 8); }
    for (let i = 0; i < 30; i++) brilho(c, 20 + r() * 360, 60 + r() * 560, 4, '#ffe46b', 0.6);
    return { placa: '#d8f0c0', texto: 'RAINHA-RAIZ' };
  },
  mina(c, p, m) {
    degrade(c, W, H, [[0, '#0a0705'], [0.5, '#1e140c'], [1, '#080503']]);
    textura(c, 0, 0, W, H, 261, ['#000000', '#3a2818', '#6a4a2a'], 0.6, 0.25);
    const r = rnd(262); for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H; cristal(c, x, y, 3, 6 + r() * 6, i % 2 ? '#ffc24d' : '#5cf2c8', 0, 0.8); }
    // escoras de madeira do poço do elevador real e lanternas nos três níveis
    const el = sig(m, 'elevador'); c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(el.x - 34, 100, 68, el.y - 60);
    for (const dx of [-38, 38]) madeira(c, el.x + dx - 5, 100, 10, el.y - 60, 10, '#6a4424', 263 + dx);
    for (let y = 120; y < el.y + 40; y += 46) madeira(c, el.x - 42, y - 4, 84, 8, 84, '#5a3a1a', y);
    for (const [x, y] of [[190, 128], [92, 232], [288, 232]]) { lampada(c, x, y, 28, '#ffc24d', 0.55); c.fillStyle = '#ffe2a0'; c.beginPath(); c.arc(x, y - 14, 3, 0, TAU); c.fill(); }
    // trilhos de vagonete e um vagão de minério
    madeira(c, 20, 680, 360, 12, 10, '#3a2414', 264); for (const dy of [-3, 6]) tubo(c, [[20, 684 + dy], [380, 684 + dy]], 1.3, '#8a7a6a');
    c.fillStyle = '#4a3a2a'; c.fillRect(270, 650, 60, 28); for (let i = 0; i < 6; i++) cristal(c, 278 + i * 9, 652, 4, 8, i % 2 ? '#ffc24d' : '#5cf2c8', 0, 0.9);
    return { placa: '#c8a080', texto: 'CAPATAZ' };
  },

  // ===== Grupo 6 =====
  templo(c, p, m) {
    degrade(c, W, H, [[0, '#030a05'], [0.5, '#16241a'], [1, '#050c06']]);
    pedras(c, 0, 0, W, H, 40, 20, '#26301e', 271);
    degrade(c, W, H, [[0, 'rgba(0,0,0,0.2)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.5)']]);
    // folhagem da selva no topo e colunas com glifos
    const r = rnd(272); for (let i = 0; i < 70; i++) { const x = r() * 420 - 10, y = r() * 120; c.save(); c.translate(x, y); c.rotate(r() * 3); c.fillStyle = i % 2 ? '#0f3a1c' : '#1e5a2a'; c.beginPath(); c.ellipse(0, 0, 7, 20, 0, 0, TAU); c.fill(); c.restore(); }
    for (let i = 0; i < 6; i++) { const x = 34 + i * 66; const g = c.createLinearGradient(x - 10, 0, x + 10, 0); g.addColorStop(0, '#1a2414'); g.addColorStop(0.5, '#5a6a44'); g.addColorStop(1, '#141c10'); c.fillStyle = g; c.fillRect(x - 10, 200, 20, 220); for (let k = 0; k < 5; k++) { c.strokeStyle = alfa('#d9b25c', 0.4); c.lineWidth = 1; c.beginPath(); c.arc(x, 220 + k * 40, 5, 0, Math.PI * 1.6); c.stroke(); } }
    // escadaria e escamas de ouro na rampa da serpente
    for (let k = 0; k < 6; k++) pedras(c, 60 + k * 12, 600 + k * 22, 280 - k * 24, 22, 40, 22, k % 2 ? '#2a3420' : '#323e26', 280 + k);
    const rp = m.rampas[1] || m.rampas[0]; if (rp) for (const q of rp.caminho) { c.fillStyle = alfa('#d9b25c', 0.3); p.poligono(q[0], q[1], 7, 6, '#d9b25c', 0.28, 0); }
    for (const [x, y] of [[60, 560], [340, 560]]) { lampada(c, x, y, 30, '#ff5a3c', 0.55); c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(x - 6, y + 8); c.quadraticCurveTo(x, y - 18, x + 6, y + 8); c.fill(); }
    return { placa: '#e0d0a0', texto: 'SERPENTE' };
  },
  estudio45(c, p, m) {
    degrade(c, W, H, [[0, '#0b060e'], [0.5, '#24102a'], [1, '#0c0610']]);
    // painel acústico em espuma (pirâmides) e cortina
    for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) { const x = i * 40 + (j % 2) * 20, y = j * 32; const g = c.createLinearGradient(x - 16, y - 14, x + 16, y + 14); g.addColorStop(0, '#3a1a40'); g.addColorStop(1, '#0e0612'); c.fillStyle = g; c.beginPath(); c.moveTo(x, y - 15); c.lineTo(x + 18, y); c.lineTo(x, y + 15); c.lineTo(x - 18, y); c.fill(); }
    // VU-metros analógicos iluminados
    for (const x of [90, 310]) { c.fillStyle = '#1a0f1e'; c.fillRect(x - 36, 84, 72, 52); const g = c.createLinearGradient(0, 88, 0, 132); g.addColorStop(0, '#fff2c8'); g.addColorStop(1, '#e0c070'); c.fillStyle = g; c.fillRect(x - 32, 88, 64, 44); c.strokeStyle = '#c03030'; c.lineWidth = 1; c.beginPath(); c.arc(x, 132, 28, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 132); c.lineTo(x + 12, 104); c.stroke(); lampada(c, x, 110, 40, '#ff9f43', 0.25); }
    // mesa de som com faders e botões
    const gm = c.createLinearGradient(0, 600, 0, 760); gm.addColorStop(0, '#2a1a30'); gm.addColorStop(1, '#0a050c'); c.fillStyle = gm; c.beginPath(); c.moveTo(20, 600); c.lineTo(380, 600); c.lineTo(400, 760); c.lineTo(0, 760); c.fill();
    for (let i = 0; i < 14; i++) { const x = 40 + i * 24; tubo(c, [[x, 620], [x, 700]], 1.2, '#2a2030'); const y = 640 + (i * 37) % 50; c.fillStyle = '#d8dce8'; c.fillRect(x - 6, y, 12, 7); c.fillStyle = ['#ff9f43', '#ee5a8a', '#54e0c7'][i % 3]; c.beginPath(); c.arc(x, 612, 2.4, 0, TAU); c.fill(); }
    // prato do toca-discos sob o vinil real
    const v = sig(m, 'rodaDeVinil'); sombra(c, v.x, v.y, 70, 0.6); const gp = c.createLinearGradient(v.x - 62, 0, v.x + 62, 0); gp.addColorStop(0, '#2a2a34'); gp.addColorStop(0.5, '#9aa0b8'); gp.addColorStop(1, '#1a1a24'); c.fillStyle = gp; c.beginPath(); c.arc(v.x, v.y, 62, 0, TAU); c.fill();
    p.textoArco('33 · 45 · 78', v.x, v.y, 70, 7, '#ff9f43', 0.8);
    return { placa: '#e8d8f0', texto: 'PRODUTOR' };
  },
  gelada(c, p, m) {
    degrade(c, W, H, [[0, '#020a16'], [0.4, '#0c2a48'], [1, '#041424']]);
    estrelas(c, W, 0, 220, 291, 400); cortinas(c, W, H, 10, 90, 292, 0.5);
    serra(c, W, 280, 80, 293, '#1a4a70', '#e6fbff', true, 6);
    // geleira e piso de gelo translúcido com rachaduras e bolhas presas
    const g = c.createLinearGradient(0, 270, 0, H); g.addColorStop(0, '#8ad0f0'); g.addColorStop(0.08, '#2a6a98'); g.addColorStop(0.5, '#123a5a'); g.addColorStop(1, '#061a2e'); c.fillStyle = g; c.fillRect(0, 280, W, H - 280);
    textura(c, 0, 280, W, 480, 294, ['#0a2a48', '#5aa8d8', '#e6fbff'], 0.3, 0.45);
    const r = rnd(295); for (let i = 0; i < 18; i++) { let x = r() * W, y = 300 + r() * 420; c.strokeStyle = alfa('#e6fbff', 0.4); c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 26; c.lineTo(x, y); } c.stroke(); }
    for (let i = 0; i < 30; i++) { c.strokeStyle = alfa('#ffffff', 0.3); c.lineWidth = 0.6; c.beginPath(); c.arc(r() * W, 300 + r() * 440, 1 + r() * 2.5, 0, TAU); c.stroke(); }
    for (const [x, n, k] of [[60, 4, '#e6fbff'], [340, 4, '#b9a4ff']] as [number, number, string][]) for (let i = 0; i < n; i++) cristal(c, x + (i - 2) * 16, 760, 8, 50 + i * 14, k, (i % 2 ? 4 : -4), 0.55);
    return { placa: '#f0fbff', texto: 'COLOSSO' };
  },
  relampago(c, p, m) {
    degrade(c, W, H, [[0, '#02020a'], [0.4, '#121838'], [1, '#04051a']]);
    nevoaRuido(c, 0, 0, W, 360, 301, ['#05061a', '#2a3566', '#a08a40', '#fff36b'], 0.45, (u, v) => 1 - v, 0.42);
    p.relampago(200, 0, 190, 260, '#fff36b', 4, 0.8); p.relampago(40, 40, 120, 300, '#8ab4ff', 2, 0.5); p.relampago(360, 30, 280, 300, '#8ab4ff', 2, 0.5);
    // colunata de mármore com capitéis dourados e escadaria do Olimpo
    for (let i = 0; i < 7; i++) { const x = 30 + i * 57; const g = c.createLinearGradient(x - 10, 0, x + 10, 0); g.addColorStop(0, '#141834'); g.addColorStop(0.45, '#4a5078'); g.addColorStop(1, '#0e1128'); c.fillStyle = g; c.fillRect(x - 10, 360, 20, 200); c.fillStyle = alfa('#d8b040', 0.5); c.fillRect(x - 14, 352, 28, 8); c.fillRect(x - 14, 556, 28, 6); }
    for (let k = 0; k < 7; k++) { const g = c.createLinearGradient(0, 560 + k * 26, 0, 576 + k * 26); g.addColorStop(0, '#3a4070'); g.addColorStop(1, '#14183a'); c.fillStyle = g; c.fillRect(40 + k * 10, 560 + k * 26, 320 - k * 20, 16); c.fillStyle = alfa('#fff36b', 0.15); c.fillRect(40 + k * 10, 560 + k * 26, 320 - k * 20, 1); }
    return { placa: '#f8e070', texto: 'O PRIMEIRO' };
  },
};
void lampada; void estrelaGravada; void observatorio;
