import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'aurora', n: 1, nome: 'Aurora', lema: 'Acenda as constelações do céu noturno',
  paleta: { c1: '#7df9ff', c2: '#b48cff', c3: '#ff6fb5', fundo: ['#050518', '#0d1140', '#1b0f3a'] },
  gravidade: 0.96, bpm: 112, escala: [0, 3, 5, 7, 10], raiz: 45,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(11).estrelas(220);
    t.brilho(190, 300, 260, t.p.c2, 0.35); t.brilho(90, 560, 180, t.p.c3, 0.22);
    t.ondas(120, 22, 5, t.p.c1, 0.35, 5, 22); t.ondas(150, 30, 3, t.p.c3, 0.25, 8, 30);
    t.constelacao([[70, 470], [110, 430], [158, 470], [190, 520], [222, 470], [270, 430], [310, 470]], t.p.c1);
    t.constelacao([[120, 610], [150, 580], [190, 600], [230, 580], [260, 610]], t.p.c2, 0.6);
    t.aneis(190, 300, 74, 3, t.p.c3, 0.5); t.raios(190, 300, 120, 12, t.p.c1, 0.12);
    t.lua(64, 150, 20, '#fff6d8'); t.texto('AURORA', 190, 548, 26, t.p.c1, 0.55);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(3).estrelas(160); t.ondas(30, 16, 5, t.p.c1, 0.5, 7, 16); t.ondas(52, 22, 4, t.p.c3, 0.4, 9, 20);
    t.camada(1); t.montanhas(190, 70, '#0a0f2e', 1, 6); t.lua(318, 52, 24, '#fff6d8'); t.constelacao([[40, 70], [80, 40], [120, 76], [160, 50], [200, 84]], t.p.c1);
    t.camada(2); t.semente(9).arvores(222, 12, 46, '#04061a'); t.texto('AURORA', 200, 150, 44, t.p.c1, 0.95);
  },
  chefe: { nome: 'Estrela Rubra', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'estrela', pontas: 6, olhos: 2, cor: '#ff4466' } },
  assinatura: { tipo: 'constelacao', nome: 'Constelação', dica: 'Acerte os alvos numerados em ordem' },
  andar: { nome: 'Observatório', tipo: 'bonus', variacao: 'premium', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Cometas nas rampas', 'Chuva de meteoros', 'Voltas ao polo', 'Mapa estelar', 'Eclipse da Rubra'],
  mago: { nome: 'Aurora Boreal', duracao: 48, regra: { tipo: 'golpes', meta: 22 } },
  vozes: { inicio: 'O céu está aberto. Acenda as estrelas.', chefe: 'A Estrela Rubra despertou.', mago: 'Aurora boreal! Tudo brilha!', fim: 'O céu escurece. Até a próxima noite.' },
};
export default m;
