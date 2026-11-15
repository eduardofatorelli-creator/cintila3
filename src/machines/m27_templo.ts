import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'templo', n: 27, nome: 'Templo da Serpente', lema: 'A serpente mecânica fecha e libera a rampa principal',
  paleta: { c1: '#37d67a', c2: '#d9b25c', c3: '#ff5a3c', fundo: ['#07100a', '#1c2a16', '#0a140c'] },
  gravidade: 1.02, bpm: 110, escala: [0, 1, 4, 5, 7, 8, 11], raiz: 40,
  layout: disposicao('D'),
  arte(c, t) {
    t.fundo(); t.semente(271); t.colunas(330, 4, 170, '#2c3a22', 0.7);
    for (let i = 0; i < 5; i++) t.listras(60 + i * 12, 600 + i * 22, 260 - i * 24, 22, 1, '#34462a', '#34462a', 0.6);
    t.espiral(190, 456, 80, 4, t.p.c1, 7, 0.4); t.poligono(190, 262, 76, 4, t.p.c2, 0.5, Math.PI / 4, 3); t.poligono(190, 262, 54, 4, t.p.c2, 0.2, 0);
    t.semente(4).arvores(140, 8, 60, '#16301c', 0.7); t.olho(80, 480, 14, t.p.c3, 0.5); t.olho(300, 480, 14, t.p.c3, 0.5);
    t.ondas(560, 9, 3, t.p.c1, 0.3, 6, 14); t.texto('SERPENTE', 190, 548, 24, t.p.c2, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.brilho(200, 60, 220, t.p.c2, 0.4); t.semente(3).arvores(228, 9, 190, '#0f2414', 0.9);
    t.camada(1); for (let i = 0; i < 6; i++) t.listras(60 + i * 22, 198 - i * 26, 280 - i * 44, 28, 1, i % 2 ? '#3d5230' : '#34462a', '#34462a', 1); t.listras(180, 66, 40, 30, 1, '#0a140c', '#0a140c', 1);
    t.camada(2); t.espiral(200, 120, 100, 2.5, t.p.c1, 14, 0.9); t.olho(200, 80, 13, t.p.c3, 1); t.semente(7).arvores(240, 5, 100, '#061008', 1); t.texto('TEMPLO DA SERPENTE', 200, 210, 24, t.p.c2, 0.95);
  },
  chefe: { nome: 'Serpente', vidas: [3, 4, 5], modo: 'orbita', forma: { tipo: 'serpente', pontas: 6, olhos: 1, cor: '#37d67a' } },
  assinatura: { tipo: 'serpente', nome: 'Serpente Mecânica', dica: 'A serpente fecha a rampa direita: três golpes a afastam e a rampa vale 3X', rampa: 1 },
  andar: { nome: 'Altar', tipo: 'chefao', variacao: 'bonus', gatilho: 'passar5' },
  missoes: ['Degraus do templo', 'Dardos', 'Volta às ruínas', 'Ídolos', 'Dome a serpente'],
  mago: { nome: 'Tesouro do Templo', duracao: 48, regra: { tipo: 'golpes', meta: 30 } },
  vozes: { inicio: 'As ruínas despertam. Olho na rampa.', chefe: 'A serpente desenrolou.', mago: 'O tesouro do templo! Pegue tudo!', fim: 'As portas de pedra se fecham.' },
};
export default m;
