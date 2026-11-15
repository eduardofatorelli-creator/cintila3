// Correção 2: o miolo entre as palhetas tem que deixar a bola passar em qualquer nível de Palhetas Longas.
import { describe, expect, it } from 'vitest';
import { DT, novaBola } from '../src/core/physics';
import { Game } from '../src/game/rules';
import { MAQUINAS } from '../src/machines';

function tempoDeDreno(nivel: number, x: number, posteAbaixado: boolean): number {
  const J = new Game(MAQUINAS[0]); J.evol.palhetas = nivel; J.aplicaEvolucoes(); J.estado = 'jogo'; J.salva = 0;
  J.mesa.bolas.length = 0; J.mesa.bolas.push(novaBola(x, 700));
  if (posteAbaixado) { J.m.poste.baixo = 99; J.m.poste.c.off = true; }
  for (let i = 0; i < 10 / DT; i++) { J.update(DT); if (J.stats.drenos > 0) return i * DT; }
  return Infinity;
}
describe('palhetas e miolo', () => {
  it('o vão entre as pontas fica constante em 35,5 u em todos os níveis', () => {
    for (const n of [0, 1, 2]) {
      const J = new Game(MAQUINAS[0]); J.evol.palhetas = n; J.aplicaEvolucoes();
      expect(J.m.pE.comp).toBe(55 + 4 * n); expect(J.m.pD.tx - J.m.pE.tx).toBeCloseTo(35.5, 1);
    }
  });
  for (const x of [186, 190, 194]) it(`bola parada em x=${x}, y=700, nível máximo, drena em menos de 2 s`, () => {
    const t = tempoDeDreno(2, x, true); console.log(`dreno central x=${x}: ${t.toFixed(2)} s (poste abaixado) · ${tempoDeDreno(2, x, false).toFixed(2)} s (poste de pé, defende uma vez)`);
    expect(t).toBeLessThan(2);
  });
});
