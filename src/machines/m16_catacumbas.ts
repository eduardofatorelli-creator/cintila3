import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'catacumbas', n: 16, nome: 'Catacumbas', lema: 'A caveira come a bola e cospe uma multibola',
  paleta: { c1: '#b6ff5c', c2: '#c9c2b0', c3: '#a45cff', fundo: ['#07060a', '#1a1622', '#0b0a10'] },
  gravidade: 1.02, bpm: 90, escala: [0, 1, 3, 5, 6, 8, 10], raiz: 38,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(161); t.colunas(330, 5, 150, '#2a2533', 0.7); t.colunas(720, 6, 90, '#2a2533', 0.6);
    t.arcos(190, 300, 100, ['#3a3345', '#2a2533'], 12, 0.8); t.brilho(190, 456, 130, t.p.c1, 0.3);
    t.xadrez(60, 380, 260, 300, 9, '#2a2533', 0.35); t.aneis(190, 456, 58, 3, t.p.c3, 0.5);
    for (let i = 0; i < 8; i++) { const x = 60 + i * 38; t.disco(x, 132, 7, t.p.c2, 0.5); t.disco(x - 2.5, 131, 1.6, '#000', 0.8); t.disco(x + 2.5, 131, 1.6, '#000', 0.8); }
    t.brilho(60, 520, 30, t.p.c1, 0.6); t.brilho(320, 520, 30, t.p.c1, 0.6); t.texto('CATACUMBAS', 190, 548, 20, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.brilho(200, 130, 200, t.p.c3, 0.45); t.arcos(200, 228, 190, ['#2a2533', '#1d1926', '#15121c'], 26, 1);
    t.camada(1); t.semente(4).colunas(228, 6, 170, '#2a2533', 1); t.disco(200, 110, 52, t.p.c2); t.disco(180, 104, 13, '#000'); t.disco(220, 104, 13, '#000'); t.listras(178, 140, 44, 20, 5, t.p.c2, '#000', 1); t.poligono(200, 126, 7, 3, '#000', 1);
    t.camada(2); t.brilho(180, 104, 14, t.p.c1, 1); t.brilho(220, 104, 14, t.p.c1, 1); t.brilho(40, 190, 50, t.p.c1, 0.6); t.brilho(360, 190, 50, t.p.c1, 0.6); t.texto('CATACUMBAS', 200, 204, 32, t.p.c1, 0.95);
  },
  chefe: { nome: 'Guardião', vidas: [3, 4, 5], modo: 'orbita', forma: { tipo: 'mascara', pontas: 4, olhos: 2, cor: '#d9d3c2' } },
  assinatura: { tipo: 'caveira', nome: 'A Caveira', dica: 'Alimente a caveira: ela cospe a bola e mais uma em multibola' },
  andar: { nome: 'Cripta', tipo: 'tunel', variacao: 'chefao', gatilho: 'bater3' },
  missoes: ['Corredores', 'Ossos soltos', 'Ronda da cripta', 'Lápides', 'Vença o guardião'],
  mago: { nome: 'Dança dos Ossos', duracao: 48, regra: { tipo: 'golpes', meta: 26 } },
  vozes: { inicio: 'Desça devagar. A caveira tem fome.', chefe: 'O guardião ergueu a lança.', mago: 'Dança dos ossos!', fim: 'A cripta se fecha.' },
};
export default m;
