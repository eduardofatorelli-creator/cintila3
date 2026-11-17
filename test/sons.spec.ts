// R06 · Sincronia audiovisual: um único acontecimento não pode disparar o mesmo som duas vezes,
// e os eventos especiais (multibola, jackpot, chefe derrubado, mago) precisam ter som. Não ouve nada:
// só confere as chamadas à saída de som do jogo. A validação auditiva continua sendo humana.
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/rules';
import { MAQUINAS } from '../src/machines';

function grava(J: Game) { const sons: string[] = []; J.saidaSom = n => sons.push(n); return sons; }
const repetidos = (s: string[]) => s.filter((x, i) => s.indexOf(x) !== i);

describe('sons por acontecimento', () => {
  for (const d of [MAQUINAS[0], MAQUINAS[9], MAQUINAS[23], MAQUINAS[29]]) it(d.nome + ': sem som duplicado num mesmo evento', () => {
    const J = new Game(d, 'normal', 0, 3); J.estado = 'jogo'; const b = J.mesa.bolas[0] || J.novaNaCanaleta(); b.x = 190; b.y = 400;
    const casos: [string, any][] = [['bumper', J.m.bumpers[0]], ['alvo', J.m.alvos[0]], ['queda', J.m.banco], ['orbita', J.m.orbitas[0]], ['rampa', J.m.rampas[0]], ['giro', J.m.giro]];
    for (const [tp, p] of casos) { const s = grava(J); J.ev(tp, b, p); expect(repetidos(s), tp + ' ' + s.join(',')).toEqual([]); }
    // chefe até cair (inclui o núcleo destruído)
    for (let k = 0; k < 12 && !J.m.chefe.c.off; k++) { J.m.chefe.imune = 0; const s = grava(J); J.ev('chefe', b, J.m.chefe); expect(repetidos(s), 'chefe ' + s.join(',')).toEqual([]); }
  });
  it('eventos especiais têm som', () => {
    const J = new Game(MAQUINAS[0], 'normal', 0, 5); J.estado = 'jogo'; const b = J.mesa.bolas[0] || J.novaNaCanaleta();
    let s = grava(J); J.iniciaMago(); expect(s.length).toBeGreaterThan(0);
    const J2 = new Game(MAQUINAS[0], 'normal', 0, 6); J2.estado = 'jogo'; const b2 = J2.mesa.bolas[0] || J2.novaNaCanaleta();
    s = grava(J2); (J2 as any).trava?.(b2); (J2 as any).trava?.(b2); expect(J2.multibola, 'duas travas abrem multibola').toBe(true); expect(s).toContain('jackpot');
    void b;
  });
});
