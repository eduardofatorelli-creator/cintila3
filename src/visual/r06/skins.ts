// R06 · Registro das skins premium das 30 máquinas (por id). A Aurora mantém o tablado e o backglass aprovados na R05.
import type { Campo } from '../../core/physics';
import type { MachineDef } from '../../machines/_schema';
import type { Pintor } from '../../render/playfield';
import { infoPadrao } from '../cenas';
import { Pincel, alfa, tom } from '../pincel';
import { auroraTablado, auroraVidro } from '../r05/aurora-arte';
import { SKINS, type Skin } from '../r05/skin';
import { finaliza } from './arte';
import { efeitoContinuo } from './assinaturas';
import { RECEITAS } from './cenas';
import { pChefe, retratoChefe } from './chefes';
import { PALETAS, paletaDe, type PalR06 } from './paleta';
import { antesPecas, pAlvo, pBanco, pBoca, pBumper, pEstilingue, pGiro, pPas, pPoste, pPosteCentral, pRampa, pSaucer, pTijolo, pVinil, paredes } from './pecas';

/** backglass premium: cena da máquina no fundo, retrato do chefe, título em letreiro cromado */
export function vidroPremium(L: CanvasRenderingContext2D[], w: number, h: number, d: MachineDef, P: PalR06) {
  const [c0, c1, c2] = L, rec = RECEITAS[d.id];
  if (rec) { c0.save(); c0.scale(w / 400, w / 400); rec(c0, new Pincel(c0, d.paleta, 400, 760), infoPadrao(d), P); c0.restore(); }
  const gd = c0.createLinearGradient(0, 0, 0, h); gd.addColorStop(0, 'rgba(0,0,0,0.1)'); gd.addColorStop(1, 'rgba(0,0,0,0.5)'); c0.fillStyle = gd; c0.fillRect(0, 0, w, h);
  retratoChefe(c1, w * 0.86, h * 0.22, h * 0.13, P, d.chefe.forma as any);
  const nome = d.nome.toUpperCase(), tx = w * 0.43, ty = h * 0.19; let tam = h * 0.19;
  c2.save(); c2.font = `800 ${tam}px Orbitron, sans-serif`; const mw = c2.measureText(nome).width, mx = w * 0.7; if (mw > mx) { tam *= mx / mw; c2.font = `800 ${tam}px Orbitron, sans-serif`; }
  c2.textAlign = 'center'; c2.textBaseline = 'middle';
  c2.shadowColor = d.paleta.c1; c2.shadowBlur = tam * 0.5; c2.fillStyle = alfa(d.paleta.c1, 0.5); c2.fillText(nome, tx, ty); c2.shadowBlur = 0;
  c2.lineJoin = 'round'; c2.lineWidth = tam * 0.14; c2.strokeStyle = '#0a0c22'; c2.strokeText(nome, tx, ty + tam * 0.05);
  const g = c2.createLinearGradient(0, ty - tam / 2, 0, ty + tam / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, tom(d.paleta.c1, 0.6)); g.addColorStop(0.5, tom(d.paleta.c1, -0.5)); g.addColorStop(0.62, tom(d.paleta.c1, 0.75)); g.addColorStop(1, d.paleta.c1);
  c2.fillStyle = g; c2.fillText(nome, tx, ty); c2.lineWidth = 0.8; c2.strokeStyle = alfa('#ffffff', 0.8); c2.strokeText(nome, tx, ty);
  c2.font = `700 ${h * 0.042}px Orbitron, sans-serif`; c2.fillStyle = tom(d.paleta.c2, 0.3); c2.fillText('M Á Q U I N A   ' + String(d.n).padStart(2, '0').split('').join(' '), tx, ty + Math.max(tam, h * 0.12) * 0.72); c2.restore();
}

/** túnel mágico (campo em rolagem): vórtice com anéis que correm na cor da máquina */
function tunel(g: Pintor, campo: Campo, P: PalR06) {
  const c = g.c, q = [g.p(40, campo.camY), g.p(340, campo.camY), g.p(340, campo.camY + 760), g.p(40, campo.camY + 760)];
  const gr = c.createLinearGradient(0, q[0][1], 0, q[2][1]); gr.addColorStop(0, tom(P.luz, -0.82)); gr.addColorStop(0.5, '#04050e'); gr.addColorStop(1, tom(P.sling.plastico, -0.82));
  c.fillStyle = gr; c.beginPath(); q.forEach(p => c.lineTo(p[0], p[1])); c.closePath(); c.fill();
  c.save(); c.clip(); c.lineWidth = 2;
  for (let y = Math.floor(campo.camY / 60) * 60; y < campo.camY + 760; y += 60) { const [X, Y, K] = g.p(190, y); c.strokeStyle = alfa((Math.round(y / 60) % 2) ? P.luz : P.sling.plastico, 0.28); c.beginPath(); c.ellipse(X, Y, 150 * K, 24 * K, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
}

function criaSkin(id: string): Skin {
  const P = paletaDe(id), rec = RECEITAS[id];
  const ps = (f: (g: Pintor, p: any, P: PalR06) => void) => (g: Pintor, p: any) => f(g, p, P);
  return {
    tablado: (p, m) => { if (id === 'aurora' || !rec) { auroraTablado(p, m); return; } const o = rec(p.c, p, m, P); finaliza(p.c, p, m, P, { placa: o.placa, texto: o.texto }); },
    vidro: (L, w, h, d) => (id === 'aurora' ? auroraVidro(L, w, h, d) : vidroPremium(L, w, h, d, P)),
    pecas: {
      bumper: ps(pBumper), estilingue: ps(pEstilingue), poste: (g, p) => pPoste(g, p), posteCentral: (g, p) => pPosteCentral(g, p), alvoFixo: ps(pAlvo), bancoDeQueda: ps(pBanco), rampa: ps(pRampa),
      portal: ps(pSaucer), travaDeBola: ps(pSaucer), giro: ps(pGiro), chefe: ps(pChefe), tijolo: ps(pTijolo), rodaDeVinil: ps(pVinil), pasDeMoinho: ps(pPas), bocaQueEngole: ps(pBoca),
    },
    luzes: { bumper: null },
    paredes: (g, s) => paredes(g, s, P),
    palheta: P.palheta,
    antesPecas: (g, J) => antesPecas(g, J, P, (gg, JJ) => efeitoContinuo(gg, JJ, P)),
    tunel: (g, campo) => tunel(g, campo, P),
    moldura: true,
  };
}
for (const id of Object.keys(PALETAS)) SKINS[id] = criaSkin(id);
