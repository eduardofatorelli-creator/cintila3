// Bancada de simulação: roda o robô jogador sobre o motor, sem tela, e devolve as métricas da seção 12.2.
import { DT } from '../src/core/physics';
import { semear } from '../src/core/vec';
import { Robo } from '../src/game/bot';
import { Game, ModoJogo } from '../src/game/rules';
import type { MachineDef } from '../src/machines/_schema';

export interface Metricas {
  drenos: number; laterais: number; pctLateral: number; paradas: number; nan: number; fugas: number; erros: number;
  tempoMedio: number; andar: number; partidas: number; pontosMedios: number; empurroes: number; magos: number; nucleos: number;
}
export function azarSemeado(s: number) { return () => { s = (s * 16807 + 12345) % 2147483647; return (s & 0xffffff) / 0x1000000; }; }

export function simula(def: MachineDef, segundos: number, semente = 7, modo: ModoJogo = 'normal', habilidade = 0.65): Metricas {
  semear(semente * 7919 + def.n);
  const azar = azarSemeado(semente * 31 + def.n);
  const m: Metricas = { drenos: 0, laterais: 0, pctLateral: 0, paradas: 0, nan: 0, fugas: 0, erros: 0, tempoMedio: 0, andar: 0, partidas: 0, pontosMedios: 0, empurroes: 0, magos: 0, nucleos: 0 };
  const tempos: number[] = []; let pontos = 0;
  let J = new Game(def, modo), R = new Robo(J, azar, habilidade);
  const fecha = () => { const s = J.stats; m.drenos += s.drenos; m.laterais += s.laterais; m.paradas += s.paradas; m.nan += s.nan; m.fugas += s.fugas; m.andar += s.andar; m.empurroes += s.empurroes; m.magos += s.magos; m.nucleos += s.nucleos; tempos.push(...s.tempos); pontos += J.pontos; m.partidas++; };
  const passos = Math.round(segundos / DT);
  for (let i = 0; i < passos; i++) {
    try { R.passo(DT); J.update(DT); } catch (e) { m.erros++; if (m.erros < 3) console.error(def.id, e); fecha(); J = new Game(def, modo); R = new Robo(J, azar, habilidade); continue; }
    if (J.estado === 'fim') { fecha(); J = new Game(def, modo); R = new Robo(J, azar, habilidade); }
  }
  fecha();
  m.pctLateral = m.drenos ? m.laterais / m.drenos * 100 : 0;
  m.tempoMedio = tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : segundos;
  m.pontosMedios = pontos / m.partidas;
  return m;
}
export const linha = (id: string, m: Metricas) => `${id.padEnd(12)} drenos ${String(m.drenos).padStart(3)} lateral ${m.pctLateral.toFixed(1).padStart(5)}% parada ${m.paradas} nan ${m.nan} fuga ${m.fugas} erro ${m.erros} bola ${m.tempoMedio.toFixed(0).padStart(3)}s andar ${m.andar} mago ${m.magos} núcleos ${m.nucleos} empurrões ${m.empurroes} pts ${(m.pontosMedios / 1e6).toFixed(2)}M`;
