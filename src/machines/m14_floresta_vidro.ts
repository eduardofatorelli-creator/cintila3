import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'floresta-vidro', n: 14, nome: 'Floresta de Vidro', lema: 'Cada alvo tem três camadas: estilhace uma de cada vez',
  paleta: { c1: '#d8fbff', c2: '#6fe3c1', c3: '#b59bff', fundo: ['#04121a', '#0c2c36', '#061820'] },
  gravidade: 1.0, bpm: 98, escala: [0, 2, 4, 6, 7, 9, 11], raiz: 50,
  layout: disposicao('C'),
  arte(c, t) {
    t.fundo(); t.semente(141); t.brilho(190, 318, 170, t.p.c2, 0.3);
    t.cristais(60, 260, 3, 120, t.p.c2, 0.5); t.cristais(320, 260, 3, 120, t.p.c3, 0.5);
    t.arvores(700, 6, 140, '#0f3a44', 0.6); t.poligono(190, 456, 74, 6, t.p.c1, 0.4, 0, 2); t.poligono(190, 456, 50, 6, t.p.c1, 0.3, Math.PI / 6, 2);
    for (let i = 0; i < 26; i++) t.poligono(t.rr(30, 350), t.rr(100, 700), t.rr(3, 9), 3, t.p.c1, 0.3, t.rr(0, 6));
    t.flocos(18, t.p.c1, 0.4); t.texto('VIDRO', 190, 548, 28, t.p.c1, 0.55);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.brilho(200, 60, 240, t.p.c1, 0.4); t.raios(200, 0, 400, 16, t.p.c1, 0.1, 0.3);
    t.camada(1); t.semente(7).cristais(200, 228, 10, 170, t.p.c2, 0.75); t.semente(3).arvores(228, 8, 150, '#0a2a33', 0.9);
    t.camada(2); for (let i = 0; i < 30; i++) t.poligono(t.rr(0, 400), t.rr(0, 228), t.rr(4, 12), 3, t.p.c1, 0.6, t.rr(0, 6)); t.texto('FLORESTA DE VIDRO', 200, 200, 26, '#ffffff', 0.95);
  },
  chefe: { nome: 'Árvore-Mãe', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'cristal', pontas: 8, olhos: 3, cor: '#9af0d6' } },
  assinatura: { tipo: 'vidro', nome: 'Três Camadas', dica: 'Os alvos centrais têm 3 camadas: três golpes estilhaçam cada um' },
  andar: { nome: 'Copa', tipo: 'premium', variacao: 'chefao', gatilho: 'bater3', premium: 'muralha' },
  missoes: ['Trilhas de vidro', 'Granizo', 'Volta à clareira', 'Folhas de cristal', 'Trinque a árvore'],
  mago: { nome: 'Chuva de Estilhaços', duracao: 48, regra: { tipo: 'golpes', meta: 26 } },
  vozes: { inicio: 'Pise leve. Aqui tudo quebra.', chefe: 'A árvore-mãe tilintou.', mago: 'Chuva de estilhaços!', fim: 'O vidro se recompõe em silêncio.' },
};
export default m;
