import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'bestiario', n: 3, nome: 'Bestiário Astral', lema: 'Capture as criaturas de luz e veja-as evoluir',
  paleta: { c1: '#8dff6a', c2: '#3ad6c0', c3: '#ffd166', fundo: ['#03140f', '#0a2b22', '#041a1c'] },
  gravidade: 0.98, bpm: 104, escala: [0, 2, 4, 7, 9], raiz: 48,
  layout: disposicao('C'),
  arte(c, t) {
    t.fundo(); t.semente(31).estrelas(90, '#d8ffd0'); t.brilho(190, 456, 150, t.p.c1, 0.3);
    t.semente(5).arvores(250, 9, 90, '#0c3a2c', 0.9); t.semente(8).arvores(640, 7, 120, '#0a3026', 0.7);
    t.aneis(190, 456, 70, 3, t.p.c3, 0.55, 2); t.espiral(190, 318, 60, 3, t.p.c2, 3, 0.5);
    for (let i = 0; i < 14; i++) t.flor(t.rr(40, 340), t.rr(120, 700), t.rr(5, 10), i % 2 ? t.p.c3 : t.p.c1, '#fff', 0.5);
    t.bolhas(40, t.p.c1, 0.3, 5); t.texto('BESTIÁRIO', 190, 548, 22, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(6).estrelas(120, '#d8ffd0'); t.brilho(200, 120, 190, t.p.c2, 0.5);
    t.camada(1); t.semente(2).arvores(215, 10, 150, '#082820'); t.olho(140, 110, 22, t.p.c1); t.olho(260, 110, 22, t.p.c1); t.poligono(200, 150, 14, 3, t.p.c3, 0.9, Math.PI / 2);
    t.camada(2); t.semente(3).arvores(240, 6, 110, '#03120e'); for (let i = 0; i < 9; i++) t.brilho(t.rr(20, 380), t.rr(20, 200), 12, t.p.c3, 0.8); t.texto('BESTIÁRIO ASTRAL', 200, 196, 26, t.p.c1, 0.95);
  },
  chefe: { nome: 'Ninho Astral', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'tentaculos', pontas: 7, olhos: 3, cor: '#b8ff8a' } },
  assinatura: { tipo: 'criaturas', nome: 'Captura', dica: 'Acerte as criaturas que orbitam: 3 golpes capturam' },
  andar: { nome: 'Ninho Alto', tipo: 'premium', variacao: 'chefao', gatilho: 'bater3', premium: 'criaturas' },
  missoes: ['Trilha das rampas', 'Vaga-lumes', 'Ronda da clareira', 'Marcas na casca', 'Desperte o ninho'],
  mago: { nome: 'Migração Astral', duracao: 48, regra: { tipo: 'golpes', meta: 24 } },
  vozes: { inicio: 'A floresta acordou. Capture o que brilha.', chefe: 'O ninho se abriu.', mago: 'Migração astral! Todas voam!', fim: 'As criaturas dormem de novo.' },
};
export default m;
