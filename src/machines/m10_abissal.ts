import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'abissal', n: 10, nome: 'Abissal', lema: 'A boca engole a bola e a devolve por um de três canos',
  paleta: { c1: '#4dfff0', c2: '#3a7bff', c3: '#ff7ad9', fundo: ['#010814', '#04204a', '#020c1e'] },
  gravidade: 0.92, bpm: 92, escala: [0, 2, 3, 5, 7, 8, 10], raiz: 38,
  layout: disposicao('B'),
  arte(c, t) {
    t.fundo(); t.semente(101).bolhas(70, t.p.c1, 0.35, 8); t.ondas(100, 14, 6, t.p.c2, 0.3, 4, 26);
    t.tentaculos(190, 760, 7, 260, '#0a2f66', 0.6); t.brilho(190, 456, 150, t.p.c1, 0.25);
    t.aneis(190, 456, 60, 4, t.p.c1, 0.45); t.aneis(190, 296, 76, 3, t.p.c3, 0.4);
    for (let i = 0; i < 9; i++) t.brilho(t.rr(40, 340), t.rr(140, 680), 10, t.p.c3, 0.55);
    t.montanhas(720, 50, '#06173a', 0.9, 8); t.texto('ABISSAL', 190, 548, 26, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.raios(200, -20, 420, 14, t.p.c1, 0.12, 0.3); t.semente(4).bolhas(40, t.p.c1, 0.4, 7);
    t.camada(1); t.semente(6).tentaculos(200, 240, 8, 210, '#0d3a7a', 0.95); t.disco(200, 150, 60, '#0d3a7a'); t.olho(200, 140, 30, t.p.c3, 1);
    t.camada(2); t.montanhas(215, 40, '#020a1a', 1, 9); t.semente(9).bolhas(26, '#ffffff', 0.5, 5); t.texto('ABISSAL', 200, 38, 40, t.p.c1, 0.95);
  },
  chefe: { nome: 'Kraken', vidas: [3, 4, 5], modo: 'orbita', forma: { tipo: 'tentaculos', pontas: 8, olhos: 2, cor: '#4a8dff' } },
  assinatura: { tipo: 'boca', nome: 'A Boca', dica: 'A boca engole a bola e a devolve por um de 3 canos' },
  andar: { nome: 'Plataforma', tipo: 'chefao', variacao: 'premium', gatilho: 'bater3', premium: 'criaturas' },
  missoes: ['Correntes', 'Cardume elétrico', 'Volta ao recife', 'Pérolas', 'Fira o kraken'],
  mago: { nome: 'Maré Negra', duracao: 48, regra: { tipo: 'golpes', meta: 26 } },
  vozes: { inicio: 'Você desceu ao fundo. Cuidado com a boca.', chefe: 'O kraken acordou.', mago: 'Maré negra! Nade!', fim: 'O abismo engoliu tudo.' },
};
export default m;
