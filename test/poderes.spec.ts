// R06.1 · Os selos do Relâmpago leem os seis poderes sorteados de um dado estruturado da assinatura,
// não do texto do anúncio: mudar (ou apagar) o texto não muda os selos. O sorteio em si não foi tocado.
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/rules';
import { porId } from '../src/machines';
import { poderesDe } from '../src/visual/r06/assinaturas';

describe('seis poderes do Relâmpago', () => {
  it('expõe exatamente os seis poderes sorteados, iguais aos anunciados no início', () => {
    for (const seed of [1, 7, 42, 99, 1234]) {
      const J = new Game(porId('relampago'), 'normal', 0, seed), pod = poderesDe(J);
      expect(pod).toHaveLength(6); expect(new Set(pod).size).toBe(6);
      const an = J.anuncios.find(a => a.tipo === 'assinaturaTotal');
      expect(an?.texto).toBe('SEIS PODERES: ' + pod.join(' · ').toUpperCase());
    }
  });
  it('os selos não dependem do texto do anúncio', () => {
    const J = new Game(porId('relampago'), 'normal', 0, 5), antes = poderesDe(J);
    for (const a of J.anuncios) a.texto = 'texto qualquer'; J.anuncios.length = 0;
    expect(poderesDe(J)).toEqual(antes);
  });
  it('a lista é só leitura e as outras máquinas não têm poderes', () => {
    const J = new Game(porId('relampago'), 'normal', 0, 3); expect(Object.isFrozen(J.sigs[0].poderes)).toBe(true);
    expect(poderesDe(new Game(porId('aurora'), 'normal', 0, 3))).toEqual([]);
  });
});
