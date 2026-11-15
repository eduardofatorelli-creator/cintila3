// O andar de cima: um segundo campo inteiro que desce sobre a mesa. Quatro tipos de fase.
import { Bola, G, seg } from '../core/physics';
import { entre, rng } from '../core/vec';
import type { TipoAndar } from '../machines/_schema';
import * as P from './elements';
import { SubFase, campoSelado } from './arena';
import type { Game } from './rules';

/** Tempos da transição obrigatória de 1,6 s (seção 6.2). O desenho lê estes marcos. */
export const MARCOS = { congela: 0.2, desce: 0.8, camera: 1.2, cospe: 1.2, fim: 1.6, volta: 1.1 };

export function criaAndar(J: Game, tipo: TipoAndar): SubFase {
  const a = J.def.andar, dur = { bonus: 25, premium: 40, chefao: 45, tunel: 30 }[tipo];
  const rot = { bonus: 'FASE BÔNUS', premium: 'ETAPA PREMIUM', chefao: 'MODO CHEFÃO', tunel: 'TÚNEL MÁGICO' }[tipo];
  const s = new SubFase(J, tipo, rot + ' · ' + a.nome.toUpperCase(), dur, 'andar');
  const C = s.campo;
  const alvo = (x: number, y: number, r = 11, vidas = 1) => { const t = C.add(new P.Tijolo(J, C, x, y, r)); t.vidas = vidas; s.alvos.push(t); return t; };

  if (tipo === 'tunel') return tunel(J, s);
  campoSelado(s, { pivos: [140, 240], comp: 46, aberto: true, g: 0.88 });

  if (tipo === 'bonus') {
    s.multiplicador = 5; s.dica = 'TUDO VALE 5X · SEM RISCO';
    // sem risco: nesta fase o vão entre as palhetas devolve a bola
    C.parede([[20, 752], [360, 752]], 0.3, { cor: J.cores.c1, tipo: 'piso', dono: { bateu(b: Bola) { b.vy = -entre(760, 880); b.vx += entre(-80, 80); } } });
    s.aberto = false;
    for (let i = 0; i < 9; i++) alvo(64 + (i % 5) * 63 + (i > 4 ? 31 : 0), i > 4 ? 250 : 170, 11);
    C.add(new P.Bumper(J, C, 120, 360, 15, 0)); C.add(new P.Bumper(J, C, 260, 360, 15, 2)); C.add(new P.Bumper(J, C, 190, 120, 14, 1));
    const volta: number[] = s.alvos.map(() => 0);
    s.tick = dt => s.alvos.forEach((t, i) => { if (!t.vivo) { volta[i] += dt; if (volta[i] > 2.5) { volta[i] = 0; t.c.off = false; t.vidas = 1; } } });
    s.aoEv = (t, b) => { if (t === 'tijolo') { J.pontua(2000, b, 'sub'); J.som('tijolo'); s.n++; if (b) J.fx('faisca', b.x, b.y, J.cores.c1, 8); } };
    s.venceu = false;
  } else if (tipo === 'premium') {
    const p = a.premium || 'muralha';
    if (p === 'muralha') { for (let l = 0; l < 2; l++) for (let i = 0; i < 6; i++) alvo(70 + i * 48, 140 + l * 34, 13); s.dica = 'LIMPE A MURALHA'; }
    else if (p === 'criaturas') { for (let i = 0; i < 6; i++) { const t = alvo(70 + i * 50, 150 + (i % 2) * 90, 11); t.vx = entre(40, 80) * (i % 2 ? 1 : -1); t.vy = entre(15, 45); t.lim = [44, 336, 110, 400]; } s.dica = 'CAPTURE AS CRIATURAS'; }
    else { for (let i = 0; i < 7; i++) alvo(190 + Math.cos(Math.PI + i * Math.PI / 6) * 140, 300 + Math.sin(Math.PI + i * Math.PI / 6) * 170, 11); s.dica = 'APAGUE OS HOLOFOTES'; }
    C.add(new P.Bumper(J, C, 190, 330, 15, 1));
    s.meta = s.alvos.length;
    s.aoEv = (t, b) => {
      if (t !== 'tijolo') return;
      J.pontua(8000, b, 'sub'); J.som('tijolo'); if (b) J.fx('faisca', b.x, b.y, J.cores.c1, 10);
      s.n = s.alvos.filter(x => !x.vivo).length; if (s.n >= s.meta) s.vence();
    };
  } else {
    // modo chefão: o chefe sobe junto e ataca mexendo na mesa
    const ch = C.add(new P.Chefe(J, C, 190, 230, J.def.chefe.forma, 'vaga')); ch.vida = 6 + Math.min(4, J.ciclosChefe); s.chefao = ch; s.meta = ch.vida;
    const pas = C.add(new P.PasDeMoinho(J, C, 190, 400, 34, 2)); pas.variavel = false; pas.w = 0;
    s.dica = 'DERROTE ' + J.def.chefe.nome.toUpperCase();
    let fase = 0, relogio = 0; s.ataque = 'ímã';
    s.tick = dt => {
      relogio += dt; if (relogio > 6) { relogio = 0; fase = (fase + 1) % 3; s.ataque = ['ímã', 'pás', 'chão inclinado'][fase]; J.anuncia('ataque', s.ataque.toUpperCase()); J.som('aviso'); }
      C.gx = fase === 2 ? Math.sin(s.t * 1.1) * 300 : 0;
      pas.w = fase === 1 ? 4.2 : 0.6;
      if (fase === 0) for (const b of C.bolas) { const dx = ch.x - b.x, dy = ch.y + 60 - b.y, d = Math.hypot(dx, dy) || 1; if (d < 170) { b.vx += dx / d * 420 * dt; b.vy += dy / d * 420 * dt; } }
    };
    s.aoEv = (t, b) => {
      if (t !== 'chefe') return;
      ch.vida--; s.n = s.meta - ch.vida; J.pontua(30000, b, 'sub'); J.som('chefe'); J.tremor = 0.6; J.fx('faisca', ch.x, ch.y, J.cores.c1, 14); J.anuncia('chefeDano', J.def.chefe.nome, { vida: ch.vida });
      if (ch.vida <= 0) { J.fx('explosao', ch.x, ch.y, J.cores.c1, 60); J.som('explosao'); ch.c.off = true; s.vence(); }
    };
  }
  return s;
}

/** Túnel mágico: poço em rolagem vertical. A bola sobe sozinha e o jogador guia com as palhetas. */
function tunel(J: Game, s: SubFase): SubFase {
  const C = s.campo, cor = J.cores.c2, ALT = 2200;
  C.alt = ALT; C.g = -0.3 * G; C.arrasto = 0.9; C.vmax = 620; s.rolagem = true; s.dica = 'GUIE A BOLA ATÉ O TOPO';
  C.parede([[40, ALT + 40], [40, -40]], 0.5, { cor }); C.parede([[340, -40], [340, ALT + 40]], 0.5, { cor });
  C.parede([[40, ALT - 20], [340, ALT - 20]], 0.6, { cor });
  for (let y = ALT - 260, i = 0; y > 200; y -= 190, i++) {
    const k = i % 4;
    if (k === 0) { const vao = entre(90, 250); C.segs.push(seg(40, y, vao - 38, y, 0.5, { cor }), seg(vao + 38, y, 340, y, 0.5, { cor })); }
    else if (k === 1) { for (let j = 0; j < 4; j++) C.add(new P.Poste(J, C, 78 + j * 75 + (i % 2) * 20, y + (j % 2) * 40, 8)); }
    else if (k === 2) { const p = C.add(new P.PasDeMoinho(J, C, rng() < 0.5 ? 130 : 250, y, 44, 2)); p.variavel = false; p.w = 2.2; }
    else { const t = C.add(new P.PortaMovel(J, C, 0, 0, 0, 0, [80, y, 300, y])); t.velT = 110; t.meiaL = 30; }
    const m = C.add(new P.Tijolo(J, C, entre(80, 300), y - 95, 9, 'tijolo')); s.alvos.push(m);
  }
  s.entrada = [190, ALT - 60, 0, -300]; s.meta = 100;
  s.tick = dt => {
    const b = C.bolas[0]; if (!b) return;
    const e = J.botE || J.toqueE, d = J.botD || J.toqueD;
    b.vx += ((d ? 1 : 0) - (e ? 1 : 0)) * 1500 * dt;
    C.camY += (b.y - 470 - C.camY) * Math.min(1, dt * 6); if (C.camY > ALT - 760) C.camY = ALT - 760; if (C.camY < 0) C.camY = 0;
    s.n = Math.round((1 - b.y / ALT) * 100);
    if (b.y < 90) { J.fx('explosao', b.x, b.y, J.cores.c1, 40); s.vence(); }
  };
  s.aoEv = (t, b) => { if (t === 'tijolo') { J.pontua(5000, b, 'sub'); J.som('tijolo'); } };
  C.camY = ALT - 760;
  return s;
}
