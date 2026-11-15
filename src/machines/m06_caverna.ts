import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'caverna', n: 6, nome: 'Caverna de Cristal', lema: 'O ímã agarra a bola: escolha o ângulo e solte',
  paleta: { c1: '#7ff0ff', c2: '#c58cff', c3: '#ff9de1', fundo: ['#070616', '#16103a', '#0a0a20'] },
  gravidade: 0.97, bpm: 100, escala: [0, 2, 4, 6, 7, 9, 11], raiz: 46,
  layout: disposicao('B'),
  arte(c, t) {
    t.fundo(); t.semente(61); t.brilho(190, 456, 170, t.p.c1, 0.3);
    t.cristais(70, 300, 4, 90, t.p.c2, 0.7); t.cristais(310, 300, 4, 90, t.p.c1, 0.7); t.cristais(190, 720, 7, 70, t.p.c3, 0.5);
    t.montanhas(130, 60, '#1c1548', 0.8, 9); t.aneis(190, 456, 62, 4, t.p.c1, 0.5, 1.5); t.poligono(190, 296, 70, 6, t.p.c2, 0.5, 0, 3);
    t.estrelas(80, '#dff'); t.constelacao([[60, 520], [100, 560], [80, 610]], t.p.c3, 0.5); t.texto('CRISTAL', 190, 548, 24, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.brilho(200, 130, 230, t.p.c2, 0.5); t.semente(4).estrelas(70, '#dff');
    t.camada(1); t.semente(9).cristais(200, 228, 9, 190, t.p.c2, 0.85); t.montanhas(40, -50, '#0b0920', 1, 8);
    t.camada(2); t.semente(12).cristais(70, 228, 4, 110, t.p.c1, 0.95); t.cristais(330, 228, 4, 120, t.p.c3, 0.95); t.texto('CAVERNA DE CRISTAL', 200, 30, 24, '#ffffff', 0.95);
  },
  chefe: { nome: 'Golem de Quartzo', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'cristal', pontas: 6, olhos: 2, cor: '#c9f6ff' } },
  assinatura: { tipo: 'ima', nome: 'Ímã de Cristal', dica: 'O ímã agarra a bola: aperte uma palheta para soltar na mira' },
  andar: { nome: 'Veio Profundo', tipo: 'premium', variacao: 'bonus', gatilho: 'bater3', premium: 'muralha' },
  missoes: ['Galerias', 'Estalactites', 'Volta ao lago', 'Veios de quartzo', 'Rache o golem'],
  mago: { nome: 'Geodo Aberto', duracao: 48, regra: { tipo: 'golpes', meta: 24 } },
  vozes: { inicio: 'A gruta brilha. Use o ímã.', chefe: 'O golem se moveu.', mago: 'Geodo aberto! Tudo reluz!', fim: 'A caverna escurece.' },
};
export default m;
