import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'vulcao', n: 11, nome: 'Vulcão Rubro', lema: 'A rampa de salto arremessa a bola por cima da mesa',
  paleta: { c1: '#ffb02e', c2: '#ff4a1c', c3: '#ffe08a', fundo: ['#120302', '#3a0a04', '#1a0503'] },
  gravidade: 1.04, bpm: 138, escala: [0, 1, 4, 5, 7, 8, 10], raiz: 40,
  layout: disposicao('D'),
  arte(c, t) {
    t.fundo(); t.semente(111); t.chamas(760, 9, 150, t.p.c2, 0.5); t.chamas(760, 14, 80, t.p.c1, 0.5);
    t.montanhas(200, 110, '#2a0805', 0.85, 4); t.brilho(190, 262, 150, t.p.c2, 0.45); t.aneis(190, 262, 80, 4, t.p.c1, 0.5, 2);
    t.ondas(420, 12, 5, t.p.c2, 0.45, 6, 24); t.raios(190, 262, 200, 14, t.p.c3, 0.1, 0.4);
    for (let i = 0; i < 24; i++) t.disco(t.rr(30, 350), t.rr(90, 700), t.rr(1, 3), t.p.c3, 0.7);
    t.texto('VULCÃO', 190, 548, 26, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.brilho(200, 60, 240, t.p.c2, 0.6); for (let i = 0; i < 30; i++) t.disco(t.rr(0, 400), t.rr(0, 150), t.rr(1, 3), t.p.c3, 0.8);
    t.camada(1); t.poligono(200, 180, 190, 3, '#2a0805', 1); t.chamas(70, 5, -70, t.p.c1, 0.9); t.relampago(200, 70, 150, 228, t.p.c1, 6, 0.9); t.relampago(200, 70, 270, 228, t.p.c2, 5, 0.9);
    t.camada(2); t.semente(4).chamas(228, 12, 60, t.p.c2, 0.9); t.chamas(228, 18, 34, t.p.c1, 0.9); t.texto('VULCÃO RUBRO', 200, 30, 30, t.p.c3, 0.95);
  },
  chefe: { nome: 'Coração de Magma', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'estrela', pontas: 9, olhos: 2, cor: '#ff7a1a' } },
  assinatura: { tipo: 'salto', nome: 'Rampa de Salto', dica: 'A rampa esquerda é de salto: a bola voa e cai do outro lado', rampa: 0 },
  andar: { nome: 'Cratera', tipo: 'tunel', variacao: 'chefao', gatilho: 'bater3' },
  missoes: ['Rios de lava', 'Erupção', 'Volta à cratera', 'Rochas quentes', 'Resfrie o coração'],
  mago: { nome: 'Erupção Final', duracao: 48, regra: { tipo: 'golpes', meta: 26 } },
  vozes: { inicio: 'A terra treme. Salte sobre a lava.', chefe: 'O coração de magma pulsa.', mago: 'Erupção final! Corra!', fim: 'A lava cobriu o caminho.' },
};
export default m;
