import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'gelada', n: 29, nome: 'Fronteira Gelada', lema: 'No gelo a bola desliza e as palhetas escorregam',
  paleta: { c1: '#e6fbff', c2: '#6fc3ff', c3: '#b9a4ff', fundo: ['#04101c', '#0f3050', '#06182a'] },
  gravidade: 1.0, bpm: 96, escala: [0, 2, 4, 6, 7, 9, 11], raiz: 47,
  layout: disposicao('B'),
  arte(c, t) {
    t.fundo(); t.semente(291); t.ondas(90, 26, 4, '#7dffd8', 0.25, 12, 22); t.montanhas(260, 120, '#1a4a70', 0.7, 5); t.montanhas(290, 70, '#dff4ff', 0.25, 7);
    t.flocos(44, '#ffffff', 0.5); t.cristais(60, 640, 3, 80, '#bfe9ff', 0.5); t.cristais(320, 640, 3, 80, '#bfe9ff', 0.5);
    t.relampago(120, 400, 260, 520, '#ffffff', 1.5, 0.4); t.relampago(260, 400, 140, 500, '#ffffff', 1.2, 0.3);
    t.aneis(190, 296, 70, 3, t.p.c2, 0.45); t.brilho(190, 456, 140, '#ffffff', 0.18); t.texto('GELADA', 190, 548, 28, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(2).estrelas(100); t.ondas(30, 22, 5, '#7dffd8', 0.5, 10, 14); t.ondas(50, 26, 3, t.p.c3, 0.4, 12, 18);
    t.camada(1); t.semente(5).montanhas(180, 130, '#1a4a70', 1, 4); t.montanhas(190, 90, '#cfeeff', 0.5, 6);
    t.camada(2); t.semente(8).cristais(70, 228, 5, 90, '#dff4ff', 0.95); t.cristais(330, 228, 5, 80, '#bfe9ff', 0.95); t.flocos(30, '#fff', 0.8); t.texto('FRONTEIRA GELADA', 200, 206, 27, '#ffffff', 0.95);
  },
  chefe: { nome: 'Colosso', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'cristal', pontas: 5, olhos: 2, cor: '#bfe9ff' } },
  assinatura: { tipo: 'gelo', nome: 'Piso Congelado', dica: 'A bola quica menos e desliza; as palhetas respondem com atraso. Tudo vale 1,4X' },
  andar: { nome: 'Geleira', tipo: 'chefao', variacao: 'bonus', gatilho: 'bater3' },
  missoes: ['Trenós', 'Avalanche', 'Volta ao polo', 'Blocos de gelo', 'Derreta o colosso'],
  mago: { nome: 'Degelo', duracao: 48, regra: { tipo: 'golpes', meta: 30 } },
  vozes: { inicio: 'Frio de rachar. Pise com cuidado.', chefe: 'O colosso acordou.', mago: 'Degelo! O rio corre!', fim: 'A nevasca fechou o caminho.' },
};
export default m;
