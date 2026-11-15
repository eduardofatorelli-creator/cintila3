// Seção 12.2: robô jogador, 5 minutos simulados por máquina, métricas de dreno.
// O dreno lateral é cobrado no total das 30 máquinas (entre 4% e 8%): com ~15 drenos por máquina,
// a porcentagem de uma máquina sozinha é ruído; ela é impressa, mas não reprova.
import { describe, expect, it } from 'vitest';
import { MAQUINAS } from '../src/machines';
import { Metricas, linha, simula } from './bot';

const todas: Metricas[] = [];
describe('métricas de dreno (12.2)', () => {
  for (const def of MAQUINAS) {
    it(`${def.n} ${def.nome}`, () => {
      const m = simula(def, 300, 7); todas.push(m);
      console.log(linha(def.id, m));
      expect(m.erros, 'erros').toBe(0);
      expect(m.nan, 'NaN').toBe(0);
      expect(m.fugas, 'bola fora da mesa').toBe(0);
      expect(m.paradas, 'bola parada').toBe(0);
      expect(m.tempoMedio, 'tempo médio de bola').toBeGreaterThan(20);
      expect(m.andar, 'entrou no andar de cima').toBeGreaterThan(0);
    }, 120000);
  }
  it('dreno lateral entre 4% e 8% do total de drenos', () => {
    const d = todas.reduce((s, m) => s + m.drenos, 0), l = todas.reduce((s, m) => s + m.laterais, 0), pct = l / d * 100;
    console.log(`DRENO LATERAL TOTAL: ${l} de ${d} = ${pct.toFixed(1)}%`);
    expect(todas.length).toBe(MAQUINAS.length);
    expect(pct).toBeGreaterThanOrEqual(4); expect(pct).toBeLessThanOrEqual(8);
  });
});
