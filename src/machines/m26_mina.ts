import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'mina', n: 26, nome: 'Mina Profunda', lema: 'O elevador leva a bola a três níveis — e o andar aqui desce',
  paleta: { c1: '#ffc24d', c2: '#9c7b5a', c3: '#5cf2c8', fundo: ['#0a0705', '#22170e', '#0e0906'] },
  gravidade: 1.08, bpm: 100, escala: [0, 3, 5, 6, 7, 10], raiz: 36,
  layout: disposicao('C'),
  arte(c, t) {
    t.fundo(); t.semente(261); t.montanhas(120, 50, '#2a1c10', 0.9, 10); t.trilhos(40, 620, 340, 660, '#7a5a3a', 0.6); t.trilhos(60, 200, 190, 130, '#5a4028', 0.4);
    t.listras(176, 130, 28, 330, 1, '#1a120a', '#1a120a', 0.7); t.listras(180, 130, 2, 330, 1, t.p.c1, t.p.c1, 0.5); t.listras(198, 130, 2, 330, 1, t.p.c1, t.p.c1, 0.5);
    t.cristais(70, 520, 3, 50, t.p.c3, 0.6); t.cristais(310, 420, 3, 50, t.p.c3, 0.6); t.brilho(190, 456, 110, t.p.c1, 0.35);
    for (let i = 0; i < 30; i++) t.disco(t.rr(30, 350), t.rr(100, 720), t.rr(1, 3), t.p.c1, 0.5);
    t.colunas(720, 5, 70, '#3a2816', 0.6); t.texto('MINA', 190, 548, 30, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(2).montanhas(40, -60, '#2a1c10', 1, 9); t.brilho(200, 140, 170, t.p.c1, 0.5);
    t.camada(1); t.listras(170, 0, 60, 228, 1, '#0a0705', '#0a0705', 1); t.listras(176, 0, 4, 228, 1, '#7a5a3a', '#7a5a3a', 1); t.listras(220, 0, 4, 228, 1, '#7a5a3a', '#7a5a3a', 1); t.listras(180, 110, 40, 46, 4, '#5a4028', '#3a2816', 1); t.trilhos(0, 200, 400, 200, '#7a5a3a', 0.9);
    t.camada(2); t.semente(5).cristais(60, 228, 4, 80, t.p.c3, 0.95); t.cristais(340, 228, 4, 90, t.p.c1, 0.95); t.brilho(200, 132, 26, t.p.c1, 1); t.texto('MINA PROFUNDA', 200, 30, 30, t.p.c1, 0.95);
  },
  chefe: { nome: 'Capataz', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'bloco', pontas: 3, olhos: 2, cor: '#c98b4a' } },
  assinatura: { tipo: 'elevador', nome: 'Elevador', dica: 'Entre no elevador central: ele leva a bola a um de 3 níveis da mesa' },
  andar: { nome: 'Nível −3', tipo: 'premium', variacao: 'tunel', gatilho: 'bater3', premium: 'muralha', desce: true },
  missoes: ['Vagonetes', 'Dinamite', 'Volta na galeria', 'Veios de ouro', 'Enfrente o capataz'],
  mago: { nome: 'Corrida do Ouro', duracao: 48, regra: { tipo: 'golpes', meta: 30 } },
  vozes: { inicio: 'Capacete na cabeça. O elevador vai descer.', chefe: 'O capataz apitou.', mago: 'Corrida do ouro! Cave!', fim: 'A galeria desabou.' },
};
export default m;
