// Seção 12.2: robô jogador, 5 minutos simulados por máquina, métricas de dreno.
import { describe, expect, it } from 'vitest';
import { MAQUINAS } from '../src/machines';
import { linha, simula } from './bot';

describe('métricas de dreno (12.2)', () => {
  for (const def of MAQUINAS) {
    it(`${def.n} ${def.nome}`, () => {
      const m = simula(def, 300, 7);
      console.log(linha(def.id, m));
      expect(m.erros, 'erros').toBe(0);
      expect(m.nan, 'NaN').toBe(0);
      expect(m.paradas, 'bola parada').toBe(0);
      expect(m.pctLateral, 'dreno lateral %').toBeLessThan(8);
      expect(m.tempoMedio, 'tempo médio de bola').toBeGreaterThan(20);
      expect(m.andar, 'entrou no andar de cima').toBeGreaterThan(0);
    }, 120000);
  }
});
