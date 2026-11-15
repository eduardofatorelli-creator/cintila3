import { MachineDef, disposicao } from './_schema';

const m: MachineDef = {
  id: 'estudio45', n: 28, nome: 'Estúdio 45', lema: 'O disco de vinil gira e lança a bola conforme a rotação',
  paleta: { c1: '#ff9f43', c2: '#ee5a8a', c3: '#54e0c7', fundo: ['#0d0710', '#2a1230', '#120916'] },
  gravidade: 0.98, bpm: 122, escala: [0, 3, 5, 6, 7, 10], raiz: 45,
  layout: disposicao('A'),
  arte(c, t) {
    t.fundo(); t.semente(281); t.vinil(190, 456, 60, t.p.c1, 0.5);
    for (let i = 0; i < 5; i++) t.listras(30, 150 + i * 9, 330, 1.5, 1, t.p.c3, t.p.c3, 0.4);
    t.nota(70, 170, 12, t.p.c1, 0.7); t.nota(150, 160, 10, t.p.c2, 0.7); t.nota(250, 178, 11, t.p.c3, 0.7); t.nota(320, 162, 9, t.p.c1, 0.7);
    for (let i = 0; i < 20; i++) { const h = t.rr(10, 70); t.listras(46 + i * 15, 700 - h, 9, h, 1, i % 2 ? t.p.c2 : t.p.c3, '#fff', 0.4); }
    t.aneis(190, 300, 70, 3, t.p.c2, 0.45); t.raios(190, 300, 150, 12, t.p.c1, 0.1, 0.4); t.texto('ESTÚDIO 45', 190, 548, 22, t.p.c1, 0.6);
  },
  vidro(c, t) {
    t.camada(0); t.fundo(); t.raios(200, 114, 400, 20, t.p.c2, 0.2, 0.5); t.semente(3); for (let i = 0; i < 26; i++) { const h = t.rr(10, 80); t.listras(i * 16, 228 - h, 11, h, 1, i % 2 ? t.p.c2 : t.p.c3, '#fff', 0.6); }
    t.camada(1); t.vinil(200, 108, 92, t.p.c1, 1); t.texto('45', 200, 108, 26, '#120916', 1);
    t.camada(2); t.nota(50, 80, 22, t.p.c3, 0.95); t.nota(330, 70, 18, t.p.c1, 0.95); t.listras(290, 20, 4, 110, 1, '#d8d8e8', '#d8d8e8', 1); t.disco(292, 130, 8, '#d8d8e8'); t.texto('ESTÚDIO 45', 200, 208, 30, t.p.c1, 0.95);
  },
  chefe: { nome: 'Produtor', vidas: [3, 4, 5], modo: 'vaga', forma: { tipo: 'globo', pontas: 4, olhos: 2, cor: '#ffcf9a' } },
  assinatura: { tipo: 'vinil', nome: 'Disco Giratório', dica: 'O vinil central gira e arrasta a bola: use a rotação para mudar o tiro' },
  andar: { nome: 'Cabine', tipo: 'bonus', variacao: 'premium', gatilho: 'bater3', premium: 'holofotes' },
  missoes: ['Faixa de abertura', 'Batida seca', 'Volta do refrão', 'Botões da mesa', 'Convença o produtor'],
  mago: { nome: 'Disco de Ouro', duracao: 48, regra: { tipo: 'golpes', meta: 30 } },
  vozes: { inicio: 'Gravando. Solte a agulha.', chefe: 'O produtor quer outro take.', mago: 'Disco de ouro! No topo das paradas!', fim: 'Fim da sessão.' },
};
export default m;
