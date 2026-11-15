import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'especiarias', n: 12, nome: 'Rota das Especiarias', lema: 'Incline o labirinto com as palhetas e ache a saída',
  paleta: { c1: '#ffcc4d', c2: '#e2572b', c3: '#38d6b0', fundo: ['#1a0b05', '#4a1f0e', '#200d07'] },
  gravidade: 0.99, bpm: 112, escala: [0, 1, 4, 5, 7, 8, 11], raiz: 43,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(121); t.xadrez(125, 408, 130, 96, 8, t.p.c1, 0.25);
    t.arcos(100, 300, 50, [t.p.c2, t.p.c1], 8, 0.5); t.arcos(280, 300, 50, [t.p.c3, t.p.c1], 8, 0.5);
    t.tenda(70, 640, 80, 60, t.p.c2, t.p.c1, 0.45); t.tenda(310, 640, 80, 60, t.p.c3, t.p.c1, 0.45);
    for (let i = 0; i < 18; i++) t.disco(t.rr(40, 340), t.rr(120, 700), t.rr(3, 8), [t.p.c1, t.p.c2, t.p.c3][i % 3], 0.4);
    t.poligono(190, 300, 60, 8, t.p.c1, 0.5, 0, 3); t.lua(320, 130, 18, '#ffe9b8', 0.45); t.texto('ESPECIARIAS', 190, 548, 20, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.brilho(200, 220, 260, t.p.c1, 0.5); t.lua(330, 50, 24, '#ffe9b8', 0.45);
    t.camada(1); for (const x of [70, 150, 250, 330]) { t.torre(x, 190, 40, 70, '#5a2610'); t.arcos(x, 122, 22, ['#7a3416'], 22, 1); }
    t.camada(2); t.tenda(110, 228, 150, 60, t.p.c2, t.p.c1); t.tenda(290, 228, 150, 60, t.p.c3, t.p.c1); for (let i = 0; i < 12; i++) t.disco(40 + i * 29, 222, 9, [t.p.c1, t.p.c2, t.p.c3, '#7a3416'][i % 4]); t.texto('ROTA DAS ESPECIARIAS', 200, 26, 22, t.p.c1, 0.95);
  },
  chefe: { nome: 'Vizir', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'mascara', pontas: 7, olhos: 2, cor: '#f2c48a' } },
  assinatura: { tipo: 'labirinto', nome: 'Caminho de Aventura', dica: 'No labirinto central, as palhetas inclinam a bola: saia pelo lado aceso' },
  andar: { nome: 'Terraço', tipo: 'bonus', variacao: 'premium', gatilho: 'bater3', premium: 'muralha' },
  missoes: ['Caravanas', 'Sacas de pimenta', 'Volta ao porto', 'Lanternas', 'Engane o vizir'],
  mago: { nome: 'Grande Bazar', duracao: 48, regra: { tipo: 'golpes', meta: 26 } },
  vozes: { inicio: 'O mercado abriu. Ache a rota certa.', chefe: 'O vizir desconfiou.', mago: 'Grande bazar! Tudo à venda!', fim: 'As tendas se fecham.' },
};
export default m;
