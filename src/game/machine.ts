// Monta a mesa principal a partir dos dados de uma máquina.
import { Campo, G, Palheta } from '../core/physics';
import { contorno, parteDeBaixo, PIVO_D, PIVO_E } from '../core/geometry';
import type { MachineDef } from '../machines/_schema';
import * as P from './elements';
import type { Jogo } from './tipos';

export interface Mesa {
  campo: Campo; pE: Palheta; pD: Palheta; poste: P.PosteCentral; resgE: P.Resgate; resgD: P.Resgate;
  portal: P.Portal; trava: P.TravaDeBola; rampas: P.Rampa[]; orbitas: P.Orbita[]; chefe: P.Chefe; faixas: P.Faixas;
  bumpers: P.Bumper[]; alvos: P.AlvoFixo[]; banco: P.BancoDeQueda; muros: P.Poste[]; giro: P.Giro; retornos: P.Sensor[];
}

/** Fábricas das peças avulsas que um layout pode pedir em `extras`. */
export const PECAS: Record<string, (J: Jogo, C: Campo, d: any) => any> = {
  bumper: (J, C, d) => new P.Bumper(J, C, d.x, d.y, d.r),
  alvoFixo: (J, C, d) => new P.AlvoFixo(J, C, d.x, d.y, d.ang || 0, d.vidas || 1),
  bancoDeQueda: (J, C, d) => new P.BancoDeQueda(J, C, d.x, d.y, d.dx || 14, d.dy || 0, d.n || 3),
  poste: (J, C, d) => new P.Poste(J, C, d.x, d.y, d.r || 5),
  imã: (J, C, d) => new P.Ima(J, C, d.x, d.y),
  alvoGiratorio: (J, C, d) => new P.AlvoGiratorio(J, C, d.x, d.y, d.raio || 40, d.n || 3, d.vel || 1.2, d.vidas || 1),
  esteira: (J, C, d) => new P.Esteira(J, C, d.x, d.y, d.w || 80, d.h || 30, d.ax || 0, d.ay || -600),
  elevador: (J, C, d) => new P.Elevador(J, C, d.x, d.y, d.niveis),
  canhao: (J, C, d) => new P.Canhao(J, C, d.x, d.y),
  bolaCativa: (J, C, d) => new P.BolaCativa(J, C, d.x, d.y, d.dx || 0, d.dy || -1, d.curso || 40),
  rodaGigante: (J, C, d) => new P.RodaGigante(J, C, d.x, d.y, d.R || 40, d.n || 5),
  tunelMagico: (J, C, d) => new P.TunelMagico(J, C, d.x, d.y),
  rodaDeVinil: (J, C, d) => new P.RodaDeVinil(J, C, d.x, d.y, d.R || 44),
  portaMovel: (J, C, d) => { const p = new P.PortaMovel(J, C, d.ax, d.ay, d.bx, d.by, d.trilho); p.ciclo = d.ciclo || 0; return p; },
  bracoRobotico: (J, C, d) => new P.BracoRobotico(J, C, d.x, d.y),
  pocoDeAreia: (J, C, d) => new P.PocoDeAreia(J, C, d.x, d.y),
  bocaQueEngole: (J, C, d) => new P.BocaQueEngole(J, C, d.x, d.y, d.canos),
  pasDeMoinho: (J, C, d) => new P.PasDeMoinho(J, C, d.x, d.y, d.R || 38, d.n || 3),
  flor: (J, C, d) => new P.Flor(J, C, d.x, d.y, d.fase || 0),
  giro: (J, C, d) => new P.Giro(J, C, d.x, d.y),
};

export function montaMesa(J: Jogo, def: MachineDef): Mesa {
  const C = new Campo(); C.g = G * def.gravidade; C.nome = 'mesa';
  const cor = def.paleta.c2, L = def.layout;
  contorno(C, cor);
  const baixo = parteDeBaixo(C, cor);
  const pE = new Palheta(PIVO_E[0], PIVO_E[1], 1), pD = new Palheta(PIVO_D[0], PIVO_D[1], -1);
  C.pas.push(pE, pD);
  const add = <T extends { y: number; tipo: string }>(p: T) => C.add(p as any) as T;
  add(new P.Estilingue(J, C, baixo.estE, 1)); add(new P.Estilingue(J, C, baixo.estD, -1));
  const rampas = [add(new P.Rampa(J, C, 1, cor)), add(new P.Rampa(J, C, -1, cor))];
  const orbitas = [add(new P.Orbita(J, C, 1)), add(new P.Orbita(J, C, -1))];
  const trava = add(new P.TravaDeBola(J, C, 70, 422)), portal = add(new P.Portal(J, C, 310, 422));
  const faixas = add(new P.Faixas(J, C, cor));
  const retornos = [add(new P.CanaletaDeRetorno(J, C, 1)), add(new P.CanaletaDeRetorno(J, C, -1))];
  add(new P.CanaletaExterna(J, C, 1)); add(new P.CanaletaExterna(J, C, -1));
  const resgE = add(new P.Resgate(J, C, 1)), resgD = add(new P.Resgate(J, C, -1));
  const poste = add(new P.PosteCentral(J, C));
  const muros = [add(new P.Poste(J, C, 54, 630, 5.7)), add(new P.Poste(J, C, 326, 630, 5.7))];
  const giro = add(new P.Giro(J, C, L.giro === 'dir' ? 343 : 37, 346));
  const bumpers = L.bumpers.map((b, i) => add(new P.Bumper(J, C, b[0], b[1], b[2] || 17, i)));
  const alvos = L.alvos.map(a => add(new P.AlvoFixo(J, C, a[0], a[1], a[2])));
  const banco = add(new P.BancoDeQueda(J, C, L.banco[0], L.banco[1], L.banco[2], L.banco[3]));
  const chefe = add(new P.Chefe(J, C, L.chefe[0], L.chefe[1], def.chefe.forma, def.chefe.modo));
  for (const e of L.extras || []) { const f = PECAS[e.t]; if (f) add(f(J, C, e)); }
  return { campo: C, pE, pD, poste, resgE, resgD, portal, trava, rampas, orbitas, chefe, faixas, bumpers, alvos, banco, muros, giro, retornos };
}
