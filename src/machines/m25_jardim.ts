import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'jardim', n: 25, nome: 'Jardim Suspenso', lema: 'As flores abrem e fecham buracos no tablado',
  paleta: { c1: '#ff8fc7', c2: '#7be36a', c3: '#ffe46b', fundo: ['#06140c', '#12382a', '#081a12'] },
  gravidade: 0.93, bpm: 106, escala: [0, 2, 4, 7, 9], raiz: 52,
  layout: disposicao('B'),
  arte(c, t) {
    t.fundo(); t.semente(251); t.arcos(190, 300, 150, ['#1d5a3e', '#17482f'], 10, 0.7); t.arcos(190, 760, 200, ['#1d5a3e'], 8, 0.5);
    for (let i = 0; i < 22; i++) t.flor(t.rr(34, 346), t.rr(110, 710), t.rr(8, 17), [t.p.c1, t.p.c3, '#fff', '#c58cff'][i % 4], t.p.c3, 0.45);
    t.espiral(70, 250, 36, 3, t.p.c2, 3, 0.5); t.espiral(310, 250, 36, 3, t.p.c2, 3, 0.5); t.aneis(190, 296, 70, 3, t.p.c1, 0.4);
    t.grade(46, '#bfffd8', 0.07); t.bolhas(26, '#dfffe8', 0.3, 5); t.texto('JARDIM', 190, 548, 28, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.brilho(200, 0, 300, '#dfffe8', 0.4); t.grade(40, '#bfffd8', 0.25);
    t.camada(1); t.arcos(200, 228, 190, ['#1d5a3e', '#17482f'], 12, 1); t.semente(4).tentaculos(200, 240, 9, 190, '#1d5a3e', 0.9);
    t.camada(2); t.semente(6); for (let i = 0; i < 16; i++) t.flor(t.rr(20, 380), t.rr(30, 210), t.rr(12, 26), [t.p.c1, t.p.c3, '#fff', '#c58cff'][i % 4], t.p.c3, 0.95); t.texto('JARDIM SUSPENSO', 200, 204, 28, '#ffffff', 0.95);
  },
  chefe: { nome: 'Rainha-Raiz', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'tentaculos', pontas: 6, olhos: 2, cor: '#ff8fc7' } },
  assinatura: { tipo: 'flores', nome: 'Flores Vivas', dica: 'As flores abertas engolem a bola e a jogam para cima: acerte enquanto estão abertas' },
  andar: { nome: 'Estufa', tipo: 'premium', variacao: 'chefao', gatilho: 'bater3', premium: 'criaturas' },
  missoes: ['Trepadeiras', 'Pólen', 'Volta ao lago', 'Botões', 'Pode a rainha'],
  mago: { nome: 'Primavera Eterna', duracao: 48, regra: { tipo: 'golpes', meta: 30 } },
  vozes: { inicio: 'A estufa respira. As flores estão acordadas.', chefe: 'A rainha-raiz se mexeu.', mago: 'Primavera eterna! Tudo floresce!', fim: 'As pétalas se fecham.' },
};
export default m;
