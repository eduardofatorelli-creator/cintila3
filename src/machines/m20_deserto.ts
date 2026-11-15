import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'deserto', n: 20, nome: 'Deserto de Sal', lema: 'A areia movediça suga a bola por três segundos e cospe',
  paleta: { c1: '#ffe9a8', c2: '#e0a34d', c3: '#59d8ff', fundo: ['#1c1206', '#5a3a14', '#2a1a08'] },
  gravidade: 1.03, bpm: 102, escala: [0, 1, 4, 5, 7, 8, 10], raiz: 43,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(201); t.lua(310, 120, 30, '#fff6d8', 0); t.raios(310, 120, 120, 16, t.p.c1, 0.14, 0.35);
    t.dunas(360, 9, '#a8732e', '#8a5a20', 0.7); t.espiral(190, 456, 60, 5, '#5a3a14', 4, 0.55);
    t.aneis(190, 300, 70, 3, t.p.c3, 0.4); t.poligono(80, 250, 34, 3, '#7a4f1c', 0.6); t.poligono(120, 262, 22, 3, '#6a4418', 0.6);
    for (let i = 0; i < 30; i++) t.disco(t.rr(30, 350), t.rr(380, 720), t.rr(0.8, 2), '#fff', 0.5);
    t.ondas(700, 5, 4, t.p.c1, 0.3, 2, 12); t.texto('DESERTO', 190, 548, 26, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.disco(200, 110, 60, '#fff1c4'); t.brilho(200, 110, 200, t.p.c1, 0.6); t.raios(200, 110, 260, 20, t.p.c1, 0.14, 0.3);
    t.camada(1); t.poligono(110, 170, 70, 3, '#7a4f1c', 1); t.poligono(290, 180, 54, 3, '#6a4418', 1); t.dunas(170, 3, '#a8732e', '#8a5a20', 1);
    t.camada(2); t.dunas(205, 2, '#5a3a14', '#3d270d', 1); t.espiral(320, 206, 30, 3, '#2a1a08', 4, 0.8); t.texto('DESERTO DE SAL', 200, 34, 30, '#3d270d', 0.95);
  },
  chefe: { nome: 'Verme', vidas: [3, 4, 5], modo: 'orbita', forma: { tipo: 'serpente', pontas: 5, olhos: 1, cor: '#d9a85a' } },
  assinatura: { tipo: 'poco', nome: 'Areia Movediça', dica: 'O poço de areia suga a bola por 3 segundos e a cospe para cima' },
  andar: { nome: 'Duna Alta', tipo: 'premium', variacao: 'chefao', gatilho: 'bater3', premium: 'criaturas' },
  missoes: ['Trilha das dunas', 'Tempestade de areia', 'Volta ao oásis', 'Cristais de sal', 'Fisgue o verme'],
  mago: { nome: 'Miragem', duracao: 48, regra: { tipo: 'golpes', meta: 28 } },
  vozes: { inicio: 'O sol queima. Cuidado onde pisa.', chefe: 'O verme rompeu a duna.', mago: 'Miragem! Nada é o que parece!', fim: 'O vento apaga as pegadas.' },
};
export default m;
