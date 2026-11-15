import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'feira', n: 9, nome: 'Feira Elétrica', lema: 'A roda-gigante trava até três bolas nas cabines',
  paleta: { c1: '#ff5ea8', c2: '#ffe45c', c3: '#5ce1ff', fundo: ['#0d0520', '#2a0d4a', '#120626'] },
  gravidade: 0.99, bpm: 128, escala: [0, 2, 4, 5, 7, 9, 11], raiz: 48,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(91).estrelas(80); t.rodaGigante(190, 456, 58, t.p.c2, 0.5);
    t.tenda(80, 330, 90, 70, t.p.c1, '#fff', 0.5); t.tenda(300, 330, 90, 70, t.p.c3, '#fff', 0.5);
    t.arcos(190, 300, 96, [t.p.c1, t.p.c2, t.p.c3], 7, 0.5); t.listras(40, 690, 300, 12, 15, t.p.c1, t.p.c2, 0.4);
    for (let i = 0; i < 16; i++) t.brilho(40 + i * 20, 120 + Math.sin(i) * 14, 9, i % 2 ? t.p.c2 : t.p.c3, 0.8);
    t.texto('FEIRA', 190, 548, 28, t.p.c2, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(8).estrelas(120); t.brilho(200, 220, 240, t.p.c1, 0.4);
    t.camada(1); t.rodaGigante(200, 112, 86, t.p.c2, 0.95); t.tenda(60, 228, 110, 90, t.p.c1, '#fff'); t.tenda(340, 228, 110, 90, t.p.c3, '#fff');
    t.camada(2); for (let i = 0; i < 20; i++) t.brilho(i * 21, 14 + Math.sin(i * 0.9) * 8, 8, i % 2 ? t.p.c2 : t.p.c1, 1); t.texto('FEIRA ELÉTRICA', 200, 204, 30, t.p.c2, 0.95);
  },
  chefe: { nome: 'Palhaço Voltaico', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'mascara', pontas: 5, olhos: 2, cor: '#fff3f8' } },
  assinatura: { tipo: 'roda', nome: 'Roda-Gigante', dica: 'Encaixe bolas nas cabines da roda: três soltam a multibola' },
  andar: { nome: 'Topo da Roda', tipo: 'premium', variacao: 'bonus', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Montanha-russa', 'Carrinhos de choque', 'Volta no carrossel', 'Tiro ao alvo', 'Apague o palhaço'],
  mago: { nome: 'Noite de Fogos', duracao: 48, regra: { tipo: 'golpes', meta: 26 } },
  vozes: { inicio: 'A feira acendeu. Suba na roda.', chefe: 'O palhaço deu choque.', mago: 'Noite de fogos! Olhe o céu!', fim: 'As luzes da feira se apagam.' },
};
export default m;
