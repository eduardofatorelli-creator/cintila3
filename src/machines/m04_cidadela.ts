import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'cidadela', n: 4, nome: 'Cidadela do Eclipse', lema: 'Derrube os quatro escudos e arrombe o portão',
  paleta: { c1: '#ffb347', c2: '#c0c7e0', c3: '#ff5a5f', fundo: ['#0d0a1a', '#2a1a33', '#150c1c'] },
  gravidade: 1.0, bpm: 96, escala: [0, 2, 3, 5, 7, 8, 11], raiz: 41,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(41).estrelas(70); t.lua(190, 150, 46, '#1a1020', 0); t.aneis(190, 150, 54, 1, t.p.c1, 0.9, 3); t.raios(190, 150, 170, 20, t.p.c1, 0.14, 0.3);
    t.torre(70, 330, 34, 120, '#241a30', 0.9); t.torre(310, 330, 34, 120, '#241a30', 0.9);
    t.xadrez(60, 520, 260, 180, 10, '#3a2c48', 0.4); t.poligono(190, 300, 62, 8, t.p.c2, 0.5, 0, 3);
    t.colunas(700, 6, 60, '#3a2c48', 0.6); t.listras(120, 420, 140, 6, 9, t.p.c3, t.p.c1, 0.4); t.texto('CIDADELA', 190, 548, 24, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(2).estrelas(110); t.disco(200, 86, 52, '#0a0612'); t.aneis(200, 86, 58, 1, t.p.c1, 1, 4); t.raios(200, 86, 260, 24, t.p.c1, 0.16, 0.3);
    t.camada(1); t.montanhas(200, 50, '#1c1426', 1, 5); for (const x of [90, 150, 200, 250, 310]) t.torre(x, 200, x === 200 ? 46 : 28, x === 200 ? 96 : 66, '#2b2038');
    t.camada(2); t.listras(0, 216, 400, 14, 24, '#150d1f', '#22172e', 1); t.poligono(200, 178, 20, 4, t.p.c3, 0.9, Math.PI / 4); t.texto('CIDADELA DO ECLIPSE', 200, 24, 22, t.p.c1, 0.95);
  },
  chefe: { nome: 'Portão', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'bloco', pontas: 5, olhos: 2, cor: '#8a6a4a' } },
  assinatura: { tipo: 'escudos', nome: 'Escudos Giratórios', dica: 'Quebre os 4 escudos que giram para ferir o Portão' },
  andar: { nome: 'Torre de Vigia', tipo: 'chefao', variacao: 'premium', gatilho: 'bater3', premium: 'muralha' },
  missoes: ['Escadas de cerco', 'Chuva de pedras', 'Ronda da muralha', 'Brasões', 'Aríete no portão'],
  mago: { nome: 'Eclipse Total', duracao: 48, regra: { tipo: 'golpes', meta: 24 } },
  vozes: { inicio: 'O cerco começou. Derrube os escudos.', chefe: 'O portão está exposto.', mago: 'Eclipse total! Ataquem!', fim: 'A cidadela resiste. Por hoje.' },
};
export default m;
