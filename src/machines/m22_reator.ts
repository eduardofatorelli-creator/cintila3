import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'reator', n: 22, nome: 'Reator', lema: 'Quanto mais acerta, mais vale e mais rápido fica',
  paleta: { c1: '#c6ff3d', c2: '#ff7a1a', c3: '#3df2ff', fundo: ['#050a06', '#10261a', '#07100a'] },
  gravidade: 1.02, bpm: 140, escala: [0, 3, 5, 6, 7, 10], raiz: 41,
  layout: disposicao('C'),
  arte(c, t) {
    t.fundo(); t.semente(221); t.grade(30, t.p.c1, 0.12); t.circuito(26, t.p.c3, 0.3);
    t.brilho(190, 318, 170, t.p.c1, 0.35); t.aneis(190, 318, 100, 5, t.p.c1, 0.5, 2); t.raios(190, 318, 120, 3, t.p.c1, 0.35, 0.5);
    t.listras(40, 690, 300, 12, 15, t.p.c2, '#111', 0.55); t.listras(26, 120, 10, 300, 1, t.p.c2, t.p.c2, 0.35); t.listras(344, 120, 10, 300, 1, t.p.c2, t.p.c2, 0.35);
    t.poligono(190, 456, 60, 6, t.p.c3, 0.5, 0, 3); t.poligono(190, 456, 40, 6, t.p.c2, 0.25); t.texto('REATOR', 190, 548, 28, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.grade(18, t.p.c1, 0.14); t.brilho(200, 110, 230, t.p.c1, 0.5);
    t.camada(1); t.torre(90, 228, 70, 150, '#16301f'); t.torre(310, 228, 70, 150, '#16301f'); t.aneis(200, 112, 78, 3, t.p.c1, 0.9, 4); t.raios(200, 112, 78, 3, t.p.c1, 0.9, 0.5);
    t.camada(2); t.disco(200, 112, 18, '#07100a'); t.disco(200, 112, 10, t.p.c2); t.listras(0, 214, 400, 14, 20, t.p.c2, '#111', 1); t.texto('REATOR', 200, 196, 38, t.p.c1, 0.95);
  },
  chefe: { nome: 'Núcleo', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'engrenagem', pontas: 6, olhos: 1, cor: '#c6ff3d' } },
  assinatura: { tipo: 'calor', nome: 'Superaquecimento', dica: 'Cada acerto esquenta o reator: tudo vale mais e a mesa acelera' },
  andar: { nome: 'Sala de Controle', tipo: 'chefao', variacao: 'bonus', gatilho: 'bater3' },
  missoes: ['Barras de controle', 'Partículas', 'Volta no anel', 'Válvulas', 'Estabilize o núcleo'],
  mago: { nome: 'Fusão Total', duracao: 48, regra: { tipo: 'golpes', meta: 30 } },
  vozes: { inicio: 'Reator ligado. Não deixe esfriar.', chefe: 'O núcleo está instável.', mago: 'Fusão total! Potência máxima!', fim: 'Desligamento de emergência.' },
};
export default m;
