import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'invasao', n: 5, nome: 'Invasão', lema: 'A nave-mãe salta a cada golpe. Não a deixe fugir',
  paleta: { c1: '#5cff9d', c2: '#9d7bff', c3: '#ff4d6d', fundo: ['#02060f', '#07182e', '#040a18'] },
  gravidade: 1.02, bpm: 132, escala: [0, 1, 3, 5, 7, 8, 10], raiz: 40,
  layout: disposicao('D'),
  arte(c, t) {
    t.fundo(); t.semente(51).estrelas(200); t.grade(38, t.p.c1, 0.16, 380); t.circuito(18, t.p.c2, 0.35);
    t.aneis(190, 262, 100, 5, t.p.c1, 0.45, 1.5); t.raios(190, 262, 220, 3, t.p.c1, 0.14, 0.5);
    for (let i = 0; i < 5; i++) t.poligono(70 + i * 60, 480 + (i % 2) * 26, 12, 3, t.p.c3, 0.5, Math.PI / 2);
    t.disco(320, 130, 26, '#17325c', 0.9); t.aneis(320, 130, 40, 1, t.p.c2, 0.7, 3); t.texto('INVASÃO', 190, 548, 26, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(7).estrelas(180); t.disco(60, 210, 120, '#0d2a52'); t.brilho(60, 210, 170, t.p.c2, 0.4);
    t.camada(1); t.poligono(200, 80, 90, 3, '#0e1a30', 1, Math.PI / 2); t.disco(200, 70, 60, '#16233f'); t.aneis(200, 70, 60, 3, t.p.c1, 0.8, 2); for (let i = 0; i < 7; i++) t.disco(140 + i * 20, 74, 4, i % 2 ? t.p.c3 : t.p.c1);
    t.camada(2); t.raios(200, 80, 240, 5, t.p.c1, 0.2, 0.25); t.semente(3).predios(228, 44, '#050a14', t.p.c1); t.texto('INVASÃO', 200, 170, 40, t.p.c1, 0.95);
  },
  chefe: { nome: 'Nave-Mãe', vidas: [3, 4, 5], modo: 'salta', forma: { tipo: 'olho', pontas: 8, olhos: 1, cor: '#5cff9d' } },
  assinatura: { tipo: 'salta', nome: 'Salto Dimensional', dica: 'A Nave-Mãe muda de lugar a cada golpe: persiga-a' },
  andar: { nome: 'Convés', tipo: 'chefao', variacao: 'bonus', gatilho: 'bater3' },
  missoes: ['Decolagem', 'Barragem de plasma', 'Órbita de combate', 'Antenas', 'Fogo na nave'],
  mago: { nome: 'Contra-Ataque', duracao: 48, regra: { tipo: 'golpes', meta: 24 } },
  vozes: { inicio: 'Eles chegaram. Defenda a cidade.', chefe: 'A nave-mãe saltou.', mago: 'Contra-ataque! Fogo total!', fim: 'A frota recuou. Vão voltar.' },
};
export default m;
