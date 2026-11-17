// Cenas do tablado: uma composição autoral por máquina, pintada uma vez no cache (400 × 760 unidades de mesa).
// As cenas leem as posições reais das peças (InfoMesa) para que a arte acompanhe os caminhos da bola, nunca os invente.
import type { MachineDef } from '../machines/_schema';
import { Pincel, alfa, tom } from './pincel';

const TAU = Math.PI * 2;
export interface InfoMesa {
  bumpers: { x: number; y: number; r: number }[];
  chefe: { x: number; y: number };
  rampas: { mx: number; lado: number; caminho: number[][] }[];
  orbitas: number[];
  pecas: { tipo: string; x: number; y: number; [k: string]: any }[];
  sig: string;
}
type Cena = (p: Pincel, m: InfoMesa) => void;
/** posições aproximadas a partir do layout (para o backglass e as miniaturas, quando ainda não há mesa montada) */
export function infoPadrao(d: MachineDef): InfoMesa {
  const L = d.layout;
  return { bumpers: L.bumpers.map(b => ({ x: b[0], y: b[1], r: b[2] || 17 })), chefe: { x: L.chefe[0], y: L.chefe[1] }, rampas: [{ mx: 104, lado: 1, caminho: [] }, { mx: 276, lado: -1, caminho: [] }], orbitas: [37, 343], pecas: [], sig: d.assinatura.tipo };
}
const acha = (m: InfoMesa, tipo: string) => m.pecas.filter(q => q.tipo === tipo);

/** emblema circular sob o chefe: anel duplo gravado + texto curvo opcional */
function emblema(p: Pincel, x: number, y: number, r: number, cor: string, txt = '', a = 0.55) {
  p.nevoa(x, y, r * 1.5, r * 1.5, cor, 0.22, 'lighter');
  p.aneis(x, y, r, 2, cor, a * 0.8, 1.2); p.aneis(x, y, r * 1.12, 1, cor, a * 0.5, 3);
  for (let i = 0; i < 24; i++) { const q = i / 24 * TAU; p.curva([[x + Math.cos(q) * r * 1.02, y + Math.sin(q) * r * 1.02], [x + Math.cos(q) * r * (i % 2 ? 1.08 : 1.14), y + Math.sin(q) * r * (i % 2 ? 1.08 : 1.14)]], cor, 1, a * 0.7); }
  if (txt) p.textoArco(txt, x, y, r * 1.28, 7, cor, a * 0.9, Math.PI / 2);
}

export const CENAS: Record<string, Cena> = {
  aurora(p, m) {
    p.ceu([[0, '#03031a'], [0.35, '#0a0f3c'], [0.7, '#141048'], [1, '#07051a']]);
    p.semente(11).estrelas(260, '#ffffff', 0, 520);
    for (let i = 0; i < 6; i++) p.cintila(p.rr(30, 370), p.rr(20, 420), p.rr(3, 7), '#ffffff', 0.7);
    p.cortina(70, 26, 170, p.p.c1, 0.32, 0.4); p.cortina(110, 34, 150, '#7dffb0', 0.22, 2.1); p.cortina(150, 30, 120, p.p.c3, 0.2, 4.2);
    // montanhas e lago espelhado na metade de baixo
    p.forma([[0, 560], [50, 500], [90, 528], [150, 470], [205, 520], [250, 490], [300, 530], [350, 486], [400, 520], [400, 760], [0, 760]], '#060a24', 1);
    p.forma([[0, 560], [400, 560], [400, 760], [0, 760]], p.lin(0, 560, 0, 760, [[0, '#0c1446'], [1, '#03041a']]), 1);
    p.cortina(565, 6, 60, p.p.c1, 0.12, 0.4); p.semente(5).estrelas(50, '#bfefff', 570, 700);
    for (let y = 572; y < 740; y += 9) p.curva([[20, y], [200, y + 1.5], [380, y]], p.p.c2, 0.6, 0.08);
    // constelações gravadas ligando os alvos reais da assinatura (ordem numérica)
    const al = acha(m, 'alvoFixo').sort((a, b) => (+a.rotulo || 0) - (+b.rotulo || 0));
    if (al.length > 2) { p.curva(al.map(a => [a.x, a.y]), alfa(p.p.c1, 1), 1, 0.3); for (const a of al) p.cintila(a.x, a.y, 6, p.p.c1, 0.5); }
    emblema(p, m.chefe.x, m.chefe.y, 44, p.p.c2, 'ESTRELA RUBRA');
    p.roseta(m.chefe.x, m.chefe.y, 30, 8, p.p.c1, 0.25);
    p.lua(330, 64, 18, '#fff6d8', 0.35);
  },

  'passo-lunar'(p, m) {
    p.ceu([[0, '#0b0220'], [0.5, '#2a0a4a'], [1, '#0a0420']]);
    p.semente(21).estrelas(160, '#ffd6ff', 0, 300);
    // Terra no horizonte e superfície lunar com crateras
    p.nevoa(80, 120, 70, 70, p.p.c3, 0.35, 'lighter'); p.disco(80, 120, 34, '#1d4fa8'); p.forma([[60, 100], [80, 96], [94, 112], [76, 126], [62, 118]], '#3aa26a', 0.8); p.disco(70, 112, 34, '#0b0220', 0);
    p.forma([[0, 330], [80, 316], [180, 330], [300, 310], [400, 326], [400, 760], [0, 760]], p.lin(0, 310, 0, 760, [[0, '#4a3d6e'], [0.3, '#2a1f48'], [1, '#0d0820']]), 1);
    for (const [x, y, r] of [[60, 380, 22], [320, 400, 30], [200, 620, 18], [110, 520, 14], [300, 560, 20]]) { p.nevoa(x, y, r, r * 0.5, '#000000', 0.4); p.curva(p.arcoPts(x, y - 2, r, Math.PI, TAU, 10).map(q => [q[0], y + (q[1] - y) * 0.45]), '#8b7ab8', 1.4, 0.35); }
    // pista de dança quadriculada em perspectiva sob o globo (o chefe)
    const cx = m.chefe.x, cy = m.chefe.y;
    for (let j = 0; j < 7; j++) for (let i = -5; i <= 5; i++) {
      const y0 = cy - 40 + j * 22, k = 0.7 + j * 0.08, x0 = cx + (i - 0.5) * 22 * k;
      if ((i + j) % 2 === 0) p.forma([[x0, y0], [x0 + 22 * k, y0], [x0 + 22 * (k + 0.08), y0 + 22], [x0 + 0.08 * (i - 0.5) * 22, y0 + 22]], [p.p.c1, p.p.c2, p.p.c3][(i + j + 30) % 3], 0.16 + 0.06 * ((i * j + 9) % 3));
    }
    p.raios(cx, cy - 20, 330, 18, '#ffffff', 0.05, 0.25);
    emblema(p, cx, cy, 42, p.p.c1, 'GLOBO DE ESPELHOS', 0.5);
  },

  bestiario(p, m) {
    // página de livro escura com gravura em hachura e floresta mágica
    p.ceu([[0, '#021009'], [0.5, '#0a2b22'], [1, '#03140f']]);
    p.hachura(0, 0, 400, 760, 0.7, 5, '#1d4a38', 0.35);
    p.filete(14, 14, 372, 732, 18, alfa(p.p.c3, 1), 1.5, 0.4); p.filete(22, 22, 356, 716, 14, alfa(p.p.c3, 1), 0.8, 0.3);
    for (const [x, y] of [[22, 22], [378, 22], [22, 738], [378, 738]]) p.roseta(x, y, 10, 6, p.p.c3, 0.5);
    p.semente(31).arvores(560, 10, 170, '#03130d', 0.95);
    p.arvores(600, 14, 120, '#020c08', 1);
    // olhos entre as árvores e criaturas de luz em gravura
    for (const [x, y, r] of [[70, 470, 8], [100, 474, 8], [300, 440, 7], [326, 444, 7], [150, 530, 5], [170, 532, 5]]) { p.nevoa(x, y, r * 2, r, p.p.c3, 0.4, 'lighter'); p.olho(x, y, r, '#ffd166', 0.85); }
    const [cx, cy] = [m.chefe.x, m.chefe.y];
    p.roseta(cx, cy, 52, 10, p.p.c1, 0.35, 1); p.roseta(cx, cy, 36, 6, p.p.c2, 0.4, 1, 0.3);
    emblema(p, cx, cy, 46, p.p.c1, 'NINHO ASTRAL', 0.45);
    for (let i = 0; i < 40; i++) p.nevoa(p.rr(30, 370), p.rr(80, 560), 3, 3, p.p.c1, p.rr(0.3, 0.8), 'lighter');
    p.texto('BESTIÁRIO', 200, 640, 18, p.p.c3, 0.28, 'Georgia');
  },

  cidadela(p, m) {
    p.ceu([[0, '#0b0816'], [0.4, '#2a1a33'], [1, '#100a16']]);
    // eclipse: disco negro com coroa de luz
    p.nevoa(200, 110, 120, 120, p.p.c1, 0.4, 'lighter'); p.aneis(200, 110, 60, 3, p.p.c1, 0.5, 2); p.disco(200, 110, 52, '#07050c');
    // muralha de pedra na metade de baixo, com ameias
    p.pedras(0, 470, 400, 290, 34, 17, '#2a2230', '#140f18', 1);
    for (let x = 0; x < 400; x += 40) p.forma([[x, 470], [x, 452], [x + 22, 452], [x + 22, 470]], '#2f2636', 1);
    p.torre(46, 470, 46, 150, '#241c2c', 1); p.torre(354, 470, 46, 150, '#241c2c', 1);
    p.semente(4).pedras(23, 320, 46, 150, 12, 8, '#2d2433', '#140f18', 0.9); p.pedras(331, 320, 46, 150, 12, 8, '#2d2433', '#140f18', 0.9);
    // brasão sob o chefe (o portão) com os quatro escudos
    const [cx, cy] = [m.chefe.x, m.chefe.y];
    p.forma([[cx - 44, cy - 50], [cx + 44, cy - 50], [cx + 44, cy + 10], [cx, cy + 56], [cx - 44, cy + 10]], p.lin(cx, cy - 50, cx, cy + 56, [[0, '#3a2a3e'], [1, '#1a1220']]), 0.85);
    p.curva([[cx - 44, cy - 50], [cx + 44, cy - 50], [cx + 44, cy + 10], [cx, cy + 56], [cx - 44, cy + 10], [cx - 44, cy - 50]], p.p.c2, 2, 0.6);
    for (let i = 0; i < 4; i++) { const q = i / 4 * TAU + Math.PI / 4; p.poligono(cx + Math.cos(q) * 30, cy + Math.sin(q) * 30, 9, 3, p.p.c3, 0.45); }
    for (const [x, y] of [[90, 560], [310, 560], [200, 520]]) { p.nevoa(x, y, 16, 22, p.p.c1, 0.45, 'lighter'); p.forma([[x - 4, y + 6], [x, y - 10], [x + 4, y + 6]], '#ffd27a', 0.8); }
  },

  invasao(p, m) {
    p.ceu([[0, '#01040b'], [0.5, '#07182e'], [1, '#030914']]);
    p.semente(51).estrelas(120, '#c8ffe0', 0, 360);
    // grade de radar com varredura sob a nave-mãe
    const [cx, cy] = [m.chefe.x, m.chefe.y];
    p.aneis(cx, cy, 150, 5, p.p.c1, 0.22, 1); for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; p.curva([[cx, cy], [cx + Math.cos(q) * 150, cy + Math.sin(q) * 150]], p.p.c1, 0.8, 0.14); }
    p.feixe(cx, cy, -0.9, 0.35, 150, p.p.c1, 0.25);
    for (const [x, y] of [[120, 250], [280, 200], [230, 360]]) { p.disco(x, y, 2.5, p.p.c3, 0.9); p.aneis(x, y, 8, 1, p.p.c3, 0.5); }
    // cidade em silhueta com janelas e o feixe de abdução
    p.predios(640, 200, '#061224', '#5cff9d', 0.95);
    p.feixe(200, 380, Math.PI / 2, 0.22, 330, p.p.c1, 0.2);
    p.forma([[160, 330], [240, 330], [256, 344], [144, 344]], '#132a46', 0.7);
    p.texto('ALERTA', 200, 560, 14, p.p.c3, 0.3);
    emblema(p, cx, cy, 40, p.p.c1, 'NAVE-MÃE', 0.4);
  },

  caverna(p, m) {
    p.ceu([[0, '#05040f'], [0.45, '#16103a'], [1, '#07061a']]);
    // veios minerais e estalactites no topo
    p.semente(61); for (let i = 0; i < 9; i++) { const x = p.rr(10, 390); p.forma([[x - 16, 0], [x + 16, 0], [x + p.rr(-3, 3), p.rr(70, 150)]], p.lin(x, 0, x, 140, [[0, '#2a2060'], [1, '#110c2c']]), 1); }
    for (let i = 0; i < 14; i++) { const pts: number[][] = []; let x = p.rr(0, 400), y = p.rr(140, 600); for (let k = 0; k < 6; k++) { pts.push([x, y]); x += p.rr(-30, 30); y += p.rr(10, 40); } p.curva(pts, p.p.c2, p.rr(0.8, 2), 0.25); }
    // geodo aberto em volta do ímã (assinatura) e chão de cristais
    const im = acha(m, 'ima')[0] || { x: 190, y: 456 };
    p.nevoa(im.x, im.y, 70, 60, p.p.c1, 0.35, 'lighter');
    for (let i = 0; i < 18; i++) { const q = i / 18 * TAU; p.cristais(im.x + Math.cos(q) * 46, im.y + Math.sin(q) * 40 + 10, 1, p.rr(16, 26), i % 2 ? p.p.c1 : p.p.c2, 0.55); }
    p.aneis(im.x, im.y, 36, 2, p.p.c3, 0.35, 2);
    p.cristais(60, 720, 5, 70, p.p.c2, 0.55); p.cristais(340, 720, 5, 80, p.p.c3, 0.5); p.cristais(200, 760, 7, 40, p.p.c1, 0.35);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c3, 'GOLEM DE QUARTZO', 0.45);
    for (let i = 0; i < 10; i++) p.cintila(p.rr(30, 370), p.rr(160, 700), p.rr(3, 6), p.p.c1, 0.6);
  },

  expresso(p, m) {
    p.ceu([[0, '#03050c'], [0.5, '#141b33'], [1, '#07090f']]);
    p.semente(71).estrelas(80, '#d8fff5', 0, 250); p.lua(320, 70, 22, '#e8fff8', 0.3);
    // plataforma da estação: colunas de ferro, relógio, névoa esverdeada
    p.colunas(330, 5, 220, '#0f1528', 0.85);
    p.forma([[0, 330], [400, 330], [400, 344], [0, 344]], '#1e2742', 1);
    p.disco(200, 160, 30, '#0f1528'); p.aneis(200, 160, 28, 2, p.p.c3, 0.7, 2); p.curva([[200, 160], [200, 140]], p.p.c3, 2.5, 0.8); p.curva([[200, 160], [214, 166]], p.p.c3, 2, 0.8);
    // leito de trilhos na linha real da locomotiva
    const tr = acha(m, 'portaMovel')[0], ty = tr?.trilho ? tr.trilho[1] : 492;
    p.trilhos(40, ty, 360, ty, '#8f6a4a', 0.6); p.nevoa(200, ty, 220, 26, p.p.c1, 0.18, 'lighter');
    for (let i = 0; i < 6; i++) p.nevoa(p.rr(40, 360), p.rr(360, 640), p.rr(40, 80), p.rr(14, 24), p.p.c1, 0.1, 'lighter');
    p.trilhos(120, 760, 170, 560, '#4a3a30', 0.35); p.trilhos(280, 760, 230, 560, '#4a3a30', 0.35);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c3, 'MAQUINISTA', 0.45);
  },

  relojoeiro(p, m) {
    p.ceu([[0, '#140b05'], [0.5, '#2b1a0c'], [1, '#120a05']]);
    p.hachura(0, 0, 400, 760, -0.6, 7, '#3c2612', 0.4);
    p.semente(81);
    for (const [x, y, r, d] of [[60, 120, 50, 14], [350, 200, 64, 18], [40, 420, 40, 12], [360, 520, 46, 14], [110, 640, 34, 10]]) p.engrenagem(x, y, r, d, p.p.c2, 0.35, p.rr(0, 1));
    // mostrador gravado sob o bumper-relógio (assinatura)
    const rel = (m.bumpers.find(b => Math.abs(b.y - 456) < 6 && b.x === 190)) || { x: 190, y: 456 };
    p.disco(rel.x, rel.y, 52, '#3a240f', 0.9); p.aneis(rel.x, rel.y, 50, 3, p.p.c1, 0.6, 1.5);
    ['DOBRO', 'OURO', 'ESCUDO', 'BÔNUS'].forEach((s, i) => p.textoArco(s, rel.x, rel.y, 42, 6, p.p.c3, 0.75, -Math.PI / 2 + i * Math.PI / 2 + Math.PI / 4));
    for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; p.disco(rel.x + Math.cos(q) * 50, rel.y + Math.sin(q) * 50, 2.2, '#c0262e', 0.9); }
    emblema(p, m.chefe.x, m.chefe.y, 42, p.p.c1, 'ENGRENAGEM-MESTRA', 0.45);
    p.texto('XII', 200, 610, 16, p.p.c1, 0.25, 'Georgia');
  },

  feira(p, m) {
    p.ceu([[0, '#0b041c'], [0.5, '#2a0d4a'], [1, '#120626']]);
    p.semente(91).estrelas(70, '#ffe6f4', 0, 220);
    // lona listrada em leque atrás das peças
    for (let i = 0; i < 14; i++) { const a0 = Math.PI + i / 14 * Math.PI, a1 = Math.PI + (i + 1) / 14 * Math.PI; p.forma([[200, 330], [200 + Math.cos(a0) * 330, 330 + Math.sin(a0) * 330], [200 + Math.cos(a1) * 330, 330 + Math.sin(a1) * 330]], i % 2 ? '#3a0f3e' : '#1d0a33', 0.9); }
    p.lampadas(p.arcoPts(200, 330, 200, Math.PI * 1.05, Math.PI * 1.95, 22), p.p.c2, 2.4, 0.8);
    const rd = acha(m, 'rodaGigante')[0] || { x: 190, y: 456 };
    p.nevoa(rd.x, rd.y, 90, 90, p.p.c1, 0.3, 'lighter'); p.rodaGigante(rd.x, rd.y, 58, p.p.c2, 0.4);
    p.tenda(70, 640, 110, 90, p.p.c1, '#f7f1e0', 0.55); p.tenda(330, 640, 110, 90, p.p.c3, '#f7f1e0', 0.55);
    p.lampadas(p.arcoPts(200, 760, 170, Math.PI * 1.12, Math.PI * 1.88, 14), p.p.c1, 2, 0.6);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c2, 'PALHAÇO VOLTAICO', 0.45);
  },

  abissal(p, m) {
    p.ceu([[0, '#03234a'], [0.3, '#04204a'], [0.7, '#020c1e'], [1, '#010612']]);
    // feixes de luz que descem da superfície
    for (const [x, a] of [[60, 1.35], [150, 1.5], [260, 1.62], [350, 1.75]]) p.feixe(x, -40, a, 0.08, 620, '#7fd8ff', 0.16);
    p.semente(101).bolhas(60, p.p.c1, 0.3, 6);
    // recife bioluminescente e tentáculos do Kraken saindo do fundo
    p.tentaculos(200, 790, 7, 300, '#0a2f66', 0.55);
    for (let i = 0; i < 26; i++) { const x = p.rr(20, 380), y = p.rr(560, 740); p.curva([[x, y + 30], [x + p.rr(-8, 8), y + 10], [x + p.rr(-12, 12), y]], i % 3 ? p.p.c1 : p.p.c3, 2, 0.35); p.nevoa(x, y, 6, 6, i % 3 ? p.p.c1 : p.p.c3, 0.5, 'lighter'); }
    // redemoinho da Boca e trilhas dos três canos (posições reais)
    const b = acha(m, 'bocaQueEngole')[0] || { x: 190, y: 456, canos: [] };
    p.espiral(b.x, b.y, 64, 3.2, p.p.c1, 2.4, 0.3); p.nevoa(b.x, b.y, 70, 70, '#000814', 0.6); p.aneis(b.x, b.y, 58, 4, p.p.c1, 0.3, 1.2);
    for (const c of (b.canos || [])) p.neon([[b.x, b.y], [(b.x + c[0]) / 2, (b.y + c[1]) / 2 - 10], [c[0], c[1]]], p.p.c3, 1.2, 0.35);
    for (let i = 0; i < 12; i++) p.nevoa(p.rr(30, 370), p.rr(100, 520), 3, 3, p.p.c3, 0.8, 'lighter');
    emblema(p, m.chefe.x, m.chefe.y, 44, p.p.c1, 'COVIL DO KRAKEN', 0.45);
  },

  vulcao(p, m) {
    p.ceu([[0, '#1a0503'], [0.35, '#3a0a04'], [1, '#0d0201']]);
    p.semente(111); for (let i = 0; i < 6; i++) p.nevoa(p.rr(0, 400), p.rr(0, 160), p.rr(60, 120), p.rr(20, 40), '#4a1a14', 0.6);
    // cone do vulcão com cratera brilhando e rios de magma descendo
    p.forma([[0, 470], [140, 230], [260, 230], [400, 470], [400, 760], [0, 760]], p.lin(0, 230, 0, 760, [[0, '#2a0b06'], [1, '#0a0302']]), 1);
    p.nevoa(200, 232, 70, 24, p.p.c1, 0.8, 'lighter');
    for (const pts of [[[190, 236], [170, 330], [120, 420], [80, 560]], [[210, 236], [236, 340], [300, 440], [330, 600]], [[200, 240], [204, 360], [190, 470]]]) { p.curva(pts, '#ff4a1c', 22, 0.1); p.curva(pts, p.p.c1, 9, 0.1); }
    // basalto rachado
    for (let i = 0; i < 22; i++) { const x = p.rr(10, 390), y = p.rr(480, 740); p.curva([[x, y], [x + p.rr(-20, 20), y + p.rr(8, 22)], [x + p.rr(-30, 30), y + p.rr(24, 40)]], p.p.c2, 1, 0.3); }
    // rio de lava sob a rampa de salto (assinatura)
    for (const r of m.rampas) p.curva(r.caminho.map(q => [q[0], q[1]]), '#ff4a1c', 10, 0.12);
    p.chamas(760, 14, 50, '#ff4a1c', 0.35);
    emblema(p, m.chefe.x, m.chefe.y, 42, p.p.c1, 'CORAÇÃO DE MAGMA', 0.5);
  },

  especiarias(p, m) {
    p.ceu([[0, '#1a0b05'], [0.5, '#4a1f0e'], [1, '#1a0904']]);
    // arcos mouriscos com azulejos
    for (let i = 0; i < 4; i++) { const x = 50 + i * 100; p.forma([[x - 40, 300], [x - 40, 150], ...p.arcoPts(x, 150, 40, Math.PI, TAU, 12), [x + 40, 150], [x + 40, 300]], '#2a0f06', 0.85); p.curva([[x - 40, 300], [x - 40, 150], ...p.arcoPts(x, 150, 40, Math.PI, TAU, 12), [x + 40, 150], [x + 40, 300]], p.p.c1, 1.5, 0.45); }
    // tapete de azulejos sob o labirinto (assinatura)
    const e = acha(m, 'esteira')[0] || { x: 190, y: 456 };
    for (let j = -3; j <= 3; j++) for (let i = -4; i <= 4; i++) { const x = e.x + i * 18, y = e.y + j * 18; p.poligono(x, y, 9, 4, (i + j) % 2 ? p.p.c3 : p.p.c1, 0.2, Math.PI / 4); p.roseta(x, y, 5, 4, p.p.c2, 0.25, 0.8); }
    p.filete(e.x - 82, e.y - 64, 164, 128, 10, p.p.c1, 2, 0.5);
    for (const [x, y] of [[e.x - 46, e.y + 62], [e.x + 46, e.y + 62]]) p.nevoa(x, y, 22, 14, p.p.c1, 0.4, 'lighter');
    // montes de pigmento
    for (const [x, c] of [[70, '#e2572b'], [140, '#ffcc4d'], [260, '#38d6b0'], [330, '#c8326a']] as [number, string][]) { p.forma([[x - 34, 700], [x, 660], [x + 34, 700]], c, 0.4, true); p.forma([[x - 40, 704], [x + 40, 704], [x + 40, 712], [x - 40, 712]], '#2a1206', 0.8); }
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c1, 'VIZIR', 0.45);
  },

  'zero-g'(p, m) {
    p.ceu([[0, '#04040c'], [0.5, '#101a3a'], [1, '#05060f']]);
    p.semente(131).estrelas(200, '#ffffff', 0, 760);
    // planeta e anel de corrida inclinado em volta do chefe
    p.nevoa(330, 620, 140, 140, p.p.c3, 0.3, 'lighter'); p.disco(330, 620, 90, '#0e2550'); p.listras(240, 590, 180, 8, 1, '#1a3a70', '#1a3a70', 0.5);
    const [cx, cy] = [m.chefe.x, m.chefe.y];
    for (let k = 0; k < 3; k++) p.curva(p.arcoPts(0, 0, 1, 0, TAU, 60).map(q => [cx + q[0] * (150 - k * 10), cy + q[1] * (54 - k * 4)]), [p.p.c1, p.p.c2, p.p.c3][k], 2, 0.3);
    // faixas de velocidade nas órbitas (as laterais reais)
    for (const x of m.orbitas) for (let y = 180; y < 520; y += 26) p.chevron(x, y, 5, 0, p.p.c1, 0.22);
    p.xadrez(150, 680, 100, 20, 10, '#ffffff', 0.2);
    emblema(p, cx, cy, 38, p.p.c2, 'PILOTO SOMBRIO', 0.45);
  },

  'floresta-vidro'(p, m) {
    p.ceu([[0, '#03111a'], [0.5, '#0c2c36'], [1, '#041018']]);
    for (const [x, a] of [[80, 1.3], [200, 1.55], [320, 1.8]]) p.feixe(x, -30, a, 0.1, 640, '#d8fbff', 0.14);
    // troncos translúcidos com facetas
    p.semente(141);
    for (const x of [30, 110, 290, 370]) { p.forma([[x - 12, 760], [x - 6, 120], [x + 6, 120], [x + 12, 760]], p.lin(x - 12, 0, x + 12, 0, [[0, alfa(p.p.c2, 0.15)], [0.5, alfa('#ffffff', 0.25)], [1, alfa(p.p.c2, 0.1)]]), 1); }
    for (let i = 0; i < 70; i++) { const x = p.rr(0, 400), y = p.rr(40, 360); p.poligono(x, y, p.rr(6, 14), 3 + Math.floor(p.r() * 3), [p.p.c1, p.p.c2, p.p.c3][i % 3], p.rr(0.12, 0.3), p.rr(0, 6)); }
    // vitral sob os alvos de vidro (assinatura)
    const al = acha(m, 'alvoFixo').filter(a => a.vidasMax === 3);
    for (const a of al) { p.nevoa(a.x, a.y, 20, 14, p.p.c1, 0.4, 'lighter'); p.poligono(a.x, a.y + 4, 16, 6, p.p.c3, 0.25, 0, 1.2); }
    p.cristais(200, 760, 9, 60, p.p.c2, 0.3);
    emblema(p, m.chefe.x, m.chefe.y, 42, p.p.c2, 'ÁRVORE-MÃE', 0.45);
    for (let i = 0; i < 12; i++) p.cintila(p.rr(20, 380), p.rr(60, 640), p.rr(3, 6), '#ffffff', 0.5);
  },

  orion(p, m) {
    p.ceu([[0, '#02040a'], [0.5, '#0c1830'], [1, '#040710']]);
    p.semente(151).estrelas(180, '#ffffff', 0, 760);
    p.nevoa(110, 200, 120, 80, '#ff8a3d', 0.22, 'lighter'); p.nevoa(150, 230, 90, 60, '#7a5cff', 0.22, 'lighter');
    p.constelacao([[60, 90], [110, 120], [150, 116], [190, 128], [240, 92], [150, 180], [120, 240], [180, 240]], '#e6ecff', 0.5);
    // painéis solares e casco da estação
    for (const y of [300, 340]) { p.chapas(0, y, 60, 30, 20, 15, '#14304a', 0.8); p.chapas(340, y, 60, 30, 20, 15, '#14304a', 0.8); }
    p.grade(20, '#6ee7ff', 0.06, 380);
    // doca hexagonal do braço robótico (assinatura) com marcas de mira
    const br = acha(m, 'bracoRobotico')[0] || { x: 190, y: 456 };
    p.poligono(br.x, br.y, 46, 6, '#0d1f36', 0.85, 0); p.poligono(br.x, br.y, 46, 6, p.p.c1, 0.6, 0, 1.5); p.poligono(br.x, br.y, 30, 6, p.p.c3, 0.35, 0, 1);
    for (let i = 0; i < 4; i++) { const q = i / 4 * TAU; p.curva([[br.x + Math.cos(q) * 52, br.y + Math.sin(q) * 52], [br.x + Math.cos(q) * 64, br.y + Math.sin(q) * 64]], p.p.c3, 2, 0.6); }
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c1, 'IA-ÓRION', 0.45);
  },

  catacumbas(p, m) {
    p.ceu([[0, '#060509'], [0.5, '#1a1622'], [1, '#08070b']]);
    p.pedras(0, 0, 400, 760, 30, 15, '#16131c', '#0a080d', 1);
    // arcos de galeria com nichos de ossos e velas
    for (const x of [70, 200, 330]) { const pts = [[x - 50, 360], [x - 50, 220], ...p.arcoPts(x, 220, 50, Math.PI, TAU, 14), [x + 50, 220], [x + 50, 360]]; p.forma(pts, '#07060a', 0.85); p.curva(pts, p.p.c2, 2, 0.35); }
    for (const [x, y] of [[40, 340], [100, 340], [170, 340], [230, 340], [300, 340], [360, 340]]) { p.forma([[x - 2, y], [x - 2, y - 14], [x + 2, y - 14], [x + 2, y]], '#d8cfb8', 0.8); p.nevoa(x, y - 18, 10, 14, p.p.c1, 0.6, 'lighter'); p.forma([[x - 2, y - 14], [x, y - 22], [x + 2, y - 14]], '#eaffc0', 0.9); }
    // nicho da caveira (assinatura)
    const cv = acha(m, 'bocaQueEngole')[0] || { x: 190, y: 456 };
    p.nevoa(cv.x, cv.y, 70, 60, p.p.c1, 0.25, 'lighter'); p.poligono(cv.x, cv.y, 54, 8, '#07060a', 0.7, Math.PI / 8); p.poligono(cv.x, cv.y, 54, 8, p.p.c3, 0.5, Math.PI / 8, 1.5);
    for (let i = 0; i < 10; i++) { const x = p.rr(30, 370), y = p.rr(560, 730); p.forma([[x - 8, y], [x + 8, y], [x + 6, y + 3], [x - 6, y + 3]], '#bdb39a', 0.25); }
    p.textoArco('MEMENTO', 200, 640, 60, 9, p.p.c2, 0.3, -Math.PI / 2, 'Georgia');
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c3, 'GUARDIÃO', 0.45);
  },

  tempestade(p, m) {
    p.ceu([[0, '#04050c'], [0.4, '#18223f'], [1, '#070a14']]);
    // espiral de nuvens com o olho do ciclone no moinho (assinatura)
    const ms = acha(m, 'pasDeMoinho')[0] || { x: 190, y: 456 };
    p.semente(171);
    for (let k = 0; k < 4; k++) p.espiral(ms.x, ms.y, 260 - k * 40, 2.2, ['#2a3a6e', '#22305a', '#3a4c86', '#1c2850'][k], 18 - k * 3, 0.4);
    p.nevoa(ms.x, ms.y, 60, 60, p.p.c1, 0.3, 'lighter');
    // chuva diagonal e relâmpagos distantes
    for (let i = 0; i < 160; i++) { const x = p.rr(0, 420), y = p.rr(0, 760); p.curva([[x, y], [x - 6, y + 16]], '#a8c4ff', 0.8, 0.18); }
    p.relampago(60, 0, 100, 220, p.p.c3, 2, 0.6); p.relampago(360, 40, 320, 260, p.p.c3, 1.6, 0.45);
    // casinha do moinho no horizonte
    p.forma([[0, 640], [120, 610], [260, 630], [400, 604], [400, 760], [0, 760]], '#060912', 1);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c1, 'OLHO DO CICLONE', 0.45);
  },

  circo(p, m) {
    p.ceu([[0, '#12030a'], [0.5, '#3d0a1c'], [1, '#14040a']]);
    // lona em gomos convergindo para o topo
    for (let i = 0; i < 16; i++) p.forma([[200, -60], [i * 27 - 16, 420], [(i + 1) * 27 - 16, 420]], i % 2 ? '#5c0f22' : '#e9e2d0', i % 2 ? 0.85 : 0.18);
    p.lampadas(p.arcoPts(200, 420, 230, Math.PI * 1.08, Math.PI * 1.92, 20), p.p.c1, 2.2, 0.7);
    // picadeiro com alvo pintado sob o canhão (assinatura)
    p.nevoa(200, 560, 170, 70, '#3a1608', 0.8); p.aneis(200, 560, 150, 2, p.p.c1, 0.55, 3);
    const cn = acha(m, 'canhao')[0] || { x: 190, y: 456 };
    p.aneis(cn.x, cn.y, 34, 4, p.p.c2, 0.4, 3); p.disco(cn.x, cn.y, 6, p.p.c2, 0.6);
    p.feixe(30, 0, 1.15, 0.12, 620, '#fff3c0', 0.18); p.feixe(370, 0, 1.99, 0.12, 620, '#fff3c0', 0.18);
    p.semente(181); for (let i = 0; i < 160; i++) p.disco(p.rr(30, 370), p.rr(500, 740), 0.8, '#c99a5a', 0.3);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c1, 'MESTRE DE PISTA', 0.45);
  },

  prisma(p, m) {
    p.ceu([[0, '#05060c'], [0.5, '#151a2c'], [1, '#07080f']]);
    p.grade(25, '#7aa2ff', 0.08); p.grade(100, '#7aa2ff', 0.12);
    // bancada óptica: lentes em trilho
    for (const x of [60, 130, 270, 340]) { p.forma([[x - 3, 140], [x + 3, 140], [x + 3, 180], [x - 3, 180]], '#3a4466', 0.8); p.nevoa(x, 130, 10, 18, '#ffffff', 0.3, 'lighter'); p.curva(p.arcoPts(x, 130, 14, -1, 1, 8), '#cfe0ff', 1.5, 0.6); }
    p.curva([[20, 182], [380, 182]], '#3a4466', 3, 0.8);
    // feixe branco que chega ao prisma (assinatura) e sai em espectro
    const pr = m.pecas.find(q => q.tipo === 'captor' && q.rotulo === 'PRISMA') || { x: 190, y: 456 };
    p.feixe(pr.x, pr.y, -Math.PI / 2 - 0.9, 0.05, 260, '#ffffff', 0.35);
    ['#ff4d6d', '#ffb14d', '#fff14d', '#4dff88', '#4da6ff', '#a24dff'].forEach((k, i) => p.feixe(pr.x, pr.y, Math.PI / 2 - 0.5 + i * 0.2, 0.06, 300, k, 0.22));
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c2, 'PRISMA', 0.45);
    p.semente(191); for (let i = 0; i < 10; i++) p.cintila(p.rr(30, 370), p.rr(60, 560), p.rr(2, 5), '#ffffff', 0.6);
  },

  deserto(p, m) {
    p.ceu([[0, '#2a1606'], [0.25, '#5a3a14'], [0.6, '#8a5a24'], [1, '#2a1a08']]);
    // sol dramático e raios
    p.nevoa(200, 90, 160, 120, '#ffe9a8', 0.5, 'lighter'); p.disco(200, 90, 40, '#fff1c8', 0.9); p.raios(200, 90, 420, 20, '#ffe9a8', 0.07, 0.4);
    // ruínas douradas e dunas
    p.colunas(330, 5, 110, '#6a4518', 0.5);
    p.dunas(360, 6, '#7a4e1c', '#5a3812', 0.9);
    // redemoinho de areia no poço (assinatura)
    const po = acha(m, 'pocoDeAreia')[0] || { x: 190, y: 456 };
    p.espiral(po.x, po.y, 54, 3, '#ffe9a8', 2, 0.4); p.nevoa(po.x, po.y, 40, 40, '#2a1206', 0.5);
    p.semente(201); for (let i = 0; i < 200; i++) p.disco(p.rr(0, 400), p.rr(360, 760), 0.7, '#ffe9a8', 0.18);
    p.calma(520, 0.35);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c1, 'VERME', 0.5);
  },

  biblioteca(p, m) {
    p.ceu([[0, '#0f0906'], [0.5, '#2c1a10'], [1, '#100a06']]);
    // estantes em perspectiva convergindo ao centro
    p.estantes(0, 0, 120, 420, 7, 0.75); p.estantes(280, 0, 120, 420, 7, 0.75);
    p.forma([[120, 0], [280, 0], [240, 420], [160, 420]], p.lin(0, 0, 0, 420, [[0, '#1a0f08'], [1, '#2c1a10']]), 1);
    for (let y = 30; y < 420; y += 40) p.curva([[120 + y * 0.095, y], [280 - y * 0.095, y]], '#3a2414', 2, 0.6);
    // escada e páginas soltas
    p.curva([[300, 420], [340, 120]], '#6a4424', 3, 0.6); p.curva([[320, 420], [360, 120]], '#6a4424', 3, 0.6); for (let k = 0; k < 9; k++) p.curva([[300 + k * 4.4, 420 - k * 33], [320 + k * 4.4, 420 - k * 33]], '#6a4424', 2, 0.6);
    p.semente(211); for (let i = 0; i < 16; i++) { const x = p.rr(40, 360), y = p.rr(440, 700); p.poligono(x, y, 7, 4, '#f2e2c0', 0.18, p.rr(0, 3)); }
    // tapete com lombadas sob o banco de queda (as cartas)
    p.filete(110, 330, 160, 70, 6, p.p.c1, 1.2, 0.3);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c1, 'BIBLIOTECÁRIO', 0.45);
    p.nevoa(200, 560, 140, 60, '#ffd9a0', 0.12, 'lighter');
  },

  reator(p, m) {
    p.ceu([[0, '#040805'], [0.5, '#10261a'], [1, '#050a06']]);
    p.chapas(0, 0, 400, 760, 50, 38, '#14221a', 0.9);
    // tubulações laterais
    for (const x of [26, 50, 350, 374]) { p.curva([[x, 0], [x, 760]], '#2a3a30', 10, 1); p.curva([[x - 3, 0], [x - 3, 760]], '#5a7466', 2, 0.6); for (let y = 40; y < 760; y += 90) p.forma([[x - 8, y], [x + 8, y], [x + 8, y + 8], [x - 8, y + 8]], '#3a4a40', 1); }
    // núcleo com anéis de contenção sob o chefe
    const [cx, cy] = [m.chefe.x, m.chefe.y];
    p.nevoa(cx, cy, 90, 90, p.p.c1, 0.45, 'lighter');
    for (let k = 0; k < 4; k++) p.curva(p.arcoPts(0, 0, 1, 0, TAU, 50).map(q => [cx + q[0] * (60 + k * 16), cy + q[1] * (60 + k * 16) * 0.95]), k % 2 ? p.p.c2 : p.p.c1, 2.5, 0.35);
    p.texto('PERIGO', 200, 600, 12, p.p.c2, 0.4); p.listras(130, 616, 140, 10, 14, p.p.c2, '#111', 0.35);
    emblema(p, cx, cy, 40, p.p.c1, 'NÚCLEO', 0.5);
  },

  carnaval(p, m) {
    p.ceu([[0, '#12041c'], [0.5, '#3a0c52'], [1, '#180624']]);
    // serpentinas que guiam até as rampas reais
    for (const r of m.rampas) { const x = r.mx; p.curva([[x, 700], [x - 30 * r.lado, 600], [x + 20 * r.lado, 520], [x, 440]], [p.p.c1, p.p.c2][r.lado > 0 ? 0 : 1], 4, 0.35); }
    p.semente(231); for (let i = 0; i < 22; i++) { const x = p.rr(0, 400), y = p.rr(0, 760); p.curva([[x, y], [x + p.rr(-30, 30), y + 20], [x + p.rr(-30, 30), y + 40]], [p.p.c1, p.p.c2, p.p.c3][i % 3], 2, 0.3); }
    // plumas e máscaras
    for (const [x, y, s] of [[60, 140, 1], [340, 160, -1]]) for (let k = 0; k < 7; k++) p.forma([[x, y + 60], [x + s * (k * 10 - 30) - 6, y - 40 + Math.abs(k - 3) * 10], [x + s * (k * 10 - 30) + 6, y - 40 + Math.abs(k - 3) * 10]], [p.p.c1, p.p.c2, p.p.c3][k % 3], 0.35, true);
    p.mascara(200, 600, 46, p.p.c1, p.p.c2, 0.3);
    // avenida iluminada
    p.lampadas(Array.from({ length: 10 }, (_, i) => [40 + i * 36, 720]), p.p.c1, 2, 0.6);
    emblema(p, m.chefe.x, m.chefe.y, 42, p.p.c1, 'REI MOMO', 0.5);
  },

  'cidade-neon'(p, m) {
    p.ceu([[0, '#04020c'], [0.4, '#160a3a'], [1, '#060312']]);
    // horizonte de prédios com janelas e letreiros
    p.semente(241); p.predios(260, 200, '#0b0624', '#21e6ff', 0.9); p.predios(300, 120, '#07041a', '#ff2bd6', 1);
    for (const [x, y, w, cor, s] of [[60, 120, 70, p.p.c1, 'HOTEL'], [300, 150, 76, p.p.c2, 'BAR 24H'], [180, 70, 60, p.p.c3, 'NOODLE']] as [number, number, number, string, string][]) { p.filete(x - w / 2, y - 12, w, 24, 4, cor, 2, 0.75); p.nevoa(x, y, w * 0.8, 20, cor, 0.25, 'lighter'); p.texto(s, x, y + 1, 10, cor, 0.85); }
    // asfalto molhado com reflexos verticais
    p.forma([[0, 300], [400, 300], [400, 760], [0, 760]], p.lin(0, 300, 0, 760, [[0, '#0d0828'], [1, '#05030e']]), 1);
    for (let i = 0; i < 40; i++) { const x = p.rr(10, 390); p.curva([[x, 310], [x + p.rr(-2, 2), 310 + p.rr(30, 120)]], [p.p.c1, p.p.c2, p.p.c3][i % 3], p.rr(1, 3), 0.12); }
    // trilhos da perseguição em neon (posição real da assinatura)
    const g = acha(m, 'alvoGiratorio')[0];
    if (g?.trilho) { p.neon(g.trilho, p.p.c2, 2, 0.6); for (const q of g.trilho) p.disco(q[0], q[1], 4, p.p.c3, 0.7); }
    // faixa de pedestre e viaduto na base
    for (let i = 0; i < 9; i++) p.forma([[110 + i * 20, 640], [122 + i * 20, 640], [126 + i * 20, 672], [114 + i * 20, 672]], '#e8e8ff', 0.1);
    p.curva([[0, 560], [400, 520]], '#1a1240', 16, 0.8); p.curva([[0, 553], [400, 513]], p.p.c1, 1.5, 0.4);
    emblema(p, m.chefe.x, m.chefe.y, 42, p.p.c1, 'SINDICATO', 0.5);
  },

  jardim(p, m) {
    p.ceu([[0, '#041008'], [0.5, '#12382a'], [1, '#06140c']]);
    // terraços de canteiros e cipós
    for (let k = 0; k < 4; k++) { const y = 160 + k * 150; p.forma([[0, y], [400, y - 10], [400, y + 14], [0, y + 24]], '#0b2a1a', 0.8); p.curva([[0, y], [400, y - 10]], p.p.c2, 2, 0.35); }
    p.semente(251); for (let i = 0; i < 10; i++) { const x = p.rr(0, 400); const pts: number[][] = []; for (let y = 0; y < 300; y += 30) pts.push([x + Math.sin(y * 0.05 + i) * 12, y]); p.curva(pts, '#1f5a34', 3, 0.6); for (const q of pts) p.forma([[q[0], q[1]], [q[0] + 8, q[1] - 4], [q[0] + 4, q[1] + 4]], p.p.c2, 0.4); }
    for (let i = 0; i < 24; i++) p.flor(p.rr(20, 380), p.rr(80, 740), p.rr(5, 10), [p.p.c1, p.p.c3, '#ffffff'][i % 3], '#ffe46b', 0.4);
    // canteiros sob as flores mecânicas (assinatura)
    for (const f of acha(m, 'flor')) { p.nevoa(f.x, f.y, 26, 20, p.p.c1, 0.35, 'lighter'); p.flor(f.x, f.y, 22, p.p.c1, p.p.c3, 0.25, 8); }
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c2, 'RAINHA-RAIZ', 0.45);
    for (let i = 0; i < 18; i++) p.nevoa(p.rr(30, 370), p.rr(80, 600), 3, 3, p.p.c3, 0.8, 'lighter');
  },

  mina(p, m) {
    p.ceu([[0, '#0a0705'], [0.5, '#22170e'], [1, '#0a0604']]);
    // rocha e veios de minério
    p.semente(261); for (let i = 0; i < 30; i++) p.poligono(p.rr(0, 400), p.rr(0, 760), p.rr(20, 50), 5 + Math.floor(p.r() * 3), '#2a1d12', 0.5, p.rr(0, 3));
    for (let i = 0; i < 26; i++) { const x = p.rr(10, 390), y = p.rr(20, 740); p.nevoa(x, y, 5, 5, i % 2 ? p.p.c1 : p.p.c3, 0.7, 'lighter'); p.poligono(x, y, 3, 4, '#fff1c8', 0.6); }
    // escoras de madeira e poço do elevador (assinatura)
    const el = acha(m, 'elevador')[0] || { x: 190, y: 456 };
    for (const dx of [-36, 36]) p.curva([[el.x + dx, 100], [el.x + dx, el.y + 40]], '#6a4424', 7, 0.7);
    for (let y = 120; y < el.y + 40; y += 46) p.curva([[el.x - 40, y], [el.x + 40, y]], '#6a4424', 6, 0.6);
    p.forma([[el.x - 32, 100], [el.x + 32, 100], [el.x + 32, el.y + 40], [el.x - 32, el.y + 40]], '#050302', 0.45);
    for (const [x, y] of [[el.x - 50, 128], [el.x - 50, 232], [el.x + 50, 232]]) { p.nevoa(x, y, 22, 22, p.p.c1, 0.5, 'lighter'); p.disco(x, y, 3, '#fff1c8'); }
    p.trilhos(20, 700, 380, 660, '#7a5a3a', 0.5);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c1, 'CAPATAZ', 0.45);
  },

  templo(p, m) {
    p.ceu([[0, '#030a05'], [0.5, '#1c2a16'], [1, '#07100a']]);
    // folhagem da selva no topo
    p.semente(271); for (let i = 0; i < 60; i++) { const x = p.rr(-10, 410), y = p.rr(-10, 120); p.forma([[x, y], [x + p.rr(10, 30), y + p.rr(-6, 10)], [x + p.rr(4, 14), y + p.rr(14, 30)]], i % 2 ? '#0f3a1c' : '#174a26', 0.8); }
    // colunas, degraus e glifos
    p.colunas(420, 6, 220, '#2a3020', 0.55);
    for (let k = 0; k < 6; k++) p.forma([[60 + k * 12, 600 + k * 22], [340 - k * 12, 600 + k * 22], [340 - k * 12, 622 + k * 22], [60 + k * 12, 622 + k * 22]], k % 2 ? '#1a2414' : '#222e1a', 0.75);
    for (let i = 0; i < 12; i++) { const x = 40 + (i % 6) * 64, y = i < 6 ? 190 : 260; p.filete(x - 10, y - 10, 20, 20, 3, p.p.c2, 1.2, 0.35); p.espiral(x, y, 7, 1.6, p.p.c2, 1, 0.4); }
    // escamas na rampa da serpente (assinatura)
    const r = m.rampas[1] || m.rampas[0];
    if (r) for (let k = 0; k < r.caminho.length; k++) { const q = r.caminho[k]; p.poligono(q[0], q[1], 7, 6, p.p.c1, 0.22, 0); }
    for (const [x, y] of [[60, 560], [340, 560]]) { p.nevoa(x, y, 20, 28, '#ff5a3c', 0.5, 'lighter'); p.forma([[x - 6, y + 8], [x, y - 14], [x + 6, y + 8]], '#ffb347', 0.8); }
    emblema(p, m.chefe.x, m.chefe.y, 42, p.p.c2, 'SERPENTE', 0.5);
  },

  estudio45(p, m) {
    p.ceu([[0, '#0b060e'], [0.5, '#2a1230'], [1, '#0e0712']]);
    // painel acústico em losangos
    for (let j = 0; j < 10; j++) for (let i = 0; i < 9; i++) p.poligono(i * 48 + (j % 2) * 24, j * 34, 22, 4, j % 2 ? '#1c0c22' : '#251029', 0.8, 0);
    // mesa de som com faders e VU-metros
    p.forma([[20, 600], [380, 600], [400, 760], [0, 760]], '#140a18', 1);
    for (let i = 0; i < 14; i++) { const x = 40 + i * 24; p.curva([[x, 620], [x, 700]], '#3a2a40', 3, 1); p.forma([[x - 6, 640 + (i * 37) % 50], [x + 6, 640 + (i * 37) % 50], [x + 6, 648 + (i * 37) % 50], [x - 6, 648 + (i * 37) % 50]], '#c9cee6', 0.7); }
    for (const x of [90, 310]) { p.disco(x, 110, 34, '#1a0f1e'); p.curva(p.arcoPts(x, 124, 26, Math.PI * 1.2, Math.PI * 1.8, 10), p.p.c1, 2, 0.6); p.curva([[x, 124], [x + 14, 100]], '#ffffff', 1.5, 0.8); }
    // prato gravado sob o vinil (assinatura)
    const v = acha(m, 'rodaDeVinil')[0] || { x: 190, y: 456 };
    p.disco(v.x, v.y, 62, '#120a14'); p.aneis(v.x, v.y, 60, 12, '#3a2a44', 0.6, 1); p.aneis(v.x, v.y, 64, 1, p.p.c1, 0.6, 2);
    p.textoArco('33 · 45 · 78', v.x, v.y, 70, 7, p.p.c3, 0.6);
    p.semente(281); for (let i = 0; i < 10; i++) p.nota(p.rr(30, 370), p.rr(160, 560), p.rr(6, 10), [p.p.c1, p.p.c2, p.p.c3][i % 3], 0.25);
    emblema(p, m.chefe.x, m.chefe.y, 40, p.p.c2, 'PRODUTOR', 0.45);
  },

  gelada(p, m) {
    p.ceu([[0, '#030d18'], [0.4, '#0f3050'], [1, '#06182a']]);
    p.cortina(40, 20, 120, '#b9a4ff', 0.16, 1.2); p.cortina(70, 26, 100, '#7dfff0', 0.12, 3.3);
    // geleira em camadas
    p.forma([[0, 260], [80, 220], [150, 250], [230, 200], [320, 240], [400, 210], [400, 760], [0, 760]], p.lin(0, 200, 0, 760, [[0, '#b8e6ff'], [0.06, '#3a7cb0'], [0.4, '#174870'], [1, '#08203a']]), 0.9);
    // rachaduras do piso de gelo
    p.semente(291); for (let i = 0; i < 18; i++) { const pts: number[][] = []; let x = p.rr(20, 380), y = p.rr(280, 720); for (let k = 0; k < 5; k++) { pts.push([x, y]); x += p.rr(-26, 26); y += p.rr(-18, 18); } p.curva(pts, '#e6fbff', 0.8, 0.35); }
    p.flocos(40, '#e6fbff', 0.35);
    p.cristais(60, 760, 4, 80, '#e6fbff', 0.3); p.cristais(340, 760, 4, 90, '#b9a4ff', 0.25);
    p.nevoa(200, 450, 170, 120, '#e6fbff', 0.08, 'lighter');
    emblema(p, m.chefe.x, m.chefe.y, 42, p.p.c1, 'COLOSSO', 0.5);
  },

  relampago(p, m) {
    p.ceu([[0, '#02020a'], [0.4, '#141a3d'], [1, '#05061a']]);
    // céu monumental de tempestade com nuvens douradas
    p.semente(301); for (let i = 0; i < 10; i++) p.nevoa(p.rr(0, 400), p.rr(0, 220), p.rr(70, 140), p.rr(24, 46), i % 3 ? '#2a3566' : '#4a4020', 0.6);
    p.relampago(200, 0, 190, 260, p.p.c1, 4, 0.75); p.relampago(40, 40, 120, 300, p.p.c2, 2, 0.5); p.relampago(360, 30, 280, 300, p.p.c2, 2, 0.5);
    // colunatas de mármore e escadaria do Olimpo
    p.colunas(560, 7, 200, '#2a2f56', 0.55);
    for (let k = 0; k < 7; k++) p.forma([[40 + k * 10, 560 + k * 26], [360 - k * 10, 560 + k * 26], [360 - k * 10, 576 + k * 26], [40 + k * 10, 576 + k * 26]], k % 2 ? '#1c2148' : '#262c5a', 0.8);
    // selos dos seis poderes em volta do chefe
    const [cx, cy] = [m.chefe.x, m.chefe.y];
    for (let i = 0; i < 6; i++) { const q = -Math.PI / 2 + i / 6 * TAU, x = cx + Math.cos(q) * 70, y = cy + Math.sin(q) * 62; p.poligono(x, y, 11, 6, p.p.c1, 0.35, 0, 1.5); p.nevoa(x, y, 14, 14, p.p.c1, 0.3, 'lighter'); }
    p.raios(cx, cy, 340, 24, p.p.c1, 0.06, 0.3);
    emblema(p, cx, cy, 46, p.p.c1, 'O PRIMEIRO', 0.6);
  },
};

/** Camada comum a todas as mesas: poças de luz sob as peças, setas pintadas nos tiros reais, canaleta, calmaria embaixo, grão e vinheta. */
export function acabamento(p: Pincel, m: InfoMesa, luz: string) {
  for (const b of m.bumpers) { p.nevoa(b.x, b.y + 4, b.r * 2.6, b.r * 2.2, luz, 0.22, 'lighter'); p.nevoa(b.x, b.y + 6, b.r * 1.3, b.r * 1.1, '#000000', 0.35); }
  // setas de pista: ficam ABAIXO da entrada real de cada rampa e órbita, apontando para ela
  for (const r of m.rampas) for (let k = 0; k < 3; k++) p.chevron(r.mx, 474 + k * 18, 6, 0, k === 0 ? '#ffffff' : luz, 0.42 - k * 0.1);
  for (const x of m.orbitas) for (let k = 0; k < 2; k++) p.chevron(x, 498 + k * 16, 4.5, 0, luz, 0.32 - k * 0.1);
  // canaleta do lançador: aço escovado
  p.forma([[362, 120], [392, 120], [392, 760], [362, 760]], p.lin(362, 0, 392, 0, [[0, 'rgba(0,0,0,0.55)'], [0.5, 'rgba(40,46,70,0.35)'], [1, 'rgba(0,0,0,0.55)']]), 1);
  for (let y = 560; y < 740; y += 26) p.chevron(377, y, 4, 0, luz, 0.18);
  p.calma(540, 0.5);
  p.grao(0.07); p.vinheta(0.5);
  void tom;
}
