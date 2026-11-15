import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'cidade-neon', n: 24, nome: 'Cidade Neon', lema: 'Os alvos fogem pelos trilhos: é uma perseguição',
  paleta: { c1: '#ff2bd6', c2: '#21e6ff', c3: '#ffe53b', fundo: ['#05030f', '#160a3a', '#080418'] },
  gravidade: 1.04, bpm: 130, escala: [0, 3, 5, 7, 10], raiz: 42,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(241); t.predios(300, 150, '#0d0826', t.p.c2, 0.8); t.grade(40, t.p.c1, 0.2, 400);
    t.trilhos(106, 482, 160, 448, t.p.c2, 0.5); t.trilhos(160, 448, 220, 448, t.p.c2, 0.5); t.trilhos(220, 448, 274, 482, t.p.c2, 0.5);
    t.aneis(190, 300, 70, 3, t.p.c1, 0.5, 2); t.listras(40, 690, 300, 6, 30, t.p.c3, '#111', 0.5);
    for (let i = 0; i < 40; i++) { const x = t.rr(20, 360), y = t.rr(80, 720); t.listras(x, y, 1.2, 14, 1, t.p.c2, t.p.c2, 0.25); }
    t.poligono(70, 600, 26, 4, t.p.c1, 0.4, Math.PI / 4, 3); t.poligono(310, 600, 26, 4, t.p.c2, 0.4, Math.PI / 4, 3); t.texto('NEON', 190, 548, 32, t.p.c1, 0.65);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.brilho(200, 228, 280, t.p.c1, 0.5); t.semente(3).predios(150, 110, '#120a30', t.p.c1, 0.9);
    t.camada(1); t.semente(8).predios(200, 150, '#0a0620', t.p.c2, 1); t.listras(150, 60, 100, 24, 1, '#0a0620', '#0a0620', 1); t.texto('ABERTO', 200, 73, 15, t.p.c3, 1);
    t.camada(2); t.semente(11).predios(240, 60, '#03020a', t.p.c3, 1); t.semente(2); for (let i = 0; i < 50; i++) t.listras(t.rr(0, 400), t.rr(0, 228), 1.2, 16, 1, '#bfe9ff', '#bfe9ff', 0.3); t.texto('CIDADE NEON', 200, 196, 34, t.p.c1, 0.95);
  },
  chefe: { nome: 'Sindicato', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'bloco', pontas: 4, olhos: 3, cor: '#2a1a5a' } },
  assinatura: { tipo: 'trilhos', nome: 'Perseguição', dica: 'Três alvos correm pelos trilhos do centro: pegue todos' },
  andar: { nome: 'Cobertura', tipo: 'chefao', variacao: 'premium', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Viadutos', 'Trânsito pesado', 'Volta no anel viário', 'Letreiros', 'Desmonte o sindicato'],
  mago: { nome: 'Apagão', duracao: 48, regra: { tipo: 'golpes', meta: 30 } },
  vozes: { inicio: 'A cidade não dorme. Siga os alvos.', chefe: 'O sindicato mandou recado.', mago: 'Apagão! A cidade é sua!', fim: 'Os letreiros piscam e apagam.' },
};
export default m;
