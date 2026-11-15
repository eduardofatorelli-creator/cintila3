import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'zero-g', n: 13, nome: 'Corrida Zero-G', lema: 'Cada órbita seguida acelera a mesa inteira',
  paleta: { c1: '#f5ff4d', c2: '#ff3d81', c3: '#39e0ff', fundo: ['#04040c', '#101a3a', '#060814'] },
  gravidade: 0.9, bpm: 144, escala: [0, 2, 4, 7, 9], raiz: 45,
  layout: disposicao('B'),
  arte(c, t) {
    t.fundo(); t.semente(131).estrelas(160);
    t.aneis(190, 380, 300, 1, t.p.c1, 0.5, 14); t.aneis(190, 380, 284, 1, '#fff', 0.5, 2);
    t.xadrez(150, 690, 80, 20, 8, '#ffffff', 0.5); t.listras(20, 440, 34, 120, 1, t.p.c2, t.p.c2, 0.3); t.listras(326, 440, 34, 120, 1, t.p.c2, t.p.c2, 0.3);
    for (let i = 0; i < 9; i++) t.poligono(190, 470 + i * 22, 12 - i * 0.5, 3, t.p.c3, 0.5 - i * 0.04);
    t.aneis(190, 296, 70, 3, t.p.c3, 0.5); t.disco(70, 150, 22, '#2a3a7a', 0.9); t.aneis(70, 150, 34, 1, t.p.c1, 0.6, 3); t.texto('ZERO-G', 190, 548, 28, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(3).estrelas(160); t.disco(330, 60, 44, '#2a3a7a'); t.aneis(330, 60, 66, 1, t.p.c1, 0.7, 5);
    t.camada(1); t.aneis(200, 330, 250, 1, '#1a2450', 1, 60); t.aneis(200, 330, 250, 1, t.p.c1, 0.9, 3); t.xadrez(170, 86, 60, 24, 6, '#fff', 0.8);
    t.camada(2); t.poligono(130, 150, 30, 3, t.p.c2, 1, 0); t.poligono(250, 120, 26, 3, t.p.c3, 1, 0); t.listras(30, 146, 80, 8, 6, t.p.c2, 'rgba(0,0,0,0)', 0.8); t.listras(160, 116, 70, 8, 6, t.p.c3, 'rgba(0,0,0,0)', 0.8); t.texto('CORRIDA ZERO-G', 200, 200, 30, t.p.c1, 0.95);
  },
  chefe: { nome: 'Piloto Sombrio', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'cristal', pontas: 3, olhos: 1, cor: '#30364d' } },
  assinatura: { tipo: 'aceleracao', nome: 'Turbo de Órbita', dica: 'Órbitas em sequência aceleram a mesa e multiplicam os pontos' },
  andar: { nome: 'Pit Stop', tipo: 'premium', variacao: 'bonus', gatilho: 'passar5', premium: 'holofotes' },
  missoes: ['Curvas fechadas', 'Zona de choque', 'Voltas rápidas', 'Bandeiras', 'Ultrapasse o piloto'],
  mago: { nome: 'Volta Final', duracao: 48, regra: { tipo: 'golpes', meta: 26 } },
  vozes: { inicio: 'Motores ligados. Cinco voltas abrem o pit stop.', chefe: 'O piloto sombrio colou em você.', mago: 'Volta final! Acelere!', fim: 'Bandeira quadriculada.' },
};
export default m;
