// R06 · Consistência dos indicadores de missão: backbox e painel leem estadoMissao(J), que precisa refletir
// exatamente o estado do jogo (ativa, progresso, tempo, concluída, falha, próxima). A fila do painel de pontos
// mostra o valor do momento do evento e não acumula progressos velhos.
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/rules';
import { porId } from '../src/machines';
import { enfileiraDmd, estadoMissao, fotografa, type ItemDmd } from '../src/visual/estado';

const novo = () => { const J = new Game(porId('aurora'), 'normal', 0, 7); J.estado = 'jogo'; J.anuncios.length = 0; return J; };
const inicia = (J: Game) => (J as any).iniciaMissao(null) as boolean;
const progride = (J: Game) => (J as any).missao((J.missoes[J.missaoAtiva] as any).tipo);

describe('indicadores de missão (fonte única)', () => {
  it('missão ativa, progresso e tempo batem com o jogo', () => {
    const J = novo(); expect(estadoMissao(J).ativa).toBe(false); expect(estadoMissao(J).proxima).toBe(J.missoes[0].nome);
    expect(inicia(J)).toBe(true);
    let E = estadoMissao(J), m = J.missoes[J.missaoAtiva];
    expect(E).toMatchObject({ ativa: true, nome: m.nome, n: 0, meta: m.meta, tempo: Math.ceil(J.missaoT), proxima: null });
    progride(J); E = estadoMissao(J); expect(E.n).toBe(1); expect(E.n).toBe(J.missoes[J.missaoAtiva].n);
    J.missaoT = 30.4; expect(estadoMissao(J).tempo).toBe(31); J.missaoT = 9.2; expect(estadoMissao(J).tempo).toBe(10);
  });
  it('concluída: some da ativa, conta como feita e aponta a próxima', () => {
    const J = novo(); inicia(J); const i = J.missaoAtiva, meta = J.missoes[i].meta;
    for (let k = 0; k < meta; k++) progride(J);
    const E = estadoMissao(J); expect(E.ativa).toBe(false); expect(E.feitas).toBe(1); expect(J.missoes[i].feita).toBe(true); expect(E.proxima).toBe(J.missoes.find(m => !m.feita)!.nome);
    expect(J.anuncios.some(a => a.tipo === 'missaoOk')).toBe(true);
  });
  it('fracassada por tempo: some da ativa e não conta como feita', () => {
    const J = novo(); inicia(J); J.missaoT = 0.01; J.update(1 / 60);
    const E = estadoMissao(J); expect(E.ativa).toBe(false); expect(E.feitas).toBe(0); expect(J.anuncios.some(a => a.tipo === 'missaoFalha')).toBe(true);
  });
  it('a animação do painel de pontos guarda o valor do momento do evento', () => {
    const J = novo(); inicia(J); J.anuncios.length = 0; progride(J);
    const a1 = fotografa(J.anuncios.find(a => a.tipo === 'missaoAvanca')!); progride(J);
    expect(a1.d.n).toBe(1); expect(J.missoes[J.missaoAtiva].n).toBe(2);
  });
  it('a fila substitui progressos antigos e descarta pendências quando a missão termina', () => {
    const it2 = (tipo: string, texto = 'X', n = 0): ItemDmd => ({ a: { tipo, texto, d: { n } }, t: 0, dur: 1 });
    let f: ItemDmd[] = [];
    f = enfileiraDmd(f, it2('missao')); f = enfileiraDmd(f, it2('missaoAvanca', 'X', 1)); f = enfileiraDmd(f, it2('missaoAvanca', 'X', 2));
    expect(f.filter(x => x.a.tipo === 'missaoAvanca').map(x => x.a.d.n)).toEqual([2]);
    f = enfileiraDmd(f, it2('missaoOk')); expect(f.map(x => x.a.tipo)).toEqual(['missaoOk']);
    f = enfileiraDmd(f, it2('fim')); expect(f.map(x => x.a.tipo)).toEqual(['fim']);
  });
});
