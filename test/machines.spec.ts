// Seção 12.3: varredura das 30 máquinas. Carrega, joga 90 s, força andar de cima, subfases e modo mago.
import { describe, expect, it } from 'vitest';
import { DT } from '../src/core/physics';
import { semear } from '../src/core/vec';
import { criaArena } from '../src/game/arena';
import { Robo } from '../src/game/bot';
import { Game } from '../src/game/rules';
import { MAQUINAS } from '../src/machines';
import type { TipoAndar } from '../src/machines/_schema';
import { azarSemeado } from './bot';

function banca(J: Game, R: Robo) {
  let sumiu = 0;
  const passo = () => { R.passo(DT); J.update(DT); if (J.estado === 'jogo' && !J.sub && !J.trans && J.mesa.bolas.length + J.fila === 0) sumiu++; if (J.estado === 'fim') throw new Error('fim inesperado'); };
  const roda = (seg: number) => { for (let i = 0; i < seg / DT; i++) passo(); };
  const ate = (cond: () => boolean, max: number) => { for (let i = 0; i < max / DT; i++) { if (cond()) return true; passo(); } return cond(); };
  return { roda, ate, sumiu: () => sumiu };
}
function nova(n: number, semente = 3) { const def = MAQUINAS[n]; semear(1000 + n * 13 + semente); const J = new Game(def); J.bolasTotal = 999; const R = new Robo(J, azarSemeado(77 + n + semente), 0.9); return { def, J, R, ...banca(J, R) }; }
const bolaLivre = (J: Game) => J.mesa.bolas.find(b => !b.preso && !b.trilho) || J.mesa.bolas[0] || J.novaNaCanaleta();

describe('varredura das máquinas (12.3)', () => {
  it('há 30 máquinas, numeradas de 1 a 30, com dados completos', () => {
    expect(MAQUINAS.length).toBe(30);
    MAQUINAS.forEach((m, i) => { expect(m.n).toBe(i + 1); expect(m.missoes.length).toBe(5); expect(m.gravidade).toBeGreaterThanOrEqual(0.86); expect(m.gravidade).toBeLessThanOrEqual(1.1); expect(Object.values(m.vozes).every(v => v.length > 3)).toBe(true); });
    expect(new Set(MAQUINAS.map(m => m.id)).size).toBe(30);
  });
  for (let n = 0; n < MAQUINAS.length; n++) {
    it(`${n + 1} ${MAQUINAS[n].nome}`, () => {
      const { def, J, roda, ate, sumiu } = nova(n);
      roda(90);
      ate(() => !J.sub && !J.trans && !J.mago && J.estado === 'jogo' && !J.escolha, 120);
      // andar de cima: o tipo padrão e a variação
      for (const tipo of [def.andar.tipo, def.andar.variacao] as TipoAndar[]) {
        ate(() => !J.sub && !J.trans && J.estado === 'jogo', 60);
        J.sobe(bolaLivre(J), J.m.portal, tipo);
        expect(J.sub, 'entrou no andar ' + tipo).toBeTruthy();
        expect(ate(() => !J.sub && !J.trans && J.campo === J.mesa, 70), 'voltou do andar ' + tipo).toBe(true);
      }
      // subfases em campo separado
      for (const tipo of ['nucleo', 'enxame', 'muralha', 'camara']) {
        ate(() => !J.sub && !J.trans && J.estado === 'jogo', 60);
        J.iniciaTrans(criaArena(J, tipo), bolaLivre(J), J.m.portal);
        expect(J.sub, 'entrou na subfase ' + tipo).toBeTruthy();
        expect(ate(() => !J.sub && !J.trans && J.campo === J.mesa, 60), 'voltou da subfase ' + tipo).toBe(true);
      }
      // o chefe morre e renasce
      ate(() => !J.sub && !J.trans && J.estado === 'jogo' && !J.m.chefe.c.off, 60);
      const antes = J.stats.nucleos; J.m.chefe.vida = 1; J.m.chefe.protegido = false; J.ev('chefe', bolaLivre(J));
      expect(J.stats.nucleos).toBe(antes + 1); expect(J.m.chefe.c.off).toBe(true);
      expect(ate(() => !J.m.chefe.c.off && J.m.chefe.vida > 0 && !J.sub && !J.trans, 90), 'chefe renasceu').toBe(true);
      // o modo mago começa e termina
      ate(() => !J.sub && !J.trans && J.estado === 'jogo' && !J.mago, 90);
      J.iniciaMago(); expect(J.mago).toBe(true);
      expect(ate(() => !J.mago, def.mago.duracao + 5), 'mago terminou').toBe(true);
      roda(10);
      expect(J.stats.nan, 'NaN').toBe(0); expect(J.stats.fugas, 'bola fora da mesa').toBe(0); expect(sumiu(), 'bola sumiu').toBe(0);
      expect(J.pontos).toBeGreaterThan(0);
    }, 120000);
  }
  it('o andar de cima entra e sai 50 vezes sem falha', () => {
    const tipos: TipoAndar[] = ['bonus', 'premium', 'chefao', 'tunel'];
    for (let i = 0; i < 50; i++) {
      const { J, ate, sumiu } = nova(i % 30, i);
      ate(() => J.estado === 'jogo' && J.mesa.bolas.some(b => b.y < 400), 20);
      J.sobe(bolaLivre(J), J.m.portal, tipos[i % 4]);
      expect(J.trans?.dur).toBeCloseTo(1.6);
      expect(ate(() => J.campo === J.sub?.campo, 3), 'chegou ao andar ' + i).toBe(true);
      expect(J.campo.bolas.length).toBe(1);
      expect(ate(() => !J.sub && !J.trans, 70), 'voltou ' + i).toBe(true);
      ate(() => J.mesa.bolas.some(b => !b.preso), 3);
      expect(J.mesa.bolas.length + J.fila).toBeGreaterThan(0); expect(J.stats.nan).toBe(0); expect(sumiu()).toBe(0);
    }
  }, 240000);
});
