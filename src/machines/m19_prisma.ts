import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'prisma', n: 19, nome: 'Laboratório Prisma', lema: 'A bola atravessa o prisma e vira três bolas coloridas',
  paleta: { c1: '#ffffff', c2: '#7aa2ff', c3: '#ff6b9a', fundo: ['#06070d', '#151a2c', '#0a0c16'] },
  gravidade: 1.0, bpm: 118, escala: [0, 2, 4, 6, 8, 10], raiz: 48,
  layout: disposicao('D'),
  arte(c, t) {
    t.fundo(); t.semente(191); t.grade(26, '#3a4670', 0.25);
    const cores = ['#ff4d6d', '#ffb84d', '#fff14d', '#4dff88', '#4da6ff', '#b84dff'];
    cores.forEach((k, i) => { t.c.save(); t.c.globalAlpha = 0.4; t.c.strokeStyle = k; t.c.lineWidth = 9; t.c.beginPath(); t.c.moveTo(190, 456); t.c.lineTo(400, 560 + i * 34); t.c.stroke(); t.c.restore(); });
    t.c.save(); t.c.globalAlpha = 0.6; t.c.strokeStyle = '#fff'; t.c.lineWidth = 5; t.c.beginPath(); t.c.moveTo(0, 620); t.c.lineTo(190, 456); t.c.stroke(); t.c.restore();
    t.poligono(190, 456, 70, 3, '#ffffff', 0.3); t.poligono(190, 456, 70, 3, '#ffffff', 0.8, -Math.PI / 2, 2);
    t.aneis(190, 262, 80, 4, t.p.c2, 0.4); t.circuito(10, t.p.c2, 0.3); t.bolhas(18, '#fff', 0.25, 6); t.texto('PRISMA', 190, 548, 28, '#ffffff', 0.55);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.grade(20, '#3a4670', 0.35);
    t.camada(1); const cores = ['#ff4d6d', '#ffb84d', '#fff14d', '#4dff88', '#4da6ff', '#b84dff']; const k = t.c; cores.forEach((cor, i) => { k.strokeStyle = cor; k.lineWidth = 12; k.beginPath(); k.moveTo(210, 110); k.lineTo(400, 40 + i * 30); k.stroke(); }); k.strokeStyle = '#fff'; k.lineWidth = 7; k.beginPath(); k.moveTo(0, 150); k.lineTo(190, 110); k.stroke();
    t.camada(2); t.poligono(200, 118, 74, 3, '#dfe7ff', 0.55); t.poligono(200, 118, 74, 3, '#ffffff', 1, -Math.PI / 2, 3); t.texto('LABORATÓRIO PRISMA', 200, 208, 24, '#ffffff', 0.95);
  },
  chefe: { nome: 'Prisma', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'cristal', pontas: 3, olhos: 1, cor: '#ffffff' } },
  assinatura: { tipo: 'prisma', nome: 'Refração', dica: 'Entre no prisma: a bola vira 3 — vermelha (bumpers), verde (rampas), azul (chefe)' },
  andar: { nome: 'Sala Branca', tipo: 'bonus', variacao: 'premium', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Feixes nas rampas', 'Fótons', 'Volta do espectro', 'Lentes', 'Trinque o prisma'],
  mago: { nome: 'Luz Branca', duracao: 48, regra: { tipo: 'golpes', meta: 28 } },
  vozes: { inicio: 'Experimento iniciado. Passe pelo prisma.', chefe: 'O prisma reagiu.', mago: 'Luz branca! Todas as cores!', fim: 'O laboratório apagou as luzes.' },
};
export default m;
