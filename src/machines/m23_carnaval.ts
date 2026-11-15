import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'carnaval', n: 23, nome: 'Carnaval de Máscaras', lema: 'Escolha uma de quatro máscaras: cada uma tem a sua vantagem',
  paleta: { c1: '#ffe14d', c2: '#ff3fa4', c3: '#33e0a1', fundo: ['#12041c', '#3a0c52', '#180624'] },
  gravidade: 0.97, bpm: 136, escala: [0, 2, 4, 5, 7, 9, 11], raiz: 50,
  layout: disposicao('D'),
  arte(c, t) {
    t.fundo(); t.semente(231);
    for (let i = 0; i < 90; i++) t.listras(t.rr(20, 360), t.rr(80, 720), t.rr(3, 7), t.rr(2, 4), 1, [t.p.c1, t.p.c2, t.p.c3, '#4db8ff'][i % 4], '#fff', 0.55);
    t.mascara(190, 456, 60, t.p.c2, t.p.c1, 0.55); t.espiral(80, 300, 40, 3, t.p.c3, 4, 0.5); t.espiral(300, 300, 40, 3, t.p.c1, 4, 0.5);
    t.arcos(190, 262, 100, [t.p.c1, t.p.c2, t.p.c3], 7, 0.4); t.listras(40, 690, 300, 12, 20, t.p.c2, t.p.c3, 0.4);
    t.raios(190, 262, 180, 14, t.p.c1, 0.1, 0.4); t.texto('CARNAVAL', 190, 548, 24, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.raios(200, 228, 400, 20, t.p.c2, 0.25, 0.5); t.semente(5); for (let i = 0; i < 80; i++) t.listras(t.rr(0, 400), t.rr(0, 228), 6, 3, 1, [t.p.c1, t.p.c2, t.p.c3, '#4db8ff'][i % 4], '#fff', 0.7);
    t.camada(1); t.mascara(110, 120, 60, t.p.c3, t.p.c1, 1); t.mascara(290, 120, 60, t.p.c2, t.p.c1, 1);
    t.camada(2); t.mascara(200, 140, 76, t.p.c1, t.p.c2, 1); t.espiral(40, 40, 30, 3, t.p.c3, 4, 0.9); t.espiral(360, 40, 30, 3, t.p.c2, 4, 0.9); t.texto('CARNAVAL DE MÁSCARAS', 200, 212, 22, '#ffffff', 0.95);
  },
  chefe: { nome: 'Rei Momo', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'mascara', pontas: 5, olhos: 2, cor: '#ffcf4d' } },
  assinatura: { tipo: 'mascaras', nome: 'Quatro Máscaras', dica: 'No início, escolha uma máscara: Fera, Pássaro, Maré ou Sol' },
  andar: { nome: 'Camarote', tipo: 'premium', variacao: 'bonus', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Blocos na rampa', 'Chuva de confete', 'Volta na avenida', 'Estandartes', 'Destrone o rei'],
  mago: { nome: 'Apoteose', duracao: 48, regra: { tipo: 'golpes', meta: 30 } },
  vozes: { inicio: 'A folia começou. Escolha a sua máscara.', chefe: 'O rei da folia chegou.', mago: 'Apoteose! Ninguém fica parado!', fim: 'Quarta-feira chegou.' },
};
export default m;
