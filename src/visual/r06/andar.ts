// R06 · Ambientes especiais (andar de cima e subfases): cada tipo tem cenário próprio, com continuidade temática
// (paleta, metal e chefe da máquina), não apenas a mesa escurecida. A geometria é a do campo real; aqui só o piso.
import type { MachineDef } from '../../machines/_schema';
import { novaTela } from '../../render/tema';
import type { InfoMesa } from '../cenas';
import { Pincel } from '../pincel';
import { Ctx, TAU, alfa, arco, brilho, chapas, degrade, feixe, lampadas, pedras, placaChefe, sombra, textura, tom } from './arte';
import { retratoChefe } from './chefes';
import { paletaDe } from './paleta';

export function andarPremium(d: MachineDef, titulo: string, tipo: string, _m: InfoMesa): HTMLCanvasElement {
  const [t, c] = novaTela(400, 760, 1.5), P = paletaDe(d.id), p = new Pincel(c, d.paleta, 400, 760), k = d.paleta;
  const [nome, sub] = [titulo.split(' · ')[0], titulo.split(' · ')[1] || d.andar.nome.toUpperCase()];
  if (tipo === 'chefao' || tipo === 'nucleo') arenaChefe(c, d, P);
  else if (tipo === 'bonus') cofre(c, P);
  else if (tipo === 'premium' || tipo === 'camara') salao(c, P, k.c3);
  else if (tipo === 'enxame') colmeia(c, P);
  else if (tipo === 'muralha') muralha(c, P);
  else salao(c, P, k.c2);
  // letreiro do ambiente
  c.save(); c.font = '800 22px Orbitron, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,0.75)'; c.strokeText(nome, 190, 470);
  const g = c.createLinearGradient(0, 458, 0, 482); g.addColorStop(0, '#ffffff'); g.addColorStop(1, tipo === 'chefao' ? '#ff5577' : k.c1); c.fillStyle = g; c.fillText(nome, 190, 470);
  c.font = '700 11px Orbitron, sans-serif'; c.fillStyle = '#e8ecff'; c.fillText(sub, 190, 494); c.restore();
  const cal = c.createLinearGradient(0, 600, 0, 760); cal.addColorStop(0, 'rgba(0,0,0,0)'); cal.addColorStop(1, 'rgba(0,0,0,0.6)'); c.fillStyle = cal; c.fillRect(0, 600, 400, 160);
  p.vinheta(0.6, 190, 320); p.grao(0.07);
  return t;
}

/** confronto: arena de pedra escura sob luz vermelha, sigilo do chefe gravado e anéis de perigo */
function arenaChefe(c: Ctx, d: MachineDef, P: ReturnType<typeof paletaDe>) {
  degrade(c, 400, 760, [[0, '#120306'], [0.5, '#2a060e'], [1, '#080204']]);
  pedras(c, 0, 0, 400, 760, 44, 22, '#2a1418', 501);
  degrade(c, 400, 760, [[0, 'rgba(60,0,10,0.35)'], [1, 'rgba(0,0,0,0.5)']]);
  for (const x of [40, 360]) feixe(c, x, 0, x < 200 ? 1.1 : 2.04, 0.14, 700, '#ff3355', 0.18);
  placaChefe(c, 190, 230, 120, '#8a2a30', '', 72); placaChefe(c, 190, 230, 78, '#c8404a');
  c.save(); c.globalAlpha = 0.35; retratoChefe(c, 190, 230, 56, P, d.chefe.forma as any); c.restore();
  for (let i = 0; i < 16; i++) { const q = i / 16 * TAU; c.save(); c.translate(190 + Math.cos(q) * 150, 230 + Math.sin(q) * 150); c.rotate(q + Math.PI / 2); c.fillStyle = i % 2 ? '#ffcc00' : '#1a0a0a'; c.fillRect(-7, -3, 14, 6); c.restore(); }
  brilho(c, 190, 400, 120, '#ff3355', 0.15);
}
/** fase bônus: cofre de ouro, piso de placas douradas e chuva de luz */
function cofre(c: Ctx, P: ReturnType<typeof paletaDe>) {
  degrade(c, 400, 760, [[0, '#1a1204'], [0.5, '#3a2808'], [1, '#100a02']]);
  chapas(c, 20, 60, 360, 700, 60, 60, '#6a4a14', 511);
  textura(c, 0, 0, 400, 760, 512, ['#000000', '#a07a20', '#fff0b0'], 0.18, 0.5);
  for (let k = 1; k <= 3; k++) { c.strokeStyle = alfa('#ffd27a', 0.45 / k); c.lineWidth = 3; c.beginPath(); c.arc(190, 300, k * 60, 0, TAU); c.stroke(); }
  lampadas(c, arco(190, 300, 182, 0, TAU * 0.97, 34), '#ffd27a', 2);
  for (let i = 0; i < 8; i++) feixe(c, 30 + i * 48, -20, Math.PI / 2, 0.05, 700, '#fff0b0', 0.08);
  brilho(c, 190, 300, 160, P.insertos.bonus, 0.2);
}
/** etapa premium: salão com piso de ladrilhos hexagonais na cor da máquina e holofotes */
function salao(c: Ctx, P: ReturnType<typeof paletaDe>, cor: string) {
  degrade(c, 400, 760, [[0, tom(P.luz, -0.88)], [0.5, tom(cor, -0.82)], [1, '#04040a']]);
  for (let j = 0; j < 30; j++) for (let i = 0; i < 12; i++) { const x = i * 36 + (j % 2) * 18, y = 60 + j * 24; c.fillStyle = alfa((i + j) % 3 ? '#0a0c1e' : tom(cor, -0.6), 0.9); c.beginPath(); for (let k = 0; k < 6; k++) { const q = k / 6 * TAU + Math.PI / 6; c.lineTo(x + Math.cos(q) * 17, y + Math.sin(q) * 14); } c.closePath(); c.fill(); c.strokeStyle = alfa(cor, 0.22); c.lineWidth = 1; c.stroke(); }
  for (const [x, a] of [[40, 1.1], [190, Math.PI / 2], [340, 2.04]]) feixe(c, x, 0, a, 0.12, 700, P.luz, 0.16);
  brilho(c, 190, 300, 170, cor, 0.18); sombra(c, 190, 300, 60, 0.3);
}
function colmeia(c: Ctx, P: ReturnType<typeof paletaDe>) { salao(c, P, P.alvo.face); for (let i = 0; i < 40; i++) brilho(c, 40 + (i * 97) % 320, 80 + (i * 53) % 420, 5, P.alvo.aceso, 0.5); }
function muralha(c: Ctx, P: ReturnType<typeof paletaDe>) { degrade(c, 400, 760, [[0, '#0a0a12'], [1, '#04040a']]); pedras(c, 0, 0, 400, 760, 50, 25, tom(P.parede.topo, 0.1), 521); for (const x of [40, 360]) feixe(c, x, 0, x < 200 ? 1.1 : 2.04, 0.14, 700, P.luz, 0.16); }
