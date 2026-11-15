import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'expresso', n: 7, nome: 'Expresso Fantasma', lema: 'A locomotiva cruza a mesa e fecha os seus tiros',
  paleta: { c1: '#aaffee', c2: '#8f9bd9', c3: '#ffcf5c', fundo: ['#05070f', '#141b33', '#090b16'] },
  gravidade: 1.0, bpm: 126, escala: [0, 3, 5, 6, 7, 10], raiz: 38,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(71).estrelas(90); t.lua(300, 140, 26, '#dfe8ff', 0.25);
    t.trilhos(40, 492, 340, 492, '#9aa3c8', 0.7); t.trilhos(60, 140, 190, 300, '#5a6390', 0.4); t.trilhos(320, 140, 190, 300, '#5a6390', 0.4);
    t.montanhas(260, 70, '#101630', 0.8, 6); t.ondas(600, 8, 6, t.p.c1, 0.2, 10, 20);
    for (let i = 0; i < 6; i++) t.brilho(60 + i * 52, 492, 16, t.p.c3, 0.5);
    t.aneis(190, 300, 66, 3, t.p.c1, 0.4); t.texto('EXPRESSO', 190, 548, 24, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(5).estrelas(120); t.lua(320, 54, 30, '#dfe8ff', 0.25); t.ondas(120, 10, 4, t.p.c1, 0.2, 14, 16);
    t.camada(1); t.montanhas(170, 70, '#0d1228', 1, 6); t.trilhos(0, 205, 400, 190, '#9aa3c8', 0.9);
    t.camada(2); t.listras(60, 150, 200, 44, 5, '#1b2244', '#232b55', 1); t.disco(275, 172, 26, '#1b2244'); t.brilho(300, 172, 60, t.p.c3, 0.9);
    for (let i = 0; i < 4; i++) { t.disco(85 + i * 50, 196, 11, '#0a0d1c'); t.brilho(80 + i * 46, 164, 10, t.p.c1, 0.9); }
    t.texto('EXPRESSO FANTASMA', 200, 30, 24, t.p.c1, 0.95);
  },
  chefe: { nome: 'Maquinista', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'mascara', pontas: 3, olhos: 2, cor: '#cfe9ff' } },
  assinatura: { tipo: 'trem', nome: 'Locomotiva', dica: 'A locomotiva cruza a mesa: acerte-a ou passe por trás dela' },
  andar: { nome: 'Vagão-Teto', tipo: 'tunel', variacao: 'bonus', gatilho: 'tunel' },
  missoes: ['Plataformas', 'Apito e vapor', 'Volta da linha', 'Sinais de via', 'Pare o maquinista'],
  mago: { nome: 'Última Estação', duracao: 48, regra: { tipo: 'golpes', meta: 24 } },
  vozes: { inicio: 'Embarque. O expresso não espera.', chefe: 'O maquinista apareceu.', mago: 'Última estação! A todo vapor!', fim: 'O trem sumiu na neblina.' },
};
export default m;
