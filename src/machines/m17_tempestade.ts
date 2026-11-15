import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'tempestade', n: 17, nome: 'Tempestade', lema: 'As pás do moinho rebatem a bola com força que muda',
  paleta: { c1: '#c8f1ff', c2: '#6f8cff', c3: '#ffe35c', fundo: ['#05070f', '#18223f', '#0a0e1c'] },
  gravidade: 1.05, bpm: 134, escala: [0, 2, 3, 5, 7, 8, 10], raiz: 42,
  layout: disposicao('B'),
  arte(c, t) {
    t.fundo(); t.semente(171); t.espiral(190, 296, 130, 4, t.p.c2, 6, 0.4); t.espiral(190, 296, 90, 3, t.p.c1, 2, 0.5);
    t.ondas(90, 16, 5, '#3a4a7a', 0.6, 14, 18); t.relampago(60, 100, 110, 360, t.p.c3, 2.5, 0.7); t.relampago(330, 110, 280, 380, t.p.c3, 2.5, 0.7);
    t.aneis(190, 456, 56, 3, t.p.c1, 0.5); t.raios(190, 456, 60, 3, t.p.c1, 0.25, 0.4);
    for (let i = 0; i < 60; i++) { const x = t.rr(20, 360), y = t.rr(80, 720); t.listras(x, y, 1.5, 12, 1, t.p.c1, t.p.c1, 0.3); }
    t.montanhas(730, 40, '#0c1226', 0.9, 7); t.texto('TEMPESTADE', 190, 548, 20, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.semente(3).ondas(20, 14, 6, '#3a4a7a', 0.9, 20, 16); t.espiral(200, 90, 150, 3, t.p.c2, 10, 0.35);
    t.camada(1); t.relampago(120, 40, 90, 200, t.p.c3, 4); t.relampago(300, 30, 330, 190, t.p.c3, 4); t.torre(200, 210, 36, 120, '#101832'); t.raios(200, 92, 86, 4, '#dfe7ff', 0.95, 0.22);
    t.camada(2); t.disco(200, 92, 9, t.p.c3); t.montanhas(220, 30, '#070b18', 1, 8); t.texto('TEMPESTADE', 200, 30, 34, t.p.c1, 0.95);
  },
  chefe: { nome: 'Olho do Ciclone', vidas: [3, 4, 5], modo: 'orbita', forma: { tipo: 'olho', pontas: 12, olhos: 1, cor: '#6f8cff' } },
  assinatura: { tipo: 'pas', nome: 'Pás do Moinho', dica: 'As pás giram mais rápido e mais devagar: acerte no auge do vento' },
  andar: { nome: 'Torre do Vento', tipo: 'chefao', variacao: 'bonus', gatilho: 'bater3' },
  missoes: ['Correntes de ar', 'Granizo', 'Volta no ciclone', 'Para-raios', 'Feche o olho'],
  mago: { nome: 'Furacão', duracao: 48, regra: { tipo: 'golpes', meta: 28 } },
  vozes: { inicio: 'O vento virou. Segure firme.', chefe: 'O olho do ciclone se abriu.', mago: 'Furacão! Tudo voa!', fim: 'A tempestade passou.' },
};
export default m;
