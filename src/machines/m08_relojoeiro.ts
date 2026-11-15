import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'relojoeiro', n: 8, nome: 'Oficina do Relojoeiro', lema: 'A hora marcada decide o prêmio: acerte o relógio',
  paleta: { c1: '#ffd27a', c2: '#c98b4a', c3: '#7fe0d0', fundo: ['#120a05', '#2b1a0c', '#170e08'] },
  gravidade: 1.0, bpm: 108, escala: [0, 2, 3, 5, 7, 9, 10], raiz: 45,
  layout: disposicao('C'),
  arte(c, t) {
    t.fundo(); t.brilho(190, 456, 170, t.p.c1, 0.25);
    t.engrenagem(80, 250, 50, 12, t.p.c2, 0.5, 0.2); t.engrenagem(306, 290, 38, 10, t.p.c1, 0.4, 0.5); t.engrenagem(110, 610, 44, 11, t.p.c2, 0.35); t.engrenagem(290, 640, 30, 8, t.p.c3, 0.35, 0.3);
    t.aneis(190, 456, 46, 2, t.p.c1, 0.8, 2); t.raios(190, 456, 44, 12, t.p.c1, 0.5, 0.12);
    t.espiral(190, 318, 52, 4, t.p.c3, 2, 0.5); t.listras(70, 700, 240, 5, 24, t.p.c1, '#3a2412', 0.5); t.texto('TIC-TAC', 190, 548, 24, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.engrenagem(90, 80, 80, 14, '#3a2412', 1, 0.1); t.engrenagem(330, 170, 90, 16, '#3a2412', 1, 0.4);
    t.camada(1); t.disco(200, 110, 86, '#f3e3c0'); t.aneis(200, 110, 86, 1, t.p.c2, 1, 6); t.raios(200, 110, 84, 12, '#2b1a0c', 0.9, 0.06);
    t.camada(2); t.disco(200, 110, 60, '#f3e3c0'); t.relampago(200, 110, 240, 62, '#2b1a0c', 4, 1); t.disco(200, 110, 7, t.p.c2); t.engrenagem(60, 200, 44, 10, t.p.c1, 0.9, 0.3); t.texto('OFICINA DO RELOJOEIRO', 200, 212, 20, t.p.c1, 0.95);
  },
  chefe: { nome: 'Engrenagem-Mestra', vidas: [3, 4, 5], modo: 'fixo', forma: { tipo: 'engrenagem', pontas: 10, olhos: 2, cor: '#ffd27a' } },
  assinatura: { tipo: 'relogio', nome: 'A Hora Marcada', dica: 'Acerte o relógio: o ponteiro decide qual prêmio começa' },
  andar: { nome: 'Mecanismo', tipo: 'bonus', variacao: 'premium', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Dar corda', 'Molas soltas', 'Volta do ponteiro', 'Rubis', 'Trave a mestra'],
  mago: { nome: 'Meia-Noite', duracao: 48, regra: { tipo: 'golpes', meta: 24 } },
  vozes: { inicio: 'A oficina abriu. Olhe o ponteiro.', chefe: 'A engrenagem-mestra girou.', mago: 'Meia-noite! Todos os sinos!', fim: 'O relógio parou.' },
};
export default m;
